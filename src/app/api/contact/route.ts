import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { ContactFormData, ApiResponse } from '@/types'
import { headers } from 'next/headers'

const resend = new Resend(process.env.RESEND_API_KEY)

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5 // Max 5 requests per window

function getRateLimitKey(ip: string, userAgent: string): string {
  // Combine IP and user agent for more accurate rate limiting
  return `${ip}-${userAgent.slice(0, 50)}`
}

function checkRateLimit(key: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: record.resetTime }
  }

  // Increment count
  record.count++
  return { allowed: true }
}

function validateContactForm(data: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Name is required'
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters'
  }

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Email is required'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email address'
    }
  }

  // Subject validation (optional)
  if (data.subject && typeof data.subject === 'string' && data.subject.length > 200) {
    errors.subject = 'Subject must be less than 200 characters'
  }

  // Message validation
  if (!data.message || typeof data.message !== 'string') {
    errors.message = 'Message is required'
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters'
  } else if (data.message.trim().length > 5000) {
    errors.message = 'Message must be less than 5000 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000) // Limit length as extra safety
}

async function sendNotificationEmail(contactData: ContactFormData): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL || 'noreply@portfolio.com'
  const toEmail = process.env.TO_EMAIL

  if (!toEmail) {
    throw new Error('TO_EMAIL environment variable is not configured')
  }

  const subject = contactData.subject 
    ? `Portfolio Contact: ${contactData.subject}` 
    : 'New Portfolio Contact Message'

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        New Contact Message
      </h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        ${contactData.subject ? `<p><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
        <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #333;">Message:</h3>
        <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #007bff; border-radius: 4px;">
          ${contactData.message.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
        <p>This message was sent through your portfolio contact form.</p>
        <p>Reply directly to this email to respond to ${contactData.name}.</p>
      </div>
    </div>
  `

  const textContent = `
New Contact Message

Name: ${contactData.name}
Email: ${contactData.email}
${contactData.subject ? `Subject: ${contactData.subject}` : ''}
Sent: ${new Date().toLocaleString()}

Message:
${contactData.message}

---
This message was sent through your portfolio contact form.
Reply directly to this email to respond to ${contactData.name}.
  `

  await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: contactData.email,
    subject,
    html: htmlContent,
    text: textContent,
  })
}

export async function POST(request: NextRequest) {
  try {
    // Get client information for rate limiting
    const headersList = await headers()
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Check rate limiting
    const rateLimitKey = getRateLimitKey(ip, userAgent)
    const rateLimitResult = checkRateLimit(rateLimitKey)

    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime || Date.now()
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000 / 60) // minutes

      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please try again in ${waitTime} minutes.`
        } as ApiResponse,
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000))
          }
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    // Honeypot check - if 'website' field is filled, it's likely a bot
    if (body.website && body.website.trim() !== '') {
      // Silently reject bot submissions
      return NextResponse.json(
        { success: true, message: 'Message sent successfully' } as ApiResponse,
        { status: 200 }
      )
    }

    // Validate form data
    const validation = validateContactForm(body)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          data: validation.errors
        } as ApiResponse,
        { status: 400 }
      )
    }

    // Sanitize input data
    const contactData: ContactFormData = {
      name: sanitizeInput(body.name),
      email: sanitizeInput(body.email),
      subject: body.subject ? sanitizeInput(body.subject) : undefined,
      message: sanitizeInput(body.message)
    }

    // Save to database
    const contact = await prisma.contact.create({
      data: {
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject || null,
        message: contactData.message,
        status: 'NEW'
      }
    })

    // Send email notification
    try {
      await sendNotificationEmail(contactData)
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the entire request if email fails
      // The contact is still saved in the database
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
        data: { id: contact.id }
      } as ApiResponse,
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      } as ApiResponse,
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' } as ApiResponse,
    { status: 405 }
  )
}