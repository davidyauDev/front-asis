import { createError, getQuery, getRequestHeader, readBody, readMultipartFormData, setResponseStatus, type H3Event } from 'h3'

type ProxyMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const parseJson = (raw: string) => {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const resolveTicketsConfig = () => {
  const config = useRuntimeConfig()
  const apiKey = config.accessApi?.trim()

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ACCESS_API no esta configurado en el servidor.',
    })
  }

  const upstreamBaseUrl = config.developmentRequestsApiBaseUrl?.trim() || 'https://sistemas-ti.cechriza.com/api'

  return {
    apiKey,
    upstreamBaseUrl: upstreamBaseUrl.replace(/\/$/, ''),
  }
}

const toQueryString = (event: H3Event) => {
  const query = getQuery(event)
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item))
      }
      continue
    }

    searchParams.set(key, String(value))
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

const finalizeResponse = async (event: H3Event, response: Response) => {
  const raw = await response.text()
  const data = raw ? parseJson(raw) : null
  setResponseStatus(event, response.status)
  return data
}

export const proxyTicketsGet = async (event: H3Event, endpoint: string) => {
  const { apiKey, upstreamBaseUrl } = resolveTicketsConfig()
  const response = await fetch(`${upstreamBaseUrl}${endpoint}${toQueryString(event)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-API-Key': apiKey,
    },
  })

  return finalizeResponse(event, response)
}

export const proxyTicketsNoBody = async (event: H3Event, endpoint: string, method: ProxyMethod) => {
  const { apiKey, upstreamBaseUrl } = resolveTicketsConfig()
  const response = await fetch(`${upstreamBaseUrl}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/json',
      'X-API-Key': apiKey,
    },
  })

  return finalizeResponse(event, response)
}

export const proxyTicketsJsonOrMultipart = async (event: H3Event, endpoint: string, method: 'POST' | 'PUT') => {
  const { apiKey, upstreamBaseUrl } = resolveTicketsConfig()
  const upstreamUrl = `${upstreamBaseUrl}${endpoint}`
  const contentType = getRequestHeader(event, 'content-type') || ''

  let response: Response

  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)

    if (!parts) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se recibio informacion valida para procesar el ticket.',
      })
    }

    const formData = new FormData()

    for (const part of parts) {
      if (!part.name) continue

      if (part.filename) {
        const file = new Blob([part.data], {
          type: part.type || 'application/octet-stream',
        })
        formData.append(part.name, file, part.filename)
        continue
      }

      formData.append(part.name, part.data.toString('utf8'))
    }

    response = await fetch(upstreamUrl, {
      method,
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey,
      },
      body: formData,
    })
  } else {
    const body = await readBody(event)

    response = await fetch(upstreamUrl, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body ?? {}),
    })
  }

  return finalizeResponse(event, response)
}
