export type DevelopmentRequestStatus =
  | 'REGISTERED'
  | 'IN_ANALYSIS'
  | 'APPROVED'
  | 'IN_DEVELOPMENT'
  | 'IN_TESTING'
  | 'COMPLETED'
  | 'REJECTED'

export type DevelopmentRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface DevelopmentRequest {
  id: number
  code: string
  title: string
  description: string
  requester: string
  area: string
  priority: DevelopmentRequestPriority
  status: DevelopmentRequestStatus
  estimatedHours: number
  assignedTo: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateDevelopmentRequestPayload {
  title: string
  description: string
  requester: string
  area: string
  priority: DevelopmentRequestPriority
  estimatedHours: number
}

export interface UpdateDevelopmentRequestPayload {
  title?: string
  description?: string
  requester?: string
  area?: string
  priority?: DevelopmentRequestPriority
  status?: DevelopmentRequestStatus
  estimatedHours?: number
  assignedTo?: string[]
}

const STORAGE_KEY = 'sistemas-ti:developments:v1'

const INITIAL_REQUESTS: DevelopmentRequest[] = [
  {
    id: 1,
    code: 'DEV-900',
    title: 'Integracion de aprobacion de compras',
    description: 'Automatizar flujo de aprobacion para ordenes mayores a 5000 PEN.',
    requester: 'Ana Ruiz',
    area: 'Finanzas',
    priority: 'HIGH',
    status: 'IN_ANALYSIS',
    estimatedHours: 40,
    assignedTo: ['Marco Rivas'],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-29T16:20:00.000Z',
  },
  {
    id: 2,
    code: 'DEV-901',
    title: 'Nuevo reporte de productividad',
    description: 'Reporte consolidado por area con filtro semanal.',
    requester: 'Carlos Pineda',
    area: 'Operaciones',
    priority: 'MEDIUM',
    status: 'APPROVED',
    estimatedHours: 24,
    assignedTo: ['Luis Torres'],
    createdAt: '2026-03-11T09:20:00.000Z',
    updatedAt: '2026-03-22T18:00:00.000Z',
  },
  {
    id: 3,
    code: 'DEV-902',
    title: 'Single Sign-On interno',
    description: 'Unificar autenticacion para ERP, BI y portal interno.',
    requester: 'Rosa Medina',
    area: 'Sistemas TI',
    priority: 'URGENT',
    status: 'IN_DEVELOPMENT',
    estimatedHours: 72,
    assignedTo: ['Luis Torres', 'Marco Rivas'],
    createdAt: '2026-02-25T14:00:00.000Z',
    updatedAt: '2026-03-30T09:45:00.000Z',
  },
  {
    id: 4,
    code: 'DEV-903',
    title: 'Mejora de exportacion excel',
    description: 'Agregar formato corporativo y multi-hoja.',
    requester: 'Maria Rojas',
    area: 'RRHH',
    priority: 'LOW',
    status: 'COMPLETED',
    estimatedHours: 12,
    assignedTo: ['Rosa Medina'],
    createdAt: '2026-02-02T11:15:00.000Z',
    updatedAt: '2026-03-05T10:10:00.000Z',
  },
]

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const readRequests = (): DevelopmentRequest[] => {
  if (import.meta.server) {
    return clone(INITIAL_REQUESTS)
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS))
    return clone(INITIAL_REQUESTS)
  }

  try {
    const parsed = JSON.parse(raw) as DevelopmentRequest[]
    if (!Array.isArray(parsed)) {
      return clone(INITIAL_REQUESTS)
    }
    return parsed
  } catch {
    return clone(INITIAL_REQUESTS)
  }
}

const saveRequests = (requests: DevelopmentRequest[]) => {
  if (import.meta.server) {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

const generateCode = (requests: DevelopmentRequest[]): string => {
  const maxCode = requests.reduce((max, request) => {
    const numeric = Number(request.code.replace(/\D/g, ''))
    if (Number.isNaN(numeric)) {
      return max
    }
    return Math.max(max, numeric)
  }, 899)

  return `DEV-${maxCode + 1}`
}

export async function listDevelopmentRequests(): Promise<DevelopmentRequest[]> {
  const requests = readRequests()
  requests.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return requests
}

export async function createDevelopmentRequest(
  payload: CreateDevelopmentRequestPayload,
): Promise<DevelopmentRequest> {
  const requests = readRequests()
  const now = new Date().toISOString()
  const nextId = requests.length ? Math.max(...requests.map(request => request.id)) + 1 : 1

  const request: DevelopmentRequest = {
    id: nextId,
    code: generateCode(requests),
    title: payload.title.trim(),
    description: payload.description.trim(),
    requester: payload.requester.trim(),
    area: payload.area.trim(),
    priority: payload.priority,
    status: 'REGISTERED',
    estimatedHours: payload.estimatedHours,
    assignedTo: [],
    createdAt: now,
    updatedAt: now,
  }

  requests.unshift(request)
  saveRequests(requests)

  return request
}

export async function updateDevelopmentRequest(
  id: number,
  payload: UpdateDevelopmentRequestPayload,
): Promise<DevelopmentRequest> {
  const requests = readRequests()
  const index = requests.findIndex(request => request.id === id)
  if (index === -1) {
    throw new Error('Requerimiento no encontrado.')
  }

  const current = requests[index]
  if (!current) {
    throw new Error('Requerimiento no encontrado.')
  }

  const updated: DevelopmentRequest = {
    id: current.id,
    code: current.code,
    title: payload.title !== undefined ? payload.title.trim() : current.title,
    description: payload.description !== undefined ? payload.description.trim() : current.description,
    requester: payload.requester !== undefined ? payload.requester.trim() : current.requester,
    area: payload.area !== undefined ? payload.area.trim() : current.area,
    priority: payload.priority ?? current.priority,
    status: payload.status ?? current.status,
    estimatedHours: payload.estimatedHours ?? current.estimatedHours,
    assignedTo: payload.assignedTo ?? current.assignedTo,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }

  requests[index] = updated
  saveRequests(requests)

  return updated
}

export async function changeDevelopmentStatus(
  id: number,
  status: DevelopmentRequestStatus,
): Promise<DevelopmentRequest> {
  return updateDevelopmentRequest(id, { status })
}

export async function deleteDevelopmentRequest(id: number): Promise<void> {
  const requests = readRequests()
  const next = requests.filter(request => request.id !== id)
  if (next.length === requests.length) {
    throw new Error('Requerimiento no encontrado.')
  }

  saveRequests(next)
}

export const developmentStatusOptions = [
  { label: 'Registrado', value: 'REGISTERED' as const },
  { label: 'En analisis', value: 'IN_ANALYSIS' as const },
  { label: 'Aprobado', value: 'APPROVED' as const },
  { label: 'En desarrollo', value: 'IN_DEVELOPMENT' as const },
  { label: 'En QA', value: 'IN_TESTING' as const },
  { label: 'Completado', value: 'COMPLETED' as const },
  { label: 'Rechazado', value: 'REJECTED' as const },
]

export const developmentPriorityOptions = [
  { label: 'Baja', value: 'LOW' as const },
  { label: 'Media', value: 'MEDIUM' as const },
  { label: 'Alta', value: 'HIGH' as const },
  { label: 'Urgente', value: 'URGENT' as const },
]

