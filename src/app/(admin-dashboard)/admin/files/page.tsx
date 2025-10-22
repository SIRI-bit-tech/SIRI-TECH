'use client'

import { useState } from 'react'
import { FileManager } from '@/components/admin/FileManager'
import { FileUpload, UploadedFile } from '@/components/ui/FileUpload'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { uploadPresets } from '@/lib/file-utils'

export default function FilesPage() {
  const [projectImages, setProjectImages] = useState<UploadedFile[]>([])
  const [profileImages, setProfileImages] = useState<UploadedFile[]>([])
  const [documents, setDocuments] = useState<UploadedFile[]>([])
  const [generalFiles, setGeneralFiles] = useState<UploadedFile[]>([])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">File Management</h1>
        <p className="text-slate-400">
          Manage all your uploaded files including images, documents, and other assets.
        </p>
      </div>

      {/* Project Images */}
      <FileManager
        title="Project Images"
        description="Upload and manage images for your portfolio projects"
        endpoint="imageUploader"
        files={projectImages}
        onChange={setProjectImages}
        maxFiles={10}
        showPreview={true}
        allowBulkOperations={true}
      />

      {/* Profile Images */}
      <FileManager
        title="Profile Images"
        description="Upload profile pictures and personal photos"
        endpoint="profileImage"
        files={profileImages}
        onChange={setProfileImages}
        maxFiles={1}
        showPreview={true}
        allowBulkOperations={false}
      />

      {/* Documents */}
      <FileManager
        title="Documents"
        description="Upload PDF documents like resumes and certificates"
        endpoint="resumePdf"
        files={documents}
        onChange={setDocuments}
        maxFiles={5}
        showPreview={false}
        allowBulkOperations={true}
      />

      {/* General Files */}
      <FileManager
        title="General Files"
        description="Upload various file types for general use"
        endpoint="fileUploader"
        files={generalFiles}
        onChange={setGeneralFiles}
        maxFiles={10}
        showPreview={true}
        allowBulkOperations={true}
      />

      {/* File Upload Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dropzone Example */}
        <GlassmorphismCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Dropzone Upload</h3>
          <FileUpload
            endpoint="imageUploader"
            files={[]}
            onChange={() => {}}
            variant="dropzone"
            maxFiles={5}
            showPreview={false}
          />
        </GlassmorphismCard>

        {/* Button Example */}
        <GlassmorphismCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Button Upload</h3>
          <FileUpload
            endpoint="fileUploader"
            files={[]}
            onChange={() => {}}
            variant="button"
            maxFiles={3}
            showPreview={false}
          />
        </GlassmorphismCard>
      </div>

      {/* Upload Presets Info */}
      <GlassmorphismCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(uploadPresets).map(([key, preset]) => (
            <div key={key} className="p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
              <h4 className="font-medium text-white mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="text-sm text-slate-400 space-y-1">
                <p>Max Files: {preset.maxFiles}</p>
                <p>Max Size: {preset.maxSizeInMB}MB</p>
                <p>Endpoint: {preset.endpoint}</p>
                <p>Compress: {preset.compress ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassmorphismCard>
    </div>
  )
}