import { MessageSquare } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useScroll';
import { aboutContent as fallbackContent, aboutSubtitle as fallbackSubtitle } from '../data/portfolio';
import { useData } from '../hooks/usePortfolioData';
import { loadAbout } from '../lib/loaders';

export default function About() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const aboutData = useData(loadAbout, { content: fallbackContent, subtitle: fallbackSubtitle });

  return (
    <section
      id="about"
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white dark:from-dark-900 dark:via-dark-800 dark:to-dark-900" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-100/50 to-transparent dark:from-violet-900/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-200 dark:border-violet-800/30 mb-6">
              <MessageSquare className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                About Me
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-theme-primary mb-6 tracking-tight">
              Biomedical Engineering{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">Student</span>
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-theme-muted">
              {aboutData.subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-5">
            <p className="text-theme-secondary text-lg leading-relaxed">
              {aboutData.content[0]}
            </p>
            <p className="text-theme-secondary text-lg leading-relaxed">
              {aboutData.content[1]}
            </p>
            <p className="text-theme-secondary text-lg leading-relaxed">
              {aboutData.content[2]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
