'use client'

import { useState } from 'react'
import { UploadButton } from '@/lib/uploadthing'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  FileText, 
  Download, 
  Upload, 
  X, 
  Eye,
  AlertCircle,
  CheckCircle 
} from 'lucide-react'

interface ResumeManagerProps {
  resumeUrl?: string
  onUpdate: (resumeUrl?: string) => Promise<{ success: boolean; error?: string }>
  saving: boolean
}

export function ResumeManager({ resumeUrl, onUpdate, saving }: ResumeManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUploadComplete = async (res: any) => {
    if (res && res[0]) {
      const result = await onUpdate(res[0].url)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Resume uploaded successfully!' })
        setError(null)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save resume' })
      }
    }
    setUploading(false)
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error)
    setError('Failed to upload resume. Please try again.')
    setUploading(false)
  }

  const handleRemoveResume = async () => {
    const result = await onUpdate('')
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Resume removed successfully!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to remove resume' })
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank')
    }
  }

  const handlePreview = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank')
    }
  }

  return (
    <GlassmorphismCard className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
          <FileText size={20} className="mr-2" />
          Resume Management
        </h2>
        <p className="text-slate-400">
          Upload and manage your resume PDF for visitors to download
        </p>
      </div>

      {message && (
        <div className={`
          mb-6 p-4 rounded-lg border flex items-center
          ${message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
          }
        `}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="mr-3 flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center">
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Current Resume Display */}
      {resumeUrl ? (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Current Resume</h3>
          <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <FileText size={32} className="text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Resume.pdf</h4>
                  <p className="text-slate-400 text-sm">
                    PDF document • Available for download
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <button
                  onClick={handleRemoveResume}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Remove resume"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="text-center py-12 bg-slate-800/20 rounded-lg border border-slate-600/30">
            <FileText size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400 mb-2">No resume uploaded</p>
            <p className="text-sm text-slate-500">
              Upload your resume PDF to make it available for download
            </p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-4">
            {resumeUrl ? 'Replace Resume' : 'Upload Resume'}
          </h3>
          
          {uploading ? (
            <div className="flex items-center justify-center p-8 bg-slate-800/30 rounded-lg border border-slate-600/30">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-slate-400">Uploading resume...</span>
            </div>
          ) : (
            <div className="p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
              <div className="text-center">
                <Upload size={48} className="mx-auto text-slate-500 mb-4" />
                <UploadButton
                  endpoint="resumePdf"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  onUploadBegin={() => {
                    setUploading(true)
                    setError(null)
                  }}
                  appearance={{
                    button: `
                      bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg
                      transition-colors cursor-pointer font-medium
                      flex items-center space-x-2 mx-auto
                    `,
                    allowedContent: 'text-slate-400 text-sm mt-3',
                  }}
                  content={{
                    button: (
                      <div className="flex items-center space-x-2">
                        <Upload size={20} />
                        <span>{resumeUrl ? 'Replace Resume' : 'Upload Resume'}</span>
                      </div>
                    ),
                    allowedContent: 'PDF files up to 8MB',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Resume Guidelines */}
        <div className="bg-slate-800/20 rounded-lg p-6 border border-slate-600/30">
          <h4 className="text-white font-medium mb-4 flex items-center">
            <AlertCircle size={20} className="mr-2 text-purple-400" />
            Resume Guidelines
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-purple-300 font-medium mb-3">Content Tips</h5>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Keep it concise (1-2 pages maximum)</li>
                <li>• Use a clean, professional format</li>
                <li>• Include relevant work experience</li>
                <li>• Highlight key skills and achievements</li>
                <li>• Use action verbs and quantify results</li>
                <li>• Proofread for spelling and grammar</li>
              </ul>
            </div>
            <div>
              <h5 className="text-purple-300 font-medium mb-3">Technical Requirements</h5>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• File format: PDF only</li>
                <li>• Maximum file size: 8MB</li>
                <li>• Recommended: High-quality PDF export</li>
                <li>• Ensure text is selectable (not scanned image)</li>
                <li>• Test download link after upload</li>
                <li>• Consider mobile viewing compatibility</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-blue-300 font-medium mb-1">Privacy Notice</h5>
              <p className="text-blue-200 text-sm">
                Your resume will be publicly accessible to visitors who click the download link. 
                Make sure you're comfortable sharing this information publicly before uploading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassmorphismCard>
  )
}