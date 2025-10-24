'use client'

import { useState } from 'react'
import { Contact } from '@prisma/client'
import { 
  Search, 
  Filter, 
  Trash2, 
  RefreshCw, 
  Mail, 
  MailOpen, 
  Reply,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'

interface ContactsData {
  contacts: Contact[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  statusStats: {
    all: number
    NEW: number
    READ: number
    REPLIED: number
  }
}

interface ContactsInboxProps {
  contactsData: ContactsData | null
  loading: boolean
  error: string | null
  selectedContact: Contact | null
  selectedContacts: string[]
  statusFilter: string
  searchQuery: string
  currentPage: number
  onContactSelect: (contact: Contact) => void
  onStatusFilterChange: (status: string) => void
  onSearchChange: (query: string) => void
  onPageChange: (page: number) => void
  onSelectedContactsChange: (ids: string[]) => void
  onRefresh: () => void
}

const statusConfig = {
  all: { label: 'All', icon: Mail, color: 'text-slate-400' },
  NEW: { label: 'New', icon: Mail, color: 'text-blue-400' },
  READ: { label: 'Read', icon: MailOpen, color: 'text-yellow-400' },
  REPLIED: { label: 'Replied', icon: Reply, color: 'text-green-400' }
}

export function ContactsInbox({
  contactsData,
  loading,
  error,
  selectedContact,
  selectedContacts,
  statusFilter,
  searchQuery,
  currentPage,
  onContactSelect,
  onStatusFilterChange,
  onSearchChange,
  onPageChange,
  onSelectedContactsChange,
  onRefresh
}: ContactsInboxProps) {
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return

    setBulkDeleteLoading(true)
    try {
      const response = await fetch(`/api/admin/contacts?ids=${selectedContacts.join(',')}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onSelectedContactsChange([])
        onRefresh()
      }
    } catch (error) {
      console.error('Error deleting contacts:', error)
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const toggleContactSelection = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      onSelectedContactsChange(selectedContacts.filter(id => id !== contactId))
    } else {
      onSelectedContactsChange([...selectedContacts, contactId])
    }
  }

  const toggleSelectAll = () => {
    if (!contactsData?.contacts) return
    
    if (selectedContacts.length === contactsData.contacts.length) {
      onSelectedContactsChange([])
    } else {
      onSelectedContactsChange(contactsData.contacts.map(c => c.id))
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <GlassmorphismCard className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = contactsData?.statusStats[status as keyof typeof contactsData.statusStats] || 0
            const isActive = statusFilter === status
            
            return (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className={`
                  flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors
                  ${isActive 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }
                `}
              >
                <config.icon size={14} className={`mr-1.5 ${config.color}`} />
                {config.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Bulk Actions */}
        {selectedContacts.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
            <span className="text-sm text-slate-300">
              {selectedContacts.length} selected
            </span>
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              size="sm"
              disabled={bulkDeleteLoading}
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              {bulkDeleteLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2 size={14} />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-400">{error}</p>
          </div>
        ) : !contactsData?.contacts.length ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">No messages found</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Select All */}
            <div className="p-3 border-b border-slate-700/30">
              <label className="flex items-center text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={selectedContacts.length === contactsData.contacts.length}
                  onChange={toggleSelectAll}
                  className="mr-2 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                />
                Select all
              </label>
            </div>

            {/* Contact List */}
            {contactsData.contacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id
              const isChecked = selectedContacts.includes(contact.id)
              const StatusIcon = statusConfig[contact.status].icon

              return (
                <div
                  key={contact.id}
                  className={`
                    p-4 border-b border-slate-700/30 cursor-pointer transition-colors
                    ${isSelected ? 'bg-purple-600/10 border-purple-500/30' : 'hover:bg-slate-700/30'}
                  `}
                  onClick={() => onContactSelect(contact)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleContactSelection(contact.id)
                      }}
                      className="mt-1 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                    />
                    
                    <StatusIcon 
                      size={16} 
                      className={`mt-1 ${statusConfig[contact.status].color}`} 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-white truncate">
                          {contact.name}
                        </h3>
                        <span className="text-xs text-slate-400">
                          {formatDate(contact.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400 mb-1">{contact.email}</p>
                      
                      {contact.subject && (
                        <p className="text-sm text-slate-300 truncate mb-1">
                          {contact.subject}
                        </p>
                      )}
                      
                      <p className="text-xs text-slate-400 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {contact.message}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {contactsData && contactsData.pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              Page {contactsData.pagination.page} of {contactsData.pagination.totalPages}
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!contactsData.pagination.hasPrev}
                variant="ghost"
                size="sm"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!contactsData.pagination.hasNext}
                variant="ghost"
                size="sm"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </GlassmorphismCard>
  )
}