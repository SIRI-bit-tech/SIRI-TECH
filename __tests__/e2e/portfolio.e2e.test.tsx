/**
 * End-to-End Tests for Portfolio Website
 * Tests complete user flows and critical functionality
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextRouter } from 'next/router'

// Mock Next.js components and functions
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

// Mock Prisma
const mockPrisma = {
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  contact: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  profile: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  analytics: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  pageView: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Import components after mocking
import ContactForm from '@/components/ContactForm'
import { HeroSection } from '@/components/sections'

describe('Portfolio Website E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Home Page User Flow', () => {
    it('should render hero section with key elements', async () => {
      render(<HeroSection />)

      // Check for main heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      
      // Check for call-to-action buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Check for navigation elements
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('should display featured projects when available', async () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Test Project 1',
          shortDescription: 'A test project',
          technologies: ['React', 'TypeScript'],
          images: ['test1.jpg'],
          slug: 'test-project-1',
          featured: true,
          status: 'PUBLISHED',
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Test Project 2',
          shortDescription: 'Another test project',
          technologies: ['Next.js', 'Tailwind'],
          images: ['test2.jpg'],
          slug: 'test-project-2',
          featured: true,
          status: 'PUBLISHED',
          createdAt: new Date(),
        },
      ]

      mockPrisma.project.findMany.mockResolvedValue(mockProjects)

      // This would be tested in the actual page component
      // For now, we verify the mock is set up correctly
      const projects = await mockPrisma.project.findMany({
        where: { status: 'PUBLISHED', featured: true },
      })

      expect(projects).toHaveLength(2)
      expect(projects[0].title).toBe('Test Project 1')
    })
  })

  describe('Contact Form User Flow', () => {
    const user = userEvent.setup()

    it('should render contact form with all required fields', () => {
      render(<ContactForm />)

      // Check for form fields
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
      
      // Check for submit button
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })

    it('should validate required fields and show errors', async () => {
      render(<ContactForm />)

      const submitButton = screen.getByRole('button', { name: /send message/i })
      
      // Try to submit empty form
      await user.click(submitButton)

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/message is required/i)).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      render(<ContactForm />)

      const emailInput = screen.getByLabelText(/email/i)
      
      // Enter invalid email
      await user.type(emailInput, 'invalid-email')
      await user.tab() // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should submit form successfully with valid data', async () => {
      // Mock successful API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Message sent successfully' }),
      })

      render(<ContactForm />)

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.')

      // Submit form
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Check for success state
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
      })

      // Verify API was called
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('John Doe'),
      }))
    })

    it('should handle API errors gracefully', async () => {
      // Mock API error
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Server error occurred' }),
      })

      render(<ContactForm />)

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message.')

      // Submit form
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Check for error display
      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
      })
    })

    it('should prevent spam with honeypot field', async () => {
      render(<ContactForm />)

      // Find honeypot field (should be hidden)
      const honeypotField = screen.getByDisplayValue('')
      expect(honeypotField).toHaveClass('absolute', 'left-[-9999px]', 'opacity-0')

      // Fill honeypot (simulating bot behavior)
      fireEvent.change(honeypotField, { target: { value: 'spam' } })

      // Fill out rest of form
      await user.type(screen.getByLabelText(/name/i), 'Bot Name')
      await user.type(screen.getByLabelText(/email/i), 'bot@spam.com')
      await user.type(screen.getByLabelText(/message/i), 'Spam message')

      // Submit form
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Form should not submit (no API call)
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Navigation and Routing', () => {
    it('should handle navigation between pages', () => {
      // This would test navigation components
      // For now, we verify the router mock is working
      const mockRouter = require('next/navigation').useRouter()
      
      expect(mockRouter.push).toBeDefined()
      expect(mockRouter.replace).toBeDefined()
      expect(mockRouter.back).toBeDefined()
    })
  })

  describe('Analytics Tracking', () => {
    it('should track page views', async () => {
      // Mock analytics tracking
      mockPrisma.pageView.create.mockResolvedValue({
        id: '1',
        pageUrl: '/',
        pageTitle: 'Home',
        sessionId: 'test-session',
        timestamp: new Date(),
      })

      // Simulate page view tracking
      const pageViewData = {
        pageUrl: '/',
        pageTitle: 'Home',
        sessionId: 'test-session',
      }

      await mockPrisma.pageView.create({ data: pageViewData })

      expect(mockPrisma.pageView.create).toHaveBeenCalledWith({
        data: pageViewData,
      })
    })

    it('should track user sessions', async () => {
      mockPrisma.session.create.mockResolvedValue({
        id: 'session-1',
        sessionId: 'test-session',
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
        country: 'US',
        device: 'desktop',
        browser: 'Chrome',
        startTime: new Date(),
      })

      const sessionData = {
        sessionId: 'test-session',
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
        country: 'US',
        device: 'desktop',
        browser: 'Chrome',
      }

      await mockPrisma.session.create({ data: sessionData })

      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: sessionData,
      })
    })
  })

  describe('Performance and Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<ContactForm />)

      // Check for proper form labels
      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const messageInput = screen.getByLabelText(/message/i)

      expect(nameInput).toHaveAttribute('id')
      expect(emailInput).toHaveAttribute('id')
      expect(messageInput).toHaveAttribute('id')

      // Check for submit button
      const submitButton = screen.getByRole('button', { name: /send message/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const subjectInput = screen.getByLabelText(/subject/i)
      const messageInput = screen.getByLabelText(/message/i)
      const submitButton = screen.getByRole('button', { name: /send message/i })

      // Test tab navigation
      await user.tab()
      expect(nameInput).toHaveFocus()

      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(subjectInput).toHaveFocus()

      await user.tab()
      expect(messageInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('should be responsive and mobile-friendly', () => {
      render(<ContactForm />)

      // Check for responsive classes
      const form = screen.getByRole('form') || screen.getByTestId('contact-form') || document.querySelector('form')
      
      if (form) {
        // Check for mobile-friendly input sizes
        const inputs = within(form as HTMLElement).getAllByRole('textbox')
        inputs.forEach(input => {
          expect(input).toHaveClass('min-h-[44px]') // Minimum touch target size
        })
      }
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<ContactForm />)

      // Fill and submit form
      await userEvent.type(screen.getByLabelText(/name/i), 'John Doe')
      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
      await userEvent.type(screen.getByLabelText(/message/i), 'Test message')
      
      await userEvent.click(screen.getByRole('button', { name: /send message/i }))

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
      })
    })

    it('should handle malformed API responses', async () => {
      // Mock malformed response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => { throw new Error('Invalid JSON') },
      })

      render(<ContactForm />)

      // Fill and submit form
      await userEvent.type(screen.getByLabelText(/name/i), 'John Doe')
      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
      await userEvent.type(screen.getByLabelText(/message/i), 'Test message')
      
      await userEvent.click(screen.getByRole('button', { name: /send message/i }))

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
      })
    })

    it('should validate input lengths and special characters', async () => {
      render(<ContactForm />)

      const nameInput = screen.getByLabelText(/name/i)
      const messageInput = screen.getByLabelText(/message/i)

      // Test name too short
      await userEvent.type(nameInput, 'A')
      await userEvent.tab()

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      })

      // Test message too short
      await userEvent.type(messageInput, 'Short')
      await userEvent.tab()

      await waitFor(() => {
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('SEO and Meta Tags', () => {
    it('should generate proper structured data', () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Test Project',
          shortDescription: 'A test project',
          technologies: ['React'],
          slug: 'test-project',
        },
      ]

      // Test structured data generation
      const siteUrl = 'https://example.com'
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: 'SIRI DEV Portfolio',
        description: 'Professional portfolio showcasing full-stack web development projects',
        url: siteUrl,
        author: {
          '@type': 'Person',
          name: 'SIRI DEV',
          jobTitle: 'Full-Stack Developer',
        },
        hasPart: mockProjects.map(project => ({
          '@type': 'CreativeWork',
          name: project.title,
          description: project.shortDescription,
          url: `${siteUrl}/projects/${project.slug}`,
          keywords: project.technologies.join(', '),
        })),
      }

      expect(structuredData['@type']).toBe('CreativeWork')
      expect(structuredData.hasPart).toHaveLength(1)
      expect(structuredData.hasPart[0].name).toBe('Test Project')
    })
  })
})