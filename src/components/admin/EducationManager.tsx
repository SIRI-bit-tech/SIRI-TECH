'use client'

import { useState, useEffect } from 'react'
import { Education } from '@/types'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'
import { Plus, Edit, Trash2, GraduationCap, Calendar, School } from 'lucide-react'

interface EducationManagerProps {
  education: Education[]
  onUpdate: (education: Education[]) => Promise<{ success: boolean; error?: string }>
  saving: boolean
}

export function EducationManager({ education, onUpdate, saving }: EducationManagerProps) {
  const [educationList, setEducationList] = useState<Education[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setEducationList(education || [])
  }, [education])

  const handleSave = async () => {
    const result = await onUpdate(educationList)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Education updated successfully!' })
      setShowForm(false)
      setEditingId(null)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update education' })
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddEducation = (newEducation: Omit<Education, 'id'>) => {
    const education: Education = {
      ...newEducation,
      id: Date.now().toString(),
    }
    setEducationList(prev => [...prev, education])
  }

  const handleEditEducation = (id: string, updatedEducation: Omit<Education, 'id'>) => {
    setEducationList(prev => 
      prev.map(edu => 
        edu.id === id 
          ? { ...updatedEducation, id }
          : edu
      )
    )
    setEditingId(null)
  }

  const handleDeleteEducation = (id: string) => {
    setEducationList(prev => prev.filter(edu => edu.id !== id))
  }

  const hasChanges = JSON.stringify(educationList) !== JSON.stringify(education)

  return (
    <GlassmorphismCard className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
          <GraduationCap size={20} className="mr-2" />
          Education
        </h2>
        <p className="text-slate-400">Manage your educational background and qualifications</p>
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

      {/* Add New Education Button */}
      <div className="mb-6">
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Education
        </Button>
      </div>

      {/* Education Form */}
      {(showForm || editingId) && (
        <EducationForm
          education={editingId ? educationList.find(edu => edu.id === editingId) : undefined}
          onSave={editingId ? 
            (data) => handleEditEducation(editingId, data) : 
            handleAddEducation
          }
          onCancel={() => {
            setShowForm(false)
            setEditingId(null)
          }}
        />
      )}

      {/* Education List */}
      <div className="space-y-4">
        {educationList.length > 0 ? (
          educationList.map((edu) => (
            <EducationCard
              key={edu.id}
              education={edu}
              onEdit={() => setEditingId(edu.id)}
              onDelete={() => handleDeleteEducation(edu.id)}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-800/20 rounded-lg border border-slate-600/30">
            <GraduationCap size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 mb-2">No education records added yet</p>
            <p className="text-sm text-slate-500">
              Add your educational background using the button above
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

interface EducationFormProps {
  education?: Education
  onSave: (education: Omit<Education, 'id'>) => void
  onCancel: () => void
}

function EducationForm({ education, onSave, onCancel }: EducationFormProps) {
  const [formData, setFormData] = useState({
    institution: education?.institution || '',
    degree: education?.degree || '',
    field: education?.field || '',
    startDate: education?.startDate || '',
    endDate: education?.endDate || '',
    description: education?.description || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.institution.trim()) newErrors.institution = 'Institution is required'
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required'
    if (!formData.field.trim()) newErrors.field = 'Field of study is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const educationData: Omit<Education, 'id'> = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      field: formData.field.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      description: formData.description.trim() || undefined,
    }

    onSave(educationData)
  }

  return (
    <div className="mb-6 p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
      <h3 className="text-lg font-medium text-white mb-4">
        {education ? 'Edit Education' : 'Add New Education'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Institution *
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50
                         ${errors.institution ? 'border-red-500/50' : 'border-slate-600/50'}`}
              placeholder="University or school name"
            />
            {errors.institution && <p className="mt-1 text-sm text-red-400">{errors.institution}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Degree *
            </label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50
                         ${errors.degree ? 'border-red-500/50' : 'border-slate-600/50'}`}
              placeholder="Bachelor's, Master's, PhD, etc."
            />
            {errors.degree && <p className="mt-1 text-sm text-red-400">{errors.degree}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Field of Study *
            </label>
            <input
              type="text"
              value={formData.field}
              onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
              className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50
                         ${errors.field ? 'border-red-500/50' : 'border-slate-600/50'}`}
              placeholder="Computer Science, Engineering, etc."
            />
            {errors.field && <p className="mt-1 text-sm text-red-400">{errors.field}</p>}
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
            <p className="mt-1 text-xs text-slate-400">Leave empty if currently studying</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-vertical"
            placeholder="Notable achievements, coursework, projects, or honors (optional)"
          />
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
            {education ? 'Update' : 'Add'} Education
          </Button>
        </div>
      </form>
    </div>
  )
}

interface EducationCardProps {
  education: Education
  onEdit: () => void
  onDelete: () => void
}

function EducationCard({ education, onEdit, onDelete }: EducationCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + '-01')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  const duration = education.endDate 
    ? `${formatDate(education.startDate)} - ${formatDate(education.endDate)}`
    : `${formatDate(education.startDate)} - Present`

  return (
    <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {education.degree} in {education.field}
          </h3>
          <div className="flex items-center text-purple-300 mb-2">
            <School size={16} className="mr-2" />
            {education.institution}
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
            title="Edit education"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete education"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {education.description && (
        <p className="text-slate-300 leading-relaxed">
          {education.description}
        </p>
      )}
    </div>
  )
}