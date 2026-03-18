import { apiFetch } from '~/services/api'

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type PaginatedResponse<T> = {
  current_page: number
  data: T[]
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
}

export type ApiValidationError = {
  message: string
  errors?: Record<string, string[]>
}

export const isApiValidationError = (error: unknown): error is ApiValidationError => {
  if (!error || typeof error !== 'object') return false
  return 'message' in error
}

export const getApiErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as any).message
    return typeof msg === 'string' ? msg : 'Error de servidor'
  }
  return 'Error de servidor'
}

export type BioTimePersonnelEmployee = {
  id: number
  emp_code: string
  first_name: string
  last_name: string
  has_mobility?: boolean | null
  email?: string | null
  mobile?: string | null
  city?: string | null
  department_id?: number | null
  department_name?: string | null
  position_id?: number | null
  position_name?: string | null
  status?: string | number | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export type ListBioTimePersonnelEmployeesParams = {
  q?: string
  department_id?: number
  position_id?: number
  status?: string | number
  is_active?: boolean
  paginate?: boolean
  per_page?: number
  page?: number
}

export type UpdateBioTimePersonnelEmployeePayload = Partial<Pick<
  BioTimePersonnelEmployee,
  | 'emp_code'
  | 'first_name'
  | 'last_name'
  | 'has_mobility'
  | 'email'
  | 'mobile'
  | 'city'
  | 'department_id'
  | 'position_id'
  | 'status'
  | 'is_active'
>>

const toQueryString = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    sp.set(key, String(value))
  }
  return sp.toString()
}

export async function listBioTimePersonnelEmployees(
  params: ListBioTimePersonnelEmployeesParams & { paginate: false }
): Promise<ApiSuccess<BioTimePersonnelEmployee[]>>
export async function listBioTimePersonnelEmployees(
  params?: ListBioTimePersonnelEmployeesParams & { paginate?: true }
): Promise<ApiSuccess<PaginatedResponse<BioTimePersonnelEmployee>>>
export async function listBioTimePersonnelEmployees(
  params: ListBioTimePersonnelEmployeesParams = {}
): Promise<ApiSuccess<PaginatedResponse<BioTimePersonnelEmployee>> | ApiSuccess<BioTimePersonnelEmployee[]>> {
  const query = toQueryString({
    q: params.q,
    department_id: params.department_id,
    position_id: params.position_id,
    status: params.status,
    is_active: typeof params.is_active === 'boolean' ? (params.is_active ? 1 : 0) : undefined,
    paginate: typeof params.paginate === 'boolean' ? (params.paginate ? 1 : 0) : undefined,
    per_page: params.per_page,
    page: params.page,
  })

  const url = query ? `/api/biotime/personnel-employees?${query}` : '/api/biotime/personnel-employees'
  return apiFetch(url, { method: 'GET' })
}

export async function getBioTimePersonnelEmployee(id: number) {
  return apiFetch(`/api/biotime/personnel-employees/${id}`, { method: 'GET' }) as Promise<
    ApiSuccess<BioTimePersonnelEmployee> | BioTimePersonnelEmployee
  >
}

export async function updateBioTimePersonnelEmployee(id: number, payload: UpdateBioTimePersonnelEmployeePayload) {
  return apiFetch(`/api/biotime/personnel-employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }) as Promise<ApiSuccess<BioTimePersonnelEmployee> | BioTimePersonnelEmployee>
}

/*
Ejemplos rápidos:

// Listar paginado
// const res = await listBioTimePersonnelEmployees({ q: '4702', per_page: 25, page: 1 })
// res.data.data

// Listar NO paginado
// const res = await listBioTimePersonnelEmployees({ paginate: false, q: 'carlos' })
// res.data

// PATCH update
// await updateBioTimePersonnelEmployee(9, { email: 'carlos@acme.com', is_active: true })
*/
