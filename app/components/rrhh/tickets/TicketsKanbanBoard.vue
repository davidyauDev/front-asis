<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import {
  closeTicket,
  createTicket,
  deleteTicket,
  getTicket,
  listAllTickets,
  type TicketCategory,
  type TicketImpact,
  type TicketPerson,
  type TicketPriority,
  type TicketRecord,
  type TicketStatus,
  type TicketType,
  type UpsertTicketPayload,
  updateTicket,
} from '~/services/rrhh/tickets'

type BoardStatusKey = TicketStatus

type TicketFormState = {
  title: string
  description: string
  type: TicketType
  impact: TicketImpact
  urgency: TicketImpact
  category?: TicketCategory
  images: File[]
}

const statusOrder: BoardStatusKey[] = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED']

const statusMeta: Record<BoardStatusKey, {
  title: string
  accentClass: string
  badgeClass: string
}> = {
  OPEN: {
    title: 'Abiertos',
    accentClass: 'bg-slate-500',
    badgeClass: 'text-slate-300',
  },
  IN_PROGRESS: {
    title: 'En proceso',
    accentClass: 'bg-sky-500',
    badgeClass: 'text-sky-300',
  },
  ON_HOLD: {
    title: 'En espera',
    accentClass: 'bg-amber-500',
    badgeClass: 'text-amber-300',
  },
  RESOLVED: {
    title: 'Resueltos',
    accentClass: 'bg-emerald-500',
    badgeClass: 'text-emerald-300',
  },
  CLOSED: {
    title: 'Cerrados',
    accentClass: 'bg-rose-500',
    badgeClass: 'text-rose-300',
  },
}

const typeLabels: Record<TicketType, string> = {
  INCIDENT: 'Incidencia',
  SERVICE_REQUEST: 'Solicitud',
}

const impactLabels: Record<TicketImpact, string> = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
}

const urgencyLabels: Record<TicketImpact, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
}

const priorityLabels: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const priorityTone: Record<TicketPriority, string> = {
  LOW: 'border-slate-200 bg-slate-50 text-slate-600',
  MEDIUM: 'border-sky-200 bg-sky-50 text-sky-700',
  HIGH: 'border-amber-200 bg-amber-50 text-amber-700',
  URGENT: 'border-rose-200 bg-rose-50 text-rose-700',
}

const typeOptions = [
  { label: 'Todas las clases', value: 'ALL' },
  { label: 'Incidencias', value: 'INCIDENT' },
  { label: 'Solicitudes', value: 'SERVICE_REQUEST' },
]

const statusOptions = [
  { label: 'Todos los estados', value: 'ALL' },
  ...statusOrder.map(status => ({ label: statusMeta[status].title, value: status })),
]

const priorityOptions = [
  { label: 'Todas las prioridades', value: 'ALL' },
  ...(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TicketPriority[]).map(priority => ({
    label: priorityLabels[priority],
    value: priority,
  })),
]

const categoryOptions = [
  { label: 'Todas las categorias', value: 'ALL' },
  { label: 'Accesos', value: 'ACCESS' },
  { label: 'Software', value: 'SOFTWARE' },
  { label: 'Equipos', value: 'EQUIPMENT' },
]

const impactFormOptions = (['LOW', 'MEDIUM', 'HIGH'] as const).map(value => ({
  label: impactLabels[value],
  value,
}))

const urgencyFormOptions = (['LOW', 'MEDIUM', 'HIGH'] as const).map(value => ({
  label: urgencyLabels[value],
  value,
}))

const categoryFormOptions = categoryOptions.slice(1)
const typeFormOptions = typeOptions.slice(1)

const toast = useToast()
const { user } = useAuth()

const tickets = ref<TicketRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const detailLoading = ref(false)
const saving = ref(false)

const search = ref('')
const statusFilter = ref<'ALL' | BoardStatusKey>('ALL')
const typeFilter = ref<'ALL' | TicketType>('ALL')
const priorityFilter = ref<'ALL' | TicketPriority>('ALL')
const categoryFilter = ref<'ALL' | TicketCategory>('ALL')
const requesterFilter = ref<'ALL' | number>('ALL')
const responsibleFilter = ref<'ALL' | number>('ALL')
const startDate = ref('')
const endDate = ref('')

