'use client'

import { useState } from 'react'
import { UploadButton } from '@/lib/uploadthing'
import { Camera, X, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProfileImageUploadProps {
  currentImage?: string
  onImageUpdate: (imageUrl: string) => void
}

export function ProfileImageUpload({ currentImage, onImageUpdate }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = (res: any) => {
    if (res && res[0]) {
      onImageUpdate(res[0].url)
      setError(null)
    }
    setUploading(false)
  }

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error)
    setError('Failed to upload image. Please try again.')
    setUploading(false)
  }

  const handleRemoveImage = () => {
    onImageUpdate('')
  }

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          {currentImage ? (
            <div className="relative">
              <img
                src={currentImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-600/50"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 
                          rounded-full text-white transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-700/50 border-2 border-slate-600/50 
                           flex items-center justify-center">
              <User size={32} className="text-slate-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">Profile Picture</h4>
          <p className="text-sm text-slate-400 mb-3">
            Upload a professional photo. Recommended size: 400x400px
          </p>
          
          {error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center space-x-3">
            {uploading ? (
              <div className="flex items-center space-x-2 text-slate-400">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Uploading...</span>
              </div>
            ) : (
              <UploadButton
                endpoint="profileImage"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadBegin={() => {
                  setUploading(true)
                  setError(null)
                }}
                appearance={{
                  button: `
                    bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg
                    transition-colors cursor-pointer text-sm font-medium
                    flex items-center space-x-2
                  `,
                  allowedContent: 'text-slate-400 text-xs mt-1',
                }}
                content={{
                  button: (
                    <div className="flex items-center space-x-2">
                      <Camera size={16} />
                      <span>{currentImage ? 'Change Image' : 'Upload Image'}</span>
                    </div>
                  ),
                  allowedContent: 'Images up to 4MB (JPG, PNG, WebP)',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-slate-800/30 rounded-lg p-4">
        <h5 className="text-white font-medium mb-2">Image Guidelines</h5>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Use a high-quality, professional photo</li>
          <li>• Square aspect ratio works best (1:1)</li>
          <li>• Face should be clearly visible and well-lit</li>
          <li>• Avoid busy backgrounds or distracting elements</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
          <li>• Maximum file size: 4MB</li>
        </ul>
      </div>
    </div>
  )
}