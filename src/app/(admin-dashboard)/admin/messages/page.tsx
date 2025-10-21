'use client'

import { useState, useEffect } from 'react'
import { Contact } from '@prisma/client'
import { ContactsInbox } from '@/components/admin/ContactsInbox'
import { ContactDetail } from '@/components/admin/ContactDetail'
import { ApiResponse } from '@/types'

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

export default function MessagesPage() {
  const [contactsData, setContactsData] = useState<ContactsData | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter,
        search: searchQuery
      })

      const response = await fetch(`/api/admin/contacts?${params}`)
      const result: ApiResponse<ContactsData> = await response.json()

      if (result.success && result.data) {
        setContactsData(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch contacts')
      }
    } catch (err) {
      setError('Failed to fetch contacts')
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [currentPage, statusFilter, searchQuery])

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    // Mark as read if it's new
    if (contact.status === 'NEW') {
      updateContactStatus(contact.id, 'READ')
    }
  }

  const updateContactStatus = async (contactId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchContacts()
        if (selectedContact?.id === contactId) {
          setSelectedContact(prev => prev ? { ...prev, status: status as any } : null)
        }
      }
    } catch (error) {
      console.error('Error updating contact status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Contacts List */}
        <div className="lg:col-span-1">
          <ContactsInbox
            contactsData={contactsData}
            loading={loading}
            error={error}
            selectedContact={selectedContact}
            selectedContacts={selectedContacts}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            currentPage={currentPage}
            onContactSelect={handleContactSelect}
            onStatusFilterChange={setStatusFilter}
            onSearchChange={setSearchQuery}
            onPageChange={setCurrentPage}
            onSelectedContactsChange={setSelectedContacts}
            onRefresh={fetchContacts}
          />
        </div>

        {/* Contact Detail */}
        <div className="lg:col-span-2">
          <ContactDetail
            contact={selectedContact}
            onStatusUpdate={updateContactStatus}
            onDelete={() => {
              setSelectedContact(null)
              fetchContacts()
            }}
          />
        </div>
      </div>
    </div>
  )
}