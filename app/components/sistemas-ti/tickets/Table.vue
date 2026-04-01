<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import AssignResponsibleDialog from '~/components/sistemas-ti/tickets/AssignResponsibleDialog.vue'
import ChangeStatusDialog from '~/components/sistemas-ti/tickets/ChangeStatusDialog.vue'
import DetailsDialog from '~/components/sistemas-ti/tickets/DetailsDialog.vue'
import HistoryDialog from '~/components/sistemas-ti/tickets/HistoryDialog.vue'
import TicketColumnTable from '~/components/sistemas-ti/tickets/TicketColumnTable.vue'
import {
  deleteSystemTicket,
  systemTicketCategoryLabelMap,
  systemTicketCategoryOptions,
  systemTicketPriorityColorMap,
  systemTicketPriorityLabelMap,
  systemTicketPriorityOptions,
  systemTicketStatusColorMap,
  systemTicketStatusLabelMap,
  systemTicketStatusOptions,
  systemTicketTypeLabelMap,
  systemTicketTypeOptions,
  type SystemTicket,
  type SystemTicketCategory,
  type SystemTicketPriority,
  type SystemTicketStatus,
  type SystemTicketType,
} from '~/services/sistemas-ti/tickets'

type TicketColumnId =
  | 'ticket'
  | 'type'
  | 'priority'
  | 'status'
  | 'category'
  | 'requester'
  | 'responsible'
  | 'slaResponse'
  | 'slaResolution'
  | 'createdAt'
  | 'updatedAt'