const listModalOpen = ref(false)
const detailModalOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedTicket = ref<TicketRecord | null>(null)
const selectedDetail = ref<TicketRecord | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive<TicketFormState>({
  title: '',
  description: '',
  type: 'INCIDENT',
  impact: 'MEDIUM',
  urgency: 'MEDIUM',
  category: undefined,
  images: [],
})

const requesterOptions = computed(() => {
  const seen = new Map<number, string>()

  for (const ticket of tickets.value) {
    const requesterId = ticket.requester_id
    if (seen.has(requesterId)) continue
    seen.set(requesterId, formatPerson(ticket.requester, requesterId))
  }

  return [
    { label: 'Todos los solicitantes', value: 'ALL' },
    ...Array.from(seen.entries()).map(([value, label]) => ({ label, value })),
  ]
})

const responsibleOptions = computed(() => {
  const seen = new Map<number, string>()

  for (const ticket of tickets.value) {
    if (!ticket.responsible_id) continue
    if (seen.has(ticket.responsible_id)) continue
    seen.set(ticket.responsible_id, formatPerson(ticket.responsible, ticket.responsible_id))
  }

  return [
    { label: 'Todos los responsables', value: 'ALL' },
    ...Array.from(seen.entries()).map(([value, label]) => ({ label, value })),
  ]
})

const normalize = (value: string) => value
  .toLowerCase()
  .trim()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const formatPerson = (person: TicketPerson | null | undefined, fallbackId: number) => {
  if (!person) {
    return `#${fallbackId}`
  }

  const fullName = [person.firstname, person.lastname]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || `#${person.staff_id || fallbackId}`
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Sin registrar'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin registrar'

  return date.toLocaleString('es-PE')
}

const canEdit = (ticket: TicketRecord) => ticket.status === 'OPEN' && !ticket.responsible_id
const canDelete = (ticket: TicketRecord) => ticket.status === 'OPEN' && !ticket.responsible_id
const canClose = (ticket: TicketRecord) => ticket.status === 'RESOLVED'

const clearForm = () => {
  form.title = ''
  form.description = ''
  form.type = 'INCIDENT'
  form.impact = 'MEDIUM'
  form.urgency = 'MEDIUM'
  form.category = undefined
  form.images = []

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const syncFormFromTicket = (ticket: TicketRecord) => {
  form.title = ticket.title
  form.description = ticket.description
  form.type = ticket.type
  form.impact = ticket.impact
  form.urgency = ticket.urgency
  form.category = ticket.category ?? undefined
  form.images = []

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const toFilterParams = () => ({
  searchTerm: search.value.trim() || undefined,
  requesters: requesterFilter.value === 'ALL' ? undefined : [requesterFilter.value],
  responsibles: responsibleFilter.value === 'ALL' ? undefined : [responsibleFilter.value],
  statuses: statusFilter.value === 'ALL' ? undefined : [statusFilter.value],
  types: typeFilter.value === 'ALL' ? undefined : [typeFilter.value],
  priorities: priorityFilter.value === 'ALL' ? undefined : [priorityFilter.value],
  categories: categoryFilter.value === 'ALL' ? undefined : [categoryFilter.value],
  startDate: startDate.value || undefined,
  endDate: endDate.value || undefined,
})

const loadTickets = async () => {
  loading.value = true
  error.value = null

  try {
    tickets.value = await listAllTickets(toFilterParams())
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : (err && typeof err === 'object' && 'error' in err && typeof err.error === 'string')
        ? err.error
        : 'No se pudieron cargar los tickets.'
  } finally {
    loading.value = false
  }
}

watchDebounced(
  () => [
    search.value,
    statusFilter.value,
    typeFilter.value,
    priorityFilter.value,
    categoryFilter.value,
    requesterFilter.value,
    responsibleFilter.value,
    startDate.value,
    endDate.value,
  ],
  () => {
    loadTickets()
  },
  { debounce: 350, maxWait: 1000 },
)

const openCreateModal = () => {
  formMode.value = 'create'
  selectedTicket.value = null
  clearForm()
  listModalOpen.value = true
}

const openEditModal = async (ticket: TicketRecord) => {
  if (!canEdit(ticket)) {
    toast.add({
      title: 'No se puede editar',
      description: 'Solo se pueden modificar tickets abiertos y sin responsable.',
      color: 'warning',
    })
    return
  }

  formMode.value = 'edit'
  selectedTicket.value = ticket
  syncFormFromTicket(ticket)
  listModalOpen.value = true

  try {
    const detail = await getTicket(ticket.id)
    selectedTicket.value = detail
    syncFormFromTicket(detail)
  } catch (err) {
    toast.add({
      title: 'No se pudo cargar el ticket',
      description: err instanceof Error ? err.message : 'Revisa la conexion y vuelve a intentar.',
      color: 'error',
    })
  }
}

const openDetailModal = async (ticket: TicketRecord) => {
  detailModalOpen.value = true
  selectedDetail.value = ticket
  detailLoading.value = true

  try {
    selectedDetail.value = await getTicket(ticket.id)
  } catch {
    selectedDetail.value = ticket
  } finally {
    detailLoading.value = false
  }
}

const onFilesSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
    .filter(file => file.type.startsWith('image/'))
    .slice(0, 5)

  form.images = files
}

const buildPayload = (): UpsertTicketPayload | null => {
  const requesterId = selectedTicket.value?.requester_id ?? user.value?.staff_id ?? user.value?.id

  if (!requesterId) {
    toast.add({
      title: 'Sesion invalida',
      description: 'No se pudo identificar al solicitante.',
      color: 'error',
    })
    return null
  }

  if (!form.title.trim() || form.title.trim().length < 5) {
    toast.add({
      title: 'Titulo invalido',
      description: 'El titulo debe tener al menos 5 caracteres.',
      color: 'error',
    })
    return null
  }

  if (!form.description.trim() || form.description.trim().length < 10) {
    toast.add({
      title: 'Descripcion invalida',
      description: 'La descripcion debe tener al menos 10 caracteres.',
      color: 'error',
    })
    return null
  }

  if (form.type === 'SERVICE_REQUEST' && !form.category) {
    toast.add({
      title: 'Categoria requerida',
      description: 'Las solicitudes de servicio requieren una categoria.',
      color: 'error',
    })
    return null
  }

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    impact: form.impact,
    urgency: form.urgency,
    category: form.type === 'SERVICE_REQUEST' ? form.category : null,
    requesterId,
    images: form.images,
  }
}

