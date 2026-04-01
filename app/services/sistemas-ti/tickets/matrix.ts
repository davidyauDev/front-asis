import { differenceInMinutes } from 'date-fns'
import { getSlaPolicyByPriority } from './options'
import { readTickets, saveTickets } from './storage'
import type {
  CreateSystemTicketPayload,
  SystemTicket,
  SystemTicketAssetLink,
  SystemTicketHistory,
  SystemTicketStatus,
  TicketHistoryType,
  UpdateSystemTicketPayload,
} from './types'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const sortByUpdatedAtDesc = (tickets: SystemTicket[]) => {
  return [...tickets].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

const generateTicketCode = (tickets: SystemTicket[]): string => {
  const maxCode = tickets.reduce((max, ticket) => {
    const numeric = Number(ticket.code.replace(/\D/g, ''))
    if (Number.isNaN(numeric)) {
      return max
    }

    return Math.max(max, numeric)
  }, 1000)

  return `TK-${maxCode + 1}`
}

const enrichTicket = (ticket: SystemTicket): SystemTicket => {
  const now = new Date()
  const responseReference = ticket.firstResponseAt ?? now.toISOString()
  const resolutionReference = ticket.resolvedAt ?? ticket.closedAt ?? now.toISOString()

  const responseRemainingMinutes = differenceInMinutes(
    new Date(ticket.slaResponseDueAt),
    new Date(responseReference),
  )
  const resolutionRemainingMinutes = differenceInMinutes(
    new Date(ticket.slaResolutionDueAt),
    new Date(resolutionReference),
  )

  return {
    ...ticket,
    slaRemainingHours: Number((resolutionRemainingMinutes / 60).toFixed(1)),
    histories: [...ticket.histories].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }),
  }
}

const enrichTickets = (tickets: SystemTicket[]) => {
  return sortByUpdatedAtDesc(tickets).map(enrichTicket)
}

const nextHistory = (
  ticket: SystemTicket,
  type: TicketHistoryType,
  title: string,
  description: string,
  actor: string,
): SystemTicketHistory => {
  const maxHistoryId = ticket.histories.reduce((max, item) => Math.max(max, item.id), 0)

  return {
    id: maxHistoryId + 1,
    ticketId: ticket.id,
    type,
    title,
    description,
    actor,
    createdAt: new Date().toISOString(),
  }
}

const withUpdatedAt = (ticket: SystemTicket, update: UpdateSystemTicketPayload): SystemTicket => {
  const nowIso = new Date().toISOString()

  return {
    ...ticket,
    title: update.title !== undefined ? update.title.trim() : ticket.title,
    description: update.description !== undefined ? update.description.trim() : ticket.description,
    requester: update.requester !== undefined ? update.requester.trim() : ticket.requester,
    area: update.area !== undefined ? update.area.trim() : ticket.area,
    category: update.category ?? ticket.category,
    type: update.type ?? ticket.type,
    impact: update.impact ?? ticket.impact,
    urgency: update.urgency ?? ticket.urgency,
    priority: update.priority ?? ticket.priority,
    status: update.status ?? ticket.status,
    responsible: update.responsible === undefined ? ticket.responsible : update.responsible,
    firstResponseAt: update.firstResponseAt === undefined ? ticket.firstResponseAt : update.firstResponseAt,
    resolvedAt: update.resolvedAt === undefined ? ticket.resolvedAt : update.resolvedAt,
    closedAt: update.closedAt === undefined ? ticket.closedAt : update.closedAt,
    images: update.images ?? ticket.images,
    updatedAt: nowIso,
  }
}

const replaceTicket = (ticketId: number, updater: (current: SystemTicket) => SystemTicket): SystemTicket => {
  const tickets = readTickets()
  const index = tickets.findIndex(ticket => ticket.id === ticketId)

  if (index === -1) {
    throw new Error('Ticket no encontrado.')
  }

  const current = tickets[index]
  if (!current) {
    throw new Error('Ticket no encontrado.')
  }

  const next = updater(current)
  tickets[index] = next
  saveTickets(tickets)

  return enrichTicket(next)
}

export async function listSystemTickets(): Promise<SystemTicket[]> {
  await wait(80)
  return enrichTickets(readTickets())
}

export async function getSystemTicketById(ticketId: number): Promise<SystemTicket> {
  await wait(70)
  const ticket = readTickets().find(item => item.id === ticketId)
  if (!ticket) {
    throw new Error('Ticket no encontrado.')
  }

  return enrichTicket(ticket)
}

