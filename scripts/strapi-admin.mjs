/**
 * Strapi Admin Setup Helper
 *
 * Run AFTER creating your admin account at http://localhost:1337/admin
 * Usage: node scripts/strapi-admin.mjs
 *
 * Enter your admin email + password when prompted.
 * Creates a full-access API token and seeds all portfolio data.
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'

async function main() {
  console.log('\n=== Strapi Portfolio Setup ===\n')
  console.log(`Connecting to: ${STRAPI_URL}`)

  const email = process.env.STRAPI_ADMIN_EMAIL || ''
  const password = process.env.STRAPI_ADMIN_PASSWORD || ''

  if (!email || !password) {
    console.log('Set STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD env vars.')
    console.log('Example:')
    console.log('  $env:STRAPI_ADMIN_EMAIL="admin@example.com"')
    console.log('  $env:STRAPI_ADMIN_PASSWORD="YourPassword"')
    console.log('  node scripts/strapi-admin.mjs\n')
    process.exit(1)
  }

  // 1. Login
  console.log('Logging in...')
  const loginRes = await fetch(`${STRAPI_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!loginRes.ok) {
    const text = await loginRes.text()
    console.error(`Login failed (${loginRes.status}): ${text}`)
    process.exit(1)
  }
  const { data: { token } } = await loginRes.json()
  console.log('  OK')

  const auth = { Authorization: `Bearer ${token}` }

  // 2. Create API token
  let apiToken = process.env.STRAPI_API_TOKEN
  if (!apiToken) {
    console.log('Creating API token...')
    const tokenRes = await fetch(`${STRAPI_URL}/api/admin/api-tokens`, {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Portfolio Frontend',
        description: 'Full-access token for portfolio frontend',
        type: 'full-access',
        lifespan: null,
      }),
    })
    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      console.error(`Token creation failed (${tokenRes.status}): ${text}`)
      process.exit(1)
    }
    const tokenData = await tokenRes.json()
    apiToken = tokenData.data.access_key
    console.log(`  Token: ${apiToken}`)
  }

  const apiAuth = { Authorization: `Bearer ${apiToken}` }

  // 3. Seed data
  console.log('\nSeeding portfolio data...\n')

  const data = {
    profile: {
      name: 'Jagadeesh T',
      title: 'Biomedical Engineering Student',
      subtitle: '',
      location: 'Chennai, Tamil Nadu, India',
      email: 'shakthijagadeesh907@gmail.com',
      linkedin: 'https://www.linkedin.com/in/jagadeesh-t-583b58326/',
      github: 'https://github.com/Jagadeesh-Thulasiraman',
      portfolio_url: 'https://portfolio-jagadeesh-t.netlify.app/',
      publishedAt: new Date().toISOString(),
    },
    about: {
      title: 'About Me',
      subtitle: 'Interested in Healthcare Technology, Medical Devices, Biomedical Systems, and Healthcare Innovation.',
      display_order: 0,
      publishedAt: new Date().toISOString(),
    },
    aboutParagraphs: [
      {
        content: 'I am a Biomedical Engineering student with a strong interest in healthcare technology, medical devices, biomedical systems, and healthcare innovation. Through academic coursework, internship training, and project experience, I have developed foundational knowledge in biomedical engineering and healthcare technology applications.',
        display_order: 0,
        published: true,
      },
      {
        content: 'My academic and practical experiences have strengthened my understanding of biomedical equipment, technical documentation, healthcare systems, and engineering principles. I am interested in applying engineering knowledge to support healthcare solutions, improve patient care, and contribute to advancements in medical technology.',
        display_order: 1,
        published: true,
      },
      {
        content: 'Through academic projects, internship training, and continuous learning, I have developed analytical skills, communication skills, teamwork, problem-solving abilities, and the ability to work independently in technical and academic environments.',
        display_order: 2,
        published: true,
      },
    ],
    skills: [
      { title: 'Programming', skills: ['Python Programming', 'C Programming'], gradient: 'from-sky-500/20 to-blue-500/20', display_order: 0 },
      { title: 'Database', skills: ['Database Management Systems (DBMS)'], gradient: 'from-violet-500/20 to-purple-500/20', display_order: 1 },
      { title: 'Biomedical Engineering', skills: ['Biomedical Signal Processing', 'Biomedical Equipment Management', 'Healthcare Technology Systems', 'Clinical Engineering Exposure', 'Preventive Maintenance Procedures', 'Medical Devices', 'Hospital Workflow', 'Technical Documentation'], gradient: 'from-emerald-500/20 to-teal-500/20', display_order: 2 },
      { title: 'Professional Skills', skills: ['Analytical Skills', 'Communication Skills', 'Teamwork', 'Problem-Solving', 'Ability to Work Independently', 'Technical Writing'], gradient: 'from-amber-500/20 to-orange-500/20', display_order: 3 },
    ],
    education: [
      { degree: 'Bachelor of Engineering (B.E.)', field: 'Biomedical Engineering', institution: 'Saveetha Engineering College', period: '2024 \u2013 Present', location: 'Chennai, Tamil Nadu, India', gpa: '8.42 / 10', status: 'Second Year', current: true, description: 'Currently pursuing a Bachelor of Engineering in Biomedical Engineering at Saveetha Engineering College with developing knowledge in biomedical systems, healthcare technologies, engineering principles, and medical applications.', display_order: 0 },
      { degree: 'Higher Secondary Education', field: 'Biology \u2013 Mathematics Group (Bio-Maths)', institution: 'Vethathiri Maharishi Higher Secondary School', period: 'Completed', location: 'Tamil Nadu, India', gpa: '530 / 600 ( 88.66 % ) in 12th public exam', status: '', current: false, description: 'Completed Higher Secondary Education with a foundation in Biology, Mathematics, Physics, and Chemistry.', display_order: 1 },
      { degree: 'Secondary Education', field: 'Science & Mathematics', institution: 'Vethathiri Maharishi Higher Secondary School', period: 'Completed', location: 'Tamil Nadu, India', gpa: '450 / 500 ( 90 % ) in 10th public exam', status: '', current: false, description: 'Completed Secondary School Education with a focus on analytical and scientific learning.', display_order: 2 },
    ],
    internship: {
      organization: 'Sri Ramachandra Institute of Higher Education and Research',
      department: 'Biomedical Engineering',
      role: 'Biomedical Engineering Intern',
      duration: 'Jul 2025 \u2013 Aug 2025',
      location: 'Chennai, India',
      type: 'On-Site',
      description: ['Completed a one-month internship in the Department of Biomedical Engineering at Sri Ramachandra Institute of Higher Education and Research, gaining practical exposure to biomedical equipment, clinical engineering workflows, and healthcare technology operations.'],
      responsibilities: [
        'Completed a one-month internship in the Department of Biomedical Engineering.',
        'Gained practical exposure to biomedical equipment handling and healthcare technology systems.',
        'Developed understanding of preventive maintenance procedures and biomedical equipment management.',
        'Observed clinical engineering workflows and hospital technology operations.',
        'Participated in technical documentation and reporting activities.',
        'Acquired knowledge of healthcare technology applications in clinical environments.',
      ],
      learnings: ['Biomedical Equipment Handling', 'Clinical Exposure', 'Preventive Maintenance Procedures', 'Healthcare Technology Systems', 'Hospital Workflow', 'Technical Documentation'],
      impact: [
        'Completed a structured one-month internship training program in the Department of Biomedical Engineering at a leading healthcare institution.',
        'Acquired practical exposure to biomedical equipment management, clinical engineering workflows, and healthcare technology systems within a hospital environment.',
      ],
      certificate_url: 'https://internship-certificate-of-jagadeesh.tiiny.site/',
      completed: true,
      display_order: 0,
      publishedAt: new Date().toISOString(),
    },
    projects: [
      {
        name: 'IoT-Based Stress Detection Smart Watch for Abnormal Children and Elders',
        type: 'Academic Mini Project',
        status: 'Completed',
        completed_date: 'Dec 2025',
        description: 'Designed and developed an IoT-based wearable smart watch for real-time stress monitoring using ESP32 microcontroller, GSR sensor, and MPU6050 motion sensor.',
        highlights: [
          'Designed and developed an IoT-based wearable smart watch for real-time stress monitoring.',
          'Integrated ESP32 microcontroller, GSR sensor, MPU6050 motion sensor, and OLED display.',
          'Implemented stress classification functionality to identify Normal, Medium, and High stress conditions.',
          'Enabled IoT connectivity through Blynk for remote monitoring and cloud-based visualization.',
          'Applied embedded systems concepts, sensor integration, and biomedical monitoring techniques.',
        ],
        technologies: ['ESP32 Microcontroller', 'GSR Sensor', 'MPU6050 Motion Sensor', 'OLED Display', 'Blynk IoT Platform', 'Embedded Systems'],
        report_url: 'https://drive.google.com/file/d/1cV-ZxjPaYVf37uV1rrJTObpGNGwKKUOv/view?usp=drivesdk',
        featured: true,
        display_order: 0,
        publishedAt: new Date().toISOString(),
      },
    ],
    certifications: [
      {
        title: 'Python (Basic)',
        organization: 'HackerRank',
        platform: 'HackerRank',
        issue_date: '2025',
        credential_id: 'e7326cd4dd3e',
        certificate_url: 'https://www.hackerrank.com/certificates/e7326cd4dd3e',
        embed_url: 'https://www.hackerrank.com/certificates/iframe/e7326cd4dd3e',
        description: 'Successfully completed the HackerRank Python (Basic) Certification, demonstrating foundational knowledge of Python programming concepts, problem-solving techniques, functions, loops, conditionals, basic data structures, and programming fundamentals.',
        category: 'Programming, Python Development',
        skills: ['Python Programming', 'Problem Solving', 'Functions', 'Loops and Conditions', 'Basic Data Structures'],
        status: 'completed',
        display_order: 0,
        publishedAt: new Date().toISOString(),
      },
      {
        title: 'Database Management Essentials',
        organization: 'University of Colorado System',
        platform: 'Coursera',
        issue_date: '2025',
        credential_id: '23Z9297XJG0L',
        certificate_url: 'https://www.coursera.org/account/accomplishments/verify/23Z9297XJG0L',
        embed_url: '',
        description: 'Successfully completed the "Database Management Essentials" certification offered by the University of Colorado System through Coursera. The certification provided foundational knowledge of database concepts, relational database systems, data modeling, database design principles, SQL fundamentals, and database management practices used in modern information systems.',
        category: 'Database Management, Information Systems',
        skills: ['Database Management Systems (DBMS)', 'Database Design', 'Relational Databases', 'SQL Fundamentals', 'Data Management'],
        status: 'completed',
        display_order: 1,
        publishedAt: new Date().toISOString(),
      },
    ],
    contactInfo: {
      email: 'shakthijagadeesh907@gmail.com',
      github: 'https://github.com/Jagadeesh-Thulasiraman',
      linkedin: 'https://www.linkedin.com/in/jagadeesh-t-583b58326/',
      location: 'Chennai, Tamil Nadu, India',
      portfolio_url: 'https://portfolio-jagadeesh-t.netlify.app/',
      phone: '',
      publishedAt: new Date().toISOString(),
    },
  }

  // Helper: POST to Content API
  async function post(pluralApiId, body, singular = false) {
    const url = `${STRAPI_URL}/api/${pluralApiId}`
    const payload = { data: body }
    const res = await fetch(singular ? url : url, {
      method: singular ? 'PUT' : 'POST',
      headers: { ...apiAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      console.log(`  ${singular ? 'PUT ' : 'POST'} /api/${pluralApiId} -> ${res.status}`)
    } else {
      const text = await res.text()
      console.error(`  ${singular ? 'PUT ' : 'POST'} /api/${pluralApiId} -> ${res.status}: ${text}`)
    }
  }

  // Single types (PUT)
  console.log('Profile...')
  await post('profile', data.profile, true)
  console.log('About...')
  await post('about', data.about, true)
  console.log('Internship...')
  await post('internship', data.internship, true)
  console.log('Contact Info...')
  await post('contact-info', data.contactInfo, true)

  // Collection types (POST)
  console.log('About Paragraphs...')
  for (const p of data.aboutParagraphs) await post('about-paragraphs', p)
  console.log('Skills...')
  for (const s of data.skills) await post('skills', s)
  console.log('Education...')
  for (const e of data.education) await post('educations', e)
  console.log('Projects...')
  for (const p of data.projects) await post('projects', p)
  console.log('Certifications...')
  for (const c of data.certifications) await post('certifications', c)

  console.log('\n=== Done! ===')
  console.log('Your portfolio data is now in Strapi.')
  console.log(`Set VITE_STRAPI_URL=${STRAPI_URL} in your .env to connect the frontend.`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
