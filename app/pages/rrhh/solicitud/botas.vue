<script setup lang="ts">
import {
  aprobarSolicitudCompraFinal,
  enviarSolicitudCompraGerencia,
  getSolicitudesCompraRrhh,
  rechazarSolicitudCompra,
  type ComprobanteGastoRrhhItem,
  type SolicitudCompraWorkflowActionPayload,
} from '~/services/rrhh/solicitudes'

definePageMeta({ middleware: 'auth' })

const { openNotifications: openRrhhNotifications } = useRrhhNotificationsPanel()

useHead({
  title: 'RRHH - Comprobantes de gasto',
})

const loading = shallowRef(false)
const error = shallowRef<string | null>(null)
const comprobantes = shallowRef<ComprobanteGastoRrhhItem[]>([])
const manageModalOpen = shallowRef(false)
const managingItemId = shallowRef<number | null>(null)
const manageSubmitting = shallowRef(false)
const manageComment = shallowRef('')
const imagePreviewOpen = shallowRef(false)
const imagePreviewUrl = shallowRef<string | null>(null)
const emailModalOpen = shallowRef(false)
const emailTargetName = shallowRef('')
const rejectConfirmOpen = shallowRef(false)
const rejectCommentModalOpen = shallowRef(false)
const rejectingItemId = shallowRef<number | null>(null)
const rejectComment = shallowRef('')
const rejectSubmitting = shallowRef(false)
const staffIdFilter = shallowRef('')
const entriesView = shallowRef('100')
const activeListTab = shallowRef<'pendiente_rrhh' | 'pendiente_gerencia' | 'aprobados' | 'rechazados' | 'reembolso' | 'cerrado'>('pendiente_rrhh')
const searchFilter = shallowRef('')
const toast = useToast()

const tabsConfig = [
  { key: 'pendiente_rrhh', label: 'Pendiente RRHH', icon: 'i-lucide-user-check' },
  { key: 'pendiente_gerencia', label: 'Pendiente Gerencia', icon: 'i-lucide-briefcase-business' },
  { key: 'aprobados', label: 'Aprobados', icon: 'i-lucide-check-check' },
  { key: 'rechazados', label: 'Rechazados', icon: 'i-lucide-x-circle' },
  { key: 'reembolso', label: 'Reembolso', icon: 'i-lucide-wallet' },
  { key: 'cerrado', label: 'Cerrado', icon: 'i-lucide-lock' },
] as const

const getEstadoIdByTab = () => {
  if (activeListTab.value === 'pendiente_rrhh') return 7
  if (activeListTab.value === 'pendiente_gerencia') return 8
  if (activeListTab.value === 'aprobados') return 9
  if (activeListTab.value === 'rechazados') return 10
  return undefined
}

type WorkflowState = 'pendiente_rrhh' | 'pendiente_gerencia' | 'aprobada_final' | 'rechazada'
type SolicitudDetalle = {
  id: number
  id_producto: number | string
  cantidad?: number | string | null
  precio_estimado?: number | string | null
  precio_real?: number | string | null
  descripcion_adicional?: string | null
  ruta_imagen?: string | null
  url_imagen?: string | null
  producto?: string | {
    codigo_producto?: string | null
    descripcion?: string | null
    nombre?: string | null
  } | null
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

const formatMoney = (amount?: number | string | null) => {
  const value = typeof amount === 'number' ? amount : Number(amount ?? 0)
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue)
}

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '--'
  return String(value)
}

const parseNumberFilter = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

const parseTextFilter = (value: string) => {
  const trimmed = value.trim()
  return trimmed || undefined
}

const inferWorkflowState = (estado?: string | null): WorkflowState => {
  const normalized = (estado ?? '').toLowerCase()
  if (normalized.includes('rech')) return 'rechazada'
  if (normalized.includes('aprob')) return 'aprobada_final'
  if (normalized.includes('geren')) return 'pendiente_gerencia'
  return 'pendiente_rrhh'
}

const getVisibleEstado = (item: ComprobanteGastoRrhhItem): WorkflowState => {
  const canonical = item.workflow_state
  if (canonical === 'pendiente_rrhh' || canonical === 'pendiente_gerencia' || canonical === 'aprobada_final' || canonical === 'rechazada') {
    return canonical
  }
  return inferWorkflowState(item.solicitud_gasto.estado)
}

