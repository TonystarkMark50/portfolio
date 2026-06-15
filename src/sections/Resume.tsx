import { useEffect, useState, useRef } from 'react';
import { Download, FileText, Briefcase, GraduationCap, Award, Code2 } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useScroll';
import { trackResumeDownload, getResumeDownloadCount } from '../lib/supabase';

const resumeData = {
  name: 'Jagadeesh T',
  title: 'Biomedical Engineering Student',
  email: 'shakthijagadeesh907@gmail.com',
  github: 'github.com/Jagadeesh-Thulasiraman',
  linkedin: 'linkedin.com/in/jagadeesh-t-583b58326',
  summary: 'Biomedical Engineering student with practical internship experience at Sri Ramachandra Institute of Higher Education and Research. Passionate about healthcare technology, biomedical equipment, and improving patient outcomes through engineering.',
  education: [
    {
      degree: 'B.E. Biomedical Engineering',
      institution: 'Saveetha Engineering College, Chennai',
      period: '2024 - Present',
      gpa: '8.05/10',
      highlights: ['Biomedical Systems', 'Healthcare Technologies', 'Engineering Principles'],
    },
  ],
  skills: {
    programming: ['Python Programming', 'C Programming'],
    database: ['Database Management Systems (DBMS)'],
    biomedical: [
      'Biomedical Equipment Handling',
      'Clinical Exposure',
      'Preventive Maintenance Procedures',
      'Healthcare Technology Systems',
      'Hospital Workflow',
      'Technical Documentation',
    ],
  },
  projects: [
    {
      name: 'IoT-Based Stress Detection Smart Watch',
      description: 'Academic mini project developing a wearable smart watch for stress monitoring using GSR and motion sensing.',
      tech: ['ESP32', 'GSR Sensor', 'MPU6050', 'OLED Display', 'Blynk IoT Platform'],
    },
  ],
    achievements: [
      'Completed Internship - Sri Ramachandra Institute of Higher Education and Research',
    ],
};

export default function Resume() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [downloadCount, setDownloadCount] = useState(0);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCount() {
      const count = await getResumeDownloadCount();
      setDownloadCount(count);
    }
    loadCount();
  }, []);

  const handleDownload = async () => {
    await trackResumeDownload();
    setDownloadCount(prev => prev + 1);
    // In a real app, generate and download PDF here
    alert('Resume download started! In production, this would generate a PDF.');
  };

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
          {/* Header */}
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

          {/* Resume Preview Card */}
          <div
            ref={resumeRef}
            className="glass-card rounded-3xl overflow-hidden shadow-premium"
          >
            {/* Resume Header */}
            <div className="relative px-8 py-10 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <h1 className="text-4xl font-black mb-2">{resumeData.name}</h1>
              <p className="text-lg opacity-90">{resumeData.title}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-80">
                <span>{resumeData.email}</span>
                <span>{resumeData.github}</span>
                <span>{resumeData.linkedin}</span>
              </div>
            </div>

            {/* Resume Content */}
            <div className="p-8 space-y-8">
              {/* Summary */}
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                  <FileText className="w-5 h-5 text-primary-500" />
                  Summary
                </h2>
                <p className="text-theme-secondary leading-relaxed">
                  {resumeData.summary}
                </p>
              </div>

              {/* Education */}
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                  <GraduationCap className="w-5 h-5 text-primary-500" />
                  Education
                </h2>
                <div className="space-y-4">
                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                      <h3 className="font-semibold text-theme-primary">{edu.degree}</h3>
                      <p className="text-theme-muted">{edu.institution} | {edu.period}</p>
                      <p className="text-sm text-theme-muted">GPA: {edu.gpa}</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {edu.highlights.map((h, j) => (
                          <li key={j} className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                  <Code2 className="w-5 h-5 text-primary-500" />
                  Technical Skills
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(resumeData.skills).map(([category, skills]) => (
                    <div key={category} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700">
                      <h4 className="text-sm font-semibold text-theme-muted mb-2 capitalize">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(skills as string[]).map((skill) => (
                          <span key={skill} className="px-2 py-1 text-xs rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                  <Briefcase className="w-5 h-5 text-primary-500" />
                  Featured Projects
                </h2>
                <div className="space-y-4">
                  {resumeData.projects.map((project, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                      <h3 className="font-semibold text-theme-primary">{project.name}</h3>
                      <p className="text-sm text-theme-muted">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.tech.map((t, j) => (
                          <span key={j} className="text-xs text-theme-muted">{t}{j < project.tech.length - 1 && ', '}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-4">
                  <Award className="w-5 h-5 text-primary-500" />
                  Key Achievements
                </h2>
                <ul className="space-y-2">
                  {resumeData.achievements.map((achievement, i) => (
                    <li key={i} className="flex items-start gap-3 text-theme-secondary">
                      <span className="w-2 h-2 mt-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex-shrink-0" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
