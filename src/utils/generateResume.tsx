import { pdf } from '@react-pdf/renderer';
import ATSResume from '../components/ATSResume';
import { loadResumeData } from '../lib/loaders';

import githubIcon from '../../github.png';
import linkdinIcon from '../../linkdin.png';
import locationIcon from '../../location.png';
import emailIcon from '../../email.png';

const verifyIconLoads = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

export async function generateAndDownloadResume(): Promise<void> {
  try {
    const iconsToLoad: Record<string, string> = {
      github: githubIcon as string,
      linkedin: linkdinIcon as string,
      location: locationIcon as string,
      email: emailIcon as string,
    };

    const results = await Promise.all(
      Object.entries(iconsToLoad).map(async ([key, url]) => {
        const isValid = await verifyIconLoads(url);
        return [key, isValid ? url : null] as const;
      })
    );
    const verifiedIcons: Record<string, string> = {};
    for (const [key, url] of results) {
      if (url) verifiedIcons[key] = url;
    }

    const resumeData = await loadResumeData();
    if (!resumeData) throw new Error('No resume data available');

    const blob = await pdf(<ATSResume data={resumeData} icons={verifiedIcons} />).toBlob();
    const url = URL.createObjectURL(blob);
    const name = resumeData?.personalInfo?.name?.replace(/\s+/g, '_') || 'Resume';

    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    console.error('Failed to generate resume:', err);
  }
}
