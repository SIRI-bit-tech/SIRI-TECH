'use client'

import { useState } from 'react'
import { Contact } from '@prisma/client'
import { 
  Mail, 
  MailOpen, 
  Reply, 
  Trash2, 
  ExternalLink,
  Calendar,
  User,
  MessageSquare
} from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

interface ContactDetailProps {
  contact: Contact | null
  onStatusUpdate: (contactId: string, status: string) => void
  onDelete: () => void
}

const statusConfig = {
  NEW: { label: 'New', icon: Mail, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  READ: { label: 'Read', icon: MailOpen, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  REPLIED: { label: 'Replied', icon: Reply, color: 'text-green-400', bgColor: 'bg-green-400/10' }
}

export function ContactDetail({ contact, onStatusUpdate, onDelete }: ContactDetailProps) {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!contact) {
    return (
      <GlassmorphismCard className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-400">Select a message to view details</p>
        </div>
      </GlassmorphismCard>
    )
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      await onStatusUpdate(contact.id, newStatus)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/contacts/${contact.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onDelete()
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleReply = () => {
    const subject = contact.subject 
      ? `Re: ${contact.subject}` 
      : 'Re: Your message from portfolio website'
    
    const body = `Hi ${contact.name},\n\nThank you for your message.\n\n---\nOriginal message:\n${contact.message}`
    
    const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')
    
    // Mark as replied
    if (contact.status !== 'REPLIED') {
      handleStatusUpdate('REPLIED')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const StatusIcon = statusConfig[contact.status].icon

  return (
    <GlassmorphismCard className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <StatusIcon size={20} className={statusConfig[contact.status].color} />
            <div>
              <h2 className="text-xl font-semibold text-white">{contact.name}</h2>
              <p className="text-slate-400">{contact.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Status Badge */}
            <span className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${statusConfig[contact.status].bgColor} ${statusConfig[contact.status].color}
            `}>
              {statusConfig[contact.status].label}
            </span>
          </div>
        </div>

        {/* Subject */}
        {contact.subject && (
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white">{contact.subject}</h3>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center space-x-6 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>Received {formatDate(contact.createdAt)}</span>
          </div>
          {contact.updatedAt !== contact.createdAt && (
            <div className="flex items-center space-x-2">
              <span>Updated {formatDate(contact.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-3">
            <User size={16} className="text-slate-400" />
            <span className="text-sm text-slate-400">Message from {contact.name}</span>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {contact.message}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          {/* Status Actions */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400 mr-2">Mark as:</span>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={updating || contact.status === status}
                variant={contact.status === status ? 'primary' : 'ghost'}
                size="sm"
              >
                {updating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <config.icon size={14} className="mr-1" />
                    {config.label}
                  </>
                )}
              </Button>
            ))}
          </div>

          {/* Primary Actions */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleReply}
              variant="primary"
              size="sm"
            >
              <Reply size={16} className="mr-2" />
              Reply
              <ExternalLink size={12} className="ml-1" />
            </Button>
            
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              {deleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2 size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </GlassmorphismCard>
  )
}