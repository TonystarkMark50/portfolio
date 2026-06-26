const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

async function fetchAPI<T>(endpoint: string): Promise<T | null> {
  try {
    const url = `${STRAPI_URL}/api${endpoint}`
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) return null
    return await res.json() as T
  } catch {
    return null
  }
}

export { fetchAPI, STRAPI_URL }
