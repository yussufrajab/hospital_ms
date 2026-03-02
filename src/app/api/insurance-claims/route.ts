import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - List all insurance claims
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = {
      ...(status && { status: status as never }),
    }

    const claims = await prisma.insuranceClaim.findMany({
      where,
      take: limit,
      orderBy: { claimDate: 'desc' },
      include: {
        policy: {
          include: {
            patient: {
              select: {
                patientId: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            company: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ data: claims })
  } catch (error) {
    console.error('Error fetching insurance claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance claims' },
      { status: 500 }
    )
  }
}

// POST - Create a new insurance claim
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Generate claim number
    const claimCount = await prisma.insuranceClaim.count()
    const claimNumber = `CLM-${String(claimCount + 1).padStart(6, '0')}`

    const claim = await prisma.insuranceClaim.create({
      data: {
        policyId: body.policyId,
        billId: body.billId,
        claimNumber,
        amount: body.amount,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        notes: body.notes,
      },
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
        action: 'CREATE',
        entityType: 'InsuranceClaim',
        entityId: claim.id,
        newValue: JSON.stringify(claim),
      },
    })

    return NextResponse.json(claim, { status: 201 })
  } catch (error) {
    console.error('Error creating insurance claim:', error)
    return NextResponse.json(
      { error: 'Failed to create insurance claim' },
      { status: 500 }
    )
  }
}
