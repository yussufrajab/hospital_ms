import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - List all admissions
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const wardId = searchParams.get('wardId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = {
      isDeleted: false,
      ...(patientId && { patientId }),
      ...(wardId && { wardId }),
      ...(status && { status: status as never }),
    }

    const admissions = await prisma.admission.findMany({
      where,
      take: limit,
      orderBy: { admissionDate: 'desc' },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        ward: {
          select: {
            name: true,
            code: true,
          },
        },
        bed: {
          select: {
            bedNumber: true,
            type: true,
          },
        },
        attendingDoctor: {
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

    return NextResponse.json({ data: admissions })
  } catch (error) {
    console.error('Error fetching admissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 }
    )
  }
}

// POST - Create a new admission
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Start a transaction to create admission and update bed status
    const admission = await prisma.$transaction(async (tx) => {
      // Create admission
      const newAdmission = await tx.admission.create({
        data: {
          patientId: body.patientId,
          wardId: body.wardId,
          bedId: body.bedId,
          admissionType: body.admissionType || 'IPD',
          attendingDoctorId: body.attendingDoctorId,
          referringDoctorId: body.referringDoctorId,
          admissionReason: body.admissionReason,
          diagnosis: body.diagnosis,
        },
        include: {
          patient: true,
          ward: true,
          bed: true,
        },
      })

      // Update bed status to OCCUPIED
      if (body.bedId) {
        await tx.bed.update({
          where: { id: body.bedId },
          data: { status: 'OCCUPIED' },
        })
      }

      return newAdmission
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'Admission',
        entityId: admission.id,
        newValue: JSON.stringify(admission),
      },
    })

    return NextResponse.json(admission, { status: 201 })
  } catch (error) {
    console.error('Error creating admission:', error)
    return NextResponse.json(
      { error: 'Failed to create admission' },
      { status: 500 }
    )
  }
}
