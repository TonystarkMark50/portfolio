import {
  validateImageFile,
  validateDocumentFile,
  validateFileExtension,
  sanitizeFileName,
  generateSafeFileName,
} from '../src/utils/fileValidation'

function createFile(name: string, type: string, size: number): File {
  const file = new File(['x'.repeat(size)], name, { type })
  return file
}

describe('validateImageFile', () => {
  it('accepts valid JPEG', () => {
    const file = createFile('photo.jpg', 'image/jpeg', 1000)
    expect(validateImageFile(file)).toEqual({ valid: true, error: null })
  })

  it('accepts valid PNG', () => {
    const file = createFile('photo.png', 'image/png', 1000)
    expect(validateImageFile(file)).toEqual({ valid: true, error: null })
  })

  it('accepts valid WebP', () => {
    const file = createFile('photo.webp', 'image/webp', 1000)
    expect(validateImageFile(file)).toEqual({ valid: true, error: null })
  })

  it('accepts valid GIF', () => {
    const file = createFile('anim.gif', 'image/gif', 1000)
    expect(validateImageFile(file)).toEqual({ valid: true, error: null })
  })

  it('accepts valid SVG', () => {
    const file = createFile('icon.svg', 'image/svg+xml', 1000)
    expect(validateImageFile(file)).toEqual({ valid: true, error: null })
  })

  it('rejects invalid type', () => {
    const file = createFile('file.exe', 'application/octet-stream', 1000)
    expect(validateImageFile(file).valid).toBe(false)
  })

  it('rejects oversized image', () => {
    const file = createFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024)
    expect(validateImageFile(file).valid).toBe(false)
    expect(validateImageFile(file).error).toContain('too large')
  })

  it('accepts max size image', () => {
    const file = createFile('max.jpg', 'image/jpeg', 5 * 1024 * 1024)
    expect(validateImageFile(file)).toEqual({ valid: true, error: null })
  })
})

describe('validateDocumentFile', () => {
  it('accepts valid PDF', () => {
    const file = createFile('doc.pdf', 'application/pdf', 1000)
    expect(validateDocumentFile(file)).toEqual({ valid: true, error: null })
  })

  it('accepts valid DOC', () => {
    const file = createFile('doc.doc', 'application/msword', 1000)
    expect(validateDocumentFile(file)).toEqual({ valid: true, error: null })
  })

  it('accepts valid DOCX', () => {
    const file = createFile('doc.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1000)
    expect(validateDocumentFile(file)).toEqual({ valid: true, error: null })
  })

  it('rejects invalid type', () => {
    const file = createFile('file.txt', 'text/plain', 1000)
    expect(validateDocumentFile(file).valid).toBe(false)
  })

  it('rejects oversized document', () => {
    const file = createFile('big.pdf', 'application/pdf', 11 * 1024 * 1024)
    expect(validateDocumentFile(file).valid).toBe(false)
    expect(validateDocumentFile(file).error).toContain('too large')
  })
})

describe('validateFileExtension', () => {
  it('accepts .jpg', () => {
    expect(validateFileExtension('photo.jpg')).toEqual({ valid: true, error: null })
  })

  it('accepts .pdf', () => {
    expect(validateFileExtension('doc.pdf')).toEqual({ valid: true, error: null })
  })

  it('accepts .docx', () => {
    expect(validateFileExtension('report.docx')).toEqual({ valid: true, error: null })
  })

  it('rejects .exe', () => {
    expect(validateFileExtension('virus.exe').valid).toBe(false)
  })

  it('rejects .js', () => {
    expect(validateFileExtension('script.js').valid).toBe(false)
  })

  it('handles case insensitivity', () => {
    expect(validateFileExtension('FILE.JPG')).toEqual({ valid: true, error: null })
    expect(validateFileExtension('DOC.PDF')).toEqual({ valid: true, error: null })
  })
})

describe('sanitizeFileName', () => {
  it('replaces spaces with underscores', () => {
    expect(sanitizeFileName('my file.jpg')).toBe('my_file.jpg')
  })

  it('replaces special characters', () => {
    expect(sanitizeFileName('file (1)@home.jpg')).toBe('file_1_home.jpg')
  })

  it('collapses multiple underscores', () => {
    expect(sanitizeFileName('a___b.jpg')).toBe('a_b.jpg')
  })

  it('converts to lowercase', () => {
    expect(sanitizeFileName('MyFile.JPG')).toBe('myfile.jpg')
  })

  it('preserves dots and hyphens', () => {
    expect(sanitizeFileName('my-file.v2.jpg')).toBe('my-file.v2.jpg')
  })
})

describe('generateSafeFileName', () => {
  it('generates unique names with timestamp', () => {
    const name1 = generateSafeFileName('photo.jpg')
    const name2 = generateSafeFileName('photo.jpg')
    expect(name1).not.toBe(name2)
  })

  it('preserves extension', () => {
    const name = generateSafeFileName('report.pdf')
    expect(name).toMatch(/\.pdf$/)
  })

  it('sanitizes the base name', () => {
    const name = generateSafeFileName('my file (1).jpg')
    expect(name).toMatch(/^my_file_1_/)
  })

  it('includes random suffix', () => {
    const name = generateSafeFileName('test.png')
    const parts = name.replace('.png', '').split('-')
    expect(parts.length).toBeGreaterThanOrEqual(3)
  })
})
