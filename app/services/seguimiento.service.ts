import type { ApiResponse, CreateEmployeeConceptPayload } from '~/types/seguimiento'
import { apiFetch } from './api'

export const getSeguimientoTecnico = async (
  params: { fecha?: string },
): Promise<ApiResponse> => {
  const query = new URLSearchParams()

  if (params.fecha) {
    query.append('fecha', params.fecha)
  }

  return apiFetch(
    `/api/seguimiento-tecnico${query.toString() ? `?${query.toString()}` : ''}`,
  )
}

export const createEmployeeConcept = async (
  body: CreateEmployeeConceptPayload,
) => {
  return apiFetch('/api/employee-concepts', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
