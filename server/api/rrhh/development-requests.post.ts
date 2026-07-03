import { createError, getRequestHeader, readBody, readMultipartFormData, setResponseStatus } from 'h3'

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
  const upstreamUrl = `${upstreamBaseUrl.replace(/\/$/, '')}/development-requests`
  const contentType = getRequestHeader(event, 'content-type') || ''

  let response: Response

  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)

    if (!parts) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se recibio informacion valida para crear el requerimiento.',
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
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey,
      },
      body: formData,
    })
  } else {
    const body = await readBody(event)

    response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body ?? {}),
    })
  }

  const raw = await response.text()
  const data = raw ? parseJson(raw) : null

  setResponseStatus(event, response.status)
  return data
})
