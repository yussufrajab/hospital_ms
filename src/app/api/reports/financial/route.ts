import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Financial statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(new Date().setMonth(new Date().getMonth() - 12))
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date()

    // Get financial metrics
    const [
      totalBills,
      paidBills,
      pendingBills,
      partiallyPaidBills,
      overdueBills,
      totalRevenue,
      totalDiscount,
      totalTax,
      paymentsByMethod,
      revenueByMonth,
      revenueByDepartment,
      topPayers,
      insuranceStats,
      outstandingByAge,
    ] = await Promise.all([
      // Total bills
      prisma.bill.count({
        where: { billDate: { gte: startDate, lte: endDate } },
      }),

      // Paid bills
      prisma.bill.count({
        where: {
          billDate: { gte: startDate, lte: endDate },
          status: 'PAID',
        },
      }),

      // Pending bills
      prisma.bill.count({
        where: {
          billDate: { gte: startDate, lte: endDate },
          status: 'PENDING',
        },
      }),

      // Partially paid bills
      prisma.bill.count({
        where: {
          billDate: { gte: startDate, lte: endDate },
          status: 'PARTIALLY_PAID',
        },
      }),

      // Overdue bills (due date passed and not paid)
      prisma.bill.count({
        where: {
          billDate: { gte: startDate, lte: endDate },
          dueDate: { lt: new Date() },
          status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        },
      }),

      // Total revenue
      prisma.payment.aggregate({
        where: {
          paidAt: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),

      // Total discount
      prisma.bill.aggregate({
        where: {
          billDate: { gte: startDate, lte: endDate },
        },
        _sum: { discount: true },
      }),

      // Total tax
      prisma.bill.aggregate({
        where: {
          billDate: { gte: startDate, lte: endDate },
        },
        _sum: { tax: true },
      }),

      // Payments by method
      prisma.payment.groupBy({
        by: ['method'],
        where: {
          paidAt: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Revenue by month
      prisma.$queryRaw<Array<{ month: Date; revenue: bigint }>>`
        SELECT DATE_TRUNC('month', paid_at) as month, SUM(amount) as revenue
        FROM payments
        WHERE paid_at >= ${startDate}
          AND paid_at <= ${endDate}
          AND status = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', paid_at)
        ORDER BY month DESC
      `,

      // Revenue by department
      prisma.$queryRaw<Array<{ department: string; revenue: bigint }>>`
        SELECT d.name as department, SUM(b.total_amount) as revenue
        FROM bills b
        JOIN bill_items bi ON b.id = bi.bill_id
        LEFT JOIN appointments a ON bi.appointment_id = a.id
        LEFT JOIN staff s ON a.doctor_id = s.id
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE b.bill_date >= ${startDate}
          AND b.bill_date <= ${endDate}
          AND b.is_deleted = false
        GROUP BY d.name
        ORDER BY revenue DESC
        LIMIT 10
      `,

      // Top payers (patients with highest payments)
      prisma.$queryRaw<Array<{ patient_id: string; name: string; total: bigint }>>`
        SELECT p.patient_id, 
               CONCAT(p.first_name, ' ', p.last_name) as name,
               SUM(py.amount) as total
        FROM payments py
        JOIN bills b ON py.bill_id = b.id
        JOIN patients p ON b.patient_id = p.id
        WHERE py.paid_at >= ${startDate}
          AND py.paid_at <= ${endDate}
          AND py.status = 'COMPLETED'
        GROUP BY p.patient_id, p.first_name, p.last_name
        ORDER BY total DESC
        LIMIT 10
      `,

      // Insurance claims stats
      prisma.insuranceClaim.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: true,
        _sum: { amount: true, approvedAmount: true },
      }),

      // Outstanding by age (aging report)
      prisma.$queryRaw<Array<{ age_bucket: string; count: bigint; amount: bigint }>>`
        SELECT 
          CASE 
            WHEN CURRENT_DATE - due_date <= 30 THEN '0-30 days'
            WHEN CURRENT_DATE - due_date <= 60 THEN '31-60 days'
            WHEN CURRENT_DATE - due_date <= 90 THEN '61-90 days'
            ELSE '90+ days'
          END as age_bucket,
          COUNT(*) as count,
          SUM(balance) as amount
        FROM bills
        WHERE status IN ('PENDING', 'PARTIALLY_PAID')
          AND due_date IS NOT NULL
          AND is_deleted = false
        GROUP BY age_bucket
        ORDER BY 
          CASE age_bucket
            WHEN '0-30 days' THEN 1
            WHEN '31-60 days' THEN 2
            WHEN '61-90 days' THEN 3
            ELSE 4
          END
      `,
    ])

    // Average collection time
    const avgCollectionTime = await prisma.$queryRaw<Array<{ avg_days: number }>>`
      SELECT AVG(EXTRACT(DAY FROM (py.paid_at - b.bill_date)))::numeric(10,2) as avg_days
      FROM payments py
      JOIN bills b ON py.bill_id = b.id
      WHERE py.paid_at >= ${startDate}
        AND py.paid_at <= ${endDate}
        AND py.status = 'COMPLETED'
    `

    // Daily revenue for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyRevenue = await prisma.$queryRaw<Array<{ date: Date; revenue: bigint }>>`
      SELECT DATE(paid_at) as date, SUM(amount) as revenue
      FROM payments
      WHERE paid_at >= ${thirtyDaysAgo}
        AND status = 'COMPLETED'
      GROUP BY DATE(paid_at)
      ORDER BY date DESC
    `

    return NextResponse.json({
      period: { startDate, endDate },
      summary: {
        totalBills,
        paidBills,
        pendingBills: pendingBills + partiallyPaidBills,
        overdueBills,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        totalDiscount: Number(totalDiscount._sum.discount || 0),
        totalTax: Number(totalTax._sum.tax || 0),
        collectionRate: totalBills > 0 
          ? Math.round((paidBills / totalBills) * 100)
          : 0,
        averageCollectionDays: Number(avgCollectionTime[0]?.avg_days || 0),
      },
      paymentsByMethod: paymentsByMethod.map(p => ({
        method: p.method,
        count: p._count,
        amount: Number(p._sum.amount || 0),
      })),
      revenueByMonth: revenueByMonth.map(r => ({
        month: r.month,
        revenue: Number(r.revenue),
      })),
      revenueByDepartment: revenueByDepartment.map(r => ({
        department: r.department || 'Unassigned',
        revenue: Number(r.revenue),
      })),
      topPayers: topPayers.map(t => ({
        patientId: t.patient_id,
        name: t.name,
        total: Number(t.total),
      })),
      insurance: {
        totalClaims: insuranceStats._count,
        claimedAmount: Number(insuranceStats._sum.amount || 0),
        approvedAmount: Number(insuranceStats._sum.approvedAmount || 0),
      },
      outstandingByAge: outstandingByAge.map(o => ({
        bucket: o.age_bucket,
        count: Number(o.count),
        amount: Number(o.amount),
      })),
      dailyRevenue: dailyRevenue.map(d => ({
        date: d.date,
        revenue: Number(d.revenue),
      })),
    })
  } catch (error) {
    console.error('Error fetching financial statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial statistics' },
      { status: 500 }
    )
  }
}
