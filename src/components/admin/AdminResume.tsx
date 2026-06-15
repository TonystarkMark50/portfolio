import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FileText, Download, Clock, CheckCircle, AlertCircle, Plus, Trash2, GripVertical,
  ChevronDown, ChevronUp, Edit3, X, Save, Eye, BarChart3, TrendingUp, FileDown,
  User, Mail, Phone, MapPin, Linkedin, Github, BookOpen, Award, Briefcase,
  Code2, Layers, Sparkles, ListChecks
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { supabase } from '../../lib/supabase';
import { ResumeData, EducationItem, InternshipData, ProjectItem, SkillCategory, CertificationItem } from '../../lib/loaders';
import ATSResume, { ResumeTemplate } from '../ATSResume';
import ResumePreview from '../ResumePreview';
import { getProfile, getEducation, getInternships, getProjects, getSkills, getCertifications, getContactInfo } from '../../lib/api';
import githubIcon from '../../../github.png';
import linkdinIcon from '../../../linkdin.png';
import locationIcon from '../../../location.png';
import emailIcon from '../../../email.png';

// ─── Types ───────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type EditableSection = 'personal' | 'summary' | 'education' | 'internship' | 'projects' | 'skills' | 'certifications';

interface EditableProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

const DEFAULT_SECTIONS = { education: true, internship: true, projects: true, skills: true, certifications: true, languages: true };
type ResumeSections = typeof DEFAULT_SECTIONS;

const TEMPLATE_OPTIONS: { value: ResumeTemplate; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic ATS', desc: 'Traditional black & white, ATS-optimized' },
  { value: 'modern', label: 'Modern ATS', desc: 'Clean layout with accent styling' },
  { value: 'corporate', label: 'Corporate ATS', desc: 'Professional dark header, structured' },
];

// ─── Sub-components ─────────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  return (
    <span className={`flex items-center gap-1.5 text-xs ${status === 'saving' ? 'text-blue-400' : status === 'saved' ? 'text-emerald-400' : 'text-red-400'}`}>
      {status === 'saving' && <><Clock className="w-3 h-3 animate-spin" /> Saving...</>}
      {status === 'saved' && <><CheckCircle className="w-3 h-3" /> Saved</>}
      {status === 'error' && <><AlertCircle className="w-3 h-3" /> Error</>}
    </span>
  );
}

function SectionHeader({ title, icon: Icon, count, onAdd }: { title: string; icon: React.ElementType; count?: number; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {count !== undefined && <span className="text-[10px] text-gray-500">({count})</span>}
      </div>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-medium hover:bg-blue-500/20 transition-colors">
          <Plus className="w-3 h-3" /> Add
        </button>
      )}
    </div>
  );
}

function InlineField({ value, onSave, placeholder, multiline, className }: {
  value: string; onSave: (v: string) => void; placeholder?: string; multiline?: boolean; className?: string;
}) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setVal(value); }, [value]);

  useEffect(() => {
    if (edit) ref.current?.focus();
  }, [edit]);

  function commit() {
    setEdit(false);
    if (val !== value) onSave(val);
  }

  if (!edit) {
    return (
      <div onClick={() => setEdit(true)} className={`cursor-text hover:bg-gray-700/50 rounded px-1.5 -ml-1.5 transition-colors ${className || ''}`}>
        {value || <span className="text-gray-600 italic">{placeholder || 'Click to edit...'}</span>}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Escape') { setVal(value); setEdit(false); } }}
        className="w-full px-2 py-1 rounded bg-gray-700 border border-blue-500 text-sm text-white outline-none resize-none"
        rows={3}
      />
    );
  }

  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value); setEdit(false); } }}
      className="w-full px-2 py-1 rounded bg-gray-700 border border-blue-500 text-sm text-white outline-none"
    />
  );
}