export async function createSystemTicket(payload: CreateSystemTicketPayload): Promise<SystemTicket> {
  await wait(120)
  const tickets = readTickets()
  const now = new Date()
  const nowIso = now.toISOString()
  const nextId = tickets.length ? Math.max(...tickets.map(ticket => ticket.id)) + 1 : 1
  const code = generateTicketCode(tickets)
  const policy = getSlaPolicyByPriority(payload.priority)

  const ticket: SystemTicket = {
    id: nextId,
    code,
    title: payload.title.trim(),
    description: payload.description.trim(),
    requester: payload.requester.trim(),
    area: payload.area.trim(),
    category: payload.category,
    type: payload.type,
    impact: payload.impact,
    urgency: payload.urgency,
    priority: payload.priority,
    status: 'OPEN',
    responsible: null,
    slaResponseDueAt: new Date(now.getTime() + (policy.responseTimeMinutes * 60 * 1000)).toISOString(),
    slaResolutionDueAt: new Date(now.getTime() + (policy.resolutionTimeMinutes * 60 * 1000)).toISOString(),
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    slaRemainingHours: Number((policy.resolutionTimeMinutes / 60).toFixed(1)),
    createdAt: nowIso,
    updatedAt: nowIso,
    images: payload.images ?? [],
    histories: [
      {
        id: 1,
        ticketId: nextId,
        type: 'TICKET_CREATED',
        title: 'Ticket creado',
        description: 'Ticket generado desde la matriz de Sistemas TI.',
        actor: payload.requester.trim(),
        createdAt: nowIso,
      },
    ],
    linkedAssets: [],
  }

  tickets.unshift(ticket)
  saveTickets(tickets)

  return enrichTicket(ticket)
}

export async function updateSystemTicket(
  id: number,
  payload: UpdateSystemTicketPayload,
): Promise<SystemTicket> {
  await wait(90)

  return replaceTicket(id, (current) => {
    return withUpdatedAt(current, payload)
  })
}

export async function deleteSystemTicket(id: number): Promise<void> {
  await wait(70)
  const tickets = readTickets()
  const next = tickets.filter(ticket => ticket.id !== id)
  if (next.length === tickets.length) {
    throw new Error('Ticket no encontrado.')
  }

  saveTickets(next)
}

export async function addSystemTicketHistory(
  ticketId: number,
  historyInput: Pick<SystemTicketHistory, 'type' | 'title' | 'description' | 'actor'>,
): Promise<SystemTicket> {
  await wait(70)

  return replaceTicket(ticketId, (current) => {
    const historyEntry = nextHistory(
      current,
      historyInput.type,
      historyInput.title,
      historyInput.description,
      historyInput.actor,
    )

    return {
      ...current,
      histories: [historyEntry, ...current.histories],
      updatedAt: new Date().toISOString(),
    }
  })
}

export async function listSystemTicketHistories(ticketId: number): Promise<SystemTicketHistory[]> {
  await wait(70)
  const ticket = await getSystemTicketById(ticketId)
  return ticket.histories
}

export async function linkSystemTicketAsset(
  ticketId: number,
  payload: Omit<SystemTicketAssetLink, 'id' | 'linkedAt'>,
): Promise<SystemTicket> {
  await wait(80)

  return replaceTicket(ticketId, (current) => {
    const maxAssetId = current.linkedAssets.reduce((max, item) => Math.max(max, item.id), 0)
    const linkedAsset: SystemTicketAssetLink = {
      id: maxAssetId + 1,
      linkedAt: new Date().toISOString(),
      ...payload,
    }

    return {
      ...current,
      linkedAssets: [linkedAsset, ...current.linkedAssets],
      updatedAt: new Date().toISOString(),
    }
  })
}

export async function changeSystemTicketStatus(id: number, status: SystemTicketStatus): Promise<SystemTicket> {
  const now = new Date().toISOString()
  let update: UpdateSystemTicketPayload = { status }
  let title = 'Estado actualizado'
  let description = `Ticket actualizado a ${status}.`
  let historyType: TicketHistoryType = 'STATUS_CHANGED'

  if (status === 'IN_PROGRESS') {
    update = {
      ...update,
      firstResponseAt: now,
      closedAt: null,
    }
    title = 'Trabajo iniciado'
    description = 'El ticket se encuentra en progreso.'
  }

  if (status === 'ON_HOLD') {
    title = 'Ticket en espera'
    description = 'Se registró espera de información o proveedor.'
  }

  if (status === 'RESOLVED') {
    update = {
      ...update,
      resolvedAt: now,
      closedAt: null,
    }
    historyType = 'RESOLVED'
    title = 'Ticket resuelto'
    description = 'Se registró solución para el ticket.'
  }

  if (status === 'CLOSED') {
    update = {
      ...update,
      closedAt: now,
    }
    historyType = 'CLOSED'
    title = 'Ticket cerrado'
    description = 'Se cerró el ticket en la mesa de ayuda.'
  }

  const updated = await updateSystemTicket(id, update)

  return addSystemTicketHistory(id, {
    type: historyType,
    title,
    description,
    actor: updated.responsible ?? 'Sistema',
  })
}

export async function assignSystemTicket(id: number, responsible: string | null): Promise<SystemTicket> {
  const cleanResponsible = responsible?.trim() || null

  const payload: UpdateSystemTicketPayload = {
    responsible: cleanResponsible,
  }

  if (cleanResponsible) {
    payload.status = 'IN_PROGRESS'
    payload.firstResponseAt = new Date().toISOString()
  }

  const updated = await updateSystemTicket(id, payload)

  return addSystemTicketHistory(id, {
    type: 'ASSIGNED',
    title: cleanResponsible ? 'Responsable asignado' : 'Responsable retirado',
    description: cleanResponsible
      ? `${cleanResponsible} fue asignado al ticket.`
      : 'Se retiró el responsable del ticket.',
    actor: cleanResponsible ?? 'Sistema',
  })
}
