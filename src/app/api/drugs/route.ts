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
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = {
      isActive: true,
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { genericName: { contains: search, mode: 'insensitive' as const } },
          { drugCode: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const drugs = await prisma.drug.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: drugs })
  } catch (error) {
    console.error('Error fetching drugs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drugs' },
      { status: 500 }
    )
  }
}
