export type DevelopmentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface DevelopmentRequestArea {
  id_area: number
  descripcion_area: string
}

export interface DevelopmentRequestRequestedBy {
  staff_id: number
  firstname?: string | null
  lastname?: string | null
}

export interface DevelopmentRequestRecord {
  id: number
  title: string
  priority: DevelopmentPriority
  status: string
  position?: number | null
  description: string
  impact?: string | null
  estimated_hours?: number | null
  estimated_end_date?: string | null
  area_id: number
  requested_by_id: number
  requirement_path?: string | null
  requirement_url?: string | null
  area?: DevelopmentRequestArea | null
  requested_by?: DevelopmentRequestRequestedBy | null
}

export interface DevelopmentRequestResponse {
  message?: string
  data: DevelopmentRequestRecord
}

export interface DevelopmentRequestListItem extends DevelopmentRequestRecord {
  created_at?: string | null
  updated_at?: string | null
  technical_approval?: Record<string, unknown> | null
  strategic_approval?: Record<string, unknown> | null
  latest_progress?: Record<string, unknown> | null
  developers?: Array<{
    staff_id?: number
    firstname?: string | null
    lastname?: string | null
  }>
}

export interface DevelopmentRequestSectionsResponse {
  data: Record<string, DevelopmentRequestListItem[]>
  message?: string
}

export interface ListDevelopmentRequestsParams {
  requestedById?: number | string
}

export interface CreateDevelopmentRequestPayload {
  title: string
  areaId: number
  description: string
  impact?: string
  priority: DevelopmentPriority
  requestedById: number
  attachment?: File | null
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  const raw = await response.text()
  const data = raw
    ? (() => {
        try {
          return JSON.parse(raw)
        } catch {
          return raw
        }
      })()
    : null

  if (!response.ok) {
    if (data && typeof data === 'object') {
      throw { ...(data as Record<string, unknown>), status: response.status }
    }

    throw {
      message: String(data ?? response.statusText ?? 'Error'),
      status: response.status,
    }
  }

  return data as T
}

export const createDevelopmentRequest = async (
  payload: CreateDevelopmentRequestPayload,
): Promise<DevelopmentRequestResponse> => {
  const hasAttachment = Boolean(payload.attachment)

  if (hasAttachment) {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('priority', payload.priority)
    formData.append('description', payload.description)
    formData.append('impact', payload.impact?.trim() || '')
    formData.append('area_id', String(payload.areaId))
    formData.append('requested_by_id', String(payload.requestedById))

    if (payload.attachment) {
      formData.append('requirement_file', payload.attachment)
    }

    const response = await fetch('/api/rrhh/development-requests', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })

    return parseResponse<DevelopmentRequestResponse>(response)
  }

  const response = await fetch('/api/rrhh/development-requests', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title,
      priority: payload.priority,
      description: payload.description,
      impact: payload.impact?.trim() || undefined,
      area_id: payload.areaId,
      requested_by_id: payload.requestedById,
    }),
  })

  return parseResponse<DevelopmentRequestResponse>(response)
}

export const listDevelopmentRequests = async (
  params: ListDevelopmentRequestsParams = {},
): Promise<DevelopmentRequestSectionsResponse> => {
  const query = new URLSearchParams()

  if (params.requestedById !== undefined && params.requestedById !== '') {
    query.set('requested_by_id', String(params.requestedById))
  }

  const queryString = query.toString()
  const endpoint = queryString
    ? `/api/rrhh/development-requests?${queryString}`
    : '/api/rrhh/development-requests'

  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  })

  return parseResponse<DevelopmentRequestSectionsResponse>(response)
}
