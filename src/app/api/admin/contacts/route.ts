import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        // Build where clause
        const where: any = {}

        if (status && status !== 'all') {
            where.status = status.toUpperCase()
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
                { message: { contains: search, mode: 'insensitive' } }
            ]
        }

        // Calculate pagination
        const skip = (page - 1) * limit

        // Get contacts with pagination
        const [contacts, totalCount] = await Promise.all([
            prisma.contact.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.contact.count({ where })
        ])

        // Get status counts for filters
        const statusCounts = await prisma.contact.groupBy({
            by: ['status'],
            _count: { status: true }
        })

        const statusStats = {
            all: totalCount,
            NEW: 0,
            READ: 0,
            REPLIED: 0
        }

        statusCounts.forEach(({ status, _count }) => {
            statusStats[status as keyof typeof statusStats] = _count.status
        })

        return NextResponse.json({
            success: true,
            data: {
                contacts,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    hasNext: page * limit < totalCount,
                    hasPrev: page > 1
                },
                statusStats
            }
        } as ApiResponse)

    } catch (error) {
        console.error('Error fetching contacts:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contacts' } as ApiResponse,
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
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

        const { searchParams } = new URL(request.url)
        const ids = searchParams.get('ids')?.split(',') || []

        if (ids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No contact IDs provided' } as ApiResponse,
                { status: 400 }
            )
        }

        // Delete contacts
        const result = await prisma.contact.deleteMany({
            where: {
                id: { in: ids }
            }
        })

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.count} contact(s)`,
            data: { deletedCount: result.count }
        } as ApiResponse)

    } catch (error) {
        console.error('Error deleting contacts:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete contacts' } as ApiResponse,
            { status: 500 }
        )
    }
}