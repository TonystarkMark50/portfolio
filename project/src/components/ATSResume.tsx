import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { ResumeData } from '../lib/loaders';

const styles = StyleSheet.create({
  page: {
    padding: '36 44',
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.35,
    color: '#000000',
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 3,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 9,
    color: '#333333',
    marginTop: 3,
    alignItems: 'center',
  },
  contactItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  contactIcon: {
    width: 10,
    height: 10,
    marginRight: 4,
  },
  contactItem: {
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 1,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 3,
    color: '#000000',
  },
  eduBlock: {
    marginBottom: 6,
  },
  eduLine1: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  eduLine2: {
    fontSize: 10,
    color: '#000000',
  },
  eduLine3: {
    fontSize: 10,
    color: '#333333',
  },
  internshipHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 1,
  },
  internshipSub: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 3,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 1.5,
    marginLeft: 12,
  },
  bulletPoint: {
    width: 8,
    fontSize: 10,
    lineHeight: 1.35,
    color: '#000000',
  },
  bulletText: {
    fontSize: 10,
    lineHeight: 1.35,
    flex: 1,
    color: '#000000',
  },
  projName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 1,
  },
  projMeta: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 2,
  },
  skillBlock: {
    marginBottom: 4,
  },
  skillCatTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 1,
  },
  skillLine: {
    fontSize: 10,
    marginLeft: 12,
    color: '#000000',
    marginBottom: 1,
  },
  langText: {
    fontSize: 10,
    color: '#000000',
  },
});

interface ATSResumeProps {
  data: ResumeData;
  icons?: Record<string, string>;
}

export default function ATSResume({ data, icons = {} }: ATSResumeProps) {
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.paragraph}>{data.professionalSummary[0]}</Text>
          <Text style={styles.paragraph}>{data.professionalSummary[1]}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={styles.eduBlock}>
              <Text style={styles.eduLine1}>{edu.degree} — {edu.field}</Text>
              {edu.gpa ? (
                <Text style={styles.eduLine2}>{edu.institution} — Chennai, Tamil Nadu, India</Text>
              ) : (
                <Text style={styles.eduLine2}>{edu.institution}</Text>
              )}
              <Text style={styles.eduLine3}>{edu.period}{edu.gpa ? ` | CGPA: ${edu.gpa}` : ''}</Text>
            </View>
          ))}
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          {data.skills.map((cat) => (
            <View key={cat.title} style={styles.skillBlock}>
              <Text style={styles.skillCatTitle}>{cat.title}</Text>
              {cat.skills.map((skill) => (
                <Text key={skill} style={styles.skillLine}>{'\u2022'} {skill}</Text>
              ))}
            </View>
          ))}
        </View>

        {showCerts && (
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.langText}>{data.languages.join(', ')}</Text>
        </View>
      </Page>
    </Document>
  );
}
