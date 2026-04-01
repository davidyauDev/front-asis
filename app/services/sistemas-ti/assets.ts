export type SystemAssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED'
export type SystemAssetType = 'LAPTOP' | 'DESKTOP' | 'MONITOR' | 'PHONE' | 'ACCESSORY' | 'LICENSE'

export interface SystemAsset {
  id: number
  code: string
  name: string
  type: SystemAssetType
  brand: string
  model: string
  serial: string
  status: SystemAssetStatus
  assignedTo: string | null
  location: string
  purchaseDate: string
  warrantyEndDate: string
  updatedAt: string
}

export interface CreateSystemAssetPayload {
  name: string
  type: SystemAssetType
  brand: string
  model: string
  serial: string
  location: string
  purchaseDate: string
  warrantyEndDate: string
}

export interface UpdateSystemAssetPayload {
  name?: string
  type?: SystemAssetType
  brand?: string
  model?: string
  serial?: string
  status?: SystemAssetStatus
  assignedTo?: string | null
  location?: string
  purchaseDate?: string
  warrantyEndDate?: string
}

const STORAGE_KEY = 'sistemas-ti:assets:v1'

const INITIAL_ASSETS: SystemAsset[] = [
  {
    id: 1,
    code: 'AST-1201',
    name: 'Laptop Dell Latitude 5520',
    type: 'LAPTOP',
    brand: 'Dell',
    model: 'Latitude 5520',
    serial: 'DL5520-9901',
    status: 'ASSIGNED',
    assignedTo: 'Luis Torres',
    location: 'Sede Principal',
    purchaseDate: '2025-03-12',
    warrantyEndDate: '2027-03-12',
    updatedAt: '2026-03-20T16:20:00.000Z',
  },
  {
    id: 2,
    code: 'AST-1202',
    name: 'Monitor Samsung 24',
    type: 'MONITOR',
    brand: 'Samsung',
    model: 'S24R350',
    serial: 'SM24-4412',
    status: 'AVAILABLE',
    assignedTo: null,
    location: 'Almacen TI',
    purchaseDate: '2025-01-18',
    warrantyEndDate: '2026-12-30',
    updatedAt: '2026-03-19T08:00:00.000Z',
  },
  {
    id: 3,
    code: 'AST-1203',
    name: 'iPhone 14 corporativo',
    type: 'PHONE',
    brand: 'Apple',
    model: 'iPhone 14',
    serial: 'APL-IP14-88',
    status: 'ASSIGNED',
    assignedTo: 'Maria Rojas',
    location: 'Operaciones',
    purchaseDate: '2024-11-05',
    warrantyEndDate: '2026-11-05',
    updatedAt: '2026-03-25T12:30:00.000Z',
  },
  {
    id: 4,
    code: 'AST-1204',
    name: 'Licencia Microsoft 365 E3',
    type: 'LICENSE',
    brand: 'Microsoft',
    model: 'M365 E3',
    serial: 'LIC-M365-110',
    status: 'ASSIGNED',
    assignedTo: 'Contabilidad',
    location: 'Nube',
    purchaseDate: '2026-01-01',
    warrantyEndDate: '2026-12-31',
    updatedAt: '2026-03-10T09:10:00.000Z',
  },
  {
    id: 5,
    code: 'AST-1205',
    name: 'Mouse Logitech M185',
    type: 'ACCESSORY',
    brand: 'Logitech',
    model: 'M185',
    serial: 'LG185-202',
    status: 'MAINTENANCE',
    assignedTo: null,
    location: 'Laboratorio TI',
    purchaseDate: '2025-08-28',
    warrantyEndDate: '2026-08-28',
    updatedAt: '2026-03-28T19:00:00.000Z',
  },
]

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const readAssets = (): SystemAsset[] => {
  if (import.meta.server) {
    return clone(INITIAL_ASSETS)
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ASSETS))
    return clone(INITIAL_ASSETS)
  }

  try {
    const parsed = JSON.parse(raw) as SystemAsset[]
    if (!Array.isArray(parsed)) {
      return clone(INITIAL_ASSETS)
    }
    return parsed
  } catch {
    return clone(INITIAL_ASSETS)
  }
}

