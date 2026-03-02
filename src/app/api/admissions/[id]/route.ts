import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get a single admission
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

    const admission = await prisma.admission.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            dateOfBirth: true,
            gender: true,
            bloodGroup: true,
            address: true,
          },
        },
        ward: true,
        bed: true,
        attendingDoctor: {
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
        referringDoctor: {
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
      },
    })

    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }

    return NextResponse.json(admission)
  } catch (error) {
    console.error('Error fetching admission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admission' },
      { status: 500 }
    )
  }
}

// PATCH - Update an admission
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

    const admission = await prisma.admission.update({
      where: { id },
      data: body,
      include: {
        patient: true,
        ward: true,
        bed: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'Admission',
        entityId: id,
        newValue: JSON.stringify(admission),
      },
    })

    return NextResponse.json(admission)
  } catch (error) {
    console.error('Error updating admission:', error)
    return NextResponse.json(
      { error: 'Failed to update admission' },
      { status: 500 }
    )
  }
}
