import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - List all wards
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = {
      isDeleted: false,
      isActive: true,
      ...(departmentId && { departmentId }),
    }

    const wards = await prisma.ward.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        department: {
          select: {
            name: true,
            code: true,
          },
        },
        beds: {
          select: {
            id: true,
            bedNumber: true,
            type: true,
            status: true,
            dailyRate: true,
          },
        },
        _count: {
          select: {
            beds: true,
            admissions: {
              where: { status: 'ADMITTED' },
            },
          },
        },
      },
    })

    // Calculate occupancy for each ward
    const wardsWithOccupancy = wards.map(ward => ({
      ...ward,
      totalBeds: ward.beds.length,
      occupiedBeds: ward.beds.filter(b => b.status === 'OCCUPIED').length,
      availableBeds: ward.beds.filter(b => b.status === 'AVAILABLE').length,
      occupancyRate: ward.beds.length > 0 
        ? Math.round((ward.beds.filter(b => b.status === 'OCCUPIED').length / ward.beds.length) * 100)
        : 0,
    }))

    return NextResponse.json({ data: wardsWithOccupancy })
  } catch (error) {
    console.error('Error fetching wards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wards' },
      { status: 500 }
    )
  }
}

// POST - Create a new ward
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const ward = await prisma.ward.create({
      data: {
        name: body.name,
        code: body.code,
        departmentId: body.departmentId,
        floor: body.floor,
        capacity: body.capacity,
        type: body.type,
        inchargeId: body.inchargeId,
      },
      include: {
        department: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'Ward',
        entityId: ward.id,
        newValue: JSON.stringify(ward),
      },
    })

    return NextResponse.json(ward, { status: 201 })
  } catch (error) {
    console.error('Error creating ward:', error)
    return NextResponse.json(
      { error: 'Failed to create ward' },
      { status: 500 }
    )
  }
}
