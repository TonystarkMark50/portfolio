import { useState, useEffect, useRef } from 'react';
import {
  User, Edit3, Mail, Phone, MapPin, Linkedin, Github, FileText, BookOpen, Briefcase,
  Code2, Layers, Award, Eye, ListChecks, Plus, X, ChevronDown, ChevronUp, GripVertical, Trash2
} from 'lucide-react';
import type { EditableProfile, EditableSection, ResumeSections } from '../hooks/useResumeData';
import type { Education, Internship, Project, Skill, Certification } from '../../../lib/api';
import type { ResumeTemplate } from '../../../components/ATSResume';
import { TEMPLATE_OPTIONS } from '../../../services/resume/resumeTransformers';

interface ResumeEditorProps {
  profile: EditableProfile;
  summary: string;
  education: Education[];
  internships: Internship[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  template: ResumeTemplate;
  sections: ResumeSections;
  activeSection: EditableSection | null;
  onSetActiveSection: (s: EditableSection | null) => void;
  onUpdateProfile: (key: keyof EditableProfile, val: string) => void;
  onUpdateSummary: (val: string) => void;
  onAddEducation: () => void;
  onUpdateEducation: (id: string, key: string, val: string) => void;
  onDeleteEducation: (id: string) => void;
  onAddInternship: () => void;
  onUpdateInternship: (id: string, key: string, val: any) => void;
  onDeleteInternship: (id: string) => void;
  onAddProject: () => void;
  onUpdateProject: (id: string, key: string, val: any) => void;
  onDeleteProject: (id: string) => void;
  onAddSkillCategory: () => void;
  onUpdateSkillCategory: (id: string, key: string, val: any) => void;
  onDeleteSkillCategory: (id: string) => void;
  onAddCertification: () => void;
  onUpdateCertification: (id: string, key: string, val: any) => void;
  onDeleteCertification: (id: string) => void;
  onSetTemplate: (t: ResumeTemplate) => void;
  onSetSections: (s: ResumeSections) => void;
  onScheduleTemplateSave: () => void;
}

function InlineField({ value, onSave, placeholder, multiline, className }: {
  value: string; onSave: (v: string) => void; placeholder?: string; multiline?: boolean; className?: string;
}) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setVal(value); }, [value]);
  useEffect(() => { if (edit) ref.current?.focus(); }, [edit]);

  function commit() {
    setEdit(false);
    if (val !== value) onSave(val);
  }

  if (!edit) {
    return (
      <div onClick={() => setEdit(true)} className={`cursor-text hover:bg-gray-700/50 rounded px-1.5 -ml-1.5 transition-colors ${className || ''}`}>
        {value || <span className="text-gray-600 italic">{placeholder || 'Click to edit...'}</span>}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Escape') { setVal(value); setEdit(false); } }}
        className="w-full px-2 py-1 rounded bg-gray-700 border border-blue-500 text-sm text-white outline-none resize-none"
        rows={3}
      />
    );
  }

  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value); setEdit(false); } }}
      className="w-full px-2 py-1 rounded bg-gray-700 border border-blue-500 text-sm text-white outline-none"
    />
  );
}

