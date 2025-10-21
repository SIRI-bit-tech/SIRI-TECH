import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PUBLISHED'
    const featured = searchParams.get('featured')
    const technology = searchParams.get('technology')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const where: any = {
      status: status as 'PUBLISHED' | 'DRAFT'
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (technology) {
      where.technologies = {
        has: technology
      }
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) })
    })

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects'
      },
      { status: 500 }
    )
  }
}