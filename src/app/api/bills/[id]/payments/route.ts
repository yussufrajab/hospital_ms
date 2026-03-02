import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST - Record a payment for a bill
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

    // Get the bill
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: { payments: true },
    })

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    // Generate payment number
    const paymentCount = await prisma.payment.count()
    const paymentNumber = `PAY-${String(paymentCount + 1).padStart(6, '0')}`

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        billId: id,
        patientId: bill.patientId,
        paymentNumber,
        amount: body.amount,
        method: body.method,
        status: 'COMPLETED',
        transactionId: body.transactionId,
        paidAt: new Date(),
        notes: body.notes,
      },
    })

    // Update bill paid amount and status
    const totalPaid = bill.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0) + Number(body.amount)

    let newStatus = bill.status
    if (totalPaid >= Number(bill.totalAmount)) {
      newStatus = 'PAID'
    } else if (totalPaid > 0) {
      newStatus = 'PARTIALLY_PAID'
    }

    await prisma.bill.update({
      where: { id },
      data: {
        paidAmount: totalPaid,
        status: newStatus,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PAYMENT',
        entityType: 'Bill',
        entityId: id,
        newValue: JSON.stringify(payment),
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}
