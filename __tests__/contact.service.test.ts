jest.mock('../src/lib/supabase', () => ({
  supabase: {},
  submitContactForm: jest.fn(),
  getResumeDownloadCount: jest.fn(),
}))

jest.mock('../src/services/helpers', () => ({
  getSingle: jest.fn(),
  upsert: jest.fn(),
  getAll: jest.fn(),
  remove: jest.fn(),
}))

jest.mock('dompurify', () => ({
  sanitize: (input: string) => input.replace(/<[^>]*>/g, ''),
}))

import { sanitizeInput } from '../src/services/contact.service'

describe('contact.service', () => {
  describe('sanitizeInput', () => {
    it('should sanitize HTML tags from input', () => {
      const input = '<script>alert("test")</script>Hello'
      const sanitized = sanitizeInput(input)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('Hello')
    })

    it('should return empty string for empty input', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('should preserve safe text', () => {
      const input = 'Hello, World!'
      expect(sanitizeInput(input)).toBe(input)
    })
  })
})
