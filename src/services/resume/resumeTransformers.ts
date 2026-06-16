import type { EducationItem, InternshipData, ProjectItem, SkillCategory, CertificationItem } from '../../lib/loaders';
import type { ResumeTemplate } from '../../components/ATSResume';
import { supabase } from '../../lib/supabase';
import { getAbout } from '../../lib/api';

export const TEMPLATE_OPTIONS: { value: ResumeTemplate; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic ATS', desc: 'Traditional black & white, ATS-optimized' },
  { value: 'modern', label: 'Modern ATS', desc: 'Clean layout with accent styling' },
  { value: 'corporate', label: 'Corporate ATS', desc: 'Professional dark header, structured' },
];

export interface EditableProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface ResumeSectionVisibility {
  education: boolean;
  internship: boolean;
  projects: boolean;
  skills: boolean;
  certifications: boolean;
  languages: boolean;
}

export function educationToItem(e: { degree: string; field: string | null; institution: string; period: string | null; location: string | null; gpa: string | null; status: string | null; current: boolean; description: string | null }, index: number): EducationItem {
  return {
    id: index + 1,
    degree: e.degree,
    field: e.field || null,
    institution: e.institution,
    period: e.period || null,
    location: e.location || null,
    gpa: e.gpa || null,
    status: e.status || null,
    current: e.current,
    description: e.description || null,
  };
}

export function internshipsToData(internships: InternshipData[]): InternshipData | null {
  if (internships.length === 0) return null;
  const i = internships[0];
  return {
    id: 1,
    organization: i.organization,
    department: i.department,
    role: i.role,
    duration: i.duration || null,
    location: i.location || null,
    type: i.type,
    description: i.description,
    responsibilities: i.responsibilities,
    learnings: i.learnings,
    impact: i.impact,
    certificateUrl: i.certificate_url || null,
    completed: i.completed,
  };
}

export function projectToItem(p: { id: string; name: string; type: string; status: string; completed_date: string | null; description: string | null; highlights: string[]; technologies: string[]; report_url: string | null }): ProjectItem {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    status: p.status,
    completedDate: p.completed_date || null,
    highlights: p.highlights,
    technologies: p.technologies,
    description: p.description || null,
    reportUrl: p.report_url || null,
  };
}

export function skillToCategory(s: { category: string; skills: string[]; gradient: string | null }): SkillCategory {
  return {
    title: s.category,
    skills: s.skills,
    gradient: s.gradient || 'from-primary-500/20 to-accent-500/20',
  };
}

export function certificationToItem(c: { title: string; organization: string; platform: string | null; issue_date: string | null; credential_id: string | null; certificate_url: string | null; embed_url: string | null; description: string | null; category: string | null; skills: string[]; status: string; logo_url: string | null }, index: number): CertificationItem {
  return {
    id: index + 1,
    title: c.title,
    organization: c.organization,
    platform: c.platform || null,
    issueDate: c.issue_date || null,
    credentialId: c.credential_id || null,
    certificateUrl: c.certificate_url || null,
    embedUrl: c.embed_url || null,
    description: c.description || null,
    category: c.category || null,
    skills: c.skills,
    status: c.status,
    logoUrl: c.logo_url || null,
  };
}

export async function loadResumeSummary(): Promise<string> {
  try {
    const { data: aboutData } = await getAbout();
    if (aboutData && aboutData.length > 0 && aboutData[0].paragraphs?.length > 0) {
      return aboutData[0].paragraphs.join('\n\n');
    }
  } catch { /* ignore */ }
  try {
    const { data: settings } = await supabase.from('site_settings').select('resume_summary').limit(1).maybeSingle();
    if (settings && (settings as Record<string, unknown>).resume_summary) {
      return (settings as Record<string, unknown>).resume_summary as string;
    }
  } catch { /* ignore */ }
  return '';
}
