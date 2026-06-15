import { Code2, Database, Microscope, PenTool, Zap } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useScroll';
import { useSupabaseData } from '../hooks/usePortfolioData';
import { loadSkills } from '../lib/loaders';

const iconMap: Record<string, typeof Code2> = {
  'Programming': Code2,
  'Database': Database,
  'Biomedical Engineering': Microscope,
  'Other Skills': PenTool,
};

export default function Skills() {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.15 });
  const { data } = useSupabaseData(loadSkills);
  if (!data) return null;

  return (
    <section id="skills" className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={sectionRef}>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-200 dark:border-violet-800/30 mb-6">
              <Zap className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                Skills & Knowledge
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-theme-primary mb-6 tracking-tight">
              Skills & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-500">Expertise</span>
            </h2>

            <p className="max-w-2xl mx-auto text-xl text-theme-muted leading-relaxed">
              A combination of programming fundamentals, database knowledge, biomedical engineering concepts, and healthcare technology exposure gained through academics, projects, and internship experience.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
          {data.map((category, index) => {
            const Icon = iconMap[category.title] || Code2;
            return (
              <div
                key={category.title}
                className={`group p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  {category.title}
                </h3>
                <ul className="space-y-2.5">
                  {category.skills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      <span className="text-sm text-theme-secondary">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}
