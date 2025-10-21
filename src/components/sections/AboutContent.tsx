'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Profile, SocialLinks } from '@/types'
// Using emoji icons to match project style

const AboutContent = () => {
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

  const socialLinks = profile.socialLinks as SocialLinks

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          About Me
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get to know more about my journey, skills, and passion for web development
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Image and Basic Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <GlassmorphismCard className="p-6 text-center">
            {profile.profileImage && (
              <div className="relative w-48 h-48 mx-auto mb-6">
                <Image
                  src={profile.profileImage}
                  alt={profile.name}
                  fill
                  className="rounded-full object-cover"
                  priority
                />
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {profile.name}
            </h2>
            <p className="text-lg text-blue-600 dark:text-blue-400 mb-4">
              {profile.title}
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              {profile.email && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">📧</span>
                  <a href={`mailto:${profile.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {profile.email}
                  </a>
                </div>
              )}
              
              {profile.phone && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">📞</span>
                  <a href={`tel:${profile.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {profile.phone}
                  </a>
                </div>
              )}
              
              {profile.location && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">📍</span>
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mt-6">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="GitHub"
                >
                  <span className="text-xl">🔗</span>
                </a>
              )}
              
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="LinkedIn"
                >
                  <span className="text-xl">💼</span>
                </a>
              )}
              
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Twitter"
                >
                  <span className="text-xl">🐦</span>
                </a>
              )}
              
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Website"
                >
                  <span className="text-xl">🌐</span>
                </a>
              )}
            </div>
          </GlassmorphismCard>
        </motion.div>

        {/* Bio and Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Bio Section */}
          <GlassmorphismCard className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              My Story
            </h3>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          </GlassmorphismCard>

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <GlassmorphismCard className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-lg"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </GlassmorphismCard>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AboutContent