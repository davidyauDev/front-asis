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
const expandedItemId = shallowRef<number | null>(null)
const manageModalOpen = shallowRef(false)
const managingItemId = shallowRef<number | null>(null)
const manageSubmitting = shallowRef(false)
const manageComment = shallowRef('')
const staffIdFilter = shallowRef('')
const estadoFilter = shallowRef('')
const toast = useToast()

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
  if (normalized === 'pendiente_rrhh' || normalized === 'pendiente_gerencia') return 'warning'
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
  await executeManageAction(enviarSolicitudCompraGerencia, 'Enviado a gerencia', 'info')
}

const approveFinalFromManageModal = async () => {
  await executeManageAction(aprobarSolicitudCompraFinal, 'Solicitud aprobada final', 'success')
}

const rejectFromManageModal = async () => {
  await executeManageAction(rechazarSolicitudCompra, 'Solicitud rechazada', 'error')
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
  return 'Flujo de aprobacion de solicitud de compra.'
}

const canSendToGerencia = computed(() => managingState.value === 'pendiente_rrhh')
const canApproveFinal = computed(() => managingState.value === 'pendiente_gerencia')
const canRejectInFlow = computed(() => {
  return managingState.value === 'pendiente_rrhh' || managingState.value === 'pendiente_gerencia'
})

const extractErrorMessage = (cause: unknown) => {
  if (cause && typeof cause === 'object') {
    const candidate = cause as { message?: unknown; data?: { message?: unknown } }
    if (typeof candidate.data?.message === 'string') return candidate.data.message
    if (typeof candidate.message === 'string') return candidate.message
  }
  return 'No se pudieron consultar los comprobantes de gasto.'
}

const isExpanded = (item: ComprobanteGastoRrhhItem) => expandedItemId.value === item.id

const toggleRow = (item: ComprobanteGastoRrhhItem) => {
  expandedItemId.value = isExpanded(item) ? null : item.id
}

const loadComprobantes = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await getSolicitudesCompraRrhh({
      staff_id: parseNumberFilter(staffIdFilter.value),
      workflow_state: parseTextFilter(estadoFilter.value),
    })

    comprobantes.value = response.data ?? []

    if (expandedItemId.value && !comprobantes.value.some((item) => item.id === expandedItemId.value)) {
      expandedItemId.value = null
    }
    if (manageModalOpen.value && managingItemId.value && !comprobantes.value.some((item) => item.id === managingItemId.value)) {
      closeManageModal()
    }
  } catch (cause) {
    comprobantes.value = []
    expandedItemId.value = null
    closeManageModal()
    error.value = extractErrorMessage(cause)
  } finally {
    loading.value = false
  }
}

const refreshComprobantes = () => {
  void loadComprobantes()
}

const clearFilters = () => {
  staffIdFilter.value = ''
  estadoFilter.value = ''
  expandedItemId.value = null
  void loadComprobantes()
}

onMounted(() => {
  void loadComprobantes()
})
</script>

