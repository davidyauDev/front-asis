import type {
  SeguimientoEstadoFiltro,
  SeguimientoOrden,
  SeguimientoSubTab,
  SeguimientoTableSource,
  TecnicoConRutaEntry,
  TecnicoData,
  Usuario,
  ValidationTarget,
} from '~/types/seguimiento'
import { getMarcacionesCount, hasMarcaciones } from '~/utils/seguimiento'

export type SeguimientoDailyRecord = {
  id: number
  date: string
  employee_id: number | null
  emp_code: string
  concept_id: number | null
  day_code: string
  mobility_eligible: boolean
  source: string
  notes: string
  processed: boolean
  created_at: string
  updated_at: string
}

const patchUsuarioDailyRecord = (
  usuario: Usuario,
  dailyRecord: SeguimientoDailyRecord,
): Usuario => ({
  ...usuario,
  daily_record: dailyRecord,
})

export const buildSeguimientoDailyRecord = (
  fechaSeleccionada: string,
  employeeId: number | null,
  empCode: string,
  conceptId: number | null,
  comentario?: string,
): SeguimientoDailyRecord => ({
  id: Date.now(),
  date: fechaSeleccionada,
  employee_id: employeeId,
  emp_code: empCode,
  concept_id: conceptId,
  day_code: '1',
  mobility_eligible: false,
  source: 'employee_concepts',
  notes: comentario || 'Registro manual',
  processed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export const patchSeguimientoValidationTarget = (
  target: ValidationTarget,
  dailyRecord: SeguimientoDailyRecord,
): ValidationTarget => {
  if ('usuario' in target) {
    return {
      ...target,
      usuario: patchUsuarioDailyRecord(target.usuario, dailyRecord),
    }
  }

  return patchUsuarioDailyRecord(target, dailyRecord)
}

export const patchSeguimientoUsersCollection = (
  users: Usuario[],
  employeeId: number | null,
  empCode: string,
  dailyRecord: SeguimientoDailyRecord,
): Usuario[] =>
  users.map((usuario) => {
    if ((usuario.dni || '') === String(empCode) || usuario.id === employeeId) {
      return patchUsuarioDailyRecord(usuario, dailyRecord)
    }

    return usuario
  })

export const filterSeguimientoSinRutas = (
  users: Usuario[],
  search: string,
  filtroEstado: SeguimientoEstadoFiltro,
): Usuario[] => {
  let tecnicos = users
  const searchValue = search.trim().toLowerCase()

  if (searchValue) {
    tecnicos = tecnicos.filter((tecnico) => {
      const nombre = tecnico.nombre_completo.toLowerCase()
      const dni = String(tecnico.dni || '').toLowerCase()
      return dni.includes(searchValue) || nombre.includes(searchValue)
    })
  }

  if (filtroEstado === 'con-marcacion') {
    return tecnicos.filter((tecnico) => hasMarcaciones(tecnico.marcaciones))
  }

  if (filtroEstado === 'sin-marcacion') {
    return tecnicos.filter((tecnico) => !hasMarcaciones(tecnico.marcaciones))
  }

  return tecnicos
}

export const buildSeguimientoConRutasEntries = (
  users: Usuario[],
): TecnicoConRutaEntry[] => {
  const agrupados = users.reduce<Record<string, TecnicoData>>((acc, usuario) => {
    acc[usuario.dni] = {
      usuario,
      rutas: usuario.rutas,
      iclock_transactions: usuario.marcaciones,
    }
    return acc
  }, {})

  return Object.entries(agrupados) as TecnicoConRutaEntry[]
}

export const filterAndSortSeguimientoConRutas = (
  entries: TecnicoConRutaEntry[],
  search: string,
  filtroEstado: SeguimientoEstadoFiltro,
  ordenarPor: SeguimientoOrden,
): TecnicoConRutaEntry[] => {
  let datos = entries
  const searchValue = search.trim().toLowerCase()

  if (searchValue) {
    datos = datos.filter(([dni, tecnicoData]) => {
      const nombre = tecnicoData.usuario.nombre_completo.toLowerCase()
      const agencias = tecnicoData.rutas.map((ruta) => ruta.agencia?.toLowerCase() || '').join(' ')
      const cliente = tecnicoData.rutas.map((ruta) => ruta.cliente?.toLowerCase() || '').join(' ')

      return (
        dni.includes(searchValue) ||
        nombre.includes(searchValue) ||
        agencias.includes(searchValue) ||
        cliente.includes(searchValue)
      )
    })
  }

  if (filtroEstado === 'con-marcacion') {
    datos = datos.filter(([, tecnicoData]) => hasMarcaciones(tecnicoData.iclock_transactions))
  } else if (filtroEstado === 'sin-marcacion') {
    datos = datos.filter(([, tecnicoData]) => !hasMarcaciones(tecnicoData.iclock_transactions))
  }

  if (ordenarPor !== 'original') {
    return [...datos].sort(([, dataA], [, dataB]) => {
      if (ordenarPor === 'nombre') {
        return dataA.usuario.nombre_completo.localeCompare(dataB.usuario.nombre_completo)
      }

      if (ordenarPor === 'rutas') {
        return dataB.rutas.length - dataA.rutas.length
      }

      if (ordenarPor === 'marcaciones') {
        return (
          getMarcacionesCount(dataB.iclock_transactions) -
          getMarcacionesCount(dataA.iclock_transactions)
        )
      }

      return 0
    })
  }

  return [...datos].sort(([, dataA], [, dataB]) => {
    const aSinMarcacion = !hasMarcaciones(dataA.iclock_transactions)
    const bSinMarcacion = !hasMarcaciones(dataB.iclock_transactions)

    if (aSinMarcacion && !bSinMarcacion) {
      return -1
    }

    if (!aSinMarcacion && bSinMarcacion) {
      return 1
    }

    return 0
  })
}

export const splitSeguimientoConRutasByMarcacion = (
  entries: TecnicoConRutaEntry[],
): Record<SeguimientoSubTab, TecnicoConRutaEntry[]> => ({
  marcaron: entries.filter(([, tecnicoData]) => {
    const marcaciones = tecnicoData.iclock_transactions
    return Array.isArray(marcaciones) && marcaciones.length > 0
  }),
  'no-marcaron': entries.filter(([, tecnicoData]) => {
    const marcaciones = tecnicoData.iclock_transactions
    return !Array.isArray(marcaciones) || marcaciones.length === 0
  }),
})

export const splitSeguimientoSinRutasByMarcacion = (
  users: Usuario[],
): Record<SeguimientoSubTab, Usuario[]> => ({
  marcaron: users.filter(
    (tecnico) => Array.isArray(tecnico.marcaciones) && tecnico.marcaciones.length > 0,
  ),
  'no-marcaron': users.filter(
    (tecnico) => !Array.isArray(tecnico.marcaciones) || tecnico.marcaciones.length === 0,
  ),
})

export const getSeguimientoEmptyState = (source: SeguimientoTableSource) => {
  if (source === 'con-rutas') {
    return {
      title: 'No se encontraron tecnicos',
      description: 'Ajusta los filtros o cambia de subtab para ver otros resultados.',
    }
  }

  return {
    title: 'No hay tecnicos sin rutas',
    description: 'No hay tecnicos sin rutas para la fecha y filtros seleccionados.',
  }
}
