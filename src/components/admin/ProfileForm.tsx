'use client'

import { useState, useEffect } from 'react'
import { Profile } from '@/types'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'
import { ProfileImageUpload } from './ProfileImageUpload'
import { User, Mail, Phone, MapPin, Briefcase, FileText } from 'lucide-react'

interface ProfileFormProps {
  profile: Profile | null
  onUpdate: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  saving: boolean
}

export function ProfileForm({ profile, onUpdate, saving }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    profileImage: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        title: profile.title || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        profileImage: profile.profileImage || '',
      })
    }
  }, [profile])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const result = await onUpdate(formData)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpdate = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profileImage: imageUrl }))
  }

  return (
    <GlassmorphismCard className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Basic Information</h2>
        <p className="text-slate-400">Update your personal details and profile image</p>
      </div>

      {message && (
        <div className={`
          mb-6 p-4 rounded-lg border
          ${message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
          }
        `}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Profile Image
          </label>
          <ProfileImageUpload
            currentImage={formData.profileImage}
            onImageUpdate={handleImageUpdate}
          />
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <User size={16} className="inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`
                w-full px-4 py-3 bg-slate-800/50 border rounded-lg
                text-white placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-purple-500/50
                ${errors.name ? 'border-red-500/50' : 'border-slate-600/50'}
              `}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Briefcase size={16} className="inline mr-2" />
              Professional Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`
                w-full px-4 py-3 bg-slate-800/50 border rounded-lg
                text-white placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-purple-500/50
                ${errors.title ? 'border-red-500/50' : 'border-slate-600/50'}
              `}
              placeholder="e.g., Full Stack Developer"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`
                w-full px-4 py-3 bg-slate-800/50 border rounded-lg
                text-white placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-purple-500/50
                ${errors.email ? 'border-red-500/50' : 'border-slate-600/50'}
              `}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg
                         text-white placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg
                         text-white placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="City, State, Country"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <FileText size={16} className="inline mr-2" />
            Bio *
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={6}
            className={`
              w-full px-4 py-3 bg-slate-800/50 border rounded-lg
              text-white placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
              resize-vertical
              ${errors.bio ? 'border-red-500/50' : 'border-slate-600/50'}
            `}
            placeholder="Write a brief description about yourself, your background, and what you do..."
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-400">{errors.bio}</p>
          )}
          <p className="mt-1 text-sm text-slate-400">
            {formData.bio.length} characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="px-6 py-3"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </GlassmorphismCard>
  )
}