<template>
  <UDashboardPanel id="solicitud-compra">
    <template #header>
      <AppDashboardHeader
        title="Comprobantes de gasto"
        :show-live-badge="false"
        notification-attention
        notification-tooltip="Alertas RRHH"
        @notification-click="openRrhhNotifications"
      />
    </template>

    <template #body>
      <div class="space-y-5">
        <div class="mx-5 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60 xl:flex-row xl:items-end xl:justify-between">
          <div class="space-y-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              Listado de comprobantes de gasto
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Haz clic en una fila para ver la cabecera, el comprobante y los detalles asociados.
            </p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <UInput
              v-model="staffIdFilter"
              type="number"
              placeholder="staff_id"
              class="w-full sm:w-40"
            />
            <UInput
              v-model="estadoFilter"
              placeholder="workflow_state"
              class="w-full sm:w-48"
            />

            <UButton
              color="primary"
              class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]"
              :loading="loading"
              @click="refreshComprobantes"
            >
              Buscar
            </UButton>
            <UButton color="neutral" variant="soft" @click="clearFilters">
              Limpiar
            </UButton>
          </div>
        </div>

        <div class="mx-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <div class="max-h-[74vh] overflow-auto">
            <table class="min-w-[1280px] w-full border-separate border-spacing-0">
              <thead class="bg-[#2d5fc0] text-white">
                <tr>
                  <th class="w-[80px] rounded-tl-2xl px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">ID</th>
                  <th class="w-[200px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">SOLICITANTE</th>
                  <th class="w-[150px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">AREA</th>
                  <th class="w-[120px] px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">ESTADO</th>
                  <th class="w-[150px] px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">FECHA SOLICITUD</th>
                  <th class="w-[120px] px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">MONTO</th>
                  <th class="w-[150px] px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">PRODUCTOS</th>
                  <th class="w-[140px] rounded-tr-2xl px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">ACCIONES</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                <template v-if="loading">
                  <tr>
                    <td colspan="8" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div class="flex items-center justify-center gap-3">
                        <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
                        <span>Cargando comprobantes...</span>
                      </div>
                    </td>
                  </tr>
                </template>

                <template v-else-if="error">
                  <tr>
                    <td colspan="8" class="px-3 py-8 text-center text-sm text-red-600 dark:text-red-400">
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
                  <template v-for="item in comprobantes" :key="`comprobante-row-${item.id}`">
                    <tr
                      class="cursor-pointer transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
                      :class="isExpanded(item) ? 'bg-[#eef4ff] dark:bg-gray-900/80' : ''"
                      @click="toggleRow(item)"
                    >
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
                      <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                        <p class="max-w-[140px] truncate">{{ displayValue(item.solicitud_gasto.area) }}</p>
                      </td>
                      <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <UBadge class="capitalize" variant="subtle" :color="getEstadoColor(getVisibleEstado(item))">
                          {{ getEstadoLabel(getVisibleEstado(item)) }}
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
                      <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <span class="font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                          {{ getItemDetalles(item).length }}
                        </span>
                        <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          {{ getItemDetalles(item).length === 1 ? 'producto' : 'productos' }}
                        </span>
                      </td>
                      <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <UButton
                          color="primary"
                          variant="soft"
                          size="xs"
                          icon="i-lucide-settings-2"
                          class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                          @click.stop="openManageModal(item)"
                        >
                          Gestionar
                        </UButton>
                      </td>
                    </tr>

                    <tr v-if="isExpanded(item)" :key="`comprobante-detail-${item.id}`">
                      <td colspan="8" class="bg-[#f8fbff] px-4 py-4 dark:bg-gray-950/80">
                        <div class="space-y-4">
                          <div class="grid gap-3 xl:grid-cols-3">
                            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
                              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Solicitud</p>
                              <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                {{ getSolicitanteLabel(item) }}
                              </p>
                              <p class="text-xs text-gray-500 dark:text-gray-400">
                                {{ displayValue(item.solicitud_gasto.username) }}
                              </p>
                              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Motivo: {{ displayValue(item.solicitud_gasto.motivo) }}
                              </p>
                            </div>

                            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
                              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Comprobante</p>
                              <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                {{ getComprobanteTipo(item) }} - {{ displayValue(item.comprobante?.numero) }}
                              </p>
                              <p class="text-xs text-gray-500 dark:text-gray-400">
                                Monto: S/ 130.00
                              </p>
                              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Archivo: {{ item.comprobante?.archivo_url ? 'Disponible' : 'No disponible' }}
                              </p>
                            </div>

                            <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
                              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Estado actual</p>
                              <UBadge class="mt-1 capitalize" variant="subtle" :color="getEstadoColor(getVisibleEstado(item))">
                                {{ getEstadoLabel(getVisibleEstado(item)) }}
                              </UBadge>
                              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Solicitud #{{ item.solicitud_gasto.id }}
                              </p>
                            </div>
                          </div>

                          <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                            <div class="max-h-[42vh] overflow-auto">
                              <table class="min-w-[1320px] w-full border-separate border-spacing-0">
                                <thead class="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                                  <tr>
                                    <th class="rounded-tl-2xl px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">ID PRODUCTO</th>
                                    <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">CANTIDAD</th>
                                    <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">PRECIO ESTIMADO</th>
                                    <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">PRECIO REAL</th>
                                    <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">DESCRIPCION ADICIONAL</th>
                                    <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">RUTA IMAGEN</th>
                                    <th class="rounded-tr-2xl px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">URL IMAGEN</th>
                                  </tr>
                                </thead>

                                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                                  <tr
                                    v-for="detalle in getItemDetalles(item)"
                                    :key="`detalle-${detalle.id}`"
                                    class="hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
                                  >
                                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                                      <div class="space-y-1">
                                        <p class="font-medium">{{ detalle.id_producto }}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ getDetalleProductoLabel(detalle) }}</p>
                                      </div>
                                    </td>
                                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                                      {{ displayValue(detalle.cantidad) }}
                                    </td>
                                    <td class="px-3 py-3 text-right text-sm text-gray-700 dark:text-gray-200">
                                      S/ {{ formatMoney(detalle.precio_estimado) }}
                                    </td>
                                    <td class="px-3 py-3 text-right text-sm text-gray-700 dark:text-gray-200">
                                      S/ {{ formatMoney(detalle.precio_real) }}
                                    </td>
                                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                                      <p class="max-w-[260px] whitespace-normal break-words">{{ displayValue(detalle.descripcion_adicional) }}</p>
                                    </td>
                                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                                      <p class="max-w-[260px] truncate">{{ displayValue(detalle.ruta_imagen) }}</p>
                                    </td>
                                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                                      <div class="flex flex-col gap-1">
                                        <p class="max-w-[280px] truncate">{{ displayValue(detalle.url_imagen) }}</p>
                                        <UButton
                                          v-if="getDetalleImageUrl(detalle)"
                                          :href="getDetalleImageUrl(detalle) || undefined"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          color="primary"
                                          variant="soft"
                                          size="xs"
                                          class="w-fit rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                                          @click.stop
                                        >
                                          Abrir imagen
                                        </UButton>
                                      </div>
                                    </td>
                                  </tr>

                                  <tr v-if="!getItemDetalles(item).length">
                                    <td colspan="7" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                      No hay detalles para esta solicitud.
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>

                  <tr v-if="!comprobantes.length">
                    <td colspan="8" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No hay comprobantes de gasto para mostrar.
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
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
      <div class="space-y-4 p-4">
        <div
          v-if="managingItem"
          class="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/70"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            Flujo de aprobacion
          </p>
          <div class="space-y-1 text-sm text-gray-700 dark:text-gray-200">
            <p>
              <span class="font-semibold">Solicitante:</span>
              {{ getSolicitanteLabel(managingItem) }}
            </p>
            <p>
              <span class="font-semibold">Monto:</span>
              S/ 130.00
            </p>
            <p class="flex items-center gap-2">
              <span class="font-semibold">Estado:</span>
              <UBadge class="capitalize" variant="subtle" :color="getEstadoColor(getVisibleEstado(managingItem))">
                {{ getEstadoLabel(getVisibleEstado(managingItem)) }}
              </UBadge>
            </p>
            <p>
              <span class="font-semibold">Etapa:</span>
              {{ getFlowStageTitle(managingState) }}
            </p>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ getFlowStageDescription(managingState) }}
          </p>
        </div>

        <div
          v-if="managingItem"
          class="grid gap-3 xl:grid-cols-3"
        >
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Solicitud</p>
            <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {{ getSolicitanteLabel(managingItem) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ displayValue(managingItem.solicitud_gasto.username) }}
            </p>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Area: {{ displayValue(managingItem.solicitud_gasto.area) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Fecha: {{ formatDate(managingItem.solicitud_gasto.fecha_solicitud) }} {{ formatTime(managingItem.solicitud_gasto.fecha_solicitud) }}
            </p>
          </div>

          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Comprobante</p>
            <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {{ getComprobanteTipo(managingItem) }} - {{ displayValue(managingItem.comprobante?.numero) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Monto: S/ 130.00
            </p>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Archivo: {{ managingItem.comprobante?.archivo_url ? 'Disponible' : 'No disponible' }}
            </p>
            <UButton
              v-if="managingItem.comprobante?.archivo_url"
              :href="managingItem.comprobante?.archivo_url || undefined"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="soft"
              size="xs"
              class="mt-2 rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
            >
              Ver archivo
            </UButton>
          </div>

          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Resumen</p>
            <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              Solicitud #{{ managingItem.solicitud_gasto.id }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Detalles: {{ getItemDetalles(managingItem).length }}
            </p>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Motivo: {{ displayValue(managingItem.solicitud_gasto.motivo) }}
            </p>
          </div>
        </div>

        <div
          v-if="managingItem"
          class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
        >
          <div class="max-h-[32vh] overflow-auto">
            <table class="min-w-[980px] w-full border-separate border-spacing-0">
              <thead class="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                <tr>
                  <th class="rounded-tl-2xl px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Producto</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Cantidad</th>
                  <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">Precio estimado</th>
                  <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">Precio real</th>
                  <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Descripcion</th>
                  <th class="rounded-tr-2xl px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Imagen</th>
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
                      <p class="font-medium">{{ detalle.id_producto }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ getDetalleProductoLabel(detalle) }}</p>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ displayValue(detalle.cantidad) }}
                  </td>
                  <td class="px-3 py-3 text-right text-sm text-gray-700 dark:text-gray-200">
                    S/ {{ formatMoney(detalle.precio_estimado) }}
                  </td>
                  <td class="px-3 py-3 text-right text-sm text-gray-700 dark:text-gray-200">
                    S/ {{ formatMoney(detalle.precio_real) }}
                  </td>
                  <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                    <p class="max-w-[260px] whitespace-normal break-words">{{ displayValue(detalle.descripcion_adicional) }}</p>
                  </td>
                  <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                    <div class="flex flex-col gap-1">
                      <p class="max-w-[280px] truncate">{{ displayValue(detalle.url_imagen || detalle.ruta_imagen) }}</p>
                      <UButton
                        v-if="getDetalleImageUrl(detalle)"
                        :href="getDetalleImageUrl(detalle) || undefined"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        variant="soft"
                        size="xs"
                        class="w-fit rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                      >
                        Abrir imagen
                      </UButton>
                    </div>
                  </td>
                </tr>

                <tr v-if="!getItemDetalles(managingItem).length">
                  <td colspan="6" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No hay detalles para esta solicitud.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            Comentario de gestion (opcional)
          </p>
          <UTextarea
            v-model="manageComment"
            :rows="3"
            placeholder="Escribe un comentario para la transicion de estado"
            :disabled="manageSubmitting"
          />
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <UButton color="neutral" variant="outline" :disabled="manageSubmitting" @click="closeManageModal">
            Cancelar
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-send"
            :loading="manageSubmitting"
            :disabled="manageSubmitting || !canSendToGerencia"
            @click="sendToGerenciaFromManageModal"
          >
            {{ canSendToGerencia ? 'Validar y enviar a gerencia' : 'Ya enviado a gerencia' }}
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-x"
            variant="soft"
            :loading="manageSubmitting"
            :disabled="manageSubmitting || !canRejectInFlow"
            @click="rejectFromManageModal"
          >
            {{ canRejectInFlow ? 'Rechazar solicitud' : 'Rechazada' }}
          </UButton>
          <UButton
            color="success"
            icon="i-lucide-check"
            class="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            :loading="manageSubmitting"
            :disabled="manageSubmitting || !canApproveFinal"
            @click="approveFinalFromManageModal"
          >
            {{ canApproveFinal ? 'Aprobar final' : 'Aprobada final' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
