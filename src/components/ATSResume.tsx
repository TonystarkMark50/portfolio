import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { ResumeData } from '../lib/loaders';

type ResumeTemplate = 'classic' | 'modern' | 'corporate';

const classicStyles = StyleSheet.create({
  page: { padding: '36 44', fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.35, color: '#000000' },
  header: { marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#000000', borderBottomStyle: 'solid', paddingBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 2, letterSpacing: 0.3 },
  title: { fontSize: 10, color: '#000000', marginBottom: 3 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', fontSize: 9, color: '#333333', marginTop: 3, alignItems: 'center' },
  contactItemContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  contactIcon: { width: 10, height: 10, marginRight: 4 },
  contactItem: { fontSize: 9, color: '#333333' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, borderBottomWidth: 0.5, borderBottomColor: '#000000', borderBottomStyle: 'solid', paddingBottom: 1, marginBottom: 5, textTransform: 'uppercase' as const },
  paragraph: { fontSize: 10, lineHeight: 1.4, marginBottom: 3, color: '#000000' },
  eduBlock: { marginBottom: 6 },
  eduLine1: { fontSize: 10, fontWeight: 'bold', color: '#000000' },
  eduLine2: { fontSize: 10, color: '#000000' },
  eduLine3: { fontSize: 10, color: '#333333' },
  internshipHeader: { fontSize: 10, fontWeight: 'bold', color: '#000000', marginBottom: 1 },
  internshipSub: { fontSize: 10, color: '#333333', marginBottom: 3 },
  bulletItem: { flexDirection: 'row', marginBottom: 1.5, marginLeft: 12 },
  bulletPoint: { width: 8, fontSize: 10, lineHeight: 1.35, color: '#000000' },
  bulletText: { fontSize: 10, lineHeight: 1.35, flex: 1, color: '#000000' },
  projName: { fontSize: 10, fontWeight: 'bold', color: '#000000', marginBottom: 1 },
  projMeta: { fontSize: 9, color: '#333333', marginBottom: 2 },
  skillBlock: { marginBottom: 4 },
  skillCatTitle: { fontSize: 10, fontWeight: 'bold', color: '#000000', marginBottom: 1 },
  skillLine: { fontSize: 10, marginLeft: 12, color: '#000000', marginBottom: 1 },
  langText: { fontSize: 10, color: '#000000' },
});

const modernStyles = StyleSheet.create({
  page: { padding: '32 40', fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.45, color: '#1a1a2e' },
  header: { marginBottom: 16, paddingBottom: 10 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 2, letterSpacing: 0.5, color: '#1a1a2e' },
  title: { fontSize: 10, color: '#4a4a6a', marginBottom: 4, fontStyle: 'italic' as const },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', fontSize: 9, color: '#4a4a6a', marginTop: 2, alignItems: 'center' },
  contactItemContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  contactIcon: { width: 10, height: 10, marginRight: 4 },
  contactItem: { fontSize: 9, color: '#4a4a6a' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, color: '#1a1a2e', marginBottom: 6, textTransform: 'uppercase' as const },
  paragraph: { fontSize: 10, lineHeight: 1.5, marginBottom: 3, color: '#333344' },
  eduBlock: { marginBottom: 7, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#4a4a6a', borderLeftStyle: 'solid' as const },
  eduLine1: { fontSize: 10, fontWeight: 'bold', color: '#1a1a2e' },
  eduLine2: { fontSize: 10, color: '#333344' },
  eduLine3: { fontSize: 9, color: '#4a4a6a' },
  internshipHeader: { fontSize: 10, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 1 },
  internshipSub: { fontSize: 9, color: '#4a4a6a', marginBottom: 3, fontStyle: 'italic' as const },
  bulletItem: { flexDirection: 'row', marginBottom: 2, marginLeft: 8 },
  bulletPoint: { width: 8, fontSize: 10, lineHeight: 1.45, color: '#4a4a6a' },
  bulletText: { fontSize: 10, lineHeight: 1.45, flex: 1, color: '#333344' },
  projName: { fontSize: 10, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 1 },
  projMeta: { fontSize: 9, color: '#4a4a6a', marginBottom: 2, fontStyle: 'italic' as const },
  skillBlock: { marginBottom: 5 },
  skillCatTitle: { fontSize: 10, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 1 },
  skillLine: { fontSize: 10, marginLeft: 12, color: '#333344', marginBottom: 1 },
  langText: { fontSize: 10, color: '#333344' },
});

const corporateStyles = StyleSheet.create({
  page: { padding: '40 48', fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.4, color: '#1e293b' },
  header: { marginBottom: 16, backgroundColor: '#1e293b', padding: '12 16', marginLeft: -48, marginRight: -48, paddingHorizontal: 48 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 2, letterSpacing: 0.5, color: '#ffffff' },
  title: { fontSize: 10, color: '#94a3b8', marginBottom: 4 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', fontSize: 9, color: '#cbd5e1', marginTop: 2, alignItems: 'center' },
  contactItemContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  contactIcon: { width: 10, height: 10, marginRight: 4 },
  contactItem: { fontSize: 9, color: '#cbd5e1' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, color: '#1e293b', marginBottom: 4, textTransform: 'uppercase' as const },
  paragraph: { fontSize: 10, lineHeight: 1.4, marginBottom: 3, color: '#475569' },
  eduBlock: { marginBottom: 6 },
  eduLine1: { fontSize: 10, fontWeight: 'bold', color: '#1e293b' },
  eduLine2: { fontSize: 10, color: '#475569' },
  eduLine3: { fontSize: 9, color: '#64748b' },
  internshipHeader: { fontSize: 10, fontWeight: 'bold', color: '#1e293b', marginBottom: 1 },
  internshipSub: { fontSize: 9, color: '#64748b', marginBottom: 3 },
  bulletItem: { flexDirection: 'row', marginBottom: 1.5, marginLeft: 12 },
  bulletPoint: { width: 8, fontSize: 10, lineHeight: 1.4, color: '#475569' },
  bulletText: { fontSize: 10, lineHeight: 1.4, flex: 1, color: '#475569' },
  projName: { fontSize: 10, fontWeight: 'bold', color: '#1e293b', marginBottom: 1 },
  projMeta: { fontSize: 9, color: '#64748b', marginBottom: 2 },
  skillBlock: { marginBottom: 4 },
  skillCatTitle: { fontSize: 10, fontWeight: 'bold', color: '#1e293b', marginBottom: 1 },
  skillLine: { fontSize: 10, marginLeft: 12, color: '#475569', marginBottom: 1 },
  langText: { fontSize: 10, color: '#475569' },
});

const templateStyles = {
  classic: classicStyles,
  modern: modernStyles,
  corporate: corporateStyles,
};

interface ATSResumeProps {
  data: ResumeData;
  icons?: Record<string, string>;
  template?: ResumeTemplate;
}

export default function ATSResume({ data, icons = {}, template = 'classic' }: ATSResumeProps) {
  const styles = templateStyles[template] || classicStyles;
  const showCerts = data.hasRealCertifications;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.personalInfo.name}</Text>
          <Text style={styles.title}>{data.personalInfo.title}</Text>
          <View style={styles.contactRow}>
            <View style={styles.contactItemContainer}>
              {icons.location ? <Image src={icons.location} style={styles.contactIcon} /> : null}
              <Text style={styles.contactItem}>{data.personalInfo.location}</Text>
            </View>
            <Text style={styles.contactItem}>|</Text>
            <View style={styles.contactItemContainer}>
              {icons.email ? <Image src={icons.email} style={styles.contactIcon} /> : null}
              <Text style={styles.contactItem}>{data.personalInfo.email}</Text>
            </View>
            <Text style={styles.contactItem}>|</Text>
            <View style={styles.contactItemContainer}>
              {icons.linkedin ? <Image src={icons.linkedin} style={styles.contactIcon} /> : null}
              <Text style={styles.contactItem}>{data.personalInfo.linkedin}</Text>
            </View>
            <Text style={styles.contactItem}>|</Text>
            <View style={styles.contactItemContainer}>
              {icons.github ? <Image src={icons.github} style={styles.contactIcon} /> : null}
              <Text style={styles.contactItem}>{data.personalInfo.github}</Text>
            </View>
          </View>
        </View>

        {data.professionalSummary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            {data.professionalSummary.map((p, i) => (
              <Text key={i} style={styles.paragraph}>{p}</Text>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={styles.eduBlock}>
                <Text style={styles.eduLine1}>{edu.degree} — {edu.field ?? ''}</Text>
                <Text style={styles.eduLine2}>{edu.institution}</Text>
                <Text style={styles.eduLine3}>{edu.period}{edu.gpa ? ` | CGPA: ${edu.gpa}` : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {data.internship && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Internship Experience</Text>
            <Text style={styles.internshipHeader}>{data.internship.role}</Text>
            <Text style={styles.internshipSub}>{data.internship.organization} | {data.internship.duration}</Text>
            {data.internship.responsibilities.map((item, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Projects</Text>
            {data.projects.map((proj) => (
              <View key={proj.name}>
                <Text style={styles.projName}>{proj.name}</Text>
                <Text style={styles.projMeta}>{proj.type} | Completed: {proj.completedDate}</Text>
                {proj.highlights.map((item, i) => (
                  <View key={i} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>{'\u2022'}</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {data.skills.map((cat) => (
              <View key={cat.title} style={styles.skillBlock}>
                <Text style={styles.skillCatTitle}>{cat.title}</Text>
                <Text style={styles.skillLine}>{cat.skills.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}

        {showCerts && data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert) => (
              <View key={cert.id} style={styles.eduBlock}>
                <Text style={styles.eduLine1}>{cert.title} — {cert.organization}</Text>
                <Text style={styles.eduLine3}>{cert.issueDate}{cert.credentialId ? ` | ID: ${cert.credentialId}` : ''}</Text>
                <Text style={styles.paragraph}>{cert.description}</Text>
                {cert.skills && cert.skills.length > 0 && (
                  <Text style={{ fontSize: 10, color: '#333333', marginLeft: 12, marginBottom: 4 }}>
                    Skills: {cert.skills.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {data.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.langText}>{data.languages.join(', ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export type { ResumeTemplate };
