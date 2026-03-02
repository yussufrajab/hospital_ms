import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get a single ward
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

    const ward = await prisma.ward.findUnique({
      where: { id },
      include: {
        department: true,
        beds: {
          orderBy: { bedNumber: 'asc' },
        },
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
            bed: true,
          },
        },
      },
    })

    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 })
    }

    return NextResponse.json(ward)
  } catch (error) {
    console.error('Error fetching ward:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ward' },
      { status: 500 }
    )
  }
}

// PATCH - Update a ward
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

    const ward = await prisma.ward.update({
      where: { id },
      data: body,
      include: {
        department: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'Ward',
        entityId: id,
        newValue: JSON.stringify(ward),
      },
    })

    return NextResponse.json(ward)
  } catch (error) {
    console.error('Error updating ward:', error)
    return NextResponse.json(
      { error: 'Failed to update ward' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete a ward
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

    const ward = await prisma.ward.update({
      where: { id },
      data: { isDeleted: true },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'Ward',
        entityId: id,
        newValue: JSON.stringify(ward),
      },
    })

    return NextResponse.json({ message: 'Ward deleted successfully' })
  } catch (error) {
    console.error('Error deleting ward:', error)
    return NextResponse.json(
      { error: 'Failed to delete ward' },
      { status: 500 }
    )
  }
}
