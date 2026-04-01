export type SystemContractStatus = 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CANCELED'
export type ContractEventType = 'CREATE' | 'RENEW' | 'CANCEL' | 'ALERT'

export interface SystemContract {
  id: number
  code: string
  vendor: string
  serviceName: string
  responsible: string
  amount: number
  currency: 'PEN' | 'USD'
  startDate: string
  endDate: string
  autoRenew: boolean
  status: SystemContractStatus
  updatedAt: string
}

export interface SystemContractEvent {
  id: number
  contractId: number
  contractCode: string
  type: ContractEventType
  title: string
  detail: string
  createdAt: string
}

export interface CreateSystemContractPayload {
  vendor: string
  serviceName: string
  responsible: string
  amount: number
  currency: 'PEN' | 'USD'
  startDate: string
  endDate: string
  autoRenew: boolean
}

export interface SystemContractNotification {
  id: string
  contractId: number
  contractCode: string
  message: string
  severity: 'warning' | 'error'
  createdAt: string
}

interface ContractsDatabase {
  contracts: SystemContract[]
  events: SystemContractEvent[]
}

const STORAGE_KEY = 'sistemas-ti:contracts:v1'

const INITIAL_DB: ContractsDatabase = {
  contracts: [
    {
      id: 1,
      code: 'CTR-310',
      vendor: 'Microsoft',
      serviceName: 'Licencias Microsoft 365',
      responsible: 'Rosa Medina',
      amount: 12800,
      currency: 'USD',
      startDate: '2025-07-01',
      endDate: '2026-06-30',
      autoRenew: true,
      status: 'EXPIRING',
      updatedAt: '2026-03-28T11:40:00.000Z',
    },
    {
      id: 2,
      code: 'CTR-311',
      vendor: 'Claro Empresas',
      serviceName: 'Internet dedicado sede central',
      responsible: 'Luis Torres',
      amount: 5400,
      currency: 'PEN',
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      autoRenew: true,
      status: 'ACTIVE',
      updatedAt: '2026-03-19T09:20:00.000Z',
    },
    {
      id: 3,
      code: 'CTR-312',
      vendor: 'Oracle',
      serviceName: 'Soporte BD legado',
      responsible: 'Marco Rivas',
      amount: 9200,
      currency: 'USD',
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      autoRenew: false,
      status: 'EXPIRED',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  events: [
    {
      id: 1,
      contractId: 1,
      contractCode: 'CTR-310',
      type: 'ALERT',
      title: 'Contrato por vencer',
      detail: 'El contrato vence en menos de 120 dias.',
      createdAt: '2026-03-28T11:35:00.000Z',
    },
    {
      id: 2,
      contractId: 3,
      contractCode: 'CTR-312',
      type: 'ALERT',
      title: 'Contrato vencido',
      detail: 'El contrato de soporte BD ya vencio.',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const readDb = (): ContractsDatabase => {
  if (import.meta.server) {
    return clone(INITIAL_DB)
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DB))
    return clone(INITIAL_DB)
  }

  try {
    const parsed = JSON.parse(raw) as ContractsDatabase
    if (!parsed || !Array.isArray(parsed.contracts) || !Array.isArray(parsed.events)) {
      return clone(INITIAL_DB)
    }

    return parsed
  } catch {
    return clone(INITIAL_DB)
  }
}

const saveDb = (db: ContractsDatabase) => {
  if (import.meta.server) {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

const normalizeContractStatus = (endDate: string, currentStatus: SystemContractStatus): SystemContractStatus => {
  if (currentStatus === 'CANCELED') {
    return 'CANCELED'
  }

  const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)

  if (daysLeft < 0) {
    return 'EXPIRED'
  }

  if (daysLeft <= 120) {
    return 'EXPIRING'
  }

  return 'ACTIVE'
}

const generateContractCode = (contracts: SystemContract[]): string => {
  const maxCode = contracts.reduce((max, contract) => {
    const numeric = Number(contract.code.replace(/\D/g, ''))
    if (Number.isNaN(numeric)) {
      return max
    }

    return Math.max(max, numeric)
  }, 300)

  return `CTR-${maxCode + 1}`
}

const appendEvent = (db: ContractsDatabase, payload: Omit<SystemContractEvent, 'id'>) => {
  const nextId = db.events.length ? Math.max(...db.events.map(event => event.id)) + 1 : 1
  db.events.unshift({ id: nextId, ...payload })
}

export async function listSystemContracts(): Promise<SystemContract[]> {
  const db = readDb()
  const normalized = db.contracts.map(contract => ({
    ...contract,
    status: normalizeContractStatus(contract.endDate, contract.status),
  }))
  normalized.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
  return normalized
}

export async function listSystemContractEvents(): Promise<SystemContractEvent[]> {
  const db = readDb()
  db.events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return db.events
}

export async function createSystemContract(payload: CreateSystemContractPayload): Promise<SystemContract> {
  const db = readDb()
  const now = new Date().toISOString()
  const nextId = db.contracts.length ? Math.max(...db.contracts.map(contract => contract.id)) + 1 : 1

  const contract: SystemContract = {
    id: nextId,
    code: generateContractCode(db.contracts),
    vendor: payload.vendor.trim(),
    serviceName: payload.serviceName.trim(),
    responsible: payload.responsible.trim(),
    amount: payload.amount,
    currency: payload.currency,
    startDate: payload.startDate,
    endDate: payload.endDate,
    autoRenew: payload.autoRenew,
    status: normalizeContractStatus(payload.endDate, 'ACTIVE'),
    updatedAt: now,
  }

  db.contracts.unshift(contract)
  appendEvent(db, {
    contractId: contract.id,
    contractCode: contract.code,
    type: 'CREATE',
    title: 'Contrato creado',
    detail: `Se registro el contrato ${contract.serviceName}.`,
    createdAt: now,
  })
  saveDb(db)

  return contract
}

export async function renewSystemContract(id: number, months = 12): Promise<SystemContract> {
  const db = readDb()
  const index = db.contracts.findIndex(contract => contract.id === id)
  if (index === -1) {
    throw new Error('Contrato no encontrado.')
  }

  const current = db.contracts[index]
  if (!current) {
    throw new Error('Contrato no encontrado.')
  }

  const baseDate = new Date(current.endDate)
  baseDate.setMonth(baseDate.getMonth() + months)
  const nextEndDate = baseDate.toISOString().slice(0, 10)

  const updated: SystemContract = {
    ...current,
    endDate: nextEndDate,
    status: normalizeContractStatus(nextEndDate, 'ACTIVE'),
    updatedAt: new Date().toISOString(),
  }

  db.contracts[index] = updated
  appendEvent(db, {
    contractId: updated.id,
    contractCode: updated.code,
    type: 'RENEW',
    title: 'Contrato renovado',
    detail: `Se extendio vigencia hasta ${nextEndDate}.`,
    createdAt: updated.updatedAt,
  })
  saveDb(db)

  return updated
}

export async function cancelSystemContract(id: number): Promise<SystemContract> {
  const db = readDb()
  const index = db.contracts.findIndex(contract => contract.id === id)
  if (index === -1) {
    throw new Error('Contrato no encontrado.')
  }

  const current = db.contracts[index]
  if (!current) {
    throw new Error('Contrato no encontrado.')
  }

  const updated: SystemContract = {
    ...current,
    status: 'CANCELED',
    autoRenew: false,
    updatedAt: new Date().toISOString(),
  }

  db.contracts[index] = updated
  appendEvent(db, {
    contractId: updated.id,
    contractCode: updated.code,
    type: 'CANCEL',
    title: 'Contrato cancelado',
    detail: 'Se marco como cancelado en control administrativo.',
    createdAt: updated.updatedAt,
  })
  saveDb(db)

  return updated
}

export async function listSystemContractNotifications(): Promise<SystemContractNotification[]> {
  const contracts = await listSystemContracts()
  const notifications: SystemContractNotification[] = []

  for (const contract of contracts) {
    if (contract.status === 'CANCELED') {
      continue
    }

    const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / 86400000)

    if (daysLeft < 0) {
      notifications.push({
        id: `ctr-${contract.id}-expired`,
        contractId: contract.id,
        contractCode: contract.code,
        message: `${contract.code} vencio el ${contract.endDate}.`,
        severity: 'error',
        createdAt: contract.updatedAt,
      })
      continue
    }

    if (daysLeft <= 120) {
      notifications.push({
        id: `ctr-${contract.id}-expiring`,
        contractId: contract.id,
        contractCode: contract.code,
        message: `${contract.code} vence en ${daysLeft} dias.`,
        severity: 'warning',
        createdAt: contract.updatedAt,
      })
    }
  }

  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return notifications
}

export const systemContractStatusOptions = [
  { label: 'Activo', value: 'ACTIVE' as const },
  { label: 'Por vencer', value: 'EXPIRING' as const },
  { label: 'Vencido', value: 'EXPIRED' as const },
  { label: 'Cancelado', value: 'CANCELED' as const },
]

