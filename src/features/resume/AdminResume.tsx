import { useRef, useState, useMemo, useEffect } from 'react';
import { FileText, BarChart3, Sparkles, TrendingUp, Eye } from 'lucide-react';
import ResumePreview from '../../components/ResumePreview';
import { useResumeData } from './hooks/useResumeData';
import { useResumeExport } from './hooks/useResumeExport';
import ResumeEditor from './components/ResumeEditor';
import ResumeToolbar from './components/ResumeToolbar';

export default function AdminResume() {
  const {
    loading, saveStatus, activeSection, setActiveSection,
    profile, summary, education, internships, projects, skills, certifications,
    template, setTemplate, sections, setSections,
    updateProfile, updateSummary,
    addEducation, updateEducation, deleteEducation,
    addInternship, updateInternship, deleteInternship,
    addProject, updateProject, deleteProject,
    addSkillCategory, updateSkillCategory, deleteSkillCategory,
    addCertification, updateCertification, deleteCertification,
    load, resumeData,
    atsScore, missingKeywords, scoreColor, scoreBg, scoreLabel,
    scheduleTemplateSave,
  } = useResumeData();

  const { downloadPdf, downloadDocx, openFullPreview } = useResumeExport();

  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight;
      setPageCount(Math.max(1, Math.ceil(h / 950)));
    }
  }, [zoom]);

  function scrollToTop() {
    previewRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleDownloadPdf = () => {
    if (resumeData) downloadPdf(resumeData, template, profile.name);
  };
  const handleDownloadDocx = () => {
    if (resumeData) downloadDocx(resumeData, summary, sections);
  };
  const handleOpenFullPreview = () => {
    if (resumeData) openFullPreview(resumeData, template);
  };

  if (loading) return <div className="animate-pulse space-y-6"><div className="h-32 bg-gray-800 rounded-2xl" /><div className="h-96 bg-gray-800 rounded-2xl" /></div>;

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Resume Studio</h1>
          <p className="text-xs text-gray-500 mt-0.5">Edit resume content directly — live preview updates automatically</p>
        </div>
        <ResumeToolbar saveStatus={saveStatus} onDownloadDocx={handleDownloadDocx} onDownloadPdf={handleDownloadPdf} onRefresh={load} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><FileText className="w-4.5 h-4.5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Resume</p>
              <p className="text-sm font-semibold text-white">{profile.name || 'N/A'}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600">{education.length} edu · {projects.length} projects · {skills.length} skills</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><BarChart3 className="w-4.5 h-4.5 text-blue-400" /></div>
            <div>
              <p className="text-xs text-gray-500">ATS Score</p>
              <p className={`text-sm font-semibold ${scoreColor}`}>{atsScore}/100 · {scoreLabel}</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${scoreBg}`} style={{ width: `${atsScore}%` }} />
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Sparkles className="w-4.5 h-4.5 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Strength</p>
              <p className="text-sm font-semibold text-white">{atsScore >= 80 ? 'Strong' : atsScore >= 50 ? 'Moderate' : 'Weak'}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-600">{5 - missingKeywords.length}/10 keywords found</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center"><TrendingUp className="w-4.5 h-4.5 text-purple-400" /></div>
            <div>
              <p className="text-xs text-gray-500">Suggestions</p>
              <p className="text-sm font-semibold text-white">{missingKeywords.length}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[skills.length > 0, education.length > 0, internships.length > 0, certifications.length > 0, projects.length > 0].map((filled, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${filled ? 'bg-blue-500' : 'bg-gray-800'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <ResumeEditor
          profile={profile} summary={summary}
          education={education} internships={internships} projects={projects}
          skills={skills} certifications={certifications}
          template={template} sections={sections}
          activeSection={activeSection} onSetActiveSection={setActiveSection}
          onUpdateProfile={updateProfile} onUpdateSummary={updateSummary}
          onAddEducation={addEducation} onUpdateEducation={updateEducation} onDeleteEducation={deleteEducation}
          onAddInternship={addInternship} onUpdateInternship={updateInternship} onDeleteInternship={deleteInternship}
          onAddProject={addProject} onUpdateProject={updateProject} onDeleteProject={deleteProject}
          onAddSkillCategory={addSkillCategory} onUpdateSkillCategory={updateSkillCategory} onDeleteSkillCategory={deleteSkillCategory}
          onAddCertification={addCertification} onUpdateCertification={updateCertification} onDeleteCertification={deleteCertification}
          onSetTemplate={setTemplate} onSetSections={setSections} onScheduleTemplateSave={scheduleTemplateSave}
        />

        <div className="xl:col-span-3 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-gray-400 ml-1">
                Live Preview · <span className="text-gray-200 font-medium">{template.charAt(0).toUpperCase() + template.slice(1)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="px-1.5 py-0.5 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="Zoom out">{'\u2212'}</button>
              <span className="text-[10px] text-gray-400 w-8 text-center tabular-nums">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(150, zoom + 25))} className="px-1.5 py-0.5 rounded text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="Zoom in">+</button>
              <span className="text-gray-600 text-[10px]">|</span>
              <span className="text-[10px] text-gray-400 tabular-nums">{pageCount} pg</span>
              <span className="text-gray-600 text-[10px]">|</span>
              <button onClick={scrollToTop} className="text-[10px] text-gray-400 hover:text-white transition-colors" title="Scroll to top">Top</button>
              <button onClick={handleOpenFullPreview} className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors" title="Open full preview">Open</button>
              <button onClick={handleDownloadPdf} className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors" title="Download PDF">PDF</button>
            </div>
          </div>
          <div ref={previewRef} className="flex-1 bg-gray-100 p-6 overflow-y-auto overflow-x-hidden scrollbar-thin" style={{ maxHeight: 'calc(100vh - 300px)', minHeight: 500 }}>
            {resumeData ? (
              <div className="flex justify-center">
                <div ref={contentRef} className="w-full max-w-[800px] shadow-xl rounded-lg" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                  <ResumePreview data={resumeData} summary={summary} template={template} sections={sections} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-3 min-h-[400px]">
                <FileText className="w-12 h-12 text-gray-600" />
                <p>No resume data yet. Edit fields on the left to build your resume.</p>
              </div>
            )}
          </div>
          <style>{`
            .scrollbar-thin::-webkit-scrollbar { width: 6px; }
            .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
            .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #64748b; }
            .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #475569 transparent; }
          `}</style>
        </div>
      </div>
    </div>
  );
}