const saveTicket = async () => {
  if (saving.value) {
    return
  }

  const payload = buildPayload()
  if (!payload) {
    return
  }

  saving.value = true

  try {
    if (formMode.value === 'create') {
      await createTicket(payload)
      toast.add({
        title: 'Ticket creado',
        description: 'La solicitud se envio correctamente.',
        color: 'success',
      })
    } else if (selectedTicket.value) {
      await updateTicket(selectedTicket.value.id, {
        ...payload,
        requesterId: selectedTicket.value.requester_id,
      })
      toast.add({
        title: 'Ticket actualizado',
        description: 'Los cambios se guardaron correctamente.',
        color: 'success',
      })
    }

    listModalOpen.value = false
    selectedTicket.value = null
    clearForm()
    await loadTickets()
  } catch (err) {
    toast.add({
      title: 'No se pudo guardar',
      description: err instanceof Error
        ? err.message
        : (err && typeof err === 'object' && 'error' in err && typeof err.error === 'string')
          ? err.error
          : 'Revisa los datos e intenta nuevamente.',
      color: 'error',
    })
  } finally {
    saving.value = false
  }
}

const handleCloseTicket = async (ticket: TicketRecord) => {
  if (!canClose(ticket)) {
    toast.add({
      title: 'No se puede cerrar',
      description: 'Solo se pueden cerrar tickets resueltos.',
      color: 'warning',
    })
    return
  }

  try {
    await closeTicket(ticket.id)
    toast.add({
      title: 'Ticket cerrado',
      description: 'El ticket paso a estado cerrado.',
      color: 'success',
    })
    await loadTickets()
  } catch (err) {
    toast.add({
      title: 'No se pudo cerrar',
      description: err instanceof Error ? err.message : 'Intenta nuevamente.',
      color: 'error',
    })
  }
}

