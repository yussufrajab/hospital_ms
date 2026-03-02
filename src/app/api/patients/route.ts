import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  dateOfBirth: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
  nationality: z.string().optional(),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
  patientType: z.enum(['OPD', 'IPD', 'EMERGENCY']).default('OPD'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const where = {
      isDeleted: false,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { patientId: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admissions: {
            where: { status: 'ADMITTED' },
            take: 1,
          },
        },
      }),
      prisma.patient.count({ where }),
    ])

    return NextResponse.json({
      data: patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
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
    const validatedData = patientSchema.parse(body)

    // Generate unique patient ID
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const patientId = `PAT${timestamp}${random}`

    const patient = await prisma.patient.create({
      data: {
        ...validatedData,
        patientId,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        email: validatedData.email || null,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'Patient',
        entityId: patient.id,
        newValue: JSON.stringify(patient),
      },
    })

    return NextResponse.json({ data: patient }, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}
