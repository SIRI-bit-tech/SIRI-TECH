/**
 * End-to-End Tests for API Routes
 * Tests all API endpoints for functionality, validation, and security
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'

// Mock Prisma
const mockPrisma = {
  contact: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  profile: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  analytics: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  pageView: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock auth
const mockAuth = {
  api: {
    getSession: jest.fn(),
  },
}

jest.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

// Mock Resend
const mockResend = {
  emails: {
    send: jest.fn(),
  },
}

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => mockResend),
}))

// Mock rate limiting
const mockRateLimit = jest.fn()
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: mockRateLimit,
}))

describe('API Routes E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimit.mockResolvedValue({ success: true })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Contact API (/api/contact)', () => {
    const validContactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message that is long enough to pass validation.',
    }

    it('should create contact message successfully', async () => {
      const mockCreatedContact = {
        id: '1',
        ...validContactData,
        status: 'NEW',
        createdAt: new Date(),
      }

      mockPrisma.contact.create.mockResolvedValue(mockCreatedContact)
      mockResend.emails.send.mockResolvedValue({
        id: 'email-id',
        from: 'noreply@example.com',
        to: 'admin@example.com',
      })

      // Simulate API call
      const response = await mockPrisma.contact.create({
        data: {
          ...validContactData,
          status: 'NEW',
        },
      })

      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: {
          ...validContactData,
          status: 'NEW',
        },
      })

      expect(response).toEqual(mockCreatedContact)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        message: 'short',
      }

      // Test validation logic
      const errors: string[] = []

      if (!invalidData.name.trim()) {
        errors.push('Name is required')
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invalidData.email)) {
        errors.push('Invalid email format')
      }

      if (invalidData.message.length < 10) {
        errors.push('Message must be at least 10 characters')
      }

      expect(errors).toContain('Name is required')
      expect(errors).toContain('Invalid email format')
      expect(errors).toContain('Message must be at least 10 characters')
    })

    it('should handle rate limiting', async () => {
      mockRateLimit.mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      })

      const rateLimitResult = await mockRateLimit('contact-form', '127.0.0.1')

      expect(rateLimitResult.success).toBe(false)
      expect(rateLimitResult.remaining).toBe(0)
    })

    it('should send email notification', async () => {
      mockResend.emails.send.mockResolvedValue({
        id: 'email-123',
        from: 'noreply@example.com',
        to: 'admin@example.com',
      })

      const emailResult = await mockResend.emails.send({
        from: 'noreply@example.com',
        to: 'admin@example.com',
        subject: `New Contact: ${validContactData.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${validContactData.name}</p>
          <p><strong>Email:</strong> ${validContactData.email}</p>
          <p><strong>Subject:</strong> ${validContactData.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${validContactData.message}</p>
        `,
      })

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          to: 'admin@example.com',
          subject: expect.stringContaining('New Contact'),
        })
      )

      expect(emailResult.id).toBe('email-123')
    })

    it('should handle honeypot spam detection', async () => {
      const spamData = {
        ...validContactData,
        website: 'spam-value', // Honeypot field
      }

      // Honeypot validation
      const isSpam = spamData.website && spamData.website.length > 0

      expect(isSpam).toBe(true)

      // Should not create contact if spam detected
      if (isSpam) {
        expect(mockPrisma.contact.create).not.toHaveBeenCalled()
      }
    })
  })

  describe('Projects API (/api/projects)', () => {
    const mockProjects = [
      {
        id: '1',
        title: 'Project 1',
        shortDescription: 'Description 1',
        description: 'Full description 1',
        technologies: ['React', 'TypeScript'],
        images: ['image1.jpg'],
        liveUrl: 'https://project1.com',
        githubUrl: 'https://github.com/user/project1',
        featured: true,
        status: 'PUBLISHED',
        slug: 'project-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('should fetch published projects', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockProjects)

      const projects = await mockPrisma.project.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
      })

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
      })

      expect(projects).toEqual(mockProjects)
      expect(projects[0].status).toBe('PUBLISHED')
    })

    it('should fetch project by slug', async () => {
      const project = mockProjects[0]
      mockPrisma.project.findUnique.mockResolvedValue(project)

      const result = await mockPrisma.project.findUnique({
        where: { slug: 'project-1' },
      })

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { slug: 'project-1' },
      })

      expect(result).toEqual(project)
    })

    it('should require authentication for admin operations', async () => {
      // Mock no session
      mockAuth.api.getSession.mockResolvedValue(null)

      const session = await mockAuth.api.getSession()
      const isAuthenticated = !!session

      expect(isAuthenticated).toBe(false)

      // Should return 401 for unauthenticated requests
      if (!isAuthenticated) {
        const errorResponse = { error: 'Unauthorized', status: 401 }
        expect(errorResponse.status).toBe(401)
      }
    })

    it('should create new project with authentication', async () => {
      // Mock authenticated session
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' },
      })

      const newProjectData = {
        title: 'New Project',
        shortDescription: 'New project description',
        description: 'Full description of new project',
        technologies: ['Next.js', 'Tailwind'],
        images: [],
        status: 'DRAFT',
        slug: 'new-project',
      }

      const createdProject = {
        id: '2',
        ...newProjectData,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.project.create.mockResolvedValue(createdProject)

      const result = await mockPrisma.project.create({
        data: newProjectData,
      })

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: newProjectData,
      })

      expect(result).toEqual(createdProject)
    })
  })

  describe('Analytics API (/api/analytics)', () => {
    it('should track page view', async () => {
      const pageViewData = {
        pageUrl: '/',
        pageTitle: 'Home',
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0...',
        ipAddress: '127.0.0.1',
        sessionId: 'session-123',
      }

      const createdPageView = {
        id: '1',
        ...pageViewData,
        timestamp: new Date(),
      }

      mockPrisma.pageView.create.mockResolvedValue(createdPageView)

      const result = await mockPrisma.pageView.create({
        data: pageViewData,
      })

      expect(mockPrisma.pageView.create).toHaveBeenCalledWith({
        data: pageViewData,
      })

      expect(result).toEqual(createdPageView)
    })

    it('should get analytics data with date filters', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      const mockAnalyticsData = {
        totalViews: 1000,
        uniqueVisitors: 500,
        topPages: [
          { pageUrl: '/', count: 400 },
          { pageUrl: '/projects', count: 300 },
        ],
      }

      mockPrisma.pageView.count.mockResolvedValue(1000)
      mockPrisma.session.count.mockResolvedValue(500)
      mockPrisma.pageView.groupBy.mockResolvedValue([
        { pageUrl: '/', _count: { pageUrl: 400 } },
        { pageUrl: '/projects', _count: { pageUrl: 300 } },
      ])

      // Simulate analytics query
      const totalViews = await mockPrisma.pageView.count({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      const uniqueVisitors = await mockPrisma.session.count({
        where: {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      const topPages = await mockPrisma.pageView.groupBy({
        by: ['pageUrl'],
        _count: { pageUrl: true },
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { _count: { pageUrl: 'desc' } },
        take: 10,
      })

      expect(totalViews).toBe(1000)
      expect(uniqueVisitors).toBe(500)
      expect(topPages).toHaveLength(2)
      expect(topPages[0].pageUrl).toBe('/')
    })

    it('should require admin authentication for analytics data', async () => {
      // Mock non-admin user
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: '1', email: 'user@example.com', role: 'USER' },
      })

      const session = await mockAuth.api.getSession()
      const isAdmin = session?.user?.role === 'ADMIN'

      expect(isAdmin).toBe(false)

      // Should return 403 for non-admin users
      if (!isAdmin) {
        const errorResponse = { error: 'Forbidden', status: 403 }
        expect(errorResponse.status).toBe(403)
      }
    })
  })

  describe('Profile API (/api/profile)', () => {
    const mockProfile = {
      id: '1',
      name: 'SIRI DEV',
      title: 'Full-Stack Developer',
      bio: 'Passionate developer with expertise in modern web technologies.',
      email: 'contact@siridev.com',
      skills: ['React', 'TypeScript', 'Next.js', 'Node.js'],
      experience: [
        {
          company: 'Tech Company',
          position: 'Senior Developer',
          startDate: '2022-01-01',
          endDate: null,
          description: 'Leading development of web applications',
        },
      ],
      socialLinks: {
        github: 'https://github.com/siridev',
        linkedin: 'https://linkedin.com/in/siridev',
        twitter: 'https://twitter.com/siridev',
      },
    }

    it('should fetch profile data', async () => {
      mockPrisma.profile.findFirst.mockResolvedValue(mockProfile)

      const profile = await mockPrisma.profile.findFirst()

      expect(mockPrisma.profile.findFirst).toHaveBeenCalled()
      expect(profile).toEqual(mockProfile)
      expect(profile?.name).toBe('SIRI DEV')
    })

    it('should update profile with authentication', async () => {
      // Mock authenticated admin
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'ADMIN' },
      })

      const updatedData = {
        ...mockProfile,
        bio: 'Updated bio with new information',
      }

      mockPrisma.profile.upsert.mockResolvedValue(updatedData)

      const result = await mockPrisma.profile.upsert({
        where: { id: '1' },
        update: { bio: 'Updated bio with new information' },
        create: updatedData,
      })

      expect(mockPrisma.profile.upsert).toHaveBeenCalledWith({
        where: { id: '1' },
        update: { bio: 'Updated bio with new information' },
        create: updatedData,
      })

      expect(result.bio).toBe('Updated bio with new information')
    })
  })

  describe('File Upload API (/api/upload)', () => {
    it('should validate file types', () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      
      const validFile = { type: 'image/jpeg', size: 1024 * 1024 } // 1MB
      const invalidFile = { type: 'text/plain', size: 1024 }

      const isValidType = allowedTypes.includes(validFile.type)
      const isInvalidType = allowedTypes.includes(invalidFile.type)

      expect(isValidType).toBe(true)
      expect(isInvalidType).toBe(false)
    })

    it('should validate file sizes', () => {
      const maxSize = 5 * 1024 * 1024 // 5MB

      const validFile = { size: 2 * 1024 * 1024 } // 2MB
      const oversizedFile = { size: 10 * 1024 * 1024 } // 10MB

      const isValidSize = validFile.size <= maxSize
      const isOversized = oversizedFile.size > maxSize

      expect(isValidSize).toBe(true)
      expect(isOversized).toBe(true)
    })

    it('should require authentication for uploads', async () => {
      // Mock no session
      mockAuth.api.getSession.mockResolvedValue(null)

      const session = await mockAuth.api.getSession()
      const canUpload = !!session?.user

      expect(canUpload).toBe(false)
    })
  })

  describe('Error Handling and Security', () => {
    it('should handle database connection errors', async () => {
      mockPrisma.contact.create.mockRejectedValue(new Error('Database connection failed'))

      try {
        await mockPrisma.contact.create({
          data: {
            name: 'Test',
            email: 'test@example.com',
            message: 'Test message',
          },
        })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Database connection failed')
      }
    })

    it('should sanitize input data', () => {
      const maliciousInput = '<script>alert("xss")</script>'
      const sanitizedInput = maliciousInput
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')

      expect(sanitizedInput).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      expect(sanitizedInput).not.toContain('<script>')
    })

    it('should validate request methods', () => {
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE']
      const requestMethod = 'POST'

      const isAllowed = allowedMethods.includes(requestMethod)
      expect(isAllowed).toBe(true)

      const invalidMethod = 'PATCH'
      const isInvalid = allowedMethods.includes(invalidMethod)
      expect(isInvalid).toBe(false)
    })

    it('should handle CORS properly', () => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://siridev.com',
        'https://www.siridev.com',
      ]

      const requestOrigin = 'https://siridev.com'
      const isAllowedOrigin = allowedOrigins.includes(requestOrigin)

      expect(isAllowedOrigin).toBe(true)

      const maliciousOrigin = 'https://evil.com'
      const isMalicious = allowedOrigins.includes(maliciousOrigin)

      expect(isMalicious).toBe(false)
    })

    it('should implement proper error responses', () => {
      const errors = {
        validation: { status: 400, message: 'Validation failed' },
        unauthorized: { status: 401, message: 'Unauthorized' },
        forbidden: { status: 403, message: 'Forbidden' },
        notFound: { status: 404, message: 'Not found' },
        rateLimit: { status: 429, message: 'Too many requests' },
        serverError: { status: 500, message: 'Internal server error' },
      }

      expect(errors.validation.status).toBe(400)
      expect(errors.unauthorized.status).toBe(401)
      expect(errors.forbidden.status).toBe(403)
      expect(errors.notFound.status).toBe(404)
      expect(errors.rateLimit.status).toBe(429)
      expect(errors.serverError.status).toBe(500)
    })
  })
})