const handleDeleteTicket = async (ticket: TicketRecord) => {
  if (!canDelete(ticket)) {
    toast.add({
      title: 'No se puede eliminar',
      description: 'Solo se pueden eliminar tickets abiertos y sin responsable.',
      color: 'warning',
    })
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(`Eliminar ${ticket.title}?`)) {
    return
  }

  try {
    await deleteTicket(ticket.id)
    toast.add({
      title: 'Ticket eliminado',
      description: 'El registro se elimino correctamente.',
      color: 'success',
    })
    await loadTickets()
  } catch (err) {
    toast.add({
      title: 'No se pudo eliminar',
      description: err instanceof Error ? err.message : 'Intenta nuevamente.',
      color: 'error',
    })
  }
}

const stats = computed(() => {
  const list = tickets.value
  const openCount = list.filter(ticket => ticket.status === 'OPEN').length
  const inProgressCount = list.filter(ticket => ticket.status === 'IN_PROGRESS').length
  const resolvedCount = list.filter(ticket => ticket.status === 'RESOLVED').length
  const closedCount = list.filter(ticket => ticket.status === 'CLOSED').length

  return [
    { label: 'Abiertos', value: openCount, icon: 'i-lucide-ticket' },
    { label: 'En proceso', value: inProgressCount, icon: 'i-lucide-loader-circle' },
    { label: 'Resueltos', value: resolvedCount, icon: 'i-lucide-badge-check' },
    { label: 'Cerrados', value: closedCount, icon: 'i-lucide-folder-closed' },
  ]
})

const columns = computed(() => statusOrder.map(status => ({
  key: status,
  title: statusMeta[status].title,
  count: tickets.value.filter(ticket => ticket.status === status).length,
  accentClass: statusMeta[status].accentClass,
  badgeClass: statusMeta[status].badgeClass,
  cards: tickets.value.filter(ticket => ticket.status === status),
})))

const cardSubtitle = (ticket: TicketRecord) => {
  const requester = formatPerson(ticket.requester, ticket.requester_id)
  const responsible = ticket.responsible_id ? formatPerson(ticket.responsible, ticket.responsible_id) : 'Sin responsable'
  return `${requester} · ${responsible}`
}

onMounted(async () => {
  await loadTickets()
})
</script>