function ArrayField({ items, onAdd, onRemove, onEdit, placeholder }: {
  items: string[]; onAdd: () => void; onRemove: (i: number) => void; onEdit: (i: number, v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 group">
          <span className="text-gray-500 text-xs">•</span>
          <input
            value={item}
            onChange={e => onEdit(i, e.target.value)}
            className="flex-1 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-white outline-none focus:border-blue-500 transition-colors"
            placeholder={placeholder}
          />
          <button onClick={() => onRemove(i)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/20 text-red-400">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={onAdd} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-400 transition-colors">
        <Plus className="w-3 h-3" /> Add item
      </button>
    </div>
  );
}

// ─── Editable Item Card ──────────────────────────────────

function EditableCard({ children, onDelete }: { children: React.ReactNode; onDelete?: () => void }) {
  return (
    <div className="relative bg-gray-800/50 rounded-lg border border-gray-700/50 p-3 group">
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-gray-600 mt-0.5 cursor-grab flex-shrink-0" />
        <div className="flex-1 min-w-0">{children}</div>
        {onDelete && (
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-red-400 flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Resume Builder ─────────────────────────────────

export default function AdminResume() {
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [activeSection, setActiveSection] = useState<EditableSection | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight;
      setPageCount(Math.max(1, Math.ceil(h / 950)));
    }
  }, [resumeData, zoom, template]);

  function scrollToTop() {
    previewRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function openFullPreview() {
    if (!resumeData) return;
    const icons = { github: githubIcon as string, linkedin: linkdinIcon as string, location: locationIcon as string, email: emailIcon as string };
    const blob = await pdf(<ATSResume data={resumeData} icons={icons} template={template} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  // ── Data State ──
  const [profile, setProfile] = useState<EditableProfile>({ name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '' });
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState<Education[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [template, setTemplate] = useState<ResumeTemplate>('classic');
  const [sections, setSections] = useState<ResumeSections>(DEFAULT_SECTIONS);

  // ── Load all data ──
  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, eduRes, internRes, projRes, skillRes, certRes, contactRes] = await Promise.all([
      getProfile(), getEducation(), getInternships(), getProjects(), getSkills(), getCertifications(), getContactInfo(),
    ]);
    if (pRes.data) setProfile({
      name: pRes.data.name || '', title: pRes.data.title || '', email: pRes.data.email || '',
      phone: pRes.data.phone || '', location: pRes.data.location || '',
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

    const { data: settings } = await supabase.from('site_settings')
      .select('resume_summary, resume_template, resume_sections').limit(1).maybeSingle();
    if (settings) {
      if (settings.resume_summary) setSummary(settings.resume_summary);
      if (settings.resume_template && ['classic', 'modern', 'corporate'].includes(settings.resume_template)) {
        setTemplate(settings.resume_template as ResumeTemplate);
      }
      if (settings.resume_sections) {
        const parsed = typeof settings.resume_sections === 'string' ? JSON.parse(settings.resume_sections) : settings.resume_sections;
        setSections({ ...DEFAULT_SECTIONS, ...parsed });
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Construct ResumeData for preview ──
  const resumeData: ResumeData | null = useMemo(() => {
    if (!profile.name && !profile.email) return null;
    const eduItems: EducationItem[] = education.map((e, i) => ({
      id: i + 1, degree: e.degree, field: e.field || null, institution: e.institution,
      period: e.period || null, location: e.location || null, gpa: e.gpa || null,
      status: e.status || null, current: e.current, description: e.description || null,
    }));
    const internData: InternshipData | null = internships.length > 0 ? {
      id: 1, organization: internships[0].organization, department: internships[0].department,
      role: internships[0].role, duration: internships[0].duration || null,
      location: internships[0].location || null, type: internships[0].type,
      description: internships[0].description, responsibilities: internships[0].responsibilities,
      learnings: internships[0].learnings, impact: internships[0].impact,
      certificateUrl: internships[0].certificate_url || null, completed: internships[0].completed,
    } : null;
    const projItems: ProjectItem[] = projects.map(p => ({
      id: p.id, name: p.name, type: p.type, status: p.status, completedDate: p.completed_date || null,
      highlights: p.highlights, technologies: p.technologies, reportUrl: p.report_url || null,
    }));
    const skillItems: SkillCategory[] = skills.map(s => ({
      title: s.category, skills: s.skills, gradient: s.gradient || 'from-primary-500/20 to-accent-500/20',
    }));
    const certItems: CertificationItem[] = certifications.map((c, i) => ({
      id: i + 1, title: c.title, organization: c.organization, platform: c.platform || null,
      issueDate: c.issue_date || null, credentialId: c.credential_id || null,
      certificateUrl: c.certificate_url || null, embedUrl: c.embed_url || null,
      description: c.description || null, category: c.category || null,
      skills: c.skills, status: c.status, logoUrl: c.logo_url || null,
    }));
    return {
      personalInfo: {
        name: profile.name, title: profile.title, location: profile.location,
        email: profile.email, linkedin: profile.linkedin, github: profile.github,
      },
      professionalSummary: summary ? [summary] : [],
      education: eduItems, internship: internData, projects: projItems,
      skills: skillItems, certifications: certItems,
      hasRealCertifications: certItems.length > 0,
      languages: [],
    };
  }, [profile, summary, education, internships, projects, skills, certifications]);

  // ── Auto Save ──
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
          await supabase.from('site_settings').upsert({ resume_summary: summary });
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
  }, [profile, summary, template, sections, education, internships, projects, skills, certifications]);

  // ── Profile handlers ──
  const updateProfile = (key: keyof EditableProfile, val: string) => {
    setProfile(prev => ({ ...prev, [key]: val }));
    scheduleSave('profile');
  };

  // ── Summary handler ──
  const updateSummary = (val: string) => {
    setSummary(val);
    scheduleSave('summary');
  };

  // ── Education handlers ──
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

  // ── Internship handlers ──
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

  // ── Project handlers ──
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

  // ── Skills handlers ──
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

  // ── Certification handlers ──
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

  // ── ATS Score ──
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

  const missingKeywords: string[] = [];
  const allText = [profile.name, profile.title, summary, ...education.map(e => [e.degree, e.field, e.institution].filter(Boolean).join(' ')), ...projects.map(p => [p.name, ...p.highlights].join(' '))].join(' ').toLowerCase();
  const keywords = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'project management', 'technical', 'design', 'development', 'research'];
  for (const kw of keywords) {
    if (!allText.includes(kw)) missingKeywords.push(kw);
  }

  const scoreColor = atsScore >= 80 ? 'text-emerald-400' : atsScore >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const scoreLabel = atsScore >= 80 ? 'Excellent' : atsScore >= 50 ? 'Needs work' : 'Incomplete';

  // ── Export ──
  const handleDownloadPdf = async () => {
    if (!resumeData) return;
    const icons = { github: githubIcon as string, linkedin: linkdinIcon as string, location: locationIcon as string, email: emailIcon as string };
    const blob = await pdf(<ATSResume data={resumeData} icons={icons} template={template} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name || 'Resume'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleDownloadDocx = () => {
    if (!resumeData) return;
    const p = resumeData.personalInfo;
    const showCerts = resumeData.hasRealCertifications;
    const renderSections = {
      education: sections.education && resumeData.education.length > 0,
      internship: sections.internship && resumeData.internship !== null,
      projects: sections.projects && resumeData.projects.length > 0,
      skills: sections.skills && resumeData.skills.length > 0,
      certifications: sections.certifications && showCerts && resumeData.certifications.length > 0,
    };
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resume</title></head><body style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12pt;color:#000;max-width:800px;margin:40px auto;padding:0 40px;line-height:1.4">`;
    html += `<h1 style="font-size:24pt;font-weight:700;margin-bottom:2px;border-bottom:1px solid #000;padding-bottom:8px">${p.name}</h1>`;
    html += `<p style="font-size:11pt;margin-bottom:2px">${p.title || ''}</p>`;
    html += `<p style="font-size:10pt;color:#333;margin-bottom:14px">${[p.location, p.email, p.linkedin, p.github].filter(Boolean).join(' | ')}</p>`;
    if (summary) html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Professional Summary</h2><p style="font-size:11pt;line-height:1.4;margin-bottom:10px">${summary}</p>`;
    if (renderSections.education) {
      html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Education</h2>`;
      for (const edu of resumeData.education) {
        html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${edu.degree}${edu.field ? ` — ${edu.field}` : ''}</p>`;
        html += `<p style="font-size:11pt;margin-bottom:1px">${edu.institution}</p>`;
        html += `<p style="font-size:11pt;color:#333;margin-bottom:6px">${edu.period}${edu.gpa ? ` | CGPA: ${edu.gpa}` : ''}</p>`;
      }
    }
    if (renderSections.internship && resumeData.internship) {
      html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Internship Experience</h2>`;
      html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${resumeData.internship.role}</p>`;
      html += `<p style="font-size:11pt;color:#333;margin-bottom:3px">${resumeData.internship.organization}${resumeData.internship.duration ? ` | ${resumeData.internship.duration}` : ''}</p>`;
      for (const r of resumeData.internship.responsibilities) html += `<p style="font-size:11pt;margin:1px 0 1px 12px">• ${r}</p>`;
    }
    if (renderSections.projects) {
      html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Academic Projects</h2>`;
      for (const proj of resumeData.projects) {
        html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${proj.name}</p>`;
        html += `<p style="font-size:10pt;color:#333;margin-bottom:2px">${proj.type}${proj.completedDate ? ` | Completed: ${proj.completedDate}` : ''}</p>`;
        for (const h of proj.highlights) html += `<p style="font-size:11pt;margin:1px 0 1px 12px">• ${h}</p>`;
      }
    }
    if (renderSections.skills) {
      html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Technical Skills</h2>`;
      for (const cat of resumeData.skills) html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${cat.title}</p><p style="font-size:11pt;margin:0 0 4px 12px">${cat.skills.join(', ')}</p>`;
    }
    if (renderSections.certifications) {
      html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Certifications</h2>`;
      for (const cert of resumeData.certifications) {
        html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${cert.title} — ${cert.organization}</p>`;
        html += `<p style="font-size:11pt;color:#333;margin-bottom:6px">${cert.issueDate}${cert.credentialId ? ` | ID: ${cert.credentialId}` : ''}</p>`;
      }
    }
    html += '</body></html>';
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name || 'Resume'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // ── Section selector component ──
  function SectionPanel({ section, label, icon: Icon, children }: { section: EditableSection; label: string; icon: React.ElementType; children: React.ReactNode }) {
    const isOpen = activeSection === section;
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <button onClick={() => setActiveSection(isOpen ? null : section)} className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors">
          <span className="flex items-center gap-2 text-sm font-medium text-white">
            <Icon className="w-4 h-4 text-blue-400" />
            {label}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
        {isOpen && <div className="px-3 pb-3 space-y-2">{children}</div>}
      </div>
    );
  }

  if (loading) return <div className="animate-pulse space-y-6"><div className="h-32 bg-gray-800 rounded-2xl" /><div className="h-96 bg-gray-800 rounded-2xl" /></div>;

  return (
    <div className="space-y-6 max-w-full">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Resume Studio</h1>
          <p className="text-xs text-gray-500 mt-0.5">Edit resume content directly — live preview updates automatically</p>
        </div>
        <div className="flex items-center gap-2">
          <SaveIndicator status={saveStatus} />
          <button onClick={handleDownloadDocx} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
            <FileDown className="w-3.5 h-3.5" /> DOC
          </button>
          <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
            <Save className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ─── ATS Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><FileText className="w-4.5 h-4.5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Resume</p>
              <p className="text-sm font-semibold text-white">{profile.name || 'N/A'}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600">{education.length} edu · {projects.length} projects · {skills.length} skills</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><BarChart3 className="w-4.5 h-4.5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500">ATS Score</p>
              <p className={`text-sm font-semibold ${scoreColor}`}>{atsScore}/100 · {scoreLabel}</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${scoreBg}`} style={{ width: `${atsScore}%` }} />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Sparkles className="w-4.5 h-4.5 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Strength</p>
              <p className="text-sm font-semibold text-white">{atsScore >= 80 ? 'Strong' : atsScore >= 50 ? 'Moderate' : 'Weak'}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600">{5 - missingKeywords.length}/{keywords.length} keywords found</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center"><TrendingUp className="w-4.5 h-4.5 text-purple-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Suggestions</p>
              <p className="text-sm font-semibold text-white">{missingKeywords.length}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[skills.length > 0, education.length > 0, internships.length > 0, certifications.length > 0, projects.length > 0].map((filled, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${filled ? 'bg-blue-500' : 'bg-gray-800'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Split Layout ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── LEFT PANEL: Edit Resume Content ── */}
        <div className="xl:col-span-2 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {/* Personal Info */}
          <SectionPanel section="personal" label="Personal Information" icon={User}>
            <div className="space-y-2">
              {[
                { key: 'name' as const, label: 'Name', icon: User },
                { key: 'title' as const, label: 'Title', icon: Edit3 },
                { key: 'email' as const, label: 'Email', icon: Mail },
                { key: 'phone' as const, label: 'Phone', icon: Phone },
                { key: 'location' as const, label: 'Location', icon: MapPin },
                { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
                { key: 'github' as const, label: 'GitHub', icon: Github },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">{field.label}</label>
                  <InlineField value={profile[field.key]} onSave={v => updateProfile(field.key, v)} placeholder={`Enter ${field.label.toLowerCase()}...`} />
                </div>
              ))}
            </div>
          </SectionPanel>

          {/* Professional Summary */}
          <SectionPanel section="summary" label="Professional Summary" icon={FileText}>
            <textarea
              value={summary}
              onChange={e => updateSummary(e.target.value)}
              placeholder="Write a professional summary for your resume..."
              rows={5}
              className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <p className="text-[10px] text-gray-600">Auto-saves after 1 second of inactivity</p>
          </SectionPanel>

          {/* Education */}
          <SectionPanel section="education" label="Education" icon={BookOpen}>
            <div className="space-y-2">
              {education.map(edu => (
                <EditableCard key={edu.id} onDelete={() => deleteEducation(edu.id)}>
                  <InlineField value={edu.degree} onSave={v => updateEducation(edu.id, 'degree', v)} placeholder="Degree" className="text-sm font-medium" />
                  <InlineField value={edu.institution} onSave={v => updateEducation(edu.id, 'institution', v)} placeholder="Institution" className="text-xs text-gray-400" />
                  <div className="flex gap-2 mt-1">
                    <InlineField value={edu.field || ''} onSave={v => updateEducation(edu.id, 'field', v)} placeholder="Field" className="text-[10px] text-gray-500" />
                    <InlineField value={edu.period || ''} onSave={v => updateEducation(edu.id, 'period', v)} placeholder="Period" className="text-[10px] text-gray-500" />
                    <InlineField value={edu.gpa || ''} onSave={v => updateEducation(edu.id, 'gpa', v)} placeholder="GPA" className="text-[10px] text-gray-500" />
                  </div>
                </EditableCard>
              ))}
              <button onClick={addEducation} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
                + Add Education
              </button>
            </div>
          </SectionPanel>

          {/* Internships */}
          <SectionPanel section="internship" label="Internships" icon={Briefcase}>
            <div className="space-y-2">
              {internships.map(intern => (
                <EditableCard key={intern.id} onDelete={() => deleteInternship(intern.id)}>
                  <InlineField value={intern.role} onSave={v => updateInternship(intern.id, 'role', v)} placeholder="Role" className="text-sm font-medium" />
                  <InlineField value={intern.organization} onSave={v => updateInternship(intern.id, 'organization', v)} placeholder="Organization" className="text-xs text-gray-400" />
                  <InlineField value={intern.duration || ''} onSave={v => updateInternship(intern.id, 'duration', v)} placeholder="Duration" className="text-[10px] text-gray-500" />
                  <div className="mt-2">
                    <p className="text-[10px] text-gray-600 mb-1">Responsibilities</p>
                    <ArrayField
                      items={intern.responsibilities}
                      onAdd={() => updateInternship(intern.id, 'responsibilities', [...intern.responsibilities, ''])}
                      onRemove={i => updateInternship(intern.id, 'responsibilities', intern.responsibilities.filter((_: string, idx: number) => idx !== i))}
                      onEdit={(i, v) => {
                        const next = [...intern.responsibilities];
                        next[i] = v;
                        updateInternship(intern.id, 'responsibilities', next);
                      }}
                      placeholder="Add responsibility..."
                    />
                  </div>
                </EditableCard>
              ))}
              <button onClick={addInternship} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
                + Add Internship
              </button>
            </div>
          </SectionPanel>

          {/* Projects */}
          <SectionPanel section="projects" label="Projects" icon={Code2}>
            <div className="space-y-2">
              {projects.map(proj => (
                <EditableCard key={proj.id} onDelete={() => deleteProject(proj.id)}>
                  <InlineField value={proj.name} onSave={v => updateProject(proj.id, 'name', v)} placeholder="Project name" className="text-sm font-medium" />
                  <InlineField value={proj.type} onSave={v => updateProject(proj.id, 'type', v)} placeholder="Type" className="text-xs text-gray-400" />
                  <InlineField value={proj.completed_date || ''} onSave={v => updateProject(proj.id, 'completed_date', v)} placeholder="Completed date" className="text-[10px] text-gray-500" />
                  <div className="mt-2">
                    <p className="text-[10px] text-gray-600 mb-1">Highlights</p>
                    <ArrayField
                      items={proj.highlights}
                      onAdd={() => updateProject(proj.id, 'highlights', [...proj.highlights, ''])}
                      onRemove={i => updateProject(proj.id, 'highlights', proj.highlights.filter((_: string, idx: number) => idx !== i))}
                      onEdit={(i, v) => {
                        const next = [...proj.highlights];
                        next[i] = v;
                        updateProject(proj.id, 'highlights', next);
                      }}
                      placeholder="Add highlight..."
                    />
                  </div>
                </EditableCard>
              ))}
              <button onClick={addProject} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
                + Add Project
              </button>
            </div>
          </SectionPanel>

          {/* Skills */}
          <SectionPanel section="skills" label="Skills" icon={Layers}>
            <div className="space-y-2">
              {skills.map(skill => (
                <EditableCard key={skill.id} onDelete={() => deleteSkillCategory(skill.id)}>
                  <InlineField value={skill.category} onSave={v => updateSkillCategory(skill.id, 'category', v)} placeholder="Category name" className="text-sm font-medium" />
                  <div className="mt-1.5">
                    <ArrayField
                      items={skill.skills}
                      onAdd={() => updateSkillCategory(skill.id, 'skills', [...skill.skills, ''])}
                      onRemove={i => updateSkillCategory(skill.id, 'skills', skill.skills.filter((_: string, idx: number) => idx !== i))}
                      onEdit={(i, v) => {
                        const next = [...skill.skills];
                        next[i] = v;
                        updateSkillCategory(skill.id, 'skills', next);
                      }}
                      placeholder="Add skill..."
                    />
                  </div>
                </EditableCard>
              ))}
              <button onClick={addSkillCategory} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
                + Add Skill Category
              </button>
            </div>
          </SectionPanel>

          {/* Certifications */}
          <SectionPanel section="certifications" label="Certifications" icon={Award}>
            <div className="space-y-2">
              {certifications.map(cert => (
                <EditableCard key={cert.id} onDelete={() => deleteCertification(cert.id)}>
                  <InlineField value={cert.title} onSave={v => updateCertification(cert.id, 'title', v)} placeholder="Certification title" className="text-sm font-medium" />
                  <InlineField value={cert.organization} onSave={v => updateCertification(cert.id, 'organization', v)} placeholder="Organization" className="text-xs text-gray-400" />
                  <div className="flex gap-2 mt-1">
                    <InlineField value={cert.issue_date || ''} onSave={v => updateCertification(cert.id, 'issue_date', v)} placeholder="Issue date" className="text-[10px] text-gray-500" />
                    <InlineField value={cert.credential_id || ''} onSave={v => updateCertification(cert.id, 'credential_id', v)} placeholder="Credential ID" className="text-[10px] text-gray-500" />
                  </div>
                </EditableCard>
              ))}
              <button onClick={addCertification} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
                + Add Certification
              </button>
            </div>
          </SectionPanel>

          {/* Template & Visibility */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <SectionHeader title="Resume Template" icon={Eye} />
            <div className="space-y-1.5">
              {TEMPLATE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => { setTemplate(opt.value); scheduleSave('template'); }}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${template === opt.value ? 'bg-blue-500/10 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${template === opt.value ? 'text-blue-400' : 'text-white'}`}>{opt.label}</span>
                    {template === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <SectionHeader title="Section Visibility" icon={ListChecks} />
            <div className="space-y-1.5">
              {(Object.keys(DEFAULT_SECTIONS) as (keyof ResumeSections)[]).map(key => (
                <label key={key} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                  <span className="text-xs text-gray-300 capitalize">{key}</span>
                  <div className={`relative w-8 h-4 rounded-full transition-colors ${sections[key] ? 'bg-blue-500' : 'bg-gray-700'}`}
                    onClick={() => { setSections(prev => ({ ...prev, [key]: !prev[key] })); scheduleSave('template'); }}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${sections[key] ? 'translate-x-4' : ''}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Live Resume Preview ── */}
        <div className="xl:col-span-3 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          {/* Sticky Toolbar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-gray-400 ml-1">
                Live Preview · <span className="text-gray-200 font-medium">{template.charAt(0).toUpperCase() + template.slice(1)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="px-1.5 py-0.5 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="Zoom out">−</button>
              <span className="text-[10px] text-gray-400 w-8 text-center tabular-nums">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(150, zoom + 25))} className="px-1.5 py-0.5 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="Zoom in">+</button>
              <span className="text-gray-600 text-[10px]">|</span>
              <span className="text-[10px] text-gray-400 tabular-nums">{pageCount} pg</span>
              <span className="text-gray-600 text-[10px]">|</span>
              <button onClick={scrollToTop} className="text-[10px] text-gray-400 hover:text-white transition-colors" title="Scroll to top">Top</button>
              <button onClick={openFullPreview} className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors" title="Open full preview">Open</button>
              <button onClick={handleDownloadPdf} className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors" title="Download PDF">PDF</button>
            </div>
          </div>
          {/* Scrollable Preview */}
          <div ref={previewRef} className="flex-1 bg-gray-100 p-6 overflow-y-auto overflow-x-hidden scrollbar-thin" style={{ maxHeight: 'calc(100vh - 300px)', minHeight: 500 }}>
            {resumeData ? (
              <div className="flex justify-center">
                <div ref={contentRef} className="w-full max-w-[800px] shadow-xl rounded-lg" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                  <ResumePreview data={resumeData} summary={summary} template={template} sections={sections} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-3 min-h-[400px]">
                <FileText className="w-12 h-12 text-gray-600" />
                <p>No resume data yet. Edit fields on the left to build your resume.</p>
              </div>
            )}
          </div>
          <style>{`
            .scrollbar-thin::-webkit-scrollbar { width: 6px; }
            .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
            .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #64748b; }
            .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #475569 transparent; }
          `}</style>
        </div>
      </div>
    </div>
  );
}
