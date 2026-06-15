-- ============================================================
-- SEED: Populate all tables with Jagadeesh's real portfolio data
-- Run this ONCE in Supabase SQL Editor after migrations.
-- Safe to re-run — uses ON CONFLICT with fixed IDs.
-- ============================================================

-- 1. PROFILE
INSERT INTO profile (id, name, title, location, email, linkedin, github)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Jagadeesh T',
  'Biomedical Engineering Student',
  'Chennai, Tamil Nadu, India',
  'shakthijagadeesh907@gmail.com',
  'https://www.linkedin.com/in/jagadeesh-t-583b58326/',
  'https://github.com/Jagadeesh-Thulasiraman'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  location = EXCLUDED.location,
  email = EXCLUDED.email,
  linkedin = EXCLUDED.linkedin,
  github = EXCLUDED.github;

-- 2. ABOUT
INSERT INTO about (id, title, subtitle, paragraphs, display_order)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'About Me',
  'Interested in Healthcare Technology, Medical Devices, Biomedical Systems, and Healthcare Innovation.',
  ARRAY[
    'I am a Biomedical Engineering student with a strong interest in healthcare technology, medical devices, biomedical systems, and healthcare innovation. Through academic coursework, internship training, and project experience, I have developed foundational knowledge in biomedical engineering and healthcare technology applications.',
    'My academic and practical experiences have strengthened my understanding of biomedical equipment, technical documentation, healthcare systems, and engineering principles. I am interested in applying engineering knowledge to support healthcare solutions, improve patient care, and contribute to advancements in medical technology.',
    'Through academic projects, internship training, and continuous learning, I have developed analytical skills, communication skills, teamwork, problem-solving abilities, and the ability to work independently in technical and academic environments.'
  ],
  0
)
ON CONFLICT (id) DO UPDATE SET
  subtitle = EXCLUDED.subtitle,
  paragraphs = EXCLUDED.paragraphs;

-- 3. SKILLS
INSERT INTO skills (id, category, skills, gradient, display_order) VALUES
  ('00000000-0000-0000-0000-000000000020', 'Programming', ARRAY['Python Programming', 'C Programming'], 'from-sky-500/20 to-blue-500/20', 0),
  ('00000000-0000-0000-0000-000000000021', 'Database', ARRAY['Database Management Systems (DBMS)'], 'from-violet-500/20 to-purple-500/20', 1),
  ('00000000-0000-0000-0000-000000000022', 'Biomedical Engineering', ARRAY[
    'Biomedical Signal Processing',
    'Biomedical Equipment Management',
    'Healthcare Technology Systems',
    'Clinical Engineering Exposure',
    'Preventive Maintenance Procedures',
    'Medical Devices',
    'Hospital Workflow',
    'Technical Documentation'
  ], 'from-emerald-500/20 to-teal-500/20', 2),
  ('00000000-0000-0000-0000-000000000023', 'Professional Skills', ARRAY[
    'Analytical Skills',
    'Communication Skills',
    'Teamwork',
    'Problem-Solving',
    'Ability to Work Independently',
    'Technical Writing'
  ], 'from-amber-500/20 to-orange-500/20', 3)
ON CONFLICT (id) DO UPDATE SET
  skills = EXCLUDED.skills,
  gradient = EXCLUDED.gradient;