const props = defineProps<{
  tickets: SystemTicket[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:ticket', ticket: SystemTicket): void
  (e: 'changed'): void
}>()

const toast = useToast()

const activeRow = ref<SystemTicket | null>(null)
const openDetails = ref(false)
const openReassign = ref(false)
const changeStatus = ref(false)
const openHistory = ref(false)
const openDelete = ref(false)
const deleting = ref(false)

const contextMenu = reactive({
  open: false,
  x: 0,
  y: 0,
})

const filters = reactive({
  searchTerm: '',
  requesters: [] as string[],
  responsibles: [] as string[],
  types: [] as SystemTicketType[],
  statuses: [] as SystemTicketStatus[],
  priorities: [] as SystemTicketPriority[],
  categories: [] as SystemTicketCategory[],
  startDate: '',
  endDate: '',
})

const debouncedSearch = ref('')

const columns: Array<{ id: TicketColumnId, label: string, sortable: boolean }> = [
  { id: 'ticket', label: 'Ticket', sortable: true },
  { id: 'type', label: 'Tipo', sortable: true },
  { id: 'priority', label: 'Prioridad', sortable: true },
  { id: 'status', label: 'Estado', sortable: true },
  { id: 'category', label: 'Categoria', sortable: true },
  { id: 'requester', label: 'Solicitante', sortable: true },
  { id: 'responsible', label: 'Responsable', sortable: true },
  { id: 'slaResponse', label: 'Vence respuesta', sortable: true },
  { id: 'slaResolution', label: 'Vence solucion', sortable: true },
  { id: 'createdAt', label: 'Abierto el', sortable: true },
  { id: 'updatedAt', label: 'Ultima actualizacion', sortable: true },
]

const visibleColumns = reactive<Record<TicketColumnId, boolean>>({
  ticket: true,
  type: true,
  priority: true,
  status: true,
  category: true,
  requester: true,
  responsible: true,
  slaResponse: true,
  slaResolution: true,
  createdAt: true,
  updatedAt: true,
})

type SortDirection = 'asc' | 'desc'

const sortBy = ref<TicketColumnId | null>(null)
const sortDirection = ref<SortDirection>('asc')

const perPage = ref(10)
const currentPage = ref(1)
const perPageItems = [10, 20, 30, 50].map(value => ({ label: `${value} / pag`, value }))

const normalize = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const requesterItems = computed(() => {
  const values = [...new Set(props.tickets.map(item => item.requester).filter(Boolean))]
  return values.map(value => ({ label: value, value }))
})

const responsibleItems = computed(() => {
  const values = [...new Set(props.tickets.map(item => item.responsible).filter(Boolean))] as string[]
  return [
    ...values.map(value => ({ label: value, value })),
    { label: 'Sin asignar', value: '__UNASSIGNED__' },
  ]
})

const withAll = <T extends { label: string, value: string }>(items: T[], label: string) => {
  return [{ label, value: '__ALL__' }, ...items]
}

const typeItems = computed(() => withAll(systemTicketTypeOptions as Array<{ label: string, value: string }>, 'Tipos'))
const statusItems = computed(() => withAll(systemTicketStatusOptions as Array<{ label: string, value: string }>, 'Estados'))
const priorityItems = computed(() => withAll(systemTicketPriorityOptions as Array<{ label: string, value: string }>, 'Prioridades'))
const categoryItems = computed(() => withAll(systemTicketCategoryOptions as Array<{ label: string, value: string }>, 'Categorias'))

const toDateTime = (value: string | null | undefined) => {
  if (!value) {
    return 'Sin registrar'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Sin registrar'
  }

  return date.toLocaleString()
}

const slaTone = (hours: number) => {
  if (hours <= 0) {
    return 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
  }

  if (hours <= 2) {
    return 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'
  }

  return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300'
}

const statusColor = (status: SystemTicketStatus) => systemTicketStatusColorMap[status]
const priorityColor = (priority: SystemTicketPriority) => systemTicketPriorityColorMap[priority]

const sortValue = (ticket: SystemTicket, column: TicketColumnId): string | number => {
  if (column === 'ticket') return `${ticket.code} ${ticket.title}`.toLowerCase()
  if (column === 'type') return systemTicketTypeLabelMap[ticket.type]
  if (column === 'priority') return systemTicketPriorityLabelMap[ticket.priority]
  if (column === 'status') return systemTicketStatusLabelMap[ticket.status]
  if (column === 'category') return systemTicketCategoryLabelMap[ticket.category]
  if (column === 'requester') return ticket.requester
  if (column === 'responsible') return ticket.responsible ?? ''
  if (column === 'slaResponse') return new Date(ticket.slaResponseDueAt).getTime()
  if (column === 'slaResolution') return new Date(ticket.slaResolutionDueAt).getTime()
  if (column === 'createdAt') return new Date(ticket.createdAt).getTime()
  if (column === 'updatedAt') return new Date(ticket.updatedAt).getTime()

  return ''
}

const filteredTickets = computed(() => {
  const query = normalize(debouncedSearch.value)
  const startMs = filters.startDate ? new Date(`${filters.startDate}T00:00:00`).getTime() : null
  const endMs = filters.endDate ? new Date(`${filters.endDate}T23:59:59`).getTime() : null

  return props.tickets.filter((ticket) => {
    if (filters.requesters.length && !filters.requesters.includes(ticket.requester)) {
      return false
    }

    if (filters.responsibles.length) {
      const hasUnassigned = filters.responsibles.includes('__UNASSIGNED__')
      const inResponsibles = ticket.responsible ? filters.responsibles.includes(ticket.responsible) : false

      if (!inResponsibles && !(hasUnassigned && !ticket.responsible)) {
        return false
      }
    }

    if (filters.types.length && !filters.types.includes(ticket.type)) {
      return false
    }

    if (filters.statuses.length && !filters.statuses.includes(ticket.status)) {
      return false
    }

    if (filters.priorities.length && !filters.priorities.includes(ticket.priority)) {
      return false
    }

    if (filters.categories.length && !filters.categories.includes(ticket.category)) {
      return false
    }

    const created = new Date(ticket.createdAt).getTime()
    if (startMs !== null && created < startMs) {
      return false
    }

    if (endMs !== null && created > endMs) {
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
      systemTicketTypeLabelMap[ticket.type],
      systemTicketPriorityLabelMap[ticket.priority],
      systemTicketStatusLabelMap[ticket.status],
      systemTicketCategoryLabelMap[ticket.category],
    ].join(' '))

    return haystack.includes(query)
  })
})

