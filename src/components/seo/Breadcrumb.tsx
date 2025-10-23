import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbSchema } from '@/lib/seo'

interface BreadcrumbItem {
  name: string
  url: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const allItems = [
    { name: 'Home', url: '/' },
    ...items
  ]

  return (
    <>
      <nav 
        className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-2">
          {allItems.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" aria-hidden="true" />
              )}
              
              {index === 0 ? (
                <Link 
                  href={item.url}
                  className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label="Go to homepage"
                >
                  <Home className="w-4 h-4" />
                  <span className="sr-only">{item.name}</span>
                </Link>
              ) : item.current || index === allItems.length - 1 ? (
                <span 
                  className="text-gray-900 dark:text-white font-medium"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateBreadcrumbSchema(allItems)
        }}
      />
    </>
  )
}