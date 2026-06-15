import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Download, RefreshCw, Clock, CheckCircle, BarChart3, TrendingUp, Eye, ListChecks, Layout, FileDown } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { supabase } from '../../lib/supabase';
import { loadResumeData, ResumeData } from '../../lib/loaders';
import ATSResume, { ResumeTemplate } from '../ATSResume';
import ResumePreview from '../ResumePreview';

import githubIcon from '../../../github.png';
import linkdinIcon from '../../../linkdin.png';
import locationIcon from '../../../location.png';
import emailIcon from '../../../email.png';

const TEMPLATE_OPTIONS: { value: ResumeTemplate; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic ATS', desc: 'Traditional black & white, ATS-optimized' },
  { value: 'modern', label: 'Modern ATS', desc: 'Clean layout with accent styling' },
  { value: 'corporate', label: 'Corporate ATS', desc: 'Professional dark header, structured' },
];

const DEFAULT_SECTIONS = {
  education: true,
  internship: true,
  projects: true,
  skills: true,
  certifications: true,
  languages: true,
};

type ResumeSections = typeof DEFAULT_SECTIONS;

function generateTxtResume(data: ResumeData | null, summary: string): string {
  if (!data) return '';
  const p = data.personalInfo;
  const lines: string[] = [];
  lines.push(p.name.toUpperCase());
  lines.push(p.title || '');
  lines.push(`${p.location} | ${p.email}`);
  lines.push(`LinkedIn: ${p.linkedin} | GitHub: ${p.github}`);
  lines.push('');
  if (summary) { lines.push('PROFESSIONAL SUMMARY'); lines.push(summary); lines.push(''); }
  if (data.education.length > 0) {
    lines.push('EDUCATION');
    for (const edu of data.education) lines.push(`  ${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, `  ${edu.institution} | ${edu.period}${edu.gpa ? ` | CGPA: ${edu.gpa}` : ''}`);
    lines.push('');
  }
  if (data.internship) {
    lines.push('INTERNSHIP EXPERIENCE');
    lines.push(`  ${data.internship.role}`, `  ${data.internship.organization} | ${data.internship.duration}`);
    for (const r of data.internship.responsibilities) lines.push(`  \u2022 ${r}`);
    lines.push('');
  }
  if (data.projects.length > 0) {
    lines.push('ACADEMIC PROJECTS');
    for (const proj of data.projects) {
      lines.push(`  ${proj.name} (${proj.type})`);
      for (const h of proj.highlights) lines.push(`  \u2022 ${h}`);
    }
    lines.push('');
  }
  if (data.skills.length > 0) {
    lines.push('TECHNICAL SKILLS');
    for (const cat of data.skills) lines.push(`  ${cat.title}: ${cat.skills.join(', ')}`);
    lines.push('');
  }
  if (data.hasRealCertifications && data.certifications.length > 0) {
    lines.push('CERTIFICATIONS');
    for (const cert of data.certifications) lines.push(`  ${cert.title} \u2014 ${cert.organization} (${cert.issueDate})`);
    lines.push('');
  }
  if (data.languages.length > 0) { lines.push('LANGUAGES'); lines.push(`  ${data.languages.join(', ')}`); }
  return lines.join('\n');
}

function generateDocxHtml(data: ResumeData, summary: string, template: ResumeTemplate, sections: ResumeSections): string {
  const p = data.personalInfo;
  const showCerts = data.hasRealCertifications;
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resume</title></head><body style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12pt;color:#000;max-width:800px;margin:40px auto;padding:0 40px;line-height:1.4">`;
  html += `<h1 style="font-size:24pt;font-weight:700;margin-bottom:2px;border-bottom:1px solid #000;padding-bottom:8px">${p.name}</h1>`;
  html += `<p style="font-size:11pt;margin-bottom:2px">${p.title || ''}</p>`;
  html += `<p style="font-size:10pt;color:#333;margin-bottom:14px">${[p.location, p.email, p.linkedin, p.github].filter(Boolean).join(' | ')}</p>`;

  if (summary) {
    html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Professional Summary</h2>`;
    html += `<p style="font-size:11pt;line-height:1.4;margin-bottom:10px">${summary}</p>`;
  }

  if (sections.education && data.education.length > 0) {
    html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Education</h2>`;
    for (const edu of data.education) {
      html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${edu.degree}${edu.field ? ` \u2014 ${edu.field}` : ''}</p>`;
      html += `<p style="font-size:11pt;margin-bottom:1px">${edu.institution}</p>`;
      html += `<p style="font-size:11pt;color:#333;margin-bottom:6px">${edu.period}${edu.gpa ? ` | CGPA: ${edu.gpa}` : ''}</p>`;
    }
  }

  if (sections.internship && data.internship) {
    html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Internship Experience</h2>`;
    html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${data.internship.role}</p>`;
    html += `<p style="font-size:11pt;color:#333;margin-bottom:3px">${data.internship.organization}${data.internship.duration ? ` | ${data.internship.duration}` : ''}</p>`;
    for (const r of data.internship.responsibilities) {
      html += `<p style="font-size:11pt;margin:1px 0 1px 12px">\u2022 ${r}</p>`;
    }
  }

  if (sections.projects && data.projects.length > 0) {
    html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Academic Projects</h2>`;
    for (const proj of data.projects) {
      html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${proj.name}</p>`;
      html += `<p style="font-size:10pt;color:#333;margin-bottom:2px">${proj.type}${proj.completedDate ? ` | Completed: ${proj.completedDate}` : ''}</p>`;
      for (const h of proj.highlights) {
        html += `<p style="font-size:11pt;margin:1px 0 1px 12px">\u2022 ${h}</p>`;
      }
    }
  }

  if (sections.skills && data.skills.length > 0) {
    html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Technical Skills</h2>`;
    for (const cat of data.skills) {
      html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${cat.title}</p>`;
      html += `<p style="font-size:11pt;margin:0 0 4px 12px">${cat.skills.join(', ')}</p>`;
    }
  }

  if (sections.certifications && showCerts && data.certifications.length > 0) {
    html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Certifications</h2>`;
    for (const cert of data.certifications) {
      html += `<p style="font-size:11pt;font-weight:700;margin-bottom:1px">${cert.title} \u2014 ${cert.organization}</p>`;
      html += `<p style="font-size:11pt;color:#333;margin-bottom:2px">${cert.issueDate}${cert.credentialId ? ` | ID: ${cert.credentialId}` : ''}</p>`;
      if (cert.description) html += `<p style="font-size:11pt;margin-bottom:2px">${cert.description}</p>`;
      if (cert.skills?.length > 0) html += `<p style="font-size:11pt;margin:0 0 4px 12px">Skills: ${cert.skills.join(', ')}</p>`;
    }
  }

  if (sections.languages && data.languages.length > 0) {
    html += `<h2 style="font-size:13pt;font-weight:700;text-transform:uppercase;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px">Languages</h2>`;
    html += `<p style="font-size:11pt;margin-bottom:4px">${data.languages.join(', ')}</p>`;
  }

  html += '</body></html>';
  return html;
}

export default function AdminResume() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [summary, setSummary] = useState('');
  const [template, setTemplate] = useState<ResumeTemplate>('classic');
  const [sections, setSections] = useState<ResumeSections>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const settingsTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const settingsRef = useRef({ summary: '', template: 'classic' as ResumeTemplate, sections: DEFAULT_SECTIONS });

  const stats = {
    skills: resumeData?.skills.length || 0,
    education: resumeData?.education.length || 0,
    internships: resumeData?.internship ? 1 : 0,
    certs: resumeData?.certifications.length || 0,
    projects: resumeData?.projects.length || 0,
  };

  const resumeScore = (() => {
    let score = 0;
    if (resumeData?.personalInfo.name) score += 10;
    if (resumeData?.personalInfo.email) score += 5;
    if (summary || resumeData?.professionalSummary?.length) score += 15;
    if (stats.skills > 0) score += 15;
    if (stats.education > 0) score += 20;
    if (stats.internships > 0) score += 20;
    if (stats.projects > 0) score += 10;
    if (stats.certs > 0) score += 5;
    return Math.min(100, score);
  })();

  const missingSections: string[] = [];
  if (!stats.education) missingSections.push('Education');
  if (!stats.internships) missingSections.push('Internship');
  if (!stats.projects) missingSections.push('Projects');
  if (!stats.skills) missingSections.push('Skills');
  if (!stats.certs) missingSections.push('Certifications');

  const load = useCallback(async () => {
    const data = await loadResumeData();
    setResumeData(data);
    const { data: settings } = await supabase.from('site_settings')
      .select('resume_summary, resume_template, resume_sections, updated_at')
      .limit(1).maybeSingle();
    if (settings) {
      const s = settings as any;
      if (s.resume_summary) setSummary(s.resume_summary);
      if (s.resume_template && ['classic', 'modern', 'corporate'].includes(s.resume_template)) {
        setTemplate(s.resume_template as ResumeTemplate);
      }
      if (s.resume_sections) {
        const parsed = typeof s.resume_sections === 'string' ? JSON.parse(s.resume_sections) : s.resume_sections;
        setSections({ ...DEFAULT_SECTIONS, ...parsed });
      }
      if (s.updated_at) setLastSaved(new Date(s.updated_at).toLocaleString());
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    settingsRef.current = { summary, template, sections };
  }, [summary, template, sections]);

  useEffect(() => {
    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [load]);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    const cur = settingsRef.current;
    await supabase.from('site_settings').upsert({
      resume_summary: cur.summary,
      resume_template: cur.template,
      resume_sections: JSON.stringify(cur.sections),
    });
    setSaving(false);
    setLastSaved(new Date().toLocaleString());
  }, []);

  function scheduleSettingsSave() {
    if (settingsTimerRef.current) clearTimeout(settingsTimerRef.current);
    settingsTimerRef.current = setTimeout(saveSettings, 1500);
  }

  const handleChangeSummary = (val: string) => {
    setSummary(val);
    scheduleSettingsSave();
  };

  const handleChangeTemplate = (val: ResumeTemplate) => {
    setTemplate(val);
    scheduleSettingsSave();
  };

  const toggleSection = (key: keyof ResumeSections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
    scheduleSettingsSave();
  };

  const handleDownloadPdf = async () => {
    if (!resumeData) return;
    const icons = { github: githubIcon as string, linkedin: linkdinIcon as string, location: locationIcon as string, email: emailIcon as string };
    const filtered: ResumeData = { ...resumeData, languages: sections.languages ? resumeData.languages : [] };
    if (!sections.education) filtered.education = [];
    if (!sections.internship) filtered.internship = null;
    if (!sections.projects) filtered.projects = [];
    if (!sections.skills) filtered.skills = [];
    if (!sections.certifications) filtered.certifications = [];
    filtered.professionalSummary = summary ? [summary] : [];

    const blob = await pdf(<ATSResume data={filtered} icons={icons} template={template} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.name || 'Resume'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleDownloadTxt = () => {
    if (!resumeData) return;
    const txt = generateTxtResume(resumeData, summary);
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.name || 'Resume'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleDownloadDocx = () => {
    if (!resumeData) return;
    const html = generateDocxHtml(resumeData, summary, template, sections);
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.name || 'Resume'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const scoreColor = resumeScore >= 80 ? 'text-emerald-400' : resumeScore >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = resumeScore >= 80 ? 'bg-emerald-500' : resumeScore >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const scoreLabel = resumeScore >= 80 ? 'Excellent' : resumeScore >= 50 ? 'Needs work' : 'Incomplete';

  if (loading) return <div className="animate-pulse space-y-6"><div className="h-32 bg-gray-800 rounded-2xl" /><div className="h-96 bg-gray-800 rounded-2xl" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Resume Studio</h1>
          <p className="text-sm text-gray-400 mt-0.5">ATS-optimized live resume \u2014 auto-generated from portfolio data</p>
        </div>
        <div className="flex items-center gap-2">
          {saving ? (
            <span className="flex items-center gap-1.5 text-xs text-blue-400"><Clock className="w-3 h-3 animate-spin" /> Saving...</span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" /> Saved {lastSaved}</span>
          ) : null}
          <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
            <FileText className="w-3.5 h-3.5" /> TXT
          </button>
          <button onClick={handleDownloadDocx} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
            <FileDown className="w-3.5 h-3.5" /> DOC
          </button>
          <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><FileText className="w-4.5 h-4.5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Resume</p>
              <p className="text-sm font-semibold text-white">{resumeData?.personalInfo.name || 'N/A'}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600">Auto-generated from CMS</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10"><BarChart3 className="w-4.5 h-4.5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500">ATS Score</p>
              <p className={`text-sm font-semibold ${scoreColor}`}>{resumeScore}/100 \u00B7 {scoreLabel}</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${scoreBg}`} style={{ width: `${resumeScore}%` }} />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Clock className="w-4.5 h-4.5 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm font-semibold text-white">{lastSaved || 'Live'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Auto-sync enabled
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center"><TrendingUp className="w-4.5 h-4.5 text-purple-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Coverage</p>
              <p className="text-sm font-semibold text-white">{5 - missingSections.length}/5</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[stats.skills > 0, stats.education > 0, stats.internships > 0, stats.certs > 0, stats.projects > 0].map((filled, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${filled ? 'bg-blue-500' : 'bg-gray-800'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Editor Panel */}
        <div className="xl:col-span-2 space-y-5">

          {/* Professional Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Professional Summary</h3>
            </div>
            <textarea
              value={summary}
              onChange={e => handleChangeSummary(e.target.value)}
              placeholder="Write a brief professional summary for your resume..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <p className="text-[10px] text-gray-600 mt-1.5">Auto-saves to resume</p>
          </div>

          {/* Missing Sections */}
          {missingSections.length > 0 && (
            <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Missing Sections</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSections.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs border border-amber-800/50">{s}</span>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-2">Add content to improve your ATS score</p>
            </div>
          )}

          {/* Template Selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Resume Template</h3>
            </div>
            <div className="space-y-2">
              {TEMPLATE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => handleChangeTemplate(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${template === opt.value ? 'bg-blue-500/10 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${template === opt.value ? 'text-blue-400' : 'text-white'}`}>{opt.label}</span>
                    {template === opt.value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section Visibility */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Section Visibility</h3>
            </div>
            <p className="text-[10px] text-gray-500 mb-3">Toggle which sections appear in the resume</p>
            <div className="space-y-2">
              {(Object.keys(DEFAULT_SECTIONS) as (keyof ResumeSections)[]).map(key => (
                <label key={key} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                  <span className="text-xs text-gray-300 capitalize">{key}</span>
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${sections[key] ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => toggleSection(key)}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${sections[key] ? 'translate-x-4' : ''}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Live HTML Resume Preview */}
        <div className="xl:col-span-3 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800/80 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-gray-400 ml-2">
                Previewing: <span className="text-gray-200 font-medium">ATS Resume</span>
                <span className="text-gray-600 ml-1.5">\u00B7 {template.charAt(0).toUpperCase() + template.slice(1)}</span>
              </span>
            </div>
          </div>
          <div className="flex justify-center bg-gray-100 p-6 overflow-y-auto" style={{ maxHeight: 800, minHeight: 500 }}>
            {resumeData ? (
              <div className="w-full max-w-[800px] shadow-xl rounded-lg overflow-hidden">
                <ResumePreview
                  data={resumeData}
                  summary={summary}
                  template={template}
                  sections={sections}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No resume data found. Add content in other sections first.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
