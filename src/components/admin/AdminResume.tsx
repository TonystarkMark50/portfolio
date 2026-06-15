import { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Clock, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile, getSkills, getEducation, getInternships, getCertifications } from '../../lib/api';

export default function AdminResume() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [atsStatus, setAtsStatus] = useState<'good' | 'warning' | 'unknown'>('unknown');
  const [regenerating, setRegenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: profile } = await getProfile();
    if (profile) {
      setProfileName(profile.name || 'Resume');
      setDownloadUrl(profile.resume_url || null);
    }

    const { data: settings } = await supabase.from('site_settings').select('updated_at').limit(1).maybeSingle();
    if (settings?.updated_at) {
      setLastUpdated(new Date(settings.updated_at).toLocaleString());
    }

    const { data: skills } = await getSkills();
    const { data: education } = await getEducation();
    const { data: internships } = await getInternships();
    const { data: certs } = await getCertifications();

    if (skills && skills.length > 0 && education && education.length > 0) {
      setAtsStatus('good');
    } else if (skills || education) {
      setAtsStatus('warning');
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const response = await fetch(`${window.location.origin}/api/resume/regenerate`, {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setLastUpdated(new Date().toLocaleString());
        setAtsStatus('good');
      }
    } catch {
      window.open('/resume', '_blank');
    }
    setRegenerating(false);
  }

  function handleDownload() {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      window.open('/resume', '_blank');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your ATS-compatible resume</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
            <Download className="w-4 h-4" /> Download
          </button>
          <button onClick={handleRegenerate} disabled={regenerating} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resume</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{profileName || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center text-success-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{lastUpdated || 'Not yet generated'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              atsStatus === 'good' ? 'bg-success-100 dark:bg-success-900/30 text-success-500' :
              atsStatus === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-500' :
              'bg-gray-100 dark:bg-dark-700 text-gray-400'
            }`}>
              {atsStatus === 'good' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm text-gray-500">ATS Compatibility</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {atsStatus === 'good' ? 'Ready' : atsStatus === 'warning' ? 'Needs Review' : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
          <p className="text-sm text-gray-500 mt-1">Your resume is auto-generated from live portfolio data</p>
        </div>
        <div className="p-6">
          <div className="aspect-[1/1.4] max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <iframe
              src="/resume"
              title="Resume Preview"
              className="w-full h-full"
              style={{ minHeight: '600px' }}
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <ExternalLink className="w-4 h-4" />
            <span>Resume is generated from your profile, skills, education, internships, and certifications data.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
