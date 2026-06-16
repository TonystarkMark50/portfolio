import { GraduationCap, BookOpen, Award, Calendar, MapPin } from 'lucide-react';
import { useIntersectionObserver } from '../../hooks/useScroll';
import { useSupabaseData } from '../../hooks/usePortfolioData';
import { loadEducation } from '../../lib/loaders';

const getIcon = (id: number) => {
  switch (id) {
    case 1: return GraduationCap;
    default: return BookOpen;
  }
};

export default function Education() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const { data: educationData } = useSupabaseData(loadEducation);
  if (!educationData) return null;

  return (
    <section
      id="education"
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden mesh-bg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium glass-card text-primary-500 mb-4">
              Academic Background
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4">
              <span className="gradient-text">Education</span> & Learning
            </h2>
            <p className="max-w-2xl mx-auto text-theme-muted text-lg">
              Academic journey from secondary school through biomedical engineering
            </p>
          </div>

          <div className="space-y-6">
            {educationData.map((edu: any, index: number) => {
              const Icon = getIcon(edu.id);
              return (
                <div
                  key={edu.id}
                  className={`relative transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="glass-card rounded-3xl overflow-hidden gradient-border">
                    {/* Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-theme-primary">
                              {edu.degree}
                            </h3>
                            <p className="text-theme-muted">{edu.field}</p>
                            <p className="text-sm text-theme-muted mt-0.5">{edu.institution}</p>
                          </div>
                        </div>
                        {edu.current && (
                          <span className="px-3 py-1 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 text-xs font-medium">
                            {edu.status}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-theme-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{edu.period}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{edu.location}</span>
                        </div>
                        {edu.gpa && (
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>GPA: {edu.gpa}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-4 text-sm text-theme-secondary leading-relaxed">
                        {edu.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
