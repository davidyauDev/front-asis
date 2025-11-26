import type { AvatarProps } from "@nuxt/ui";
import type { AttendanceType } from "~/enums/attendance";

export type Severity = "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";

export type UserStatus = "subscribed" | "unsubscribed" | "bounced";
export type SaleStatus = "paid" | "failed" | "refunded";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: AvatarProps;
  status: UserStatus;
  location: string;
}

export interface Mail {
  id: number;
  unread?: boolean;
  from: User;
  subject: string;
  body: string;
  date: string;
}

export interface Member {
  name: string;
  username: string;
  role: "member" | "owner";
  avatar: AvatarProps;
}

export interface Stat {
  title: string;
  icon: string;
  value: number | string;
  variation: number;
  formatter?: (value: number) => string;
}

export interface Sale {
  id: string;
  date: string;
  status: SaleStatus;
  email: string;
  amount: number;
}

export interface Notification {
  id: number;
  unread?: boolean;
  sender: User;
  body: string;
  date: string;
}

export type Period = "daily" | "weekly" | "monthly";

export interface Range {
  start: Date;
  end: Date;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  emp_code: string;
  role?: "admin" | "user" | "moderator";
  avatar?: {
    src?: string;
    alt?: string;
  };
}

export interface CreateUserPayload {
  name: string;
  emp_code: string;
  email: string;
  role: UserRole;
  password: string;
  active: boolean;
  
}

export interface LoginCredentials {
  emp_code: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    user: {
      id: number;
      name: string;
      email: string;
      emp_code: string;
    };
  };
}


export interface UserListItem {
  id: number;
  name: string;
  email: string;
  emp_code: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  attendances?: AttendanceRecord[];
}

export type RoleOption = {
  label: string;
  value: UserRole;
  color: Severity;
};

// export const roleOptions: Record<UserRole, RoleOption> = {
//   SUPER_ADMIN: {
//     label: "Super Administrador",
//     value: UserRole.SUPER_ADMIN,
//   },
//   ADMIN: {
//     label: "Administrador",
//     value: UserRole.ADMIN,
//   },
//   TECHNICIAN: {
//     label: "Técnico",
//     value: UserRole.TECHNICIAN,
//   },
// };

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationLinkItem {
  url: string | null;
  label: string;
  page?: number | null;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: PaginationLinkItem[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface UsersResponse {
  data: UserListItem[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

// 🏢 Tipos para el módulo de asistencias (Nueva API)
// export type AttendanceType = "check_in" | "check_out";

export interface AttendanceUser {
  id: number;
  name: string;
  email: string;
  emp_code: string;
}

export interface AttendanceRecord {
  id: number;
  user: AttendanceUser;
  client_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  notes?: string;
  device_model?: string;
  battery_percentage?: number;
  signal_strength?: number;
  network_type?: string;
  is_internet_available?: boolean;
  type: AttendanceType;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceCreateRequest {
  user_id: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  notes?: string;
  device_model?: string;
  battery_percentage?: number;
  signal_strength?: number;
  network_type?: string;
  is_internet_available?: boolean;
  type: AttendanceType;
  image?: File | string;
  client_id?: string;
}

export interface AttendanceFilters {
  user_id?: number;
  start_date?: string;
  end_date?: string;
  type?: AttendanceType;
  search?: string;
  month?: number;
  year?: number;
  sort_by?: "timestamp" | "created_at" | "user_id" | "type";
  sort_order?: "asc" | "desc";
  per_page?: number;
}

export interface AttendancesResponse {
  data: AttendanceRecord[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface AttendanceStats {
  total_records: number;
  check_ins_today: number;
  check_outs_today: number;
  active_users: number;
  pending_sync: number;
}

// 🔄 Mantener compatibilidad con tipos existentes (temporalmente)
export type TipoEvento = "Inicio de jornada laboral" | "Fin de jornada laboral";
export type TipoRegistro = AttendanceType;
export type MetodoConexion = "MOVIL" | "WIFI" | "SIN_CONEXION";

export interface AsistenciaRecord
  extends Omit<AttendanceRecord, "type" | "user" | "latitude" | "longitude"> {
  tipo_registro: TipoRegistro;
  usuario: AttendanceUser;
  latitud: number;
  longitud: number;
  tipo_evento?: TipoEvento;
  dispositivo?: string;
  bateria?: number;
  metodo?: MetodoConexion;
  sincronizado?: 0 | 1;
  usuario_id: number;
  uuid?: string;
}

export interface AsistenciaCreateRequest extends AttendanceCreateRequest {
  address?: string;
  emp_code?: string;
  tipo_evento?: TipoEvento;
  dispositivo?: string;
  bateria?: number;
  metodo?: MetodoConexion;
  usuario_id: number;
  tipo_registro: TipoRegistro;
  latitud: number;
  longitud: number;
  descripcion?: string;
}

export interface AsistenciaFilters extends AttendanceFilters {
  usuario_id?: number;
  tipo_evento?: TipoEvento;
  tipo_registro?: TipoRegistro;
  metodo?: MetodoConexion;
  sincronizado?: 0 | 1;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface AsistenciasResponse extends AttendancesResponse {}

export interface AsistenciaStats {
  total_registros: number;
  check_ins_hoy: number;
  check_outs_hoy: number;
  usuarios_activos: number;
  sincronizados: number;
  pendientes: number;
}

// 🗺️ Tipos para el módulo de Rutas y Tracking GPS
export interface GPSPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  speed?: number; // km/h
  altitude?: number;
  heading?: number; // grados (0-360)
}

export interface StopPoint extends GPSPoint {
  duration: number; // minutos
  address?: string;
  notes?: string;
}

export interface Route {
  id: string;                   
  user_id: number;
  user: AttendanceUser;
  date: string;                 
  check_in?: GPSPoint;          
  check_out?: GPSPoint;         
  attendances: GPSPoint[];     
  points: [number, number][];   
  start_point?: [number, number];
  end_point?: [number, number];
  color?: string;               

}

export interface RouteFilters {
  date?: string;
}

export interface RouteStats {
  total_routes: number;
  total_distance: number;
  total_duration: number;
  average_distance: number;
  average_duration: number;
  most_active_user?: AttendanceUser;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapConfig {
  center: [number, number]; // [lat, lng]
  zoom: number;
  stopMinDuration: number; // minutos para considerar una parada
}
