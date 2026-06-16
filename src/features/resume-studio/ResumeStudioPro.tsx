import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings,
  Clock,
  RotateCcw,
  Award,
} from 'lucide-react';

interface ResumeStudioProProps {
  onNavigate?: (tab: string) => void;
}

interface ResumeVersion {
  id: string;
  date: string;
  template: string;
  label: string;
}

type ResumeTemplate = 'minimal' | 'modern' | 'professional';

interface SectionToggle {
  key: string;
  label: string;
  defaultOn: boolean;
}

const SECTIONS: SectionToggle[] = [
  { key: 'skills', label: 'Skills', defaultOn: true },
  { key: 'education', label: 'Education', defaultOn: true },
  { key: 'projects', label: 'Projects', defaultOn: true },
  { key: 'certifications', label: 'Certifications', defaultOn: true },
  { key: 'internships', label: 'Internships', defaultOn: true },
];

const TEMPLATES: { key: ResumeTemplate; label: string; description: string }[] = [
  { key: 'minimal', label: 'Minimal', description: 'Clean, simple, and focused' },
  { key: 'modern', label: 'Modern', description: 'Contemporary with bold accents' },
  { key: 'professional', label: 'Professional', description: 'Traditional corporate layout' },
];

const ATS_TIPS = [
  'Use standard section headings (Experience, Education, Skills)',
  'Include relevant keywords from the job description',
  'Keep resume to 1-2 pages maximum',
  'Use bullet points instead of paragraphs',
  'Avoid tables, columns, and graphics',
  'Include a professional summary at the top',
  'Use a standard font (Arial, Calibri, Times New Roman)',
  'Save as PDF to preserve formatting',
  'Avoid headers and footers with important info',
  'Spell out acronyms on first use',
];

function calculateResumeScore(): number {
  let score = 0;
  try {
    const template = localStorage.getItem('resume-template');
    const sectionsRaw = localStorage.getItem('resume-sections');
    const versionsRaw = localStorage.getItem('resume-versions');

    if (template) score += 10;

    if (sectionsRaw) {
      const sections = JSON.parse(sectionsRaw) as Record<string, boolean>;
      const enabled = Object.values(sections).filter(Boolean).length;
      const total = Object.keys(sections).length;
      score += Math.round((enabled / Math.max(total, 1)) * 20);
    }

    if (versionsRaw) {
      const versions = JSON.parse(versionsRaw) as ResumeVersion[];
      if (versions.length > 0) score += 10;
      score += Math.min(versions.length * 5, 15);
    }

    const hasExportHistory = versionsRaw && versionsRaw !== '[]';
    if (hasExportHistory) score += 10;

    const formatted = localStorage.getItem('resume-formatted');
    if (formatted) score += 15;

    const hasSkills = localStorage.getItem('resume-has-skills');
    if (hasSkills === 'true') score += 10;

    if (localStorage.getItem('resume-summary')) score += 10;
  } catch {
    return 0;
  }

  return Math.min(100, score);
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 50) return 'stroke-amber-500';
  return 'stroke-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 50) return 'Needs work';
  return 'Incomplete';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CircularProgress({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-700"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={getScoreBg(score)}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
      </svg>
      <span className="absolute text-lg font-bold text-white tabular-nums">
        {score}
      </span>
    </div>
  );
}

