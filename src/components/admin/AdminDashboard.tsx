import { useEffect, useState } from 'react';
import {
  Briefcase, Award, Code2, FileText, Mail, GraduationCap, Clock, CheckCircle,
  AlertTriangle, Activity, Database, Globe, RefreshCw, User, BookOpen, Map,
  ExternalLink, Sparkles, ChevronUp, ChevronDown, Eye, EyeOff, Image, Link, Pen
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProjects, getSkills, getCertifications, getEducation, getInternships, getAbout, getProfile, Profile } from '../../lib/api';
import type { AdminTab } from './AdminLayout';

interface Stats {
  projects: number; certifications: number; skills: number;
  education: number; internships: number; contactMessages: number;
}

interface ActivityEntry { id: string; action: string; email: string; created_at: string; }

interface ContentInsight {
  aboutWordCount: number;
  projectsMissingImages: number;
  certsMissingLinks: number;
  featuredProjects: number;
  totalSkills: number;
}

const sections: { id: AdminTab; icon: typeof BookOpen; label: string; enabled: boolean }[] = [
  { id: 'profile', icon: User, label: 'Hero / Profile', enabled: true },
  { id: 'about', icon: BookOpen, label: 'About', enabled: true },
  { id: 'projects', icon: Briefcase, label: 'Projects', enabled: true },
  { id: 'skills', icon: Code2, label: 'Skills', enabled: true },
  { id: 'education', icon: GraduationCap, label: 'Education', enabled: true },
  { id: 'internship', icon: Briefcase, label: 'Internship', enabled: true },
  { id: 'certifications', icon: Award, label: 'Certifications', enabled: true },
  { id: 'journey', icon: Map, label: 'Journey', enabled: true },
  { id: 'contact', icon: Mail, label: 'Contact', enabled: true },
  { id: 'resume', icon: FileText, label: 'Resume', enabled: true },
];

