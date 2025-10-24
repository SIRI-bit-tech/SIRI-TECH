import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
 
import type { OurFileRouter } from "@/app/api/uploadthing/core";
 
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// Re-export file utilities for convenience
export { 
  deleteFile, 
  deleteFiles, 
  deleteFileByUrl,
  extractFileKey,
  formatFileSize,
  getFileType,
  validateFileType,
  validateFileSize,
  compressImage,
  FileManager,
  uploadPresets
} from './file-utils';