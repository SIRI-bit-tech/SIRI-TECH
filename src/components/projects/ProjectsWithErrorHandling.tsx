'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ProjectCard } from '@/components/projects'
import { ProjectsPageSkeleton } from '@/components/ui/PageSkeletons'
import { ErrorDisplay, NetworkError, ServerError } from '@/components/ui/ErrorDisplay'
import { useApiGet } from '@/hooks/useApiWithRetry'
import { useErrorToast } from '@/components/ui/Toast'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { Project } from '@/types'

interface ProjectsWithErrorHandlingProps {
  initialProjects?: Project[]
  showFilters?: boolean
}

export default function ProjectsWithErrorHandling({ 
  initialProjects = [],
  showFilters = true 
}: ProjectsWithErrorHandlingProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [filter, setFilter] = useState<string>('all')
  const [hasInitialLoad, setHasInitialLoad] = useState(initialProjects.length > 0)

  const showErrorToast = useErrorToast()
  
  const { 
    data, 
    loading, 
    error, 
    get, 
    retry, 
    retryCount 
  } = useApiGet<{ data: Project[] }>()

  // Load projects if not provided initially
  useEffect(() => {
    if (!hasInitialLoad) {
      loadProjects()
    }
  }, [hasInitialLoad])

  // Update projects when API data changes
  useEffect(() => {
    if (data?.data) {
      setProjects(data.data)
      setHasInitialLoad(true)
    }
  }, [data])

  const loadProjects = async (filterType?: string) => {
    const params = new URLSearchParams()
    if (filterType && filterType !== 'all') {
      params.append('technology', filterType)
    }
    
    const url = `/api/projects${params.toString() ? `?${params.toString()}` : ''}`
    
    try {
      await get(url)
    } catch (err) {
      showErrorToast(
        'Failed to load projects. Please try again.',
        'Loading Error',
        {
          action: {
            label: 'Retry',
            onClick: () => loadProjects(filterType),
          },
          duration: 8000,
        }
      )
    }
  }

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    loadProjects(newFilter)
  }

  // Get unique technologies for filters
  const technologies = Array.from(
    new Set(projects.flatMap(project => project.technologies))
  ).sort()

  // Filter projects based on selected filter
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.technologies.includes(filter))

  // Show loading skeleton on initial load
  if (loading && !hasInitialLoad) {
    return <ProjectsPageSkeleton />
  }

  // Show error state if no projects and there's an error
  if (error && projects.length === 0) {
    if (error.includes('network') || error.includes('fetch')) {
      return <NetworkError onRetry={retry} className="max-w-md mx-auto" />
    }
    
    if (error.includes('500') || error.includes('server')) {
      return <ServerError onRetry={retry} className="max-w-md mx-auto" />
    }
    
    return (
      <ErrorDisplay
        error={error}
        title="Failed to Load Projects"
        action={{
          label: retryCount > 0 ? `Retry (${retryCount + 1})` : 'Retry',
          onClick: retry,
        }}
        className="max-w-md mx-auto"
      />
    )
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Projects component error:', error, errorInfo)
        showErrorToast(
          'An error occurred while displaying projects.',
          'Component Error'
        )
      }}
    >
      <div className="space-y-8">
        {/* Filter Buttons */}
        {showFilters && technologies.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-glass-light dark:bg-glass-dark text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/20'
              }`}
              disabled={loading}
            >
              All Projects ({projects.length})
            </motion.button>
            
            {technologies.map((tech) => {
              const count = projects.filter(p => p.technologies.includes(tech)).length
              return (
                <motion.button
                  key={tech}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilterChange(tech)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === tech
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-glass-light dark:bg-glass-dark text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/20'
                  }`}
                  disabled={loading}
                >
                  {tech} ({count})
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Loading indicator for filter changes */}
        {loading && hasInitialLoad && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Filtering projects...</span>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1,
                  layout: { duration: 0.3 }
                }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-600">
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'No Projects Found' : `No ${filter} Projects`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'There are no projects to display at the moment.'
                  : `No projects found using ${filter}. Try a different filter.`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => handleFilterChange('all')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                >
                  View All Projects →
                </button>
              )}
            </motion.div>
          )
        )}

        {/* Error display for partial failures */}
        {error && projects.length > 0 && (
          <ErrorDisplay
            error="Some projects may not be displayed due to a loading error."
            variant="banner"
            size="sm"
            action={{
              label: 'Refresh',
              onClick: () => loadProjects(filter),
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}