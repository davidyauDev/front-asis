import type {
  Marcacion,
  Ruta,
  SinMarcacionMessage,
  ValidationTarget,
} from '~/types/seguimiento'

type SeguimientoEntity =
  | ValidationTarget
  | Ruta
  | Marcacion
  | null
  | undefined

type ConceptBadge = {
  text: string
  color: string
}

type MaybeDailyRecord = {
  daily_record?: unknown
}

export const esObjetoSinMarcacion = (obj: unknown): obj is SinMarcacionMessage => {
  return !!obj && typeof obj === 'object' && 'message' in obj && !Array.isArray(obj)
}

export const getMarcacionesCount = (
  value: Marcacion[] | SinMarcacionMessage | null | undefined,
) => (Array.isArray(value) ? value.length : 0)

export const hasMarcaciones = (
  value: Marcacion[] | SinMarcacionMessage | null | undefined,
) => getMarcacionesCount(value) > 0

const getFirstDailyRecord = (items: MaybeDailyRecord[] | null | undefined) => {
  if (!Array.isArray(items)) {
    return null
  }

  for (const item of items) {
    if (item?.daily_record) {
      return item.daily_record
    }
  }

  return null
}

export const getDailyRecord = (target: SeguimientoEntity) => {
  if (!target) {
    return null
  }

  if ('daily_record' in target && target.daily_record) {
    return target.daily_record
  }

  if ('usuario' in target && target.usuario?.daily_record) {
    return target.usuario.daily_record
  }

  if ('rutas' in target) {
    const routeRecord = getFirstDailyRecord(target.rutas)
    if (routeRecord) {
      return routeRecord
    }
  }

  if ('marcaciones' in target) {
    const markRecord = getFirstDailyRecord(
      Array.isArray(target.marcaciones) ? target.marcaciones : null,
    )
    if (markRecord) {
      return markRecord
    }
  }

  if ('iclock_transactions' in target) {
    const clockRecord = getFirstDailyRecord(
      Array.isArray(target.iclock_transactions) ? target.iclock_transactions : null,
    )
    if (clockRecord) {
      return clockRecord
    }
  }

  return null
}

export const hasDailyRecordForTecnico = (target: SeguimientoEntity) => {
  return Boolean(getDailyRecord(target))
}

export const shouldShowValidar = (target: SeguimientoEntity) => {
  if (!target) {
    return false
  }

  if ('iclock_transactions' in target) {
    return !hasMarcaciones(target.iclock_transactions) && !hasDailyRecordForTecnico(target)
  }

  if ('marcaciones' in target) {
    return !hasMarcaciones(target.marcaciones) && !hasDailyRecordForTecnico(target)
  }

  return false
}

export const getKeyForTecnico = (target: SeguimientoEntity) => {
  if (!target) {
    return ''
  }

  if ('usuario' in target) {
    return String(target.usuario?.dni || target.usuario?.id || '')
  }

  const candidate = target as {
    dni?: unknown
    emp_code?: unknown
    id?: unknown
  }

  return String(candidate.dni || candidate.emp_code || candidate.id || '')
}

export const getExpandKey = (target: SeguimientoEntity) => {
  return getKeyForTecnico(target)
}

export const formatDailyRecord = (dailyRecord: unknown) => {
  try {
    return dailyRecord ? JSON.stringify(dailyRecord, null, 2) : ''
  } catch {
    return String(dailyRecord ?? '')
  }
}

export const extractConceptRecord = (
  value: unknown,
  maxDepth = 4,
): Record<string, unknown> | null => {
  const seen = new Set<unknown>()

  const hasConceptFields = (obj: Record<string, unknown>) => {
    return (
      'concept_id' in obj ||
      'conceptId' in obj ||
      'day_code' in obj ||
      'dayCode' in obj ||
      'concept_code' in obj ||
      'conceptCode' in obj ||
      'concept_name' in obj ||
      'conceptName' in obj ||
      'code' in obj ||
      'codigo' in obj ||
      'concept' in obj ||
      'concepto' in obj
    )
  }

  const walk = (current: unknown, depth: number): Record<string, unknown> | null => {
    if (!current || depth < 0 || typeof current !== 'object') {
      return null
    }

    if (seen.has(current)) {
      return null
    }

    seen.add(current)

    if (Array.isArray(current)) {
      for (const item of current) {
        const found = walk(item, depth - 1)
        if (found) {
          return found
        }
      }

      return null
    }

    const record = current as Record<string, unknown>

    if (hasConceptFields(record)) {
      return record
    }

    for (const [key, child] of Object.entries(record)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue
      }

      const found = walk(child, depth - 1)
      if (found) {
        return found
      }
    }

    return null
  }

  return walk(value, maxDepth)
}

