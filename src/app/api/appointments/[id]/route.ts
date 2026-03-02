import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

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

    const appointment = await prisma.appointment.findUnique({
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
            bloodGroup: true,
          },
        },
        doctor: {
          select: {
            id: true,
            designation: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

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

    const appointment = await prisma.appointment.update({
      where: { id },
      data: body,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'Appointment',
        entityId: appointment.id,
        newValue: JSON.stringify(appointment),
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}
