import type {
  CreateSystemTicketPayload,
  SystemTicket,
  TicketDeskAsset,
  TicketDeskMetric,
  TicketKnowledgeItem,
} from './types'
import { MOCK_ASSETS, MOCK_KNOWLEDGE_ITEMS, MOCK_TECHNICIANS } from './mock-data'
import { addSystemTicketHistory, assignSystemTicket, changeSystemTicketStatus, createSystemTicket, linkSystemTicketAsset, updateSystemTicket } from './matrix'

export type TicketDeskRole = 'user' | 'technician' | 'admin'

export const ticketDeskRoleOptions: Array<{ label: string, value: TicketDeskRole }> = [
  { label: 'Usuario final', value: 'user' },
  { label: 'Tecnico TI', value: 'technician' },
  { label: 'Admin TI', value: 'admin' },
]

const safeDivision = (value: number, base: number) => {
  if (!base) {
    return 0
  }

  return Number(((value / base) * 100).toFixed(1))
}

const toHoursAndMinutes = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '0h 00m'
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours}h ${String(mins).padStart(2, '0')}m`
}

const diffMinutes = (fromIso: string, toIso: string) => {
  const from = new Date(fromIso).getTime()
  const to = new Date(toIso).getTime()

  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return 0
  }

  return Math.max(0, Math.round((to - from) / (1000 * 60)))
}

export const buildDeskMetrics = (tickets: SystemTicket[]): TicketDeskMetric[] => {
  const opened = tickets.filter(ticket => ticket.status === 'OPEN').length
  const breached = tickets.filter(ticket => ticket.slaRemainingHours <= 0 && ticket.status !== 'CLOSED').length
  const escalated = tickets.filter(ticket => ticket.histories.some(history => history.type === 'ESCALATED')).length

  const resolvedTickets = tickets.filter(ticket => ticket.resolvedAt)
  const totalResolutionMinutes = resolvedTickets.reduce((sum, ticket) => {
    if (!ticket.resolvedAt) {
      return sum
    }
    return sum + diffMinutes(ticket.createdAt, ticket.resolvedAt)
  }, 0)
  const averageResolutionMinutes = resolvedTickets.length
    ? Math.round(totalResolutionMinutes / resolvedTickets.length)
    : 0

  return [
    {
      label: 'Tickets abiertos',
      value: String(opened),
      icon: 'i-lucide-clock-3',
      tone: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'SLA violado',
      value: String(breached),
      icon: 'i-lucide-triangle-alert',
      tone: 'bg-red-500/10 text-red-600',
    },
    {
      label: 'Tiempo medio de resolucion',
      value: toHoursAndMinutes(averageResolutionMinutes),
      icon: 'i-lucide-timer',
      tone: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'Escalados',
      value: String(escalated),
      icon: 'i-lucide-arrow-up-right',
      tone: 'bg-violet-500/10 text-violet-600',
    },
  ]
}

export const buildSupervisorSummary = (tickets: SystemTicket[]) => {
  const total = tickets.length
  const withinSla = tickets.filter(ticket => ticket.slaRemainingHours > 0 || ticket.status === 'CLOSED').length
  const compliance = safeDivision(withinSla, total)

  const escalationsByArea = tickets.reduce<Record<string, number>>((acc, ticket) => {
    const escalated = ticket.histories.some(history => history.type === 'ESCALATED')
    if (!escalated) {
      return acc
    }

    acc[ticket.area] = (acc[ticket.area] || 0) + 1
    return acc
  }, {})

  const workload = tickets.reduce<Record<string, number>>((acc, ticket) => {
    if (!ticket.responsible) {
      return acc
    }

    acc[ticket.responsible] = (acc[ticket.responsible] || 0) + 1
    return acc
  }, {})

  const volumeByArea = tickets.reduce<Record<string, number>>((acc, ticket) => {
    acc[ticket.area] = (acc[ticket.area] || 0) + 1
    return acc
  }, {})

  return {
    compliance,
    escalationsByArea,
    workload,
    volumeByArea,
  }
}

export const listDeskAssets = (): TicketDeskAsset[] => {
  return [...MOCK_ASSETS]
}

export const listDeskKnowledge = (): TicketKnowledgeItem[] => {
  return [...MOCK_KNOWLEDGE_ITEMS]
}

export const listDeskTechnicians = (): string[] => {
  return [...MOCK_TECHNICIANS]
}

export async function createDeskTicket(payload: CreateSystemTicketPayload): Promise<SystemTicket> {
  return createSystemTicket(payload)
}

export async function assignTicketToTechnician(ticketId: number, technician: string): Promise<SystemTicket> {
  return assignSystemTicket(ticketId, technician)
}

export async function startTicketWork(ticketId: number, actor: string): Promise<SystemTicket> {
  await updateSystemTicket(ticketId, {
    responsible: actor,
    status: 'IN_PROGRESS',
    firstResponseAt: new Date().toISOString(),
  })

  return addSystemTicketHistory(ticketId, {
    type: 'STATUS_CHANGED',
    title: 'Estado cambiado a En progreso',
    description: 'Se inicio el trabajo del ticket.',
    actor,
  })
}

export async function putTicketOnHold(
  ticketId: number,
  actor: string,
  reason: string,
  waitingFor: 'USER' | 'PROVIDER',
): Promise<SystemTicket> {
  await changeSystemTicketStatus(ticketId, 'ON_HOLD')

  return addSystemTicketHistory(ticketId, {
    type: 'STATUS_CHANGED',
    title: waitingFor === 'USER' ? 'Esperando usuario' : 'Esperando proveedor',
    description: reason,
    actor,
  })
}

export async function escalateTicket(ticketId: number, actor: string, reason: string): Promise<SystemTicket> {
  await changeSystemTicketStatus(ticketId, 'ON_HOLD')

  return addSystemTicketHistory(ticketId, {
    type: 'ESCALATED',
    title: 'Ticket escalado',
    description: reason,
    actor,
  })
}

export async function resolveTicket(ticketId: number, actor: string, solution: string): Promise<SystemTicket> {
  await updateSystemTicket(ticketId, {
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
  })

  return addSystemTicketHistory(ticketId, {
    type: 'RESOLVED',
    title: 'Ticket resuelto',
    description: solution,
    actor,
  })
}

export async function closeTicket(ticketId: number, actor: string, note: string): Promise<SystemTicket> {
  await updateSystemTicket(ticketId, {
    status: 'CLOSED',
    closedAt: new Date().toISOString(),
  })

  return addSystemTicketHistory(ticketId, {
    type: 'CLOSED',
    title: 'Ticket cerrado',
    description: note,
    actor,
  })
}

export async function reopenTicket(ticketId: number, actor: string, reason: string): Promise<SystemTicket> {
  await updateSystemTicket(ticketId, {
    status: 'IN_PROGRESS',
    closedAt: null,
  })

  return addSystemTicketHistory(ticketId, {
    type: 'REOPENED',
    title: 'Ticket reabierto',
    description: reason,
    actor,
  })
}

export async function addTicketComment(ticketId: number, actor: string, comment: string): Promise<SystemTicket> {
  return addSystemTicketHistory(ticketId, {
    type: 'COMMENT',
    title: `Comentario de ${actor}`,
    description: comment,
    actor,
  })
}

export async function linkTicketAsset(
  ticketId: number,
  actor: string,
  asset: {
    name: string
    type: string
    serial: string
    status: string
  },
): Promise<SystemTicket> {
  const ticket = await linkSystemTicketAsset(ticketId, {
    ...asset,
    linkedBy: actor,
  })

  if (ticket.status === 'OPEN') {
    await updateSystemTicket(ticketId, {
      status: 'IN_PROGRESS',
      firstResponseAt: new Date().toISOString(),
      responsible: ticket.responsible ?? actor,
    })
  }

  return addSystemTicketHistory(ticketId, {
    type: 'ASSET_LINKED',
    title: 'Activo vinculado',
    description: `${asset.name} (${asset.serial})`,
    actor,
  })
}
