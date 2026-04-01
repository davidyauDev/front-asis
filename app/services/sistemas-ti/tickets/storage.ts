import type { SystemTicket } from './types'
import { INITIAL_TICKETS } from './mock-data'

const STORAGE_KEY = 'sistemas-ti:tickets:v2'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const normalizeTickets = (tickets: SystemTicket[]) => {
  return tickets.map((ticket) => {
    const histories = Array.isArray(ticket.histories) ? ticket.histories : []
    const linkedAssets = Array.isArray(ticket.linkedAssets) ? ticket.linkedAssets : []

    return {
      ...ticket,
      histories,
      linkedAssets,
    }
  })
}

export const readTickets = (): SystemTicket[] => {
  if (import.meta.server) {
    return clone(INITIAL_TICKETS)
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS))
    return clone(INITIAL_TICKETS)
  }

  try {
    const parsed = JSON.parse(raw) as SystemTicket[]
    if (!Array.isArray(parsed)) {
      return clone(INITIAL_TICKETS)
    }

    return normalizeTickets(parsed)
  } catch {
    return clone(INITIAL_TICKETS)
  }
}

export const saveTickets = (tickets: SystemTicket[]) => {
  if (import.meta.server) {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
}

export const cloneTicketList = clone
