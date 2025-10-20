# Design Document

## Overview

The personal portfolio website will be built as a full-stack Next.js 15 application with TypeScript, featuring a modern glassmorphism design, comprehensive admin dashboard, real-time analytics, and production-ready deployment capabilities. The architecture follows a modular approach with clear separation between public-facing portfolio features and secure administrative functionality.

## Architecture

### Technology Stack

**Frontend Framework:**
- Next.js 15 with App Router (includes React 19)
- TypeScript for type safety
- Tailwind CSS for styling with custom glassmorphism components
- Framer Motion for animations and transitions

**Backend & Database:**
- Next.js API Routes for server-side functionality
- Prisma ORM with PostgreSQL database
- NextAuth.js for authentication (or custom JWT implementation)
- UploadThing for file storage and management

**External Services:**
- Resend for email delivery
- UploadThing for cloud file storage
- Vercel for deployment and hosting

### Application Structure

```
portfolio-website/
├── app/
│   ├── (public)/                 # Public portfolio pages
│   │   ├── layout.tsx           # Public layout with navigation
│   │   ├── page.tsx             # Home page
│   │   ├── projects/            # Projects gallery and details
│   │   ├── about/               # About page
│   │   ├── contact/             # Contact page
│   │   └── resume/              # Resume page
│   ├── (admin-auth)/            # Admin authentication
│   │   └── admin/login/         # Login page
│   ├── (admin-dashboard)/       # Admin dashboard
│   │   └── admin/               # Dashboard pages
│   ├── api/                     # API routes
│   └── globals.css              # Global styles
├── components/                  # Reusable components
├── lib/                        # Utilities and configurations
├── prisma/                     # Database schema and migrations
└── types/                      # TypeScript type definitions
```

## Components and Interfaces

### Core Component Architecture

**Layout Components:**
- `PublicLayout`: Navigation, footer, and consistent styling for public pages
- `AdminLayout`: Sidebar navigation and dashboard styling for admin pages
- `AuthLayout`: Minimal centered layout for authentication

**UI Components:**
- `GlassmorphismCard`: Reusable card component with frosted glass effects
- `ProjectCard`: Specialized card for project display with hover effects
- `SkillBadge`: Individual skill display component
- `ContactForm`: Complete contact form with validation
- `AnalyticsChart`: D3.js-powered chart components
- `FileUpload`: UploadThing integration component
- `LoadingSpinner`: Consistent loading states
- `Modal`: Reusable modal with glassmorphism styling

**Feature Components:**
- `HeroSection`: Landing page hero with animations
- `ProjectGallery`: Grid layout for project cards
- `AnalyticsDashboard`: Complete analytics visualization
- `AdminProjectForm`: Project creation/editing form
- `ContactInbox`: Admin contact message management

### Interface Definitions

```typescript
interface Project {
  id: string
  title: string
  description: string
  shortDescription: string
  technologies: string[]
  images: string[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
  order: number
  status: 'DRAFT' | 'PUBLISHED'
  slug: string
  createdAt: Date
  updatedAt: Date
}

interface Profile {
  id: string
  name: string
  title: string
  bio: string
  email: string
  phone?: string
  location?: string
  profileImage?: string
  skills: string[]
  experience: Experience[]
  education: Education[]
  socialLinks: SocialLinks
  resumeUrl?: string
}

interface AnalyticsData {
  id: string
  pageUrl: string
  pageTitle: string
  referrer?: string
  userAgent: string
  ipAddress: string
  country?: string
  city?: string
  device: string
  browser: string
  sessionId: string
  timestamp: Date
}

interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  status: 'NEW' | 'READ' | 'REPLIED'
  createdAt: Date
}
```

## Data Models

### Database Schema Design

**User Table:**
- Stores admin authentication credentials
- Single admin user with role-based access
- Secure password hashing with bcrypt

**Project Table:**
- Complete project information with metadata
- Image arrays for multiple project screenshots
- Status field for draft/published workflow
- Order field for custom project arrangement

**Profile Table:**
- Single profile record for the developer
- JSON fields for complex data (skills, experience, social links)
- File URLs for profile image and resume

**Contact Table:**
- Contact form submissions with status tracking
- Email validation and spam prevention
- Admin workflow for message management

