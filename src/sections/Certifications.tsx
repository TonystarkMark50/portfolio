import { Award, Calendar, ExternalLink, ShieldCheck, Trophy, Code2, BookOpen } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useScroll';
import { useSupabaseData } from '../hooks/usePortfolioData';
import { loadCertifications } from '../lib/loaders';

const platformConfig: Record<string, { colors: string; border: string; text: string; logo: React.ReactNode }> = {
  HackerRank: {
    colors: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-200/50 dark:border-emerald-700/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  Coursera: {
    colors: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-200/50 dark:border-blue-700/30',
    text: 'text-blue-600 dark:text-blue-400',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
};

function CertificationCard({ cert, index, isVisible }: { cert: any; index: number; isVisible: boolean }) {
  const config = platformConfig[cert.platform] || platformConfig.HackerRank;

  return (
    <div
      className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="group glass-card rounded-3xl overflow-hidden gradient-border hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500">
        <div className="p-6 sm:p-8 lg:p-10">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
            {/* Logo */}
            <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${config.border} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500 overflow-hidden ${cert.logoUrl ? 'bg-white p-2' : `bg-gradient-to-br ${config.colors}`}`}>
              {cert.logoUrl ? (
                <img
                  src={cert.logoUrl}
                  alt={cert.organization}
                  className="w-full h-full object-contain"
                />
              ) : cert.organization === 'University of Colorado System' ? (
                <img
                  src="/assets/images/college.png"
                  alt="University of Colorado System"
                  className="w-full h-full object-contain"
                />
              ) : cert.platform === 'HackerRank' ? (
                <img
                  src="/assets/images/hackerrank.png"
                  alt="HackerRank"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className={config.text}>
                  {config.logo}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-theme-primary leading-tight">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-theme-muted mt-0.5">
                    {cert.organization}
                  </p>
                  {cert.platform !== cert.organization && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-theme-muted">
                      <BookOpen className="w-3 h-3" />
                      {cert.platform}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified · Completed
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-theme-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {cert.issueDate}
                </span>
                {cert.credentialId && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
                    ID: {cert.credentialId}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium">
                  <Code2 className="w-3 h-3" />
                  {cert.category}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-theme-body leading-relaxed mb-6">
            {cert.description}
          </p>

          {/* Skills validated */}
          {cert.skills && cert.skills.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-theme-primary mb-3">
                Skills Validated
              </h4>
              <div className="flex flex-wrap gap-2">
                {cert.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-br from-primary-400/10 to-accent-500/10 border border-primary-200/30 dark:border-primary-700/20 text-theme-secondary"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* View Certificate button — only shown with a valid URL */}
          {cert.certificateUrl && !cert.certificateUrl.includes('CERTIFICATE_URL_PENDING') && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200/50 dark:border-dark-700/50">
              <a
                href={cert.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${cert.title} certificate (opens in new tab)`}
                className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-glow focus:outline-none focus:ring-4 focus:ring-primary-500/30"
              >
                <Award className="w-4 h-4 group-hover/btn:rotate-6 transition-transform duration-300" />
                View Certificate
                <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const { data: certificationsData } = useSupabaseData(loadCertifications);
  const hasRealCertifications = certificationsData
    ? certificationsData.some((c: any) => c.title !== 'Certification Title' || c.organization !== 'Issuing Organization')
    : false;

  return (
    <section
      id="certifications"
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden mesh-bg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium glass-card text-amber-500 mb-4">
              <Trophy className="w-4 h-4" />
              Professional Certifications
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4">
              Certifications & <span className="gradient-text">Professional Learning</span>
            </h2>
            <p className="max-w-2xl mx-auto text-theme-muted text-lg">
              Professional certifications, technical learning achievements, and verified credentials demonstrating continuous learning and technical development.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {hasRealCertifications ? (
              certificationsData.map((cert: any, index: number) => (
                <CertificationCard key={cert.id} cert={cert} index={index} isVisible={isVisible} />
              ))
            ) : (
              <div
                className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              >
                <div className="glass-card rounded-3xl overflow-hidden gradient-border">
                  <div className="p-10 sm:p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-400/20 to-accent-500/20 border border-primary-200/50 dark:border-primary-700/30 flex items-center justify-center">
                      <Award className="w-8 h-8 text-primary-500" />
                    </div>
                    <p className="text-theme-body text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
                      Certification records will be updated as new professional certifications and training programs are completed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
