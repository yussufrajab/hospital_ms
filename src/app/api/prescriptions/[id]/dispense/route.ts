import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Get prescription details for dispensing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            allergies: {
              select: {
                allergen: true,
                severity: true,
                reaction: true,
              },
            },
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
                id: true,
                name: true,
                drugCode: true,
                form: true,
                strength: true,
                unit: true,
              },
            },
          },
        },
      },
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error('Error fetching prescription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescription' },
      { status: 500 }
    )
  }
}

// POST - Dispense prescription items
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

    // Get pharmacist staff ID
    const staff = await prisma.staff.findFirst({
      where: { userId: session.user.id },
    })

    if (!staff) {
      return NextResponse.json({ error: 'Pharmacist profile not found' }, { status: 400 })
    }

    // Update prescription items
    const updatePromises = body.items.map((item: { itemId: string; dispensedQuantity: number }) =>
      prisma.prescriptionItem.update({
        where: { id: item.itemId },
        data: {
          dispensedQuantity: item.dispensedQuantity,
          dispensedAt: new Date(),
          dispensedBy: staff.id,
          isDispensed: true,
        },
      })
    )

    await Promise.all(updatePromises)

    // Check if all items are dispensed
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { items: true },
    })

    const allDispensed = prescription?.items.every(item => item.isDispensed)

    // Update prescription status
    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        status: allDispensed ? 'DISPENSED' : 'PARTIALLY_DISPENSED',
      },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
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
        action: 'DISPENSE',
        entityType: 'Prescription',
        entityId: id,
        newValue: JSON.stringify(updatedPrescription),
      },
    })

    return NextResponse.json(updatedPrescription)
  } catch (error) {
    console.error('Error dispensing prescription:', error)
    return NextResponse.json(
      { error: 'Failed to dispense prescription' },
      { status: 500 }
    )
  }
}
