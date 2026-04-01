import type {
  SlaPolicy,
  SystemTicketCategory,
  SystemTicketImpact,
  SystemTicketPriority,
  SystemTicketStatus,
  SystemTicketType,
  SystemTicketUrgency,
} from './types'

export const systemTicketStatusOptions = [
  { label: 'Abierto', value: 'OPEN' as const },
  { label: 'En progreso', value: 'IN_PROGRESS' as const },
  { label: 'En espera', value: 'ON_HOLD' as const },
  { label: 'Resuelto', value: 'RESOLVED' as const },
  { label: 'Cerrado', value: 'CLOSED' as const },
]

export const systemTicketPriorityOptions = [
  { label: 'Baja', value: 'LOW' as const },
  { label: 'Media', value: 'MEDIUM' as const },
  { label: 'Alta', value: 'HIGH' as const },
  { label: 'Critica', value: 'URGENT' as const },
]

export const systemTicketTypeOptions = [
  { label: 'Incidente', value: 'INCIDENT' as const },
  { label: 'Solicitud de servicio', value: 'SERVICE_REQUEST' as const },
]

export const systemTicketCategoryOptions = [
  { label: 'Software', value: 'SOFTWARE' as const },
  { label: 'Acceso', value: 'ACCESS' as const },
  { label: 'Equipo', value: 'EQUIPMENT' as const },
]

export const systemTicketImpactOptions = [
  { label: 'Bajo', value: 'LOW' as const },
  { label: 'Medio', value: 'MEDIUM' as const },
  { label: 'Alto', value: 'HIGH' as const },
]

export const systemTicketUrgencyOptions = [
  { label: 'Baja', value: 'LOW' as const },
  { label: 'Media', value: 'MEDIUM' as const },
  { label: 'Alta', value: 'HIGH' as const },
]

export const SLA_POLICIES: SlaPolicy[] = [
  {
    priority: 'URGENT',
    label: 'Critica',
    responseTimeMinutes: 120,
    resolutionTimeMinutes: 360,
  },
  {
    priority: 'HIGH',
    label: 'Alta',
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 720,
  },
  {
    priority: 'MEDIUM',
    label: 'Media',
    responseTimeMinutes: 480,
    resolutionTimeMinutes: 1440,
  },
  {
    priority: 'LOW',
    label: 'Baja',
    responseTimeMinutes: 960,
    resolutionTimeMinutes: 2880,
  },
]

export const systemTicketStatusLabelMap: Record<SystemTicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  ON_HOLD: 'En espera',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
}

export const systemTicketPriorityLabelMap: Record<SystemTicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Critica',
}

export const systemTicketTypeLabelMap: Record<SystemTicketType, string> = {
  INCIDENT: 'Incidente',
  SERVICE_REQUEST: 'Solicitud de servicio',
}

export const systemTicketCategoryLabelMap: Record<SystemTicketCategory, string> = {
  SOFTWARE: 'Software',
  ACCESS: 'Acceso',
  EQUIPMENT: 'Equipo',
}

export const systemTicketImpactLabelMap: Record<SystemTicketImpact, string> = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
}

export const systemTicketUrgencyLabelMap: Record<SystemTicketUrgency, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
}

export const systemTicketStatusColorMap: Record<SystemTicketStatus, 'primary' | 'warning' | 'success' | 'neutral'> = {
  OPEN: 'primary',
  IN_PROGRESS: 'warning',
  ON_HOLD: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral',
}

export const systemTicketPriorityColorMap: Record<SystemTicketPriority, 'primary' | 'warning' | 'error' | 'success'> = {
  LOW: 'success',
  MEDIUM: 'primary',
  HIGH: 'warning',
  URGENT: 'error',
}

export const getSlaPolicyByPriority = (priority: SystemTicketPriority) => {
  const policy = SLA_POLICIES.find(item => item.priority === priority)
  if (policy) {
    return policy
  }

  return {
    priority: 'MEDIUM',
    label: 'Media',
    responseTimeMinutes: 480,
    resolutionTimeMinutes: 1440,
  } satisfies SlaPolicy
}
