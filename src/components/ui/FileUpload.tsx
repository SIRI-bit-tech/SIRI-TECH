'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadDropzone, UploadButton } from '@/lib/uploadthing'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react'
import Button from './Button'

export interface UploadedFile {
  url: string
  key: string
  name: string
  size: number
  type?: string
}

interface FileUploadProps {
  endpoint: 'imageUploader' | 'profileImage' | 'resumePdf' | 'fileUploader'
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxFiles?: number
  accept?: string[]
  className?: string
  disabled?: boolean
  showPreview?: boolean
  variant?: 'dropzone' | 'button'
  onUploadStart?: () => void
  onUploadComplete?: (files: UploadedFile[]) => void
  onUploadError?: (error: string) => void
}

export function FileUpload({
  endpoint,
  files,
  onChange,
  maxFiles = 10,
  accept,
  className = '',
  disabled = false,
  showPreview = true,
  variant = 'dropzone',
  onUploadStart,
  onUploadComplete,
  onUploadError
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const canUploadMore = files.length < maxFiles
  const isImageEndpoint = endpoint === 'imageUploader' || endpoint === 'profileImage'

  const handleUploadBegin = useCallback(() => {
    setUploading(true)
    setError(null)
    onUploadStart?.()
  }, [onUploadStart])

  const handleUploadComplete = useCallback((res: any[]) => {
    const newFiles: UploadedFile[] = res.map(file => ({
      url: file.url,
      key: file.key || file.fileKey,
      name: file.name || file.fileName,
      size: file.size || file.fileSize,
      type: file.type
    }))
    
    const updatedFiles = [...files, ...newFiles]
    onChange(updatedFiles)
    onUploadComplete?.(newFiles)
    setUploading(false)
    setUploadProgress({})
  }, [files, onChange, onUploadComplete])

  const handleUploadError = useCallback((uploadError: Error) => {
    const errorMessage = uploadError.message || 'Upload failed. Please try again.'
    setError(errorMessage)
    onUploadError?.(errorMessage)
    setUploading(false)
    setUploadProgress({})
  }, [onUploadError])

  const handleUploadProgress = useCallback((progress: number) => {
    // This would be used if UploadThing supported progress callbacks
    // For now, we'll simulate progress
    setUploadProgress(prev => ({ ...prev, current: progress }))
  }, [])

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onChange(newFiles)
  }, [files, onChange])

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    const newFiles = [...files]
    const [movedFile] = newFiles.splice(fromIndex, 1)
    newFiles.splice(toIndex, 0, movedFile)
    onChange(newFiles)
  }, [files, onChange])

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      moveFile(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image size={20} />
    } else if (['pdf'].includes(extension || '')) {
      return <FileText size={20} />
    } else {
      return <File size={20} />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const UploadComponent = variant === 'dropzone' ? UploadDropzone : UploadButton

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center"
        >
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Upload Area */}
      {canUploadMore && !disabled && (
        <div className="relative">
          {variant === 'dropzone' ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 transition-colors hover:border-purple-400 dark:hover:border-purple-500">
              <UploadDropzone
                endpoint={endpoint}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadBegin={handleUploadBegin}
                appearance={{
                  container: "w-full",
                  uploadIcon: "text-gray-400",
                  label: "text-gray-600 dark:text-gray-400",
                  allowedContent: "text-gray-500 dark:text-gray-500 text-sm",
                  button: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <UploadButton
                endpoint={endpoint}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadBegin={handleUploadBegin}
                appearance={{
                  button: "bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2",
                  allowedContent: "text-gray-500 dark:text-gray-500 text-sm mt-2"
                }}
                content={{
                  button: (
                    <div className="flex items-center space-x-2">
                      <Upload size={16} />
                      <span>Upload Files</span>
                    </div>
                  )
                }}
              />
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
                <Loader2 size={20} className="animate-spin text-purple-600" />
                <span className="text-sm font-medium">Uploading files...</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && showPreview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            {files.length > 1 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag to reorder
              </p>
            )}
          </div>

          <div className={`
            ${isImageEndpoint && files.length > 1 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
              : 'space-y-2'
            }
          `}>
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={`${file.key}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    relative group
                    ${files.length > 1 ? 'cursor-move' : ''}
                    ${draggedIndex === index ? 'opacity-50' : ''}
                    ${isImageEndpoint && files.length > 1 ? '' : 'p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'}
                  `}
                  draggable={files.length > 1}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {isImageEndpoint && files.length > 1 ? (
                    // Image grid layout
                    <>
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      
                      {/* Order Indicator */}
                      <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                    </>
                  ) : (
                    // List layout
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                        {getFileIcon(file.name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Upload Limit Message */}
      {!canUploadMore && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Maximum of {maxFiles} files reached
          </p>
        </div>
      )}
    </div>
  )
}

export default FileUpload