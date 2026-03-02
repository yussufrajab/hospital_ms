import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// Default response structure
const getDefaultResponse = () => ({
  period: {
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date(),
  },
  patients: {
    total: 0,
    new: 0,
  },
  admissions: {
    total: 0,
    active: 0,
    byType: [],
  },
  appointments: {
    total: 0,
    completed: 0,
    completionRate: 0,
    byStatus: [],
    daily: [],
  },
  beds: {
    total: 0,
    occupied: 0,
    occupancyRate: 0,
  },
  billing: {
    totalBills: 0,
    paidBills: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    collectionRate: 0,
    dailyRevenue: [],
  },
  pharmacy: {
    totalPrescriptions: 0,
    dispensed: 0,
    dispensingRate: 0,
  },
  laboratory: {
    totalOrders: 0,
    completed: 0,
    completionRate: 0,
  },
})

// GET - Dashboard metrics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!)
      : new Date(new Date().setDate(1)) // First day of current month
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date()

    // Get various counts in parallel
    const [
      totalPatients,
      newPatients,
      totalAdmissions,
      activeAdmissions,
      totalAppointments,
      completedAppointments,
      totalBeds,
      occupiedBeds,
      totalBills,
      paidBills,
      totalRevenue,
      pendingRevenue,
      totalPrescriptions,
      dispensedPrescriptions,
      totalLabOrders,
      completedLabOrders,
    ] = await Promise.all([
      // Total patients
      prisma.patient.count({ where: { isDeleted: false } }).catch(() => 0),
      
      // New patients in period
      prisma.patient.count({
        where: {
          isDeleted: false,
          createdAt: { gte: startDate, lte: endDate },
        },
      }).catch(() => 0),
      
      // Total admissions in period
      prisma.admission.count({
        where: {
          admissionDate: { gte: startDate, lte: endDate },
        },
      }).catch(() => 0),
      
      // Currently admitted
      prisma.admission.count({
        where: { status: 'ADMITTED' },
      }).catch(() => 0),
      
      // Total appointments in period
      prisma.appointment.count({
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
        },
      }).catch(() => 0),
      
      // Completed appointments
      prisma.appointment.count({
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
      }).catch(() => 0),
      
      // Total beds
      prisma.bed.count().catch(() => 0),
      
      // Occupied beds
      prisma.bed.count({ where: { status: 'OCCUPIED' } }).catch(() => 0),
      
      // Total bills in period
      prisma.bill.count({
        where: {
          billDate: { gte: startDate, lte: endDate },
        },
      }).catch(() => 0),
      
      // Paid bills
      prisma.bill.count({
        where: {
          billDate: { gte: startDate, lte: endDate },
          status: 'PAID',
        },
      }).catch(() => 0),
      
      // Total revenue
      prisma.payment.aggregate({
        where: {
          paidAt: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
      
      // Pending revenue
      prisma.bill.aggregate({
        where: {
          billDate: { gte: startDate, lte: endDate },
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        },
        _sum: { totalAmount: true },
      }).catch(() => ({ _sum: { totalAmount: 0 } })),
      
      // Total prescriptions
      prisma.prescription.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }).catch(() => 0),
      
      // Dispensed prescriptions
      prisma.prescription.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'DISPENSED',
        },
      }).catch(() => 0),
      
      // Total lab orders
      prisma.labTestOrder.count({
        where: {
          orderDate: { gte: startDate, lte: endDate },
        },
      }).catch(() => 0),
      
      // Completed lab orders
      prisma.labTestOrder.count({
        where: {
          orderDate: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
      }).catch(() => 0),
    ])

    // Get daily appointments for the last 7 days
    let dailyAppointments: Array<{ date: Date; count: bigint }> = []
    try {
      dailyAppointments = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(appointment_date) as date, COUNT(*) as count
        FROM appointments
        WHERE appointment_date >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
          AND is_deleted = false
        GROUP BY DATE(appointment_date)
        ORDER BY date DESC
      `
    } catch {
      // Table might not exist yet
    }

    // Get daily revenue for the last 7 days
    let dailyRevenue: Array<{ date: Date; sum: bigint }> = []
    try {
      dailyRevenue = await prisma.$queryRaw<Array<{ date: Date; sum: bigint }>>`
        SELECT DATE(paid_at) as date, SUM(amount) as sum
        FROM payments
        WHERE paid_at >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
          AND status = 'COMPLETED'
        GROUP BY DATE(paid_at)
        ORDER BY date DESC
      `
    } catch {
      // Table might not exist yet
    }

    // Get admission by type
    let admissionsByType: Array<{ admissionType: string; _count: number }> = []
    try {
      admissionsByType = await prisma.admission.groupBy({
        by: ['admissionType'],
        where: {
          admissionDate: { gte: startDate, lte: endDate },
        },
        _count: true,
      })
    } catch {
      // Table might not exist yet
    }

    // Get appointments by status
    let appointmentsByStatus: Array<{ status: string; _count: number }> = []
    try {
      appointmentsByStatus = await prisma.appointment.groupBy({
        by: ['status'],
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
        },
        _count: true,
      })
    } catch {
      // Table might not exist yet
    }

    return NextResponse.json({
      period: {
        startDate,
        endDate,
      },
      patients: {
        total: totalPatients,
        new: newPatients,
      },
      admissions: {
        total: totalAdmissions,
        active: activeAdmissions,
        byType: admissionsByType.map(a => ({
          type: a.admissionType,
          count: a._count,
        })),
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        completionRate: totalAppointments > 0 
          ? Math.round((completedAppointments / totalAppointments) * 100)
          : 0,
        byStatus: appointmentsByStatus.map(a => ({
          status: a.status,
          count: a._count,
        })),
        daily: dailyAppointments.map(d => ({
          date: d.date,
          count: Number(d.count),
        })),
      },
      beds: {
        total: totalBeds,
        occupied: occupiedBeds,
        occupancyRate: totalBeds > 0 
          ? Math.round((occupiedBeds / totalBeds) * 100)
          : 0,
      },
      billing: {
        totalBills,
        paidBills,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        pendingRevenue: Number(pendingRevenue._sum.totalAmount || 0),
        collectionRate: totalBills > 0 
          ? Math.round((paidBills / totalBills) * 100)
          : 0,
        dailyRevenue: dailyRevenue.map(d => ({
          date: d.date,
          amount: Number(d.sum),
        })),
      },
      pharmacy: {
        totalPrescriptions,
        dispensed: dispensedPrescriptions,
        dispensingRate: totalPrescriptions > 0 
          ? Math.round((dispensedPrescriptions / totalPrescriptions) * 100)
          : 0,
      },
      laboratory: {
        totalOrders: totalLabOrders,
        completed: completedLabOrders,
        completionRate: totalLabOrders > 0 
          ? Math.round((completedLabOrders / totalLabOrders) * 100)
          : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    // Return default response structure instead of error
    return NextResponse.json(getDefaultResponse())
  }
}
