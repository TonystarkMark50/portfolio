import { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import {
  ArrowRight, Download, Github, Linkedin, Mail,
  ChevronDown
} from 'lucide-react';
import { useMousePosition } from '../../hooks/useScroll';
import { useSupabaseData } from '../../hooks/usePortfolioData';
import { loadProfile, loadAbout } from '../../lib/loaders';
import { trackResumeDownload } from '../../lib/analytics';
import ConfirmationModal from '../../components/ConfirmationModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  },
};

function Particles() {
  const particles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    drift: Math.random() * 20 - 10,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-primary-500/30 to-accent-500/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -200 - Math.random() * 200],
            x: [0, p.drift],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

function OrbitalRing({ radius, color, speed, rotation = 0 }: { radius: number; color: string; speed: number; rotation?: number }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        borderColor: color,
        opacity: 0.15,
        rotate: rotation,
      }}
      animate={{ rotate: [rotation, rotation + 360] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    >
      <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{ backgroundColor: color, top: -1, left: '50%', marginLeft: -4 }}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { x: mouseX, y: mouseY } = useMousePosition();
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { data: profile } = useSupabaseData(loadProfile);
  const { data: aboutData } = useSupabaseData(loadAbout);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResumeDownload = async () => {
    setShowDownloadModal(false);
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const { generateAndDownloadResume } = await import('../../utils/generateResume');
      await Promise.all([generateAndDownloadResume(), trackResumeDownload()]);
    } finally {
      setIsGenerating(false);
    }
  };

  const parallaxX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const parallaxY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  const bgX = useTransform(parallaxX, [0, window.innerWidth], [-20, 20]);
  const bgY = useTransform(parallaxY, [0, window.innerHeight], [-20, 20]);
  const orbX = useTransform(parallaxX, [0, window.innerWidth], [10, -10]);
  const orbY = useTransform(parallaxY, [0, window.innerHeight], [10, -10]);
  const bgTransform = useMotionTemplate`translateX(${bgX}px) translateY(${bgY}px)`;
  const orbTransform = useMotionTemplate`translateX(${orbX}px) translateY(${orbY}px)`;

  if (!profile || !aboutData) return null;

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Background layer */}
      <div className="absolute inset-0 mesh-bg" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full blur-[120px] sm:blur-[160px] opacity-30 dark:opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)',
          transform: bgTransform,
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full blur-[100px] sm:blur-[140px] opacity-25 dark:opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(34,197,94,0.1) 50%, transparent 70%)',
          transform: orbTransform,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.05]" />

      {/* Particles */}
      {mounted && <Particles />}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        {/* Mobile Profile Photo - visible only on small screens */}
        <motion.div
          className="flex lg:hidden justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-[3px] border-white/30 shadow-xl">
            {imgError || !profile?.avatar_url ? (
              <div className="w-full h-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-white/60">{profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'JT'}</span>
              </div>
            ) : (
              <img
                src={profile.avatar_url}
                alt={profile.name || 'Profile'}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* ===== LEFT COLUMN (3/5 width on desktop) ===== */}
          <motion.div
            className="lg:col-span-3 flex flex-col"
            variants={containerVariants}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
          >
            {/* 1. Full Name */}
            <motion.div variants={itemVariants} className="mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-black tracking-tight leading-[1.1]">
                <span className="whitespace-nowrap bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  {profile.name}
                </span>
              </h1>
            </motion.div>

            {/* 2. Professional Title */}
            <motion.div variants={itemVariants} className="mb-10">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-theme-primary leading-snug mb-2">
                {profile.title}
              </p>
              <p className="text-sm sm:text-base text-theme-secondary font-medium leading-relaxed">
                {aboutData.subtitle}
              </p>
            </motion.div>

            {/* 3. Short Introduction */}
            <motion.div variants={itemVariants} className="space-y-5 mb-12 max-w-[600px]">
              <p className="text-sm sm:text-base text-theme-body font-medium leading-relaxed" style={{ lineHeight: '1.8' }}>
                {aboutData.content[0]}
              </p>
              <p className="text-sm sm:text-base text-theme-body font-medium leading-relaxed" style={{ lineHeight: '1.8' }}>
                {aboutData.content[1]}
              </p>
            </motion.div>

            {/* 4. Primary Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 mt-4 mb-10">
              <a
                href="#projects"
                className="relative group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                <span className="relative z-10">View Project</span>
              </a>

              <div className="relative group">
                <ConfirmationModal
                  open={showDownloadModal}
                  action={{
                    title: 'Download Resume',
                    message: 'Would you like to download the latest version of my resume?',
                    confirmLabel: 'Download Resume',
                    variant: 'download',
                    icon: 'download',
                  }}
                  onConfirm={handleResumeDownload}
                  onCancel={() => setShowDownloadModal(false)}
                />
                <button
                  onClick={() => setShowDownloadModal(true)}
                  disabled={isGenerating}
                  className="relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-glow disabled:opacity-70 disabled:cursor-wait"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {isGenerating ? (
                    <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5 relative z-10" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  )}
                  <span className="relative z-10">{isGenerating ? 'Generating...' : 'Download Resume'}</span>
                </button>
              </div>

            </motion.div>

            {/* Social links */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 mt-3">
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="p-2.5 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 hover:border-primary-500/50 hover:scale-110 transition-all duration-300"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 text-theme-muted" />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="p-2.5 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 hover:border-primary-500/50 hover:scale-110 transition-all duration-300"
              >
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-theme-muted" />
              </a>
              <a
                href={`mailto:${profile.email}`}
                aria-label="Send Email"
                className="p-2.5 sm:p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 hover:border-primary-500/50 hover:scale-110 transition-all duration-300"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-theme-muted" />
              </a>
            </motion.div>
          </motion.div>

          {/* ===== RIGHT COLUMN (2/5 width on desktop) ===== */}
          <motion.div
            ref={constraintsRef}
            className="relative hidden lg:flex lg:col-span-2 flex-col items-center justify-center gap-6 min-h-[450px] xl:min-h-[500px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Orbital rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <OrbitalRing radius={120} color="rgba(14,165,233,0.3)" speed={25} />
              <OrbitalRing radius={160} color="rgba(139,92,246,0.2)" speed={35} rotation={45} />
              <OrbitalRing radius={200} color="rgba(34,197,94,0.15)" speed={45} rotation={-30} />
            </div>

            {/* Profile Photo Only */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden p-4 sm:p-6">
                <div className="w-56 h-56 sm:w-64 sm:h-64 xl:w-72 xl:h-72 rounded-2xl overflow-hidden border-[3px] border-white/30 shadow-xl hover:border-primary-400/60 transition-all duration-500 hover:scale-[1.02]">
                  {imgError || !profile?.avatar_url ? (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white/60">{profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'JT'}</span>
                    </div>
                  ) : (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name || 'Profile'}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="relative z-10 flex justify-center pb-4 sm:pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="flex flex-col items-center gap-1 text-theme-muted cursor-pointer"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          onClick={() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
