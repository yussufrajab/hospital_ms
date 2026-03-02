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
    const drugId = searchParams.get('drugId')
    const status = searchParams.get('status')
    const expiryAlert = searchParams.get('expiryAlert')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (drugId) {
      where.drugId = drugId
    }
    
    if (status) {
      where.status = status
    }

    // Expiry alerts - drugs expiring within specified days
    if (expiryAlert) {
      const days = parseInt(expiryAlert)
      const alertDate = new Date()
      alertDate.setDate(alertDate.getDate() + days)
      where.expiryDate = { lte: alertDate }
    }

    const inventory = await prisma.drugInventory.findMany({
      where,
      take: limit,
      orderBy: { expiryDate: 'asc' },
      include: {
        drug: {
          select: {
            name: true,
            genericName: true,
            brandName: true,
            drugCode: true,
            form: true,
            strength: true,
            unit: true,
            reorderLevel: true,
          },
        },
      },
    })

    // Get low stock drugs
    const lowStockDrugs = await prisma.drug.findMany({
      where: { isActive: true },
      include: {
        inventory: true,
      },
    })

    const lowStock = lowStockDrugs.filter(drug => {
      const totalQuantity = drug.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
      return totalQuantity <= drug.reorderLevel
    }).map(drug => ({
      drugId: drug.id,
      drugName: drug.name,
      drugCode: drug.drugCode,
      currentStock: drug.inventory.reduce((sum, inv) => sum + inv.quantity, 0),
      reorderLevel: drug.reorderLevel,
    }))

    return NextResponse.json({ 
      data: inventory,
      lowStock,
    })
  } catch (error) {
    console.error('Error fetching drug inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drug inventory' },
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

    const inventory = await prisma.drugInventory.create({
      data: {
        drugId: body.drugId,
        batchNumber: body.batchNumber,
        lotNumber: body.lotNumber,
        quantity: body.quantity,
        unitPrice: body.unitPrice,
        sellingPrice: body.sellingPrice,
        expiryDate: new Date(body.expiryDate),
        manufacturingDate: body.manufacturingDate ? new Date(body.manufacturingDate) : null,
        supplier: body.supplier,
        location: body.location,
        status: body.quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      },
      include: {
        drug: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'DrugInventory',
        entityId: inventory.id,
        newValue: JSON.stringify(inventory),
      },
    })

    return NextResponse.json(inventory, { status: 201 })
  } catch (error) {
    console.error('Error creating drug inventory:', error)
    return NextResponse.json(
      { error: 'Failed to create drug inventory' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, quantity, ...updateData } = body

    // Determine status based on quantity
    let status = 'IN_STOCK'
    if (quantity !== undefined && quantity <= 0) {
      status = 'OUT_OF_STOCK'
    }

    const inventory = await prisma.drugInventory.update({
      where: { id },
      data: {
        ...updateData,
        ...(quantity !== undefined && { quantity }),
        status,
      },
      include: {
        drug: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'DrugInventory',
        entityId: inventory.id,
        newValue: JSON.stringify(inventory),
      },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error updating drug inventory:', error)
    return NextResponse.json(
      { error: 'Failed to update drug inventory' },
      { status: 500 }
    )
  }
}
