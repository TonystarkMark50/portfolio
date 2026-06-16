import { useState, useEffect, useRef, RefObject } from 'react';

export function useIntersectionObserver(
  options: IntersectionObserverInit = { threshold: 0.1, rootMargin: '0px' }
): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
}

export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { threshold: 0, rootMargin: '-80px 0px -40% 0px' }
    );

    sections.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return position;
}

export function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startTime.current = null;
    };
  }, [start, end, duration]);

  return count;
}

export function useTypingEffect(
  texts: string[],
  typingSpeed: number = 50,
  deletingSpeed: number = 30,
  pauseDuration: number = 2000
) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % texts.length);
      } else {
        timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length - 1));
        }, deletingSpeed);
      }
    } else {
      if (displayText === currentText) {
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      } else {
        timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentIndex, isDeleting, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return displayText;
}
