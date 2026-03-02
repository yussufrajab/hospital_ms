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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = {
      isDeleted: false,
      ...(patientId && { patientId }),
      ...(status && { status: status as never }),
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      take: limit,
      orderBy: { prescriptionDate: 'desc' },
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
        items: {
          include: {
            drug: {
              select: {
                name: true,
                strength: true,
                form: true,
                unit: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ data: prescriptions })
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
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

    const prescription = await prisma.prescription.create({
      data: {
        patientId: body.patientId,
        doctorId: staff.id,
        notes: body.notes,
        validUntil: body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        items: {
          create: body.items.map((item: { drugId: string; dosage: string; frequency: string; duration: string; quantity: number; instructions: string }) => ({
            drugId: item.drugId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        },
      },
      include: {
        items: {
          include: {
            drug: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'Prescription',
        entityId: prescription.id,
        newValue: JSON.stringify(prescription),
      },
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    )
  }
}
