import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PUBLISHED'
    const featured = searchParams.get('featured')
    const technology = searchParams.get('technology')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const where: Prisma.ProjectWhereInput = {
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

    const totalCount = await prisma.project.count({ where })

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
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