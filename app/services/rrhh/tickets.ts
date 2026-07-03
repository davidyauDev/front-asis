export type TicketType = 'INCIDENT' | 'SERVICE_REQUEST'
export type TicketImpact = 'LOW' | 'MEDIUM' | 'HIGH'
export type TicketUrgency = 'LOW' | 'MEDIUM' | 'HIGH'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED'
export type TicketCategory = 'ACCESS' | 'SOFTWARE' | 'EQUIPMENT'

export interface TicketDepartment {
  id?: number | null
  name?: string | null
}

export interface TicketPerson {
  staff_id: number
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  department?: TicketDepartment | null
}

export interface TicketRecord {
  id: number
  title: string
  description: string
  status: TicketStatus
  impact: TicketImpact
  urgency: TicketUrgency
  priority: TicketPriority
  type: TicketType
  category?: TicketCategory | null
  requester_id: number
  responsible_id?: number | null
  images?: Array<Record<string, unknown>>
  images_urls?: string[]
  requester?: TicketPerson | null
  responsible?: TicketPerson | null
  created_at?: string | null
  updated_at?: string | null
}

export interface TicketListMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface TicketListResponse {
  data: TicketRecord[]
  meta?: TicketListMeta
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  message?: string
  error?: string
}

export interface TicketResponse {
  data: TicketRecord
  message?: string
  error?: string
}

export interface TicketFilterParams {
  searchTerm?: string
  requesters?: Array<number | string>
  responsibles?: Array<number | string>
  statuses?: TicketStatus[]
  types?: TicketType[]
  priorities?: TicketPriority[]
  categories?: TicketCategory[]
  startDate?: string
  endDate?: string
  page?: number
}

export interface UpsertTicketPayload {
  title: string
  description: string
  type: TicketType
  impact: TicketImpact
  urgency: TicketUrgency
  category?: TicketCategory | null
  requesterId: number
  images?: File[]
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

const appendArray = (searchParams: URLSearchParams, key: string, values?: Array<number | string>) => {
  if (!values?.length) {
    return
  }

  for (const value of values) {
    if (value === undefined || value === null || value === '') continue
    searchParams.append(`${key}[]`, String(value))
  }
}

const buildQuery = (params: TicketFilterParams = {}) => {
  const searchParams = new URLSearchParams()

  if (params.searchTerm?.trim()) {
    searchParams.set('searchTerm', params.searchTerm.trim())
  }

  appendArray(searchParams, 'requesters', params.requesters)
  appendArray(searchParams, 'responsibles', params.responsibles)
  appendArray(searchParams, 'statuses', params.statuses)
  appendArray(searchParams, 'types', params.types)
  appendArray(searchParams, 'priorities', params.priorities)
  appendArray(searchParams, 'categories', params.categories)

  if (params.startDate) {
    searchParams.set('startDate', params.startDate)
  }

  if (params.endDate) {
    searchParams.set('endDate', params.endDate)
  }

  if (params.page !== undefined) {
    searchParams.set('page', String(params.page))
  }

  return searchParams.toString()
}

export const listTickets = async (params: TicketFilterParams = {}): Promise<TicketListResponse> => {
  const query = buildQuery(params)
  const endpoint = query ? `/api/rrhh/tickets?${query}` : '/api/rrhh/tickets'
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  })

  return parseResponse<TicketListResponse>(response)
}

export const listAllTickets = async (params: TicketFilterParams = {}): Promise<TicketRecord[]> => {
  const firstPage = await listTickets({ ...params, page: params.page ?? 1 })
  const lastPage = firstPage.meta?.last_page ?? 1

  if (lastPage <= 1) {
    return firstPage.data
  }

  const otherPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => listTickets({ ...params, page: index + 2 })),
  )

  return [
    ...firstPage.data,
    ...otherPages.flatMap(response => response.data),
  ]
}

export const getTicket = async (ticketId: number | string): Promise<TicketRecord> => {
  const response = await fetch(`/api/rrhh/tickets/${ticketId}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await parseResponse<TicketResponse>(response)
  return payload.data
}

const buildUpsertBody = (payload: UpsertTicketPayload) => {
  const body = {
    title: payload.title,
    description: payload.description,
    type: payload.type,
    impact: payload.impact,
    urgency: payload.urgency,
    category: payload.type === 'SERVICE_REQUEST' ? (payload.category ?? null) : null,
    requester_id: payload.requesterId,
  }

  return body
}

const buildUpsertFormData = (payload: UpsertTicketPayload) => {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('type', payload.type)
  formData.append('impact', payload.impact)
  formData.append('urgency', payload.urgency)
  formData.append('requester_id', String(payload.requesterId))

  if (payload.type === 'SERVICE_REQUEST' && payload.category) {
    formData.append('category', payload.category)
  }

  for (const image of payload.images ?? []) {
    formData.append('images[]', image)
  }

  return formData
}

export const createTicket = async (payload: UpsertTicketPayload): Promise<TicketResponse> => {
  const hasImages = Boolean(payload.images?.length)

  const response = await fetch('/api/rrhh/tickets', {
    method: 'POST',
    headers: hasImages
      ? { Accept: 'application/json' }
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
    body: hasImages
      ? buildUpsertFormData(payload)
      : JSON.stringify(buildUpsertBody(payload)),
  })

  return parseResponse<TicketResponse>(response)
}

export const updateTicket = async (ticketId: number | string, payload: UpsertTicketPayload): Promise<TicketResponse> => {
  const hasImages = Boolean(payload.images?.length)

  const response = await fetch(`/api/rrhh/tickets/${ticketId}`, {
    method: 'PUT',
    headers: hasImages
      ? { Accept: 'application/json' }
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
    body: hasImages
      ? buildUpsertFormData(payload)
      : JSON.stringify(buildUpsertBody(payload)),
  })

  return parseResponse<TicketResponse>(response)
}

export const closeTicket = async (ticketId: number | string): Promise<TicketResponse> => {
  const response = await fetch(`/api/rrhh/tickets/${ticketId}/close`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  })

  return parseResponse<TicketResponse>(response)
}

export const deleteTicket = async (ticketId: number | string): Promise<{ message?: string; error?: string }> => {
  const response = await fetch(`/api/rrhh/tickets/${ticketId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  return parseResponse<{ message?: string; error?: string }>(response)
}
