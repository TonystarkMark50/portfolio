import { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Clock, CheckCircle, AlertTriangle, ExternalLink, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile, getSkills, getEducation, getInternships, getCertifications } from '../../lib/api';

export default function AdminResume() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [stats, setStats] = useState({ skills: 0, education: 0, internships: 0, certs: 0, projects: 0 });

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
    if (profile) { setProfileName(profile.name || 'Resume'); }

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
  }

  const scoreColor = resumeScore >= 80 ? 'text-success-500' : resumeScore >= 50 ? 'text-warning-500' : 'text-error-500';
  const scoreBg = resumeScore >= 80 ? 'bg-success-50 dark:bg-success-900/20' : resumeScore >= 50 ? 'bg-warning-50 dark:bg-warning-900/20' : 'bg-error-50 dark:bg-error-900/20';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Studio</h2>
          <p className="text-sm text-gray-500 mt-1">ATS-optimized resume generated from portfolio data</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.open('/resume', '_blank')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Download
          </button>
          <button onClick={() => { window.open('/resume', '_blank'); setLastUpdated(new Date().toLocaleString()); }} disabled={regenerating} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Resume</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{profileName || 'N/A'}</p>
            </div>
          </div>
          <div className="text-[11px] text-gray-400">Auto-generated from CMS data</div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${scoreBg} flex items-center justify-center ${scoreColor}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Resume Score</p>
              <p className={`text-sm font-semibold ${scoreColor}`}>{resumeScore}/100</p>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-dark-700 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${resumeScore >= 80 ? 'bg-success-500' : resumeScore >= 50 ? 'bg-warning-500' : 'bg-error-500'}`} style={{ width: `${resumeScore}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center text-success-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{lastUpdated || 'Live'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-success-500">
            <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
            Auto-sync enabled
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Content Coverage</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {[stats.skills, stats.education, stats.internships, stats.certs, stats.projects].filter(Boolean).length}/5 sections
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {['skills', 'edu', 'intern', 'certs', 'proj'].map((key, i) => {
              const filled = [stats.skills, stats.education, stats.internships, stats.certs, stats.projects][i] > 0;
              return <div key={key} className={`flex-1 h-1 rounded-full ${filled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-600'}`} />;
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Resume Preview</h3>
            <p className="text-sm text-gray-500 mt-0.5">Your resume auto-updates when portfolio data changes</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
            Live
          </div>
        </div>
        <div className="p-6">
          <div className="aspect-[1/1.4] max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <iframe src="/resume" title="Resume Preview" className="w-full h-full" style={{ minHeight: '600px' }} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <ExternalLink className="w-4 h-4" />
            <span>Powered by portfolio data — profile, skills, education, internships, certifications, and projects</span>
          </div>
        </div>
      </div>
    </div>
  );
}