const saveAssets = (assets: SystemAsset[]) => {
  if (import.meta.server) {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
}

const generateAssetCode = (assets: SystemAsset[]): string => {
  const maxCode = assets.reduce((max, asset) => {
    const numeric = Number(asset.code.replace(/\D/g, ''))
    if (Number.isNaN(numeric)) {
      return max
    }

    return Math.max(max, numeric)
  }, 1200)

  return `AST-${maxCode + 1}`
}

export async function listSystemAssets(): Promise<SystemAsset[]> {
  const assets = readAssets()
  assets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return assets
}

export async function createSystemAsset(payload: CreateSystemAssetPayload): Promise<SystemAsset> {
  const assets = readAssets()
  const now = new Date().toISOString()
  const nextId = assets.length ? Math.max(...assets.map(asset => asset.id)) + 1 : 1

  const asset: SystemAsset = {
    id: nextId,
    code: generateAssetCode(assets),
    name: payload.name.trim(),
    type: payload.type,
    brand: payload.brand.trim(),
    model: payload.model.trim(),
    serial: payload.serial.trim(),
    status: 'AVAILABLE',
    assignedTo: null,
    location: payload.location.trim(),
    purchaseDate: payload.purchaseDate,
    warrantyEndDate: payload.warrantyEndDate,
    updatedAt: now,
  }

  assets.unshift(asset)
  saveAssets(assets)

  return asset
}

export async function updateSystemAsset(id: number, payload: UpdateSystemAssetPayload): Promise<SystemAsset> {
  const assets = readAssets()
  const index = assets.findIndex(asset => asset.id === id)
  if (index === -1) {
    throw new Error('Activo no encontrado.')
  }

  const current = assets[index]
  if (!current) {
    throw new Error('Activo no encontrado.')
  }

  const updated: SystemAsset = {
    id: current.id,
    code: current.code,
    name: payload.name !== undefined ? payload.name.trim() : current.name,
    type: payload.type ?? current.type,
    brand: payload.brand !== undefined ? payload.brand.trim() : current.brand,
    model: payload.model !== undefined ? payload.model.trim() : current.model,
    serial: payload.serial !== undefined ? payload.serial.trim() : current.serial,
    status: payload.status ?? current.status,
    assignedTo: payload.assignedTo === undefined ? current.assignedTo : payload.assignedTo?.trim() || null,
    location: payload.location !== undefined ? payload.location.trim() : current.location,
    purchaseDate: payload.purchaseDate ?? current.purchaseDate,
    warrantyEndDate: payload.warrantyEndDate ?? current.warrantyEndDate,
    updatedAt: new Date().toISOString(),
  }

  assets[index] = updated
  saveAssets(assets)

  return updated
}

export async function changeSystemAssetStatus(id: number, status: SystemAssetStatus): Promise<SystemAsset> {
  const payload: UpdateSystemAssetPayload = { status }

  if (status !== 'ASSIGNED') {
    payload.assignedTo = null
  }

  return updateSystemAsset(id, payload)
}

export async function assignSystemAsset(id: number, assignedTo: string | null): Promise<SystemAsset> {
  const normalizedAssignedTo = assignedTo?.trim() || null
  return updateSystemAsset(id, {
    assignedTo: normalizedAssignedTo,
    status: normalizedAssignedTo ? 'ASSIGNED' : 'AVAILABLE',
  })
}

export const systemAssetStatusOptions = [
  { label: 'Disponible', value: 'AVAILABLE' as const },
  { label: 'Asignado', value: 'ASSIGNED' as const },
  { label: 'Mantenimiento', value: 'MAINTENANCE' as const },
  { label: 'Retirado', value: 'RETIRED' as const },
]

export const systemAssetTypeOptions = [
  { label: 'Laptop', value: 'LAPTOP' as const },
  { label: 'Desktop', value: 'DESKTOP' as const },
  { label: 'Monitor', value: 'MONITOR' as const },
  { label: 'Telefono', value: 'PHONE' as const },
  { label: 'Accesorio', value: 'ACCESSORY' as const },
  { label: 'Licencia', value: 'LICENSE' as const },
]

