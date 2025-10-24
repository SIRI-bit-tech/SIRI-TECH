# Production Deployment Guide

This guide covers deploying the portfolio website to production using Vercel with PostgreSQL database.

## Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, or other provider)
- UploadThing account for file storage
- Resend account for email functionality
- Domain name (optional)

## Environment Variables Setup

### 1. Database Configuration

```bash
# Use connection pooling for production
DATABASE_URL="postgresql://username:password@host:5432/portfolio_db?pgbouncer=true&connection_limit=1"
```

### 2. Authentication

```bash
# Generate a secure secret (minimum 32 characters)
NEXTAUTH_SECRET="your-production-secret-key-minimum-32-characters"
NEXTAUTH_URL="https://yourdomain.com"
```

### 3. UploadThing Configuration

1. Create a new app at [UploadThing](https://uploadthing.com)
2. Get your production API keys:

```bash
UPLOADTHING_SECRET="your-production-uploadthing-secret"
UPLOADTHING_APP_ID="your-production-uploadthing-app-id"
```

### 4. Email Configuration (Resend)

1. Create account at [Resend](https://resend.com)
2. Verify your domain
3. Get API key:

```bash
RESEND_API_KEY="your-production-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"
TO_EMAIL="your-email@yourdomain.com"
```

### 5. Admin Credentials

```bash
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-very-secure-production-password"
```

### 6. Production Settings

```bash
NODE_ENV="production"
ALLOWED_ORIGINS="https://yourdomain.com"
LOG_LEVEL="error"
```

### 7. Optional: Analytics & Monitoring

```bash
# Vercel Analytics
VERCEL_ANALYTICS_ID="your-vercel-analytics-id"
NEXT_PUBLIC_VERCEL_ANALYTICS="true"

# Cron job security
CRON_SECRET="your-cron-secret-for-cleanup-jobs"

# Optional: Redis for advanced rate limiting
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

## Deployment Steps

### 1. Prepare Your Repository

```bash
# Ensure all dependencies are installed
npm install

# Generate Prisma client
npm run db:generate

# Build the application locally to test
npm run build:production
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
npm run deploy:vercel
```

#### Option B: GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### 3. Database Setup

```bash
# Run database migrations in production
npm run db:migrate:prod

# Seed initial data (run once)
npm run db:seed
```

### 4. Verify Deployment

1. **Test Authentication**: Visit `/admin/login` and verify login works
2. **Test File Uploads**: Upload a project image in admin dashboard
3. **Test Email**: Submit contact form and verify email delivery
4. **Test Analytics**: Visit pages and check analytics in admin dashboard
5. **Test Performance**: Run Lighthouse audit

## Post-Deployment Configuration

### 1. Domain Setup (Optional)

1. Add custom domain in Vercel dashboard
2. Update `NEXTAUTH_URL` and `ALLOWED_ORIGINS` environment variables
3. Update email templates with new domain

### 2. SSL Certificate

- Vercel automatically provides SSL certificates
- Verify HTTPS is working correctly
- Update any hardcoded HTTP URLs

### 3. Analytics Setup

1. Enable Vercel Analytics in dashboard
2. Configure Web Vitals monitoring
3. Set up error tracking

### 4. Monitoring Setup

1. Configure log retention policies
2. Set up error alerting via email
3. Monitor database performance
4. Set up uptime monitoring

## Security Checklist

- [ ] All environment variables use production values
- [ ] NEXTAUTH_SECRET is at least 32 characters
- [ ] Database uses connection pooling
- [ ] HTTPS is enforced
- [ ] Admin password is strong and unique
- [ ] File upload restrictions are in place
- [ ] Rate limiting is configured
- [ ] CORS origins are restricted
- [ ] Security headers are configured

## Performance Optimization

- [ ] Images are optimized and use Next.js Image component
- [ ] Bundle size is optimized
- [ ] Database queries are optimized
- [ ] Caching headers are configured
- [ ] CDN is utilized for static assets

## Maintenance

### Regular Tasks

1. **Monitor Analytics**: Check visitor data and performance metrics
2. **Review Logs**: Check for errors and performance issues
3. **Update Dependencies**: Keep packages up to date
4. **Backup Database**: Regular database backups
5. **Clean Analytics Data**: Automatic cleanup runs daily at 2 AM

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify Prisma client generation
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check connection pooling settings
   - Verify database is accessible

3. **File Upload Issues**
   - Check UploadThing configuration
   - Verify API keys are correct
   - Check file size and type restrictions

4. **Email Issues**
   - Verify Resend API key
   - Check domain verification
   - Verify FROM_EMAIL domain

### Logs and Monitoring

```bash
# View Vercel logs
npm run logs:vercel

# Check application logs in Vercel dashboard
# Monitor error rates and performance metrics
```

## Scaling Considerations

- **Database**: Consider read replicas for high traffic
- **File Storage**: UploadThing handles scaling automatically
- **Caching**: Implement Redis for session storage and caching
- **CDN**: Vercel Edge Network provides global CDN
- **Monitoring**: Add comprehensive error tracking and performance monitoring

## Support

For deployment issues:
1. Check Vercel documentation
2. Review application logs
3. Verify environment variables
4. Test locally with production environment variables