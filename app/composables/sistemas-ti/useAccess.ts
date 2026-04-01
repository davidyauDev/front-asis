import {
  accessRequestStatusOptions,
  accessServiceTypeOptions,
  changeAccessRequestStatus,
  createAccessRequest,
  listAccessRequests,
  updateAccessRequest,
  type AccessRequest,
  type AccessRequestStatus,
  type AccessServiceType,
  type CreateAccessRequestPayload,
} from '~/services/sistemas-ti/access'

type AccessStatusFilter = AccessRequestStatus | 'ALL'
type AccessTypeFilter = AccessServiceType | 'ALL'

export function useAccess() {
  const requests = ref<AccessRequest[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const search = ref('')
  const statusFilter = ref<AccessStatusFilter>('ALL')
  const typeFilter = ref<AccessTypeFilter>('ALL')

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const filteredRequests = computed(() => {
    const query = normalize(search.value)

    return requests.value.filter((request) => {
      if (statusFilter.value !== 'ALL' && request.status !== statusFilter.value) {
        return false
      }

      if (typeFilter.value !== 'ALL' && request.serviceType !== typeFilter.value) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = normalize([
        request.code,
        request.serviceName,
        request.requester,
        request.area,
        request.owner ?? '',
      ].join(' '))

      return haystack.includes(query)
    })
  })

  const stats = computed(() => {
    const list = requests.value
    return {
      total: list.length,
      pending: list.filter(request => request.status === 'PENDING').length,
      approved: list.filter(request => request.status === 'APPROVED').length,
      provisioned: list.filter(request => request.status === 'PROVISIONED').length,
      rejected: list.filter(request => request.status === 'REJECTED').length,
    }
  })

  const refresh = async () => {
    loading.value = true
    error.value = null

    try {
      requests.value = await listAccessRequests()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar las solicitudes de acceso.'
    } finally {
      loading.value = false
    }
  }

  const createRequest = async (payload: CreateAccessRequestPayload) => {
    await createAccessRequest(payload)
    await refresh()
  }

  const updateRequest = async (id: number, payload: { owner?: string | null, status?: AccessRequestStatus }) => {
    await updateAccessRequest(id, payload)
    await refresh()
  }

  const changeStatus = async (id: number, status: AccessRequestStatus) => {
    await changeAccessRequestStatus(id, status)
    await refresh()
  }

  const resetFilters = () => {
    search.value = ''
    statusFilter.value = 'ALL'
    typeFilter.value = 'ALL'
  }

  const statusLabelMap: Record<AccessRequestStatus, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    PROVISIONED: 'Provisionado',
    REJECTED: 'Rechazado',
  }

  const statusColorMap: Record<AccessRequestStatus, 'warning' | 'primary' | 'success' | 'error'> = {
    PENDING: 'warning',
    APPROVED: 'primary',
    PROVISIONED: 'success',
    REJECTED: 'error',
  }

  const serviceTypeLabelMap: Record<AccessServiceType, string> = {
    ERP: 'ERP',
    EMAIL: 'Correo',
    VPN: 'VPN',
    BI: 'BI',
    CRM: 'CRM',
    OTHER: 'Otro',
  }

  const getStatusLabel = (status: AccessRequestStatus) => statusLabelMap[status]
  const getStatusColor = (status: AccessRequestStatus) => statusColorMap[status]
  const getServiceTypeLabel = (type: AccessServiceType) => serviceTypeLabelMap[type]

  const statusFilterItems = computed(() => [
    { label: 'Todos los estados', value: 'ALL' },
    ...accessRequestStatusOptions,
  ])

  const typeFilterItems = computed(() => [
    { label: 'Todos los servicios', value: 'ALL' },
    ...accessServiceTypeOptions,
  ])

  return {
    requests,
    loading,
    error,
    search,
    statusFilter,
    typeFilter,
    filteredRequests,
    stats,
    refresh,
    createRequest,
    updateRequest,
    changeStatus,
    resetFilters,
    getStatusLabel,
    getStatusColor,
    getServiceTypeLabel,
    statusFilterItems,
    typeFilterItems,
    statusOptions: accessRequestStatusOptions,
    serviceTypeOptions: accessServiceTypeOptions,
  }
}

