import { apiFetch } from '~/services/api'

export type EmployeeMobilityRow = {
  id: number | null
  employee_id: number
  year: number
  amount: number | string | null
  is_active?: boolean | null
  created_at: string | null
  emp_code: string
  first_name: string
  last_name: string
  department_name?: string | null
  position_name?: string | null
  has_mobility?: boolean
}

export type ApiSuccess<T> = {
  success: true
  data: T
}

export type PaginatedResponse<T> = {
  current_page: number
  data: T[]
  first_page_url: string | null
  from: number | null
  last_page: number
  last_page_url: string | null
  links: unknown[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export type ApiValidationError = {
  message: string
  errors?: Record<string, string[]>
}

export type ListEmployeeMobilityParams = {
  employee_id?: number
  year?: number
  per_page?: number
  page?: number
  paginate?: boolean
}

export type EmployeeMobilityCreatePayload = {
  employee_id: number
  year: number
  amount: number
  is_active?: boolean | null
}

export type EmployeeMobilityUpdatePayload = EmployeeMobilityCreatePayload & {
  is_active?: boolean | null
}

export type EmployeeMobilityMonthlyComment = {
  employee_id: number
  period_month: string
  monthly_comment: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type EmployeeMobilityMonthlyCommentPayload = {
  employee_id: number
  period_month: string
  monthly_comment: string | null
}

const toQueryString = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    sp.set(key, String(value))
  }
  return sp.toString()
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

export async function listEmployeeMobility(
  params: ListEmployeeMobilityParams & { paginate: false }
): Promise<ApiSuccess<EmployeeMobilityRow[]>>
export async function listEmployeeMobility(
  params?: ListEmployeeMobilityParams & { paginate?: true }
): Promise<ApiSuccess<PaginatedResponse<EmployeeMobilityRow>>>
export async function listEmployeeMobility(
  params: ListEmployeeMobilityParams = {}
): Promise<ApiSuccess<PaginatedResponse<EmployeeMobilityRow>> | ApiSuccess<EmployeeMobilityRow[]>> {
  const query = toQueryString({
    employee_id: params.employee_id,
    year: params.year,
    per_page: params.per_page,
    page: params.page,
    paginate: typeof params.paginate === 'boolean' ? (params.paginate ? 1 : 0) : undefined,
  })

  const url = query ? `/api/employee-mobility?${query}` : '/api/employee-mobility'
  return apiFetch(url, { method: 'GET' })
}

export async function createEmployeeMobility(payload: EmployeeMobilityCreatePayload) {
  return apiFetch('/api/employee-mobility', {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<ApiSuccess<EmployeeMobilityRow>>
}

export async function updateEmployeeMobility(id: number, payload: EmployeeMobilityUpdatePayload) {
  return apiFetch(`/api/employee-mobility/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }) as Promise<ApiSuccess<EmployeeMobilityRow>>
}

export async function getEmployeeMobilityMonthlyComment(params: {
  employee_id: number
  period_month: string
}) {
  const query = toQueryString(params)
  const url = `/api/employee-mobility/monthly-comments?${query}`
  return apiFetch(url, { method: 'GET' }) as Promise<ApiSuccess<EmployeeMobilityMonthlyComment> | EmployeeMobilityMonthlyComment>
}

export async function createEmployeeMobilityMonthlyComment(payload: EmployeeMobilityMonthlyCommentPayload) {
  return apiFetch('/api/employee-mobility/monthly-comments', {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<ApiSuccess<EmployeeMobilityMonthlyComment> | EmployeeMobilityMonthlyComment>
}

export async function updateEmployeeMobilityMonthlyComment(payload: EmployeeMobilityMonthlyCommentPayload) {
  return apiFetch('/api/employee-mobility/monthly-comments', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }) as Promise<ApiSuccess<EmployeeMobilityMonthlyComment> | EmployeeMobilityMonthlyComment>
}

export async function upsertEmployeeMobilityMonthlyComment(payload: EmployeeMobilityMonthlyCommentPayload) {
  try {
    return await updateEmployeeMobilityMonthlyComment(payload)
  } catch (e) {
    const status = e && typeof e === 'object' && 'status' in e ? Number((e as any).status) : null
    if (status === 404) {
      return createEmployeeMobilityMonthlyComment(payload)
    }
    throw e
  }
}

/*
Ejemplos rápidos (manejo 401/422/404):

// Listar paginado (default)
// try { const res = await listEmployeeMobility({ year: 2026, per_page: 50, page: 1 }); res.data.data }
// catch (e) { if (isApiValidationError(e)) console.log(e.errors); console.log(getApiErrorMessage(e)) }

// Listar NO paginado
// try { const res = await listEmployeeMobility({ paginate: false, year: 2026 }); res.data }
// catch (e) { console.log(getApiErrorMessage(e)) }

// Crear
// await createEmployeeMobility({ employee_id: 10, year: 2026, amount: 120 })

// Editar
// await updateEmployeeMobility(1, { employee_id: 10, year: 2026, amount: 150 })
*/
