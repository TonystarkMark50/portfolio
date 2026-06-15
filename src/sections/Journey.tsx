import { useRef, useState, useEffect } from 'react';
import { GraduationCap, Cpu, Heart, Rocket, Trophy, Code2, Target } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useScroll';

const milestones = [
  {
    id: 1,
    title: 'Biomedical Engineering',
    subtitle: 'The Beginning',
    description: 'Started my B.E. in Biomedical Engineering at Saveetha Engineering College, Chennai — entering the intersection of healthcare and technology.',
    period: '2024',
    icon: GraduationCap,
    color: 'from-success-400 to-success-600',
    highlights: ['Joined Saveetha Engineering College', 'B.E. Biomedical Engineering', 'Introduction to healthcare technology'],
  },
  {
    id: 2,
    title: 'Academic Foundation',
    subtitle: 'Core Learning',
    description: 'Built a strong academic foundation through coursework in Human Anatomy & Physiology, Engineering Mathematics, Python Programming, and Signals & Systems while developing fundamental knowledge in Biomedical Engineering.',
    period: '2024-2025',
    icon: Heart,
    color: 'from-primary-400 to-primary-600',
    highlights: ['Human Anatomy & Physiology', 'Engineering Mathematics', 'Python Programming', 'Signals & Systems'],
  },
  {
    id: 3,
    title: 'Technical Skills',
    subtitle: 'Programming & Technical Foundations',
    description: 'Developed technical knowledge through coursework in C Programming, Biomedical Signal Processing (BSP), Technical Writing, and foundational Biomedical Engineering subjects, complementing academic learning and problem-solving skills.',
    period: '2024-2025',
    icon: Cpu,
    color: 'from-accent-400 to-accent-600',
    highlights: ['C Programming', 'Biomedical Signal Processing (BSP)', 'Technical Writing'],
  },
  {
    id: 4,
    title: 'Internship Experience',
    subtitle: 'Real-World Exposure',
    description: 'Completed an internship at Sri Ramachandra Institute, gaining hands-on experience with biomedical equipment handling and hospital workflows.',
    period: '2025',
    icon: Rocket,
    color: 'from-warning-400 to-warning-600',
    highlights: ['Biomedical equipment handling', 'Preventive maintenance procedures', 'Clinical environment exposure', 'Technical documentation'],
  },
  {
    id: 5,
    title: 'Project & Growth',
    subtitle: 'Academic Mini Project Completed',
    description: 'Successfully completed the academic mini project titled "IoT-Based Stress Detection Smart Watch for Abnormal Children and Elders" in December 2025 as part of the Biomedical Engineering curriculum.\n\nThe project provided practical experience in embedded systems, IoT technologies, sensor integration, biomedical monitoring, and healthcare-focused engineering applications.',
    period: 'Completed • December 2025',
    icon: Target,
    color: 'from-primary-400 to-accent-600',
    highlights: [
      'Completed Academic Mini Project (December 2025)',
      'IoT-Based Stress Detection Smart Watch',
      'ESP32, GSR Sensor, MPU6050 & OLED Display',
      'Real-Time Monitoring and IoT Integration',
      'Biomedical Engineering Project Experience',
      'Healthcare Technology Application',
    ],
  },
];

export default function Journey() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      const intervals = milestones.map((_, i) =>
        setTimeout(() => setActiveIndex(i), 500 + i * 200)
      );
      return () => intervals.forEach(clearTimeout);
    }
  }, [isVisible]);

  return (
    <section
      id="journey"
      className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden bg-gray-50 dark:bg-dark-900"
    >
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-radial from-primary-400/10 to-transparent rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-gradient-radial from-accent-400/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Section header */}
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

          {/* Timeline */}
          <div ref={timelineRef} className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-accent-500 to-success-500" />

            {/* Milestones */}
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

          {/* Bottom decoration */}
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
  milestone: typeof milestones[0];
  index: number;
  isVisible: boolean;
  isLeft: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`relative transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8 items-center">
        {/* Left side */}
        <div className={`${isLeft ? 'pr-12 text-right' : 'opacity-0'}`}>
          {isLeft && (
            <MilestoneContent
              milestone={milestone}
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded(!isExpanded)}
            />
          )}
        </div>

        {/* Center dot */}
        <div className="absolute left-1/2 -translate-x-1/2 z-10">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <milestone.icon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Right side */}
        <div className={`${!isLeft ? 'pl-12' : 'opacity-0'}`}>
          {!isLeft && (
            <MilestoneContent
              milestone={milestone}
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded(!isExpanded)}
            />
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden relative pl-16 sm:pl-20">
        {/* Dot */}
        <div className="absolute left-0 w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center shadow-lg">
          <milestone.icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="inline-block px-2 py-1 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-theme-muted mb-2">
            {milestone.period}
          </div>
          <h3 className="text-lg font-bold text-theme-primary mb-1">
            {milestone.title}
          </h3>
          <p className="text-sm text-primary-500 font-medium mb-2">{milestone.subtitle}</p>
          <p className="text-sm text-theme-secondary whitespace-pre-line">{milestone.description}</p>

          {/* Highlights */}
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-40 mt-4' : 'max-h-0'}`}>
            <ul className="space-y-2">
              {milestone.highlights.map((highlight, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-theme-secondary">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${milestone.color}`} />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-sm font-medium text-primary-500"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MilestoneContent({
  milestone,
  isExpanded,
  onToggle,
}: {
  milestone: typeof milestones[0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={onToggle}>
      <div className="inline-block px-3 py-1 rounded-lg bg-gray-100 dark:bg-dark-700 text-xs font-medium text-theme-muted mb-3">
        {milestone.period}
      </div>
      <h3 className="text-xl font-bold text-theme-primary mb-2">
        {milestone.title}
      </h3>
      <p className="text-sm text-primary-500 font-medium mb-3">{milestone.subtitle}</p>
      <p className="text-theme-secondary whitespace-pre-line">{milestone.description}</p>

      {/* Highlights */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-40 mt-4' : 'max-h-0'}`}>
        <ul className="space-y-2">
          {milestone.highlights.map((highlight, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-theme-secondary">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${milestone.color}`} />
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-4 text-sm font-medium text-primary-500 hover:text-primary-600">
        {isExpanded ? 'Show Less' : 'Explore More'}
      </button>
    </div>
  );
}
