'use client'

import { motion } from 'framer-motion'
import Button from '../ui/Button'
import GlassmorphismCard from '../glassmorphism/GlassmorphismCard'
import { Hand } from 'lucide-react'

const HeroSection = () => {
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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1] as const,
      },
    },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-100/10 to-accent-100/10 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 4 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Greeting */}
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <GlassmorphismCard 
                variant="light" 
                className="px-6 py-3 inline-block"
                animate={false}
              >
                <span className="text-primary-600 dark:text-primary-400 font-medium text-lg inline-flex items-center gap-2">
                  <Hand className="h-4 w-4" />
                  Hello, I'm
                </span>
              </GlassmorphismCard>
            </motion.div>

            {/* Name */}
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                John Doe
              </span>
            </motion.h1>

            {/* Title */}
            <motion.h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-700 dark:text-gray-300"
              variants={itemVariants}
            >
              Full-Stack Developer
            </motion.h2>

            {/* Description */}
            <motion.p 
              className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
              variants={itemVariants}
            >
              I craft exceptional digital experiences with modern web technologies. 
              Passionate about clean code, innovative solutions, and bringing ideas to life 
              through thoughtful design and robust development.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              variants={itemVariants}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto min-w-[200px]"
              >
                View My Work
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Get In Touch
              </Button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="pt-16"
              variants={itemVariants}
            >
              <motion.div
                className="flex flex-col items-center space-y-2 text-gray-500 dark:text-gray-400"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-sm font-medium">Scroll to explore</span>
                <motion.div
                  className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="w-1 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mt-2"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

HeroSection.displayName = 'HeroSection'

export default HeroSection