const sortedTickets = computed(() => {
  if (!sortBy.value) {
    return [...filteredTickets.value]
  }

  const direction = sortDirection.value === 'asc' ? 1 : -1
  const column = sortBy.value

  return [...filteredTickets.value].sort((a, b) => {
    const first = sortValue(a, column)
    const second = sortValue(b, column)

    if (typeof first === 'number' && typeof second === 'number') {
      return (first - second) * direction
    }

    return String(first).localeCompare(String(second), 'es', { sensitivity: 'base' }) * direction
  })
})

const total = computed(() => sortedTickets.value.length)
const lastPage = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))

const from = computed(() => {
  if (!total.value) {
    return 0
  }

  return (currentPage.value - 1) * perPage.value + 1
})

const to = computed(() => {
  if (!total.value) {
    return 0
  }

  return Math.min(currentPage.value * perPage.value, total.value)
})

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return sortedTickets.value.slice(start, end)
})

const pageItems = computed(() => {
  return Array.from({ length: lastPage.value }, (_, index) => index + 1)
})

const filterCount = computed(() => {
  return [
    !!debouncedSearch.value,
    filters.requesters.length > 0,
    filters.responsibles.length > 0,
    filters.types.length > 0,
    filters.statuses.length > 0,
    filters.priorities.length > 0,
    filters.categories.length > 0,
    !!filters.startDate || !!filters.endDate,
  ].filter(Boolean).length
})

const hasFilters = computed(() => filterCount.value > 0)

const activeFilterChips = computed(() => {
  return [
    {
      key: 'searchTerm',
      label: 'Busqueda',
      value: debouncedSearch.value,
      clear: () => {
        filters.searchTerm = ''
      },
    },
    {
      key: 'requesters',
      label: `Solicitantes (${filters.requesters.length})`,
      value: filters.requesters.length > 0,
      clear: () => {
        filters.requesters = []
      },
    },
    {
      key: 'responsibles',
      label: `Responsables (${filters.responsibles.length})`,
      value: filters.responsibles.length > 0,
      clear: () => {
        filters.responsibles = []
      },
    },
    {
      key: 'types',
      label: `Tipos (${filters.types.length})`,
      value: filters.types.length > 0,
      clear: () => {
        filters.types = []
      },
    },
    {
      key: 'statuses',
      label: `Estados (${filters.statuses.length})`,
      value: filters.statuses.length > 0,
      clear: () => {
        filters.statuses = []
      },
    },
    {
      key: 'priorities',
      label: `Prioridades (${filters.priorities.length})`,
      value: filters.priorities.length > 0,
      clear: () => {
        filters.priorities = []
      },
    },
    {
      key: 'categories',
      label: `Categorias (${filters.categories.length})`,
      value: filters.categories.length > 0,
      clear: () => {
        filters.categories = []
      },
    },
    {
      key: 'date',
      label: 'Rango de fechas',
      value: !!filters.startDate || !!filters.endDate,
      clear: () => {
        filters.startDate = ''
        filters.endDate = ''
      },
    },
  ].filter(item => item.value)
})

const columnItems = computed(() => {
  return columns.map(column => ({
    label: column.label,
    type: 'checkbox' as const,
    checked: visibleColumns[column.id],
    onUpdateChecked(checked: boolean) {
      visibleColumns[column.id] = checked
    },
    onSelect(event?: Event) {
      event?.preventDefault()
    },
  }))
})

const visibleHeaderColumns = computed(() => columns.filter(column => visibleColumns[column.id]))

const disabledEdit = computed(() => {
  const ticket = activeRow.value
  if (!ticket) {
    return true
  }

  return ticket.status !== 'OPEN' || ticket.responsible !== null || !!props.loading
})

const toggleSort = (column: TicketColumnId) => {
  const current = sortBy.value

  if (current !== column) {
    sortBy.value = column
    sortDirection.value = 'asc'
    return
  }

  if (sortDirection.value === 'asc') {
    sortDirection.value = 'desc'
    return
  }

  sortBy.value = null
  sortDirection.value = 'asc'
}