-- 4. INTERNSHIPS
INSERT INTO internships (id, organization, department, role, duration, location, type, description, responsibilities, learnings, impact, certificate_url, completed)
VALUES (
  '00000000-0000-0000-0000-000000000030',
  'Sri Ramachandra Institute of Higher Education and Research',
  'Biomedical Engineering',
  'Biomedical Engineering Intern',
  'Jul 2025 – Aug 2025',
  'Chennai, India',
  'On-Site',
  ARRAY['Completed a one-month internship in the Department of Biomedical Engineering at Sri Ramachandra Institute of Higher Education and Research, gaining practical exposure to biomedical equipment, clinical engineering workflows, and healthcare technology operations.'],
  ARRAY[
    'Completed a one-month internship in the Department of Biomedical Engineering.',
    'Gained practical exposure to biomedical equipment handling and healthcare technology systems.',
    'Developed understanding of preventive maintenance procedures and biomedical equipment management.',
    'Observed clinical engineering workflows and hospital technology operations.',
    'Participated in technical documentation and reporting activities.',
    'Acquired knowledge of healthcare technology applications in clinical environments.'
  ],
  ARRAY[
    'Biomedical Equipment Handling',
    'Clinical Exposure',
    'Preventive Maintenance Procedures',
    'Healthcare Technology Systems',
    'Hospital Workflow',
    'Technical Documentation'
  ],
  ARRAY[
    'Completed a structured one-month internship training program in the Department of Biomedical Engineering at a leading healthcare institution.',
    'Acquired practical exposure to biomedical equipment management, clinical engineering workflows, and healthcare technology systems within a hospital environment.'
  ],
  'https://internship-certificate-of-jagadeesh.tiiny.site/',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  organization = EXCLUDED.organization,
  department = EXCLUDED.department,
  role = EXCLUDED.role,
  duration = EXCLUDED.duration,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  responsibilities = EXCLUDED.responsibilities,
  learnings = EXCLUDED.learnings,
  impact = EXCLUDED.impact,
  certificate_url = EXCLUDED.certificate_url;

-- 5. EDUCATION
INSERT INTO education (id, degree, field, institution, period, location, gpa, status, current, description, display_order) VALUES
  (
    '00000000-0000-0000-0000-000000000040',
    'Bachelor of Engineering (B.E.)',
    'Biomedical Engineering',
    'Saveetha Engineering College',
    '2024 – Present',
    'Chennai, Tamil Nadu, India',
    '8.05 / 10',
    'Second Year',
    TRUE,
    'Currently pursuing a Bachelor of Engineering in Biomedical Engineering at Saveetha Engineering College with developing knowledge in biomedical systems, healthcare technologies, engineering principles, and medical applications.',
    0
  ),
  (
    '00000000-0000-0000-0000-000000000041',
    'Higher Secondary Education',
    'Biology – Mathematics Group (Bio-Maths)',
    'Vethathiri Maharishi Higher Secondary School',
    'Completed',
    'Tamil Nadu, India',
    NULL,
    NULL,
    FALSE,
    'Completed Higher Secondary Education with a foundation in Biology, Mathematics, Physics, and Chemistry.',
    1
  ),
  (
    '00000000-0000-0000-0000-000000000042',
    'Secondary Education',
    'Science & Mathematics',
    'Vethathiri Maharishi Higher Secondary School',
    'Completed',
    'Tamil Nadu, India',
    NULL,
    NULL,
    FALSE,
    'Completed Secondary School Education with a focus on analytical and scientific learning.',
    2
  )
ON CONFLICT (id) DO UPDATE SET
  degree = EXCLUDED.degree,
  field = EXCLUDED.field,
  institution = EXCLUDED.institution,
  period = EXCLUDED.period,
  location = EXCLUDED.location,
  gpa = EXCLUDED.gpa,
  status = EXCLUDED.status,
  current = EXCLUDED.current,
  description = EXCLUDED.description;

-- 6. CERTIFICATIONS
INSERT INTO certifications (id, title, organization, platform, issue_date, credential_id, certificate_url, embed_url, description, category, skills, status, display_order)
VALUES
(
  '00000000-0000-0000-0000-000000000050',
  'Python (Basic)',
  'HackerRank',
  'HackerRank',
  '2025',
  'e7326cd4dd3e',
  'https://www.hackerrank.com/certificates/e7326cd4dd3e',
  'https://www.hackerrank.com/certificates/iframe/e7326cd4dd3e',
  'Successfully completed the HackerRank Python (Basic) Certification, demonstrating foundational knowledge of Python programming concepts, problem-solving techniques, functions, loops, conditionals, basic data structures, and programming fundamentals.',
  'Programming, Python Development',
  ARRAY['Python Programming', 'Problem Solving', 'Functions', 'Loops and Conditions', 'Basic Data Structures'],
  'completed',
  0
),
(
  '00000000-0000-0000-0000-000000000051',
  'Database Management Essentials',
  'University of Colorado System',
  'Coursera',
  '2025',
  '23Z9297XJG0L',
  'https://www.coursera.org/account/accomplishments/verify/23Z9297XJG0L',
  '',
  'Successfully completed the "Database Management Essentials" certification offered by the University of Colorado System through Coursera. The certification provided foundational knowledge of database concepts, relational database systems, data modeling, database design principles, SQL fundamentals, and database management practices used in modern information systems.',
  'Database Management, Information Systems',
  ARRAY['Database Management Systems (DBMS)', 'Database Design', 'Relational Databases', 'SQL Fundamentals', 'Data Management'],
  'completed',
  1
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  organization = EXCLUDED.organization,
  platform = EXCLUDED.platform,
  issue_date = EXCLUDED.issue_date,
  credential_id = EXCLUDED.credential_id,
  certificate_url = EXCLUDED.certificate_url,
  embed_url = EXCLUDED.embed_url,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  skills = EXCLUDED.skills;

-- 7. PROJECTS
INSERT INTO projects (id, name, type, status, completed_date, description, highlights, technologies, report_url, featured, display_order)
VALUES (
  '00000000-0000-0000-0000-000000000060',
  'IoT-Based Stress Detection Smart Watch for Abnormal Children and Elders',
  'Academic Mini Project',
  'Completed',
  'Dec 2025',
  'Designed and developed an IoT-based wearable smart watch for real-time stress monitoring using ESP32 microcontroller, GSR sensor, and MPU6050 motion sensor.',
  ARRAY[
    'Designed and developed an IoT-based wearable smart watch for real-time stress monitoring.',
    'Integrated ESP32 microcontroller, GSR sensor, MPU6050 motion sensor, and OLED display.',
    'Implemented stress classification functionality to identify Normal, Medium, and High stress conditions.',
    'Enabled IoT connectivity through Blynk for remote monitoring and cloud-based visualization.',
    'Applied embedded systems concepts, sensor integration, and biomedical monitoring techniques.'
  ],
  ARRAY['ESP32 Microcontroller', 'GSR Sensor', 'MPU6050 Motion Sensor', 'OLED Display', 'Blynk IoT Platform', 'Embedded Systems'],
  'https://drive.google.com/file/d/1cV-ZxjPaYVf37uV1rrJTObpGNGwKKUOv/view?usp=drivesdk',
  TRUE,
  0
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  completed_date = EXCLUDED.completed_date,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  technologies = EXCLUDED.technologies,
  report_url = EXCLUDED.report_url,
  featured = EXCLUDED.featured;

-- 8. CONTACT INFO
INSERT INTO contact_info (id, email, github, linkedin, location)
VALUES (
  '00000000-0000-0000-0000-000000000070',
  'shakthijagadeesh907@gmail.com',
  'https://github.com/Jagadeesh-Thulasiraman',
  'https://www.linkedin.com/in/jagadeesh-t-583b58326/',
  'Chennai, Tamil Nadu, India'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  github = EXCLUDED.github,
  linkedin = EXCLUDED.linkedin,
  location = EXCLUDED.location;

-- 9. SITE SETTINGS
INSERT INTO site_settings (id, site_title, seo_description, seo_keywords)
VALUES (
  '00000000-0000-0000-0000-000000000080',
  'Jagadeesh T — Biomedical Engineering Portfolio',
  'Biomedical Engineering student with expertise in healthcare technology, medical devices, and IoT-based health monitoring systems.',
  'biomedical engineering, healthcare technology, medical devices, IoT, Python, portfolio'
)
ON CONFLICT (id) DO UPDATE SET
  site_title = EXCLUDED.site_title,
  seo_description = EXCLUDED.seo_description,
  seo_keywords = EXCLUDED.seo_keywords;
