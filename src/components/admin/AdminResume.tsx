import { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Clock, CheckCircle, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile, getSkills, getEducation, getInternships, getCertifications } from '../../lib/api';
import ContentEditor, { AutoSaveBar, useAutoSave } from './ContentEditor';

export default function AdminResume() {
  const [profileName, setProfileName] = useState('');
  const [stats, setStats] = useState({ skills: 0, education: 0, internships: 0, certs: 0, projects: 0 });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resumeScore = (() => {
    let score = 0;
    if (profileName) score += 15;
    if (stats.skills > 0) score += 20;
    if (stats.education > 0) score += 20;
    if (stats.internships > 0) score += 20;
    if (stats.certs > 0) score += 15;
    if (stats.projects > 0) score += 10;
    return Math.min(100, score);
  })();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: profile } = await getProfile();
    if (profile) setProfileName(profile.name || 'Resume');

    const [skillsRes, eduRes, internRes, certRes, projRes] = await Promise.all([
      getSkills(), getEducation(), getInternships(), getCertifications(),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
    ]);
    setStats({
      skills: skillsRes.data?.length || 0,
      education: eduRes.data?.length || 0,
      internships: internRes.data?.length || 0,
      certs: certRes.data?.length || 0,
      projects: projRes.count || 0,
    });

    const { data: settings } = await supabase.from('site_settings').select('updated_at').limit(1).maybeSingle();
    if (settings?.updated_at) setLastUpdated(new Date(settings.updated_at).toLocaleString());
    setLoading(false);
  }

  const { status: saveStatus } = useAutoSave(async () => {}, []);

  if (loading) return <div className="animate-pulse h-40 bg-gray-800 rounded-xl" />;

  const scoreColor = resumeScore >= 80 ? 'text-emerald-400' : resumeScore >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreLabel = resumeScore >= 80 ? 'Excellent' : resumeScore >= 50 ? 'Needs work' : 'Incomplete';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Resume Studio</h1>
          <p className="text-sm text-gray-400 mt-0.5">ATS-optimized resume — auto-generated from portfolio data</p>
        </div>
        <div className="flex items-center gap-3">
          <AutoSaveBar status={saveStatus} />
          <a href="/resume" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Download
          </a>
          <a href="/resume" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><FileText className="w-4.5 h-4.5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Resume</p>
              <p className="text-sm font-semibold text-white">{profileName || 'N/A'}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600">Auto-generated from CMS</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/10"><BarChart3 className="w-4.5 h-4.5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500">ATS Score</p>
              <p className={`text-sm font-semibold ${scoreColor}`}>{resumeScore}/100 · {scoreLabel}</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${resumeScore >= 80 ? 'bg-emerald-500' : resumeScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${resumeScore}%` }} />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Clock className="w-4.5 h-4.5 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm font-semibold text-white">{lastUpdated || 'Live'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <CheckCircle className="w-3 h-3" /> Auto-sync enabled
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center"><TrendingUp className="w-4.5 h-4.5 text-purple-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Coverage</p>
              <p className="text-sm font-semibold text-white">{[stats.skills, stats.education, stats.internships, stats.certs, stats.projects].filter(Boolean).length}/5</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[stats.skills > 0, stats.education > 0, stats.internships > 0, stats.certs > 0, stats.projects > 0].map((filled, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${filled ? 'bg-blue-500' : 'bg-gray-800'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Live Resume Preview</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live · Auto-updates from portfolio data
          </div>
        </div>
        <div className="p-5">
          <div className="aspect-[1/1.4] max-w-3xl mx-auto bg-white rounded-xl border border-gray-700 shadow-sm overflow-hidden" style={{ minHeight: '400px' }}>
            <iframe key={lastUpdated} src="/resume" title="Resume Preview" className="w-full h-full" style={{ minHeight: '500px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