const sortIcon = (column: TicketColumnId) => {
  if (sortBy.value !== column) {
    return 'i-lucide-arrow-up-down'
  }

  return sortDirection.value === 'asc'
    ? 'i-lucide-arrow-up-narrow-wide'
    : 'i-lucide-arrow-down-wide-narrow'
}

const clearAllFilters = () => {
  filters.searchTerm = ''
  filters.requesters = []
  filters.responsibles = []
  filters.types = []
  filters.statuses = []
  filters.priorities = []
  filters.categories = []
  filters.startDate = ''
  filters.endDate = ''
}

const sanitizeSelectValues = (values: unknown) => {
  if (!Array.isArray(values)) {
    return []
  }

  return values.filter(value => value !== '__ALL__')
}

const handleTypeFilterUpdate = (values: unknown) => {
  filters.types = sanitizeSelectValues(values) as SystemTicketType[]
}

const handleStatusFilterUpdate = (values: unknown) => {
  filters.statuses = sanitizeSelectValues(values) as SystemTicketStatus[]
}

const handlePriorityFilterUpdate = (values: unknown) => {
  filters.priorities = sanitizeSelectValues(values) as SystemTicketPriority[]
}

const handleCategoryFilterUpdate = (values: unknown) => {
  filters.categories = sanitizeSelectValues(values) as SystemTicketCategory[]
}

const openAction = (
  ticket: SystemTicket,
  action: 'details' | 'reassign' | 'status' | 'history' | 'edit' | 'delete',
) => {
  activeRow.value = ticket
  contextMenu.open = false

  if (action === 'details') openDetails.value = true
  if (action === 'reassign') openReassign.value = true
  if (action === 'status') changeStatus.value = true
  if (action === 'history') openHistory.value = true
  if (action === 'edit') emit('update:ticket', ticket)
  if (action === 'delete') openDelete.value = true
}

const handleRowContextMenu = (event: MouseEvent, ticket: SystemTicket) => {
  event.preventDefault()
  activeRow.value = ticket
  contextMenu.open = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
}

const closeContextMenu = () => {
  contextMenu.open = false
}

const contextMenuStyle = computed(() => {
  if (!import.meta.client) {
    return {
      top: '0px',
      left: '0px',
    }
  }

  const maxX = window.innerWidth - 220
  const maxY = window.innerHeight - 260

  return {
    top: `${Math.max(8, Math.min(contextMenu.y, maxY))}px`,
    left: `${Math.max(8, Math.min(contextMenu.x, maxX))}px`,
  }
})

const handleDelete = async () => {
  if (!activeRow.value || deleting.value) {
    return
  }

  deleting.value = true

  try {
    await deleteSystemTicket(activeRow.value.id)
    emit('changed')
    toast.add({
      title: 'Ticket eliminado',
      description: `${activeRow.value.code} fue eliminado.`,
      color: 'success',
    })
    openDelete.value = false
    activeRow.value = null
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'No se pudo eliminar el ticket.',
      color: 'error',
    })
  } finally {
    deleting.value = false
  }
}

const onSubDialogSaved = () => {
  emit('changed')
}

watchDebounced(
  () => filters.searchTerm,
  (value) => {
    debouncedSearch.value = value
    currentPage.value = 1
  },
  { debounce: 350, maxWait: 700 },
)

watch(
  () => [
    filters.requesters.join('|'),
    filters.responsibles.join('|'),
    filters.types.join('|'),
    filters.statuses.join('|'),
    filters.priorities.join('|'),
    filters.categories.join('|'),
    filters.startDate,
    filters.endDate,
    sortBy.value,
    sortDirection.value,
    perPage.value,
  ],
  () => {
    currentPage.value = 1
  },
)

watch(
  () => lastPage.value,
  (value) => {
    if (currentPage.value > value) {
      currentPage.value = value
    }
  },
)

watch(
  () => props.tickets,
  () => {
    if (activeRow.value) {
      activeRow.value = props.tickets.find(ticket => ticket.id === activeRow.value?.id) || null
    }
  },
  { deep: true },
)

