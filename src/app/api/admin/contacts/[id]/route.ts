import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ApiResponse } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const { id } = await params

    const contact = await prisma.contact.findUnique({
      where: { id }
    })

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' } as ApiResponse,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contact
    } as ApiResponse)

  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate status if provided
    if (body.status && !['NEW', 'READ', 'REPLIED'].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' } as ApiResponse,
        { status: 400 }
      )
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        status: body.status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: contact,
      message: 'Contact updated successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update contact' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    const { id } = await params

    await prisma.contact.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact' } as ApiResponse,
      { status: 500 }
    )
  }
}