export default function AdminDashboard({ onNavigate }: { onNavigate?: (tab: AdminTab) => void }) {
  const [stats, setStats] = useState<Stats>({ projects: 0, certifications: 0, skills: 0, education: 0, internships: 0, contactMessages: 0 });
  const [insights, setInsights] = useState<ContentInsight>({ aboutWordCount: 0, projectsMissingImages: 0, certsMissingLinks: 0, featuredProjects: 0, totalSkills: 0 });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<'healthy' | 'degraded' | 'checking'>('checking');
  const [sectionOrder, setSectionOrder] = useState(sections);

  const completionScore = (() => {
    let score = 10;
    if (stats.projects > 0) score += 9;
    if (stats.projects >= 3) score += 6;
    if (stats.certifications > 0) score += 9;
    if (stats.certifications >= 3) score += 6;
    if (stats.skills > 0) score += 9;
    if (stats.education > 0) score += 9;
    if (stats.internships > 0) score += 9;
    if (stats.contactMessages > 0) score += 5;
    if (insights.aboutWordCount >= 50) score += 8;
    if (insights.featuredProjects > 0) score += 5;
    if (insights.projectsMissingImages === 0 && stats.projects > 0) score += 5;
    if (insights.certsMissingLinks === 0 && stats.certifications > 0) score += 5;
    if (profile?.profile_photo_url) score += 5;
    return Math.min(100, score);
  })();

  const recommendations: { type: 'warning' | 'info' | 'success'; message: string; action?: string }[] = [];
  if (stats.projects > 0 && insights.projectsMissingImages > 0)
    recommendations.push({ type: 'warning', message: `${insights.projectsMissingImages} project(s) missing thumbnail images. Add visuals to improve portfolio appeal.`, action: 'projects' });
  if (stats.certifications > 0 && insights.certsMissingLinks > 0)
    recommendations.push({ type: 'warning', message: `${insights.certsMissingLinks} certification(s) missing verification links. Add certificate URLs for credibility.`, action: 'certifications' });
  if (insights.aboutWordCount < 50)
    recommendations.push({ type: 'info', message: `About section is ${insights.aboutWordCount} words. Expand to 50+ words for better storytelling.`, action: 'about' });
  if (stats.projects === 0)
    recommendations.push({ type: 'info', message: 'No projects yet. Add your first project to showcase your work.', action: 'projects' });
  if (stats.certifications === 0)
    recommendations.push({ type: 'info', message: 'No certifications listed. Add certifications to build credibility.', action: 'certifications' });
  if (stats.skills === 0)
    recommendations.push({ type: 'info', message: 'No skills added yet. Define your skill categories.', action: 'skills' });
  if (stats.education === 0)
    recommendations.push({ type: 'info', message: 'Education section is empty. Add your academic background.', action: 'education' });
  if (insights.featuredProjects === 0 && stats.projects > 0)
    recommendations.push({ type: 'info', message: 'No featured projects. Feature your best work to highlight it.', action: 'projects' });
  if (!profile?.github)
    recommendations.push({ type: 'warning', message: 'GitHub link missing from profile. Add it for recruiters.', action: 'profile' });
  if (!profile?.linkedin)
    recommendations.push({ type: 'warning', message: 'LinkedIn link missing from profile. Add it for networking.', action: 'profile' });
  if (recommendations.length === 0)
    recommendations.push({ type: 'success', message: 'Your portfolio looks great! Keep adding content to maintain momentum.' });

  useEffect(() => {
    async function load() {
      const [pRes, cRes, sRes, eRes, iRes, cmRes, aRes, abRes, auditRes, profileRes] = await Promise.all([
        getProjects(), getCertifications(), getSkills(), getEducation(), getInternships(),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        getAbout(),
        supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(6),
        getProfile(),
      ]);
      setStats({
        projects: pRes.data?.length || 0, certifications: cRes.data?.length || 0, skills: sRes.data?.length || 0,
        education: eRes.data?.length || 0, internships: iRes.data?.length || 0, contactMessages: cmRes.count || 0,
      });
      setProfile(profileRes.data);
      if (auditRes.data) setActivities(auditRes.data);

      const aboutData = abRes.data;
      const totalWords = aboutData?.reduce((sum, a) => sum + (a.paragraphs?.reduce((s, p) => s + p.split(/\s+/).length, 0) || 0), 0) || 0;
      const missingImages = (pRes.data || []).filter(p => !p.image_url).length;
      const missingCertLinks = (cRes.data || []).filter(c => !c.certificate_url).length;
      const featured = (pRes.data || []).filter(p => p.featured).length;
      const totalSkills = (sRes.data || []).reduce((sum, s) => sum + (s.skills?.length || 0), 0);
      setInsights({ aboutWordCount: totalWords, projectsMissingImages: missingImages, certsMissingLinks: missingCertLinks, featuredProjects: featured, totalSkills });

      const { error } = await supabase.from('site_settings').select('id').limit(1);
      setSupabaseStatus(error ? 'degraded' : 'healthy');
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { icon: Briefcase, label: 'Projects', value: stats.projects, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' },
    { icon: Award, label: 'Certifications', value: stats.certifications, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500' },
    { icon: Code2, label: 'Skills Categories', value: stats.skills, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
    { icon: GraduationCap, label: 'Education', value: stats.education, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' },
    { icon: Briefcase, label: 'Internships', value: stats.internships, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' },
    { icon: Mail, label: 'Messages', value: stats.contactMessages, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500' },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 h-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <div key={i} className="bg-white dark:bg-dark-800 rounded-2xl p-6 h-28" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Command Center</h2>
          <p className="text-sm text-gray-500 mt-1">Everything you need to manage your digital presence</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${supabaseStatus === 'healthy' ? 'bg-success-500' : 'bg-warning-500'} animate-pulse`} />
            <span className="text-gray-500">All Systems Operational</span>
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Profile Identity Card */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700 bg-gradient-to-r from-primary-500/5 to-transparent">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              (profile?.name || '?')[0]
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name || 'Your Name'}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{profile?.title || 'Your Title'}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  {profile?.location && <span>📍 {profile.location}</span>}
                  {profile?.email && <span>✉️ {profile.email}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-dark-600" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${completionScore}, 100`} className="text-primary-500 transition-all duration-1000 stroke-linecap-round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white">{completionScore}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Website Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-dark-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center text-success-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Website</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Online</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-dark-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Database</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{supabaseStatus}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-dark-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Content Updated</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-dark-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Resume Generated</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Auto</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-dark-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{card.label}</p>
            <div className="mt-2 w-full h-1 rounded-full bg-gray-100 dark:bg-dark-700 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${card.color} transition-all duration-700`} style={{ width: `${Math.min(100, card.value * 33)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Content Insights + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Insights */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Content Insights</h3>
              <p className="text-[11px] text-gray-500">Section-by-section analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">About</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{insights.aboutWordCount} words</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-dark-600 overflow-hidden">
                <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, (insights.aboutWordCount / 100) * 100)}%` }} />
              </div>
              {insights.aboutWordCount < 50 && <p className="text-[10px] text-warning-500 mt-1">Add more content</p>}
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Projects</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{insights.featuredProjects} featured</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{insights.projectsMissingImages > 0 ? `${insights.projectsMissingImages} missing images` : 'All have thumbnails'}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Skills</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{insights.totalSkills} total</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{stats.skills} categories</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Certifications</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{stats.certifications} total</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{insights.certsMissingLinks > 0 ? `${insights.certsMissingLinks} missing links` : 'All verified'}</div>
            </div>
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recommendations</h3>
              <p className="text-[11px] text-gray-500">{recommendations.length} action items</p>
            </div>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-xs ${
                rec.type === 'warning' ? 'bg-warning-50 dark:bg-warning-900/10 text-warning-700 dark:text-warning-400' :
                rec.type === 'success' ? 'bg-success-50 dark:bg-success-900/10 text-success-700 dark:text-success-400' :
                'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400'
              }`}>
                {rec.type === 'warning' ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> :
                 rec.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> :
                 <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p>{rec.message}</p>
                  {rec.action && onNavigate && (
                    <button onClick={() => onNavigate(rec.action as AdminTab)} className="mt-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Go to {rec.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Page Structure + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Structure */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
              <Map className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Page Structure</h3>
              <p className="text-[11px] text-gray-500">Sections on your portfolio</p>
            </div>
          </div>
          <div className="space-y-1">
            {sectionOrder.map((section, idx) => (
              <div key={section.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors group">
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button disabled={idx === 0} onClick={() => { const copy = [...sectionOrder]; [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]; setSectionOrder(copy); }} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                  <button disabled={idx === sectionOrder.length - 1} onClick={() => { const copy = [...sectionOrder]; [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]]; setSectionOrder(copy); }} className="text-gray-400 hover:text-gray-600 disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                </div>
                <section.icon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{section.label}</span>
                {onNavigate && (
                  <button onClick={() => onNavigate(section.id)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all">
                    <Pen className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="text-[11px] text-gray-500">Latest changes to your portfolio</p>
            </div>
          </div>
          {activities.length > 0 ? (
            <div className="space-y-0">
              {activities.map((entry, idx) => (
                <div key={entry.id} className="flex gap-3 pb-3 relative">
                  {idx < activities.length - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-dark-700" />}
                  <div className="w-7 h-7 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{entry.action.replace(/_/g, ' ')}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Activity className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-dark-600" />
              <p className="text-sm">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
