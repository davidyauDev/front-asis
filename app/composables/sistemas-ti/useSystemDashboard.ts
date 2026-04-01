import {
  fetchSystemDashboard,
  type DashboardFilters,
  type DashboardPayload,
} from '~/services/sistemas-ti/dashboard'

export function useSystemDashboard() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const payload = ref<DashboardPayload | null>(null)
  const message = ref<string>('')

  const loadDashboard = async (filters: DashboardFilters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetchSystemDashboard(filters)
      payload.value = response.data
      message.value = response.message
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudo cargar el dashboard.'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    payload,
    message,
    loadDashboard,
  }
}

