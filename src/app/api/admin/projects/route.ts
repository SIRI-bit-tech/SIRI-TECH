import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// GET /api/admin/projects - Get all projects for admin
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const where: Prisma.ProjectWhereInput = {}

    if (status && (status === 'PUBLISHED' || status === 'DRAFT')) {
      where.status = status
    }

    const totalCount = await prisma.project.count({ where })

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      ...(limit && !isNaN(parseInt(limit)) && { take: Math.max(1, parseInt(limit)) }),
      ...(offset && !isNaN(parseInt(offset)) && { skip: Math.max(0, parseInt(offset)) })
    })

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
      total: totalCount
    })
  } catch (error) {
    console.error('Error fetching admin projects:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects'
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/projects - Create new project
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

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingProject = await prisma.project.findUnique({
      where: { slug }
    })

    if (existingProject) {
      return NextResponse.json(
        { success: false, error: 'A project with this title already exists' },
        { status: 400 }
      )
    }

    // Get the next order number if not provided
    let projectOrder = order
    if (typeof projectOrder !== 'number') {
      const lastProject = await prisma.project.findFirst({
        orderBy: { order: 'desc' }
      })
      projectOrder = (lastProject?.order || 0) + 1
    }

    const project = await prisma.project.create({
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
        order: projectOrder,
        slug
      }
    })

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project'
      },
      { status: 500 }
    )
  }
}