const getEstadoColor = (estado?: WorkflowState | string | null): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  const normalized = (estado ?? '').toLowerCase()
  if (normalized === 'pendiente_rrhh') return 'warning'
  if (normalized === 'pendiente_gerencia') return 'info'
  if (normalized === 'aprobada_final') return 'success'
  if (normalized === 'rechazada') return 'error'
  if (normalized.includes('aprob')) return 'success'
  if (normalized.includes('pend')) return 'warning'
  if (normalized.includes('rech')) return 'error'
  if (normalized.includes('pag')) return 'info'
  return 'neutral'
}

const getEstadoLabel = (estado?: WorkflowState | string | null) => {
  if (estado === 'pendiente_rrhh') return 'Pendiente RRHH'
  if (estado === 'pendiente_gerencia') return 'Pendiente Gerencia'
  if (estado === 'aprobada_final') return 'Aprobada final'
  if (estado === 'rechazada') return 'Rechazada'
  const normalized = (estado ?? '').trim()
  return normalized || '--'
}

const getEstadoDetalleNombre = (item: ComprobanteGastoRrhhItem) => {
  const solicitudGasto = item.solicitud_gasto as typeof item.solicitud_gasto & {
    estado_detalle?: { nombre?: string | null } | null
  }
  const estadoDetalle = solicitudGasto?.estado_detalle
  const nombre = estadoDetalle?.nombre?.trim()
  return nombre || null
}

const getEstadoDisplayLabel = (item: ComprobanteGastoRrhhItem) => {
  return getEstadoDetalleNombre(item) || '--'
}

const getItemDetalles = (item: ComprobanteGastoRrhhItem): SolicitudDetalle[] => {
  const fromNewApi = (item as ComprobanteGastoRrhhItem & { detalles?: SolicitudDetalle[] }).detalles
  if (Array.isArray(fromNewApi)) return fromNewApi
  if (Array.isArray(item.solicitud_gasto_detalles)) return item.solicitud_gasto_detalles as SolicitudDetalle[]
  return []
}

const getDetalleImageUrl = (detalle: SolicitudDetalle) => {
  const url = detalle.url_imagen || detalle.ruta_imagen
  if (!url) return null
  const normalized = url.trim()
  return normalized || null
}

const openImagePreview = (url?: string | null) => {
  if (!url) return
  imagePreviewUrl.value = url
  imagePreviewOpen.value = true
}

const openEmailModal = (item: ComprobanteGastoRrhhItem) => {
  emailTargetName.value = getSolicitanteLabel(item)
  emailModalOpen.value = true
}

const emailBodyPreview = computed(() => {
  return `Hola ${emailTargetName.value || 'XXXXXX'} buenas tardes,
Con respecto a tus botas de seguridad fueron aprobados, favor de tener en cuenta lo siguiente:

- Deben ser botas dielectricas y con puntera de seguridad (solicitar ficha tecnica a la tienda)
- El monto subvencionado es de s/130.00, el cual será reembolsado con la factura respectiva de botas
- Si el monto de botas es mayor al indicado, el excedente deberá ser subvencionado por el trabajador, de igual manera presentando la factura de botas.

Cualquier consulta adicional favor de comentarme.`
})

const getDetalleProductoLabel = (detalle: SolicitudDetalle) => {
  if (typeof detalle.producto === 'string') {
    const producto = detalle.producto.trim()
    if (producto) return producto
  }

  if (detalle.producto && typeof detalle.producto === 'object') {
    const descripcion = detalle.producto.descripcion?.trim()
    if (descripcion) return descripcion
    const nombre = detalle.producto.nombre?.trim()
    if (nombre) return nombre
  }

  return `Producto #${detalle.id_producto}`
}

const getComprobanteById = (id?: number | null) => {
  if (!id) return null
  return comprobantes.value.find((item) => item.id === id) ?? null
}

const managingItem = computed(() => getComprobanteById(managingItemId.value))
const managingState = computed<WorkflowState | null>(() => {
  if (!managingItem.value) return null
  return getVisibleEstado(managingItem.value)
})

const getSolicitanteLabel = (item: ComprobanteGastoRrhhItem) => {
  const name = item.solicitud_gasto.solicitante?.trim()
  return name || '--'
}

const getComprobanteTipo = (item: ComprobanteGastoRrhhItem) => {
  const tipo = item.comprobante?.tipo?.trim()
  return tipo || '--'
}

