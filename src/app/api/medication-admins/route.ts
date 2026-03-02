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

    const administrations = await prisma.medicationAdministration.findMany({
      where,
      take: limit,
      orderBy: { administeredAt: 'desc' },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        administrator: {
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

    return NextResponse.json({ data: administrations })
  } catch (error) {
    console.error('Error fetching medication administrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication administrations' },
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

    // Get nurse's staff ID
    const staff = await prisma.staff.findFirst({
      where: { userId: session.user.id },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Nurse profile not found' }, { status: 400 })
    }

    const administration = await prisma.medicationAdministration.create({
      data: {
        patientId: body.patientId,
        admissionId: body.admissionId,
        medicationId: body.medicationId,
        administeredBy: staff.id,
        dosage: body.dosage,
        route: body.route,
        notes: body.notes,
      },
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'MedicationAdministration',
        entityId: administration.id,
        newValue: JSON.stringify(administration),
      },
    })

    return NextResponse.json(administration, { status: 201 })
  } catch (error) {
    console.error('Error creating medication administration:', error)
    return NextResponse.json(
      { error: 'Failed to create medication administration' },
      { status: 500 }
    )
  }
}
