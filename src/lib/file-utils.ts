import { UploadedFile } from '@/components/ui/FileUpload'

/**
 * Extract file key from UploadThing URL
 */
export function extractFileKey(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    return pathParts[pathParts.length - 1]
  } catch (error) {
    console.error('Error extracting file key from URL:', url, error)
    return ''
  }
}

/**
 * Delete files from UploadThing
 */
export async function deleteFiles(fileKeys: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/uploadthing/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileKeys }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete files')
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting files:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete files' 
    }
  }
}

/**
 * Delete a single file from UploadThing
 */
export async function deleteFile(fileKey: string): Promise<{ success: boolean; error?: string }> {
  return deleteFiles([fileKey])
}

/**
 * Delete file by URL
 */
export async function deleteFileByUrl(url: string): Promise<{ success: boolean; error?: string }> {
  const fileKey = extractFileKey(url)
  if (!fileKey) {
    return { success: false, error: 'Invalid file URL' }
  }
  return deleteFile(fileKey)
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileType = file.type.toLowerCase()
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  return allowedTypes.some(type => {
    if (type.includes('/')) {
      // MIME type check
      return fileType === type || fileType.startsWith(type.replace('*', ''))
    } else {
      // Extension check
      return fileExtension === type.replace('.', '')
    }
  })
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file type from filename
 */
export function getFileType(filename: string): 'image' | 'pdf' | 'document' | 'other' {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
    return 'image'
  } else if (extension === 'pdf') {
    return 'pdf'
  } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
    return 'document'
  } else {
    return 'other'
  }
}

/**
 * Generate thumbnail URL for images (if supported by UploadThing)
 */
export function generateThumbnailUrl(url: string, width: number = 200, height: number = 200): string {
  // UploadThing doesn't support automatic thumbnails, so return original URL
  // In a production app, you might want to use a service like Cloudinary
  return url
}

/**
 * Compress image file (client-side)
 */
export function compressImage(
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Batch file operations
 */
export class FileManager {
  private files: UploadedFile[] = []
  
  constructor(initialFiles: UploadedFile[] = []) {
    this.files = [...initialFiles]
  }
  
  addFiles(newFiles: UploadedFile[]): void {
    this.files.push(...newFiles)
  }
  
  removeFile(index: number): UploadedFile | undefined {
    return this.files.splice(index, 1)[0]
  }
  
  removeFileByKey(key: string): UploadedFile | undefined {
    const index = this.files.findIndex(file => file.key === key)
    return index !== -1 ? this.removeFile(index) : undefined
  }
  
  moveFile(fromIndex: number, toIndex: number): void {
    const [movedFile] = this.files.splice(fromIndex, 1)
    this.files.splice(toIndex, 0, movedFile)
  }
  
  getFiles(): UploadedFile[] {
    return [...this.files]
  }
  
  getFileKeys(): string[] {
    return this.files.map(file => file.key)
  }
  
  getFileUrls(): string[] {
    return this.files.map(file => file.url)
  }
  
  clear(): void {
    this.files = []
  }
  
  async deleteAllFiles(): Promise<{ success: boolean; error?: string }> {
    const fileKeys = this.getFileKeys()
    if (fileKeys.length === 0) {
      return { success: true }
    }
    
    const result = await deleteFiles(fileKeys)
    if (result.success) {
      this.clear()
    }
    return result
  }
}

/**
 * File upload configuration presets
 */
export const uploadPresets = {
  projectImages: {
    endpoint: 'imageUploader' as const,
    maxFiles: 10,
    maxSizeInMB: 8,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    compress: true,
    compressOptions: {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85
    }
  },
  profileImage: {
    endpoint: 'profileImage' as const,
    maxFiles: 1,
    maxSizeInMB: 4,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    compress: true,
    compressOptions: {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.9
    }
  },
  resume: {
    endpoint: 'resumePdf' as const,
    maxFiles: 1,
    maxSizeInMB: 10,
    allowedTypes: ['application/pdf'],
    compress: false
  },
  general: {
    endpoint: 'fileUploader' as const,
    maxFiles: 5,
    maxSizeInMB: 8,
    allowedTypes: ['image/*', 'application/pdf', 'text/*'],
    compress: false
  }
} as const