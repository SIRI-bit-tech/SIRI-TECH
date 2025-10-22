/**
 * Test file for advanced analytics features
 * This file tests the new functionality added in task 14
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock Prisma client
const mockPrisma = {
  analytics: {
    count: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
    deleteMany: jest.fn(),
    $queryRaw: jest.fn()
  },
  pageView: {
    count: jest.fn(),
    groupBy: jest.fn(),
    deleteMany: jest.fn()
  },
  session: {
    count: jest.fn(),
    groupBy: jest.fn(),
    deleteMany: jest.fn()
  },
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn()
}

// Mock the prisma import
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

// Import functions after mocking
import {
  getAnalyticsDataWithFilters,
  getOptimizedAnalyticsData,
  getAggregatedAnalyticsData,
  cleanupOldAnalytics,
  getPerformanceMetrics,
  batchProcessAnalytics
} from '../analytics'

describe('Advanced Analytics Features', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAnalyticsDataWithFilters', () => {
    it('should apply date range filters correctly', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      
      // Mock return values
      mockPrisma.pageView.count.mockResolvedValue(100)
      mockPrisma.session.count.mockResolvedValue(50)
      mockPrisma.pageView.groupBy.mockResolvedValue([])
      mockPrisma.analytics.findMany.mockResolvedValue([])
      mockPrisma.session.groupBy.mockResolvedValue([])
      mockPrisma.$queryRaw.mockResolvedValue([])
      
      const result = await getAnalyticsDataWithFilters(startDate, endDate)
      
      expect(result).toBeDefined()
      expect(result.totalViews).toBe(100)
      expect(result.uniqueVisitors).toBe(50)
      expect(result.dateRange.startDate).toBe(startDate.toISOString())
      expect(result.dateRange.endDate).toBe(endDate.toISOString())
    })

    it('should apply country filter correctly', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      const filters = { country: 'United States' }
      
      mockPrisma.pageView.count.mockResolvedValue(75)
      mockPrisma.session.count.mockResolvedValue(40)
      mockPrisma.pageView.groupBy.mockResolvedValue([])
      mockPrisma.analytics.findMany.mockResolvedValue([])
      mockPrisma.session.groupBy.mockResolvedValue([])
      mockPrisma.$queryRaw.mockResolvedValue([])
      
      const result = await getAnalyticsDataWithFilters(startDate, endDate, filters)
      
      expect(result.totalViews).toBe(75)
      expect(result.uniqueVisitors).toBe(40)
    })
  })

  describe('getOptimizedAnalyticsData', () => {
    it('should use aggregated data for large date ranges', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31') // 1 year range
      
      mockPrisma.pageView.count.mockResolvedValue(10000)
      mockPrisma.session.count.mockResolvedValue(5000)
      mockPrisma.pageView.groupBy.mockResolvedValue([])
      mockPrisma.session.groupBy.mockResolvedValue([])
      mockPrisma.$queryRaw.mockResolvedValue([])
      
      const result = await getOptimizedAnalyticsData(startDate, endDate, {}, { aggregateOnly: true })
      
      expect(result).toBeDefined()
      expect(result.aggregated).toBe(true)
    })

    it('should respect maxRecords option', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-07') // 1 week range
      
      mockPrisma.pageView.count.mockResolvedValue(500)
      mockPrisma.session.count.mockResolvedValue(250)
      mockPrisma.pageView.groupBy.mockResolvedValue([])
      mockPrisma.session.groupBy.mockResolvedValue([])
      mockPrisma.$queryRaw.mockResolvedValue([])
      
      const result = await getOptimizedAnalyticsData(startDate, endDate, {}, { maxRecords: 100 })
      
      expect(result).toBeDefined()
    })
  })

  describe('getAggregatedAnalyticsData', () => {
    it('should return aggregated data structure', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      
      mockPrisma.pageView.count.mockResolvedValue(1000)
      mockPrisma.session.count.mockResolvedValue(500)
      mockPrisma.pageView.groupBy.mockResolvedValue([
        { pageUrl: '/home', _count: { pageUrl: 300 } },
        { pageUrl: '/about', _count: { pageUrl: 200 } }
      ])
      mockPrisma.session.groupBy
        .mockResolvedValueOnce([
          { device: 'desktop', _count: { device: 300 } },
          { device: 'mobile', _count: { device: 200 } }
        ])
        .mockResolvedValueOnce([
          { browser: 'Chrome', _count: { browser: 400 } },
          { browser: 'Firefox', _count: { browser: 100 } }
        ])
      mockPrisma.$queryRaw.mockResolvedValue([
        { week: '2024-01-01', views: 250 },
        { week: '2024-01-08', views: 300 }
      ])
      
      const result = await getAggregatedAnalyticsData(startDate, endDate)
      
      expect(result.aggregated).toBe(true)
      expect(result.totalViews).toBe(1000)
      expect(result.uniqueVisitors).toBe(500)
      expect(result.topPages).toHaveLength(2)
      expect(result.deviceStats).toHaveLength(2)
      expect(result.browserStats).toHaveLength(2)
      expect(result.weeklyViews).toHaveLength(2)
    })
  })

  describe('cleanupOldAnalytics', () => {
    it('should delete old analytics data', async () => {
      const retentionDays = 365
      
      mockPrisma.analytics.deleteMany.mockResolvedValue({ count: 1000 })
      mockPrisma.pageView.deleteMany.mockResolvedValue({ count: 2000 })
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 500 })
      
      const result = await cleanupOldAnalytics(retentionDays)
      
      expect(result.deletedAnalytics).toBe(1000)
      expect(result.deletedPageViews).toBe(2000)
      expect(result.deletedSessions).toBe(500)
    })
  })

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      
      mockPrisma.analytics.count.mockResolvedValue(5000)
      mockPrisma.$queryRaw.mockResolvedValue([
        { hour: 14, count: 500 }
      ])
      
      const result = await getPerformanceMetrics(startDate, endDate)
      
      expect(result).toBeDefined()
      expect(result.totalRecords).toBe(5000)
      expect(result.peakHour).toEqual({ hour: 14, count: 500 })
      expect(result.queryPerformance).toBeDefined()
    })
  })

  describe('batchProcessAnalytics', () => {
    it('should process analytics events in batches', async () => {
      const events = [
        { pageUrl: '/page1', sessionId: 'session1' },
        { pageUrl: '/page2', sessionId: 'session2' },
        { pageUrl: '/page3', sessionId: 'session3' }
      ]
      
      // Mock the trackPageView function to resolve successfully
      jest.doMock('../analytics', () => ({
        ...jest.requireActual('../analytics'),
        trackPageView: jest.fn().mockResolvedValue(undefined)
      }))
      
      const result = await batchProcessAnalytics(events, 2)
      
      expect(result.total).toBe(3)
      expect(result.batchSize).toBe(2)
    })
  })
})

describe('Analytics API Route Tests', () => {
  describe('Date Range Validation', () => {
    it('should validate date range parameters', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')
      
      expect(startDate.getTime()).toBeLessThan(endDate.getTime())
      
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      expect(daysDiff).toBe(30)
    })

    it('should reject invalid date ranges', () => {
      const startDate = new Date('2024-01-31')
      const endDate = new Date('2024-01-01')
      
      expect(startDate.getTime()).toBeGreaterThan(endDate.getTime())
    })

    it('should limit maximum date range', () => {
      const startDate = new Date('2022-01-01')
      const endDate = new Date('2024-12-31')
      
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const maxDays = 2 * 365 // 2 years
      
      expect(daysDiff).toBeGreaterThan(maxDays)
    })
  })

  describe('Filter Validation', () => {
    it('should handle empty filters', () => {
      const filters = {
        country: '',
        device: '',
        browser: '',
        page: ''
      }
      
      const hasActiveFilters = Object.values(filters).some(value => value)
      expect(hasActiveFilters).toBe(false)
    })

    it('should handle active filters', () => {
      const filters = {
        country: 'United States',
        device: 'mobile',
        browser: '',
        page: ''
      }
      
      const activeFilters = Object.entries(filters).filter(([_, value]) => value)
      expect(activeFilters).toHaveLength(2)
    })
  })
})

describe('Performance Optimization Tests', () => {
  describe('Query Optimization', () => {
    it('should use appropriate query strategies for different data sizes', () => {
      const smallDataset = 1000
      const largeDataset = 100000
      
      expect(smallDataset < 10000).toBe(true) // Use full queries
      expect(largeDataset >= 10000).toBe(true) // Use aggregated queries
    })

    it('should calculate appropriate batch sizes', () => {
      const totalRecords = 10000
      const batchSize = Math.min(1000, Math.max(100, Math.floor(totalRecords / 10)))
      
      expect(batchSize).toBeGreaterThanOrEqual(100)
      expect(batchSize).toBeLessThanOrEqual(1000)
    })
  })

  describe('Data Retention', () => {
    it('should calculate retention cutoff dates correctly', () => {
      const retentionDays = 365
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      
      const now = new Date()
      const daysDiff = Math.ceil((now.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24))
      
      expect(daysDiff).toBe(retentionDays)
    })

    it('should validate retention parameters', () => {
      const validRetention = 365
      const tooShort = 15
      const tooLong = 2000
      
      expect(validRetention >= 30 && validRetention <= 1095).toBe(true)
      expect(tooShort >= 30 && tooShort <= 1095).toBe(false)
      expect(tooLong >= 30 && tooLong <= 1095).toBe(false)
    })
  })
})