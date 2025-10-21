'use client'

import { motion } from 'framer-motion'
import GlassmorphismCard from '../glassmorphism/GlassmorphismCard'
import Button from '../ui/Button'

interface Project {
  id: string
  title: string
  description: string
  shortDescription: string
  technologies: string[]
  image: string
  liveUrl?: string
  githubUrl?: string
  featured: boolean
}

// Mock data for featured projects
const featuredProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce solution built with Next.js, featuring real-time inventory management, secure payment processing, and an intuitive admin dashboard.',
    shortDescription: 'Modern e-commerce platform with real-time features',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'Stripe', 'Tailwind CSS'],
    image: '/api/placeholder/600/400',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/example',
    featured: true,
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates, team collaboration features, and advanced project tracking capabilities.',
    shortDescription: 'Collaborative productivity tool with real-time sync',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Material-UI'],
    image: '/api/placeholder/600/400',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/example',
    featured: true,
  },
  {
    id: '3',
    title: 'Analytics Dashboard',
    description: 'A comprehensive analytics dashboard with interactive charts, real-time data visualization, and customizable reporting features for business intelligence.',
    shortDescription: 'Interactive analytics with beautiful visualizations',
    technologies: ['Vue.js', 'D3.js', 'Express', 'PostgreSQL', 'Chart.js'],
    image: '/api/placeholder/600/400',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/example',
    featured: true,
  },
]

const FeaturedProjects = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0, 0, 0.2, 1] as const,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0, 0, 0.2, 1] as const,
      },
    },
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <motion.div
              className="inline-block mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <GlassmorphismCard 
                variant="light" 
                className="px-6 py-3 inline-block"
                animate={false}
              >
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  🚀 Featured Work
                </span>
              </GlassmorphismCard>
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Projects
            </h2>
            
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              A showcase of my latest work, featuring full-stack applications built with 
              modern technologies and best practices.
            </p>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={cardVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <GlassmorphismCard 
                  variant="medium"
                  className="h-full overflow-hidden group cursor-pointer"
                  hover={false}
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/20 dark:to-purple-900/20 overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-6xl opacity-50"
                        whileHover={{ 
                          rotate: [0, -5, 5, -5, 0],
                          scale: 1.1,
                          transition: { duration: 0.5 }
                        }}
                      >
                        {index === 0 ? '🛒' : index === 1 ? '📋' : '📊'}
                      </motion.div>
                    </div>
                    
                    {/* Overlay on hover */}
                    <motion.div
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <div className="flex space-x-3">
                        {project.liveUrl && (
                          <Button
                            variant="glass"
                            size="sm"
                            className="text-white border-white/30"
                          >
                            Live Demo
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-white/30 hover:bg-white/10"
                          >
                            Code
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {project.shortDescription}
                      </p>
                    </div>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map((tech, techIndex) => (
                        <motion.span
                          key={tech}
                          className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.1 + techIndex * 0.05 
                          }}
                          viewport={{ once: true }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      {project.githubUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-3"
                        >
                          <span className="text-lg">📚</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassmorphismCard>
              </motion.div>
            ))}
          </motion.div>

          {/* View All Projects CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-12"
          >
            <Button
              variant="glass"
              size="lg"
              className="min-w-[200px]"
            >
              View All Projects
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

FeaturedProjects.displayName = 'FeaturedProjects'

export default FeaturedProjects