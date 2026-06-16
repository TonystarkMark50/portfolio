import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { ResumeData } from '../lib/loaders';
import type { ResumeTemplate } from '../components/ATSResume';
import { getProfile, getEducation, getInternships, getProjects, getSkills, getCertifications, getContactInfo, getAbout } from '../lib/api';
import type { Education, Internship, Project, Skill, Certification } from '../lib/api';
import { educationToItem, internshipsToData, projectToItem, skillToCategory, certificationToItem } from '../services/resume/resumeTransformers';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type EditableSection = 'personal' | 'summary' | 'education' | 'internship' | 'projects' | 'skills' | 'certifications';

export interface EditableProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export const DEFAULT_SECTIONS = { education: true, internship: true, projects: true, skills: true, certifications: true, languages: true };
export type ResumeSections = typeof DEFAULT_SECTIONS;

const KEYWORDS = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'project management', 'technical', 'design', 'development', 'research'];

export function useResumeData() {
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [activeSection, setActiveSection] = useState<EditableSection | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [profile, setProfile] = useState<EditableProfile>({ name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '' });
  const [summary, setSummary] = useState('');
  const [aboutId, setAboutId] = useState<string | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [template, setTemplate] = useState<ResumeTemplate>('classic');
  const [sections, setSections] = useState<ResumeSections>(DEFAULT_SECTIONS);

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, eduRes, internRes, projRes, skillRes, certRes, contactRes, aboutRes] = await Promise.all([
      getProfile(), getEducation(), getInternships(), getProjects(), getSkills(), getCertifications(), getContactInfo(), getAbout(),
    ]);
    if (pRes.data) setProfile({
      name: pRes.data.name || '', title: pRes.data.title || '', email: pRes.data.email || '',
      phone: '', location: pRes.data.location || '',
      linkedin: pRes.data.linkedin || '', github: pRes.data.github || '',
    });
    if (eduRes.data) setEducation(eduRes.data);
    if (internRes.data) setInternships(internRes.data);
    if (projRes.data) setProjects(projRes.data);
    if (skillRes.data) setSkills(skillRes.data);
    if (certRes.data) setCertifications(certRes.data);

    if (contactRes.data) {
      setProfile(prev => ({
        ...prev,
        email: contactRes.data!.email || prev.email,
        phone: contactRes.data!.phone || prev.phone,
        location: contactRes.data!.location || prev.location,
        linkedin: contactRes.data!.linkedin || prev.linkedin,
        github: contactRes.data!.github || prev.github,
      }));
    }

    let summaryFromAbout = '';
    let firstAboutId: string | null = null;
    if (aboutRes.data && aboutRes.data.length > 0) {
      summaryFromAbout = aboutRes.data[0].paragraphs?.join('\n\n') || '';
      firstAboutId = aboutRes.data[0].id;
    }
    setAboutId(firstAboutId);

    const { data: settings } = await supabase.from('site_settings')
      .select('resume_summary, resume_template, resume_sections').limit(1).maybeSingle();
    if (settings) {
      setSummary(summaryFromAbout || settings.resume_summary || '');
      if (settings.resume_template && ['classic', 'modern', 'corporate'].includes(settings.resume_template)) {
        setTemplate(settings.resume_template as ResumeTemplate);
      }
      if (settings.resume_sections) {
        const parsed = typeof settings.resume_sections === 'string' ? JSON.parse(settings.resume_sections) : settings.resume_sections;
        setSections(prev => ({ ...prev, ...parsed }));
      }
    } else {
      setSummary(summaryFromAbout);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resumeData: ResumeData | null = useMemo(() => {
    if (!profile.name && !profile.email) return null;
    return {
      personalInfo: {
        name: profile.name, title: profile.title, location: profile.location,
        email: profile.email, linkedin: profile.linkedin, github: profile.github,
        avatar_url: null,
      },
      professionalSummary: summary ? [summary] : [],
      education: education.map((e, i) => educationToItem(e, i)),
      internship: internshipsToData(internships),
      projects: projects.map(p => projectToItem(p)),
      skills: skills.map(s => skillToCategory(s)),
      certifications: certifications.map((c, i) => certificationToItem(c, i)),
      hasRealCertifications: certifications.length > 0,
      languages: [],
    };
  }, [profile, summary, education, internships, projects, skills, certifications]);

  const scheduleSave = useCallback((section: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(async () => {
      try {
        if (section === 'profile') {
          await supabase.from('profile').upsert({ name: profile.name, title: profile.title, email: profile.email, location: profile.location, linkedin: profile.linkedin, github: profile.github });
          await supabase.from('contact_info').upsert({ email: profile.email, phone: profile.phone, location: profile.location, linkedin: profile.linkedin, github: profile.github });
        }
        if (section === 'summary') {
          if (aboutId) {
            await supabase.from('about').upsert({ id: aboutId, paragraphs: summary.split('\n\n').filter(Boolean) });
          } else {
            const { data } = await supabase.from('about').insert({ title: 'About Me', paragraphs: summary.split('\n\n').filter(Boolean), display_order: 0 }).select().maybeSingle();
            if (data) setAboutId(data.id);
          }
        }
        if (section === 'template') {
          await supabase.from('site_settings').upsert({ resume_template: template, resume_sections: JSON.stringify(sections) });
        }
        if (section === 'education') {
          for (const e of education) {
            const { error } = await supabase.from('education').upsert({
              id: e.id, degree: e.degree, field: e.field, institution: e.institution,
              period: e.period, location: e.location, gpa: e.gpa, status: e.status,
              current: e.current, description: e.description, display_order: e.display_order,
            });
            if (error) throw error;
          }
        }
        if (section === 'internship') {
          for (const v of internships) {
            const { error } = await supabase.from('internships').upsert({
              id: v.id, organization: v.organization, department: v.department, role: v.role,
              duration: v.duration, location: v.location, type: v.type, description: v.description,
              responsibilities: v.responsibilities, learnings: v.learnings, impact: v.impact,
              certificate_url: v.certificate_url, completed: v.completed, display_order: v.display_order,
            });
            if (error) throw error;
          }
        }
        if (section === 'projects') {
          for (const v of projects) {
            const { error } = await supabase.from('projects').upsert({
              id: v.id, name: v.name, type: v.type, status: v.status, completed_date: v.completed_date,
              description: v.description, highlights: v.highlights, technologies: v.technologies,
              report_url: v.report_url, image_url: v.image_url, github_url: v.github_url,
              demo_url: v.demo_url, featured: v.featured, display_order: v.display_order,
            });
            if (error) throw error;
          }
        }
        if (section === 'skills') {
          for (const v of skills) {
            const { error } = await supabase.from('skills').upsert({
              id: v.id, category: v.category, skills: v.skills, gradient: v.gradient, display_order: v.display_order,
            });
            if (error) throw error;
          }
        }
        if (section === 'certifications') {
          for (const v of certifications) {
            const { error } = await supabase.from('certifications').upsert({
              id: v.id, title: v.title, organization: v.organization, platform: v.platform,
              issue_date: v.issue_date, credential_id: v.credential_id, certificate_url: v.certificate_url,
              embed_url: v.embed_url, description: v.description, category: v.category, skills: v.skills,
              status: v.status, logo_url: v.logo_url, display_order: v.display_order,
            });
            if (error) throw error;
          }
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 1000);
  }, [profile, summary, template, sections, education, internships, projects, skills, certifications, aboutId]);

  const updateProfile = (key: keyof EditableProfile, val: string) => {
    setProfile(prev => ({ ...prev, [key]: val }));
    scheduleSave('profile');
  };

  const updateSummary = (val: string) => {
    setSummary(val);
    scheduleSave('summary');
  };

  const addEducation = async () => {
    const { data } = await supabase.from('education').insert({ degree: 'New Degree', institution: 'Institution', display_order: education.length }).select().maybeSingle();
    if (data) setEducation(prev => [...prev, data as Education]);
    setActiveSection('education');
  };
  const updateEducation = (id: string, key: string, val: string) => {
    setEducation(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));
    scheduleSave('education');
  };
  const deleteEducation = async (id: string) => {
    await supabase.from('education').delete().eq('id', id);
    setEducation(prev => prev.filter(e => e.id !== id));
  };

  const addInternship = async () => {
    const { data } = await supabase.from('internships').insert({ organization: 'Organization', role: 'Role', type: 'On-Site', display_order: internships.length, responsibilities: [], description: [], learnings: [], impact: [], completed: false }).select().maybeSingle();
    if (data) setInternships(prev => [...prev, data as Internship]);
    setActiveSection('internship');
  };
  const updateInternship = (id: string, key: string, val: any) => {
    setInternships(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));
    scheduleSave('internship');
  };
  const deleteInternship = async (id: string) => {
    await supabase.from('internships').delete().eq('id', id);
    setInternships(prev => prev.filter(e => e.id !== id));
  };

  const addProject = async () => {
    const { data } = await supabase.from('projects').insert({ name: 'New Project', type: 'Academic', highlights: [], technologies: [], display_order: projects.length }).select().maybeSingle();
    if (data) setProjects(prev => [...prev, data as Project]);
    setActiveSection('projects');
  };
  const updateProject = (id: string, key: string, val: any) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, [key]: val } : p));
    scheduleSave('projects');
  };
  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addSkillCategory = async () => {
    const { data } = await supabase.from('skills').insert({ category: 'New Category', skills: [], display_order: skills.length }).select().maybeSingle();
    if (data) setSkills(prev => [...prev, data as Skill]);
  };
  const updateSkillCategory = (id: string, key: string, val: any) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s));
    scheduleSave('skills');
  };
  const deleteSkillCategory = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id);
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  const addCertification = async () => {
    const { data } = await supabase.from('certifications').insert({ title: 'New Certification', organization: 'Organization', status: 'active', skills: [], display_order: certifications.length }).select().maybeSingle();
    if (data) setCertifications(prev => [...prev, data as Certification]);
    setActiveSection('certifications');
  };
  const updateCertification = (id: string, key: string, val: any) => {
    setCertifications(prev => prev.map(c => c.id === id ? { ...c, [key]: val } : c));
    scheduleSave('certifications');
  };
  const deleteCertification = async (id: string) => {
    await supabase.from('certifications').delete().eq('id', id);
    setCertifications(prev => prev.filter(c => c.id !== id));
  };

  const atsScore = useMemo(() => {
    let score = 0;
    if (profile.name) score += 10;
    if (profile.email) score += 5;
    if (summary) score += 15;
    if (skills.length > 0) score += 15;
    if (education.length > 0) score += 20;
    if (internships.length > 0) score += 20;
    if (projects.length > 0) score += 10;
    if (certifications.length > 0) score += 5;
    return Math.min(100, score);
  }, [profile, summary, skills, education, internships, projects, certifications]);

  const missingKeywords = useMemo(() => {
    const allText = [profile.name, profile.title, summary, ...education.map(e => [e.degree, e.field, e.institution].filter(Boolean).join(' ')), ...projects.map(p => [p.name, ...p.highlights].join(' '))].join(' ').toLowerCase();
    return KEYWORDS.filter(kw => !allText.includes(kw));
  }, [profile, summary, education, projects]);

  const scoreColor = atsScore >= 80 ? 'text-emerald-400' : atsScore >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const scoreLabel = atsScore >= 80 ? 'Excellent' : atsScore >= 50 ? 'Needs work' : 'Incomplete';

  const scheduleTemplateSave = () => scheduleSave('template');

  return {
    loading, saveStatus, activeSection, setActiveSection,
    profile, summary, education, internships, projects, skills, certifications,
    template, setTemplate, sections, setSections,
    updateProfile, updateSummary,
    addEducation, updateEducation, deleteEducation,
    addInternship, updateInternship, deleteInternship,
    addProject, updateProject, deleteProject,
    addSkillCategory, updateSkillCategory, deleteSkillCategory,
    addCertification, updateCertification, deleteCertification,
    load, resumeData,
    atsScore, missingKeywords, scoreColor, scoreBg, scoreLabel,
    scheduleTemplateSave,
  };
}
