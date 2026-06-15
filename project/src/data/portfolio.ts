export const personalInfo = {
  name: 'Jagadeesh T',
  title: 'Biomedical Engineering Student',
  location: 'Chennai, Tamil Nadu, India',
  email: 'shakthijagadeesh907@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jagadeesh-t-583b58326/',
  github: 'https://github.com/Jagadeesh-Thulasiraman',
};

export const aboutContent = [
  'I am a Biomedical Engineering student with a strong interest in healthcare technology, medical devices, biomedical systems, and healthcare innovation. Through academic coursework, internship training, and project experience, I have developed foundational knowledge in biomedical engineering and healthcare technology applications.',
  'My academic and practical experiences have strengthened my understanding of biomedical equipment, technical documentation, healthcare systems, and engineering principles. I am interested in applying engineering knowledge to support healthcare solutions, improve patient care, and contribute to advancements in medical technology.',
  'Through academic projects, internship training, and continuous learning, I have developed analytical skills, communication skills, teamwork, problem-solving abilities, and the ability to work independently in technical and academic environments.',
];

export const aboutSubtitle = 'Interested in Healthcare Technology, Medical Devices, Biomedical Systems, and Healthcare Innovation.';

export const professionalSummary = [
  'Biomedical Engineering student with a strong interest in healthcare technology, medical devices, biomedical systems, and healthcare innovation. Through academic coursework, internship training, and project experience, I have developed foundational knowledge in biomedical engineering, healthcare technology applications, biomedical equipment management, and technical documentation.',
  'I am interested in applying engineering principles and emerging technologies to support healthcare solutions, improve patient care, and contribute to the development of innovative medical technologies.',
];

export const languages = ['English', 'Tamil'];

export const educationData = [
  {
    id: 1,
    degree: 'Bachelor of Engineering (B.E.)',
    field: 'Biomedical Engineering',
    institution: 'Saveetha Engineering College',
    period: '2024 – Present',
    location: 'Chennai, Tamil Nadu, India',
    gpa: '8.05 / 10',
    status: 'Second Year',
    current: true,
    description: 'Currently pursuing a Bachelor of Engineering in Biomedical Engineering at Saveetha Engineering College with developing knowledge in biomedical systems, healthcare technologies, engineering principles, and medical applications.',
  },
  {
    id: 2,
    degree: 'Higher Secondary Education',
    field: 'Biology – Mathematics Group (Bio-Maths)',
    institution: 'Vethathiri Maharishi Higher Secondary School',
    period: 'Completed',
    location: 'Tamil Nadu, India',
    description: 'Completed Higher Secondary Education with a foundation in Biology, Mathematics, Physics, and Chemistry.',
  },
  {
    id: 3,
    degree: 'Secondary Education',
    field: 'Science & Mathematics',
    institution: 'Vethathiri Maharishi Higher Secondary School',
    period: 'Completed',
    location: 'Tamil Nadu, India',
    description: 'Completed Secondary School Education with a focus on analytical and scientific learning.',
  },
];

export const internshipData = {
  id: 1,
  organization: 'Sri Ramachandra Institute of Higher Education and Research',
  department: 'Biomedical Engineering',
  role: 'Biomedical Engineering Intern',
  duration: 'Jul 2025 – Aug 2025',
  location: 'Chennai, India',
  type: 'On-Site',
  description: [
    'Completed a one-month internship in the Department of Biomedical Engineering at Sri Ramachandra Institute of Higher Education and Research, gaining practical exposure to biomedical equipment, clinical engineering workflows, and healthcare technology operations.',
  ],
  responsibilities: [
    'Completed a one-month internship in the Department of Biomedical Engineering.',
    'Gained practical exposure to biomedical equipment handling and healthcare technology systems.',
    'Developed understanding of preventive maintenance procedures and biomedical equipment management.',
    'Observed clinical engineering workflows and hospital technology operations.',
    'Participated in technical documentation and reporting activities.',
    'Acquired knowledge of healthcare technology applications in clinical environments.',
  ],
  learnings: [
    'Biomedical Equipment Handling',
    'Clinical Exposure',
    'Preventive Maintenance Procedures',
    'Healthcare Technology Systems',
    'Hospital Workflow',
    'Technical Documentation',
  ],
  impact: [
    'Completed a structured one-month internship training program in the Department of Biomedical Engineering at a leading healthcare institution.',
    'Acquired practical exposure to biomedical equipment management, clinical engineering workflows, and healthcare technology systems within a hospital environment.',
  ],
  certificateUrl: 'https://internship-certificate-of-jagadeesh.tiiny.site/',
  completed: true,
};

