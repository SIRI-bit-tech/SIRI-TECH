'use client'

import { useState, useEffect } from 'react'
import { SocialLinks } from '@/types'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Globe, 
  Link as LinkIcon,
  ExternalLink 
} from 'lucide-react'

interface SocialLinksManagerProps {
  socialLinks: SocialLinks
  onUpdate: (socialLinks: SocialLinks) => Promise<{ success: boolean; error?: string }>
  saving: boolean
}

export function SocialLinksManager({ socialLinks, onUpdate, saving }: SocialLinksManagerProps) {
  const [links, setLinks] = useState<SocialLinks>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const socialPlatforms = [
    {
      key: 'github' as keyof SocialLinks,
      label: 'GitHub',
      icon: Github,
      placeholder: 'https://github.com/yourusername',
      description: 'Your GitHub profile URL'
    },
    {
      key: 'linkedin' as keyof SocialLinks,
      label: 'LinkedIn',
      icon: Linkedin,
      placeholder: 'https://linkedin.com/in/yourprofile',
      description: 'Your LinkedIn profile URL'
    },
    {
      key: 'twitter' as keyof SocialLinks,
      label: 'Twitter/X',
      icon: Twitter,
      placeholder: 'https://twitter.com/yourusername',
      description: 'Your Twitter/X profile URL'
    },
    {
      key: 'email' as keyof SocialLinks,
      label: 'Email',
      icon: Mail,
      placeholder: 'your.email@example.com',
      description: 'Your contact email address'
    },
    {
      key: 'website' as keyof SocialLinks,
      label: 'Personal Website',
      icon: Globe,
      placeholder: 'https://yourwebsite.com',
      description: 'Your personal website or portfolio URL'
    },
  ]

  useEffect(() => {
    setLinks(socialLinks || {})
  }, [socialLinks])

  const validateUrl = (url: string, platform: string) => {
    if (!url) return true // Empty URLs are allowed

    // Email validation
    if (platform === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(url)
    }

    // URL validation
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    Object.entries(links).forEach(([platform, url]) => {
      if (url && !validateUrl(url, platform)) {
        if (platform === 'email') {
          newErrors[platform] = 'Please enter a valid email address'
        } else {
          newErrors[platform] = 'Please enter a valid URL'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (platform: keyof SocialLinks, value: string) => {
    setLinks(prev => ({ ...prev, [platform]: value }))
    if (errors[platform]) {
      setErrors(prev => ({ ...prev, [platform]: '' }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    // Filter out empty values
    const filteredLinks = Object.fromEntries(
      Object.entries(links).filter(([_, value]) => value && value.trim())
    )

    const result = await onUpdate(filteredLinks)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Social links updated successfully!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update social links' })
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const hasChanges = JSON.stringify(links) !== JSON.stringify(socialLinks)

  return (
    <GlassmorphismCard className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
          <LinkIcon size={20} className="mr-2" />
          Social Links
        </h2>
        <p className="text-slate-400">
          Add your social media profiles and contact information
        </p>
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

      <div className="space-y-6">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon
          const value = links[platform.key] || ''
          
          return (
            <div key={platform.key}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Icon size={16} className="inline mr-2" />
                {platform.label}
              </label>
              <div className="relative">
                <input
                  type={platform.key === 'email' ? 'email' : 'url'}
                  value={value}
                  onChange={(e) => handleInputChange(platform.key, e.target.value)}
                  className={`
                    w-full px-4 py-3 bg-slate-800/50 border rounded-lg
                    text-white placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                    ${errors[platform.key] ? 'border-red-500/50' : 'border-slate-600/50'}
                  `}
                  placeholder={platform.placeholder}
                />
                {value && !errors[platform.key] && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <ExternalLink size={16} className="text-green-400" />
                  </div>
                )}
              </div>
              {errors[platform.key] && (
                <p className="mt-1 text-sm text-red-400">{errors[platform.key]}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">{platform.description}</p>
            </div>
          )
        })}
      </div>

      {/* Preview Section */}
      <div className="mt-8 p-6 bg-slate-800/20 rounded-lg border border-slate-600/30">
        <h3 className="text-lg font-medium text-white mb-4">Preview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon
            const value = links[platform.key]
            
            if (!value) return null

            return (
              <div
                key={platform.key}
                className="flex items-center p-3 bg-slate-800/30 rounded-lg border border-slate-600/30"
              >
                <Icon size={20} className="text-purple-400 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{platform.label}</p>
                  <p className="text-slate-400 text-xs truncate">
                    {platform.key === 'email' ? value : new URL(value).hostname}
                  </p>
                </div>
                <ExternalLink size={14} className="text-slate-500 ml-2" />
              </div>
            )
          })}
        </div>
        
        {Object.values(links).every(value => !value) && (
          <div className="text-center py-8">
            <LinkIcon size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No social links added yet</p>
            <p className="text-sm text-slate-500">
              Add your social media profiles above to see the preview
            </p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-slate-800/20 rounded-lg border border-slate-600/30">
        <h4 className="text-white font-medium mb-3">Tips for Social Links</h4>
        <ul className="text-sm text-slate-400 space-y-2">
          <li>• Use complete URLs including https:// for websites</li>
          <li>• Make sure your profiles are public and professional</li>
          <li>• Keep your GitHub repositories updated and well-documented</li>
          <li>• Use a professional email address for contact</li>
          <li>• Consider adding a personal website to showcase your work</li>
        </ul>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || Object.keys(errors).length > 0}
            className="px-6 py-3"
          >
            {saving ? 'Saving...' : 'Save Social Links'}
          </Button>
        </div>
      )}
    </GlassmorphismCard>
  )
}