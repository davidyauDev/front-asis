<script setup lang="ts">
import DevelopmentKanbanColumn from './DevelopmentKanbanColumn.vue'
import DevelopmentRequestModal from './DevelopmentRequestModal.vue'
import {
  createDevelopmentRequest,
  listDevelopmentRequests,
  type DevelopmentPriority,
  type DevelopmentRequestListItem,
  type DevelopmentRequestRecord,
} from '~/services/rrhh/developmentRequests'

type DevelopmentStatusKey = 'registered' | 'analysis' | 'approved' | 'development' | 'qa' | 'production' | 'rejected'

type DevelopmentColumnCard = {
  code: string
  title: string
  requester: string
  area: string
  priority: string
  updatedAt?: string
  description?: string
}

const statusOrder: DevelopmentStatusKey[] = [
  'registered',
  'analysis',
  'approved',
  'development',
  'qa',
  'production',
  'rejected',
]

const statusToSection: Record<DevelopmentStatusKey, string> = {
  registered: 'REGISTERED',
  analysis: 'IN_ANALYSIS',
  approved: 'APPROVED',
  development: 'IN_DEVELOPMENT',
  qa: 'IN_TESTING',
  production: 'COMPLETED',
  rejected: 'REJECTED',
}

const statusMeta: Record<DevelopmentStatusKey, {
  title: string
  accentClass: string
  badgeClass: string
}> = {
  registered: {
    title: 'Registrados',
    accentClass: 'bg-slate-500',
    badgeClass: 'text-slate-300',
  },
  analysis: {
    title: 'En Análisis',
    accentClass: 'bg-sky-500',
    badgeClass: 'text-sky-300',
  },
  approved: {
    title: 'Aprobados',
    accentClass: 'bg-indigo-500',
    badgeClass: 'text-indigo-300',
  },
  development: {
    title: 'En Desarrollo',
    accentClass: 'bg-violet-500',
    badgeClass: 'text-violet-300',
  },
  qa: {
    title: 'En QA',
    accentClass: 'bg-amber-500',
    badgeClass: 'text-amber-300',
  },
  production: {
    title: 'En Producción',
    accentClass: 'bg-emerald-500',
    badgeClass: 'text-emerald-300',
  },
  rejected: {
    title: 'Rechazados',
    accentClass: 'bg-rose-500',
    badgeClass: 'text-rose-300',
  },
}

const priorityLabels: Record<DevelopmentPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const requestsByStatus = reactive<Record<DevelopmentStatusKey, DevelopmentColumnCard[]>>({
  registered: [],
  analysis: [],
  approved: [],
  development: [],
  qa: [],
  production: [],
  rejected: [],
})

const createModalOpen = ref(false)
const createSubmitting = ref(false)
const loading = ref(false)
const loadError = ref<string | null>(null)
const toast = useToast()
const { user } = useAuth()

const columns = computed(() =>
  statusOrder.map(key => ({
    key,
    title: statusMeta[key].title,
    count: requestsByStatus[key].length,
    accentClass: statusMeta[key].accentClass,
    badgeClass: statusMeta[key].badgeClass,
    cards: requestsByStatus[key],
  })),
)

const normalizeArea = (record: DevelopmentRequestListItem) => {
  if (record.area?.descripcion_area?.trim()) {
    return record.area.descripcion_area.trim()
  }

  return `Área #${record.area_id}`
}

const normalizeRequester = (record: DevelopmentRequestListItem) => {
  const fullName = [record.requested_by?.firstname, record.requested_by?.lastname]
    .filter(Boolean)
    .join(' ')
    .trim()

  if (fullName) {
    return fullName
  }

  return `Usuario #${record.requested_by_id}`
}

const normalizeCardDate = (record: DevelopmentRequestListItem) => {
  const source = record.latest_progress?.updated_at || record.updated_at || record.created_at
  if (!source) return undefined

  const date = new Date(String(source))
  if (Number.isNaN(date.getTime())) return undefined

  return date.toLocaleDateString('es-PE')
}

const mapRecordToCard = (record: DevelopmentRequestListItem): DevelopmentColumnCard => ({
  code: `DEV-${String(record.id).padStart(4, '0')}`,
  title: record.title,
  requester: normalizeRequester(record),
  area: normalizeArea(record),
  priority: priorityLabels[record.priority] || record.priority,
  updatedAt: normalizeCardDate(record),
  description: record.description,
})

const clearSections = () => {
  for (const key of statusOrder) {
    requestsByStatus[key].splice(0, requestsByStatus[key].length)
  }
}

