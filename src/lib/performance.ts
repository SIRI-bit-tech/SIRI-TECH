// Performance optimization utilities

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  const fontPreloads = [
    '/fonts/geist-sans.woff2',
    '/fonts/geist-mono.woff2'
  ]

  fontPreloads.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

/**
 * Lazy load images with intersection observer
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      }
    })
  })

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
  })
}

/**
 * Optimize third-party scripts loading
 */
export function loadThirdPartyScripts() {
  if (typeof window === 'undefined') return

  // Load analytics after page load
  window.addEventListener('load', () => {
    // Google Analytics
    if (process.env.NEXT_PUBLIC_GA_ID) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
      script.async = true
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', process.env.NEXT_PUBLIC_GA_ID)
    }
  })
}

/**
 * Prefetch important pages
 */
export function prefetchImportantPages() {
  if (typeof window === 'undefined') return

  const importantPages = ['/projects', '/about', '/contact']
  
  importantPages.forEach(page => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = page
    document.head.appendChild(link)
  })
}

/**
 * Monitor Core Web Vitals
 */
export function monitorCoreWebVitals() {
  if (typeof window === 'undefined') return

  // Monitor Largest Contentful Paint (LCP)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime)
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // Monitor First Input Delay (FID)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    entries.forEach((entry) => {
      console.log('FID:', entry.processingStart - entry.startTime)
    })
  }).observe({ entryTypes: ['first-input'] })

  // Monitor Cumulative Layout Shift (CLS)
  let clsValue = 0
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
        console.log('CLS:', clsValue)
      }
    })
  }).observe({ entryTypes: ['layout-shift'] })
}

/**
 * Optimize images for better performance
 */
export function optimizeImages() {
  if (typeof window === 'undefined') return

  // Add loading="lazy" to images below the fold
  const images = document.querySelectorAll('img')
  images.forEach((img, index) => {
    if (index > 2) { // Skip first 3 images (likely above the fold)
      img.loading = 'lazy'
    }
  })
}

/**
 * Service Worker registration for caching
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Extend Window interface
declare global {
  interface Window {
    dataLayer: any[]
  }
}