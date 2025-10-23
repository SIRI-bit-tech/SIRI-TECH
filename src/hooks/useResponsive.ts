'use client'

import { useState, useEffect } from 'react'

interface BreakpointConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  tablet: number
  'tablet-lg': number
}

const breakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  tablet: 768,
  'tablet-lg': 1024,
}

export type Breakpoint = keyof BreakpointConfig

export interface ResponsiveState {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2xl: boolean
  isTabletPortrait: boolean
  isTabletLandscape: boolean
  currentBreakpoint: Breakpoint
}

export function useResponsive(): ResponsiveState {
  const [windowSize, setWindowSize] = useState<{
    width: number
    height: number
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Set initial size

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { width, height } = windowSize

  // Determine current breakpoint
  const getCurrentBreakpoint = (): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    if (width >= breakpoints.xs) return 'xs'
    return 'xs'
  }

  return {
    width,
    height,
    isMobile: width < breakpoints.tablet,
    isTablet: width >= breakpoints.tablet && width < breakpoints['tablet-lg'],
    isDesktop: width >= breakpoints['tablet-lg'],
    isXs: width >= breakpoints.xs,
    isSm: width >= breakpoints.sm,
    isMd: width >= breakpoints.md,
    isLg: width >= breakpoints.lg,
    isXl: width >= breakpoints.xl,
    is2xl: width >= breakpoints['2xl'],
    isTabletPortrait: width >= breakpoints.tablet && width < breakpoints['tablet-lg'] && height > width,
    isTabletLandscape: width >= breakpoints.tablet && width < breakpoints['tablet-lg'] && width > height,
    currentBreakpoint: getCurrentBreakpoint(),
  }
}

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive()
  return width >= breakpoints[breakpoint]
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}