const openManageModal = (item: ComprobanteGastoRrhhItem) => {
  managingItemId.value = item.id
  manageComment.value = ''
  manageModalOpen.value = true
}

const closeManageModal = () => {
  manageModalOpen.value = false
  managingItemId.value = null
  manageComment.value = ''
}

const closeRejectCommentModal = () => {
  rejectCommentModalOpen.value = false
  rejectingItemId.value = null
  rejectComment.value = ''
}

const getManagePayload = (): SolicitudCompraWorkflowActionPayload => {
  const comentario = manageComment.value.trim()
  return comentario ? { comentario } : {}
}

const extractActionErrorMessage = (cause: unknown) => {
  if (cause && typeof cause === 'object') {
    const candidate = cause as { message?: unknown; data?: { message?: unknown } }
    if (typeof candidate.data?.message === 'string') return candidate.data.message
    if (typeof candidate.message === 'string') return candidate.message
  }
  return 'No se pudo completar la accion.'
}

const executeManageAction = async (
  action: (id: number, payload: SolicitudCompraWorkflowActionPayload) => Promise<{ success: boolean; message?: string }>,
  successTitle: string,
  successColor: 'success' | 'info' | 'error',
) => {
  if (!managingItem.value || manageSubmitting.value) return

  const id = managingItem.value.id
  manageSubmitting.value = true

  try {
    const response = await action(id, getManagePayload())
    toast.add({
      title: successTitle,
      description: response.message || 'Operacion realizada correctamente.',
      color: successColor,
    })
    closeManageModal()
    await loadComprobantes()
  } catch (cause) {
    toast.add({
      title: 'Error',
      description: extractActionErrorMessage(cause),
      color: 'error',
    })
  } finally {
    manageSubmitting.value = false
  }
}

const sendToGerenciaFromManageModal = async () => {
  if (managingState.value === 'pendiente_rrhh' && !manageComment.value.trim()) {
    toast.add({
      title: 'Comentario requerido',
      description: 'Agrega un comentario antes de derivar a gerencia.',
      color: 'warning',
    })
    return
  }
  await executeManageAction(enviarSolicitudCompraGerencia, 'Enviado a gerencia', 'info')
}

const approveFinalFromManageModal = async () => {
  await executeManageAction(aprobarSolicitudCompraFinal, 'Solicitud aprobada final', 'success')
}

const openRejectCommentModal = (item: ComprobanteGastoRrhhItem) => {
  const state = getVisibleEstado(item)
  if (!(state === 'pendiente_rrhh' || state === 'pendiente_gerencia')) return
  rejectingItemId.value = item.id
  rejectComment.value = ''
  rejectCommentModalOpen.value = true
}

const openRejectConfirmFromTable = () => {
  if (!rejectingItemId.value || !rejectComment.value.trim() || rejectSubmitting.value) return
  rejectConfirmOpen.value = true
}

const confirmRejectFromTable = async () => {
  if (!rejectingItemId.value || rejectSubmitting.value) return
  rejectSubmitting.value = true

  try {
    const response = await rechazarSolicitudCompra(rejectingItemId.value, { comentario: rejectComment.value.trim() })
    toast.add({
      title: 'Solicitud rechazada',
      description: response.message || 'Operacion realizada correctamente.',
      color: 'error',
    })
    closeRejectCommentModal()
    await loadComprobantes()
  } catch (cause) {
    toast.add({
      title: 'Error',
      description: extractActionErrorMessage(cause),
      color: 'error',
    })
  } finally {
    rejectSubmitting.value = false
  }
}

const confirmRejectAction = async () => {
  rejectConfirmOpen.value = false
  await confirmRejectFromTable()
}

const getFlowStageTitle = (estado?: WorkflowState | null) => {
  if (estado === 'pendiente_rrhh') return 'Validacion RRHH'
  if (estado === 'pendiente_gerencia') return 'Decision de gerencia'
  if (estado === 'aprobada_final') return 'Solicitud cerrada: aprobada'
  if (estado === 'rechazada') return 'Solicitud cerrada: rechazada'
  return 'Gestion de solicitud'
}

const getFlowStageDescription = (estado?: WorkflowState | null) => {
  if (estado === 'pendiente_rrhh') return 'Primer paso: validar la solicitud y enviarla a gerencia.'
  if (estado === 'pendiente_gerencia') return 'Esperando decision de gerencia: aprobar final o rechazar.'
  if (estado === 'aprobada_final') return 'No hay acciones pendientes para esta solicitud.'
  if (estado === 'rechazada') return 'No hay acciones pendientes para esta solicitud.'
  return 'Flujo de aprobacion de solicitud de botas.'
}

