import type {
  SystemTicket,
  TicketDeskAsset,
  TicketKnowledgeItem,
  TicketHistoryType,
} from './types'
import { getSlaPolicyByPriority } from './options'

const withSla = (
  createdAt: string,
  priority: SystemTicket['priority'],
  overrides: Partial<Pick<SystemTicket, 'slaResponseDueAt' | 'slaResolutionDueAt' | 'firstResponseAt' | 'resolvedAt' | 'closedAt'>> = {},
) => {
  const created = new Date(createdAt).getTime()
  const policy = getSlaPolicyByPriority(priority)

  return {
    slaResponseDueAt: overrides.slaResponseDueAt ?? new Date(created + (policy.responseTimeMinutes * 60 * 1000)).toISOString(),
    slaResolutionDueAt: overrides.slaResolutionDueAt ?? new Date(created + (policy.resolutionTimeMinutes * 60 * 1000)).toISOString(),
    firstResponseAt: overrides.firstResponseAt ?? null,
    resolvedAt: overrides.resolvedAt ?? null,
    closedAt: overrides.closedAt ?? null,
  }
}

const history = (
  id: number,
  ticketId: number,
  type: TicketHistoryType,
  title: string,
  description: string,
  actor: string,
  createdAt: string,
) => ({
  id,
  ticketId,
  type,
  title,
  description,
  actor,
  createdAt,
})

