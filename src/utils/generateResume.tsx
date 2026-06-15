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
  const iconsToLoad: Record<string, string> = {
    github: githubIcon as string,
    linkedin: linkdinIcon as string,
    location: locationIcon as string,
    email: emailIcon as string,
  };

  const verifiedIcons: Record<string, string> = {};
  for (const [key, url] of Object.entries(iconsToLoad)) {
    const isValid = await verifyIconLoads(url);
    if (isValid) {
      verifiedIcons[key] = url;
    }
  }

  const resumeData = await loadResumeData();
  const blob = await pdf(<ATSResume data={resumeData} icons={verifiedIcons} />).toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'Jagadeesh_T_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
