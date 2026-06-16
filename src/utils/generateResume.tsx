import { loadResumeData } from '../lib/loaders';
import { getVerifiedIcons, generatePdfBlob, downloadBlob } from '../services/resume/pdfGenerator';

export async function generateAndDownloadResume(): Promise<void> {
  try {
    const verifiedIcons = await getVerifiedIcons();
    const resumeData = await loadResumeData();
    if (!resumeData) throw new Error('No resume data available');

    const blob = await generatePdfBlob(resumeData, 'classic', verifiedIcons);
    const name = resumeData?.personalInfo?.name?.replace(/\s+/g, '_') || 'Resume';
    downloadBlob(blob, `${name}_Resume.pdf`);
  } catch (err) {
    console.error('Failed to generate resume:', err);
  }
}
