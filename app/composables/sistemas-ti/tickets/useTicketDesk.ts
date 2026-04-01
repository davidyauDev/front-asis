import {
  addTicketComment,
  assignTicketToTechnician,
  buildDeskMetrics,
  buildSupervisorSummary,
  closeTicket,
  createDeskTicket,
  escalateTicket,
  linkTicketAsset,
  listDeskAssets,
  listDeskKnowledge,
  listDeskTechnicians,
  listSystemTickets,
  putTicketOnHold,
  reopenTicket,
  resolveTicket,
  startTicketWork,
  systemTicketPriorityLabelMap,
  systemTicketStatusLabelMap,
  ticketDeskRoleOptions,
  type CreateSystemTicketPayload,
  type SystemTicket,
  type TicketDeskRole,
} from '~/services/sistemas-ti/tickets'

export function useTicketDesk() {
  const { user } = useAuth()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const role = ref<TicketDeskRole>('technician')
  const tickets = ref<SystemTicket[]>([])
  const activeTicketId = ref<number | null>(null)

  const deskAssets = ref(listDeskAssets())
  const knowledgeItems = ref(listDeskKnowledge())
  const technicians = ref(listDeskTechnicians())

  const currentUserName = computed(() => user.value?.name?.trim() || 'Usuario final')

  const activeTicket = computed(() => {
    if (activeTicketId.value === null) {
      return tickets.value[0] ?? null
    }

    return tickets.value.find(ticket => ticket.id === activeTicketId.value) ?? tickets.value[0] ?? null
  })

  const userTickets = computed(() => {
    const ownTickets = tickets.value.filter(ticket => ticket.requester === currentUserName.value)
    if (ownTickets.length) {
      return ownTickets
    }

    return tickets.value.slice(0, 3)
  })

  const metrics = computed(() => buildDeskMetrics(tickets.value))
  const supervisorSummary = computed(() => buildSupervisorSummary(tickets.value))

  const selectTicket = (ticketId: number) => {
    activeTicketId.value = ticketId
  }

  const refresh = async () => {
    loading.value = true
    error.value = null

    try {
      tickets.value = await listSystemTickets()
      if (!tickets.value.length) {
        activeTicketId.value = null
      } else if (!tickets.value.some(ticket => ticket.id === activeTicketId.value)) {
        activeTicketId.value = tickets.value[0]?.id ?? null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar los tickets de la mesa.'
    } finally {
      loading.value = false
    }
  }

  const runWithRefresh = async (
    ticketId: number,
    action: () => Promise<unknown>,
  ) => {
    await action()
    activeTicketId.value = ticketId
    await refresh()
  }

  const createTicketFromDesk = async (payload: CreateSystemTicketPayload) => {
    const created = await createDeskTicket(payload)
    activeTicketId.value = created.id
    await refresh()
  }

  const assignToTechnician = async (ticketId: number, technician: string) => {
    await runWithRefresh(ticketId, () => assignTicketToTechnician(ticketId, technician))
  }

  const assignToMe = async (ticketId: number) => {
    const actor = currentUserName.value
    await runWithRefresh(ticketId, () => assignTicketToTechnician(ticketId, actor))
  }

  const startWorkOnTicket = async (ticketId: number) => {
    await runWithRefresh(ticketId, () => startTicketWork(ticketId, currentUserName.value))
  }

  const holdForUser = async (ticketId: number, reason: string) => {
    await runWithRefresh(ticketId, () => putTicketOnHold(ticketId, currentUserName.value, reason, 'USER'))
  }

  const holdForProvider = async (ticketId: number, reason: string) => {
    await runWithRefresh(ticketId, () => putTicketOnHold(ticketId, currentUserName.value, reason, 'PROVIDER'))
  }

  const escalate = async (ticketId: number, reason: string) => {
    await runWithRefresh(ticketId, () => escalateTicket(ticketId, currentUserName.value, reason))
  }

  const resolve = async (ticketId: number, solution: string) => {
    await runWithRefresh(ticketId, () => resolveTicket(ticketId, currentUserName.value, solution))
  }

  const close = async (ticketId: number, note: string) => {
    await runWithRefresh(ticketId, () => closeTicket(ticketId, currentUserName.value, note))
  }

  const reopen = async (ticketId: number, reason: string) => {
    await runWithRefresh(ticketId, () => reopenTicket(ticketId, currentUserName.value, reason))
  }

  const addComment = async (ticketId: number, comment: string, actor?: string) => {
    const who = actor?.trim() || currentUserName.value
    await runWithRefresh(ticketId, () => addTicketComment(ticketId, who, comment))
  }

  const linkAsset = async (
    ticketId: number,
    asset: {
      name: string
      type: string
      serial: string
      status: string
    },
  ) => {
    await runWithRefresh(ticketId, () => linkTicketAsset(ticketId, currentUserName.value, asset))
  }

  const getStatusLabel = (status: SystemTicket['status']) => systemTicketStatusLabelMap[status]
  const getPriorityLabel = (priority: SystemTicket['priority']) => systemTicketPriorityLabelMap[priority]

  return {
    role,
    roleOptions: ticketDeskRoleOptions,
    tickets,
    userTickets,
    activeTicket,
    activeTicketId,
    metrics,
    supervisorSummary,
    deskAssets,
    knowledgeItems,
    technicians,
    loading,
    error,
    currentUserName,
    refresh,
    selectTicket,
    createTicketFromDesk,
    assignToTechnician,
    assignToMe,
    startWorkOnTicket,
    holdForUser,
    holdForProvider,
    escalate,
    resolve,
    close,
    reopen,
    addComment,
    linkAsset,
    getStatusLabel,
    getPriorityLabel,
  }
}
