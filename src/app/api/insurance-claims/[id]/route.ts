import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get a single insurance claim
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

    const claim = await prisma.insuranceClaim.findUnique({
      where: { id },
      include: {
        policy: {
          include: {
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
            company: true,
          },
        },
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json(claim)
  } catch (error) {
    console.error('Error fetching insurance claim:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance claim' },
      { status: 500 }
    )
  }
}

// PATCH - Update an insurance claim (approve/reject)
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

    const updateData: Record<string, unknown> = {
      ...body,
    }

    if (body.status === 'APPROVED' || body.status === 'REJECTED') {
      updateData.reviewedAt = new Date()
      updateData.reviewedBy = session.user.id
    }

    const claim = await prisma.insuranceClaim.update({
      where: { id },
      data: updateData,
      include: {
        policy: {
          include: {
            patient: true,
            company: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'InsuranceClaim',
        entityId: id,
        newValue: JSON.stringify(claim),
      },
    })

    return NextResponse.json(claim)
  } catch (error) {
    console.error('Error updating insurance claim:', error)
    return NextResponse.json(
      { error: 'Failed to update insurance claim' },
      { status: 500 }
    )
  }
}