export const getConceptBadge = (dailyRecord: unknown): ConceptBadge => {
  if (!dailyRecord) {
    return {
      text: 'Registro',
      color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    }
  }

  const source = extractConceptRecord(dailyRecord) ?? dailyRecord
  const record =
    source && typeof source === 'object' ? (source as Record<string, unknown>) : {}
  const conceptId = Number(record?.concept_id)
  const code = (
    typeof source === 'string'
      ? source
      : String(record?.day_code ?? record?.concept_code ?? record?.code ?? record?.codigo ?? '')
  )
    .trim()
    .toUpperCase()
  const name = String(
    record?.concept_name ?? record?.concepto ?? record?.concept ?? record?.name ?? '',
  )
    .trim()
    .toLowerCase()

  if (!Number.isFinite(conceptId)) {
    if (code === 'V' || name.includes('vacac')) {
      return {
        text: 'Vacaciones',
        color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
      }
    }

    if (code === 'DM' || name.includes('descanso') || name.includes('med')) {
      return {
        text: 'Descanso Médico',
        color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      }
    }

    if (code === 'SR' || name.includes('sin ruta')) {
      return {
        text: 'Sin Ruta',
        color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      }
    }

    if (code === 'NM' || name.includes('no marc')) {
      return {
        text: 'No Marcó',
        color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      }
    }

    if (code === 'X' || name.includes('cese')) {
      return {
        text: 'Cese',
        color: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
      }
    }

    return {
      text: 'Registro',
      color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    }
  }

  switch (conceptId) {
    case 1:
      return {
        text: 'Asistencia',
        color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      }
    case 2:
      return {
        text: 'Vacaciones',
        color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
      }
    case 3:
      return {
        text: 'Descanso Médico',
        color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      }
    case 4:
      return {
        text: 'Sin Ruta',
        color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      }
    case 5:
      return {
        text: 'No Marcó',
        color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      }
    case 6:
      return {
        text: 'Cese',
        color: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
      }
    default:
      return {
        text: 'Registro',
        color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      }
  }
}

export const getDailyModalPanelClass = (dailyRecord: unknown) => {
  const base =
    'bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800/60'
  const record =
    extractConceptRecord(dailyRecord) ??
    (dailyRecord as Record<string, unknown> | null)
  const conceptId = Number(record?.concept_id)
  const code = String(
    record?.day_code ?? record?.concept_code ?? record?.code ?? record?.codigo ?? '',
  )
    .trim()
    .toUpperCase()
  const name = String(
    record?.concept_name ?? record?.concepto ?? record?.concept ?? record?.name ?? '',
  )
    .trim()
    .toLowerCase()

  if (conceptId === 1) {
    return 'bg-green-50/60 dark:bg-green-950/10 border border-green-200/70 dark:border-green-800/50'
  }

  if (conceptId === 2 || code === 'V' || name.includes('vacac')) {
    return 'bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/70 dark:border-amber-800/50'
  }

  if (conceptId === 3 || code === 'DM' || name.includes('descanso') || name.includes('med')) {
    return 'bg-purple-50/60 dark:bg-purple-950/10 border border-purple-200/70 dark:border-purple-800/50'
  }

  if (conceptId === 4 || code === 'SR' || name.includes('sin ruta')) {
    return 'bg-orange-50/60 dark:bg-orange-950/10 border border-orange-200/70 dark:border-orange-800/50'
  }

  if (conceptId === 5 || code === 'NM' || name.includes('no marc')) {
    return 'bg-red-50/60 dark:bg-red-950/10 border border-red-200/70 dark:border-red-800/50'
  }

  if (conceptId === 6 || code === 'X' || name.includes('cese')) {
    return 'bg-gray-50/70 dark:bg-gray-950/10 border border-gray-200/70 dark:border-gray-800/50'
  }

  return base
}

export const getDailyModalPreClass = (dailyRecord: unknown) => {
  const base =
    'bg-gray-50 dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-200'
  const record =
    extractConceptRecord(dailyRecord) ??
    (dailyRecord as Record<string, unknown> | null)
  const conceptId = Number(record?.concept_id)
  const code = String(
    record?.day_code ?? record?.concept_code ?? record?.code ?? record?.codigo ?? '',
  )
    .trim()
    .toUpperCase()
  const name = String(
    record?.concept_name ?? record?.concepto ?? record?.concept ?? record?.name ?? '',
  )
    .trim()
    .toLowerCase()

  if (conceptId === 1 || code === 'A') {
    return 'bg-green-50 dark:bg-green-950/20 border-green-200/70 dark:border-green-800/50 text-green-950 dark:text-green-50'
  }

  if (conceptId === 2 || code === 'V' || name.includes('vacac')) {
    return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/50 text-amber-950 dark:text-amber-50'
  }

  if (conceptId === 3 || code === 'DM' || name.includes('descanso') || name.includes('med')) {
    return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200/70 dark:border-purple-800/50 text-purple-950 dark:text-purple-50'
  }

  if (conceptId === 4 || code === 'SR' || name.includes('sin ruta')) {
    return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200/70 dark:border-orange-800/50 text-orange-950 dark:text-orange-50'
  }

  if (conceptId === 5 || code === 'NM' || name.includes('no marc')) {
    return 'bg-red-50 dark:bg-red-950/20 border-red-200/70 dark:border-red-800/50 text-red-950 dark:text-red-50'
  }

  if (conceptId === 6 || code === 'X' || name.includes('cese')) {
    return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200/70 dark:border-gray-800/50 text-gray-900 dark:text-gray-100'
  }

  return base
}
