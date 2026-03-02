import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Pharmacy statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(new Date().setMonth(new Date().getMonth() - 1))
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date()

    // Get pharmacy metrics
    const [
      totalPrescriptions,
      dispensedPrescriptions,
      pendingPrescriptions,
      cancelledPrescriptions,
      totalDrugs,
      lowStockDrugs,
      outOfStockDrugs,
      expiredDrugs,
      topDispensedDrugs,
      prescriptionsByMonth,
      inventoryValue,
      dispensingByType,
    ] = await Promise.all([
      // Total prescriptions
      prisma.prescription.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),

      // Dispensed prescriptions
      prisma.prescription.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'DISPENSED',
        },
      }),

      // Pending prescriptions
      prisma.prescription.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'PENDING',
        },
      }),

      // Cancelled prescriptions
      prisma.prescription.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'CANCELLED',
        },
      }),

      // Total drugs in inventory
      prisma.drug.count(),

      // Low stock drugs (using raw query to compare with drug's reorder level)
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT di.id) as count
        FROM drug_inventory di
        JOIN drugs d ON di.drug_id = d.id
        WHERE di.quantity <= d.reorder_level
      `,

      // Out of stock drugs
      prisma.drugInventory.count({
        where: { quantity: { lte: 0 } },
      }),

      // Expired drugs
      prisma.drugInventory.count({
        where: {
          expiryDate: { lt: new Date() },
        },
      }),

      // Top dispensed drugs
      prisma.$queryRaw<Array<{ drug_name: string; count: bigint }>>`
        SELECT d.name as drug_name, COUNT(pi.id) as count
        FROM prescription_items pi
        JOIN drugs d ON pi.drug_id = d.id
        JOIN prescriptions p ON pi.prescription_id = p.id
        WHERE p.created_at >= ${startDate}
          AND p.created_at <= ${endDate}
          AND p.status = 'DISPENSED'
        GROUP BY d.name
        ORDER BY count DESC
        LIMIT 10
      `,

      // Prescriptions by month
      prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
        SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
        FROM prescriptions
        WHERE created_at >= ${startDate}
          AND created_at <= ${endDate}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `,

      // Total inventory value
      prisma.drugInventory.aggregate({
        _sum: {
          quantity: true,
        },
      }),

      // Dispensing by drug type
      prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
        SELECT d.type, COUNT(pi.id) as count
        FROM prescription_items pi
        JOIN drugs d ON pi.drug_id = d.id
        JOIN prescriptions p ON pi.prescription_id = p.id
        WHERE p.created_at >= ${startDate}
          AND p.created_at <= ${endDate}
          AND p.status = 'DISPENSED'
        GROUP BY d.type
        ORDER BY count DESC
      `,
    ])

    // Get inventory by category
    const inventoryByCategory = await prisma.$queryRaw<Array<{ category: string; count: bigint; quantity: bigint }>>`
      SELECT d.category, COUNT(di.id) as count, SUM(di.quantity) as quantity
      FROM drug_inventory di
      JOIN drugs d ON di.drug_id = d.id
      WHERE di.quantity > 0
      GROUP BY d.category
      ORDER BY quantity DESC
    `

    // Average dispensing time
    const avgDispensingTime = await prisma.$queryRaw<Array<{ avg_hours: number }>>`
      SELECT AVG(EXTRACT(HOUR FROM (updated_at - created_at)))::numeric(10,2) as avg_hours
      FROM prescriptions
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
        AND status = 'DISPENSED'
    `

    // Near expiry drugs (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const nearExpiryDrugs = await prisma.drugInventory.count({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow,
        },
      },
    })

    // Daily prescriptions for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyPrescriptions = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM prescriptions
      WHERE created_at >= ${sevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    return NextResponse.json({
      period: { startDate, endDate },
      summary: {
        totalPrescriptions,
        dispensedPrescriptions,
        pendingPrescriptions,
        cancelledPrescriptions,
        dispensingRate: totalPrescriptions > 0 
          ? Math.round((dispensedPrescriptions / totalPrescriptions) * 100)
          : 0,
        averageDispensingHours: Number(avgDispensingTime[0]?.avg_hours || 0),
      },
      inventory: {
        totalDrugs,
        lowStock: Number(lowStockDrugs[0]?.count || 0),
        outOfStock: outOfStockDrugs,
        expired: expiredDrugs,
        nearExpiry: nearExpiryDrugs,
        totalQuantity: Number(inventoryValue._sum.quantity || 0),
      },
      topDispensedDrugs: topDispensedDrugs.map(d => ({
        drug: d.drug_name,
        count: Number(d.count),
      })),
      prescriptionsByMonth: prescriptionsByMonth.map(p => ({
        month: p.month,
        count: Number(p.count),
      })),
      inventoryByCategory: inventoryByCategory.map(i => ({
        category: i.category || 'Uncategorized',
        drugCount: Number(i.count),
        totalQuantity: Number(i.quantity),
      })),
      dispensingByType: dispensingByType.map(d => ({
        type: d.type || 'Unknown',
        count: Number(d.count),
      })),
      dailyPrescriptions: dailyPrescriptions.map(d => ({
        date: d.date,
        count: Number(d.count),
      })),
    })
  } catch (error) {
    console.error('Error fetching pharmacy statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pharmacy statistics' },
      { status: 500 }
    )
  }
}
