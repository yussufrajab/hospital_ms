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

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        allergies: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        medicalHistory: {
          where: { isActive: true },
          orderBy: { diagnosedDate: 'desc' },
        },
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 20,
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10,
          include: {
            doctor: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        admissions: {
          orderBy: { admissionDate: 'desc' },
          take: 5,
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...body,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'Patient',
        entityId: patient.id,
        newValue: JSON.stringify(patient),
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Soft delete
    const patient = await prisma.patient.update({
      where: { id },
      data: { isDeleted: true },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'Patient',
        entityId: patient.id,
        newValue: JSON.stringify(patient),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    )
  }
}
