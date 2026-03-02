import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get a single bed
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

    const bed = await prisma.bed.findUnique({
      where: { id },
      include: {
        ward: true,
        admissions: {
          where: { status: 'ADMITTED' },
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
          },
        },
      },
    })

    if (!bed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 })
    }

    return NextResponse.json(bed)
  } catch (error) {
    console.error('Error fetching bed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bed' },
      { status: 500 }
    )
  }
}

// PATCH - Update a bed (status, type, etc.)
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

    const bed = await prisma.bed.update({
      where: { id },
      data: {
        ...body,
        dailyRate: body.dailyRate ? parseFloat(body.dailyRate) : undefined,
      },
      include: {
        ward: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'Bed',
        entityId: id,
        newValue: JSON.stringify(bed),
      },
    })

    return NextResponse.json(bed)
  } catch (error) {
    console.error('Error updating bed:', error)
    return NextResponse.json(
      { error: 'Failed to update bed' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a bed
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

    // Check if bed is occupied
    const bed = await prisma.bed.findUnique({
      where: { id },
      include: {
        admissions: {
          where: { status: 'ADMITTED' },
        },
      },
    })

    if (bed?.admissions && bed.admissions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete an occupied bed' },
        { status: 400 }
      )
    }

    await prisma.bed.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'Bed',
        entityId: id,
      },
    })

    return NextResponse.json({ message: 'Bed deleted successfully' })
  } catch (error) {
    console.error('Error deleting bed:', error)
    return NextResponse.json(
      { error: 'Failed to delete bed' },
      { status: 500 }
    )
  }
}
