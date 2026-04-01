import {
  changeDevelopmentStatus,
  createDevelopmentRequest,
  deleteDevelopmentRequest,
  developmentPriorityOptions,
  developmentStatusOptions,
  listDevelopmentRequests,
  type CreateDevelopmentRequestPayload,
  type DevelopmentRequest,
  type DevelopmentRequestPriority,
  type DevelopmentRequestStatus,
} from '~/services/sistemas-ti/developments'

type DevelopmentPriorityFilter = DevelopmentRequestPriority | 'ALL'

const STATUS_ORDER: DevelopmentRequestStatus[] = [
  'REGISTERED',
  'IN_ANALYSIS',
  'APPROVED',
  'IN_DEVELOPMENT',
  'IN_TESTING',
  'COMPLETED',
  'REJECTED',
]

export function useDevelopments() {
  const requests = ref<DevelopmentRequest[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const search = ref('')
  const priorityFilter = ref<DevelopmentPriorityFilter>('ALL')

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const filteredRequests = computed(() => {
    const query = normalize(search.value)

    return requests.value.filter((request) => {
      if (priorityFilter.value !== 'ALL' && request.priority !== priorityFilter.value) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = normalize([
        request.code,
        request.title,
        request.description,
        request.requester,
        request.area,
        request.assignedTo.join(' '),
      ].join(' '))

      return haystack.includes(query)
    })
  })

  const groupedRequests = computed<Record<DevelopmentRequestStatus, DevelopmentRequest[]>>(() => {
    const base = STATUS_ORDER.reduce((acc, status) => {
      acc[status] = []
      return acc
    }, {} as Record<DevelopmentRequestStatus, DevelopmentRequest[]>)

    for (const request of filteredRequests.value) {
      base[request.status].push(request)
    }

    for (const status of STATUS_ORDER) {
      base[status].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }

    return base
  })

  const stats = computed(() => {
    const list = requests.value
    return {
      total: list.length,
      active: list.filter(request => ['IN_ANALYSIS', 'APPROVED', 'IN_DEVELOPMENT', 'IN_TESTING'].includes(request.status)).length,
      completed: list.filter(request => request.status === 'COMPLETED').length,
      rejected: list.filter(request => request.status === 'REJECTED').length,
      urgent: list.filter(request => request.priority === 'URGENT').length,
    }
  })

  const refresh = async () => {
    loading.value = true
    error.value = null

    try {
      requests.value = await listDevelopmentRequests()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar los desarrollos.'
    } finally {
      loading.value = false
    }
  }

  const createRequest = async (payload: CreateDevelopmentRequestPayload) => {
    await createDevelopmentRequest(payload)
    await refresh()
  }

  const moveToStatus = async (id: number, status: DevelopmentRequestStatus) => {
    await changeDevelopmentStatus(id, status)
    await refresh()
  }

  const removeRequest = async (id: number) => {
    await deleteDevelopmentRequest(id)
    await refresh()
  }

  const resetFilters = () => {
    search.value = ''
    priorityFilter.value = 'ALL'
  }

  const statusLabelMap: Record<DevelopmentRequestStatus, string> = {
    REGISTERED: 'Registrado',
    IN_ANALYSIS: 'En analisis',
    APPROVED: 'Aprobado',
    IN_DEVELOPMENT: 'En desarrollo',
    IN_TESTING: 'En QA',
    COMPLETED: 'Completado',
    REJECTED: 'Rechazado',
  }

  const statusColorMap: Record<DevelopmentRequestStatus, 'neutral' | 'primary' | 'warning' | 'success' | 'error'> = {
    REGISTERED: 'neutral',
    IN_ANALYSIS: 'primary',
    APPROVED: 'primary',
    IN_DEVELOPMENT: 'warning',
    IN_TESTING: 'warning',
    COMPLETED: 'success',
    REJECTED: 'error',
  }

  const priorityLabelMap: Record<DevelopmentRequestPriority, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  }

  const priorityColorMap: Record<DevelopmentRequestPriority, 'success' | 'primary' | 'warning' | 'error'> = {
    LOW: 'success',
    MEDIUM: 'primary',
    HIGH: 'warning',
    URGENT: 'error',
  }

  const getStatusLabel = (status: DevelopmentRequestStatus) => statusLabelMap[status]
  const getStatusColor = (status: DevelopmentRequestStatus) => statusColorMap[status]
  const getPriorityLabel = (priority: DevelopmentRequestPriority) => priorityLabelMap[priority]
  const getPriorityColor = (priority: DevelopmentRequestPriority) => priorityColorMap[priority]

  const priorityFilterItems = computed(() => [
    { label: 'Todas las prioridades', value: 'ALL' },
    ...developmentPriorityOptions,
  ])

  return {
    requests,
    loading,
    error,
    search,
    priorityFilter,
    filteredRequests,
    groupedRequests,
    stats,
    refresh,
    createRequest,
    moveToStatus,
    removeRequest,
    resetFilters,
    getStatusLabel,
    getStatusColor,
    getPriorityLabel,
    getPriorityColor,
    statusOptions: developmentStatusOptions,
    priorityOptions: developmentPriorityOptions,
    priorityFilterItems,
    statusOrder: STATUS_ORDER,
  }
}

