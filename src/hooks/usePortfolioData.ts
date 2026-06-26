import { useState, useEffect, useRef } from 'react'
import { getCachedData, setCachedData, isCacheStale } from '../lib/api-cache'

const HAS_STRAPI = !!import.meta.env.VITE_STRAPI_URL

type LoaderFn<T> = () => Promise<T | null>

function usePortfolioData<T>(
  key: string,
  loader: LoaderFn<T>,
): { data: T | null; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{
    data: T | null; loading: boolean; error: Error | null
  }>({ data: null, loading: true, error: null })
  const mountedRef = useRef(true)
  const cacheKey = `pd_${key}`

  useEffect(() => {
    mountedRef.current = true

    const cached = getCachedData<T>(cacheKey)
    if (cached && !isCacheStale(cached)) {
      setState({ data: cached.data, loading: false, error: null })
      return
    }

    loader()
      .then(result => {
        if (!mountedRef.current) return
        if (result) setCachedData(cacheKey, result)
        setState({ data: result, loading: false, error: null })
      })
      .catch(err => {
        if (!mountedRef.current) return
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        })
      })

    return () => { mountedRef.current = false }
  }, [cacheKey])

  return state
}

/** Backward-compatible alias for code using the old hook name */
function useSupabaseData<T>(loader: LoaderFn<T>): { data: T | null; loading: boolean; error: Error | null } {
  const cacheKey = loader.name || loader.toString().slice(0, 80)
  return usePortfolioData(cacheKey, loader)
}

export { HAS_STRAPI, usePortfolioData, useSupabaseData }

import { createStrapiLoaders } from '../lib/strapi-loaders'

type StrapiLoaders = ReturnType<typeof createStrapiLoaders>

let strapiLoaders: StrapiLoaders | null = null

function getLoaders(): StrapiLoaders | null {
  if (!strapiLoaders) {
    try {
      strapiLoaders = createStrapiLoaders()
    } catch {
      return null
    }
  }
  return strapiLoaders
}

function useStrapiData<T>(strapiKey: keyof StrapiLoaders): { data: T | null; loading: boolean; error: Error | null } {
  const loaders = HAS_STRAPI ? getLoaders() : null
  return usePortfolioData(
    strapiKey,
    async () => {
      if (loaders) return (loaders[strapiKey] as () => Promise<T | null>)()
      const mod = await import('../lib/loaders')
      const fn = mod[strapiKey as keyof typeof mod]
      return typeof fn === 'function' ? (fn as () => Promise<T | null>)() : null
    },
  )
}

export function useProfile() { return useStrapiData<import('../lib/loaders').PersonalInfo | null>('loadProfile') }
export function useAbout() { return useStrapiData<import('../lib/loaders').AboutData | null>('loadAbout') }
export function useSkills() { return useStrapiData<import('../lib/loaders').SkillCategory[] | null>('loadSkills') }
export function useEducation() { return useStrapiData<import('../lib/loaders').EducationItem[] | null>('loadEducation') }
export function useInternships() { return useStrapiData<import('../lib/loaders').InternshipData | null>('loadInternships') }
export function useCertifications() { return useStrapiData<import('../lib/loaders').CertificationItem[] | null>('loadCertifications') }
export function useProjects() { return useStrapiData<import('../lib/loaders').ProjectItem[] | null>('loadProjects') }
export function useJourneyMilestones() { return useStrapiData<import('../lib/loaders').JourneyMilestone[] | null>('loadJourneyMilestones') }
export function useContactInfo() { return useStrapiData<{ email: string; location: string; linkedin: string; github: string } | null>('loadContactInfo') }
