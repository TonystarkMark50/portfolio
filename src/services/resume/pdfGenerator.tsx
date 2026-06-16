import { pdf } from '@react-pdf/renderer';
import ATSResume from '../../components/ATSResume';
import type { ResumeData } from '../../lib/loaders';
import type { ResumeTemplate } from '../../components/ATSResume';

import githubIcon from '../../assets/icons/github.png';
import linkdinIcon from '../../assets/icons/linkedin.png';
import locationIcon from '../../assets/icons/location.png';
import emailIcon from '../../assets/icons/email.png';

export function getResumeIcons(): Record<string, string> {
  return {
    github: githubIcon as string,
    linkedin: linkdinIcon as string,
    location: locationIcon as string,
    email: emailIcon as string,
  };
}

export async function generatePdfBlob(
  resumeData: ResumeData,
  template: ResumeTemplate,
  icons?: Record<string, string>,
): Promise<Blob> {
  return pdf(<ATSResume data={resumeData} icons={icons || getResumeIcons()} template={template} />).toBlob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function downloadResumePdf(
  resumeData: ResumeData,
  template: ResumeTemplate,
  name: string,
): Promise<void> {
  const blob = await generatePdfBlob(resumeData, template);
  downloadBlob(blob, `${name || 'Resume'}.pdf`);
}

export async function openPdfPreview(
  resumeData: ResumeData,
  template: ResumeTemplate,
): Promise<void> {
  const blob = await generatePdfBlob(resumeData, template);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

function verifyIconLoads(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export async function getVerifiedIcons(): Promise<Record<string, string>> {
  const icons = getResumeIcons();
  const results = await Promise.all(
    Object.entries(icons).map(async ([key, url]) => {
      const isValid = await verifyIconLoads(url);
      return [key, isValid ? url : null] as const;
    }),
  );
  const verified: Record<string, string> = {};
  for (const [key, url] of results) {
    if (url) verified[key] = url;
  }
  return verified;
}
