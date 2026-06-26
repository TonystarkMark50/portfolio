import { fetchAPI } from './strapi'
import type {
  PersonalInfo, SkillCategory, EducationItem,
  InternshipData, CertificationItem, ProjectItem,
  AboutData, JourneyMilestone,
} from './loaders'

function parseJSONArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] }
    catch { return [] }
  }
  return []
}

function attrs(item: { attributes: Record<string, unknown> }): Record<string, unknown> {
  return item.attributes
}

function mapCollection<T>(json: { data: { attributes: Record<string, unknown> }[] } | null): T[] {
  if (!json) return []
  return json.data.map(item => attrs(item) as unknown as T)
}

function getMediaUrl(media: unknown): string | null {
  if (!media || typeof media !== 'object') return null
  const m = media as Record<string, unknown>
  if (m.url && typeof m.url === 'string') {
    const base = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'
    return `${base}${m.url}`
  }
  return null
}

export function createStrapiLoaders() {
  async function loadProfile(): Promise<PersonalInfo | null> {
    const json = await fetchAPI<{ data: { attributes: Record<string, unknown> } }>('/profile?populate=*')
    if (!json) return null
    const a = json.data.attributes
    return {
      name: (a.name as string) || '',
      title: (a.title as string) || '',
      location: (a.location as string) || '',
      email: (a.email as string) || '',
      linkedin: (a.linkedin as string) || '',
      github: (a.github as string) || '',
      avatar_url: getMediaUrl(a.avatar),
    }
  }

  async function loadAbout(): Promise<AboutData | null> {
    const [aboutJson, parasJson] = await Promise.all([
      fetchAPI<{ data: { attributes: Record<string, unknown> } }>('/about'),
      fetchAPI<{ data: { attributes: Record<string, unknown> }[] }>('/about-paragraphs?sort=display_order:asc'),
    ])
    if (!aboutJson) return null
    const paragraphs = mapCollection<{ content: string; display_order: number }>(parasJson)
      .sort((a, b) => a.display_order - b.display_order)
    return {
      content: paragraphs.map(p => p.content),
      subtitle: (aboutJson.data.attributes.subtitle as string) || '',
    }
  }

  async function loadSkills(): Promise<SkillCategory[] | null> {
    const json = await fetchAPI<{ data: { attributes: Record<string, unknown> }[] }>('/skills?sort=display_order:asc')
    if (!json) return null
    return mapCollection<{
      title: string; skills: unknown; gradient: string
    }>(json).map(s => ({
      title: s.title,
      skills: parseJSONArray(s.skills),
      gradient: s.gradient,
    }))
  }

  async function loadEducation(): Promise<EducationItem[] | null> {
    const json = await fetchAPI<{ data: { attributes: Record<string, unknown> }[] }>('/educations?sort=display_order:asc')
    if (!json) return null
    return mapCollection<{
      degree: string; field?: string; institution: string
      period?: string; location?: string; gpa?: string
      status?: string; current: boolean; description?: string
    }>(json).map((e, i) => ({
      id: i + 1,
      degree: e.degree,
      field: e.field ?? null,
      institution: e.institution,
      period: e.period ?? null,
      location: e.location ?? null,
      gpa: e.gpa ?? null,
      status: e.status ?? null,
      current: e.current,
      description: e.description ?? null,
    }))
  }

  async function loadInternships(): Promise<InternshipData | null> {
    const json = await fetchAPI<{ data: { attributes: Record<string, unknown> } }>('/internship')
    if (!json) return null
    const a = json.data.attributes
    return {
      id: 1,
      organization: (a.organization as string) || '',
      department: (a.department as string) || null,
      role: (a.role as string) || '',
      duration: (a.duration as string) || null,
      location: (a.location as string) || null,
      type: (a.type as string) || 'On-Site',
      description: parseJSONArray(a.description),
      responsibilities: parseJSONArray(a.responsibilities),
      learnings: parseJSONArray(a.learnings),
      impact: parseJSONArray(a.impact),
      certificateUrl: (a.certificate_url as string) || null,
      completed: !!a.completed,
    }
  }

  async function loadCertifications(): Promise<CertificationItem[] | null> {
    const json = await fetchAPI<{ data: { attributes: Record<string, unknown> }[] }>('/certifications?sort=display_order:asc')
    if (!json) return null
    return mapCollection<{
      title: string; organization: string; platform?: string
      issue_date?: string; credential_id?: string
      certificate_url?: string; embed_url?: string
      description?: string; category?: string; skills: unknown
      status: string
    }>(json).map((c, i) => ({
      id: i + 1,
      title: c.title,
      organization: c.organization,
      platform: c.platform ?? null,
      issueDate: c.issue_date ?? null,
      credentialId: c.credential_id ?? null,
      certificateUrl: c.certificate_url ?? null,
      embedUrl: c.embed_url ?? null,
      description: c.description ?? null,
      category: c.category ?? null,
      skills: parseJSONArray(c.skills),
      status: c.status,
      logoUrl: null,
    }))
  }

  async function loadProjects(): Promise<ProjectItem[] | null> {
    const json = await fetchAPI<{ data: { attributes: Record<string, unknown> }[] }>('/projects?sort=display_order:asc')
    if (!json) return null
    return mapCollection<{
      name: string; type: string; status: string
      completed_date?: string; description?: string
      highlights: unknown; technologies: unknown
      report_url?: string; featured: boolean
    }>(json).map(p => ({
      id: '',
      name: p.name,
      type: p.type,
      status: p.status,
      completedDate: p.completed_date ?? null,
      highlights: parseJSONArray(p.highlights),
      technologies: parseJSONArray(p.technologies),
      description: p.description ?? null,
      reportUrl: p.report_url ?? null,
    }))
  }

  async function loadJourneyMilestones(): Promise<JourneyMilestone[] | null> {
    const json = await fetchAPI<{ data: { attributes: Record<string, unknown> }[] }>('/journeys?sort=display_order:asc')
    if (!json) return null
    return mapCollection<{
      title: string; subtitle?: string; description?: string
      date?: string; type: string; icon: string
    }>(json).map(j => ({
      id: '',
      title: j.title,
      subtitle: j.subtitle ?? null,
      description: j.description ?? null,
      date: j.date ?? null,
      type: j.type,
      icon: j.icon,
    }))
  }

  async function loadContactInfo(): Promise<{ email: string; location: string; linkedin: string; github: string } | null> {
    const json = await fetchAPI<{ data: { attributes: Record<string, unknown> } }>('/contact-info')
    if (!json) return null
    const a = json.data.attributes
    return {
      email: (a.email as string) || '',
      github: (a.github as string) || '',
      linkedin: (a.linkedin as string) || '',
      location: (a.location as string) || '',
    }
  }

  return {
    loadProfile,
    loadAbout,
    loadSkills,
    loadEducation,
    loadInternships,
    loadCertifications,
    loadProjects,
    loadJourneyMilestones,
    loadContactInfo,
  }
}
