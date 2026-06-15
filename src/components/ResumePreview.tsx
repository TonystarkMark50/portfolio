import { ResumeData } from '../lib/loaders';

export type ResumeTemplate = 'classic' | 'modern' | 'corporate';

interface ResumePreviewProps {
  data: ResumeData;
  summary: string;
  template: ResumeTemplate;
  sections: {
    education: boolean;
    internship: boolean;
    projects: boolean;
    skills: boolean;
    certifications: boolean;
    languages: boolean;
  };
}

const STYLES: Record<ResumeTemplate, string> = {
  classic: `
    .rp{background:#fff;color:#000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:36px 44px;font-size:13px;line-height:1.35;max-width:800px;margin:0 auto}
    .rp-hdr{margin-bottom:14px;border-bottom:1px solid #000;padding-bottom:8px}
    .rp-name{font-size:24px;font-weight:700;letter-spacing:.3px}
    .rp-title{font-size:13px;margin-bottom:3px}
    .rp-cr{font-size:12px;color:#333;display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;align-items:center}
    .rp-sec{margin-bottom:10px}
    .rp-st{font-size:14px;font-weight:700;letter-spacing:.5px;border-bottom:.5px solid #000;padding-bottom:1px;margin-bottom:5px;text-transform:uppercase}
    .rp-p{font-size:13px;line-height:1.4;margin-bottom:3px}
    .rp-eb{margin-bottom:6px}
    .rp-el1{font-size:13px;font-weight:700}
    .rp-el2{font-size:13px}
    .rp-el3{font-size:13px;color:#333}
    .rp-ih{font-size:13px;font-weight:700;margin-bottom:1px}
    .rp-is{font-size:13px;color:#333;margin-bottom:3px}
    .rp-bi{display:flex;margin-bottom:1.5px;margin-left:12px}
    .rp-bp{width:12px;flex-shrink:0}
    .rp-bt{flex:1}
    .rp-pn{font-size:13px;font-weight:700;margin-bottom:1px}
    .rp-pm{font-size:12px;color:#333;margin-bottom:2px}
    .rp-sb{margin-bottom:4px}
    .rp-sct{font-size:13px;font-weight:700;margin-bottom:1px}
    .rp-sl{margin-left:12px}
    .rp-lt{}
  `,
  modern: `
    .rp{background:#fff;color:#1a1a2e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:32px 40px;font-size:13px;line-height:1.45;max-width:800px;margin:0 auto}
    .rp-hdr{margin-bottom:16px;padding-bottom:10px}
    .rp-name{font-size:26px;font-weight:700;letter-spacing:.5px;color:#1a1a2e;margin-bottom:2px}
    .rp-title{font-size:13px;color:#4a4a6a;margin-bottom:4px;font-style:italic}
    .rp-cr{font-size:12px;color:#4a4a6a;display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;align-items:center}
    .rp-sec{margin-bottom:12px}
    .rp-st{font-size:14px;font-weight:700;letter-spacing:1px;color:#1a1a2e;margin-bottom:6px;text-transform:uppercase}
    .rp-p{font-size:13px;line-height:1.5;margin-bottom:3px;color:#333344}
    .rp-eb{margin-bottom:7px;padding-left:8px;border-left:2px solid #4a4a6a}
    .rp-el1{font-size:13px;font-weight:700;color:#1a1a2e}
    .rp-el2{font-size:13px;color:#333344}
    .rp-el3{font-size:12px;color:#4a4a6a}
    .rp-ih{font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:1px}
    .rp-is{font-size:12px;color:#4a4a6a;margin-bottom:3px;font-style:italic}
    .rp-bi{display:flex;margin-bottom:2px;margin-left:8px}
    .rp-bp{width:10px;flex-shrink:0;color:#4a4a6a}
    .rp-bt{flex:1;color:#333344}
    .rp-pn{font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:1px}
    .rp-pm{font-size:12px;color:#4a4a6a;margin-bottom:2px;font-style:italic}
    .rp-sb{margin-bottom:5px}
    .rp-sct{font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:1px}
    .rp-sl{margin-left:12px;color:#333344}
    .rp-lt{color:#333344}
  `,
  corporate: `
    .rp{background:#fff;color:#1e293b;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:40px 48px;font-size:13px;line-height:1.4;max-width:800px;margin:0 auto}
    .rp-hdr{background:#1e293b;padding:16px 48px;margin:-40px -48px 16px;color:#fff}
    .rp-name{font-size:26px;font-weight:700;letter-spacing:.5px;color:#fff;margin-bottom:2px}
    .rp-title{font-size:13px;color:#94a3b8;margin-bottom:4px}
    .rp-cr{font-size:12px;color:#cbd5e1;display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;align-items:center}
    .rp-sec{margin-bottom:10px}
    .rp-st{font-size:13px;font-weight:700;letter-spacing:.5px;color:#1e293b;margin-bottom:4px;text-transform:uppercase;border-bottom:.5px solid #cbd5e1;padding-bottom:1px}
    .rp-p{font-size:13px;line-height:1.4;margin-bottom:3px;color:#475569}
    .rp-eb{margin-bottom:6px}
    .rp-el1{font-size:13px;font-weight:700;color:#1e293b}
    .rp-el2{font-size:13px;color:#475569}
    .rp-el3{font-size:12px;color:#64748b}
    .rp-ih{font-size:13px;font-weight:700;color:#1e293b;margin-bottom:1px}
    .rp-is{font-size:12px;color:#64748b;margin-bottom:3px}
    .rp-bi{display:flex;margin-bottom:1.5px;margin-left:12px}
    .rp-bp{width:10px;flex-shrink:0;color:#475569}
    .rp-bt{flex:1;color:#475569}
    .rp-pn{font-size:13px;font-weight:700;color:#1e293b;margin-bottom:1px}
    .rp-pm{font-size:12px;color:#64748b;margin-bottom:2px}
    .rp-sb{margin-bottom:4px}
    .rp-sct{font-size:13px;font-weight:700;color:#1e293b;margin-bottom:1px}
    .rp-sl{margin-left:12px;color:#475569}
    .rp-lt{color:#475569}
  `,
};

