import {
  Building2, Calendar, MapPin, Briefcase,
  FileText, ExternalLink, CheckCircle2,
  Clock, Award, ShieldCheck
} from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useScroll';
import { useSupabaseData } from '../hooks/usePortfolioData';
import { loadInternships } from '../lib/loaders';

export default function Internship() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const { data: internshipData } = useSupabaseData(loadInternships);
  if (!internshipData) return null;

  return (
    <section
      id="internship"
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden mesh-bg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium glass-card text-primary-500 mb-4">
              Professional Experience
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4">
              <span className="gradient-text">Internship</span> Experience
            </h2>
            <p className="max-w-2xl mx-auto text-theme-muted text-lg">
              Practical exposure to biomedical engineering, healthcare technology, and clinical engineering environments.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Internship Card */}
            <div
              className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <div className="glass-card rounded-3xl overflow-hidden gradient-border">
                {/* Card header */}
                <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-dark-700">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-theme-primary leading-tight">
                        {internshipData.organization}
                      </h3>
                      <p className="text-sm text-theme-muted mt-0.5">
                        {internshipData.department}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-sm text-theme-muted">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" />
                          <span>{internshipData.role}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{internshipData.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{internshipData.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{internshipData.type}</span>
                        </div>
                      </div>
                      {internshipData.completed && (
                        <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 sm:p-8 space-y-8">
                  {/* Internship Overview */}
                  <div>
                    <h4 className="text-sm font-semibold text-theme-primary mb-3">
                      Internship Overview
                    </h4>
                    <div className="space-y-3">
                      {internshipData.description.map((para, i) => (
                        <p key={i} className="text-sm text-theme-secondary leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Internship Experience & Responsibilities */}
                  <div>
                    <h4 className="text-sm font-semibold text-theme-primary mb-4">
                      Internship Experience & Responsibilities
                    </h4>
                    <div className="space-y-3">
                      {internshipData.responsibilities.map((item) => (
                        <div
                          key={item}
                          className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-800/20 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-700/40 transition-all duration-300"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                          <span className="text-sm text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Measurable Impact */}
                  <div>
                    <h4 className="text-sm font-semibold text-theme-primary mb-4">
                      Measurable Impact
                    </h4>
                    <div className="space-y-3">
                      {internshipData.impact.map((item) => (
                        <div
                          key={item}
                          className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-success-50/50 dark:bg-success-900/10 border border-success-100/50 dark:border-success-800/20 hover:bg-success-50 dark:hover:bg-success-900/20 hover:border-success-200 dark:hover:border-success-700/40 transition-all duration-300"
                        >
                          <div className="w-2 h-2 rounded-full bg-success-500 flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                          <span className="text-sm text-theme-secondary group-hover:text-theme-primary transition-colors duration-300">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Certificate Card */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="group glass-card rounded-3xl overflow-hidden gradient-border hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Certificate icon */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-success-400/20 to-primary-500/20 border border-success-200/50 dark:border-success-700/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                      <Award className="w-10 h-10 text-success-500" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success-500 flex items-center justify-center shadow-lg shadow-success-500/30">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Certificate details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg sm:text-xl font-bold text-theme-primary">
                          Verified Internship Certificate
                        </h4>
                      </div>
                      <p className="text-sm text-theme-muted">
                        {internshipData.organization}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 text-xs font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified & Completed
                        </span>
                      </div>
                      <p className="text-sm text-theme-muted mt-3 leading-relaxed">
                        Official internship completion certificate issued upon successful completion of the Biomedical Engineering Internship Program.
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <a
                        href={internshipData.certificateUrl ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View Official Internship Certificate (opens in new tab)"
                        className="group/btn inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-glow focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                      >
                        <FileText className="w-4 h-4 group-hover/btn:rotate-6 transition-transform duration-300" />
                        View Official Certificate
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
