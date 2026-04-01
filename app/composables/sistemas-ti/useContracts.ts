import {
  cancelSystemContract,
  createSystemContract,
  listSystemContractEvents,
  listSystemContractNotifications,
  listSystemContracts,
  renewSystemContract,
  systemContractStatusOptions,
  type CreateSystemContractPayload,
  type SystemContract,
  type SystemContractEvent,
  type SystemContractNotification,
  type SystemContractStatus,
} from '~/services/sistemas-ti/contracts'

type ContractStatusFilter = SystemContractStatus | 'ALL'

export function useContracts() {
  const contracts = ref<SystemContract[]>([])
  const events = ref<SystemContractEvent[]>([])
  const notifications = ref<SystemContractNotification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const search = ref('')
  const statusFilter = ref<ContractStatusFilter>('ALL')

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const filteredContracts = computed(() => {
    const query = normalize(search.value)

    return contracts.value.filter((contract) => {
      if (statusFilter.value !== 'ALL' && contract.status !== statusFilter.value) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = normalize([
        contract.code,
        contract.vendor,
        contract.serviceName,
        contract.responsible,
      ].join(' '))

      return haystack.includes(query)
    })
  })

  const stats = computed(() => {
    const list = contracts.value
    return {
      total: list.length,
      active: list.filter(contract => contract.status === 'ACTIVE').length,
      expiring: list.filter(contract => contract.status === 'EXPIRING').length,
      expired: list.filter(contract => contract.status === 'EXPIRED').length,
      canceled: list.filter(contract => contract.status === 'CANCELED').length,
    }
  })

  const refresh = async () => {
    loading.value = true
    error.value = null

    try {
      const [contractsResult, eventsResult, notificationsResult] = await Promise.all([
        listSystemContracts(),
        listSystemContractEvents(),
        listSystemContractNotifications(),
      ])

      contracts.value = contractsResult
      events.value = eventsResult
      notifications.value = notificationsResult
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudo cargar el modulo de contratos.'
    } finally {
      loading.value = false
    }
  }

  const createContract = async (payload: CreateSystemContractPayload) => {
    await createSystemContract(payload)
    await refresh()
  }

  const renewContract = async (id: number, months = 12) => {
    await renewSystemContract(id, months)
    await refresh()
  }

  const cancelContract = async (id: number) => {
    await cancelSystemContract(id)
    await refresh()
  }

  const resetFilters = () => {
    search.value = ''
    statusFilter.value = 'ALL'
  }

  const statusLabelMap: Record<SystemContractStatus, string> = {
    ACTIVE: 'Activo',
    EXPIRING: 'Por vencer',
    EXPIRED: 'Vencido',
    CANCELED: 'Cancelado',
  }

  const statusColorMap: Record<SystemContractStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
    ACTIVE: 'success',
    EXPIRING: 'warning',
    EXPIRED: 'error',
    CANCELED: 'neutral',
  }

  const getStatusLabel = (status: SystemContractStatus) => statusLabelMap[status]
  const getStatusColor = (status: SystemContractStatus) => statusColorMap[status]

  const statusFilterItems = computed(() => [
    { label: 'Todos los estados', value: 'ALL' },
    ...systemContractStatusOptions,
  ])

  return {
    contracts,
    events,
    notifications,
    loading,
    error,
    search,
    statusFilter,
    filteredContracts,
    stats,
    refresh,
    createContract,
    renewContract,
    cancelContract,
    resetFilters,
    getStatusLabel,
    getStatusColor,
    statusFilterItems,
    statusOptions: systemContractStatusOptions,
  }
}

