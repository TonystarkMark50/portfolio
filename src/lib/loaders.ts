import {
  personalInfo as fallbackPersonalInfo,
  aboutContent as fallbackAboutContent,
  aboutSubtitle as fallbackAboutSubtitle,
  skillCategories as fallbackSkillCategories,
  educationData as fallbackEducation,
  certificationsData as fallbackCertifications,
  projectsData as fallbackProjects,
  professionalSummary as fallbackProfessionalSummary,
  languages as fallbackLanguages,
} from '../data/portfolio';
import {
  getProfile,
  getAbout,
  getSkills,
  getInternships,
  getEducation,
  getCertifications,
  getProjects,
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
      name: data.name || fallbackPersonalInfo.name,
      title: data.title || fallbackPersonalInfo.title,
      location: data.location || fallbackPersonalInfo.location,
      email: data.email || fallbackPersonalInfo.email,
      linkedin: data.linkedin || fallbackPersonalInfo.linkedin,
      github: data.github || fallbackPersonalInfo.github,
    };
  }
  return null;
}

export async function loadAbout(): Promise<AboutData | null> {
  const { data } = await getAbout();
  if (data && data.length > 0) {
    const first = data[0];
    return {
      content: first.paragraphs.length > 0 ? first.paragraphs : fallbackAboutContent,
      subtitle: first.subtitle || fallbackAboutSubtitle,
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

export async function loadContactInfo(): Promise<{ email: string; location: string; linkedin: string; github: string } | null> {
  const { data } = await getContactInfo();
  if (data) {
    return {
      email: data.email || fallbackPersonalInfo.email,
      location: data.location || fallbackPersonalInfo.location,
      linkedin: data.linkedin || fallbackPersonalInfo.linkedin,
      github: data.github || fallbackPersonalInfo.github,
    };
  }
  return null;
}

export async function loadResumeData(): Promise<ResumeData> {
  const [profile, education, internship, projects, skills, certifications] = await Promise.all([
    loadProfile(),
    loadEducation(),
    loadInternships(),
    loadProjects(),
    loadSkills(),
    loadCertifications(),
  ]);

  const pi = profile || fallbackPersonalInfo;
  const edu = education || fallbackEducation.map((e) => ({
    id: e.id,
    degree: e.degree,
    field: e.field || null,
    institution: e.institution,
    period: e.period || null,
    location: e.location || null,
    gpa: e.gpa || null,
    status: e.status || null,
    current: !!e.current,
    description: e.description || null,
  }));
  const intern = internship || null;
  const projs = projects || fallbackProjects.map((p) => ({
    name: p.name,
    type: p.type,
    status: p.status,
    completedDate: p.completedDate || null,
    highlights: p.highlights,
    technologies: p.technologies,
    reportUrl: (p as any).reportUrl || null,
  }));
  const sk = skills || fallbackSkillCategories;
  const certs = certifications || fallbackCertifications.map((c) => ({
    id: c.id,
    title: c.title,
    organization: c.organization,
    platform: c.platform || null,
    issueDate: c.issueDate || null,
    credentialId: c.credentialId || null,
    certificateUrl: c.certificateUrl || null,
    embedUrl: c.embedUrl || null,
    description: c.description || null,
    category: c.category || null,
    skills: c.skills,
    status: c.status,
    logoUrl: (c as any).logoUrl || null,
  }));
  const hasCerts = certs.some((c) => c.title !== 'Certification Title' || c.organization !== 'Issuing Organization');

  return {
    personalInfo: pi,
    professionalSummary: fallbackProfessionalSummary,
    education: edu,
    internship: intern,
    projects: projs,
    skills: sk,
    certifications: certs,
    hasRealCertifications: hasCerts,
    languages: fallbackLanguages,
  };
}
