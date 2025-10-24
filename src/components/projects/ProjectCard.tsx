'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Project } from '@prisma/client'
import GlassmorphismCard from '../glassmorphism/GlassmorphismCard'
import Button from '../ui/Button'

interface ProjectCardProps {
  project: Project
  index?: number
}

const ProjectCard = ({ project, index = 0 }: ProjectCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0, 0, 0.2, 1] as const,
      },
    },
  }

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <GlassmorphismCard 
        variant="medium"
        className="h-full overflow-hidden group cursor-pointer"
        hover={false}
      >
        {/* Project Image */}
        <div className="relative h-48 xs:h-52 sm:h-56 tablet:h-48 lg:h-56 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 overflow-hidden">
          {project.images && project.images.length > 0 ? (
            <motion.div
              className="relative w-full h-full"
              variants={imageVariants}
              whileHover="hover"
            >
              <Image
                src={project.images[0]}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          ) : (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Project Status Badge */}
          {project.featured && (
            <motion.div
              className="absolute top-3 left-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <GlassmorphismCard 
                variant="dark"
                className="px-3 py-1"
                animate={false}
              >
                <span className="text-xs font-medium text-white">
                  ⭐ Featured
                </span>
              </GlassmorphismCard>
            </motion.div>
          )}
          
          {/* Overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100"
            variants={overlayVariants}
            initial="hidden"
            whileHover="visible"
          >
            <div className="flex space-x-3">
              <Link href={`/projects/${project.slug}`}>
                <Button
                  variant="glass"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/20"
                >
                  View Details
                </Button>
              </Link>
              {project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Project Content */}
        <div className="p-6 space-y-4">
          <div>
            <Link href={`/projects/${project.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                {project.title}
              </h3>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
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
                  delay: index * 0.05 + techIndex * 0.05 
                }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
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
            <Link href={`/projects/${project.slug}`} className="flex-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full touch-manipulation min-h-[44px]"
              >
                View Details
              </Button>
            </Link>
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 touch-manipulation min-h-[44px] min-w-[44px]"
                  title="View Source Code"
                >
                  <span className="text-lg">📚</span>
                </Button>
              </a>
            )}
          </div>
        </div>
      </GlassmorphismCard>
    </motion.div>
  )
}

ProjectCard.displayName = 'ProjectCard'

export default ProjectCard