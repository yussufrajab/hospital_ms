import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - List all beds
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const wardId = searchParams.get('wardId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where = {
      ...(wardId && { wardId }),
      ...(status && { status: status as never }),
      ...(type && { type: type as never }),
    }

    const beds = await prisma.bed.findMany({
      where,
      take: limit,
      orderBy: [{ wardId: 'asc' }, { bedNumber: 'asc' }],
      include: {
        ward: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        admissions: {
          where: { status: 'ADMITTED' },
          include: {
            patient: {
              select: {
                patientId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ data: beds })
  } catch (error) {
    console.error('Error fetching beds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beds' },
      { status: 500 }
    )
  }
}

// POST - Create a new bed
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const bed = await prisma.bed.create({
      data: {
        wardId: body.wardId,
        bedNumber: body.bedNumber,
        type: body.type || 'GENERAL',
        status: body.status || 'AVAILABLE',
        dailyRate: body.dailyRate,
        features: body.features,
      },
      include: {
        ward: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'Bed',
        entityId: bed.id,
        newValue: JSON.stringify(bed),
      },
    })

    return NextResponse.json(bed, { status: 201 })
  } catch (error) {
    console.error('Error creating bed:', error)
    return NextResponse.json(
      { error: 'Failed to create bed' },
      { status: 500 }
    )
  }
}
