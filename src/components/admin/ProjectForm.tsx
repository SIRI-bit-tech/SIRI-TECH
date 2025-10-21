'use client'

import { useState, useEffect } from 'react'
import { Project } from '@prisma/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Form from '@/components/ui/Form'
import { ImageUpload } from './ImageUpload'
import { RichTextEditor } from './RichTextEditor'

interface ProjectFormProps {
  project?: Project
  onSave: () => void
  onCancel: () => void
}

interface FormData {
  title: string
  shortDescription: string
  description: string
  technologies: string[]
  images: string[]
  liveUrl: string
  githubUrl: string
  featured: boolean
  status: 'DRAFT' | 'PUBLISHED'
  order: number
}

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    shortDescription: '',
    description: '',
    technologies: [],
    images: [],
    liveUrl: '',
    githubUrl: '',
    featured: false,
    status: 'DRAFT',
    order: 0
  })
  const [techInput, setTechInput] = useState('')
  const [loading, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        shortDescription: project.shortDescription,
        description: project.description,
        technologies: project.technologies,
        images: project.images,
        liveUrl: project.liveUrl || '',
        githubUrl: project.githubUrl || '',
        featured: project.featured,
        status: project.status,
        order: project.order
      })
    }
  }, [project])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.liveUrl && !isValidUrl(formData.liveUrl)) {
      newErrors.liveUrl = 'Please enter a valid URL'
    }

    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const url = project 
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects'
      
      const method = project ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Failed to save project' })
      }
    } catch (error) {
      setErrors({ submit: 'Failed to save project' })
    } finally {
      setSaving(false)
    }
  }

  const handleTechAdd = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }))
      setTechInput('')
    }
  }

  const handleTechRemove = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const handleTechKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTechAdd()
    }
  }

  return (
    <Form onSubmit={handleSubmit} variant="default">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6">
          <Form.Field>
            <Input
              label="Project Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="Enter project title"
              required
            />
          </Form.Field>

          <Form.Field>
            <Input
              label="Short Description"
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              error={!!errors.shortDescription}
              helperText={errors.shortDescription || 'Brief description for project cards'}
              placeholder="Brief description of the project"
              required
            />
          </Form.Field>

          <Form.Field>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Detailed project description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </Form.Field>
        </div>

        {/* Technologies */}
        <Form.Field>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Technologies
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={handleTechKeyPress}
                placeholder="Add technology (e.g., React, TypeScript)"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleTechAdd}
                variant="outline"
                size="md"
              >
                Add
              </Button>
            </div>
            {formData.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleTechRemove(tech)}
                      className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Form.Field>

        {/* Images */}
        <Form.Field>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Images
          </label>
          <ImageUpload
            images={formData.images}
            onChange={(images) => setFormData(prev => ({ ...prev, images }))}
            maxImages={10}
          />
        </Form.Field>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Field>
            <Input
              label="Live URL"
              type="url"
              value={formData.liveUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
              error={!!errors.liveUrl}
              helperText={errors.liveUrl}
              placeholder="https://example.com"
            />
          </Form.Field>

          <Form.Field>
            <Input
              label="GitHub URL"
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
              error={!!errors.githubUrl}
              helperText={errors.githubUrl}
              placeholder="https://github.com/username/repo"
            />
          </Form.Field>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Form.Field>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'DRAFT' | 'PUBLISHED' }))}
              className="w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Form.Field>

          <Form.Field>
            <Input
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              helperText="Display order (lower numbers appear first)"
              min="0"
            />
          </Form.Field>

          <Form.Field>
            <label className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Project
              </span>
            </label>
          </Form.Field>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <Form.Error message={errors.submit} />
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </div>
    </Form>
  )
}