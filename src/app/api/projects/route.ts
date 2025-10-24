import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { handleApiError, withErrorHandler, ValidationError, DatabaseError } from '@/lib/error-handler'
import { ApiResponse } from '@/types'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'PUBLISHED'
  const featured = searchParams.get('featured')
  const technology = searchParams.get('technology')
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')

  // Validate status parameter
  if (status && !['PUBLISHED', 'DRAFT'].includes(status)) {
    throw new ValidationError('Invalid status parameter. Must be PUBLISHED or DRAFT')
  }

  // Validate numeric parameters
  const parsedLimit = limit ? parseInt(limit) : null
  const parsedOffset = offset ? parseInt(offset) : null

  if (limit && (isNaN(parsedLimit!) || parsedLimit! < 1)) {
    throw new ValidationError('Limit must be a positive number')
  }

  if (offset && (isNaN(parsedOffset!) || parsedOffset! < 0)) {
    throw new ValidationError('Offset must be a non-negative number')
  }

  // Build query conditions
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

  try {
    // Get total count and projects in parallel for better performance
    const [totalCount, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        ...(parsedLimit && { take: parsedLimit }),
        ...(parsedOffset && { skip: parsedOffset })
      })
    ])

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
      total: totalCount,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: parsedOffset ? (parsedOffset + projects.length) < totalCount : projects.length < totalCount
      }
    } as ApiResponse)

  } catch (error) {
    // Handle database-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(`Database query failed: ${error.message}`)
    }
    
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      throw new DatabaseError('Unknown database error occurred')
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new DatabaseError('Database connection failed')
    }

    // Re-throw other errors to be handled by the error handler
    throw error
  }
})