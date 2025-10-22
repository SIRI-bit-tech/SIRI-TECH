'use client'

import { motion } from 'framer-motion'
import GlassmorphismCard from '../glassmorphism/GlassmorphismCard'

interface Skill {
  name: string
  category: string
  level: number
  icon: string
}

const skills: Skill[] = [
  // Frontend
  { name: 'React', category: 'Frontend', level: 95, icon: '⚛️' },
  { name: 'Next.js', category: 'Frontend', level: 90, icon: '🔺' },
  { name: 'TypeScript', category: 'Frontend', level: 88, icon: '📘' },
  { name: 'Tailwind CSS', category: 'Frontend', level: 92, icon: '🎨' },
  { name: 'Framer Motion', category: 'Frontend', level: 85, icon: '🎭' },
  
  // Backend
  { name: 'Node.js', category: 'Backend', level: 87, icon: '🟢' },
  { name: 'PostgreSQL', category: 'Backend', level: 83, icon: '🐘' },
  { name: 'Prisma', category: 'Backend', level: 89, icon: '🔷' },
  { name: 'REST APIs', category: 'Backend', level: 91, icon: '🔗' },
  
  // Tools & Others
  { name: 'Git', category: 'Tools', level: 93, icon: '📚' },
  { name: 'Docker', category: 'Tools', level: 78, icon: '🐳' },
  { name: 'Vercel', category: 'Tools', level: 86, icon: '▲' },
  { name: 'Figma', category: 'Design', level: 82, icon: '🎨' },
]

const categories = ['Frontend', 'Backend', 'Tools', 'Design']

const SkillsShowcase = () => {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0, 0, 0.2, 1] as const,
      },
    },
  }

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
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
                  💻 Skills & Technologies
                </span>
              </GlassmorphismCard>
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Technical Expertise
            </h2>
            
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              A comprehensive toolkit of modern technologies and frameworks that I use to build 
              exceptional digital experiences and robust applications.
            </p>
          </motion.div>

          {/* Skills Grid by Category */}
          <div className="space-y-12">
            {categories.map((category, categoryIndex) => {
              const categorySkills = skills.filter(skill => skill.category === category)
              
              return (
                <motion.div
                  key={category}
                  variants={itemVariants}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 text-center">
                    {category}
                  </h3>
                  
                  <motion.div
                    className="grid grid-cols-2 xs:grid-cols-3 tablet:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 xs:gap-4"
                    variants={containerVariants}
                  >
                    {categorySkills.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        variants={skillVariants}
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <GlassmorphismCard 
                          variant="medium"
                          className="p-3 xs:p-4 text-center group cursor-pointer touch-manipulation"
                          hover={false}
                        >
                          <div className="space-y-3">
                            {/* Icon */}
                            <motion.div
                              className="text-3xl"
                              whileHover={{ 
                                rotate: [0, -10, 10, -10, 0],
                                transition: { duration: 0.5 }
                              }}
                            >
                              {skill.icon}
                            </motion.div>
                            
                            {/* Skill Name */}
                            <h4 className="font-semibold text-gray-900 dark:text-white text-xs xs:text-sm">
                              {skill.name}
                            </h4>
                            
                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <motion.div
                                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${skill.level}%` }}
                                  transition={{ 
                                    duration: 1.5, 
                                    delay: categoryIndex * 0.2 + index * 0.1,
                                    ease: [0, 0, 0.2, 1] as const
                                  }}
                                  viewport={{ once: true }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {skill.level}%
                              </span>
                            </div>
                          </div>
                        </GlassmorphismCard>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* Additional Info */}
          <motion.div
            variants={itemVariants}
            className="mt-16 text-center"
          >
            <GlassmorphismCard 
              variant="light" 
              className="p-8 max-w-4xl mx-auto"
              animate={false}
            >
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Continuous Learning:
                </span>{' '}
                I'm always exploring new technologies and staying up-to-date with the latest 
                industry trends. Currently diving deeper into AI integration, advanced React patterns, 
                and cloud architecture.
              </p>
            </GlassmorphismCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

SkillsShowcase.displayName = 'SkillsShowcase'

export default SkillsShowcase