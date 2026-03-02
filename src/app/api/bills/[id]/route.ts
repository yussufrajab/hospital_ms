import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get a single bill
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

    const bill = await prisma.bill.findUnique({
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
            address: true,
            dateOfBirth: true,
            gender: true,
            insurancePolicies: {
              where: { isActive: true },
              include: {
                company: true,
              },
            },
          },
        },
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error('Error fetching bill:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bill' },
      { status: 500 }
    )
  }
}

// PATCH - Update a bill
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

    const bill = await prisma.bill.update({
      where: { id },
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
      include: {
        patient: true,
        items: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'Bill',
        entityId: id,
        newValue: JSON.stringify(bill),
      },
    })

    return NextResponse.json(bill)
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete a bill
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

    const bill = await prisma.bill.update({
      where: { id },
      data: { isDeleted: true },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'Bill',
        entityId: id,
        newValue: JSON.stringify(bill),
      },
    })

    return NextResponse.json({ message: 'Bill deleted successfully' })
  } catch (error) {
    console.error('Error deleting bill:', error)
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    )
  }
}
