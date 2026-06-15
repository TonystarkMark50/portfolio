import { supabase } from './supabase';
import {
  getProfile,
  getAbout,
  getSkills,
  getInternships,
  getEducation,
  getCertifications,
  getProjects,
  getJourney,
  getContactInfo,
} from './api';

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
  gradient: string;
}

export interface InternshipData {
  id?: number;
  organization: string;
  department: string | null;
  role: string;
  duration: string | null;
  location: string | null;
  type: string;
  description: string[];
  responsibilities: string[];
  learnings: string[];
  impact: string[];
  certificateUrl: string | null;
  completed: boolean;
}

export interface EducationItem {
  id: number;
  degree: string;
  field: string | null;
  institution: string;
  period: string | null;
  location: string | null;
  gpa: string | null;
  status: string | null;
  current: boolean;
  description: string | null;
}

export interface CertificationItem {
  id: number;
  title: string;
  organization: string;
  platform: string | null;
  issueDate: string | null;
  credentialId: string | null;
  certificateUrl: string | null;
  embedUrl: string | null;
  description: string | null;
  category: string | null;
  skills: string[];
  status: string;
  logoUrl: string | null;
}

export interface ProjectItem {
  id: string;
  name: string;
  type: string;
  status: string;
  completedDate: string | null;
  highlights: string[];
  technologies: string[];
  reportUrl: string | null;
}

export interface AboutData {
  content: string[];
  subtitle: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string[];
  education: EducationItem[];
  internship: InternshipData | null;
  projects: ProjectItem[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
  hasRealCertifications: boolean;
  languages: string[];
}

export async function loadProfile(): Promise<PersonalInfo | null> {
  const { data } = await getProfile();
  if (data) {
    return {
      name: data.name || '',
      title: data.title || '',
      location: data.location || '',
      email: data.email || '',
      linkedin: data.linkedin || '',
      github: data.github || '',
    };
  }
  return null;
}

export async function loadAbout(): Promise<AboutData | null> {
  const { data } = await getAbout();
  if (data && data.length > 0) {
    const first = data[0];
    return {
      content: first.paragraphs || [],
      subtitle: first.subtitle || '',
    };
  }
  return null;
}

export async function loadSkills(): Promise<SkillCategory[] | null> {
  const { data } = await getSkills();
  if (data && data.length > 0) {
    return data.map((s) => ({
      title: s.category,
      skills: s.skills,
      gradient: s.gradient || 'from-primary-500/20 to-accent-500/20',
    }));
  }
  return null;
}

export async function loadInternships(): Promise<InternshipData | null> {
  const { data } = await getInternships();
  if (data && data.length > 0) {
    const s = data[0];
    return {
      id: 1,
      organization: s.organization,
      department: s.department || null,
      role: s.role,
      duration: s.duration || null,
      location: s.location || null,
      type: s.type || 'On-Site',
      description: s.description,
      responsibilities: s.responsibilities,
      learnings: s.learnings,
      impact: s.impact,
      certificateUrl: s.certificate_url || null,
      completed: s.completed,
    };
  }
  return null;
}

export async function loadEducation(): Promise<EducationItem[] | null> {
  const { data } = await getEducation();
  if (data && data.length > 0) {
    return data.map((e, i) => ({
      id: i + 1,
      degree: e.degree,
      field: e.field || null,
      institution: e.institution,
      period: e.period || null,
      location: e.location || null,
      gpa: e.gpa || null,
      status: e.status || null,
      current: e.current,
      description: e.description || null,
    }));
  }
  return null;
}

const EXCLUDED_CERT_TITLES = new Set([
  'AI Prompt Engineering Specialization',
  'Biomedical Instrumentation',
  'Introduction to Machine Learning',
  'Healthcare UX Design',
]);

function isRealCertification(c: any): boolean {
  if (!c.title || !c.organization) return false;
  if (c.title === 'Certification Title' || c.organization === 'Issuing Organization') return false;
  if (EXCLUDED_CERT_TITLES.has(c.title)) return false;
  return true;
}

export async function loadCertifications(): Promise<CertificationItem[] | null> {
  const { data } = await getCertifications();
  if (data && data.length > 0) {
    const realCerts = data.filter(isRealCertification);
    if (realCerts.length === 0) return null;
    return realCerts.map((c, i) => ({
      id: i + 1,
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
    }));
  }
  return null;
}

export async function loadProjects(): Promise<ProjectItem[] | null> {
  const { data } = await getProjects();
  if (data && data.length > 0) {
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      completedDate: p.completed_date || null,
      highlights: p.highlights,
      technologies: p.technologies,
      reportUrl: p.report_url || null,
    }));
  }
  return null;
}

export interface JourneyMilestone {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  date: string | null;
  type: string;
  icon: string;
}

export async function loadJourneyMilestones(): Promise<JourneyMilestone[] | null> {
  const { data } = await getJourney();
  if (data && data.length > 0) {
    return data.map((j) => ({
      id: j.id,
      title: j.title,
      subtitle: j.subtitle || '',
      description: j.description || '',
      date: j.date || '',
      type: j.type || 'milestone',
      icon: j.icon || 'Star',
    }));
  }
  return null;
}

export async function loadContactInfo(): Promise<{ email: string; location: string; linkedin: string; github: string } | null> {
  const { data } = await getContactInfo();
  if (data) {
    return {
      email: data.email || '',
      location: data.location || '',
      linkedin: data.linkedin || '',
      github: data.github || '',
    };
  }
  return null;
}

export async function loadResumeData(): Promise<ResumeData | null> {
  const [profile, education, internship, projects, skills, certifications] = await Promise.all([
    loadProfile(),
    loadEducation(),
    loadInternships(),
    loadProjects(),
    loadSkills(),
    loadCertifications(),
  ]);

  if (!profile) return null;

  let summaryText = '';
  try {
    const { data: settings } = await supabase.from('site_settings').select('resume_summary').limit(1).maybeSingle();
    if (settings && (settings as any).resume_summary) {
      summaryText = (settings as any).resume_summary;
    }
  } catch { /* ignore */ } 

  return {
    personalInfo: profile,
    professionalSummary: summaryText ? [summaryText] : [],
    education: education || [],
    internship: internship || null,
    projects: projects || [],
    skills: skills || [],
    certifications: certifications || [],
    hasRealCertifications: (certifications || []).length > 0,
    languages: [],
  };
}
