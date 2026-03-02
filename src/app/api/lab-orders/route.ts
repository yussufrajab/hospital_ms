import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = {
      isDeleted: false,
      ...(patientId && { patientId }),
      ...(status && { status: status as never }),
    }

    const orders = await prisma.labTestOrder.findMany({
      where,
      take: limit,
      orderBy: { orderDate: 'desc' },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
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

    return NextResponse.json({ data: orders })
  } catch (error) {
    console.error('Error fetching lab orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lab orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get doctor's staff ID
    const staff = await prisma.staff.findFirst({
      where: { userId: session.user.id },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 400 })
    }

    const order = await prisma.labTestOrder.create({
      data: {
        patientId: body.patientId,
        doctorId: staff.id,
        priority: body.priority,
        notes: body.notes,
        items: {
          create: body.testIds.map((testId: string) => ({
            testId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        patient: true,
        items: {
          include: {
            test: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'LabTestOrder',
        entityId: order.id,
        newValue: JSON.stringify(order),
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating lab order:', error)
    return NextResponse.json(
      { error: 'Failed to create lab order' },
      { status: 500 }
    )
  }
}
