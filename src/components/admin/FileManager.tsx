'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  Copy, 
  MoreVertical,
  Image,
  FileText,
  File,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import FileUpload, { UploadedFile } from '@/components/ui/FileUpload'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { deleteFiles, formatFileSize, getFileType } from '@/lib/file-utils'

interface FileManagerProps {
  title: string
  description?: string
  endpoint: 'imageUploader' | 'profileImage' | 'resumePdf' | 'fileUploader'
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxFiles?: number
  showPreview?: boolean
  allowBulkOperations?: boolean
  className?: string
}

export function FileManager({
  title,
  description,
  endpoint,
  files,
  onChange,
  maxFiles = 10,
  showPreview = true,
  allowBulkOperations = true,
  className = ''
}: FileManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }, [])

  const handleFileSelect = useCallback((fileKey: string, selected: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(fileKey)
      } else {
        newSet.delete(fileKey)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files.map(file => file.key)))
    }
  }, [files, selectedFiles.size])

  const handleDeleteFile = useCallback(async (fileKey: string) => {
    setDeleting(prev => new Set(prev).add(fileKey))
    
    try {
      const result = await deleteFiles([fileKey])
      
      if (result.success) {
        const newFiles = files.filter(file => file.key !== fileKey)
        onChange(newFiles)
        showMessage('success', 'File deleted successfully')
      } else {
        showMessage('error', result.error || 'Failed to delete file')
      }
    } catch (error) {
      showMessage('error', 'Failed to delete file')
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev)
        newSet.delete(fileKey)
        return newSet
      })
    }
  }, [files, onChange, showMessage])

  const handleBulkDelete = useCallback(async () => {
    if (selectedFiles.size === 0) return
    
    setBulkDeleting(true)
    
    try {
      const fileKeysToDelete = Array.from(selectedFiles)
      const result = await deleteFiles(fileKeysToDelete)
      
      if (result.success) {
        const newFiles = files.filter(file => !selectedFiles.has(file.key))
        onChange(newFiles)
        setSelectedFiles(new Set())
        showMessage('success', `${fileKeysToDelete.length} files deleted successfully`)
      } else {
        showMessage('error', result.error || 'Failed to delete files')
      }
    } catch (error) {
      showMessage('error', 'Failed to delete files')
    } finally {
      setBulkDeleting(false)
    }
  }, [selectedFiles, files, onChange, showMessage])

  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      showMessage('success', 'URL copied to clipboard')
    } catch (error) {
      showMessage('error', 'Failed to copy URL')
    }
  }, [showMessage])

  const handleDownload = useCallback((url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const getFileIcon = (file: UploadedFile) => {
    const type = getFileType(file.name)
    switch (type) {
      case 'image':
        return <Image size={20} className="text-blue-400" />
      case 'pdf':
        return <FileText size={20} className="text-red-400" />
      default:
        return <File size={20} className="text-gray-400" />
    }
  }

  return (
    <GlassmorphismCard className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Upload size={20} className="mr-2" />
            {title}
          </h2>
          
          {allowBulkOperations && files.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              {selectedFiles.size > 0 && (
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  disabled={bulkDeleting}
                >
                  {bulkDeleting ? (
                    <RefreshCw size={14} className="animate-spin mr-1" />
                  ) : (
                    <Trash2 size={14} className="mr-1" />
                  )}
                  Delete ({selectedFiles.size})
                </Button>
              )}
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-slate-400">{description}</p>
        )}
      </div>

      {/* Message Display */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              mb-6 p-4 rounded-lg border flex items-center
              ${message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
              }
            `}
          >
            {message.type === 'success' ? (
              <CheckCircle size={20} className="mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Upload */}
      <div className="mb-6">
        <FileUpload
          endpoint={endpoint}
          files={files}
          onChange={onChange}
          maxFiles={maxFiles}
          showPreview={false}
          variant="dropzone"
          onUploadComplete={(newFiles) => {
            showMessage('success', `${newFiles.length} file(s) uploaded successfully`)
          }}
          onUploadError={(error) => {
            showMessage('error', error)
          }}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              Files ({files.length}/{maxFiles})
            </h3>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={file.key}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Selection Checkbox */}
                    {allowBulkOperations && (
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.key)}
                        onChange={(e) => handleFileSelect(file.key, e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                      />
                    )}

                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {getFileIcon(file)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white truncate">
                          {file.name}
                        </p>
                        <span className="text-xs text-slate-500">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.size)} • {getFileType(file.name)}
                      </p>
                    </div>

                    {/* Preview */}
                    {showPreview && getFileType(file.name) === 'image' && (
                      <div className="flex-shrink-0">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded border border-slate-600"
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => window.open(file.url, '_blank')}
                        variant="outline"
                        size="sm"
                        className="p-2"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </Button>
                      
                      <Button
                        onClick={() => handleDownload(file.url, file.name)}
                        variant="outline"
                        size="sm"
                        className="p-2"
                        title="Download"
                      >
                        <Download size={14} />
                      </Button>
                      
                      <Button
                        onClick={() => handleCopyUrl(file.url)}
                        variant="outline"
                        size="sm"
                        className="p-2"
                        title="Copy URL"
                      >
                        <Copy size={14} />
                      </Button>
                      
                      <Button
                        onClick={() => handleDeleteFile(file.key)}
                        variant="outline"
                        size="sm"
                        className="p-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        disabled={deleting.has(file.key)}
                        title="Delete"
                      >
                        {deleting.has(file.key) ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-12 bg-slate-800/20 rounded-lg border border-slate-600/30">
          <Upload size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400 mb-2">No files uploaded</p>
          <p className="text-sm text-slate-500">
            Upload files using the dropzone above
          </p>
        </div>
      )}
    </GlassmorphismCard>
  )
}

export default FileManager