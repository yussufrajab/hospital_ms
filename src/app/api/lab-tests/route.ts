import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = {
      isActive: true,
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { testCode: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(category && { category }),
    }

    const tests = await prisma.labTest.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: tests })
  } catch (error) {
    console.error('Error fetching lab tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lab tests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const test = await prisma.labTest.create({
      data: {
        name: body.name,
        testCode: body.testCode,
        category: body.category,
        description: body.description,
        specimenType: body.specimenType,
        normalRangeMin: body.normalRangeMin,
        normalRangeMax: body.normalRangeMax,
        unit: body.unit,
        turnaroundTime: body.turnaroundTime,
        price: body.price,
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Error creating lab test:', error)
    return NextResponse.json(
      { error: 'Failed to create lab test' },
      { status: 500 }
    )
  }
}