const canSendToGerencia = computed(() => managingState.value === 'pendiente_rrhh')
const canSendToGerenciaWithComment = computed(() => {
  if (!canSendToGerencia.value) return false
  return manageComment.value.trim().length > 0
})
const canApproveFinal = computed(() => managingState.value === 'pendiente_gerencia')

const filteredComprobantes = computed(() => {
  const search = searchFilter.value.trim().toLowerCase()

  return comprobantes.value.filter((item) => {
    const solicitante = getSolicitanteLabel(item).toLowerCase()
    const username = (item.solicitud_gasto.username ?? '').toLowerCase()

    const matchesSearch = !search || solicitante.includes(search) || username.includes(search) || String(item.solicitud_gasto_id).includes(search)

    return matchesSearch
  })
})

const pagedComprobantes = computed(() => {
  const take = Number(entriesView.value)
  if (!Number.isFinite(take) || take <= 0) return filteredComprobantes.value
  return filteredComprobantes.value.slice(0, take)
})

const visibleComprobantes = computed(() => pagedComprobantes.value)
const showActionsColumn = computed(() => activeListTab.value !== 'pendiente_gerencia')
const tableColspan = computed(() => (showActionsColumn.value ? 9 : 8))

const clearFilters = () => {
  searchFilter.value = ''
  entriesView.value = '100'
}

const extractErrorMessage = (cause: unknown) => {
  if (cause && typeof cause === 'object') {
    const candidate = cause as { message?: unknown; data?: { message?: unknown } }
    if (typeof candidate.data?.message === 'string') return candidate.data.message
    if (typeof candidate.message === 'string') return candidate.message
  }
  return 'No se pudieron consultar los comprobantes de gasto.'
}

const loadComprobantes = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await getSolicitudesCompraRrhh({
      staff_id: parseNumberFilter(staffIdFilter.value),
      estado_id: getEstadoIdByTab(),
      id_area: 11,
    })

    comprobantes.value = response.data ?? []

    if (manageModalOpen.value && managingItemId.value && !comprobantes.value.some((item) => item.id === managingItemId.value)) {
      closeManageModal()
    }
  } catch (cause) {
    comprobantes.value = []
    closeManageModal()
    error.value = extractErrorMessage(cause)
  } finally {
    loading.value = false
  }
}

const refreshComprobantes = () => {
  void loadComprobantes()
}


onMounted(() => {
  void loadComprobantes()
})

watch(activeListTab, () => {
  void loadComprobantes()
})
</script>

