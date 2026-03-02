import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get lab order details with results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.labTestOrder.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            designation: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        items: {
          include: {
            test: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Lab order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching lab order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lab order' },
      { status: 500 }
    )
  }
}

// PATCH - Update lab test result
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get lab technician staff ID
    const staff = await prisma.staff.findFirst({
      where: { userId: session.user.id },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Lab technician profile not found' }, { status: 400 })
    }

    // Update the specific test item
    const item = await prisma.labTestOrderItem.update({
      where: { id: body.itemId },
      data: {
        result: body.result,
        resultStatus: body.resultStatus,
        normalRange: body.normalRange,
        notes: body.notes,
        status: 'COMPLETED',
        reportedAt: new Date(),
        collectedAt: body.collectedAt ? new Date(body.collectedAt) : undefined,
        collectedBy: body.collectedBy || staff.id,
      },
      include: {
        test: true,
      },
    })

    // Check if all items are completed
    const order = await prisma.labTestOrder.findUnique({
      where: { id },
      include: { items: true },
    })

    const allCompleted = order?.items.every(item => item.status === 'COMPLETED')

    if (allCompleted) {
      await prisma.labTestOrder.update({
        where: { id },
        data: { status: 'COMPLETED' },
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'LabTestOrderItem',
        entityId: item.id,
        newValue: JSON.stringify(item),
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating lab result:', error)
    return NextResponse.json(
      { error: 'Failed to update lab result' },
      { status: 500 }
    )
  }
}

// POST - Collect sample
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get lab technician staff ID
    const staff = await prisma.staff.findFirst({
      where: { userId: session.user.id },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Lab technician profile not found' }, { status: 400 })
    }

    // Update item to sample collected
    const item = await prisma.labTestOrderItem.update({
      where: { id: body.itemId },
      data: {
        status: 'SAMPLE_COLLECTED',
        collectedAt: new Date(),
        collectedBy: staff.id,
      },
    })

    // Update order status if any item is collected
    await prisma.labTestOrder.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error collecting sample:', error)
    return NextResponse.json(
      { error: 'Failed to collect sample' },
      { status: 500 }
    )
  }
}
