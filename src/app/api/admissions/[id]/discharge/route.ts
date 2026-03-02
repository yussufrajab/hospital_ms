import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST - Discharge a patient
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get the admission
    const admission = await prisma.admission.findUnique({
      where: { id },
      include: { bed: true },
    })

    if (!admission) {
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 })
    }

    if (admission.status !== 'ADMITTED') {
      return NextResponse.json(
        { error: 'Patient is not currently admitted' },
        { status: 400 }
      )
    }

    // Start a transaction to discharge and update bed status
    const result = await prisma.$transaction(async (tx) => {
      // Update admission
      const updatedAdmission = await tx.admission.update({
        where: { id },
        data: {
          status: 'DISCHARGED',
          dischargeDate: new Date(),
          dischargeSummary: body.dischargeSummary,
          dischargeInstructions: body.dischargeInstructions,
          followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
        },
        include: {
          patient: true,
          ward: true,
          bed: true,
        },
      })

      // Update bed status to DIRTY (needs cleaning) or AVAILABLE
      if (admission.bedId) {
        await tx.bed.update({
          where: { id: admission.bedId },
          data: { status: body.bedNeedsCleaning ? 'DIRTY' : 'AVAILABLE' },
        })
      }

      return updatedAdmission
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DISCHARGE',
        entityType: 'Admission',
        entityId: id,
        newValue: JSON.stringify(result),
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error discharging patient:', error)
    return NextResponse.json(
      { error: 'Failed to discharge patient' },
      { status: 500 }
    )
  }
}
