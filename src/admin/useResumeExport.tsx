import type { ResumeTemplate } from '../components/ATSResume';
import type { ResumeData } from '../lib/loaders';
import type { ResumeSections } from './useResumeData';
import { downloadResumePdf, openPdfPreview } from '../services/resume/pdfGenerator';

export function useResumeExport() {
  function downloadPdf(resumeData: ResumeData, template: ResumeTemplate, name: string) {
    return downloadResumePdf(resumeData, template, name);
  }

  function downloadDocx(resumeData: ResumeData, summary: string, sections: ResumeSections) {
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
    link.download = `${p.name || 'Resume'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function openFullPreview(resumeData: ResumeData, template: ResumeTemplate) {
    return openPdfPreview(resumeData, template);
  }

  return { downloadPdf, downloadDocx, openFullPreview };
}
