import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - List all payments
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const method = searchParams.get('method')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = {
      ...(patientId && { patientId }),
      ...(method && { method: method as never }),
      ...(status && { status: status as never }),
    }

    const payments = await prisma.payment.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        bill: {
          select: {
            billNumber: true,
            totalAmount: true,
          },
        },
      },
    })

    return NextResponse.json({ data: payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
