import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const appointmentSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  appointmentDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['ROUTINE', 'URGENT', 'STAT']).default('ROUTINE'),
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
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const where = {
      isDeleted: false,
      ...(status && { status: status as never }),
      ...(date && {
        appointmentDate: {
          gte: new Date(date),
          lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
        },
      }),
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
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
      }),
      prisma.appointment.count({ where }),
    ])

    return NextResponse.json({
      data: appointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
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
    const validatedData = appointmentSchema.parse(body)

    // Generate token number for the day
    const dayStart = new Date(validatedData.appointmentDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const existingAppointments = await prisma.appointment.count({
      where: {
        doctorId: validatedData.doctorId,
        appointmentDate: {
          gte: dayStart,
          lt: dayEnd,
        },
        status: { not: 'CANCELLED' },
      },
    })

    const appointment = await prisma.appointment.create({
      data: {
        ...validatedData,
        appointmentDate: new Date(validatedData.appointmentDate),
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        tokenNumber: existingAppointments + 1,
        queuePosition: existingAppointments + 1,
      },
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'Appointment',
        entityId: appointment.id,
        newValue: JSON.stringify(appointment),
      },
    })

    return NextResponse.json({ data: appointment }, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