<template>
  <UDashboardPanel id="solicitud-botas">
    <template #header>
      <AppDashboardHeader
        title="Solicitudes Botas de seguridad"
        :show-live-badge="false"
        notification-attention
        notification-tooltip="Alertas RRHH"
        @notification-click="openRrhhNotifications"
      />
    </template>

    <template #body>
      <div class="space-y-5">
        <div class="mx-5 overflow-hidden rounded-2xl   dark:bg-gray-950/60">
         

          <div class="border-b border-gray-200 px-4 pt-4 dark:border-gray-800">
            <div class="flex flex-wrap gap-2 pb-3">
              <button
                v-for="tab in tabsConfig"
                :key="tab.key"
                type="button"
                class="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all"
                :class="activeListTab === tab.key
                  ? 'border-[#2d5fc0] bg-[#2d5fc0] text-white shadow-sm shadow-[#2d5fc0]/25'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-[#2d5fc0]/40 hover:bg-[#f4f8ff] hover:text-[#2d5fc0] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-[#2d5fc0]/40 dark:hover:bg-gray-900/90'"
                @click="activeListTab = tab.key"
              >
                <UIcon :name="tab.icon" class="h-4 w-4" />
                <span>{{ tab.label }}</span>
                <span
                  class="inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  :class="activeListTab === tab.key ? 'bg-white/25 text-white' : 'bg-[#eaf1ff] text-[#2d5fc0] dark:bg-gray-800 dark:text-gray-200'"
                >
                  {{ comprobantes.length }}
                </span>
              </button>
            </div>
          </div>

          <div class="border-t-2 border-[#2d5fc0]/90 px-4 py-4 dark:border-[#2d5fc0]/70">
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div class="xl:col-span-2">
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Buscar</label>
                <UInput
                  v-model="searchFilter"
                  icon="i-lucide-search"
                  placeholder="Solicitante, usuario o ID..."
                  class="w-full"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Mostrar</label>
                <select
                  v-model="entriesView"
                  class="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2d5fc0] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="25">25 registros</option>
                  <option value="50">50 registros</option>
                  <option value="100">100 registros</option>
                  <option value="200">200 registros</option>
                </select>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Mostrando {{ visibleComprobantes.length }} de {{ comprobantes.length }} registros.
              </p>
              <UButton
                color="neutral"
                variant="soft"
                size="xs"
                icon="i-lucide-rotate-ccw"
                @click="clearFilters"
              >
                Limpiar filtros
              </UButton>
            </div>
          </div>
          <div class="mx-4 mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div class="min-h-[400px] max-h-[65vh] overflow-auto">
            <table class="min-w-[1280px] w-full border-separate border-spacing-0">
              <thead class="bg-[#efedf6] text-gray-600 dark:bg-gray-900 dark:text-gray-200">
                <tr>
                  <th class="w-[80px] rounded-tl-2xl px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">ID</th>
                  <th class="w-[200px] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">SOLICITANTE</th>
                  <th class="w-[120px] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">ESTADO</th>
                  <th class="w-[150px] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">FECHA SOLICITUD</th>
                  <th class="w-[120px] px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">MONTO</th>
                  <th class="w-[340px] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">PRODUCTO</th>
                  <th class="w-[120px] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">IMAGEN</th>
                  <th
                    v-if="showActionsColumn"
                    class="w-[140px] rounded-tr-2xl px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider"
                  >
                    ACCIONES
                  </th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                <template v-if="loading">
                  <tr>
                    <td :colspan="tableColspan" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div class="flex items-center justify-center gap-3">
                        <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
                        <span>Cargando comprobantes...</span>
                      </div>
                    </td>
                  </tr>
                </template>

                <template v-else-if="error">
                  <tr>
                    <td :colspan="tableColspan" class="px-3 py-8 text-center text-sm text-red-600 dark:text-red-400">
                      <div class="space-y-3">
                        <p class="font-semibold">{{ error }}</p>
                        <UButton
                          color="primary"
                          variant="soft"
                          class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                          :loading="loading"
                          @click="refreshComprobantes"
                        >
                          Reintentar
                        </UButton>
                      </div>
                    </td>
                  </tr>
                </template>

                <template v-else>
                  <template v-for="item in visibleComprobantes" :key="`comprobante-row-${item.id}`">
                    <tr class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60">
                      <td class="px-3 py-3 text-center text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                        {{ item.solicitud_gasto_id }}
                      </td>
                      <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                        <div class="space-y-1">
                          <p class="max-w-[180px] truncate font-medium">{{ getSolicitanteLabel(item) }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ displayValue(item.solicitud_gasto.username) }}
                          </p>
                        </div>
                      </td>
                      <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <UBadge class="capitalize" variant="subtle" :color="getEstadoColor(getVisibleEstado(item))">
                          {{ getEstadoDisplayLabel(item) }}
                        </UBadge>
                      </td>
                      <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <div class="space-y-1">
                          <p class="font-medium">{{ formatDate(item.solicitud_gasto.fecha_solicitud) }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(item.solicitud_gasto.fecha_solicitud) }}</p>
                        </div>
                      </td>
                      <td class="px-3 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        S/ 130.00
                      </td>
                      <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                        <p class="max-w-[330px] whitespace-normal break-words font-medium leading-5">
                          {{ getItemDetalles(item).length ? getDetalleProductoLabel(getItemDetalles(item)[0]) : '--' }}
                        </p>
                        <p
                          v-if="getItemDetalles(item).length > 1"
                          class="text-xs text-gray-500 dark:text-gray-400"
                        >
                          +{{ getItemDetalles(item).length - 1 }} adicional(es)
                        </p>
                      </td>
                      <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <button
                          v-if="getItemDetalles(item).length && getDetalleImageUrl(getItemDetalles(item)[0])"
                          type="button"
                          class="group inline-flex"
                          @click="openImagePreview(getDetalleImageUrl(getItemDetalles(item)[0]))"
                        >
                          <img
                            :src="getDetalleImageUrl(getItemDetalles(item)[0]) || ''"
                            alt="Producto"
                            class="h-12 w-12 rounded-md border border-gray-200 object-cover transition group-hover:opacity-90 dark:border-gray-700"
                          >
                        </button>
                        <div
                          v-else
                          class="inline-flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-lg dark:border-gray-700 dark:bg-gray-900"
                          title="Sin imagen"
                        >
                          <UIcon name="i-lucide-image-off" class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      </td>
                      <td v-if="showActionsColumn" class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <div class="flex items-center justify-center gap-2">
                          <UButton
                            color="primary"
                            variant="soft"
                            size="xs"
                            icon="i-lucide-send"
                            class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                            @click.stop="openManageModal(item)"
                          >
                            Derivar
                          </UButton>
                          <UButton
                            color="error"
                            variant="soft"
                            size="xs"
                            icon="i-lucide-x"
                            class="rounded-full bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900"
                            @click.stop="openRejectCommentModal(item)"
                          >
                            Rechazar
                          </UButton>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <tr v-if="!visibleComprobantes.length">
                    <td :colspan="tableColspan" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No hay comprobantes de gasto para mostrar.
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="manageModalOpen"
    class="w-full max-w-6xl"
    :title="`Gestionar solicitud #${managingItem?.solicitud_gasto.id ?? '--'}`"
    
  >
    <template #content>
      <div class="space-y-4 bg-white p-0 dark:bg-gray-950">
        <div class="flex items-center justify-between bg-[#2d5fc0] px-5 py-3 text-white">
          <p class="text-lg font-semibold uppercase tracking-wide">Gestionar solicitud</p>
          <span class="rounded-md bg-white/20 px-2 py-1 text-xs font-semibold">
            #{{ managingItem?.solicitud_gasto.id ?? '--' }}
          </span>
        </div>

        <div class="space-y-4 px-5 pb-5">
          <div v-if="managingItem" class="grid gap-3 md:grid-cols-2">
            <div>
              <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Solicitante</p>
              <div class="rounded-md border border-[#1290df] bg-white px-4 py-2.5 text-sm font-medium text-[#2d5fc0] dark:bg-gray-900">
                {{ getSolicitanteLabel(managingItem) }}
              </div>
            </div>
            <div>
              <p class="mb-1 text-sm text-gray-500 dark:text-gray-400">Etapa</p>
              <div class="rounded-md border border-[#1290df] bg-white px-4 py-2.5 text-sm font-medium text-[#2d5fc0] dark:bg-gray-900">
                {{ getFlowStageTitle(managingState) }}
              </div>
            </div>
            <div class="rounded-md border border-gray-200 bg-[#f7f9ff] px-4 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900/60">
              <span class="font-semibold text-gray-700 dark:text-gray-200">Monto:</span> S/ 130.00
            </div>
            <div class="rounded-md border border-gray-200 bg-[#f7f9ff] px-4 py-2.5 text-sm dark:border-gray-800 dark:bg-gray-900/60">
              <span class="mr-2 font-semibold text-gray-700 dark:text-gray-200">Estado:</span>
              <UBadge class="capitalize" variant="subtle" :color="getEstadoColor(getVisibleEstado(managingItem))">
                {{ getEstadoDisplayLabel(managingItem) }}
              </UBadge>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 md:col-span-2">
              {{ getFlowStageDescription(managingState) }}
            </p>
          </div>

          <div v-if="managingItem" class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <div class="min-h-[140px] max-h-[19vh] overflow-auto">
              <table class="min-w-[980px] w-full border-separate border-spacing-0">
                <thead class="bg-[#efedf6] text-gray-600 dark:bg-gray-900 dark:text-gray-200">
                  <tr>
                    <th class="rounded-tl-lg px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Producto</th>
                    <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Descripcion</th>
                    <th class="rounded-tr-lg px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Imagen</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  <tr
                    v-for="detalle in getItemDetalles(managingItem)"
                    :key="`manage-detalle-${detalle.id}`"
                    class="hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
                  >
                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <div class="space-y-1">
                        <p class="font-medium">{{ getDetalleProductoLabel(detalle) }}</p>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <p class="max-w-[260px] whitespace-normal break-words">{{ displayValue(detalle.descripcion_adicional) }}</p>
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <div class="flex flex-col gap-2">
                        <button
                          v-if="getDetalleImageUrl(detalle)"
                          type="button"
                          class="group w-fit"
                          @click="openImagePreview(getDetalleImageUrl(detalle))"
                        >
                          <img
                            :src="getDetalleImageUrl(detalle) || ''"
                            alt="Producto"
                            class="h-14 w-14 rounded-md border border-gray-200 object-cover transition group-hover:opacity-90 dark:border-gray-700"
                          >
                        </button>
                        <div
                          v-else
                          class="inline-flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-xl dark:border-gray-700 dark:bg-gray-900"
                          title="Sin imagen"
                        >
                          👢
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!getItemDetalles(managingItem).length">
                    <td colspan="3" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">There are no records to show</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            v-if="managingState !== 'pendiente_gerencia'"
            class="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60"
          >
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Comentario de gestion</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Obligatorio para derivar a gerencia</p>
            </div>
            <UTextarea
              v-model="manageComment"
              :rows="4"
              placeholder="Ej: Aprobado porque cumple con politicas internas"
              :disabled="manageSubmitting"
              class="mt-3 w-full min-h-[130px] rounded-xl [&_textarea]:min-h-[130px] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:focus:border-[#2d5fc0] [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-[#2d5fc0]/30"
            />
          </div>

          <div
            v-if="managingState !== 'pendiente_gerencia'"
            class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800"
          >
            <UButton
              color="neutral"
              variant="soft"
              class="rounded-md px-4 text-gray-700 dark:text-gray-200"
              :disabled="manageSubmitting"
              @click="closeManageModal"
            >
              Cancelar
            </UButton>
            <UButton
              color="primary"
              icon="i-lucide-send"
              class="rounded-md bg-[#2d5fc0] px-4 text-white hover:bg-[#244ea4]"
              :loading="manageSubmitting"
              :disabled="manageSubmitting || !canSendToGerenciaWithComment"
              @click="sendToGerenciaFromManageModal"
            >
              {{ canSendToGerencia ? 'Derivar' : 'Derivado' }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>

  <UModal v-model:open="rejectCommentModalOpen" class="w-full max-w-xl" title="Rechazar solicitud">
    <template #content>
      <div class="space-y-4 p-4">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Comentario de rechazo</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Obligatorio para continuar</p>
        </div>
        <UTextarea
          v-model="rejectComment"
          :rows="4"
          placeholder="Ej: No cumple con los requisitos de aprobacion"
          :disabled="rejectSubmitting"
          class="w-full min-h-[130px] rounded-xl [&_textarea]:min-h-[130px] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:px-3 [&_textarea]:py-2.5"
        />
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="soft" :disabled="rejectSubmitting" @click="closeRejectCommentModal">
            Cancelar
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-arrow-right"
            :disabled="rejectSubmitting || !rejectComment.trim()"
            @click="openRejectConfirmFromTable"
          >
            Continuar
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <UModal v-model:open="rejectConfirmOpen" class="w-full max-w-md" title="Confirmar rechazo">
    <template #content>
      <div class="space-y-4 p-4">
        <p class="text-sm text-gray-700 dark:text-gray-200">
          Esta accion rechazara la solicitud. ¿Deseas continuar?
        </p>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="soft" :disabled="manageSubmitting || rejectSubmitting" @click="rejectConfirmOpen = false">
            Cancelar
          </UButton>
          <UButton color="error" icon="i-lucide-x" :loading="manageSubmitting || rejectSubmitting" @click="confirmRejectAction">
            Si, rechazar
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <UModal v-model:open="imagePreviewOpen" class="w-full max-w-3xl" title="Vista de imagen">
    <template #content>
      <div class="p-4">
        <img
          v-if="imagePreviewUrl"
          :src="imagePreviewUrl"
          alt="Vista ampliada"
          class="max-h-[75vh] w-full rounded-lg object-contain"
        >
      </div>
    </template>
  </UModal>

  <UModal v-model:open="emailModalOpen" class="w-full max-w-3xl" title="Portal de envio de correo">
    <template #content>
      <div class="space-y-4 p-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Mensaje</p>
          <UTextarea
            :model-value="emailBodyPreview"
            :rows="12"
            readonly
            class="mt-3 w-full [&_textarea]:whitespace-pre-line"
          />
        </div>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="emailModalOpen = false">
            Cerrar
          </UButton>
          <UButton color="primary" class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]">
            Enviar correo
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>