function ArrayField({ items, onAdd, onRemove, onEdit, placeholder }: {
  items: string[]; onAdd: () => void; onRemove: (i: number) => void; onEdit: (i: number, v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 group">
          <span className="text-gray-500 text-xs">•</span>
          <input
            value={item}
            onChange={e => onEdit(i, e.target.value)}
            className="flex-1 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-white outline-none focus:border-blue-500 transition-colors"
            placeholder={placeholder}
          />
          <button onClick={() => onRemove(i)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/20 text-red-400">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={onAdd} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-400 transition-colors">
        <Plus className="w-3 h-3" /> Add item
      </button>
    </div>
  );
}

function EditableCard({ children, onDelete }: { children: React.ReactNode; onDelete?: () => void }) {
  return (
    <div className="relative bg-gray-800/50 rounded-lg border border-gray-700/50 p-3 group">
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-gray-600 mt-0.5 cursor-grab flex-shrink-0" />
        <div className="flex-1 min-w-0">{children}</div>
        {onDelete && (
          <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-red-400 flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SectionPanel({ section, label, icon: Icon, isOpen, onToggle, children }: {
  section: EditableSection; label: string; icon: React.ElementType;
  isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors">
        <span className="flex items-center gap-2 text-sm font-medium text-white">
          <Icon className="w-4 h-4 text-blue-400" />
          {label}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {isOpen && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

export default function ResumeEditor(props: ResumeEditorProps) {
  const {
    profile, summary, education, internships, projects, skills, certifications,
    template, sections, activeSection, onSetActiveSection,
    onUpdateProfile, onUpdateSummary,
    onAddEducation, onUpdateEducation, onDeleteEducation,
    onAddInternship, onUpdateInternship, onDeleteInternship,
    onAddProject, onUpdateProject, onDeleteProject,
    onAddSkillCategory, onUpdateSkillCategory, onDeleteSkillCategory,
    onAddCertification, onUpdateCertification, onDeleteCertification,
    onSetTemplate, onSetSections, onScheduleTemplateSave,
  } = props;

  return (
    <div className="xl:col-span-2 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
      <SectionPanel section="personal" label="Personal Information" icon={User}
        isOpen={activeSection === 'personal'} onToggle={() => onSetActiveSection(activeSection === 'personal' ? null : 'personal')}>
        <div className="space-y-2">
          {[
            { key: 'name' as const, label: 'Name', icon: User },
            { key: 'title' as const, label: 'Title', icon: Edit3 },
            { key: 'email' as const, label: 'Email', icon: Mail },
            { key: 'phone' as const, label: 'Phone', icon: Phone },
            { key: 'location' as const, label: 'Location', icon: MapPin },
            { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
            { key: 'github' as const, label: 'GitHub', icon: Github },
          ].map(field => (
            <div key={field.key}>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">{field.label}</label>
              <InlineField value={profile[field.key]} onSave={v => onUpdateProfile(field.key, v)} placeholder={`Enter ${field.label.toLowerCase()}...`} />
            </div>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel section="summary" label="Professional Summary" icon={FileText}
        isOpen={activeSection === 'summary'} onToggle={() => onSetActiveSection(activeSection === 'summary' ? null : 'summary')}>
        <textarea
          value={summary}
          onChange={e => onUpdateSummary(e.target.value)}
          placeholder="Write a professional summary for your resume..."
          rows={5}
          className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
        <p className="text-[10px] text-gray-600">Auto-saves after 1 second of inactivity</p>
      </SectionPanel>

      <SectionPanel section="education" label="Education" icon={BookOpen}
        isOpen={activeSection === 'education'} onToggle={() => onSetActiveSection(activeSection === 'education' ? null : 'education')}>
        <div className="space-y-2">
          {education.map(edu => (
            <EditableCard key={edu.id} onDelete={() => onDeleteEducation(edu.id)}>
              <InlineField value={edu.degree} onSave={v => onUpdateEducation(edu.id, 'degree', v)} placeholder="Degree" className="text-sm font-medium" />
              <InlineField value={edu.institution} onSave={v => onUpdateEducation(edu.id, 'institution', v)} placeholder="Institution" className="text-xs text-gray-400" />
              <div className="flex gap-2 mt-1">
                <InlineField value={edu.field || ''} onSave={v => onUpdateEducation(edu.id, 'field', v)} placeholder="Field" className="text-[10px] text-gray-500" />
                <InlineField value={edu.period || ''} onSave={v => onUpdateEducation(edu.id, 'period', v)} placeholder="Period" className="text-[10px] text-gray-500" />
                <InlineField value={edu.gpa || ''} onSave={v => onUpdateEducation(edu.id, 'gpa', v)} placeholder="GPA" className="text-[10px] text-gray-500" />
              </div>
            </EditableCard>
          ))}
          <button onClick={onAddEducation} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
            + Add Education
          </button>
        </div>
      </SectionPanel>

      <SectionPanel section="internship" label="Internships" icon={Briefcase}
        isOpen={activeSection === 'internship'} onToggle={() => onSetActiveSection(activeSection === 'internship' ? null : 'internship')}>
        <div className="space-y-2">
          {internships.map(intern => (
            <EditableCard key={intern.id} onDelete={() => onDeleteInternship(intern.id)}>
              <InlineField value={intern.role} onSave={v => onUpdateInternship(intern.id, 'role', v)} placeholder="Role" className="text-sm font-medium" />
              <InlineField value={intern.organization} onSave={v => onUpdateInternship(intern.id, 'organization', v)} placeholder="Organization" className="text-xs text-gray-400" />
              <InlineField value={intern.duration || ''} onSave={v => onUpdateInternship(intern.id, 'duration', v)} placeholder="Duration" className="text-[10px] text-gray-500" />
              <div className="mt-2">
                <p className="text-[10px] text-gray-600 mb-1">Responsibilities</p>
                <ArrayField
                  items={intern.responsibilities}
                  onAdd={() => onUpdateInternship(intern.id, 'responsibilities', [...intern.responsibilities, ''])}
                  onRemove={i => onUpdateInternship(intern.id, 'responsibilities', intern.responsibilities.filter((_: string, idx: number) => idx !== i))}
                  onEdit={(i, v) => {
                    const next = [...intern.responsibilities];
                    next[i] = v;
                    onUpdateInternship(intern.id, 'responsibilities', next);
                  }}
                  placeholder="Add responsibility..."
                />
              </div>
            </EditableCard>
          ))}
          <button onClick={onAddInternship} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
            + Add Internship
          </button>
        </div>
      </SectionPanel>

      <SectionPanel section="projects" label="Projects" icon={Code2}
        isOpen={activeSection === 'projects'} onToggle={() => onSetActiveSection(activeSection === 'projects' ? null : 'projects')}>
        <div className="space-y-2">
          {projects.map(proj => (
            <EditableCard key={proj.id} onDelete={() => onDeleteProject(proj.id)}>
              <InlineField value={proj.name} onSave={v => onUpdateProject(proj.id, 'name', v)} placeholder="Project name" className="text-sm font-medium" />
              <InlineField value={proj.type} onSave={v => onUpdateProject(proj.id, 'type', v)} placeholder="Type" className="text-xs text-gray-400" />
              <InlineField value={proj.completed_date || ''} onSave={v => onUpdateProject(proj.id, 'completed_date', v)} placeholder="Completed date" className="text-[10px] text-gray-500" />
              <div className="mt-2">
                <p className="text-[10px] text-gray-600 mb-1">Highlights</p>
                <ArrayField
                  items={proj.highlights}
                  onAdd={() => onUpdateProject(proj.id, 'highlights', [...proj.highlights, ''])}
                  onRemove={i => onUpdateProject(proj.id, 'highlights', proj.highlights.filter((_: string, idx: number) => idx !== i))}
                  onEdit={(i, v) => {
                    const next = [...proj.highlights];
                    next[i] = v;
                    onUpdateProject(proj.id, 'highlights', next);
                  }}
                  placeholder="Add highlight..."
                />
              </div>
            </EditableCard>
          ))}
          <button onClick={onAddProject} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
            + Add Project
          </button>
        </div>
      </SectionPanel>

      <SectionPanel section="skills" label="Skills" icon={Layers}
        isOpen={activeSection === 'skills'} onToggle={() => onSetActiveSection(activeSection === 'skills' ? null : 'skills')}>
        <div className="space-y-2">
          {skills.map(skill => (
            <EditableCard key={skill.id} onDelete={() => onDeleteSkillCategory(skill.id)}>
              <InlineField value={skill.category} onSave={v => onUpdateSkillCategory(skill.id, 'category', v)} placeholder="Category name" className="text-sm font-medium" />
              <div className="mt-1.5">
                <ArrayField
                  items={skill.skills}
                  onAdd={() => onUpdateSkillCategory(skill.id, 'skills', [...skill.skills, ''])}
                  onRemove={i => onUpdateSkillCategory(skill.id, 'skills', skill.skills.filter((_: string, idx: number) => idx !== i))}
                  onEdit={(i, v) => {
                    const next = [...skill.skills];
                    next[i] = v;
                    onUpdateSkillCategory(skill.id, 'skills', next);
                  }}
                  placeholder="Add skill..."
                />
              </div>
            </EditableCard>
          ))}
          <button onClick={onAddSkillCategory} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
            + Add Skill Category
          </button>
        </div>
      </SectionPanel>

      <SectionPanel section="certifications" label="Certifications" icon={Award}
        isOpen={activeSection === 'certifications'} onToggle={() => onSetActiveSection(activeSection === 'certifications' ? null : 'certifications')}>
        <div className="space-y-2">
          {certifications.map(cert => (
            <EditableCard key={cert.id} onDelete={() => onDeleteCertification(cert.id)}>
              <InlineField value={cert.title} onSave={v => onUpdateCertification(cert.id, 'title', v)} placeholder="Certification title" className="text-sm font-medium" />
              <InlineField value={cert.organization} onSave={v => onUpdateCertification(cert.id, 'organization', v)} placeholder="Organization" className="text-xs text-gray-400" />
              <div className="flex gap-2 mt-1">
                <InlineField value={cert.issue_date || ''} onSave={v => onUpdateCertification(cert.id, 'issue_date', v)} placeholder="Issue date" className="text-[10px] text-gray-500" />
                <InlineField value={cert.credential_id || ''} onSave={v => onUpdateCertification(cert.id, 'credential_id', v)} placeholder="Credential ID" className="text-[10px] text-gray-500" />
              </div>
            </EditableCard>
          ))}
          <button onClick={onAddCertification} className="w-full py-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
            + Add Certification
          </button>
        </div>
      </SectionPanel>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Resume Template</h3>
          </div>
        </div>
        <div className="space-y-1.5">
          {TEMPLATE_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => { onSetTemplate(opt.value); onScheduleTemplateSave(); }}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${template === opt.value ? 'bg-blue-500/10 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${template === opt.value ? 'text-blue-400' : 'text-white'}`}>{opt.label}</span>
                {template === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </div>
              <p className="text-[9px] text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Section Visibility</h3>
          </div>
        </div>
        <div className="space-y-1.5">
          {(Object.keys({ education: true, internship: true, projects: true, skills: true, certifications: true, languages: true }) as (keyof ResumeSections)[]).map(key => (
            <label key={key} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
              <span className="text-xs text-gray-300 capitalize">{key}</span>
              <div className={`relative w-8 h-4 rounded-full transition-colors ${sections[key] ? 'bg-blue-500' : 'bg-gray-700'}`}
                onClick={() => { onSetSections({ ...sections, [key]: !sections[key] }); onScheduleTemplateSave(); }}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${sections[key] ? 'translate-x-4' : ''}`} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
