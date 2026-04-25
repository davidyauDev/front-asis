import { apiFetch } from '~/services/api'

export interface SolicitudEstado {
  id_estado?: number | null
  descripcion?: string | null
}

export interface SolicitudListItem {
  id_solicitud?: number | null
  id_usuario_solicitante?: number | null
  justificacion?: string | null
  tipo_solicitud?: string | null
  acta_rrhh_url?: string | null
  acta_rrhh_comentario?: string | null
  estado_rrhh?: 'pendiente' | 'derivar_logistica' | 'recojo_oficina' | string | null
  estado_rrhh_comentario?: string | null
  id_estado_general?: number | null
  fecha_registro?: string | null
  ubicacion?: string | null
  estado?: SolicitudEstado | null
  firstname?: string | null
  lastname?: string | null
  solicitante?: string | null
  staff?: {
    firstname?: string | null
    lastname?: string | null
  } | null
}

export interface SolicitudDetalleItem {
  id_detalle_solicitud?: number | null
  id_solicitud?: number | null
  id_inventario?: number | null
  url_imagen?: string | null
  area_id?: number | null
  area?: string | null
  id_area_inventario?: number | null
  stock_actual?: number | string | null
  producto?: string | {
    descripcion?: string | null
    nombre?: string | null
    codigo?: string | null
    url_imagen?: string | null
  } | null
  solicitado?: number | string | null
  aprobado?: number | string | null
  cantidad_atendida?: number | string | null
  id_estado_detalle?: number | null
  estado?: SolicitudEstado | string | null
  observacion_atencion?: string | null
  motivo?: string | null
  id_usuario_atendio?: number | null
  fecha_atencion?: string | null
  id_usuario_solicitante?: number | null
  fecha_registro?: string | null
  fecha_necesaria?: string | null
  fecha_cierre?: string | null
  prioridad?: string | null
  tipo_entrega_preferida?: string | null
  justificacion?: string | null
  firstname?: string | null
  lastname?: string | null
  email?: string | null
  solicitante?: string | null
  staff?: {
    firstname?: string | null
    lastname?: string | null
    email?: string | null
  } | null
}

export interface SolicitudDetalleData {
  solicitud: {
    id_solicitud?: number | null
    id_usuario_solicitante?: number | null
    tipo_solicitud?: string | null
    ubicacion?: string | null
    acta_rrhh_url?: string | null
    acta_rrhh_comentario?: string | null
    solicitante?: string | null
    firstname?: string | null
    lastname?: string | null
    email?: string | null
    staff?: {
      firstname?: string | null
      lastname?: string | null
      email?: string | null
    } | null
    justificacion?: string | null
    id_estado_general?: number | null
    estado?: SolicitudEstado | string | null
    fecha_registro?: string | null
    fecha_necesaria?: string | null
    fecha_cierre?: string | null
    prioridad?: string | null
    tipo_entrega_preferida?: string | null
    detalles_count?: number | null
  }
  detalles: SolicitudDetalleItem[]
}

export interface SolicitudListResponse {
  success: boolean
  message?: string
  data: SolicitudListItem[]
}

export interface SolicitudDetalleResponse {
  success: boolean
  message?: string
  data: SolicitudDetalleData
}

export interface SolicitudProductoRrhhItem {
  id: number
  id_producto: number
  staff_id: number
  id_detalle_solicitud: number
  url_imagen?: string | null
  producto?: {
    codigo_producto?: string | null
    descripcion?: string | null
    id_categoria?: number | null
    url_imagen?: string | null
  } | null
  staff?: {
    full_name?: string | null
    username?: string | null
    firstname?: string | null
    lastname?: string | null
    dept_id?: number | null
  } | null
  detalle?: {
    id_solicitud?: number | null
    id_inventario?: number | null
    cantidad_solicitada?: number | string | null
    area_id?: number | null
    id_estado_detalle?: number | null
    observacion_atencion?: string | null
    url_imagen?: string | null
  } | null
  solicitud?: {
    fecha_registro?: string | null
    fecha_necesaria?: string | null
    prioridad?: string | null
    ubicacion?: string | null
  } | null
}

export interface SolicitudProductosRrhhResponse {
  success: boolean
  message?: string
  data: SolicitudProductoRrhhItem[]
}

