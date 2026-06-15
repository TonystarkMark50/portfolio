import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const springEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const trackW = 52, trackH = 28, thumbSize = 22, gutter = 3;

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const thumbPos = isDark ? trackW - thumbSize - gutter : gutter;

  return (
    <button
      onClick={toggleTheme}
      className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
      style={{ width: trackW, height: trackH }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Outer hover glow */}
      <div
        className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.2) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 30% 50%, rgba(251,191,36,0.15) 0%, transparent 70%)',
          transitionTimingFunction: springEasing,
        }}
      />

      {/* Track */}
      <div
        className="absolute inset-0 rounded-full transition-[background,box-shadow] duration-[600ms]"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
            : 'linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)',
          transitionTimingFunction: springEasing,
          boxShadow: isDark
            ? 'inset 0 1px 1px rgba(255,255,255,0.06), 0 1px 4px rgba(0,0,0,0.25)'
            : 'inset 0 1px 1px rgba(255,255,255,0.6), 0 1px 4px rgba(0,0,0,0.08)',
        }}
      />

      {/* Glass overlay */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-[600ms]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
          opacity: 0.5,
        }}
      />

      {/* Thumb */}
      <div
        className="absolute rounded-full bg-white flex items-center justify-center transition-[left,transform] duration-[600ms] group-hover:scale-105 group-active:scale-95 shadow-sm"
        style={{
          top: gutter,
          left: thumbPos,
          width: thumbSize,
          height: thumbSize,
          transitionTimingFunction: springEasing,
          boxShadow: isDark
            ? '0 1px 3px rgba(0,0,0,0.25), 0 0 8px rgba(99,102,241,0.12)'
            : '0 1px 3px rgba(0,0,0,0.1), 0 0 8px rgba(251,191,36,0.1)',
        }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-indigo-600" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </div>
    </button>
  );
}
