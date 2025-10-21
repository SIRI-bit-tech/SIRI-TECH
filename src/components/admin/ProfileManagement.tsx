'use client'

import { useState, useEffect } from 'react'
import { Profile, SocialLinks, Experience, Education } from '@/types'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ProfileForm } from './ProfileForm'
import { SkillsManager } from './SkillsManager'
import { ExperienceManager } from './ExperienceManager'
import { EducationManager } from './EducationManager'
import { SocialLinksManager } from './SocialLinksManager'
import { ResumeManager } from './ResumeManager'
import { User, Briefcase, GraduationCap, Link, FileText, Award } from 'lucide-react'

interface ProfileManagementProps {}

export function ProfileManagement({}: ProfileManagementProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('basic')
  const [saving, setSaving] = useState(false)

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'social', label: 'Social Links', icon: Link },
    { id: 'resume', label: 'Resume', icon: FileText },
  ]

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
      } else {
        console.error('Failed to fetch profile:', data.error)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.data)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'Failed to update profile' }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <GlassmorphismCard className="p-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </GlassmorphismCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <GlassmorphismCard className="p-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-2 rounded-lg transition-colors
                  ${activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </GlassmorphismCard>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'basic' && (
          <ProfileForm
            profile={profile}
            onUpdate={updateProfile}
            saving={saving}
          />
        )}
        
        {activeTab === 'skills' && (
          <SkillsManager
            skills={profile?.skills || []}
            onUpdate={(skills) => updateProfile({ skills })}
            saving={saving}
          />
        )}
        
        {activeTab === 'experience' && (
          <ExperienceManager
            experience={(profile?.experience as unknown as Experience[]) || []}
            onUpdate={(experience) => updateProfile({ experience: experience as any })}
            saving={saving}
          />
        )}
        
        {activeTab === 'education' && (
          <EducationManager
            education={(profile?.education as unknown as Education[]) || []}
            onUpdate={(education) => updateProfile({ education: education as any })}
            saving={saving}
          />
        )}
        
        {activeTab === 'social' && (
          <SocialLinksManager
            socialLinks={(profile?.socialLinks as unknown as SocialLinks) || {}}
            onUpdate={(socialLinks) => updateProfile({ socialLinks: socialLinks as any })}
            saving={saving}
          />
        )}
        
        {activeTab === 'resume' && (
          <ResumeManager
            resumeUrl={profile?.resumeUrl || undefined}
            onUpdate={(resumeUrl) => updateProfile({ resumeUrl })}
            saving={saving}
          />
        )}
      </div>
    </div>
  )
}