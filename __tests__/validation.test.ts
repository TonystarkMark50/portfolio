import {
  loginSchema,
  contactFormSchema,
  profileSchema,
  aboutSchema,
  projectSchema,
  certificationSchema,
  skillSchema,
  educationSchema,
  internshipSchema,
  journeySchema,
  siteSettingsSchema,
  contactInfoSchema,
} from '../src/utils/validation'

describe('loginSchema', () => {
  it('accepts valid login', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123456' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: '123456' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false)
    expect(loginSchema.safeParse({ password: '123456' }).success).toBe(false)
  })
})

describe('contactFormSchema', () => {
  const valid = { name: 'John', email: 'j@j.com', message: 'Hello' }

  it('accepts valid contact form', () => {
    expect(contactFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(contactFormSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects long name (>200)', () => {
    expect(contactFormSchema.safeParse({ ...valid, name: 'x'.repeat(201) }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(contactFormSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false)
  })

  it('rejects empty message', () => {
    expect(contactFormSchema.safeParse({ ...valid, message: '' }).success).toBe(false)
  })

  it('rejects long message (>5000)', () => {
    expect(contactFormSchema.safeParse({ ...valid, message: 'x'.repeat(5001) }).success).toBe(false)
  })
})

describe('profileSchema', () => {
  const valid = {
    name: 'John',
    title: 'Developer',
    location: 'NYC',
    email: 'j@j.com',
    linkedin: 'https://linkedin.com/in/john',
    github: 'https://github.com/john',
  }

  it('accepts valid profile', () => {
    expect(profileSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts empty linkedin and github', () => {
    expect(profileSchema.safeParse({ ...valid, linkedin: '', github: '' }).success).toBe(true)
  })

  it('accepts null optional fields', () => {
    expect(profileSchema.safeParse({ ...valid, subtitle: null, portfolio_url: null }).success).toBe(true)
  })

  it('rejects invalid linkedin URL', () => {
    expect(profileSchema.safeParse({ ...valid, linkedin: 'not-a-url' }).success).toBe(false)
  })

  it('rejects invalid github URL', () => {
    expect(profileSchema.safeParse({ ...valid, github: 'not-a-url' }).success).toBe(false)
  })

  it('rejects missing required fields', () => {
    expect(profileSchema.safeParse({}).success).toBe(false)
  })
})

describe('aboutSchema', () => {
  const valid = { title: 'About Me', paragraphs: ['Para 1'], display_order: 0 }

  it('accepts valid about', () => {
    expect(aboutSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty title', () => {
    expect(aboutSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })

  it('rejects negative display_order', () => {
    expect(aboutSchema.safeParse({ ...valid, display_order: -1 }).success).toBe(false)
  })

  it('rejects non-integer display_order', () => {
    expect(aboutSchema.safeParse({ ...valid, display_order: 1.5 }).success).toBe(false)
  })
})

describe('projectSchema', () => {
  const valid = {
    name: 'My Project',
    type: 'Web',
    status: 'done',
    highlights: [],
    technologies: ['React'],
    featured: false,
    display_order: 0,
  }

  it('accepts valid project', () => {
    expect(projectSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(projectSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('accepts empty string URLs', () => {
    expect(projectSchema.safeParse({ ...valid, report_url: '', github_url: '' }).success).toBe(true)
  })

  it('rejects invalid URL format', () => {
    expect(projectSchema.safeParse({ ...valid, report_url: 'not-a-url' }).success).toBe(false)
  })
})

describe('certificationSchema', () => {
  const valid = {
    title: 'AWS Certified',
    organization: 'Amazon',
    skills: ['AWS'],
    status: 'active',
    display_order: 0,
  }

  it('accepts valid certification', () => {
    expect(certificationSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty title', () => {
    expect(certificationSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })

  it('rejects empty organization', () => {
    expect(certificationSchema.safeParse({ ...valid, organization: '' }).success).toBe(false)
  })
})

describe('skillSchema', () => {
  const valid = { category: 'Frontend', skills: ['React', 'Vue'], gradient: 'from-blue-500', display_order: 0 }

  it('accepts valid skill', () => {
    expect(skillSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty skills array', () => {
    expect(skillSchema.safeParse({ ...valid, skills: [] }).success).toBe(false)
  })

  it('rejects empty category', () => {
    expect(skillSchema.safeParse({ ...valid, category: '' }).success).toBe(false)
  })
})

describe('educationSchema', () => {
  const valid = { degree: 'BS', institution: 'MIT', current: false, display_order: 0 }

  it('accepts valid education', () => {
    expect(educationSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty degree', () => {
    expect(educationSchema.safeParse({ ...valid, degree: '' }).success).toBe(false)
  })

  it('rejects empty institution', () => {
    expect(educationSchema.safeParse({ ...valid, institution: '' }).success).toBe(false)
  })
})

describe('internshipSchema', () => {
  const valid = {
    organization: 'Acme',
    role: 'Intern',
    type: 'internship',
    description: [],
    responsibilities: [],
    learnings: [],
    impact: [],
    completed: true,
    display_order: 0,
  }

  it('accepts valid internship', () => {
    expect(internshipSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty organization', () => {
    expect(internshipSchema.safeParse({ ...valid, organization: '' }).success).toBe(false)
  })

  it('rejects empty role', () => {
    expect(internshipSchema.safeParse({ ...valid, role: '' }).success).toBe(false)
  })
})

describe('journeySchema', () => {
  const valid = { title: 'Started Journey', type: 'milestone', icon: 'star', display_order: 0 }

  it('accepts valid journey', () => {
    expect(journeySchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty title', () => {
    expect(journeySchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })
})

describe('siteSettingsSchema', () => {
  const valid = { site_title: 'My Portfolio', theme: 'dark' }

  it('accepts valid settings', () => {
    expect(siteSettingsSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty site_title', () => {
    expect(siteSettingsSchema.safeParse({ ...valid, site_title: '' }).success).toBe(false)
  })
})

describe('contactInfoSchema', () => {
  const valid = { email: 'j@j.com', github: 'https://github.com/j', linkedin: 'https://linkedin.com/in/j', location: 'NYC' }

  it('accepts valid contact info', () => {
    expect(contactInfoSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts empty string URLs', () => {
    expect(contactInfoSchema.safeParse({ ...valid, github: '', linkedin: '' }).success).toBe(true)
  })

  it('accepts empty email', () => {
    expect(contactInfoSchema.safeParse({ ...valid, email: '' }).success).toBe(true)
  })

  it('rejects invalid email format', () => {
    expect(contactInfoSchema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false)
  })
})
