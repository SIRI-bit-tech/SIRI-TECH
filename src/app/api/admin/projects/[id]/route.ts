import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/admin/projects/[id] - Get single project for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const project = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const {
      title,
      description,
      shortDescription,
      technologies,
      images,
      liveUrl,
      githubUrl,
      featured,
      status,
      order
    } = body

    // Validate required fields
    if (!title || !description || !shortDescription) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and short description are required' },
        { status: 400 }
      )
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Generate new slug if title changed
    let slug = existingProject.slug
    if (title !== existingProject.title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if new slug already exists (excluding current project)
      const slugExists = await prisma.project.findFirst({
        where: {
          slug: newSlug,
          id: { not: params.id }
        }
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'A project with this title already exists' },
          { status: 400 }
        )
      }

      slug = newSlug
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        title,
        description,
        shortDescription,
        technologies: technologies || [],
        images: images || [],
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        featured: featured || false,
        status: status || 'DRAFT',
        order: order !== undefined ? order : existingProject.order,
        slug
      }
    })

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project'
      },
      { status: 500 }
    )
  }
}