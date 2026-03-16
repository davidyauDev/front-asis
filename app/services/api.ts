export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token')

  const response = await fetch(`${config.public.apiBaseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      ...options.headers
    },
    ...options
  })

  const raw = await response.text()
  const data = raw ? (() => {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  })() : null

  if (!response.ok) {
    if (data && typeof data === 'object') {
      throw { ...(data as any), status: response.status }
    }
    throw { message: String(data ?? response.statusText ?? 'Error'), status: response.status }
  }

  return data 
}