const applySections = (sections: Record<string, DevelopmentRequestListItem[]>) => {
  clearSections()

  for (const statusKey of statusOrder) {
    const sectionName = statusToSection[statusKey]
    const records = sections[sectionName] || []
    const cards = records.map(mapRecordToCard)
    requestsByStatus[statusKey].splice(0, requestsByStatus[statusKey].length, ...cards)
  }
}

const loadRequests = async () => {
  loading.value = true
  loadError.value = null

  try {
    const requestedById = user.value?.staff_id ?? user.value?.id
    const response = await listDevelopmentRequests(
      requestedById ? { requestedById } : {},
    )
    applySections(response.data || {})
  } catch (error) {
    loadError.value = error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message ?? 'No se pudieron cargar las solicitudes.')
      : 'No se pudieron cargar las solicitudes.'
  } finally {
    loading.value = false
  }
}

const pushRegisteredCard = (record: DevelopmentRequestRecord) => {
  const card: DevelopmentColumnCard = {
    code: `DEV-${String(record.id).padStart(4, '0')}`,
    title: record.title,
    requester: record.requested_by
      ? [record.requested_by.firstname, record.requested_by.lastname].filter(Boolean).join(' ').trim() || `Usuario #${record.requested_by_id}`
      : `Usuario #${record.requested_by_id}`,
    area: record.area?.descripcion_area?.trim() || `Área #${record.area_id}`,
    priority: priorityLabels[record.priority] || record.priority,
    updatedAt: new Date().toLocaleDateString('es-PE'),
    description: record.description,
  }

  requestsByStatus.registered.unshift(card)
}

const handleCreateRequest = async (payload: {
  title: string
  areaId: number
  description: string
  impact: string
  priority: DevelopmentPriority
  attachment: File | null
}) => {
  console.log('Development user.value:', user.value)
  const requestedById = user.value?.staff_id ?? user.value?.id

  if (!requestedById) {
    toast.add({
      title: 'Sesión no válida',
      description: 'No se pudo identificar al solicitante.',
      color: 'error',
    })
    return
  }

  createSubmitting.value = true

  try {
    console.log('Development requestedById:', requestedById, 'user:', user.value)

    const response = await createDevelopmentRequest({
      title: payload.title,
      areaId: payload.areaId,
      description: payload.description,
      impact: payload.impact,
      priority: payload.priority,
      requestedById,
      attachment: payload.attachment,
    })

    const record = response.data
    pushRegisteredCard(record)

    toast.add({
      title: 'Requerimiento creado',
      description: response.message || 'El requerimiento se registró correctamente.',
      color: 'success',
    })

    createModalOpen.value = false
  } catch (error) {
    const message = error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message ?? 'No se pudo crear el requerimiento.')
      : 'No se pudo crear el requerimiento.'

    toast.add({
      title: 'Error al crear',
      description: message,
      color: 'error',
    })
  } finally {
    createSubmitting.value = false
  }
}

onMounted(loadRequests)
</script>

<template>
  <section class="w-full space-y-5">
    <div class="flex flex-col gap-4 px-1 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-1">
        <p class="text-[13px] font-medium uppercase tracking-[0.34em] text-slate-400">
          Módulo de Gestión
        </p>
        <h2 class="text-[30px] font-extrabold tracking-[-0.05em] text-slate-900 sm:text-[34px]">
          Gestión de Cambios y Desarrollos
        </h2>
        <p class="text-[15px] leading-6 text-slate-500">
          Flujo Kanban de requerimientos desde registro hasta producción
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 lg:pt-1">
        <UButton
          color="primary"
          icon="i-lucide-plus"
          size="sm"
          class="rounded-lg bg-[#254ea6] px-3.5 font-semibold shadow-sm hover:bg-[#1f4190]"
          @click="createModalOpen = true"
        >
          Nuevo Requerimiento
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="loadError"
      color="error"
      variant="soft"
      icon="i-lucide-alert-triangle"
      title="No se pudo cargar el tablero"
      :description="loadError"
    />

    <div v-else-if="loading" class="overflow-x-auto pb-2">
      <div class="grid min-w-[1550px] grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4">
        <USkeleton v-for="key in statusOrder" :key="key" class="h-[460px] rounded-xl" />
      </div>
    </div>

    <div v-else class="overflow-x-auto pb-2">
      <div class="grid min-w-[1550px] grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4">
        <DevelopmentKanbanColumn
          v-for="column in columns"
          :key="column.key"
          :title="column.title"
          :count="column.count"
          :accent-class="column.accentClass"
          :badge-class="column.badgeClass"
          :cards="column.cards"
        />
      </div>
    </div>

    <DevelopmentRequestModal
      v-model:open="createModalOpen"
      :submitting="createSubmitting"
      @submit="handleCreateRequest"
    />
  </section>
</template>
