export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'PROVISIONED' | 'REJECTED'
export type AccessServiceType = 'ERP' | 'EMAIL' | 'VPN' | 'BI' | 'CRM' | 'OTHER'

export interface AccessRequest {
  id: number
  code: string
  serviceName: string
  serviceType: AccessServiceType
  requester: string
  area: string
  owner: string | null
  status: AccessRequestStatus
  expiresAt: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CreateAccessRequestPayload {
  serviceName: string
  serviceType: AccessServiceType
  requester: string
  area: string
  owner?: string | null
  expiresAt?: string | null
  notes?: string
}

export interface UpdateAccessRequestPayload {
  serviceName?: string
  serviceType?: AccessServiceType
  requester?: string
  area?: string
  owner?: string | null
  status?: AccessRequestStatus
  expiresAt?: string | null
  notes?: string
}

const STORAGE_KEY = 'sistemas-ti:access:v1'

const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: 1,
    code: 'ACC-501',
    serviceName: 'SAP ERP',
    serviceType: 'ERP',
    requester: 'Carlos Pineda',
    area: 'Warehouse',
    owner: 'Rosa Medina',
    status: 'PROVISIONED',
    expiresAt: null,
    notes: 'Alta por cambio de sede.',
    createdAt: '2026-03-18T10:05:00.000Z',
    updatedAt: '2026-03-19T11:20:00.000Z',
  },
  {
    id: 2,
    code: 'ACC-502',
    serviceName: 'VPN corporativa',
    serviceType: 'VPN',
    requester: 'Ana Ruiz',
    area: 'Management',
    owner: 'Luis Torres',
    status: 'APPROVED',
    expiresAt: '2026-12-31',
    notes: 'Acceso temporal para auditoria.',
    createdAt: '2026-03-24T13:40:00.000Z',
    updatedAt: '2026-03-24T16:55:00.000Z',
  },
  {
    id: 3,
    code: 'ACC-503',
    serviceName: 'Correo corporativo',
    serviceType: 'EMAIL',
    requester: 'Martin Soto',
    area: 'Operaciones',
    owner: null,
    status: 'PENDING',
    expiresAt: null,
    notes: 'Nuevo ingreso.',
    createdAt: '2026-03-29T08:45:00.000Z',
    updatedAt: '2026-03-29T08:45:00.000Z',
  },
]

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const readRequests = (): AccessRequest[] => {
  if (import.meta.server) {
    return clone(INITIAL_REQUESTS)
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS))
    return clone(INITIAL_REQUESTS)
  }

  try {
    const parsed = JSON.parse(raw) as AccessRequest[]
    if (!Array.isArray(parsed)) {
      return clone(INITIAL_REQUESTS)
    }

    return parsed
  } catch {
    return clone(INITIAL_REQUESTS)
  }
}

const saveRequests = (requests: AccessRequest[]) => {
  if (import.meta.server) {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

const generateCode = (requests: AccessRequest[]): string => {
  const maxCode = requests.reduce((max, request) => {
    const numeric = Number(request.code.replace(/\D/g, ''))
    if (Number.isNaN(numeric)) {
      return max
    }

    return Math.max(max, numeric)
  }, 500)

  return `ACC-${maxCode + 1}`
}

export async function listAccessRequests(): Promise<AccessRequest[]> {
  const requests = readRequests()
  requests.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return requests
}

export async function createAccessRequest(payload: CreateAccessRequestPayload): Promise<AccessRequest> {
  const requests = readRequests()
  const now = new Date().toISOString()
  const nextId = requests.length ? Math.max(...requests.map(request => request.id)) + 1 : 1

  const request: AccessRequest = {
    id: nextId,
    code: generateCode(requests),
    serviceName: payload.serviceName.trim(),
    serviceType: payload.serviceType,
    requester: payload.requester.trim(),
    area: payload.area.trim(),
    owner: payload.owner?.trim() || null,
    status: payload.owner?.trim() ? 'APPROVED' : 'PENDING',
    expiresAt: payload.expiresAt ?? null,
    notes: payload.notes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  }

  requests.unshift(request)
  saveRequests(requests)

  return request
}

export async function updateAccessRequest(id: number, payload: UpdateAccessRequestPayload): Promise<AccessRequest> {
  const requests = readRequests()
  const index = requests.findIndex(request => request.id === id)
  if (index === -1) {
    throw new Error('Solicitud no encontrada.')
  }

  const current = requests[index]
  if (!current) {
    throw new Error('Solicitud no encontrada.')
  }

  const updated: AccessRequest = {
    id: current.id,
    code: current.code,
    serviceName: payload.serviceName !== undefined ? payload.serviceName.trim() : current.serviceName,
    serviceType: payload.serviceType ?? current.serviceType,
    requester: payload.requester !== undefined ? payload.requester.trim() : current.requester,
    area: payload.area !== undefined ? payload.area.trim() : current.area,
    owner: payload.owner === undefined ? current.owner : payload.owner?.trim() || null,
    status: payload.status ?? current.status,
    expiresAt: payload.expiresAt === undefined ? current.expiresAt : payload.expiresAt,
    notes: payload.notes === undefined ? current.notes : payload.notes.trim(),
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }

  requests[index] = updated
  saveRequests(requests)

  return updated
}

export async function changeAccessRequestStatus(id: number, status: AccessRequestStatus): Promise<AccessRequest> {
  return updateAccessRequest(id, { status })
}

export const accessRequestStatusOptions = [
  { label: 'Pendiente', value: 'PENDING' as const },
  { label: 'Aprobado', value: 'APPROVED' as const },
  { label: 'Provisionado', value: 'PROVISIONED' as const },
  { label: 'Rechazado', value: 'REJECTED' as const },
]

export const accessServiceTypeOptions = [
  { label: 'ERP', value: 'ERP' as const },
  { label: 'Correo', value: 'EMAIL' as const },
  { label: 'VPN', value: 'VPN' as const },
  { label: 'BI', value: 'BI' as const },
  { label: 'CRM', value: 'CRM' as const },
  { label: 'Otro', value: 'OTHER' as const },
]

