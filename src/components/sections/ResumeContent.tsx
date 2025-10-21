'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { Profile, Experience, Education } from '@/types'
// Using emoji icons to match project style

const ResumeContent = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        const result = await response.json()
        
        if (result.success) {
          setProfile(result.data)
        } else {
          setError(result.error || 'Failed to load profile')
        }
      } catch (err) {
        setError('Failed to load profile')
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleDownloadResume = () => {
    if (profile?.resumeUrl) {
      window.open(profile.resumeUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassmorphismCard className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Profile not found'}</p>
        </GlassmorphismCard>
      </div>
    )
  }

  const experience = (profile.experience as unknown) as Experience[]
  const education = (profile.education as unknown) as Education[]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Resume
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          My professional experience, education, and skills
        </p>
        
        {profile.resumeUrl && (
          <Button
            onClick={handleDownloadResume}
            variant="primary"
            size="lg"
            className="inline-flex items-center gap-2"
          >
            <span className="text-lg">📄</span>
            Download PDF Resume
          </Button>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Info & Skills */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Personal Information */}
          <GlassmorphismCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="font-medium">Email:</span>
                <a href={`mailto:${profile.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {profile.email}
                </a>
              </div>
              
              {profile.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Phone:</span>
                  <a href={`tel:${profile.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {profile.phone}
                  </a>
                </div>
              )}
              
              {profile.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="text-lg">📍</span>
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </GlassmorphismCard>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <GlassmorphismCard className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Technical Skills
              </h3>
              <div className="space-y-2">
                {profile.skills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="px-3 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </GlassmorphismCard>
          )}
        </motion.div>

        {/* Right Column - Experience & Education */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Professional Experience */}
          {experience && experience.length > 0 && (
            <GlassmorphismCard className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                Professional Experience
              </h3>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-l-4 border-blue-500 pl-6 pb-6 last:pb-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {exp.position}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-lg">📅</span>
                        <span>
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                      {exp.company}
                    </p>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                      {exp.description}
                    </p>
                    
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </GlassmorphismCard>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <GlassmorphismCard className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                Education
              </h3>
              <div className="space-y-6">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-l-4 border-purple-500 pl-6 pb-6 last:pb-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {edu.degree}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-lg">📅</span>
                        <span>
                          {edu.startDate} - {edu.endDate || 'Present'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                      {edu.institution}
                    </p>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {edu.field}
                    </p>
                    
                    {edu.description && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </GlassmorphismCard>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ResumeContent