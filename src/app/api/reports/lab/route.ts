import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Laboratory statistics
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

    // Get lab metrics
    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalTests,
      criticalResults,
      abnormalResults,
      normalResults,
      ordersByStatus,
      topTests,
      ordersByMonth,
    ] = await Promise.all([
      // Total lab orders
      prisma.labTestOrder.count({
        where: { orderDate: { gte: startDate, lte: endDate } },
      }),

      // Completed orders
      prisma.labTestOrder.count({
        where: {
          orderDate: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
      }),

      // Pending orders
      prisma.labTestOrder.count({
        where: {
          orderDate: { gte: startDate, lte: endDate },
          status: 'PENDING',
        },
      }),

      // Cancelled orders
      prisma.labTestOrder.count({
        where: {
          orderDate: { gte: startDate, lte: endDate },
          status: 'CANCELLED',
        },
      }),

      // Total tests in catalog
      prisma.labTest.count(),

      // Critical results (from LabTestOrderItem)
      prisma.labTestOrderItem.count({
        where: {
          resultStatus: 'CRITICAL',
          order: {
            orderDate: { gte: startDate, lte: endDate },
          },
        },
      }),

      // Abnormal results
      prisma.labTestOrderItem.count({
        where: {
          resultStatus: 'ABNORMAL',
          order: {
            orderDate: { gte: startDate, lte: endDate },
          },
        },
      }),

      // Normal results
      prisma.labTestOrderItem.count({
        where: {
          resultStatus: 'NORMAL',
          order: {
            orderDate: { gte: startDate, lte: endDate },
          },
        },
      }),

      // Orders by status
      prisma.labTestOrder.groupBy({
        by: ['status'],
        where: {
          orderDate: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),

      // Top ordered tests
      prisma.$queryRaw<Array<{ test_name: string; count: bigint }>>`
        SELECT lt.name as test_name, COUNT(loi.id) as count
        FROM lab_test_order_items loi
        JOIN lab_tests lt ON loi.test_id = lt.id
        JOIN lab_test_orders lto ON loi.order_id = lto.id
        WHERE lto.order_date >= ${startDate}
          AND lto.order_date <= ${endDate}
        GROUP BY lt.name
        ORDER BY count DESC
        LIMIT 10
      `,

      // Orders by month
      prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
        SELECT DATE_TRUNC('month', order_date) as month, COUNT(*) as count
        FROM lab_test_orders
        WHERE order_date >= ${startDate}
          AND order_date <= ${endDate}
        GROUP BY DATE_TRUNC('month', order_date)
        ORDER BY month DESC
      `,
    ])

    // Orders by priority
    const ordersByPriority = await prisma.labTestOrder.groupBy({
      by: ['priority'],
      where: {
        orderDate: { gte: startDate, lte: endDate },
      },
      _count: true,
    })

    // Daily orders for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyOrders = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(order_date) as date, COUNT(*) as count
      FROM lab_test_orders
      WHERE order_date >= ${sevenDaysAgo}
      GROUP BY DATE(order_date)
      ORDER BY date DESC
    `

    // Tests by category
    const testsByCategory = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT category, COUNT(*) as count
      FROM lab_tests
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC
    `

    // Revenue from lab tests
    const labRevenue = await prisma.$queryRaw<Array<{ revenue: bigint }>>`
      SELECT SUM(lt.price) as revenue
      FROM lab_test_order_items loi
      JOIN lab_tests lt ON loi.test_id = lt.id
      JOIN lab_test_orders lto ON loi.order_id = lto.id
      WHERE lto.order_date >= ${startDate}
        AND lto.order_date <= ${endDate}
        AND lto.status != 'CANCELLED'
    `

    // Average turnaround time (hours)
    const turnaroundTime = await prisma.$queryRaw<Array<{ avg_hours: number }>>`
      SELECT AVG(EXTRACT(HOUR FROM (loi.reported_at - lto.order_date)))::numeric(10,2) as avg_hours
      FROM lab_test_order_items loi
      JOIN lab_test_orders lto ON loi.order_id = lto.id
      WHERE lto.order_date >= ${startDate}
        AND lto.order_date <= ${endDate}
        AND loi.reported_at IS NOT NULL
    `

    // Critical results requiring follow-up (no notes)
    const criticalPendingFollowup = await prisma.labTestOrderItem.count({
      where: {
        resultStatus: 'CRITICAL',
        notes: null,
      },
    })

    return NextResponse.json({
      period: { startDate, endDate },
      summary: {
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        completionRate: totalOrders > 0 
          ? Math.round((completedOrders / totalOrders) * 100)
          : 0,
        totalTests,
        averageTurnaroundHours: Number(turnaroundTime[0]?.avg_hours || 0),
        labRevenue: Number(labRevenue[0]?.revenue || 0),
      },
      results: {
        critical: criticalResults,
        abnormal: abnormalResults,
        normal: normalResults,
        criticalPendingFollowup,
      },
      ordersByStatus: ordersByStatus.map(o => ({
        status: o.status,
        count: o._count,
      })),
      ordersByPriority: ordersByPriority.map(o => ({
        priority: o.priority || 'ROUTINE',
        count: o._count,
      })),
      topTests: topTests.map(t => ({
        test: t.test_name,
        count: Number(t.count),
      })),
      ordersByMonth: ordersByMonth.map(o => ({
        month: o.month,
        count: Number(o.count),
      })),
      testsByCategory: testsByCategory.map(t => ({
        category: t.category || 'Uncategorized',
        count: Number(t.count),
      })),
      dailyOrders: dailyOrders.map(d => ({
        date: d.date,
        count: Number(d.count),
      })),
    })
  } catch (error) {
    console.error('Error fetching lab statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lab statistics' },
      { status: 500 }
    )
  }
}