function SectionToggle({ section, enabled, onChange }: { section: SectionToggle; enabled: boolean; onChange: (key: string, value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer group">
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
        {section.label}
      </span>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(section.key, !enabled)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-gray-700'
        }`}
      >
        <motion.div
          layout
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ x: enabled ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </label>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 bg-gray-800 rounded w-48" />
          <div className="h-3 bg-gray-800 rounded w-32" />
        </div>
        <div className="h-9 bg-gray-800 rounded-xl w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-[400px] bg-gray-800 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-800 rounded-xl" />
          <div className="h-48 bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ResumeStudioPro({ onNavigate }: ResumeStudioProProps) {
  const [loading, setLoading] = useState(true);
  const [template, setTemplateState] = useState<ResumeTemplate>(() => {
    try {
      return (localStorage.getItem('resume-template') as ResumeTemplate) || 'minimal';
    } catch {
      return 'minimal';
    }
  });
  const [sections, setSectionsState] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('resume-sections');
      if (stored) return JSON.parse(stored) as Record<string, boolean>;
      return Object.fromEntries(SECTIONS.map((s) => [s.key, s.defaultOn]));
    } catch {
      return Object.fromEntries(SECTIONS.map((s) => [s.key, s.defaultOn]));
    }
  });
  const [versions] = useState<ResumeVersion[]>(() => {
    try {
      const stored = localStorage.getItem('resume-versions');
      if (stored) return JSON.parse(stored) as ResumeVersion[];
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('resume-template', template);
    } catch {
      /* noop */
    }
  }, [template]);

  useEffect(() => {
    try {
      localStorage.setItem('resume-sections', JSON.stringify(sections));
    } catch {
      /* noop */
    }
  }, [sections]);

  const atsScore = useMemo(() => calculateResumeScore(), [template, sections, versions]);

  const handleTemplateChange = (t: ResumeTemplate) => {
    setTemplateState(t);
  };

  const handleSectionToggle = (key: string, value: boolean) => {
    setSectionsState((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setTemplateState('minimal');
    setSectionsState(Object.fromEntries(SECTIONS.map((s) => [s.key, s.defaultOn])));
  };

  if (loading) return <Skeleton />;

  const enabledCount = Object.values(sections).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Resume Studio Pro
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Preview, optimize, and export your resume
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-medium hover:bg-gray-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={() => onNavigate?.('preview')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800/50 border-b border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  Live Preview
                </span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[10px] text-gray-400 capitalize">{template}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/resume"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 text-[10px] font-medium hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Open
                </a>
              </div>
            </div>
            <div className="bg-gray-100">
              <iframe
                src="/resume"
                title="Resume Preview"
                className="w-full h-[500px]"
                style={{ border: 'none' }}
              />
            </div>
          </motion.div>

          {/* Template Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-white">Template</h3>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {TEMPLATES.map((t) => {
                const isActive = template === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => handleTemplateChange(t.key)}
                    className={`p-3 rounded-lg text-left border transition-all ${
                      isActive
                        ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold block ${
                        isActive ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5 block leading-snug">
                      {t.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Export Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex gap-3"
          >
            <a
              href="/resume?format=pdf"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </a>
            <a
              href="/resume?format=docx"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export DOCX
            </a>
          </motion.div>

          {/* Version History */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-white">Version History</h3>
              {versions.length > 0 && (
                <span className="text-[10px] font-medium text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full ml-auto">
                  {versions.length} export{versions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {versions.length === 0 ? (
              <p className="text-xs text-gray-600 py-2 text-center">
                No previous exports yet. Export your resume to track versions.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {versions.map((v) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 truncate">{v.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 capitalize">{v.template}</span>
                          <span className="text-[10px] text-gray-600">·</span>
                          <span className="text-[10px] text-gray-500">{formatDate(v.date)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          try {
                            localStorage.setItem('resume-template', v.template);
                            setTemplateState(v.template as ResumeTemplate);
                          } catch {
                            /* noop */
                          }
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors shrink-0"
                      >
                        Restore
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* ATS Score */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-white">ATS Score</h3>
            </div>
            <div className="flex flex-col items-center">
              <CircularProgress score={atsScore} size={100} />
              <p className={`text-xs font-medium mt-2 ${getScoreColor(atsScore)}`}>
                {getScoreLabel(atsScore)}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {enabledCount}/{SECTIONS.length} sections enabled
              </p>
            </div>
          </motion.div>

          {/* Section Toggles */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-white">Sections</h3>
            </div>
            <div className="space-y-1.5">
              {SECTIONS.map((section) => (
                <SectionToggle
                  key={section.key}
                  section={section}
                  enabled={sections[section.key] ?? section.defaultOn}
                  onChange={handleSectionToggle}
                />
              ))}
            </div>
          </motion.div>

          {/* ATS Optimization Tips */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">ATS Optimization Tips</h3>
            </div>
            <div className="space-y-1.5">
              {ATS_TIPS.map((tip, i) => {
                const isCompleted = i < Math.round(atsScore / 10);
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 px-2 py-1.5 rounded-lg transition-colors ${
                      isCompleted ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-600 mt-0.5 shrink-0" />
                    )}
                    <span className="text-[11px] leading-snug">{tip}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Recalculate score
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export type { ResumeTemplate };
