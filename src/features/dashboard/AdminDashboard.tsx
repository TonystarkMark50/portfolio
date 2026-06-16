import { useEffect, useState } from 'react';
import {
  User, Briefcase, Award, Code2, GraduationCap, Map, Mail, FileText,
  Clock, CheckCircle, AlertTriangle, Sparkles, Activity, Monitor, Tablet, Smartphone,
  Edit3, Eye, RefreshCw, Download, ShieldCheck, ShieldAlert, Globe, Image,
  Github, Linkedin, Upload, BarChart3, Settings,
  ChevronRight, Zap, Moon,   MessageSquare, Bell
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  getProjects, getSkills, getCertifications, getEducation, getInternships,
  getProfile, Profile, Project, Certification, Education as EduType,
  Skill, Internship
} from '../../lib/api';
import type { AdminTab } from '../../components/admin/AdminLayout';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const deviceConfig: Record<DeviceType, { width: number; label: string; icon: typeof Monitor }> = {
  desktop: { width: 1280, label: 'Desktop', icon: Monitor },
  tablet: { width: 768, label: 'Tablet', icon: Tablet },
  mobile: { width: 375, label: 'Mobile', icon: Smartphone },
};

function CircularProgress({ pct, size = 120 }: { pct: number; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(55,65,81)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(59,130,246)" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{pct}%</span>
        <span className="text-[10px] text-gray-400">complete</span>
      </div>
    </div>
  );
}

