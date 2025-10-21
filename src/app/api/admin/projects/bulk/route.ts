import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// POST /api/admin/projects/bulk - Bulk operations for projects
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, projectIds, data } = body

    switch (action) {
      case 'updateOrder':
        // Update order for multiple projects
        if (!Array.isArray(data)) {
          return NextResponse.json(
            { success: false, error: 'Invalid data format for order update' },
            { status: 400 }
          )
        }

        // Update each project's order
        const updatePromises = data.map(({ id, order }: { id: string, order: number }) =>
          prisma.project.update({
            where: { id },
            data: { order }
          })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({
          success: true,
          message: 'Project order updated successfully'
        })

      case 'updateStatus':
        // Bulk status update
        if (!projectIds || !Array.isArray(projectIds) || !data.status) {
          return NextResponse.json(
            { success: false, error: 'Invalid data for status update' },
            { status: 400 }
          )
        }

        await prisma.project.updateMany({
          where: {
            id: { in: projectIds }
          },
          data: {
            status: data.status
          }
        })

        return NextResponse.json({
          success: true,
          message: `${projectIds.length} projects updated to ${data.status}`
        })

      case 'delete':
        // Bulk delete
        if (!projectIds || !Array.isArray(projectIds)) {
          return NextResponse.json(
            { success: false, error: 'Invalid project IDs for deletion' },
            { status: 400 }
          )
        }

        await prisma.project.deleteMany({
          where: {
            id: { in: projectIds }
          }
        })

        return NextResponse.json({
          success: true,
          message: `${projectIds.length} projects deleted successfully`
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in bulk project operation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk operation'
      },
      { status: 500 }
    )
  }
}