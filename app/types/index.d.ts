import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface AuthUser {
  id: number
  name: string
  email: string
  emp_code: string
  role?: 'admin' | 'user' | 'moderator'
  avatar?: {
    src?: string
    alt?: string
  }
}

export interface LoginCredentials {
  emp_code: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    name: string
    email: string
    emp_code: string
  }
}

export interface UserListItem {
  id: number
  name: string
  email: string
  emp_code: string
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface PaginationLinkItem {
  url: string | null
  label: string
  page?: number | null
  active: boolean
}

export interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  links: PaginationLinkItem[]
  path: string
  per_page: number
  to: number
  total: number
}

export interface UsersResponse {
  data: UserListItem[]
  links: PaginationLinks
  meta: PaginationMeta
}

// 🏢 Tipos para el módulo de asistencias (Nueva API)
export type AttendanceType = 'check_in' | 'check_out'

export interface AttendanceUser {
  id: number
  name: string
  email: string
  emp_code: string
}

export interface AttendanceRecord {
  id: number
  user: AttendanceUser
  client_id: string
  timestamp: string
  latitude: number
  longitude: number
  notes?: string
  device_model?: string
  battery_percentage?: number
  signal_strength?: number
  network_type?: string
  is_internet_available?: boolean
  type: AttendanceType
  image?: string
  created_at: string
  updated_at: string
}

export interface AttendanceCreateRequest {
  user_id: number
  timestamp: string
  latitude: number
  longitude: number
  notes?: string
  device_model?: string
  battery_percentage?: number
  signal_strength?: number
  network_type?: string
  is_internet_available?: boolean
  type: AttendanceType
  image?: File | string
  client_id?: string
}

export interface AttendanceFilters {
  user_id?: number
  start_date?: string
  end_date?: string
  type?: AttendanceType
  search?: string
  month?: number
  year?: number
  sort_by?: 'timestamp' | 'created_at' | 'user_id' | 'type'
  sort_order?: 'asc' | 'desc'
  per_page?: number
}

export interface AttendancesResponse {
  data: AttendanceRecord[]
  links: PaginationLinks
  meta: PaginationMeta
}

export interface AttendanceStats {
  total_records: number
  check_ins_today: number
  check_outs_today: number
  active_users: number
  pending_sync: number
}

// 🔄 Mantener compatibilidad con tipos existentes (temporalmente)
export type TipoEvento = 'Inicio de jornada laboral' | 'Fin de jornada laboral'
export type TipoRegistro = AttendanceType
export type MetodoConexion = 'MOVIL' | 'WIFI' | 'SIN_CONEXION'

export interface AsistenciaRecord extends Omit<AttendanceRecord, 'type' | 'user' | 'latitude' | 'longitude'> {
  tipo_registro: TipoRegistro
  usuario: AttendanceUser
  latitud: number
  longitud: number
  tipo_evento?: TipoEvento
  dispositivo?: string
  bateria?: number
  metodo?: MetodoConexion
  sincronizado?: 0 | 1
  usuario_id: number
  uuid?: string
}

export interface AsistenciaCreateRequest extends AttendanceCreateRequest {
  tipo_evento?: TipoEvento
  dispositivo?: string
  bateria?: number
  metodo?: MetodoConexion
  usuario_id: number
  tipo_registro: TipoRegistro
  latitud: number
  longitud: number
  descripcion?: string
}

export interface AsistenciaFilters extends AttendanceFilters {
  usuario_id?: number
  tipo_evento?: TipoEvento
  tipo_registro?: TipoRegistro
  metodo?: MetodoConexion
  sincronizado?: 0 | 1
  fecha_desde?: string
  fecha_hasta?: string
}

export interface AsistenciasResponse extends AttendancesResponse {}

export interface AsistenciaStats {
  total_registros: number
  check_ins_hoy: number
  check_outs_hoy: number
  usuarios_activos: number
  sincronizados: number
  pendientes: number
}
