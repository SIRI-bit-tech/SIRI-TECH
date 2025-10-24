'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadDropzone } from '@/lib/uploadthing'
import Button from '@/components/ui/Button'
import { deleteFileByUrl, extractFileKey } from '@/lib/file-utils'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleUploadComplete = (res: any[]) => {
    const newImages = res.map(file => file.url)
    onChange([...images, ...newImages])
    setUploading(false)
  }

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error)
    setUploading(false)
  }

  const removeImage = async (index: number) => {
    const imageUrl = images[index]
    
    // Delete from UploadThing
    const result = await deleteFileByUrl(imageUrl)
    if (!result.success) {
      console.error('Failed to delete file from UploadThing:', result.error)
      // Continue with local removal even if remote deletion fails
    }
    
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const canUploadMore = images.length < maxImages

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={() => setUploading(true)}
            appearance={{
              container: "w-full",
              uploadIcon: "text-gray-400",
              label: "text-gray-600 dark:text-gray-400",
              allowedContent: "text-gray-500 dark:text-gray-500 text-sm",
              button: "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            }}
          />
          {uploading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Uploading images...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Images ({images.length}/{maxImages})
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Drag to reorder
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={`${image}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className={`relative group cursor-move ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={image}
                      alt={`Project image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  
                  {/* Order Indicator */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
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
            Maximum of {maxImages} images reached
          </p>
        </div>
      )}
    </div>
  )
}