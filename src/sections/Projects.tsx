import { useEffect } from 'react';
import { Cpu, ListChecks, BookOpen, Activity, FileText, ExternalLink } from 'lucide-react';
import Section from '../components/Section';
import { useSupabaseData } from '../hooks/usePortfolioData';
import { loadProjects } from '../lib/loaders';
import { trackProjectView } from '../lib/analytics';

export default function Projects() {
  const { data: projects } = useSupabaseData(loadProjects);
  const project = projects?.[0];

  useEffect(() => {
    if (project) {
      trackProjectView(project.id, project.name);
    }
  }, [project?.id]);

  if (!project) return null;
  const technologies = project.technologies;
  const highlights = project.highlights;
  return (
    <Section id="projects" className="bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-200 dark:border-violet-800/30 mb-6">
          <Activity className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
            Featured Project
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-theme-primary mb-6 tracking-tight">
          Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-500">Project</span>
        </h2>

        <p className="max-w-2xl mx-auto text-xl text-theme-muted leading-relaxed">
          A biomedical engineering mini project focused on IoT-based stress detection using wearable healthcare technology.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 transition-all duration-500 shadow-xl hover:shadow-2xl hover:border-violet-300 dark:hover:border-violet-700">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 pointer-events-none" />

          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                Academic Mini Project
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Completed
              </span>
            </div>

            <h3 className="text-3xl font-bold text-theme-primary mb-8 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {project.name}
            </h3>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-violet-500" />
                    <h4 className="text-lg font-semibold text-theme-primary">Project Highlights</h4>
                  </div>
                  <ul className="space-y-3">
                    {highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-2" />
                        <span className="text-theme-secondary text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-5 h-5 text-violet-500" />
                    <h4 className="text-lg font-semibold text-theme-primary">Technologies Used</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 text-theme-secondary border border-gray-200 dark:border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ListChecks className="w-5 h-5 text-violet-500" />
                      <h4 className="text-lg font-semibold text-theme-primary">Description</h4>
                    </div>
                    <p className="text-sm text-theme-secondary leading-relaxed">{project.description}</p>
                  </div>
                )}
              </div>
            </div>

            {project.reportUrl && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-theme-primary">Project Report</h4>
                    <p className="text-sm text-theme-muted mt-1">
                      View the complete project documentation, methodology, implementation details, results, and conclusions.
                    </p>
                  </div>
                  <a
                    href={project.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-glow focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                  >
                    <FileText className="w-4 h-4 group-hover/btn:rotate-6 transition-transform duration-300" />
                    View Project Report
                    <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
