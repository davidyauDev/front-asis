import {
  assignSystemTicket,
  changeSystemTicketStatus,
  createSystemTicket,
  deleteSystemTicket,
  listSystemTickets,
  systemTicketCategoryLabelMap,
  systemTicketCategoryOptions,
  systemTicketImpactLabelMap,
  systemTicketImpactOptions,
  systemTicketPriorityColorMap,
  systemTicketPriorityLabelMap,
  systemTicketPriorityOptions,
  systemTicketStatusColorMap,
  systemTicketStatusLabelMap,
  systemTicketStatusOptions,
  systemTicketTypeLabelMap,
  systemTicketTypeOptions,
  systemTicketUrgencyLabelMap,
  systemTicketUrgencyOptions,
  updateSystemTicket,
  type CreateSystemTicketPayload,
  type SystemTicket,
  type SystemTicketCategory,
  type SystemTicketPriority,
  type SystemTicketStatus,
  type SystemTicketType,
  type UpdateSystemTicketPayload,
} from '~/services/sistemas-ti/tickets'

type TicketStatusFilter = SystemTicketStatus | 'ALL'
type TicketPriorityFilter = SystemTicketPriority | 'ALL'
type TicketTypeFilter = SystemTicketType | 'ALL'
type TicketCategoryFilter = SystemTicketCategory | 'ALL'

export function useTicketMatrix() {
  const tickets = ref<SystemTicket[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const search = ref('')
  const statusFilter = ref<TicketStatusFilter>('ALL')
  const priorityFilter = ref<TicketPriorityFilter>('ALL')
  const typeFilter = ref<TicketTypeFilter>('ALL')
  const categoryFilter = ref<TicketCategoryFilter>('ALL')

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const filteredTickets = computed(() => {
    const query = normalize(search.value)

    return tickets.value.filter((ticket) => {
      if (statusFilter.value !== 'ALL' && ticket.status !== statusFilter.value) {
        return false
      }

      if (priorityFilter.value !== 'ALL' && ticket.priority !== priorityFilter.value) {
        return false
      }

      if (typeFilter.value !== 'ALL' && ticket.type !== typeFilter.value) {
        return false
      }

      if (categoryFilter.value !== 'ALL' && ticket.category !== categoryFilter.value) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = normalize([
        ticket.code,
        ticket.title,
        ticket.description,
        ticket.requester,
        ticket.area,
        ticket.responsible ?? '',
      ].join(' '))

      return haystack.includes(query)
    })
  })

  const stats = computed(() => {
    const list = tickets.value
    const open = list.filter(ticket => ticket.status === 'OPEN').length
    const inProgress = list.filter(ticket => ticket.status === 'IN_PROGRESS').length
    const resolved = list.filter(ticket => ticket.status === 'RESOLVED').length
    const closed = list.filter(ticket => ticket.status === 'CLOSED').length
    const breached = list.filter(ticket => ticket.slaRemainingHours <= 0 && ticket.status !== 'CLOSED').length

    return {
      total: list.length,
      open,
      inProgress,
      resolved,
      closed,
      breached,
    }
  })

  const refresh = async () => {
    loading.value = true
    error.value = null

    try {
      tickets.value = await listSystemTickets()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar los tickets.'
    } finally {
      loading.value = false
    }
  }

  const createTicket = async (payload: CreateSystemTicketPayload) => {
    await createSystemTicket(payload)
    await refresh()
  }

  const editTicket = async (ticketId: number, payload: UpdateSystemTicketPayload) => {
    await updateSystemTicket(ticketId, payload)
    await refresh()
  }

  const removeTicket = async (ticketId: number) => {
    await deleteSystemTicket(ticketId)
    await refresh()
  }

  const changeStatus = async (ticketId: number, status: SystemTicketStatus) => {
    await changeSystemTicketStatus(ticketId, status)
    await refresh()
  }

  const assignResponsible = async (ticketId: number, responsible: string | null) => {
    await assignSystemTicket(ticketId, responsible)
    await refresh()
  }

  const resetFilters = () => {
    search.value = ''
    statusFilter.value = 'ALL'
    priorityFilter.value = 'ALL'
    typeFilter.value = 'ALL'
    categoryFilter.value = 'ALL'
  }

  const getStatusLabel = (status: SystemTicketStatus) => systemTicketStatusLabelMap[status]
  const getPriorityLabel = (priority: SystemTicketPriority) => systemTicketPriorityLabelMap[priority]
  const getTypeLabel = (type: SystemTicketType) => systemTicketTypeLabelMap[type]
  const getCategoryLabel = (category: SystemTicketCategory) => systemTicketCategoryLabelMap[category]
  const getImpactLabel = (impact: SystemTicket['impact']) => systemTicketImpactLabelMap[impact]
  const getUrgencyLabel = (urgency: SystemTicket['urgency']) => systemTicketUrgencyLabelMap[urgency]
  const getStatusColor = (status: SystemTicketStatus) => systemTicketStatusColorMap[status]
  const getPriorityColor = (priority: SystemTicketPriority) => systemTicketPriorityColorMap[priority]

  const statusFilterItems = computed(() => [
    { label: 'Todos los estados', value: 'ALL' },
    ...systemTicketStatusOptions,
  ])

  const priorityFilterItems = computed(() => [
    { label: 'Todas las prioridades', value: 'ALL' },
    ...systemTicketPriorityOptions,
  ])

  const typeFilterItems = computed(() => [
    { label: 'Todos los tipos', value: 'ALL' },
    ...systemTicketTypeOptions,
  ])

  const categoryFilterItems = computed(() => [
    { label: 'Todas las categorias', value: 'ALL' },
    ...systemTicketCategoryOptions,
  ])

  return {
    tickets,
    loading,
    error,
    search,
    statusFilter,
    priorityFilter,
    typeFilter,
    categoryFilter,
    filteredTickets,
    stats,
    refresh,
    createTicket,
    editTicket,
    removeTicket,
    changeStatus,
    assignResponsible,
    resetFilters,
    getStatusLabel,
    getPriorityLabel,
    getStatusColor,
    getPriorityColor,
    getTypeLabel,
    getCategoryLabel,
    getImpactLabel,
    getUrgencyLabel,
    statusFilterItems,
    priorityFilterItems,
    typeFilterItems,
    categoryFilterItems,
    statusOptions: systemTicketStatusOptions,
    priorityOptions: systemTicketPriorityOptions,
    typeOptions: systemTicketTypeOptions,
    categoryOptions: systemTicketCategoryOptions,
    impactOptions: systemTicketImpactOptions,
    urgencyOptions: systemTicketUrgencyOptions,
  }
}
