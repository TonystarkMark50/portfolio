import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  Loader2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onNavigate?: (tab: string) => void;
}

interface ActionButton {
  label: string;
  prompt: string;
}

const ACTIONS: ActionButton[] = [
  {
    label: 'Generate About Section',
    prompt: 'Generate About Section',
  },
  {
    label: 'Improve Project Description',
    prompt: 'Improve Project Description',
  },
  {
    label: 'Create Resume Bullet',
    prompt: 'Create Resume Bullet',
  },
  {
    label: 'Optimize for ATS',
    prompt: 'Optimize for ATS',
  },
  {
    label: 'Generate SEO Metadata',
    prompt: 'Generate SEO Metadata',
  },
  {
    label: 'Write LinkedIn Summary',
    prompt: 'Write LinkedIn Summary',
  },
];

const RESPONSES: Record<string, string> = {
  'Generate About Section':
    'I\'m a passionate full-stack developer with 5+ years of experience building scalable web applications. I specialize in React, TypeScript, and Node.js, with a strong focus on creating intuitive user experiences. My approach combines clean architecture with performance optimization to deliver products that users love. When I\'m not coding, you\'ll find me exploring new technologies, contributing to open-source projects, or mentoring aspiring developers.',
  'Improve Project Description':
    'Here\'s an improved version of your project description:\n\n**Project Overview**\nBuilt a real-time collaborative dashboard using Next.js and WebSockets that enables teams to track project milestones, manage tasks, and visualize progress through interactive charts.\n\n**Key Achievements**\n- Reduced page load time by 40% through code splitting and lazy loading\n- Implemented real-time sync across 50+ concurrent users with <100ms latency\n- Architected a role-based access control system supporting 3 user tiers\n- Increased user engagement by 25% with gamified progress tracking\n\n**Tech Stack**\nNext.js, TypeScript, WebSockets, PostgreSQL, Redis, Docker',
  'Create Resume Bullet':
    '**Before:** Worked on the company website\n\n**Optimized Bullet Points:**\n\n- Engineered a responsive company website using React and Tailwind CSS, improving mobile traffic by 35% and reducing bounce rate by 20%\n- Implemented CI/CD pipelines with GitHub Actions, automating deployment workflows and cutting release cycles from 2 weeks to 2 days\n- Optimized database queries reducing API response times by 60% through strategic indexing and query refactoring\n- Led a cross-functional team of 4 developers in migrating legacy jQuery codebase to modern React architecture\n- Achieved 98% Lighthouse performance score through code splitting, asset optimization, and lazy loading strategies',
  'Optimize for ATS':
    '**ATS Optimization Analysis**\n\n**Current Issues Found:**\n- Missing relevant keywords: React, TypeScript, CI/CD, Agile, REST APIs\n- Formatting: Avoid tables, columns, and graphics\n- Sections need restructuring\n\n**Optimized Snippet:**\n```\nEXPERIENCE\nSenior Frontend Developer | TechCorp Inc. | 2021-Present\n- Led development of React-based SaaS platform serving 10K+ users\n- Improved application performance by 45% through code optimization\n- mentored 3 junior developers in modern React practices\n\nSKILLS\nLanguages: TypeScript, JavaScript, Python, SQL\nFrameworks: React, Next.js, Node.js, Express\nTools: Git, Docker, AWS, CI/CD, Jest, Cypress\n\nCERTIFICATIONS\n- AWS Certified Developer - Associate\n- Google Professional Cloud Developer\n```',
  'Generate SEO Metadata':
    '**SEO Metadata Generated**\n\n**Title Tag (50-60 chars):**\n> Full-Stack Developer Portfolio | React & TypeScript Expert\n\n**Meta Description (150-160 chars):**\n> Senior full-stack developer specializing in React, TypeScript, and Node.js. View my portfolio featuring 15+ production applications, case studies, and technical blog posts.\n\n**Open Graph Tags:**\n- og:title: Full-Stack Developer Portfolio | React & TypeScript\n- og:description: Explore my work in building scalable web applications with modern JavaScript.\n- og:type: website\n\n**Twitter Cards:**\n- twitter:card: summary_large_image\n- twitter:title: Full-Stack Developer Portfolio\n- twitter:description: Building scalable web apps with React, TypeScript & Node.js',
  'Write LinkedIn Summary':
    '**LinkedIn Summary Draft**\n\n> 👨‍💻 Full-Stack Developer | React, TypeScript & Node.js\n>\n> I build products that make a difference. With 5+ years of experience in full-stack development, I specialize in creating performant, accessible, and delightful web applications.\n>\n> 🔭 Currently: Building a real-time collaboration platform at TechCorp\n> 🌱 Learning: System Design & Cloud Architecture (AWS)\n> 💬 Ask me about: React performance, TypeScript patterns, or breaking into tech\n> 📫 Reach me: [your-email]\n>\n> **Featured Work**\n> • Built a SaaS platform serving 10K+ users with 99.9% uptime\n> • Reduced deployment time by 80% with automated CI/CD pipelines\n> • Open-source contributor to React ecosystem projects\n>\n> Let\'s connect if you\'re passionate about great engineering!',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function simulateResponse(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const matched = Object.keys(RESPONSES).find((key) =>
        prompt.toLowerCase().includes(key.toLowerCase()),
      );
      resolve(matched ? RESPONSES[matched] : RESPONSES['Generate About Section']);
    }, delay);
  });
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export default function AIAssistant(_props: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi! I\'m your AI writing assistant. I can help you craft better content for your portfolio. Choose an action below or type a custom prompt.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const addMessage = (role: Message['role'], content: string) => {
    const msg: Message = { id: generateId(), role, content };
    setMessages((prev) => [...prev, msg]);
  };

  const handleAction = async (action: ActionButton) => {
    addMessage('user', action.prompt);
    setIsLoading(true);
    const response = await simulateResponse(action.prompt);
    addMessage('assistant', response);
    setIsLoading(false);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    addMessage('user', trimmed);
    setIsLoading(true);
    const response = await simulateResponse(trimmed);
    addMessage('assistant', response);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 pb-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          AI Assistant
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Generate content, optimize writing, and improve your portfolio
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 py-4 overflow-x-auto shrink-0 scrollbar-none">
        {ACTIONS.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(action)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-xs font-medium text-blue-300 hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-200 transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {action.label}
          </motion.button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-md'
                    : 'bg-gray-800 border border-gray-700/50 text-gray-200 rounded-tl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-gray-800 border border-gray-700/50 rounded-2xl rounded-tl-md px-4 py-3">
              <ThinkingDots />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 pt-4 border-t border-gray-800 mt-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors resize-none disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
        <p className="text-[10px] text-gray-600 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
