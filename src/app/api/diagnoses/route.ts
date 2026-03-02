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

    const where = {
      isDeleted: false,
      ...(patientId && { patientId }),
    }

    const diagnoses = await prisma.diagnosis.findMany({
      where,
      take: limit,
      orderBy: { diagnosedAt: 'desc' },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            designation: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ data: diagnoses })
  } catch (error) {
    console.error('Error fetching diagnoses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch diagnoses' },
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

    // Get doctor's staff ID
    const staff = await prisma.staff.findFirst({
      where: { userId: session.user.id },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 400 })
    }

    const diagnosis = await prisma.diagnosis.create({
      data: {
        patientId: body.patientId,
        doctorId: staff.id,
        diagnosisText: body.diagnosisText,
        icdCode: body.icdCode,
        snomedCode: body.snomedCode,
        diagnosisType: body.diagnosisType,
        notes: body.notes,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'Diagnosis',
        entityId: diagnosis.id,
        newValue: JSON.stringify(diagnosis),
      },
    })

    return NextResponse.json(diagnosis, { status: 201 })
  } catch (error) {
    console.error('Error creating diagnosis:', error)
    return NextResponse.json(
      { error: 'Failed to create diagnosis' },
      { status: 500 }
    )
  }
}
