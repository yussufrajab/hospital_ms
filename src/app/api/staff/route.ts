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
    const role = searchParams.get('role')
    const departmentId = searchParams.get('departmentId')

    const where = {
      isDeleted: false,
      isActive: true,
      ...(role && { user: { role: role as never } }),
      ...(departmentId && { departmentId }),
    }

    const staff = await prisma.staff.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: staff })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}
