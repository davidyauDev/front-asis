import {
  addHours,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
} from 'date-fns'
import type { SystemTicketPriority, SystemTicketStatus } from '~/services/sistemas-ti/tickets'

export interface ApiEnvelope<T> {
  status: boolean
  data: T
  message: string
}

export interface DashboardStatsPayload {
  open_tickets: {
    total: number
    unassigned: number
    trend_percentage: number
    trend_direction: 'up' | 'down'
  }
  sla_breaches: {
    out_sla: number
    severity: SystemTicketPriority
    message: string
  }
  assets_at_risk: {
    total: number
    new_assets: number
    message: string
  }
  active_projects: {
    total: number
    in_development: number
    trend_percentage: number
    trend_direction: 'up' | 'down'
  }
}

export type DashboardTicketsByPriority = Record<SystemTicketPriority, number>

export interface DashboardSlaCompliancePayload {
  range: {
    from: string
    to: string
  }
  daily: Array<{
    date: string
    complied: number
    breached: number
    compliance_rate: number
    breach_rate: number
  }>
}

export interface DashboardRecentTicket {
  id: number
  title: string
  priority: SystemTicketPriority
  status: SystemTicketStatus
  responsible: {
    full_name: string
  } | null
  created_at: string
}

export type ContractType = 'LICENSE' | 'SERVICE' | 'SUPPORT' | 'HARDWARE' | 'OTHER'
export type ContractPeriod = 'RECURRING' | 'FIXED_TERM' | 'ONE_TIME'

export interface NotificationContract {
  id: number
  data: string
  created_at: string
  contract?: {
    id: number
    name: string
    provider: string
    type: ContractType
    period: ContractPeriod
    end_date: string | null
    billing?: {
      next_billing_date: string | null
      auto_renew: boolean
    }
  }
}

export interface DashboardPayload {
  stats: DashboardStatsPayload
  tickets_by_priority: DashboardTicketsByPriority
  recent_tickets: DashboardRecentTicket[]
  sla_compliance: DashboardSlaCompliancePayload
  recent_contract_notifications: NotificationContract[]
  activeFilters: {
    start_date: string
    end_date: string
  }
}