export interface ComprobanteGastoRrhhItem {
  id: number
  solicitud_gasto_id: number
  monto_estimado?: number | null
  monto_real?: number | null
  solicitud_gasto: {
    id: number
    staff_id: number
    solicitante: string
    username?: string | null
    area?: string | null
    motivo?: string | null
    estado: string
    fecha_solicitud?: string | null
    fecha_aprobacion: string | null
    fecha_reembolso: string | null
  }
  solicitud_gasto_detalles: Array<{
    id: number
    solicitud_gasto_id: number
    id_producto: number
    cantidad: number | string
    precio_estimado: number | string | null
    precio_real: number | string | null
    descripcion_adicional: string | null
    ruta_imagen: string | null
    url_imagen: string | null
    producto?: string | null
  }>
  comprobante: {
    id: number
    tipo: string
    numero: string
    monto: number | string
    archivo_url: string | null
  }
}

export interface ComprobantesGastoRrhhResponse {
  success: boolean
  message?: string
  data: ComprobanteGastoRrhhItem[] | null
}

export interface ComprobantesGastoRrhhParams {
  staff_id?: number | string
  estado?: string
}

export interface SolicitudGastoHistorialUsuario {
  staff_id?: number | null
  username?: string | null
  firstname?: string | null
  lastname?: string | null
  full_name?: string | null
  area?: string | null
}

export interface SolicitudGastoHistorialItem {
  id: number
  solicitud_gasto_id: number
  estado_anterior: string | null
  estado_nuevo: string | null
  comentario: string | null
  fecha: string | null
  usuario: SolicitudGastoHistorialUsuario | null
}

export interface SolicitudGastoHistorialData {
  solicitud_gasto: {
    id: number
    staff_id: number
    solicitante: string
    username: string
    area: string
    motivo: string
    monto_estimado: number | null
    monto_real: number | null
    estado: string
    fecha_solicitud: string
    fecha_aprobacion: string | null
    fecha_reembolso: string | null
  }
  data: SolicitudGastoHistorialItem[]
}

export interface SolicitudGastoHistorialResponse {
  success: boolean
  message?: string
  data: SolicitudGastoHistorialData | null
}

export interface AprobarDetalleSolicitudPayload {
  cantidad_aprobada: number
  motivo?: string | null
  id_usuario_atendio?: number | null
}

export interface RechazarDetalleSolicitudPayload {
  motivo: string
  id_usuario_atendio?: number | null
}

export interface DetalleSolicitudAccionResponse {
  success: boolean
  message?: string
  data: {
    id_detalle_solicitud?: number | null
    id_solicitud?: number | null
    cantidad_aprobada?: number | null
    id_estado_detalle?: number | null
    tiene_detalles_pendientes?: boolean | null
  }
}

export interface SolicitudListParams {
  search?: string
  from?: string
  to?: string
  page?: number
  per_page?: number
}

export interface SolicitudProductosRrhhParams {
  staff_id?: number | string
  id_producto?: number | string
}

