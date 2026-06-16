const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf', '.doc', '.docx'] as const
type AllowedExtension = typeof ALLOWED_EXTENSIONS[number]
const ALLOWED_IMAGE_EXTENSIONS: readonly AllowedExtension[] = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
const MAX_IMAGE_SIZE_MB = 5
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
const MAX_DOCUMENT_SIZE_MB = 10
const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024

export interface FileValidationResult {
  valid: boolean
  error: string | null
}

export function validateImageFile(file: File): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` }
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `File too large. Maximum size: ${MAX_IMAGE_SIZE_MB}MB` }
  }
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext as AllowedExtension)) {
    return { valid: false, error: 'Invalid file extension' }
  }
  return { valid: true, error: null }
}

export function validateDocumentFile(file: File): FileValidationResult {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid document type. Allowed: PDF, DOC, DOCX` }
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { valid: false, error: `Document too large. Maximum size: ${MAX_DOCUMENT_SIZE_MB}MB` }
  }
  return { valid: true, error: null }
}

export function validateFileExtension(filename: string): FileValidationResult {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'File type not allowed' }
  }
  return { valid: true, error: null }
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

export function generateSafeFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || ''
  const safeName = sanitizeFileName(originalName.replace(`.${ext}`, ''))
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${safeName}-${timestamp}-${random}.${ext}`
}
