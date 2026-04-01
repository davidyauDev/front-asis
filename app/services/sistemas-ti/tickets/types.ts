export type SystemTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED'
export type SystemTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type SystemTicketType = 'INCIDENT' | 'SERVICE_REQUEST'
export type SystemTicketCategory = 'SOFTWARE' | 'ACCESS' | 'EQUIPMENT'
export type SystemTicketImpact = 'LOW' | 'MEDIUM' | 'HIGH'
export type SystemTicketUrgency = 'LOW' | 'MEDIUM' | 'HIGH'

export type TicketHistoryType =
  | 'TICKET_CREATED'
  | 'COMMENT'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'ASSET_LINKED'
  | 'SLA_EVENT'

export interface SystemTicketAssetLink {
  id: number
  name: string
  type: string
  serial: string
  status: string
  linkedBy: string
  linkedAt: string
}

export interface SystemTicketHistory {
  id: number
  ticketId: number
  type: TicketHistoryType
  title: string
  description: string
  actor: string
  createdAt: string
}

export interface SystemTicket {
  id: number
  code: string
  title: string
  description: string
  requester: string
  area: string
  category: SystemTicketCategory
  type: SystemTicketType
  impact: SystemTicketImpact
  urgency: SystemTicketUrgency
  priority: SystemTicketPriority
  status: SystemTicketStatus
  responsible: string | null
  slaResponseDueAt: string
  slaResolutionDueAt: string
  firstResponseAt: string | null
  resolvedAt: string | null
  closedAt: string | null
  slaRemainingHours: number
  createdAt: string
  updatedAt: string
  images: string[]
  histories: SystemTicketHistory[]
  linkedAssets: SystemTicketAssetLink[]
}

export interface CreateSystemTicketPayload {
  title: string
  description: string
  requester: string
  area: string
  category: SystemTicketCategory
  type: SystemTicketType
  impact: SystemTicketImpact
  urgency: SystemTicketUrgency
  priority: SystemTicketPriority
  images?: string[]
}

export interface UpdateSystemTicketPayload {
  title?: string
  description?: string
  requester?: string
  area?: string
  category?: SystemTicketCategory
  type?: SystemTicketType
  impact?: SystemTicketImpact
  urgency?: SystemTicketUrgency
  priority?: SystemTicketPriority
  status?: SystemTicketStatus
  responsible?: string | null
  firstResponseAt?: string | null
  resolvedAt?: string | null
  closedAt?: string | null
  images?: string[]
}

export interface SlaPolicy {
  priority: SystemTicketPriority
  label: string
  responseTimeMinutes: number
  resolutionTimeMinutes: number
}

export interface TicketDeskMetric {
  label: string
  value: string
  tone: string
  icon: string
}

export interface TicketKnowledgeItem {
  title: string
  type: string
}

export interface TicketDeskAsset {
  name: string
  type: string
  serial: string
  status: string
}
