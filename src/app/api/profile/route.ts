import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst()
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'title', 'bio', 'email']
    for (const field of requiredFields) {
      if (!body[field] || !body[field].trim()) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if profile exists
    const existingProfile = await prisma.profile.findFirst()
    
    let profile
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          name: body.name.trim(),
          title: body.title.trim(),
          bio: body.bio.trim(),
          email: body.email.trim(),
          phone: body.phone?.trim() || null,
          location: body.location?.trim() || null,
          profileImage: body.profileImage || null,
          skills: body.skills || [],
          experience: body.experience || [],
          education: body.education || [],
          socialLinks: body.socialLinks || {},
          resumeUrl: body.resumeUrl || null,
        }
      })
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          name: body.name.trim(),
          title: body.title.trim(),
          bio: body.bio.trim(),
          email: body.email.trim(),
          phone: body.phone?.trim() || null,
          location: body.location?.trim() || null,
          profileImage: body.profileImage || null,
          skills: body.skills || [],
          experience: body.experience || [],
          education: body.education || [],
          socialLinks: body.socialLinks || {},
          resumeUrl: body.resumeUrl || null,
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}