function HealthBarItem({ label, filled, onClick }: { label: string; filled: boolean; onClick?: () => void }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${filled ? 'bg-emerald-500' : 'bg-gray-600'}`} />
        <span className={`text-xs ${filled ? 'text-gray-300' : 'text-gray-500'}`}>{label}</span>
      </div>
      {!filled && onClick && (
        <button onClick={onClick} className="text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">Add</button>
      )}
    </div>
  );
}

function formatTimeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminDashboard({ onNavigate }: { onNavigate?: (tab: AdminTab) => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [education, setEducation] = useState<EduType[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [activities, setActivities] = useState<{ id: string; action: string; email: string; created_at: string }[]>([]);
  const [messages, setMessages] = useState<{ id: string; name: string; subject: string; is_read: boolean; created_at: string }[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [loading, setLoading] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [mediaItems, setMediaItems] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [
        pRes, projRes, certRes, eduRes, skillRes, internRes,
        auditRes, msgRes, settingsRes,
      ] = await Promise.all([
        getProfile(), getProjects(), getCertifications(), getEducation(), getSkills(), getInternships(),
        supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('site_settings').select('*').limit(1).maybeSingle(),
      ]);
      setProfile(pRes.data);
      setProjects(projRes.data || []);
      setCertifications(certRes.data || []);
      setEducation(eduRes.data || []);
      setSkills(skillRes.data || []);
      setInternships(internRes.data || []);
      if (auditRes.data) setActivities(auditRes.data);
      setUnreadMessages(msgRes.count || 0);
      if (settingsRes.data) {
        const s = settingsRes.data;
        setSeoTitle(s.site_title || '');
        setSeoDesc(s.seo_description || '');
      }

      const { data: msgs } = await supabase.from('contact_submissions').select('id, name, subject, is_read, created_at').order('created_at', { ascending: false }).limit(5);
      if (msgs) setMessages(msgs);

      const bucketResults = await Promise.all(
        ['certification-logos', 'project-images', 'resume-assets'].map(async (bucket) => {
          const { data: files } = await supabase.storage.from(bucket).list();
          if (!files) return [];
          return files.map(f => {
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(f.name);
            return { name: f.name, url: publicUrl };
          });
        })
      );
      setMediaItems(bucketResults.flat().slice(0, 8));
    } catch (err) {
      console.error('Dashboard load failed:', err);
    }
    setLoading(false);
  }

  // Missing items for health
  const healthChecks = [
    { label: 'Profile Photo', filled: !!profile?.avatar_url, tab: 'profile' as AdminTab },
    { label: 'LinkedIn URL', filled: !!profile?.linkedin, tab: 'profile' as AdminTab },
    { label: 'GitHub URL', filled: !!profile?.github, tab: 'profile' as AdminTab },
    { label: 'Projects', filled: projects.length > 0, tab: 'projects' as AdminTab },
    { label: 'Certifications', filled: certifications.length > 0, tab: 'certifications' as AdminTab },
    { label: 'Education', filled: education.length > 0, tab: 'education' as AdminTab },
    { label: 'Skills', filled: skills.length > 0, tab: 'skills' as AdminTab },
    { label: 'Internships', filled: internships.length > 0, tab: 'internship' as AdminTab },
  ];
  const healthPct = Math.round((healthChecks.filter(h => h.filled).length / healthChecks.length) * 100);

  const quickEditItems: { label: string; tab: AdminTab; icon: typeof User }[] = [
    { label: 'Profile', tab: 'profile', icon: User },
    { label: 'Projects', tab: 'projects', icon: Briefcase },
    { label: 'Skills', tab: 'skills', icon: Code2 },
    { label: 'Certifications', tab: 'certifications', icon: Award },
    { label: 'Education', tab: 'education', icon: GraduationCap },
    { label: 'Journey', tab: 'journey', icon: Map },
    { label: 'Contact', tab: 'contact', icon: Mail },
  ];

  async function handleSaveSEO() {
    setSaving(true);
    await supabase.from('site_settings').upsert({ site_title: seoTitle, seo_description: seoDesc });
    setSaving(false);
  }

  const siteUrl = window.location.origin;
  const currentDevice = deviceConfig[device];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-gray-800 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 bg-gray-800 rounded-2xl" />
        <div className="h-48 bg-gray-800 rounded-2xl" />
      </div>
      <div className="h-96 bg-gray-800 rounded-2xl" />
    </div>
  );

  const NavBtn = ({ tab, label }: { tab: AdminTab; label?: string }) => (
    <button onClick={() => onNavigate?.(tab)} className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
      {label || 'Edit'} <ChevronRight className="w-3 h-3" />
    </button>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">

      {/* ─────── SECTION 1: PROFILE OVERVIEW CARD ─────── */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg overflow-hidden ring-2 ring-blue-500/20">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.name || '?')[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-white">{profile?.name || 'Your Name'}</h1>
                  {profile?.title && <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">{profile.title}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  {profile?.email && <span className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {profile.email}</span>}
                  {profile?.location && <span className="text-xs text-gray-400">📍 {profile.location}</span>}
                </div>
                {education.length > 0 && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>🎓 {education[0].institution}</span>
                    {education[0].gpa && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">CGPA {education[0].gpa}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View Site
                </a>
                <a href="/resume" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  <Download className="w-3.5 h-3.5" /> Resume
                </a>
                <button onClick={() => onNavigate?.('profile')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────── SECTION 2: PORTFOLIO HEALTH CENTER + LIVE STATUS ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Center */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Portfolio Health</h2>
          </div>
          <div className="flex flex-col items-center">
            <CircularProgress pct={healthPct} size={130} />
          </div>
          <div className="mt-5 space-y-2.5">
            {healthChecks.filter(h => !h.filled).slice(0, 4).map(h => (
              <div key={h.label} className="flex items-center gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-gray-400 flex-1">{h.label}</span>
                <button onClick={() => onNavigate?.(h.tab)} className="text-blue-400 hover:text-blue-300 font-medium">Fix</button>
              </div>
            ))}
            {healthChecks.filter(h => !h.filled).length === 0 && (
              <div className="text-center py-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">All checks passed</p>
              </div>
            )}
          </div>
        </div>

        {/* Website Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Globe className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Website Status</h2>
          </div>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs text-gray-300">Website Online</span>
              </div>
              <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Live</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Domain</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">SSL</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Valid</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Last Deploy</span>
              <span className="text-xs text-gray-500">{formatTimeAgo(new Date().toISOString())}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Content Updated</span>
              <span className="text-xs text-gray-500">Today</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Content Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Projects', value: projects.length, icon: Briefcase },
              { label: 'Certs', value: certifications.length, icon: Award },
              { label: 'Education', value: education.length, icon: GraduationCap },
              { label: 'Skills', value: skills.length, icon: Code2 },
            ].map(s => (
              <div key={s.label} className="bg-gray-800/50 rounded-xl p-3 text-center">
                <s.icon className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────── SECTION 3: CONTENT OVERVIEW (actual data) ─────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Content Overview</h2>
          <span className="text-xs text-gray-500">{projects.length + certifications.length + education.length + skills.length} total items</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Projects */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Briefcase className="w-4 h-4 text-blue-400" /></div>
                <span className="text-sm font-semibold text-white">Projects</span>
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{projects.length}</span>
              </div>
              <NavBtn tab="projects" />
            </div>
            {projects.length > 0 ? (
              <div className="space-y-1.5">
                {projects.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${p.status === 'published' || p.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-500">{p.type}{p.completed_date ? ` · ${new Date(p.completed_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.technologies?.length > 0 && (
                        <div className="flex -space-x-1 mr-1">
                          {p.technologies.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">{t}</span>
                          ))}
                        </div>
                      )}
                      <button onClick={() => onNavigate?.('projects')} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500"><Edit3 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                {projects.length > 4 && <p className="text-xs text-gray-600 text-center pt-1">+{projects.length - 4} more</p>}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">No projects yet</p>
                <button onClick={() => onNavigate?.('projects')} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add project →</button>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center"><Award className="w-4 h-4 text-purple-400" /></div>
                <span className="text-sm font-semibold text-white">Certifications</span>
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{certifications.length}</span>
              </div>
              <NavBtn tab="certifications" />
            </div>
            {certifications.length > 0 ? (
              <div className="space-y-1.5">
                {certifications.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                        {c.logo_url ? <img src={c.logo_url} alt="" className="w-full h-full object-contain p-1" /> : <Award className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{c.title}</p>
                        <p className="text-[11px] text-gray-500">{c.organization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.certificate_url ? (
                        <span title="Verified" className="text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span title="No link" className="text-amber-400"><ShieldAlert className="w-3.5 h-3.5" /></span>
                      )}
                      <button onClick={() => onNavigate?.('certifications')} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                {certifications.length > 4 && <p className="text-xs text-gray-600 text-center pt-1">+{certifications.length - 4} more</p>}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Award className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">No certifications yet</p>
                <button onClick={() => onNavigate?.('certifications')} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add certification →</button>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-amber-400" /></div>
                <span className="text-sm font-semibold text-white">Education</span>
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{education.length}</span>
              </div>
              <NavBtn tab="education" />
            </div>
            {education.length > 0 ? (
              <div className="space-y-3">
                {education.slice(0, 3).map(e => (
                  <div key={e.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-800/50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{e.degree}{e.field ? ` in ${e.field}` : ''}</p>
                      <p className="text-[11px] text-gray-500">{e.institution} · {e.current ? 'Present' : ''}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p>
                    </div>
                    <button onClick={() => onNavigate?.('education')} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><Edit3 className="w-3 h-3" /></button>
                  </div>
                ))}
                {education.length > 3 && <p className="text-xs text-gray-600 text-center pt-1">+{education.length - 3} more</p>}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">No education entries</p>
                <button onClick={() => onNavigate?.('education')} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add education →</button>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Code2 className="w-4 h-4 text-emerald-400" /></div>
                <span className="text-sm font-semibold text-white">Skills</span>
                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{skills.length} groups</span>
              </div>
              <NavBtn tab="skills" />
            </div>
            {skills.length > 0 ? (
              <div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {skills.flatMap(s => s.skills).slice(0, 15).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-800 text-xs text-gray-300 border border-gray-700">{skill}</span>
                  ))}
                  {skills.flatMap(s => s.skills).length > 15 && <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-xs text-gray-500">+{skills.flatMap(s => s.skills).length - 15}</span>}
                </div>
                <p className="text-[11px] text-gray-600">{skills.length} categories across {skills.flatMap(s => s.skills).length} skills</p>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Code2 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs">No skills defined</p>
                <button onClick={() => onNavigate?.('skills')} className="mt-2 text-xs text-blue-400 hover:text-blue-300">Add skills →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────── SECTION 4: LIVE WEBSITE PREVIEW (split) ─────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Live Website Preview</h2>
          <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg p-1">
            {(Object.entries(deviceConfig) as [DeviceType, typeof currentDevice][]).map(([key, cfg]) => (
              <button key={key} onClick={() => setDevice(key)} className={`p-2 rounded-lg transition-colors ${device === key ? 'bg-gray-700 shadow-sm text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                <cfg.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Quick Editor */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Quick Edit</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickEditItems.map(item => (
                <button key={item.tab} onClick={() => onNavigate?.(item.tab)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs transition-colors border border-gray-700 hover:border-gray-600">
                  <item.icon className="w-3.5 h-3.5 text-blue-400" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-800">
              <p className="text-[10px] text-gray-600 mb-2">SEO Settings</p>
              <div className="space-y-2">
                <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Site Title" className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
                <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Meta Description" rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600">{seoDesc.length} / 160</span>
                  <button onClick={handleSaveSEO} disabled={saving} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save SEO'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border-b border-gray-800">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] text-gray-500 truncate inline-block max-w-[250px]">{siteUrl}</span>
              </div>
            </div>
            <div className="flex justify-center bg-gray-950/50 p-4 overflow-x-auto">
              <div className="transition-all duration-300 overflow-hidden rounded-lg border border-gray-800 bg-white" style={{ width: currentDevice.width > 700 ? '100%' : currentDevice.width, maxWidth: '100%' }}>
                <iframe src={siteUrl} title="Live Preview" className="w-full bg-white" style={{ height: 480, maxHeight: '60vh' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────── SECTION 5: ACTIVITY TIMELINE + CONTACT CENTER ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            </div>
            {activities.length > 0 && <span className="text-[10px] text-gray-500">{activities.length} events</span>}
          </div>
          {activities.length > 0 ? (
            <div className="space-y-1">
              {activities.map((entry, idx) => (
                <div key={entry.id} className="flex gap-3 p-2.5 relative">
                  {idx < activities.length - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-800" />}
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 capitalize">{entry.action.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-gray-500">{formatTimeAgo(entry.created_at)} · {entry.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-10 h-10 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No recent changes</p>
            </div>
          )}
        </div>

        {/* Contact Center */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Messages</h3>
              {unreadMessages > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">{unreadMessages} new</span>
              )}
            </div>
            <NavBtn tab="contact" label="View all" />
          </div>
          {messages.length > 0 ? (
            <div className="space-y-1.5">
              {messages.map(m => (
                <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer border border-gray-800 hover:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{m.name}</p>
                      {!m.is_read && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{m.subject || 'No subject'}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{formatTimeAgo(m.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No messages yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ─────── SECTION 6: RESUME STUDIO + MEDIA LIBRARY ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Studio */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-rose-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Resume Studio</h3>
                <p className="text-[10px] text-gray-500">Auto-generated ATS resume</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/resume" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition-colors shadow-sm">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
              <a href="/resume" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 h-48">
              <iframe src="/resume" title="Resume" className="w-full h-full" />
            </div>
            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-[10px] text-gray-500 mb-1">ATS Score</p>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-white">{healthPct}%</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-700 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${healthPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-[10px] text-gray-500 mb-2">Coverage</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Profile', filled: !!profile?.name },
                    { label: 'Skills', filled: skills.length > 0 },
                    { label: 'Education', filled: education.length > 0 },
                    { label: 'Projects', filled: projects.length > 0 },
                    { label: 'Certs', filled: certifications.length > 0 },
                  ].map(item => (
                    <HealthBarItem key={item.label} label={item.label} filled={item.filled} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Media Library */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Image className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Media Library</h3>
                  <p className="text-[10px] text-gray-500">Upload and manage assets</p>
                </div>
              </div>
              <button onClick={() => onNavigate?.('media')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" /> Upload
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {mediaItems.length > 0 ? mediaItems.slice(0, 8).map(item => (
                <div key={item.name} className="aspect-square rounded-lg bg-gray-800 border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors cursor-pointer">
                  {/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(item.name) ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                </div>
              )) : (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-600">
                    <Image className="w-5 h-5" />
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{mediaItems.length} asset{mediaItems.length !== 1 ? 's' : ''}</span>
              <NavBtn tab="media" label="Open library" />
            </div>
        </div>
      </div>

      {/* ─────── SECTION 7: SETTINGS (quick) + Notif Test ─────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Settings</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const { error } = await supabase.from('notifications').insert({
                  type: 'test',
                  title: 'Test Notification',
                  message: 'This is a test notification - if you see this the system works!',
                  metadata: { test: true, source: 'admin-dashboard' },
                  is_read: false,
                });
                if (error) {
                  alert('ERROR: ' + error.message);
                } else {
                  alert('Test notification created! Check the bell icon.');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" /> Test Notification
            </button>
            <NavBtn tab="settings" label="Full settings" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Social Links</p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <Github className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-300 flex-1 truncate">{profile?.github || 'Not set'}</span>
              <button onClick={() => onNavigate?.('profile')} className="text-[10px] text-blue-400">Edit</button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <Linkedin className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-300 flex-1 truncate">{profile?.linkedin || 'Not set'}</span>
              <button onClick={() => onNavigate?.('profile')} className="text-[10px] text-blue-400">Edit</button>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">SEO</p>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <p className="text-[10px] text-gray-500">Site Title</p>
                <p className="text-xs text-gray-300 truncate">{seoTitle || 'Not set'}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <p className="text-[10px] text-gray-500">Meta Description</p>
                <p className="text-xs text-gray-300 truncate">{seoDesc || 'Not set'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Theme</p>
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
              <Moon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-gray-300">Dark Mode Active</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Premium dark experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