const buildComprobantesGastoQuery = (params: ComprobantesGastoRrhhParams) => {
  const query = new URLSearchParams()

  if (params.staff_id !== undefined && params.staff_id !== '') query.set('staff_id', String(params.staff_id))
  if (params.estado !== undefined && params.estado !== '') query.set('estado', params.estado)

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const buildQuery = (params: SolicitudListParams) => {
  const query = new URLSearchParams()

  if (params.search) query.set('search', params.search)
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

const buildProductosRrhhQuery = (params: SolicitudProductosRrhhParams) => {
  const query = new URLSearchParams()

  if (params.staff_id !== undefined && params.staff_id !== '') query.set('staff_id', String(params.staff_id))
  if (params.id_producto !== undefined && params.id_producto !== '') query.set('id_producto', String(params.id_producto))

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const getSolicitudes = async (
  params: SolicitudListParams = {},
): Promise<SolicitudListResponse> => {
  return apiFetch(`/api/solicitudes${buildQuery(params)}`)
}

export const getSolicitudById = async (
  id: number | string,
): Promise<SolicitudDetalleResponse> => {
  return apiFetch(`/api/solicitudes/${id}`)
}

export const getSolicitudProductosRrhh = async (
  params: SolicitudProductosRrhhParams = {},
): Promise<SolicitudProductosRrhhResponse> => {
  return apiFetch(`/api/solicitudes/productos-rrhh${buildProductosRrhhQuery(params)}`)
}

export const getComprobantesGastoRrhh = async (
  params: ComprobantesGastoRrhhParams = {},
): Promise<ComprobantesGastoRrhhResponse> => {
  return apiFetch(`/api/solicitudes-gasto/comprobantes${buildComprobantesGastoQuery(params)}`)
}

export const getSolicitudGastoHistorial = async (
  id: number | string,
): Promise<SolicitudGastoHistorialResponse> => {
  return apiFetch(`/api/solicitudes-gasto/${id}/historial`)
}

export const aprobarDetalleSolicitud = async (
  id: number | string,
  payload: AprobarDetalleSolicitudPayload,
): Promise<DetalleSolicitudAccionResponse> => {
  return apiFetch(`/api/solicitudes/detalles/${id}/aprobar`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const rechazarDetalleSolicitud = async (
  id: number | string,
  payload: RechazarDetalleSolicitudPayload,
): Promise<DetalleSolicitudAccionResponse> => {
  return apiFetch(`/api/solicitudes/detalles/${id}/rechazar`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface EntregaDetallePayload {
  accion: 'derivar_logistica' | 'recojo_oficina'
  comentario?: string | null
  notificar_solicitante?: boolean
  notificar_logistica?: boolean
}

export type EstadoRrhhValue = 'pendiente' | 'derivar_logistica' | 'recojo_oficina'

export interface UpdateEstadoRrhhPayload {
  estado_rrhh: EstadoRrhhValue
  estado_rrhh_comentario?: string | null
}

export interface UpdateEstadoRrhhResponse {
  success: boolean
  message?: string
  data?: Record<string, unknown> | null
}

export interface SubirActaRrhhPayload {
  acta_rrhh: File
  acta_rrhh_comentario?: string | null
}

export interface SubirActaRrhhResponse {
  success: boolean
  message?: string
  data?: {
    id_solicitud?: number | null
    acta_rrhh_url?: string | null
    acta_rrhh_comentario?: string | null
  } | null
}

export const entregaDetalleSolicitud = async (
  id: number | string,
  payload: EntregaDetallePayload,
): Promise<DetalleSolicitudAccionResponse> => {
  return apiFetch(`/api/solicitudes/detalles/${id}/entrega`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const updateEstadoRrhh = async (
  id: number | string,
  payload: UpdateEstadoRrhhPayload,
): Promise<UpdateEstadoRrhhResponse> => {
  return apiFetch(`/api/solicitudes/${id}/estado-rrhh`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export const subirActaRrhh = async (
  id: number | string,
  payload: SubirActaRrhhPayload,
): Promise<SubirActaRrhhResponse> => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token')
  const formData = new FormData()
  formData.append('acta_rrhh', payload.acta_rrhh)
  formData.append('acta_rrhh_comentario', payload.acta_rrhh_comentario ?? '')

  const response = await fetch(`${config.public.apiBaseUrl}/api/solicitudes/${id}/acta-rrhh`, {
    method: 'POST',
    headers: {
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      Accept: 'application/json',
    },
    body: formData,
  })

  const raw = await response.text()
  const data = raw ? (() => {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  })() : null

  if (!response.ok) {
    if (data && typeof data === 'object') {
      throw { ...(data as any), status: response.status }
    }
    throw { message: String(data ?? response.statusText ?? 'Error'), status: response.status }
  }

  return data as SubirActaRrhhResponse
}

export const subirActaDetalle = async (
  id: number | string,
  formData: FormData,
): Promise<any> => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token')

  const response = await fetch(`${config.public.apiBaseUrl}/api/solicitudes/detalles/${id}/acta`, {
    method: 'POST',
    headers: {
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
    },
    body: formData,
  })

  const raw = await response.text()
  const data = raw ? (() => {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  })() : null

  if (!response.ok) {
    if (data && typeof data === 'object') {
      throw { ...(data as any), status: response.status }
    }
    throw { message: String(data ?? response.statusText ?? 'Error'), status: response.status }
  }

  return data
}
