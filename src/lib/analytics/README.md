# Analytics System Documentation

## Overview

The analytics system provides comprehensive real-time tracking of website visitors, page views, and user behavior. It includes automatic middleware tracking, manual tracking capabilities, and detailed analytics data aggregation.

## Features

- **Real-time Analytics**: Track page views, sessions, and visitor activity in real-time
- **Geographic Location**: Automatic IP-based location detection for visitors
- **Device & Browser Detection**: Parse user agents to identify devices and browsers
- **Session Management**: Track user sessions with heartbeat monitoring
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Data Retention**: Configurable data cleanup for GDPR compliance
- **Visitor Flow**: Track page transitions and user navigation patterns

## Components

### Core Analytics Library (`src/lib/analytics.ts`)

Main functions:
- `trackPageView()` - Track individual page views
- `getAnalyticsData()` - Get comprehensive analytics dashboard data
- `getRealTimeAnalytics()` - Get real-time visitor activity
- `getAnalyticsSummary()` - Get analytics summary for time periods
- `getHourlyAnalytics()` - Get hourly breakdown of activity
- `getPopularPages()` - Get most visited pages with engagement metrics
- `getVisitorFlow()` - Get page transition data
- `cleanupOldAnalytics()` - Clean up old data for retention compliance

### Analytics Middleware (`src/lib/analytics-middleware.ts`)

Automatic tracking middleware that:
- Tracks all public page visits automatically
- Implements rate limiting per IP address
- Skips tracking for admin pages, API routes, and static files
- Generates page titles automatically

### Client Components

#### AnalyticsTracker (`src/components/analytics/AnalyticsTracker.tsx`)
React component for client-side tracking:
- Automatic page view tracking on route changes
- Session initialization and heartbeat monitoring
- Proper cleanup on page unload

#### useAnalytics Hook (`src/hooks/useAnalytics.ts`)
React hook for manual analytics tracking:
- `trackEvent()` - Track custom events
- `trackPageView()` - Manually track page views
- `initSession()` - Initialize analytics session
- `endSession()` - End analytics session

## API Routes

### Public Routes
- `POST /api/analytics/track` - Track page views and events
- `POST /api/analytics/session` - Manage user sessions

### Admin Routes (Authentication Required)
- `GET /api/analytics/data?days=30` - Get comprehensive analytics data
- `GET /api/analytics/realtime` - Get real-time analytics
- `GET /api/analytics/summary?days=30` - Get analytics summary
- `GET /api/analytics/hourly?hours=24` - Get hourly analytics
- `GET /api/analytics/pages?days=30` - Get popular pages
- `GET /api/analytics/flow?days=30` - Get visitor flow data
- `POST /api/analytics/cleanup` - Clean up old analytics data

## Database Schema

The analytics system uses three main tables:

### Analytics Table
Stores detailed page view data with visitor information:
```sql
- id: Unique identifier
- pageUrl: Visited page URL
- pageTitle: Page title
- referrer: Referrer URL
- userAgent: User agent string
- ipAddress: Visitor IP address
- country: Geographic country
- city: Geographic city
- device: Device type (desktop/mobile/tablet)
- browser: Browser name and version
- sessionId: Session identifier
- timestamp: Visit timestamp
```

### Sessions Table
Tracks user sessions:
```sql
- id: Unique identifier
- sessionId: Unique session identifier
- userAgent: User agent string
- ipAddress: Visitor IP address
- country: Geographic country
- city: Geographic city
- device: Device type
- browser: Browser name and version
- startTime: Session start time
- endTime: Session end time (updated on activity)
- pageViews: Number of pages viewed in session
```

### PageViews Table
Simplified page view tracking:
```sql
- id: Unique identifier
- pageUrl: Visited page URL
- sessionId: Associated session
- timestamp: View timestamp
```

## Usage Examples

### Automatic Tracking (Recommended)

Add the AnalyticsTracker to your root layout:

```tsx
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  )
}
```

### Manual Tracking

Use the useAnalytics hook for custom tracking:

```tsx
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const { trackEvent, trackPageView } = useAnalytics()
  
  const handleButtonClick = () => {
    trackEvent({
      pageUrl: '/special-action',
      pageTitle: 'Special Action Performed'
    })
  }
  
  return <button onClick={handleButtonClick}>Track This</button>
}
```

### Fetching Analytics Data

```tsx
// Get comprehensive analytics data
const response = await fetch('/api/analytics/data?days=30')
const { data } = await response.json()

// Get real-time analytics
const realtimeResponse = await fetch('/api/analytics/realtime')
const { data: realtimeData } = await realtimeResponse.json()
```

## Configuration

### Environment Variables

No additional environment variables are required. The system uses:
- Existing database connection (DATABASE_URL)
- IP geolocation via ip-api.com (free tier)

### Rate Limiting

Default rate limits:
- 100 requests per minute per IP address
- Configurable in `analytics-middleware.ts`

### Data Retention

Default retention: 365 days
- Configurable via the cleanup API
- Minimum: 30 days
- Maximum: 1095 days (3 years)

## Privacy & GDPR Compliance

The analytics system is designed with privacy in mind:

1. **IP Address Handling**: IP addresses are stored but can be anonymized
2. **Data Retention**: Configurable cleanup for compliance
3. **No Personal Data**: Only technical and behavioral data is collected
4. **Opt-out Capable**: Easy to disable tracking per user

### GDPR Compliance Checklist

- [ ] Implement IP anonymization if required
- [ ] Add cookie consent banner if needed
- [ ] Configure appropriate data retention periods
- [ ] Implement data export functionality for user requests
- [ ] Add data deletion capabilities for user requests

## Performance Considerations

1. **Asynchronous Tracking**: All tracking is non-blocking
2. **Rate Limiting**: Prevents abuse and excessive database load
3. **Efficient Queries**: Optimized database queries with proper indexing
4. **Cleanup Jobs**: Regular cleanup prevents database bloat

## Monitoring & Maintenance

### Regular Tasks

1. **Monitor Database Size**: Check analytics table growth
2. **Run Cleanup**: Regularly clean old data based on retention policy
3. **Check Error Logs**: Monitor for tracking failures
4. **Verify Geolocation**: Ensure IP geolocation service is working

### Troubleshooting

Common issues:
- **High Database Usage**: Increase cleanup frequency
- **Missing Location Data**: Check ip-api.com service status
- **Rate Limiting**: Adjust limits in middleware if needed
- **Session Tracking**: Verify heartbeat intervals are appropriate

## Security

The analytics system includes several security measures:

1. **Rate Limiting**: Prevents abuse and DoS attacks
2. **Input Validation**: All inputs are validated with Zod schemas
3. **Admin Authentication**: Analytics data requires admin access
4. **SQL Injection Prevention**: Uses Prisma ORM with parameterized queries
5. **CORS Headers**: Proper CORS configuration for API routes

## Future Enhancements

Potential improvements:
- Real-time WebSocket updates for live analytics
- A/B testing capabilities
- Conversion funnel tracking
- Custom event tracking with metadata
- Advanced filtering and segmentation
- Export functionality (CSV, JSON)
- Automated reporting via email