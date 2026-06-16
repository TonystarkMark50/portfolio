import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
})

export const profileSchema = z.object({
  name: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(500).nullable().optional(),
  location: z.string().min(1).max(200),
  email: z.string().email(),
  linkedin: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').or(z.literal('')),
  portfolio_url: z.string().url().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  resume_url: z.string().url().nullable().optional(),
})

export const aboutSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).nullable().optional(),
  paragraphs: z.array(z.string()).max(100),
  display_order: z.number().int().min(0),
})

export const projectSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  status: z.string().min(1).max(100),
  completed_date: z.string().max(50).nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  highlights: z.array(z.string()).max(50),
  technologies: z.array(z.string()).max(50),
  report_url: z.string().url().nullable().optional().or(z.literal('')),
  image_url: z.string().url().nullable().optional().or(z.literal('')),
  github_url: z.string().url().nullable().optional().or(z.literal('')),
  demo_url: z.string().url().nullable().optional().or(z.literal('')),
  featured: z.boolean(),
  display_order: z.number().int().min(0),
})

export const certificationSchema = z.object({
  title: z.string().min(1).max(300),
  organization: z.string().min(1).max(300),
  platform: z.string().max(200).nullable().optional(),
  issue_date: z.string().max(50).nullable().optional(),
  credential_id: z.string().max(200).nullable().optional(),
  certificate_url: z.string().url().nullable().optional().or(z.literal('')),
  embed_url: z.string().url().nullable().optional().or(z.literal('')),
  description: z.string().max(5000).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  skills: z.array(z.string()).max(50),
  status: z.string().max(50),
  display_order: z.number().int().min(0),
  logo_url: z.string().url().nullable().optional().or(z.literal('')),
})

export const skillSchema = z.object({
  category: z.string().min(1).max(200),
  skills: z.array(z.string()).min(1, 'At least one skill required').max(100),
  gradient: z.string().max(100),
  display_order: z.number().int().min(0),
})

export const educationSchema = z.object({
  degree: z.string().min(1).max(300),
  field: z.string().max(200).nullable().optional(),
  institution: z.string().min(1).max(300),
  period: z.string().max(100).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  gpa: z.string().max(20).nullable().optional(),
  status: z.string().max(50).nullable().optional(),
  current: z.boolean(),
  description: z.string().max(5000).nullable().optional(),
  display_order: z.number().int().min(0),
})

export const internshipSchema = z.object({
  organization: z.string().min(1).max(300),
  department: z.string().max(200).nullable().optional(),
  role: z.string().min(1).max(300),
  duration: z.string().max(100).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  type: z.string().max(100),
  description: z.array(z.string()).max(50),
  responsibilities: z.array(z.string()).max(50),
  learnings: z.array(z.string()).max(50),
  impact: z.array(z.string()).max(50),
  certificate_url: z.string().url().nullable().optional().or(z.literal('')),
  completed: z.boolean(),
  display_order: z.number().int().min(0),
})

export const journeySchema = z.object({
  title: z.string().min(1).max(300),
  subtitle: z.string().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  date: z.string().max(100).nullable().optional(),
  type: z.string().max(100),
  icon: z.string().max(100),
  display_order: z.number().int().min(0),
})

export const siteSettingsSchema = z.object({
  site_title: z.string().min(1).max(200),
  favicon_url: z.string().url().nullable().optional().or(z.literal('')),
  seo_description: z.string().max(500).nullable().optional(),
  seo_keywords: z.string().max(500).nullable().optional(),
  theme: z.string().max(50),
})

export const contactInfoSchema = z.object({
  email: z.string().email().or(z.literal('')),
  github: z.string().url().or(z.literal('')),
  linkedin: z.string().url().or(z.literal('')),
  location: z.string().max(200),
  portfolio_url: z.string().url().nullable().optional().or(z.literal('')),
  phone: z.string().max(50).nullable().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type AboutInput = z.infer<typeof aboutSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type CertificationInput = z.infer<typeof certificationSchema>
export type SkillInput = z.infer<typeof skillSchema>
export type EducationInput = z.infer<typeof educationSchema>
export type InternshipInput = z.infer<typeof internshipSchema>
export type JourneyInput = z.infer<typeof journeySchema>
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>
export type ContactInfoInput = z.infer<typeof contactInfoSchema>
