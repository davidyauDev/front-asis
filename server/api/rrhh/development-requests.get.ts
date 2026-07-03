import { createError, getQuery, setResponseStatus } from 'h3'

const parseJson = (raw: string) => {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

export default defineEventHandler(async (event) => {
  const apiKey = useRuntimeConfig().accessApi?.trim()
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ACCESS_API no esta configurado en el servidor.',
    })
  }

  const config = useRuntimeConfig()
  const upstreamBaseUrl = config.developmentRequestsApiBaseUrl?.trim() || 'https://sistemas-ti.cechriza.com/api'
  const query = getQuery(event)
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(key, String(item)))
      continue
    }

    searchParams.set(key, String(value))
  }

  const queryString = searchParams.toString()
  const upstreamUrl = `${upstreamBaseUrl.replace(/\/$/, '')}/development-requests${queryString ? `?${queryString}` : ''}`

  const response = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-API-Key': apiKey,
    },
  })

  const raw = await response.text()
  const data = raw ? parseJson(raw) : null

  setResponseStatus(event, response.status)
  return data
})
