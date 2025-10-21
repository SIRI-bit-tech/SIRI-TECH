'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { ProjectsTable } from '@/components/admin/ProjectsTable'
import { Project } from '@prisma/client'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateProject = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
  }

  const handleDeleteProject = (project: Project) => {
    setDeleteConfirmProject(project)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmProject) return

    try {
      const response = await fetch(`/api/admin/projects/${deleteConfirmProject.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProjects()
        setDeleteConfirmProject(null)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleProjectSaved = () => {
    fetchProjects()
    setIsCreateModalOpen(false)
    setEditingProject(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your portfolio projects
          </p>
        </div>
        <Button
          onClick={handleCreateProject}
          variant="primary"
          size="md"
        >
          Create Project
        </Button>
      </div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProjectsTable
          projects={projects}
          loading={loading}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onRefresh={fetchProjects}
        />
      </motion.div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        size="xl"
        variant="glass"
      >
        <ProjectForm
          onSave={handleProjectSaved}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        size="xl"
        variant="glass"
      >
        {editingProject && (
          <ProjectForm
            project={editingProject}
            onSave={handleProjectSaved}
            onCancel={() => setEditingProject(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmProject}
        onClose={() => setDeleteConfirmProject(null)}
        title="Delete Project"
        size="md"
        variant="glass"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete "{deleteConfirmProject?.title}"? This action cannot be undone.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmProject(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}