export const INITIAL_TICKETS: SystemTicket[] = [
  {
    id: 1023,
    code: 'TK-1023',
    title: 'Solicitud de equipo para nuevo colaborador',
    description: 'Alta de equipo para nuevo ingreso en operaciones.',
    requester: 'Maria Rojas',
    area: 'Operations',
    category: 'EQUIPMENT',
    type: 'SERVICE_REQUEST',
    impact: 'MEDIUM',
    urgency: 'HIGH',
    priority: 'URGENT',
    status: 'OPEN',
    responsible: null,
    ...withSla('2026-02-06T09:41:00.000Z', 'URGENT'),
    slaRemainingHours: 0,
    createdAt: '2026-02-06T09:41:00.000Z',
    updatedAt: '2026-02-06T09:41:00.000Z',
    images: [],
    histories: [
      history(
        1,
        1023,
        'TICKET_CREATED',
        'Ticket creado',
        'Se registró la solicitud de equipo.',
        'Maria Rojas',
        '2026-02-06T09:41:00.000Z',
      ),
    ],
    linkedAssets: [],
  },
  {
    id: 1018,
    code: 'TK-1018',
    title: 'Acceso VPN para supervisor de almacen',
    description: 'Se requiere acceso VPN por traslado de sede.',
    requester: 'Carlos Pineda',
    area: 'Warehouse',
    category: 'ACCESS',
    type: 'SERVICE_REQUEST',
    impact: 'MEDIUM',
    urgency: 'MEDIUM',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    responsible: 'Rosa Medina',
    ...withSla('2026-02-06T08:15:00.000Z', 'HIGH', {
      firstResponseAt: '2026-02-06T09:10:00.000Z',
    }),
    slaRemainingHours: 0,
    createdAt: '2026-02-06T08:15:00.000Z',
    updatedAt: '2026-02-06T10:05:00.000Z',
    images: [],
    histories: [
      history(
        2,
        1018,
        'TICKET_CREATED',
        'Ticket creado',
        'Solicitud registrada por traslado de sede.',
        'Carlos Pineda',
        '2026-02-06T08:15:00.000Z',
      ),
      history(
        3,
        1018,
        'ASSIGNED',
        'Responsable asignado',
        'Rosa Medina toma el ticket.',
        'Supervisor TI',
        '2026-02-06T08:40:00.000Z',
      ),
      history(
        4,
        1018,
        'STATUS_CHANGED',
        'Estado cambiado',
        'Ticket movido a En progreso.',
        'Rosa Medina',
        '2026-02-06T08:40:00.000Z',
      ),
    ],
    linkedAssets: [],
  },
  {
    id: 1012,
    code: 'TK-1012',
    title: 'Pantalla azul en laptop de Finanzas',
    description: 'Equipo bloqueado con BSOD durante cierre diario.',
    requester: 'Ana Ruiz',
    area: 'Management',
    category: 'SOFTWARE',
    type: 'INCIDENT',
    impact: 'HIGH',
    urgency: 'HIGH',
    priority: 'MEDIUM',
    status: 'ON_HOLD',
    responsible: 'Marco Rivas',
    ...withSla('2026-02-05T17:02:00.000Z', 'MEDIUM', {
      firstResponseAt: '2026-02-05T17:32:00.000Z',
    }),
    slaRemainingHours: 0,
    createdAt: '2026-02-05T17:02:00.000Z',
    updatedAt: '2026-02-06T07:45:00.000Z',
    images: [],
    histories: [
      history(
        5,
        1012,
        'TICKET_CREATED',
        'Ticket creado',
        'Incidente reportado en laptop de finanzas.',
        'Ana Ruiz',
        '2026-02-05T17:02:00.000Z',
      ),
      history(
        6,
        1012,
        'STATUS_CHANGED',
        'En espera',
        'Se está esperando respuesta del proveedor.',
        'Marco Rivas',
        '2026-02-06T07:45:00.000Z',
      ),
    ],
    linkedAssets: [],
  },
  {
    id: 1007,
    code: 'TK-1007',
    title: 'Error de licenciamiento Office en equipo comercial',
    description: 'No permite activar licencia de Microsoft 365.',
    requester: 'Diana Flores',
    area: 'Comercial',
    category: 'SOFTWARE',
    type: 'INCIDENT',
    impact: 'LOW',
    urgency: 'MEDIUM',
    priority: 'LOW',
    status: 'RESOLVED',
    responsible: 'Luis Torres',
    ...withSla('2026-02-04T14:15:00.000Z', 'LOW', {
      firstResponseAt: '2026-02-04T14:40:00.000Z',
      resolvedAt: '2026-02-04T16:00:00.000Z',
    }),
    slaRemainingHours: 0,
    createdAt: '2026-02-04T14:15:00.000Z',
    updatedAt: '2026-02-04T16:00:00.000Z',
    images: [],
    histories: [
      history(
        7,
        1007,
        'TICKET_CREATED',
        'Ticket creado',
        'Incidente de licenciamiento reportado.',
        'Diana Flores',
        '2026-02-04T14:15:00.000Z',
      ),
      history(
        8,
        1007,
        'RESOLVED',
        'Ticket resuelto',
        'Se activó licencia correctamente.',
        'Luis Torres',
        '2026-02-04T16:00:00.000Z',
      ),
    ],
    linkedAssets: [],
  },
]

export const MOCK_TECHNICIANS = [
  'Luis Torres',
  'Rosa Medina',
  'Marco Rivas',
  'Jhon Pacheco',
]

export const MOCK_ASSETS: TicketDeskAsset[] = [
  { name: 'Laptop Dell Latitude 5520', type: 'Laptop', serial: 'DL-5520-001', status: 'Activo' },
  { name: 'Monitor Samsung 24"', type: 'Monitor', serial: 'SM-24-991', status: 'Activo' },
  { name: 'Corporate Phone iPhone', type: 'Phone', serial: 'IP-14-002', status: 'Activo' },
  { name: 'Mouse Logitech MX', type: 'Accessory', serial: 'LG-MX-117', status: 'Activo' },
]

export const MOCK_KNOWLEDGE_ITEMS: TicketKnowledgeItem[] = [
  { title: 'VPN Access - Standard Steps', type: 'Known Error' },
  { title: 'Laptop Provisioning Checklist', type: 'Quick Fix' },
  { title: 'Asset Assignment Best Practices', type: 'Documentation' },
]
