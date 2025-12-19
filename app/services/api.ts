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

  const data = await response.json() 

  if (!response.ok) {
    throw data
  }

  return data 
}
