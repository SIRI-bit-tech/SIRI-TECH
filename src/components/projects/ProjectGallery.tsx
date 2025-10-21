'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Project } from '@prisma/client'
import ProjectCard from './ProjectCard'
import GlassmorphismCard from '../glassmorphism/GlassmorphismCard'
import Button from '../ui/Button'

interface ProjectGalleryProps {
  projects: Project[]
  showFilters?: boolean
  showSorting?: boolean
}

type SortOption = 'newest' | 'oldest' | 'title' | 'featured'
type FilterOption = 'all' | string // technology name

const ProjectGallery = ({ 
  projects, 
  showFilters = true, 
  showSorting = true 
}: ProjectGalleryProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Get all unique technologies for filtering
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>()
    projects.forEach(project => {
      project.technologies.forEach(tech => techSet.add(tech))
    })
    return Array.from(techSet).sort()
  }, [projects])

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => project.status === 'PUBLISHED')

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some(tech => 
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply technology filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(project =>
        project.technologies.includes(filterBy)
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'featured':
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [projects, sortBy, filterBy, searchQuery])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const filterVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      {(showFilters || showSorting) && (
        <motion.div
          variants={filterVariants}
          initial="hidden"
          animate="visible"
        >
          <GlassmorphismCard variant="light" className="p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Projects
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by title, description, or technology..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Technology Filter */}
                {showFilters && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Filter by Technology
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={filterBy === 'all' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterBy('all')}
                      >
                        All ({projects.filter(p => p.status === 'PUBLISHED').length})
                      </Button>
                      {allTechnologies.map(tech => {
                        const count = projects.filter(p => 
                          p.status === 'PUBLISHED' && p.technologies.includes(tech)
                        ).length
                        return (
                          <Button
                            key={tech}
                            variant={filterBy === tech ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterBy(tech)}
                          >
                            {tech} ({count})
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Sort Options */}
                {showSorting && (
                  <div className="sm:w-48">
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort by
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title A-Z</option>
                      <option value="featured">Featured First</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </GlassmorphismCard>
        </motion.div>
      )}

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredAndSortedProjects.length} of {projects.filter(p => p.status === 'PUBLISHED').length} projects
          {filterBy !== 'all' && ` filtered by ${filterBy}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {filteredAndSortedProjects.length > 0 ? (
            <motion.div
              key={`${sortBy}-${filterBy}-${searchQuery}`}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {filteredAndSortedProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <GlassmorphismCard variant="light" className="p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Projects Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery || filterBy !== 'all' 
                    ? "Try adjusting your search or filter criteria."
                    : "No projects are currently available."
                  }
                </p>
                {(searchQuery || filterBy !== 'all') && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSearchQuery('')
                      setFilterBy('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </GlassmorphismCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

ProjectGallery.displayName = 'ProjectGallery'

export default ProjectGallery