onMounted(() => {
  window.addEventListener('click', closeContextMenu)
  window.addEventListener('scroll', closeContextMenu, true)
  window.addEventListener('resize', closeContextMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeContextMenu)
  window.removeEventListener('scroll', closeContextMenu, true)
  window.removeEventListener('resize', closeContextMenu)
})
</script>

<template>
  <div class="space-y-4">
    <UCard class="border-gray-200/70 dark:border-gray-800/70">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_repeat(6,minmax(0,1fr))]">
        <UInput
          v-model="filters.searchTerm"
          icon="i-lucide-search"
          placeholder="Buscar tickets..."
        />

        <USelectMenu
          v-model="filters.requesters"
          multiple
          :items="requesterItems"
          value-key="value"
          label-key="label"
          placeholder="Solicitantes"
        />

        <USelectMenu
          v-model="filters.responsibles"
          multiple
          :items="responsibleItems"
          value-key="value"
          label-key="label"
          placeholder="Responsables"
        />

        <USelectMenu
          v-model="filters.types"
          multiple
          :items="typeItems"
          value-key="value"
          label-key="label"
          placeholder="Tipos"
          @update:model-value="handleTypeFilterUpdate"
        />

        <USelectMenu
          v-model="filters.statuses"
          multiple
          :items="statusItems"
          value-key="value"
          label-key="label"
          placeholder="Estados"
          @update:model-value="handleStatusFilterUpdate"
        />

        <USelectMenu
          v-model="filters.priorities"
          multiple
          :items="priorityItems"
          value-key="value"
          label-key="label"
          placeholder="Prioridades"
          @update:model-value="handlePriorityFilterUpdate"
        />

        <USelectMenu
          v-model="filters.categories"
          multiple
          :items="categoryItems"
          value-key="value"
          label-key="label"
          placeholder="Categorias"
          @update:model-value="handleCategoryFilterUpdate"
        />
      </div>

      <div class="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto]">
        <UInput v-model="filters.startDate" type="date" />
        <UInput v-model="filters.endDate" type="date" />

        <UDropdownMenu :items="columnItems" :content="{ align: 'end' }">
          <UButton color="neutral" variant="outline" icon="i-lucide-columns-3">
            Columnas
          </UButton>
        </UDropdownMenu>

        <UButton color="neutral" variant="outline" icon="i-lucide-eraser" @click="clearAllFilters">
          Limpiar
        </UButton>

        <UButton color="neutral" variant="outline" icon="i-lucide-filter">
          {{ filterCount }} filtro(s)
        </UButton>
      </div>

      <div v-if="hasFilters" class="mt-3 flex flex-wrap gap-2">
        <UBadge color="neutral" variant="soft">
          {{ filterCount }} filtros activos
        </UBadge>

        <UButton
          v-for="chip in activeFilterChips"
          :key="chip.key"
          size="xs"
          color="neutral"
          variant="soft"
          icon="i-lucide-x"
          @click="chip.clear"
        >
          {{ chip.label }}
        </UButton>
      </div>
    </UCard>

    <UCard class="border-gray-200/70 dark:border-gray-800/70">
      <div v-if="loading" class="space-y-2">
        <USkeleton class="h-14 rounded-lg" />
        <USkeleton class="h-14 rounded-lg" />
        <USkeleton class="h-14 rounded-lg" />
      </div>

      <div v-else-if="!paginatedTickets.length" class="py-10 text-center">
        <UIcon name="i-lucide-ticket-x" class="mx-auto h-9 w-9 text-gray-400" />
        <p class="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
          Sin resultados
        </p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          No se encontraron tickets con los filtros actuales.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-[1720px] w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200/70 text-left text-xs uppercase tracking-[0.12em] text-gray-500 dark:border-gray-800/70 dark:text-gray-400">
              <th
                v-for="column in visibleHeaderColumns"
                :key="column.id"
                class="px-3 py-2 font-medium"
              >
                <button
                  v-if="column.sortable"
                  type="button"
                  class="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-100"
                  @click="toggleSort(column.id)"
                >
                  {{ column.label }}
                  <UIcon :name="sortIcon(column.id)" class="h-3.5 w-3.5" />
                </button>
                <span v-else>{{ column.label }}</span>
              </th>
              <th class="px-3 py-2 font-medium">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="ticket in paginatedTickets"
              :key="ticket.id"
              class="border-b border-gray-200/70 dark:border-gray-800/70"
              @contextmenu="handleRowContextMenu($event, ticket)"
            >
              <td v-if="visibleColumns.ticket" class="px-3 py-3 align-top">
                <TicketColumnTable :ticket="ticket" />
              </td>

              <td v-if="visibleColumns.type" class="px-3 py-3 align-top">
                <UBadge color="neutral" variant="outline">
                  {{ systemTicketTypeLabelMap[ticket.type] }}
                </UBadge>
              </td>

              <td v-if="visibleColumns.priority" class="px-3 py-3 align-top">
                <UBadge :color="priorityColor(ticket.priority)" variant="soft">
                  {{ systemTicketPriorityLabelMap[ticket.priority] }}
                </UBadge>
              </td>

              <td v-if="visibleColumns.status" class="px-3 py-3 align-top">
                <UBadge :color="statusColor(ticket.status)" variant="soft">
                  {{ systemTicketStatusLabelMap[ticket.status] }}
                </UBadge>
              </td>

              <td v-if="visibleColumns.category" class="px-3 py-3 align-top">
                <UBadge color="neutral" variant="subtle">
                  {{ systemTicketCategoryLabelMap[ticket.category] }}
                </UBadge>
              </td>

              <td v-if="visibleColumns.requester" class="px-3 py-3 align-top">
                <p class="font-medium text-gray-900 dark:text-gray-100">
                  {{ ticket.requester }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ ticket.area }}
                </p>
              </td>

              <td v-if="visibleColumns.responsible" class="px-3 py-3 align-top text-sm text-gray-600 dark:text-gray-300">
                {{ ticket.responsible || 'Sin asignar' }}
              </td>

              <td v-if="visibleColumns.slaResponse" class="px-3 py-3 align-top">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ toDateTime(ticket.slaResponseDueAt) }}
                </p>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Respondio: {{ toDateTime(ticket.firstResponseAt) }}
                </p>
              </td>

              <td v-if="visibleColumns.slaResolution" class="px-3 py-3 align-top">
                <UBadge variant="soft" :class="slaTone(ticket.slaRemainingHours)">
                  {{ ticket.slaRemainingHours.toFixed(1) }}h
                </UBadge>
                <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {{ toDateTime(ticket.slaResolutionDueAt) }}
                </p>
                <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  Resuelto: {{ toDateTime(ticket.resolvedAt) }}
                </p>
              </td>

              <td v-if="visibleColumns.createdAt" class="px-3 py-3 align-top text-xs text-gray-500 dark:text-gray-400">
                {{ toDateTime(ticket.createdAt) }}
              </td>

              <td v-if="visibleColumns.updatedAt" class="px-3 py-3 align-top text-xs text-gray-500 dark:text-gray-400">
                {{ toDateTime(ticket.updatedAt) }}
              </td>

              <td class="px-3 py-3 align-top">
                <UDropdownMenu
                  :items="[
                    [{ label: 'Ver detalle', icon: 'i-lucide-eye', onSelect: () => openAction(ticket, 'details') }],
                    [{ label: 'Responsable', icon: 'i-lucide-user-plus', onSelect: () => openAction(ticket, 'reassign') }],
                    [{ label: 'Cambiar estado', icon: 'i-lucide-pencil', onSelect: () => openAction(ticket, 'status') }],
                    [{
                      label: 'Editar',
                      icon: 'i-lucide-square-pen',
                      disabled: ticket.status !== 'OPEN' || ticket.responsible !== null || !!loading,
                      onSelect: () => openAction(ticket, 'edit'),
                    }],
                    [{ label: 'Ver historial', icon: 'i-lucide-history', onSelect: () => openAction(ticket, 'history') }],
                    [{
                      label: 'Eliminar',
                      icon: 'i-lucide-trash-2',
                      color: 'error',
                      disabled: ticket.status !== 'OPEN' || ticket.responsible !== null || !!loading,
                      onSelect: () => openAction(ticket, 'delete'),
                    }],
                  ]"
                >
                  <UButton color="neutral" variant="outline" size="xs" icon="i-lucide-ellipsis" />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/70 pt-4 dark:border-gray-800/70">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Mostrando <span class="font-semibold text-gray-900 dark:text-gray-100">{{ from }}</span> a
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ to }}</span> de
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ total }}</span> tickets
        </p>

        <div class="flex items-center gap-2">
          <USelectMenu
            v-model="perPage"
            :items="perPageItems"
            value-key="value"
            label-key="label"
            class="w-28"
          />

          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-chevron-left"
            :disabled="currentPage <= 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
          />

          <div class="flex items-center gap-1">
            <UButton
              v-for="page in pageItems"
              :key="page"
              size="xs"
              :color="currentPage === page ? 'primary' : 'neutral'"
              :variant="currentPage === page ? 'solid' : 'outline'"
              @click="currentPage = page"
            >
              {{ page }}
            </UButton>
          </div>

          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-chevron-right"
            :disabled="currentPage >= lastPage"
            @click="currentPage = Math.min(lastPage, currentPage + 1)"
          />
        </div>
      </div>
    </UCard>
  </div>

  <Teleport to="body">
    <div v-if="contextMenu.open" class="fixed inset-0 z-40" @click="closeContextMenu" />
    <div
      v-if="contextMenu.open && activeRow"
      class="fixed z-50 w-52 rounded-lg border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-800 dark:bg-gray-900"
      :style="contextMenuStyle"
      @click.stop
    >
      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800" @click="openAction(activeRow, 'details')">
        <UIcon name="i-lucide-eye" class="h-4 w-4" />
        Ver detalle
      </button>
      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800" @click="openAction(activeRow, 'reassign')">
        <UIcon name="i-lucide-user-plus" class="h-4 w-4" />
        Responsable
      </button>
      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800" @click="openAction(activeRow, 'status')">
        <UIcon name="i-lucide-pencil" class="h-4 w-4" />
        Cambiar estado
      </button>
      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800" :disabled="disabledEdit" @click="openAction(activeRow, 'edit')">
        <UIcon name="i-lucide-square-pen" class="h-4 w-4" />
        Editar
      </button>
      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800" @click="openAction(activeRow, 'history')">
        <UIcon name="i-lucide-history" class="h-4 w-4" />
        Ver historial
      </button>
      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" :disabled="disabledEdit" @click="openAction(activeRow, 'delete')">
        <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
        Eliminar
      </button>
    </div>
  </Teleport>

  <DetailsDialog v-model:open="openDetails" v-model:ticket="activeRow" />
  <AssignResponsibleDialog v-model:open="openReassign" v-model:ticket="activeRow" @saved="onSubDialogSaved" />
  <ChangeStatusDialog v-model:open="changeStatus" :ticket="activeRow" @saved="onSubDialogSaved" />
  <HistoryDialog v-model:open="openHistory" v-model:ticket="activeRow" />

  <UModal v-model:open="openDelete">
    <template #content>
      <div class="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-gray-200/70 bg-white dark:border-gray-800/70 dark:bg-gray-950">
        <div class="border-b border-gray-200/70 px-5 py-4 dark:border-gray-800/70">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-red-500/10 p-2">
              <UIcon name="i-lucide-trash-2" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                Eliminar ticket
              </h3>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Esta accion no se puede deshacer.
              </p>
            </div>
          </div>
        </div>
        <div class="px-5 py-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            ¿Estas seguro de eliminar el ticket <span class="font-semibold">{{ activeRow?.code }}</span>?
          </p>
        </div>
        <div class="flex flex-col gap-3 border-t border-gray-200/70 px-5 py-4 sm:flex-row sm:justify-end dark:border-gray-800/70">
          <UButton color="neutral" variant="outline" :disabled="deleting" class="w-full sm:w-auto" @click="openDelete = false">
            Cancelar
          </UButton>
          <UButton color="error" icon="i-lucide-trash-2" :loading="deleting" class="w-full sm:w-auto" @click="handleDelete">
            Eliminar
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
