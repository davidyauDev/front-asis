import type { TecnicoData } from '~/types/seguimiento'

const CONCEPTO_MAP: Record<string, number> = {
  asistencia: 1,
  vacaciones: 2,
  descanso_medico: 3,
  sin_ruta: 4,
  no_marco: 5,
  cese: 6,
}

export const resolveSeguimientoConceptId = (motivo: string | number) => {
  if (typeof motivo === 'number') {
    return motivo
  }

  if (typeof motivo === 'string') {
    return CONCEPTO_MAP[motivo] || null
  }

  return null
}

export const normalizeWhatsAppPhone = (raw: string) => {
  const digits = String(raw || '').replace(/[^\d]/g, '')
  if (!digits) {
    return null
  }

  let phone = digits

  if (phone.startsWith('00')) {
    phone = phone.slice(2)
  }

  if (phone.startsWith('0')) {
    phone = phone.slice(1)
  }

  if (phone.length === 9 && phone.startsWith('9')) {
    phone = `51${phone}`
  }

  return phone.length < 10 ? null : phone
}

export const buildSeguimientoWhatsAppMessage = (
  tecnicoData: TecnicoData,
  fechaSeleccionada: string,
) => {
  const usuario = tecnicoData.usuario
  const nombre = usuario?.nombre_completo || 'Tecnico'
  const departamento = usuario?.departamento ? ` (${usuario.departamento})` : ''

  return [
    `Hola ${nombre}${departamento},`,
    '',
    `Te escribo por el seguimiento de asistencia del dia ${fechaSeleccionada}.`,
    'Veo que no se registro tu marcacion.',
    '',
    'Puedes confirmarme si tuviste algun inconveniente?',
  ].join('\n')
}

export const buildSeguimientoWhatsAppUrl = (
  phone: string,
  message: string,
) =>
  `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
