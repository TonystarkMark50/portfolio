import { useRef, useState } from 'react';
import { Download, FileText, Briefcase, GraduationCap, Award, Code2 } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useScroll';
import { useSupabaseData } from '../hooks/usePortfolioData';
import { loadResumeData, ResumeData } from '../lib/loaders';
import { trackResumeDownload } from '../lib/analytics';
import { getResumeDownloadCount } from '../lib/supabase';
import { generateAndDownloadResume } from '../utils/generateResume';

function mapResumeForDisplay(data: ResumeData) {
  const p = data.personalInfo;
  const skillEntries = data.skills.map(cat => [cat.title, cat.skills] as [string, string[]]);
  const skillObj = Object.fromEntries(skillEntries);
  return {
    name: p.name,
    title: p.title,
    email: p.email,
    github: p.github?.replace(/^https?:\/\//, ''),
    linkedin: p.linkedin?.replace(/^https?:\/\//, ''),
    summary: data.professionalSummary?.[0] || '',
    education: data.education.map(e => ({
      degree: `${e.degree}${e.field ? ` - ${e.field}` : ''}`,
      institution: e.institution,
      period: e.period || '',
      gpa: e.gpa || '',
      highlights: e.description ? [e.description] : [],
    })),
    skills: skillObj,
    projects: data.projects.map(pj => ({
      name: pj.name,
      description: pj.highlights?.[0] || pj.name,
      tech: pj.technologies || [],
    })),
    achievements: [
      ...(data.internship ? [`Completed Internship - ${data.internship.organization}`] : []),
    ],
  };
}

export default function Resume() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const { data: resumeData } = useSupabaseData(loadResumeData);
  const { data: initialCount } = useSupabaseData(getResumeDownloadCount);
  const [downloads, setDownloads] = useState(0);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    await Promise.all([trackResumeDownload(), generateAndDownloadResume()]);
    setDownloads(prev => prev + 1);
  };

  if (!resumeData) return null;
  const display = mapResumeForDisplay(resumeData);
  const downloadCount = (initialCount || 0) + downloads;

  return (
    <section
      id="resume"
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden mesh-bg"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium glass-card text-primary-500 mb-4">
              My Resume
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4">
              <span className="gradient-text">Professional</span> Profile
            </h2>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-glow"
            >
              <Download className="w-5 h-5" />
              Download PDF Resume
              {downloadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {downloadCount} downloads
                </span>
              )}
            </button>
          </div>

          <div
            ref={resumeRef}
            className="glass-card rounded-3xl overflow-hidden shadow-premium"
          >
            <div className="relative px-8 py-10 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <h1 className="text-4xl font-black mb-2">{display.name}</h1>
              <p className="text-lg opacity-90">{display.title}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-80">
                <span>{display.email}</span>
                <span>{display.github}</span>
                <span>{display.linkedin}</span>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {display.summary && (
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                    <FileText className="w-5 h-5 text-primary-500" />
                    Summary
                  </h2>
                  <p className="text-theme-secondary leading-relaxed">
                    {display.summary}
                  </p>
                </div>
              )}

              {display.education.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                    <GraduationCap className="w-5 h-5 text-primary-500" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {display.education.map((edu, i) => (
                      <div key={i} className="pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                        <h3 className="font-semibold text-theme-primary">{edu.degree}</h3>
                        <p className="text-theme-muted">{edu.institution} | {edu.period}</p>
                        {edu.gpa && <p className="text-sm text-theme-muted">GPA: {edu.gpa}</p>}
                        {edu.highlights.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {edu.highlights.map((h, j) => (
                              <li key={j} className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300">
                                {h}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(display.skills).length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                    <Code2 className="w-5 h-5 text-primary-500" />
                    Technical Skills
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(display.skills).map(([category, skills]) => (
                      <div key={category} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700">
                        <h4 className="text-sm font-semibold text-theme-muted mb-2 capitalize">
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 text-xs rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {display.projects.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                    <Briefcase className="w-5 h-5 text-primary-500" />
                    Featured Projects
                  </h2>
                  <div className="space-y-4">
                    {display.projects.map((project, i) => (
                      <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                        <h3 className="font-semibold text-theme-primary">{project.name}</h3>
                        <p className="text-sm text-theme-muted">{project.description}</p>
                        {project.tech.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.tech.map((t, j) => (
                              <span key={j} className="text-xs text-theme-muted">{t}{j < project.tech.length - 1 && ', '}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {display.achievements.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                    <Award className="w-5 h-5 text-primary-500" />
                    Key Achievements
                  </h2>
                  <ul className="space-y-2">
                    {display.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start gap-3 text-theme-secondary">
                        <span className="w-2 h-2 mt-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex-shrink-0" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