**Analytics Tables:**
- Separate tables for page views, sessions, and visitor data
- Optimized for real-time queries and aggregations
- Geographic and device information storage

### Prisma Schema Structure

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(ADMIN)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Project {
  id               String        @id @default(cuid())
  title            String
  description      String
  shortDescription String
  technologies     String[]
  images           String[]
  liveUrl          String?
  githubUrl        String?
  featured         Boolean       @default(false)
  order            Int           @default(0)
  status           ProjectStatus @default(DRAFT)
  slug             String        @unique
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}

model Profile {
  id           String @id @default(cuid())
  name         String
  title        String
  bio          String
  email        String
  phone        String?
  location     String?
  profileImage String?
  skills       String[]
  experience   Json[]
  education    Json[]
  socialLinks  Json
  resumeUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Error Handling

### Client-Side Error Handling

**Form Validation:**
- Real-time validation with error messages
- Client-side validation before submission
- Server-side validation confirmation
- User-friendly error display with animations

**API Error Handling:**
- Consistent error response format
- Loading states during API calls
- Retry mechanisms for failed requests
- Toast notifications for user feedback

**File Upload Errors:**
- File size and type validation
- Upload progress indicators
- Error recovery and retry options
- Clear error messages for upload failures

### Server-Side Error Handling

**API Route Protection:**
- Authentication middleware for admin routes
- Input validation and sanitization
- Rate limiting for contact form and analytics
- Proper HTTP status codes and error responses

**Database Error Handling:**
- Connection error recovery
- Transaction rollback on failures
- Graceful degradation for analytics failures
- Data validation at the database level

**Email Service Errors:**
- Fallback email providers
- Queue system for failed email delivery
- Admin notifications for email failures
- Retry logic with exponential backoff

## Testing Strategy

### Unit Testing

**Component Testing:**
- React Testing Library for component behavior
- Jest for utility function testing
- Mock external dependencies (UploadThing, email service)
- Snapshot testing for UI consistency

**API Testing:**
- API route testing with mock database
- Authentication flow testing
- Input validation testing
- Error scenario testing

### Integration Testing

**Database Integration:**
- Prisma client testing with test database
- Migration testing and rollback scenarios
- Data integrity and relationship testing
- Performance testing for analytics queries

**External Service Integration:**
- UploadThing integration testing
- Email service integration testing
- Analytics tracking accuracy testing
- Authentication flow end-to-end testing

### Performance Testing

**Frontend Performance:**
- Lighthouse score optimization (90+ target)
- Core Web Vitals monitoring
- Image optimization and lazy loading
- Bundle size analysis and optimization

**Backend Performance:**
- API response time monitoring
- Database query optimization
- Analytics data aggregation performance
- Concurrent user load testing

## Security Considerations

### Authentication Security

**Admin Authentication:**
- Secure password hashing with bcrypt
- JWT tokens with proper expiration
- Session management with secure cookies
- CSRF protection for admin forms

**API Security:**
- Rate limiting on all public endpoints
- Input sanitization and validation
- SQL injection prevention with Prisma
- XSS protection with proper escaping

### Data Protection

**User Data:**
- GDPR compliance for analytics data
- IP address anonymization options
- Data retention policies
- Secure file upload validation

**File Security:**
- File type validation and restrictions
- Virus scanning for uploaded files
- Secure file storage with UploadThing
- Access control for admin-uploaded files

## Deployment Architecture

### Vercel Deployment

**Environment Configuration:**
- Production environment variables
- Database connection strings
- UploadThing API keys
- Email service credentials
- Analytics tracking configuration

**Performance Optimization:**
- Edge function deployment for API routes
- CDN optimization for static assets
- Image optimization with Next.js Image
- Automatic code splitting and lazy loading

**Monitoring and Logging:**
- Error tracking with Vercel Analytics
- Performance monitoring
- Database connection monitoring
- Email delivery tracking

### Database Deployment

**PostgreSQL Setup:**
- Production database with connection pooling
- Automated backups and recovery
- Database migration strategy
- Performance monitoring and optimization

**Data Migration:**
- Initial data seeding for profile
- Analytics data retention policies
- Backup and restore procedures
- Database scaling considerations