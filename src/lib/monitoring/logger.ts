/**
 * Production logging and monitoring utilities
 */

import { config, isProduction } from '../config/production';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = config.logLevel as LogLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    
    return levels[level] >= levels[this.logLevel];
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      logMessage += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      logMessage += ` | Error: ${error.message}`;
      if (!isProduction && error.stack) {
        logMessage += `\nStack: ${error.stack}`;
      }
    }
    
    return logMessage;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedMessage = this.formatLog(entry);

    // Console output
    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }

    // In production, you might want to send logs to external services
    if (isProduction) {
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // This is where you would integrate with external logging services
    // Examples: Vercel Analytics, Sentry, LogRocket, etc.
    
    try {
      // Example: Send to Vercel Analytics (if configured)
      if (config.vercelAnalyticsId && entry.level === 'error') {
        // You can integrate with Vercel Analytics API here
        // or use their SDK for error tracking
      }
      
      // Example: Send critical errors to admin email
      if (entry.level === 'error' && entry.error) {
        await this.sendCriticalErrorEmail(entry);
      }
    } catch (error) {
      // Fail silently to avoid logging loops
      console.error('Failed to send log to external service:', error);
    }
  }

  private async sendCriticalErrorEmail(entry: LogEntry): Promise<void> {
    // Only send critical errors in production to avoid spam
    if (!isProduction) return;

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(config.resendApiKey);

      await resend.emails.send({
        from: config.fromEmail,
        to: config.toEmail,
        subject: `Critical Error - Portfolio Website`,
        html: `
          <h2>Critical Error Detected</h2>
          <p><strong>Time:</strong> ${entry.timestamp}</p>
          <p><strong>Message:</strong> ${entry.message}</p>
          ${entry.context ? `<p><strong>Context:</strong> ${JSON.stringify(entry.context, null, 2)}</p>` : ''}
          ${entry.error ? `<p><strong>Error:</strong> ${entry.error.message}</p>` : ''}
          ${entry.error?.stack ? `<pre><strong>Stack Trace:</strong>\n${entry.error.stack}</pre>` : ''}
        `,
      });
    } catch (error) {
      // Fail silently
      console.error('Failed to send critical error email:', error);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }
}

export const logger = new Logger();

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(label: string): void {
    this.timers.set(label, Date.now());
  }

  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn(`Performance timer "${label}" was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);

    logger.info(`Performance: ${label} took ${duration}ms`, { duration, label });
    
    return duration;
  }

  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      logger.error(`Performance measurement failed for "${label}"`, error as Error);
      throw error;
    }
  }
}

/**
 * Error boundary utility for API routes
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorMessage = `${context ? `${context}: ` : ''}${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error as Error, { context, args: args.length });
      throw error;
    }
  };
}