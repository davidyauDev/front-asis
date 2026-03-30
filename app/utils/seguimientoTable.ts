import type {
  SeguimientoTableRow,
  TecnicoConRutaEntry,
  TecnicoData,
  Usuario,
} from '~/types/seguimiento'
import { getDailyRecord, getExpandKey } from '~/utils/seguimiento'

const FALLBACK_NAME = 'Sin informacion'

const buildInitials = (first?: string, second?: string) => {
  const initialA = (first || '').trim().charAt(0)
  const initialB = (second || '').trim().charAt(0)
  return `${initialA}${initialB}`.trim().toUpperCase() || 'ST'
}

const buildRowKey = (source: SeguimientoTableRow['source'], usuario: Usuario) =>
  getExpandKey(usuario) || `${source}-${usuario.id || 'row'}`

const buildConRutasSubtitle = (tecnicoData: TecnicoData) => {
  const agencia = tecnicoData.rutas[0]?.agencia
  const cliente = tecnicoData.rutas[0]?.cliente
  const parts = [agencia, cliente].filter(Boolean)
  return parts.join(' | ') || 'Con rutas asignadas'
}

const buildSinRutasSubtitle = (usuario: Usuario) => {
  const parts = [usuario.departamento, usuario.posicion].filter(Boolean)
  return parts.join(' | ') || 'Sin rutas asignadas'
}

const resolveNombre = (usuario: Usuario) =>
  usuario.nombre_completo || `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || FALLBACK_NAME

export const buildSeguimientoRowsFromConRutas = (
  items: TecnicoConRutaEntry[],
): SeguimientoTableRow[] =>
  items.map(([, tecnicoData]) => {
    const usuario = tecnicoData.usuario

    return {
      key: buildRowKey('con-rutas', usuario),
      source: 'con-rutas',
      usuario,
      nombre: resolveNombre(usuario),
      subtitle: buildConRutasSubtitle(tecnicoData),
      initials: buildInitials(usuario.nombre, usuario.apellido),
      dni: usuario.dni || '',
      rutas: tecnicoData.rutas,
      rutasCount: tecnicoData.rutas.length,
      marcaciones: tecnicoData.iclock_transactions,
      validationTarget: tecnicoData,
      whatsappTarget: tecnicoData,
      dailyRecord: getDailyRecord(tecnicoData),
    }
  })

export const buildSeguimientoRowsFromSinRutas = (
  items: Usuario[],
): SeguimientoTableRow[] =>
  items.map((usuario) => ({
    key: buildRowKey('sin-rutas', usuario),
    source: 'sin-rutas',
    usuario,
    nombre: resolveNombre(usuario),
    subtitle: buildSinRutasSubtitle(usuario),
    initials: buildInitials(usuario.nombre, usuario.apellido),
    dni: usuario.dni || '',
    rutas: usuario.rutas || [],
    rutasCount: (usuario.rutas || []).length,
    marcaciones: usuario.marcaciones,
    validationTarget: usuario,
    whatsappTarget: null,
    dailyRecord: getDailyRecord(usuario),
  }))