export interface DashboardFilters {
  start_date?: string
  end_date?: string
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getDefaultRange = () => {
  const now = new Date()
  const start = startOfWeek(now, { weekStartsOn: 1 })
  const end = endOfWeek(now, { weekStartsOn: 1 })

  return {
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd'),
  }
}

const buildSlaCompliance = (from: string, to: string): DashboardSlaCompliancePayload => {
  const days = eachDayOfInterval({
    start: new Date(`${from}T00:00:00`),
    end: new Date(`${to}T00:00:00`),
  })

  const daily = days.map((day, index) => {
    const complied = Math.max(6, 22 - ((index * 2) % 7) - (index % 3))
    const breached = Math.max(0, 6 - (index % 4))
    const total = complied + breached

    return {
      date: format(day, 'yyyy-MM-dd'),
      complied,
      breached,
      compliance_rate: total > 0 ? Number(((complied / total) * 100).toFixed(1)) : 0,
      breach_rate: total > 0 ? Number(((breached / total) * 100).toFixed(1)) : 0,
    }
  })

  return {
    range: {
      from,
      to,
    },
    daily,
  }
}

const buildRecentTickets = (from: string): DashboardRecentTicket[] => {
  const start = new Date(`${from}T09:00:00`)

  return [
    {
      id: 1023,
      title: 'Solicitud de equipo para nuevo colaborador',
      priority: 'URGENT',
      status: 'OPEN',
      responsible: {
        full_name: 'Luis Torres',
      },
      created_at: addHours(start, 2).toISOString(),
    },
    {
      id: 1022,
      title: 'Acceso VPN para supervisor de almacen',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      responsible: {
        full_name: 'Rosa Medina',
      },
      created_at: addHours(start, 5).toISOString(),
    },
    {
      id: 1019,
      title: 'Error de licenciamiento Office en equipo comercial',
      priority: 'MEDIUM',
      status: 'ON_HOLD',
      responsible: null,
      created_at: addHours(start, 8).toISOString(),
    },
    {
      id: 1015,
      title: 'Cambio de teclado y mouse para mesa de ayuda',
      priority: 'LOW',
      status: 'RESOLVED',
      responsible: {
        full_name: 'Marco Rivas',
      },
      created_at: addHours(start, 13).toISOString(),
    },
    {
      id: 1011,
      title: 'Validacion de permisos en servidor de archivos',
      priority: 'HIGH',
      status: 'CLOSED',
      responsible: {
        full_name: 'Jhon Pacheco',
      },
      created_at: addHours(start, 18).toISOString(),
    },
  ]
}

const buildContractNotifications = (from: string): NotificationContract[] => {
  const base = new Date(`${from}T08:30:00`)

  return [
    {
      id: 9001,
      data: JSON.stringify({ message: 'vence en 5 dias' }),
      created_at: addHours(base, 1).toISOString(),
      contract: {
        id: 200,
        name: 'Microsoft 365 Empresa',
        provider: 'Microsoft',
        type: 'LICENSE',
        period: 'RECURRING',
        end_date: null,
        billing: {
          next_billing_date: format(addHours(base, 24 * 5), 'yyyy-MM-dd'),
          auto_renew: true,
        },
      },
    },
    {
      id: 9002,
      data: JSON.stringify({ message: 'proximo a renovacion' }),
      created_at: addHours(base, 4).toISOString(),
      contract: {
        id: 201,
        name: 'Soporte CCTV sedes',
        provider: 'Secure Vision SAC',
        type: 'SUPPORT',
        period: 'FIXED_TERM',
        end_date: format(addHours(base, 24 * 20), 'yyyy-MM-dd'),
        billing: {
          next_billing_date: format(addHours(base, 24 * 20), 'yyyy-MM-dd'),
          auto_renew: false,
        },
      },
    },
    {
      id: 9003,
      data: JSON.stringify({ message: 'revision obligatoria' }),
      created_at: addHours(base, 9).toISOString(),
      contract: {
        id: 202,
        name: 'Mantenimiento anual servidores',
        provider: 'Datacenter Peru',
        type: 'SERVICE',
        period: 'ONE_TIME',
        end_date: format(addHours(base, 24 * 10), 'yyyy-MM-dd'),
        billing: {
          next_billing_date: format(addHours(base, 24 * 10), 'yyyy-MM-dd'),
          auto_renew: false,
        },
      },
    },
  ]
}

const buildDashboardPayload = (filters: Required<DashboardFilters>): DashboardPayload => {
  const slaCompliance = buildSlaCompliance(filters.start_date, filters.end_date)
  const recentTickets = buildRecentTickets(filters.start_date)
  const recentNotifications = buildContractNotifications(filters.start_date)

  return {
    stats: {
      open_tickets: {
        total: 128,
        unassigned: 19,
        trend_percentage: 8.3,
        trend_direction: 'up',
      },
      sla_breaches: {
        out_sla: 14,
        severity: 'URGENT',
        message: 'Requieren atencion inmediata',
      },
      assets_at_risk: {
        total: 27,
        new_assets: 6,
        message: 'Garantias proximas a vencer',
      },
      active_projects: {
        total: 34,
        in_development: 12,
        trend_percentage: 5.1,
        trend_direction: 'up',
      },
    },
    tickets_by_priority: {
      URGENT: 22,
      HIGH: 44,
      MEDIUM: 39,
      LOW: 23,
    },
    recent_tickets: recentTickets,
    sla_compliance: slaCompliance,
    recent_contract_notifications: recentNotifications,
    activeFilters: {
      start_date: filters.start_date,
      end_date: filters.end_date,
    },
  }
}

export async function fetchSystemDashboard(
  filters: DashboardFilters = {},
): Promise<ApiEnvelope<DashboardPayload>> {
  const defaults = getDefaultRange()
  const normalizedFilters: Required<DashboardFilters> = {
    start_date: filters.start_date ?? defaults.start_date,
    end_date: filters.end_date ?? defaults.end_date,
  }

  await wait(260)

  return {
    status: true,
    data: buildDashboardPayload(normalizedFilters),
    message: 'Dashboard cargado correctamente.',
  }
}

