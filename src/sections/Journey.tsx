import { useState, useEffect } from 'react';
import { GraduationCap, Heart, Cpu, Rocket, Trophy, Code2, Target, Star, MapPin, Award } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useScroll';
import { useSupabaseData } from '../hooks/usePortfolioData';
import { loadJourneyMilestones, JourneyMilestone } from '../lib/loaders';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Star, MapPin, Award, Heart, Target, GraduationCap, Cpu, Rocket, Trophy, Code2,
};

const iconGradients: Record<string, string> = {
  Star: 'from-success-400 to-success-600',
  MapPin: 'from-primary-400 to-primary-600',
  Award: 'from-accent-400 to-accent-600',
  Heart: 'from-primary-400 to-primary-600',
  Target: 'from-primary-400 to-accent-600',
  GraduationCap: 'from-success-400 to-success-600',
  Cpu: 'from-accent-400 to-accent-600',
  Rocket: 'from-warning-400 to-warning-600',
  Trophy: 'from-warning-400 to-warning-600',
  Code2: 'from-primary-400 to-primary-600',
};

export default function Journey() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const { data: milestones } = useSupabaseData(loadJourneyMilestones);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible && milestones) {
      const intervals = milestones.map((_, i) =>
        setTimeout(() => setActiveIndex(i), 500 + i * 200)
      );
      return () => intervals.forEach(clearTimeout);
    }
  }, [isVisible, milestones]);

  if (!milestones || milestones.length === 0) return null;

  return (
    <section
      id="journey"
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-gray-50 dark:bg-dark-900"
    >
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-radial from-primary-400/10 to-transparent rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-radial from-accent-400/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium glass-card text-primary-500 mb-4">
              My Path
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4">
              The <span className="gradient-text">Learning Journey</span>
            </h2>
            <p className="max-w-2xl mx-auto text-theme-muted text-lg">
              Every step of the journey — from foundational learning to real-world experience
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-accent-500 to-success-500" />

            <div className="space-y-12 md:space-y-0">
              {milestones.map((milestone, index) => (
                <MilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  isVisible={isVisible && activeIndex !== null && index <= activeIndex}
                  isLeft={index % 2 === 0}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-16">
            <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-3">
              <Trophy className="w-6 h-6 text-warning-500" />
              <span className="text-theme-secondary">Still learning, still growing</span>
              <Code2 className="w-6 h-6 text-primary-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MilestoneItem({
  milestone,
  index,
  isVisible,
  isLeft,
}: {
  milestone: JourneyMilestone;
  index: number;
  isVisible: boolean;
  isLeft: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = iconMap[milestone.icon] || Star;
  const gradient = iconGradients[milestone.icon] || 'from-primary-400 to-accent-400';
  const highlights = milestone.description ? milestone.description.split('\n').filter(Boolean) : [];

  return (
    <div
      className={`relative transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="hidden md:grid md:grid-cols-2 md:gap-8 items-center">
        <div className={`${isLeft ? 'pr-12 text-right' : 'opacity-0'}`}>
          {isLeft && (
            <MilestoneContent
              milestone={milestone}
              gradient={gradient}
              Icon={Icon}
              highlights={highlights}
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded(!isExpanded)}
            />
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 z-10">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className={`${!isLeft ? 'pl-12' : 'opacity-0'}`}>
          {!isLeft && (
            <MilestoneContent
              milestone={milestone}
              gradient={gradient}
              Icon={Icon}
              highlights={highlights}
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded(!isExpanded)}
            />
          )}
        </div>
      </div>

      <div className="md:hidden relative pl-16 sm:pl-20">
        <div className="absolute left-0 w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center shadow-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <div className="inline-block px-2 py-1 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-theme-muted mb-2">
            {milestone.date}
          </div>
          <h3 className="text-lg font-bold text-theme-primary mb-1">
            {milestone.title}
          </h3>
          {milestone.subtitle && <p className="text-sm text-primary-500 font-medium mb-2">{milestone.subtitle}</p>}
          <p className="text-sm text-theme-secondary whitespace-pre-line">{milestone.description}</p>

          {highlights.length > 1 && (
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-4' : 'max-h-0'}`}>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-theme-secondary">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {highlights.length > 1 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 text-sm font-medium text-primary-500"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MilestoneContent({
  milestone,
  gradient,
  highlights,
  isExpanded,
  onToggle,
}: {
  milestone: JourneyMilestone;
  gradient: string;
  highlights: string[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={onToggle}>
      <div className="inline-block px-3 py-1 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-theme-muted mb-3">
        {milestone.date}
      </div>
      <h3 className="text-xl font-bold text-theme-primary mb-2">
        {milestone.title}
      </h3>
      {milestone.subtitle && <p className="text-sm text-primary-500 font-medium mb-3">{milestone.subtitle}</p>}
      <p className="text-theme-secondary whitespace-pre-line">{milestone.description}</p>

      {highlights.length > 1 && (
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-4' : 'max-h-0'}`}>
          <ul className="space-y-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-theme-secondary">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {highlights.length > 1 && (
        <button className="mt-4 text-sm font-medium text-primary-500 hover:text-primary-600">
          {isExpanded ? 'Show Less' : 'Explore More'}
        </button>
      )}
    </div>
  );
}
