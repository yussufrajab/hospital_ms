import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - List all bills
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

    const bills = await prisma.bill.findMany({
      where,
      take: limit,
      orderBy: { billDate: 'desc' },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: true,
        payments: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
          },
        },
      },
    })

    return NextResponse.json({ data: bills })
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    )
  }
}

// POST - Create a new bill
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Generate bill number
    const billCount = await prisma.bill.count()
    const billNumber = `BILL-${String(billCount + 1).padStart(6, '0')}`

    // Calculate totals
    const subtotal = body.items.reduce(
      (sum: number, item: { total: number }) => sum + item.total,
      0
    )
    const discount = body.discount || 0
    const tax = body.tax || 0
    const totalAmount = subtotal - discount + tax

    const bill = await prisma.bill.create({
      data: {
        patientId: body.patientId,
        admissionId: body.admissionId,
        billNumber,
        subtotal,
        discount,
        tax,
        totalAmount,
        paidAmount: 0,
        status: 'PENDING',
        notes: body.notes,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        items: {
          create: body.items.map((item: {
            description: string
            quantity: number
            unitPrice: number
            discount: number
            total: number
            itemType: string
            referenceId: string
          }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            total: item.total,
            itemType: item.itemType,
            referenceId: item.referenceId,
          })),
        },
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
        action: 'CREATE',
        entityType: 'Bill',
        entityId: bill.id,
        newValue: JSON.stringify(bill),
      },
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    )
  }
}
