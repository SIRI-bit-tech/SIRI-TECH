/**
 * Production configuration and environment validation
 */

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Required environment variables for production
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'UPLOADTHING_SECRET',
  'UPLOADTHING_APP_ID',
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'TO_EMAIL',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
] as const;

// Optional environment variables with defaults
export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // Authentication
  nextAuthSecret: process.env.NEXTAUTH_SECRET!,
  nextAuthUrl: process.env.NEXTAUTH_URL!,
  
  // UploadThing
  uploadThingSecret: process.env.UPLOADTHING_SECRET!,
  uploadThingAppId: process.env.UPLOADTHING_APP_ID!,
  
  // Email
  resendApiKey: process.env.RESEND_API_KEY!,
  fromEmail: process.env.FROM_EMAIL!,
  toEmail: process.env.TO_EMAIL!,
  
  // Admin
  adminEmail: process.env.ADMIN_EMAIL!,
  adminPassword: process.env.ADMIN_PASSWORD!,
  
  // Security
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // Analytics
  vercelAnalyticsId: process.env.VERCEL_ANALYTICS_ID,
  enableVercelAnalytics: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === 'true',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || (isProduction ? 'error' : 'info'),
  
  // Rate limiting
  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
} as const;

/**
 * Validates that all required environment variables are present
 */
export function validateEnvironment(): void {
  const missingVars: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
  
  // Production-specific validations
  if (isProduction) {
    validateProductionConfig();
  }
}

/**
 * Additional validations for production environment
 */
function validateProductionConfig(): void {
  const errors: string[] = [];
  
  // Check NEXTAUTH_SECRET length
  if (config.nextAuthSecret.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters long in production');
  }
  
  // Check NEXTAUTH_URL is HTTPS
  if (!config.nextAuthUrl.startsWith('https://')) {
    errors.push('NEXTAUTH_URL must use HTTPS in production');
  }
  
  // Check allowed origins
  const hasHttpOrigins = config.allowedOrigins.some(origin => 
    origin.startsWith('http://') && !origin.includes('localhost')
  );
  if (hasHttpOrigins) {
    errors.push('ALLOWED_ORIGINS should not contain HTTP URLs in production (except localhost)');
  }
  
  if (errors.length > 0) {
    throw new Error(
      `Production configuration errors:\n${errors.map(e => `- ${e}`).join('\n')}`
    );
  }
}

/**
 * Get database configuration with production optimizations
 */
export function getDatabaseConfig() {
  const url = new URL(config.databaseUrl);
  
  if (isProduction) {
    // Add connection pooling parameters for production
    if (!url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '1');
    }
  }
  
  return {
    url: url.toString(),
    ssl: isProduction,
  };
}