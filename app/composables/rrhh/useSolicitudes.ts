import { getSolicitudes, type SolicitudListItem } from '~/services/rrhh/solicitudes'

export const useSolicitudes = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const requests = ref<SolicitudListItem[]>([])
  const search = ref('')
  const fromDate = ref('')
  const toDate = ref('')

  const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase()

  const extractErrorMessage = (cause: unknown) => {
    if (cause && typeof cause === 'object') {
      const candidate = cause as { message?: unknown; data?: { message?: unknown } }
      if (typeof candidate.data?.message === 'string') return candidate.data.message
      if (typeof candidate.message === 'string') return candidate.message
    }
    return 'No se pudo consultar las solicitudes'
  }

  const getUbicacionLabel = (item: SolicitudListItem) => {
    const ubicacion = (item.ubicacion ?? '').trim()
    return ubicacion || '--'
  }

  const getEstadoRrhhLabel = (item: SolicitudListItem) => {
    const estado = normalize(item.estado_rrhh)
    if (!estado) return '--'
    if (estado === 'pendiente') return 'Pendiente'
    if (estado === 'derivar_logistica') return 'Derivado a logistica'
    if (estado === 'recojo_oficina') return 'Recojo en oficina'
    return estado.replace(/_/g, ' ')
  }

  const statusColor = (value?: string | null) => {
    const state = normalize(value)
    if (!state) return 'neutral'
    if (state.includes('rech')) return 'error'
    if (state.includes('apro')) return 'primary'
    if (state.includes('atenc') || state.includes('pend')) return 'warning'
    if (state.includes('cerr')) return 'neutral'
    return 'info'
  }

  const parseDate = (value?: string | null) => {
    if (!value) return null
    const normalized = value.includes('T') ? value : value.replace(' ', 'T')
    const date = new Date(normalized)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const formatDate = (value?: string | null) => {
    const date = parseDate(value)
    if (!date) return '--'
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const formatTime = (value?: string | null) => {
    const date = parseDate(value)
    if (!date) return '--'
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getRequesterName = (item: SolicitudListItem) => {
    return item.solicitante
      || [item.firstname, item.lastname].filter(Boolean).join(' ')
      || [item.staff?.firstname, item.staff?.lastname].filter(Boolean).join(' ')
      || '--'
  }

  const loadRequests = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await getSolicitudes({
        search: search.value.trim() || undefined,
        from: fromDate.value || undefined,
        to: toDate.value || undefined,
      })

      requests.value = response.data ?? []
    } catch (cause) {
      requests.value = []
      error.value = extractErrorMessage(cause)
    } finally {
      loading.value = false
    }
  }

  const refreshRequests = () => {
    void loadRequests()
  }

  const clearFilters = () => {
    search.value = ''
    fromDate.value = ''
    toDate.value = ''
    void loadRequests()
  }

  return {
    loading,
    error,
    requests,
    search,
    fromDate,
    toDate,
    getUbicacionLabel,
    getEstadoRrhhLabel,
    statusColor,
    formatDate,
    formatTime,
    getRequesterName,
    loadRequests,
    refreshRequests,
    clearFilters,
  }
}