export const projectsData = [
  {
    name: 'IoT-Based Stress Detection Smart Watch for Abnormal Children and Elders',
    type: 'Academic Mini Project',
    status: 'Completed',
    completedDate: 'Dec 2025',
    highlights: [
      'Designed and developed an IoT-based wearable smart watch for real-time stress monitoring.',
      'Integrated ESP32 microcontroller, GSR sensor, MPU6050 motion sensor, and OLED display.',
      'Implemented stress classification functionality to identify Normal, Medium, and High stress conditions.',
      'Enabled IoT connectivity through Blynk for remote monitoring and cloud-based visualization.',
      'Applied embedded systems concepts, sensor integration, and biomedical monitoring techniques.',
    ],
    technologies: [
      'ESP32 Microcontroller',
      'GSR Sensor',
      'MPU6050 Motion Sensor',
      'OLED Display',
      'Blynk IoT Platform',
      'Embedded Systems',
    ],
    reportUrl: 'https://drive.google.com/file/d/1cV-ZxjPaYVf37uV1rrJTObpGNGwKKUOv/view?usp=drivesdk',
  },
];

export const skillCategories = [
  {
    title: 'Programming',
    skills: ['Python Programming', 'C Programming'],
    gradient: 'from-sky-500/20 to-blue-500/20',
  },
  {
    title: 'Database',
    skills: ['Database Management Systems (DBMS)'],
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    title: 'Biomedical Engineering',
    skills: [
      'Biomedical Signal Processing',
      'Biomedical Equipment Management',
      'Healthcare Technology Systems',
      'Clinical Engineering Exposure',
      'Preventive Maintenance Procedures',
      'Medical Devices',
      'Hospital Workflow',
      'Technical Documentation',
    ],
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    title: 'Professional Skills',
    skills: [
      'Analytical Skills',
      'Communication Skills',
      'Teamwork',
      'Problem-Solving',
      'Ability to Work Independently',
      'Technical Writing',
    ],
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
];

export const certificationsData = [
  {
    id: 1,
    title: 'Python (Basic)',
    organization: 'HackerRank',
    platform: 'HackerRank',
    issueDate: '2025',
    credentialId: 'e7326cd4dd3e',
    certificateUrl: 'https://www.hackerrank.com/certificates/e7326cd4dd3e',
    embedUrl: 'https://www.hackerrank.com/certificates/iframe/e7326cd4dd3e',
    description: 'Successfully completed the HackerRank Python (Basic) Certification, demonstrating foundational knowledge of Python programming concepts, problem-solving techniques, functions, loops, conditionals, basic data structures, and programming fundamentals.',
    status: 'completed' as const,
    category: 'Programming, Python Development',
    logoUrl: '/assets/images/hackerrank.png',
    skills: [
      'Python Programming',
      'Problem Solving',
      'Functions',
      'Loops and Conditions',
      'Basic Data Structures',
    ],
  },
  {
    id: 2,
    title: 'Database Management Essentials',
    organization: 'University of Colorado System',
    platform: 'Coursera',
    issueDate: '2025',
    credentialId: '23Z9297XJG0L',
    certificateUrl: 'https://www.coursera.org/account/accomplishments/verify/23Z9297XJG0L',
    embedUrl: '',
    description: 'Successfully completed the "Database Management Essentials" certification offered by the University of Colorado System through Coursera. The certification provided foundational knowledge of database concepts, relational database systems, data modeling, database design principles, SQL fundamentals, and database management practices used in modern information systems.',
    status: 'completed' as const,
    category: 'Database Management, Information Systems',
    logoUrl: '/assets/images/college.png',
    skills: [
      'Database Management Systems (DBMS)',
      'Database Design',
      'Relational Databases',
      'SQL Fundamentals',
      'Data Management',
    ],
  },
];

export function hasRealCertifications(): boolean {
  return certificationsData.some(
    (c) => c.title !== 'Certification Title' || c.organization !== 'Issuing Organization'
  );
}
