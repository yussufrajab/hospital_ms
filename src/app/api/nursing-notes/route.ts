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

    const notes = await prisma.nursingNote.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        nurse: {
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

    return NextResponse.json({ data: notes })
  } catch (error) {
    console.error('Error fetching nursing notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nursing notes' },
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

    const note = await prisma.nursingNote.create({
      data: {
        patientId: body.patientId,
        admissionId: body.admissionId,
        nurseId: staff.id,
        noteType: body.noteType,
        note: body.note,
        shift: body.shift,
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
        entityType: 'NursingNote',
        entityId: note.id,
        newValue: JSON.stringify(note),
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating nursing note:', error)
    return NextResponse.json(
      { error: 'Failed to create nursing note' },
      { status: 500 }
    )
  }
}
