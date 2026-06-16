import { calculatePortfolioHealth } from '../src/features/health-engine/healthEngine'
import type { PortfolioData } from '../src/features/health-engine/healthEngine'

const emptyData: PortfolioData = {
  profile: null,
  about: null,
  projects: [],
  skills: [],
  education: [],
  certifications: [],
  internships: [],
  seo: null,
  contact: null,
  analytics: false,
}

const completeData: PortfolioData = {
  profile: { name: 'John', title: 'Dev', avatar_url: 'av.jpg', email: 'j@j.com', linkedin: 'linked', github: 'gh', location: 'NYC' },
  about: [{ content: 'About me...' }],
  projects: [{ id: '1', name: 'P1', description: 'Desc', technologies: ['React'], status: 'done' }, { id: '2', name: 'P2', technologies: ['Vue'] }, { id: '3', name: 'P3', technologies: ['Angular'] }],
  skills: [{ id: '1', skills: ['JS', 'TS', 'React', 'Node', 'Python', 'Go', 'Rust', 'SQL', 'Docker', 'K8s', 'AWS'] }],
  education: [{ id: '1', degree: 'BS', institution: 'MIT' }],
  certifications: [{ id: '1', title: 'AWS', organization: 'Amazon', certificate_url: 'url' }],
  internships: [{ id: '1', company: 'Acme', role: 'Intern' }],
  seo: { site_title: 'Portfolio', seo_description: 'My portfolio' },
  contact: { email: 'j@j.com', github: 'gh', linkedin: 'linked' },
  analytics: true,
}

describe('calculatePortfolioHealth', () => {
  it('should return low score for empty portfolio', () => {
    const result = calculatePortfolioHealth(emptyData)
    expect(result.overallScore).toBe(0)
    expect(result.passedChecks).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('should return perfect score for complete portfolio', () => {
    const result = calculatePortfolioHealth(completeData)
    expect(result.overallScore).toBe(100)
    expect(result.passedChecks).toBe(result.totalChecks)
    expect(result.recommendations).toHaveLength(0)
  })

  it('should return checks with correct structure', () => {
    const result = calculatePortfolioHealth(emptyData)
    expect(result.checks.length).toBeGreaterThan(0)
    result.checks.forEach(check => {
      expect(check).toHaveProperty('id')
      expect(check).toHaveProperty('label')
      expect(check).toHaveProperty('category')
      expect(check).toHaveProperty('passed')
      expect(check).toHaveProperty('score')
      expect(check).toHaveProperty('recommendation')
    })
  })
})
