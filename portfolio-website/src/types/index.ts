import { Project, Profile, Contact, Analytics, Session, User } from '@prisma/client'

// Re-export Prisma types
export type { Project, Profile, Contact, Analytics, Session, User }

// Extended types for frontend use
export interface ProjectWithDetails extends Project {
  _count?: {
    views?: number
  }
}

export interface ContactWithStatus extends Contact {
  isNew?: boolean
}

export interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  topPages: Array<{
    url: string
    views: number
  }>
  recentVisitors: Array<{
    country?: string
    timestamp: Date
    pageUrl: string
  }>
  deviceStats: Array<{
    device: string
    count: number
  }>
  browserStats: Array<{
    browser: string
    count: number
  }>
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  email?: string
  website?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  description: string
  technologies?: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  description?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ContactFormData {
  name: string
  email: string
  subject?: string
  message: string
}