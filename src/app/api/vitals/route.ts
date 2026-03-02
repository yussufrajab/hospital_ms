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
    const patientId = searchParams.get('patientId')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = patientId ? { patientId } : {}

    const vitals = await prisma.vitalSign.findMany({
      where,
      take: limit,
      orderBy: { recordedAt: 'desc' },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({ data: vitals })
  } catch (error) {
    console.error('Error fetching vitals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vitals' },
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

    const vital = await prisma.vitalSign.create({
      data: {
        patientId: body.patientId,
        recordedBy: session.user.staffId || session.user.id,
        temperature: body.temperature,
        bloodPressureSystolic: body.bloodPressureSystolic,
        bloodPressureDiastolic: body.bloodPressureDiastolic,
        pulseRate: body.pulseRate,
        respiratoryRate: body.respiratoryRate,
        spO2: body.spO2,
        weight: body.weight,
        height: body.height,
        notes: body.notes,
      },
    })

    return NextResponse.json(vital, { status: 201 })
  } catch (error) {
    console.error('Error creating vital:', error)
    return NextResponse.json(
      { error: 'Failed to create vital' },
      { status: 500 }
    )
  }
}
