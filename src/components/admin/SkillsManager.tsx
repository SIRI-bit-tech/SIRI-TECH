'use client'

import { useState, useEffect } from 'react'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'
import { Plus, X, Award } from 'lucide-react'

interface SkillsManagerProps {
  skills: string[]
  onUpdate: (skills: string[]) => Promise<{ success: boolean; error?: string }>
  saving: boolean
}

export function SkillsManager({ skills, onUpdate, saving }: SkillsManagerProps) {
  const [skillsList, setSkillsList] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setSkillsList(skills || [])
  }, [skills])

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim()
    if (trimmedSkill && !skillsList.includes(trimmedSkill)) {
      setSkillsList(prev => [...prev, trimmedSkill])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(prev => prev.filter(skill => skill !== skillToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleSave = async () => {
    const result = await onUpdate(skillsList)
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Skills updated successfully!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update skills' })
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const hasChanges = JSON.stringify(skillsList) !== JSON.stringify(skills)

  return (
    <GlassmorphismCard className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
          <Award size={20} className="mr-2" />
          Skills Management
        </h2>
        <p className="text-slate-400">Add and organize your technical and professional skills</p>
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

      {/* Add New Skill */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Add New Skill
        </label>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg
                       text-white placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="e.g., React, Node.js, Python, UI/UX Design..."
          />
          <Button
            onClick={handleAddSkill}
            disabled={!newSkill.trim() || skillsList.includes(newSkill.trim())}
            className="px-4 py-3"
          >
            <Plus size={16} className="mr-2" />
            Add
          </Button>
        </div>
        {newSkill.trim() && skillsList.includes(newSkill.trim()) && (
          <p className="mt-2 text-sm text-yellow-400">This skill is already in your list</p>
        )}
      </div>

      {/* Skills List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Your Skills ({skillsList.length})
          </h3>
          {skillsList.length > 0 && (
            <p className="text-sm text-slate-400">
              Click the × to remove a skill
            </p>
          )}
        </div>

        {skillsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skillsList.map((skill, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg
                          border border-slate-600/30 hover:border-slate-500/50 transition-colors"
              >
                <span className="text-white font-medium">{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Remove skill"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800/20 rounded-lg border border-slate-600/30">
            <Award size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 mb-2">No skills added yet</p>
            <p className="text-sm text-slate-500">
              Add your first skill using the form above
            </p>
          </div>
        )}
      </div>

      {/* Skill Categories Suggestion */}
      <div className="mb-6 bg-slate-800/20 rounded-lg p-4 border border-slate-600/30">
        <h4 className="text-white font-medium mb-3">Skill Categories to Consider</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="text-purple-300 font-medium mb-2">Technical Skills</h5>
            <ul className="text-slate-400 space-y-1">
              <li>• Programming Languages (JavaScript, Python, etc.)</li>
              <li>• Frameworks & Libraries (React, Vue, Angular, etc.)</li>
              <li>• Databases (PostgreSQL, MongoDB, etc.)</li>
              <li>• Tools & Platforms (Docker, AWS, Git, etc.)</li>
            </ul>
          </div>
          <div>
            <h5 className="text-purple-300 font-medium mb-2">Soft Skills</h5>
            <ul className="text-slate-400 space-y-1">
              <li>• Communication & Collaboration</li>
              <li>• Problem Solving & Critical Thinking</li>
              <li>• Project Management</li>
              <li>• Leadership & Mentoring</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3"
          >
            {saving ? 'Saving...' : 'Save Skills'}
          </Button>
        </div>
      )}
    </GlassmorphismCard>
  )
}