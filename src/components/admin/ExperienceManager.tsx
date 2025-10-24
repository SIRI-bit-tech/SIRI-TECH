'use client'

import { useState, useEffect } from 'react'
import { Experience } from '@/types'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'
import { Plus, Edit, Trash2, Briefcase, Calendar, Building } from 'lucide-react'

interface ExperienceManagerProps {
  experience: Experience[]
  onUpdate: (experience: Experience[]) => Promise<{ success: boolean; error?: string }>
  saving: boolean
}

export function ExperienceManager({ experience, onUpdate, saving }: ExperienceManagerProps) {
  const [experienceList, setExperienceList] = useState<Experience[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setExperienceList(experience || [])
  }, [experience])

  const handleSave = async () => {
    const result = await onUpdate(experienceList)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Experience updated successfully!' })
      setShowForm(false)
      setEditingId(null)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update experience' })
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddExperience = (newExperience: Omit<Experience, 'id'>) => {
    const experience: Experience = {
      ...newExperience,
      id: Date.now().toString(),
    }
    setExperienceList(prev => [...prev, experience])
  }

  const handleEditExperience = (id: string, updatedExperience: Omit<Experience, 'id'>) => {
    setExperienceList(prev => 
      prev.map(exp => 
        exp.id === id 
          ? { ...updatedExperience, id }
          : exp
      )
    )
    setEditingId(null)
  }

  const handleDeleteExperience = (id: string) => {
    setExperienceList(prev => prev.filter(exp => exp.id !== id))
  }

  const hasChanges = JSON.stringify(experienceList) !== JSON.stringify(experience)

  return (
    <GlassmorphismCard className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
          <Briefcase size={20} className="mr-2" />
          Work Experience
        </h2>
        <p className="text-slate-400">Manage your professional work history and achievements</p>
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

      {/* Add New Experience Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Experience
        </Button>
      </div>

      {/* Experience Form */}
      {(showForm || editingId) && (
        <ExperienceForm
          experience={editingId ? experienceList.find(exp => exp.id === editingId) : undefined}
          onSave={editingId ? 
            (data) => handleEditExperience(editingId, data) : 
            handleAddExperience
          }
          onCancel={() => {
            setShowForm(false)
            setEditingId(null)
          }}
        />
      )}

      {/* Experience List */}
      <div className="space-y-4">
        {experienceList.length > 0 ? (
          experienceList.map((exp) => (
            <ExperienceCard
              key={exp.id}
              experience={exp}
              onEdit={() => setEditingId(exp.id)}
              onDelete={() => handleDeleteExperience(exp.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-800/20 rounded-lg border border-slate-600/30">
            <Briefcase size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 mb-2">No work experience added yet</p>
            <p className="text-sm text-slate-500">
              Add your first job experience using the button above
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </GlassmorphismCard>
  )
}

interface ExperienceFormProps {
  experience?: Experience
  onSave: (experience: Omit<Experience, 'id'>) => void
  onCancel: () => void
}

function ExperienceForm({ experience, onSave, onCancel }: ExperienceFormProps) {
  const [formData, setFormData] = useState({
    company: experience?.company || '',
    position: experience?.position || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    description: experience?.description || '',
    technologies: experience?.technologies?.join(', ') || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.company.trim()) newErrors.company = 'Company is required'
    if (!formData.position.trim()) newErrors.position = 'Position is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const experienceData: Omit<Experience, 'id'> = {
      company: formData.company.trim(),
      position: formData.position.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      description: formData.description.trim(),
      technologies: formData.technologies 
        ? formData.technologies.split(',').map(tech => tech.trim()).filter(Boolean)
        : undefined,
    }

    onSave(experienceData)
  }

  return (
    <div className="mb-6 p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
      <h3 className="text-lg font-medium text-white mb-4">
        {experience ? 'Edit Experience' : 'Add New Experience'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Company *
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50
                         ${errors.company ? 'border-red-500/50' : 'border-slate-600/50'}`}
              placeholder="Company name"
            />
            {errors.company && <p className="mt-1 text-sm text-red-400">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Position *
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50
                         ${errors.position ? 'border-red-500/50' : 'border-slate-600/50'}`}
              placeholder="Job title"
            />
            {errors.position && <p className="mt-1 text-sm text-red-400">{errors.position}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Start Date *
            </label>
            <input
              type="month"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50
                         ${errors.startDate ? 'border-red-500/50' : 'border-slate-600/50'}`}
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              End Date
            </label>
            <input
              type="month"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <p className="mt-1 text-xs text-slate-400">Leave empty if current position</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Technologies
          </label>
          <input
            type="text"
            value={formData.technologies}
            onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="React, Node.js, PostgreSQL (comma-separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-vertical
                       ${errors.description ? 'border-red-500/50' : 'border-slate-600/50'}`}
            placeholder="Describe your role, responsibilities, and achievements..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit">
            {experience ? 'Update' : 'Add'} Experience
          </Button>
        </div>
      </form>
    </div>
  )
}

interface ExperienceCardProps {
  experience: Experience
  onEdit: () => void
  onDelete: () => void
}

function ExperienceCard({ experience, onEdit, onDelete }: ExperienceCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + '-01')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  const duration = experience.endDate 
    ? `${formatDate(experience.startDate)} - ${formatDate(experience.endDate)}`
    : `${formatDate(experience.startDate)} - Present`

  return (
    <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{experience.position}</h3>
          <div className="flex items-center text-purple-300 mb-2">
            <Building size={16} className="mr-2" />
            {experience.company}
          </div>
          <div className="flex items-center text-slate-400 text-sm">
            <Calendar size={14} className="mr-2" />
            {duration}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
            title="Edit experience"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete experience"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-slate-300 mb-4 leading-relaxed">
        {experience.description}
      </p>

      {experience.technologies && experience.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {experience.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}