<template>
  <div class="space-y-5">
    <UCard class="border-slate-200/80 bg-white shadow-sm" :ui="{ body: 'p-4 sm:p-5' }">
      <div class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
        <div class="space-y-2">
          <h2 class="text-2xl font-black tracking-[-0.04em] text-slate-950">
            Tickets de RRHH
          </h2>
          <p class="max-w-2xl text-sm leading-6 text-slate-600">
            Gestiona incidencias y solicitudes con la API real de tickets. El sistema calcula la prioridad de forma automatica segun impacto y urgencia.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row xl:justify-end">
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-refresh-cw"
            class="rounded-full"
            :loading="loading"
            @click="loadTickets"
          >
            Actualizar
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-plus"
            class="rounded-full"
            @click="openCreateModal"
          >
            Nuevo ticket
          </UButton>
        </div>
      </div>

      <div class="mt-5 grid gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          size="md"
          placeholder="Buscar por titulo o descripcion"
          class="xl:col-span-2"
        />
        <USelect v-model="statusFilter" :items="statusOptions" size="md" />
        <USelect v-model="typeFilter" :items="typeOptions" size="md" />
        <USelect v-model="priorityFilter" :items="priorityOptions" size="md" />
      </div>

      <div class="mt-3 grid gap-3 lg:grid-cols-4">
        <USelect v-model="categoryFilter" :items="categoryOptions" size="md" />
        <USelect v-model="requesterFilter" :items="requesterOptions" size="md" />
        <USelect v-model="responsibleFilter" :items="responsibleOptions" size="md" />
        <div class="grid grid-cols-2 gap-3">
          <UInput v-model="startDate" type="date" size="md" />
          <UInput v-model="endDate" type="date" size="md" />
        </div>
      </div>

      <UAlert
        v-if="error"
        class="mt-4"
        color="error"
        variant="soft"
        icon="i-lucide-alert-triangle"
        title="No se pudieron cargar los tickets"
        :description="error"
      />
    </UCard>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.label" class="border-slate-200/80 bg-white shadow-sm" :ui="{ body: 'p-4' }">
        <div class="flex items-center justify-between gap-3">
          <div class="space-y-1">
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
              {{ stat.label }}
            </p>
            <p class="text-3xl font-black tracking-[-0.05em] text-slate-950">
              {{ stat.value }}
            </p>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <UIcon :name="stat.icon" class="size-5" />
          </div>
        </div>
      </UCard>
    </div>

    <div class="overflow-x-auto pb-1">
      <div class="grid min-w-[1280px] gap-4 xl:grid-cols-5">
        <section
          v-for="column in columns"
          :key="column.key"
          class="flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
        >
          <header class="border-b border-slate-200 bg-white px-4 py-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="mb-3 h-1.5 w-12 rounded-full" :class="column.accentClass" />
                <h3 class="text-[15px] font-semibold leading-5 text-slate-900">
                  {{ column.title }}
                </h3>
                <p class="mt-0.5 text-xs text-slate-500">
                  {{ column.count }} tickets
                </p>
              </div>

              <UBadge
                color="neutral"
                variant="soft"
                class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                :class="column.badgeClass"
              >
                {{ column.count }}
              </UBadge>
            </div>
          </header>

          <div class="flex flex-1 flex-col gap-3 px-3 py-4">
            <template v-if="column.cards.length">
              <article
                v-for="ticket in column.cards"
                :key="ticket.id"
                class="group rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      TCK-{{ String(ticket.id).padStart(4, '0') }}
                    </p>
                    <h4 class="text-sm font-semibold leading-5 text-slate-900">
                      {{ ticket.title }}
                    </h4>
                  </div>

                  <UBadge
                    variant="soft"
                    class="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                    :class="priorityTone[ticket.priority]"
                  >
                    {{ priorityLabels[ticket.priority] }}
                  </UBadge>
                </div>

                <p class="mt-3 text-xs leading-5 text-slate-500">
                  {{ ticket.description }}
                </p>

                <div class="mt-4 grid gap-2 text-xs text-slate-500">
                  <div class="flex items-center justify-between gap-3">
                    <span>Solicitante</span>
                    <span class="font-medium text-slate-700">{{ formatPerson(ticket.requester, ticket.requester_id) }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <span>Responsable</span>
                    <span class="font-medium text-slate-700">
                      {{ ticket.responsible_id ? formatPerson(ticket.responsible, ticket.responsible_id) : 'Sin responsable' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <span>Tipo</span>
                    <span class="font-medium text-slate-700">{{ typeLabels[ticket.type] }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <span>Impacto / Urgencia</span>
                    <span class="font-medium text-slate-700">{{ impactLabels[ticket.impact] }} / {{ urgencyLabels[ticket.urgency] }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <span>Actualizado</span>
                    <span class="font-medium text-slate-700">{{ formatDateTime(ticket.updated_at) }}</span>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-2">
                  <UBadge variant="soft" class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {{ statusMeta[ticket.status].title }}
                  </UBadge>
                  <UBadge v-if="ticket.category" variant="soft" class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {{ ticket.category }}
                  </UBadge>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-2">
                  <UButton size="xs" color="neutral" variant="soft" icon="i-lucide-eye" @click="openDetailModal(ticket)">
                    Ver
                  </UButton>
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-pencil"
                    :disabled="!canEdit(ticket)"
                    @click="openEditModal(ticket)"
                  >
                    Editar
                  </UButton>
                  <UButton
                    size="xs"
                    color="success"
                    variant="soft"
                    icon="i-lucide-badge-check"
                    :disabled="!canClose(ticket)"
                    @click="handleCloseTicket(ticket)"
                  >
                    Cerrar
                  </UButton>
                  <UButton
                    size="xs"
                    color="error"
                    variant="soft"
                    icon="i-lucide-trash-2"
                    :disabled="!canDelete(ticket)"
                    @click="handleDeleteTicket(ticket)"
                  >
                    Eliminar
                  </UButton>
                </div>
              </article>
            </template>

            <div
              v-else
              class="flex flex-1 flex-col items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-transparent px-4 py-10 text-center"
            >
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
                <UIcon name="i-lucide-inbox" class="h-7 w-7" />
              </div>

              <p class="mt-4 text-sm font-medium text-slate-700">
                Sin tickets
              </p>
              <p class="mt-1 text-sm text-slate-400">
                Ajusta los filtros o crea un nuevo ticket
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <UModal
      v-model:open="listModalOpen"
      :title="formMode === 'create' ? 'Nuevo ticket' : 'Editar ticket'"
      class="w-full max-w-6xl"
    >
      <template #body>
        <form class="space-y-5" @submit.prevent="saveTicket">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700" for="ticket-title">Titulo</label>
              <UInput id="ticket-title" v-model="form.title" class="w-full" placeholder="Ej: No puedo acceder al correo" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700" for="ticket-type">Tipo</label>
              <USelect id="ticket-type" v-model="form.type" class="w-full" :items="typeFormOptions" />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700" for="ticket-impact">Impacto</label>
              <USelect id="ticket-impact" v-model="form.impact" class="w-full" :items="impactFormOptions" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700" for="ticket-urgency">Urgencia</label>
              <USelect id="ticket-urgency" v-model="form.urgency" class="w-full" :items="urgencyFormOptions" />
            </div>
          </div>

          <div v-if="form.type === 'SERVICE_REQUEST'" class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="ticket-category">Categoria</label>
            <USelect id="ticket-category" v-model="form.category" class="w-full" :items="categoryFormOptions" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="ticket-description">Descripcion</label>
            <UTextarea
              id="ticket-description"
              v-model="form.description"
              :rows="5"
              class="w-full"
              placeholder="Explica el caso, contexto y la atencion requerida."
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700" for="ticket-images">Imagenes adjuntas</label>
            <input
              id="ticket-images"
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              @change="onFilesSelected"
            >
            <p class="text-xs text-slate-500">
              Puedes adjuntar hasta 5 imagenes para respaldar el ticket.
            </p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            El solicitante se envia automaticamente desde tu sesion activa.
          </div>

          <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <UButton type="button" color="neutral" variant="soft" @click="listModalOpen = false">
              Cancelar
            </UButton>
            <UButton type="submit" color="primary" icon="i-lucide-save" :loading="saving">
              {{ formMode === 'create' ? 'Crear ticket' : 'Guardar cambios' }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UModal
      v-model:open="detailModalOpen"
      title="Detalle del ticket"
    >
      <template #body>
        <div v-if="detailLoading" class="py-8 text-center text-sm text-slate-500">
          Cargando detalle...
        </div>

        <div v-else-if="selectedDetail" class="space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge variant="soft">{{ `TCK-${String(selectedDetail.id).padStart(4, '0')}` }}</UBadge>
            <UBadge variant="soft">{{ statusMeta[selectedDetail.status].title }}</UBadge>
            <UBadge v-if="selectedDetail.category" variant="soft">{{ selectedDetail.category }}</UBadge>
          </div>

          <div>
            <h3 class="text-xl font-bold text-slate-950">{{ selectedDetail.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ selectedDetail.description }}</p>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Solicitante</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ formatPerson(selectedDetail.requester, selectedDetail.requester_id) }}</p>
              <p class="text-xs text-slate-500">ID {{ selectedDetail.requester_id }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Responsable</p>
              <p class="mt-2 text-sm font-medium text-slate-900">
                {{ selectedDetail.responsible_id ? formatPerson(selectedDetail.responsible, selectedDetail.responsible_id) : 'Sin responsable' }}
              </p>
              <p class="text-xs text-slate-500">
                {{ selectedDetail.responsible_id ? `ID ${selectedDetail.responsible_id}` : 'Aun sin asignar' }}
              </p>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Tipo</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ typeLabels[selectedDetail.type] }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Impacto</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ impactLabels[selectedDetail.impact] }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Urgencia</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ urgencyLabels[selectedDetail.urgency] }}</p>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Prioridad calculada</p>
            <UBadge class="mt-2" variant="soft" :class="priorityTone[selectedDetail.priority]">
              {{ priorityLabels[selectedDetail.priority] }}
            </UBadge>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Tiempos</p>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p class="text-xs text-slate-500">Creado</p>
                <p class="text-sm font-medium text-slate-900">{{ formatDateTime(selectedDetail.created_at) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Actualizado</p>
                <p class="text-sm font-medium text-slate-900">{{ formatDateTime(selectedDetail.updated_at) }}</p>
              </div>
            </div>
          </div>

          <div v-if="selectedDetail.images_urls?.length" class="rounded-xl border border-slate-200 bg-white p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Imagenes</p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <a
                v-for="image in selectedDetail.images_urls"
                :key="image"
                :href="image"
                target="_blank"
                rel="noreferrer"
                class="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600"
              >
                <div class="px-3 py-2 truncate">{{ image }}</div>
              </a>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
