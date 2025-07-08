// src/config/file-upload.config.ts
// File upload and asset management configuration
import { registerAs } from '@nestjs/config';

export default registerAs('fileUpload', () => ({
  // File size limits
  /* limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    files: parseInt(process.env.MAX_FILES_COUNT, 10) || 5,
  }, */
  
  // Allowed file types
  allowedTypes: {
    images: process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    documents: process.env.ALLOWED_DOCUMENT_TYPES?.split(',') || [
      'application/pdf',
      'text/plain',
      'text/css',
      'text/scss',
    ],
    fonts: process.env.ALLOWED_FONT_TYPES?.split(',') || [
      'font/woff',
      'font/woff2',
      'font/ttf',
      'font/otf',
    ],
  },
  
  // Storage configuration
  storage: {
    destination: process.env.STATIC_FILES_PATH || './uploads',
    urlPrefix: process.env.STATIC_FILES_URL || '/uploads',
    tempDirectory: process.env.TEMP_FILES_PATH || './temp',
  },
  
  // Image processing options
  imageProcessing: {
    enableResize: true,
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 85,
    formats: ['jpeg', 'png', 'webp'],
    
    // Thumbnail generation
    thumbnails: {
      small: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 600, height: 600 },
    },
  },
  
  // File naming strategy
  naming: {
    strategy: 'uuid', // uuid, timestamp, original
    preserveExtension: true,
    addTimestamp: true,
  },
  
  // Cleanup configuration
  cleanup: {
    tempFilesMaxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    orphanedFilesMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));