export default function ResumePreview({ data, summary, template, sections }: ResumePreviewProps) {
  const showCerts = data.hasRealCertifications;
  const p = data.personalInfo;
  const separator = <span style={{ margin: '0 4px' }}>|</span>;

  return (
    <>
      <style>{STYLES[template]}</style>
      <div className="rp">
        <div className="rp-hdr">
          <div className="rp-name">{p.name}</div>
          <div className="rp-title">{p.title}</div>
          <div className="rp-cr">
            {p.location && <span>{p.location}</span>}
            {p.email && <>{separator}<span>{p.email}</span></>}
            {p.linkedin && <>{separator}<span>{p.linkedin}</span></>}
            {p.github && <>{separator}<span>{p.github}</span></>}
          </div>
        </div>

        {(summary || data.professionalSummary?.[0]) && (
          <div className="rp-sec">
            <div className="rp-st">Professional Summary</div>
            <div className="rp-p">{summary || data.professionalSummary[0]}</div>
          </div>
        )}

        {sections.education && data.education.length > 0 && (
          <div className="rp-sec">
            <div className="rp-st">Education</div>
            {data.education.map(edu => (
              <div key={edu.id} className="rp-eb">
                <div className="rp-el1">{edu.degree}{edu.field ? ` \u2014 ${edu.field}` : ''}</div>
                <div className="rp-el2">{edu.institution}</div>
                <div className="rp-el3">{edu.period}{edu.gpa ? ` | CGPA: ${edu.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {sections.internship && data.internship && (
          <div className="rp-sec">
            <div className="rp-st">Internship Experience</div>
            <div className="rp-ih">{data.internship.role}</div>
            <div className="rp-is">{data.internship.organization}{data.internship.duration ? ` | ${data.internship.duration}` : ''}</div>
            {data.internship.responsibilities.map((item, i) => (
              <div key={i} className="rp-bi">
                <div className="rp-bp">{'\u2022'}</div>
                <div className="rp-bt">{item}</div>
              </div>
            ))}
          </div>
        )}

        {sections.projects && data.projects.length > 0 && (
          <div className="rp-sec">
            <div className="rp-st">Academic Projects</div>
            {data.projects.map(proj => (
              <div key={proj.name}>
                <div className="rp-pn">{proj.name}</div>
                <div className="rp-pm">{proj.type}{proj.completedDate ? ` | Completed: ${proj.completedDate}` : ''}</div>
                {proj.highlights.map((item, i) => (
                  <div key={i} className="rp-bi">
                    <div className="rp-bp">{'\u2022'}</div>
                    <div className="rp-bt">{item}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {sections.skills && data.skills.length > 0 && (
          <div className="rp-sec">
            <div className="rp-st">Technical Skills</div>
            {data.skills.map(cat => (
              <div key={cat.title} className="rp-sb">
                <div className="rp-sct">{cat.title}</div>
                <div className="rp-sl">{cat.skills.join(', ')}</div>
              </div>
            ))}
          </div>
        )}

        {sections.certifications && showCerts && data.certifications.length > 0 && (
          <div className="rp-sec">
            <div className="rp-st">Certifications</div>
            {data.certifications.map(cert => (
              <div key={cert.id} className="rp-eb">
                <div className="rp-el1">{cert.title} \u2014 {cert.organization}</div>
                <div className="rp-el3">{cert.issueDate}{cert.credentialId ? ` | ID: ${cert.credentialId}` : ''}</div>
                {cert.description && <div className="rp-p">{cert.description}</div>}
                {cert.skills && cert.skills.length > 0 && (
                  <div className="rp-sl" style={{ marginTop: 2 }}>Skills: {cert.skills.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {sections.languages && data.languages.length > 0 && (
          <div className="rp-sec">
            <div className="rp-st">Languages</div>
            <div className="rp-lt">{data.languages.join(', ')}</div>
          </div>
        )}
      </div>
    </>
  );
}
