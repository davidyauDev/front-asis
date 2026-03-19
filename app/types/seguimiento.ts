export interface Ruta {
  ticket_id: number
  number: string
  fecha_programada: string
  fecha_programada_formateada: string
  fecha_actual: string
  id_tecnico: number
  firstname: string
  lastname: string
  dni: string
  equipo: string
  serie: string
  agencia: string
  topic_id: number
  topic: string
  cliente: string
  status_id: number
  estado: string
  subject: string
  id_solucion: number | null
  incidencia: string | null
  falla: string | null
  daily_record?: unknown
}

export interface Marcacion {
  id?: number
  emp_code: string
  punch_time: string
  punch_state?: string
  verify_type?: number
  work_code?: string | null
  terminal_sn: string
  terminal_alias?: string | null
  area_alias?: string | null
  longitude?: string
  latitude?: string
  gps_location?: string
  mobile?: string
  source?: number
  purpose?: number
  crc?: string | null
  is_attendance?: number
  reserved?: string | null
  upload_time?: string
  sync_status?: number
  sync_time?: string | null
  emp_id?: number
  terminal_id?: number | null
  is_mask?: number
  temperature?: string
  identificador?: string | null
  imagen_url?: string | null
  daily_record?: unknown
}

export type SinMarcacionMessage = { message: string }

export interface Usuario {
  id: number
  dni: string
  nombre: string
  apellido: string
  nombre_completo: string
  department_id: number
  departamento: string
  position_id: number
  posicion: string
  email: string
  mobile: string
  status: number
  marcaciones: Marcacion[] | SinMarcacionMessage | null
  rutas: Ruta[]
  daily_record?: unknown
}

export interface ApiResponse {
  success: boolean
  fecha: string
  dni: string | null
  total_usuarios: number
  total_con_ruta: number
  total_sin_ruta: number
  usuarios_con_ruta: Usuario[]
  usuarios_sin_ruta: Usuario[]
}

export interface TecnicoData {
  usuario: Usuario
  rutas: Ruta[]
  iclock_transactions: Marcacion[] | SinMarcacionMessage | null
}

export type SeguimientoTab = 'con-rutas' | 'sin-rutas'
export type SeguimientoSubTab = 'marcaron' | 'no-marcaron'
export type TecnicoConRutaEntry = [string, TecnicoData]
export type ValidationTarget = TecnicoData | Usuario
