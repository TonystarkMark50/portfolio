export interface PortfolioData {
  profile: { name?: string; title?: string; avatar_url?: string; email?: string; linkedin?: string; github?: string; location?: string } | null;
  about: { content?: string }[] | null;
  projects: { id: string; name: string; description?: string; technologies?: string[]; status?: string }[];
  skills: { id: string; skills: string[] }[];
  education: { id: string; degree?: string; institution?: string }[];
  certifications: { id: string; title: string; organization?: string; certificate_url?: string }[];
  internships: { id: string; company?: string; role?: string }[];
  seo: { site_title?: string; seo_description?: string } | null;
  contact: { email?: string; github?: string; linkedin?: string } | null;
  analytics: boolean;
}

export interface HealthCheck {
  id: string;
  label: string;
  category: 'profile' | 'content' | 'seo' | 'engagement';
  passed: boolean;
  score: number;
  recommendation: string;
}

export interface HealthResult {
  overallScore: number;
  checks: HealthCheck[];
  passedChecks: number;
  totalChecks: number;
  recommendations: string[];
}

function checkProfile(data: PortfolioData): HealthCheck[] {
  const profile = data.profile;
  return [
    {
      id: 'profile_name',
      label: 'Profile Name',
      category: 'profile',
      passed: Boolean(profile?.name),
      score: profile?.name ? 5 : 0,
      recommendation: 'Add your full name to the profile so visitors know who you are.',
    },
    {
      id: 'profile_title',
      label: 'Professional Title',
      category: 'profile',
      passed: Boolean(profile?.title),
      score: profile?.title ? 5 : 0,
      recommendation: 'Set a professional title (e.g., "Full-Stack Developer") to immediately communicate your role.',
    },
    {
      id: 'profile_avatar',
      label: 'Avatar Photo',
      category: 'profile',
      passed: Boolean(profile?.avatar_url),
      score: profile?.avatar_url ? 5 : 0,
      recommendation: 'Upload a professional avatar photo to build trust with visitors.',
    },
    {
      id: 'profile_email',
      label: 'Email Address',
      category: 'profile',
      passed: Boolean(profile?.email),
      score: profile?.email ? 5 : 0,
      recommendation: 'Add your email address so potential employers or clients can reach you.',
    },
  ];
}

function checkContent(data: PortfolioData): HealthCheck[] {
  const hasAbout = data.about?.some((a) => a.content?.trim().length ?? 0 > 0) ?? false;
  const projectCount = data.projects.length;
  const totalSkills = data.skills.reduce((acc, s) => acc + s.skills.length, 0);
  const eduCount = data.education.length;
  const certCount = data.certifications.length;
  const internCount = data.internships.length;

  return [
    {
      id: 'content_about',
      label: 'About Section',
      category: 'content',
      passed: hasAbout,
      score: hasAbout ? 5 : 0,
      recommendation: 'Write an "About" section that tells your story and highlights what makes you unique.',
    },
    {
      id: 'content_projects',
      label: 'Projects (3+ recommended)',
      category: 'content',
      passed: projectCount >= 3,
      score: projectCount >= 3 ? 5 : projectCount > 0 ? 2 : 0,
      recommendation: 'Add at least 3 projects to showcase your work and technical abilities.',
    },
    {
      id: 'content_skills',
      label: 'Skills (10+ recommended)',
      category: 'content',
      passed: totalSkills >= 10,
      score: totalSkills >= 10 ? 5 : totalSkills >= 5 ? 3 : 0,
      recommendation: 'List at least 10 skills to demonstrate a well-rounded technical profile.',
    },
    {
      id: 'content_education',
      label: 'Education Entry',
      category: 'content',
      passed: eduCount >= 1,
      score: eduCount >= 1 ? 5 : 0,
      recommendation: 'Add your educational background to establish credibility.',
    },
    {
      id: 'content_certifications',
      label: 'Certifications',
      category: 'content',
      passed: certCount >= 1,
      score: certCount >= 1 ? 5 : 0,
      recommendation: 'Add certifications to validate your expertise in key areas.',
    },
    {
      id: 'content_internships',
      label: 'Internships / Experience',
      category: 'content',
      passed: internCount >= 1,
      score: internCount >= 1 ? 5 : 0,
      recommendation: 'Include internships or work experience to show real-world application of your skills.',
    },
  ];
}

function checkQuality(data: PortfolioData): HealthCheck[] {
  const profile = data.profile;
  const hasProjectDescriptions = data.projects.some((p) => Boolean(p.description));
  const hasCertUrls = data.certifications.some((c) => Boolean(c.certificate_url));

  return [
    {
      id: 'quality_linkedin',
      label: 'LinkedIn URL',
      category: 'profile',
      passed: Boolean(profile?.linkedin),
      score: profile?.linkedin ? 5 : 0,
      recommendation: 'Link your LinkedIn profile to help visitors connect with you professionally.',
    },
    {
      id: 'quality_github',
      label: 'GitHub URL',
      category: 'profile',
      passed: Boolean(profile?.github),
      score: profile?.github ? 5 : 0,
      recommendation: 'Add your GitHub profile so visitors can explore your code and contributions.',
    },
    {
      id: 'quality_project_descriptions',
      label: 'Project Descriptions',
      category: 'content',
      passed: hasProjectDescriptions,
      score: hasProjectDescriptions ? 5 : 0,
      recommendation: 'Add descriptions to your projects to explain what each one does and the technologies used.',
    },
    {
      id: 'quality_cert_urls',
      label: 'Certificate URLs',
      category: 'content',
      passed: hasCertUrls,
      score: hasCertUrls ? 5 : 0,
      recommendation: 'Attach verification URLs to your certifications for added credibility.',
    },
  ];
}

function checkSeo(data: PortfolioData): HealthCheck[] {
  const seo = data.seo;
  const seoComplete = Boolean(seo?.site_title && seo?.seo_description);

  return [
    {
      id: 'seo_complete',
      label: 'SEO Title & Description',
      category: 'seo',
      passed: seoComplete,
      score: seoComplete ? 15 : 0,
      recommendation: seo?.site_title
        ? 'Add a meta description to improve search engine visibility.'
        : seo?.seo_description
          ? 'Add a site title to improve search engine visibility.'
          : 'Set both a site title and meta description for better search engine ranking.',
    },
  ];
}

function checkEngagement(data: PortfolioData): HealthCheck[] {
  return [
    {
      id: 'engagement_analytics',
      label: 'Analytics Tracking',
      category: 'engagement',
      passed: data.analytics === true,
      score: data.analytics === true ? 8 : 0,
      recommendation: 'Enable analytics tracking to monitor visitor engagement and portfolio performance.',
    },
    {
      id: 'engagement_contact_email',
      label: 'Contact Email',
      category: 'engagement',
      passed: Boolean(data.contact?.email),
      score: data.contact?.email ? 7 : 0,
      recommendation: 'Provide a contact email so visitors can easily get in touch with you.',
    },
  ];
}

export function calculatePortfolioHealth(data: PortfolioData): HealthResult {
  const checks: HealthCheck[] = [
    ...checkProfile(data),
    ...checkContent(data),
    ...checkQuality(data),
    ...checkSeo(data),
    ...checkEngagement(data),
  ];

  const overallScore = checks.reduce((sum, check) => sum + check.score, 0);
  const passedChecks = checks.filter((c) => c.passed).length;
  const recommendations = checks
    .filter((c) => !c.passed)
    .map((c) => c.recommendation);

  return {
    overallScore,
    checks,
    passedChecks,
    totalChecks: checks.length,
    recommendations,
  };
}
