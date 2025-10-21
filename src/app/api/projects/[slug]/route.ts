import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const project = await prisma.project.findFirst({
      where: {
        slug: params.slug,
        status: 'PUBLISHED'
      }
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        },
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