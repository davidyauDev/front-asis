<script setup lang="ts">
import type {
  SolicitudDetalleData,
  SolicitudDetalleItem,
  SolicitudListItem,
} from '~/services/rrhh/solicitudes'
import {
  aprobarDetalleSolicitud,
  rechazarDetalleSolicitud,
} from '~/services/rrhh/solicitudes'

const props = defineProps<{
  open: boolean
  loading: boolean
  error: string | null
  request: SolicitudListItem | null
  detail: SolicitudDetalleData | null
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'retry'): void
  (event: 'submitted'): void
}>()

const modalOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

type ManageDecision = 'aprobar' | 'rechazar'
type DeliveryDecision = 'derivar_logistica' | 'recojo_oficina'

const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase()

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

const formatNumber = (value?: number | string | null) => {
  if (value === null || value === undefined || value === '') return '--'
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? String(numeric) : String(value)
}

const textValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '--'
  return String(value)
}

const initials = (name?: string | null) => {
  if (!name) return 'SR'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('') || 'SR'
}

const stateTone = (value?: string | null) => {
  const state = normalize(value)
  if (state.includes('rech')) return 'bg-red-100 text-red-800 ring-1 ring-red-200'
  if (state.includes('apro')) return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
  if (state.includes('atenc') || state.includes('proceso')) return 'bg-sky-100 text-sky-800 ring-1 ring-sky-200'
  if (state.includes('cerr')) return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
}

const selectedRequest = computed(() => props.detail?.solicitud ?? props.request)
const selectedItems = computed(() => props.detail?.detalles ?? [])
const manageOpen = ref(false)
const managedItem = ref<SolicitudDetalleItem | null>(null)
const manageDecision = ref<ManageDecision>('aprobar')
const manageQuantity = ref(0)
const manageComment = ref('')
const manageSubmitting = ref(false)
const manageError = ref<string | null>(null)
const actaOpen = ref(false)
const actaItem = ref<SolicitudDetalleItem | null>(null)
const actaFileName = ref('')
const actaComment = ref('')
const deliveryOpen = ref(false)
const deliveryItem = ref<SolicitudDetalleItem | null>(null)
const deliveryDecision = ref<DeliveryDecision>('derivar_logistica')
const deliveryComment = ref('')
const deliveryNotifyRequester = ref(true)
const deliveryNotifyLogistics = ref(true)

const selectedSolicitante = computed(() => {
  const request = selectedRequest.value
  if (!request) return '--'
  return request.solicitante
    || [request.staff?.firstname, request.staff?.lastname].filter(Boolean).join(' ')
    || [request.firstname, request.lastname].filter(Boolean).join(' ')
    || '--'
})

const selectedEmail = computed(() => selectedRequest.value?.staff?.email || '--')

const getItemProduct = (item: SolicitudDetalleItem) => {
  const product = item.producto
  if (!product) return '--'
  if (typeof product === 'string') return product
  return product.descripcion || product.nombre || product.codigo || '--'
}

const getItemState = (item: SolicitudDetalleItem) => {
  if (typeof item.estado === 'string') return item.estado
  return item.estado?.descripcion || '--'
}

const getItemReason = (item: SolicitudDetalleItem) => item.motivo || item.observacion_atencion || '--'

const toNumber = (value?: number | string | null) => {
  const numeric = Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

const isRrhhArea = (value?: string | null) => {
  const normalized = normalize(value)
  return normalized === 'rr.hh.' || normalized === 'rr.hh' || normalized.includes('rrhh')
}

const canManageItem = (item: SolicitudDetalleItem) => isRrhhArea(item.area)

const isFinalDetailState = (item: SolicitudDetalleItem) => {
  const state = normalize(getItemState(item))
  return item.id_estado_detalle === 2
    || item.id_estado_detalle === 3
    || state.includes('apro')
    || state.includes('rech')
}

const getManageButtonTitle = (item: SolicitudDetalleItem) => {
  if (!canManageItem(item)) return 'Solo habilitado para RR.HH.'
  if (isFinalDetailState(item)) return 'Este item ya fue gestionado'
  return 'Gestionar'
}

const isManageButtonDisabled = (item: SolicitudDetalleItem) => !canManageItem(item) || isFinalDetailState(item)
const canDeliveryActions = (item: SolicitudDetalleItem) => canManageItem(item)
const getDeliveryButtonTitle = (item: SolicitudDetalleItem) => (
  canDeliveryActions(item) ? 'Derivar o recojo en oficina' : 'Solo habilitado para RR.HH.'
)

const manageMaxQuantity = computed(() => Math.max(0, toNumber(managedItem.value?.stock_actual)))
const manageProduct = computed(() => (managedItem.value ? getItemProduct(managedItem.value) : '--'))
const manageProductId = computed(() => {
  const identifier = managedItem.value?.id_inventario ?? managedItem.value?.id_detalle_solicitud
  return `ID: ${formatNumber(identifier)}`
})
const manageConfirmLabel = computed(() => (
  manageDecision.value === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud'
))
const manageConfirmClass = computed(() => (
  manageDecision.value === 'aprobar'
    ? 'bg-emerald-600 text-white shadow-[0_10px_24px_rgba(16,185,129,0.18)] hover:bg-emerald-700'
    : 'bg-red-600 text-white shadow-[0_10px_24px_rgba(239,68,68,0.18)] hover:bg-red-700'
))
const manageHelpText = computed(() => (
  manageDecision.value === 'aprobar'
    ? 'Confirma la cantidad disponible para atender'
    : 'Indica motivo del rechazo para el solicitante'
))
const manageCommentHint = computed(() => (
  manageDecision.value === 'aprobar'
    ? 'Comentario opcional para aprobar.'
    : 'Este comentario es obligatorio para rechazar.'
))
const actaProduct = computed(() => (actaItem.value ? getItemProduct(actaItem.value) : '--'))
const deliveryProduct = computed(() => (deliveryItem.value ? getItemProduct(deliveryItem.value) : '--'))
const deliveryConfirmLabel = computed(() => (
  deliveryDecision.value === 'derivar_logistica'
    ? 'Derivar al area de logistica'
    : 'Registrar recojo en oficina'
))
const canSubmitManage = computed(() => {
  if (manageSubmitting.value || !managedItem.value) return false
  if (manageDecision.value === 'rechazar') return manageComment.value.trim().length > 0
  return manageQuantity.value >= 0 && manageQuantity.value <= manageMaxQuantity.value
})

const openManageModal = (item: SolicitudDetalleItem) => {
  if (isManageButtonDisabled(item)) return

  managedItem.value = item
  manageDecision.value = 'aprobar'
  manageQuantity.value = Math.max(0, Math.min(toNumber(item.solicitado), toNumber(item.stock_actual)))
  manageComment.value = ''
  manageError.value = null
  manageOpen.value = true
}

const closeManageModal = () => {
  manageError.value = null
  manageOpen.value = false
}

const openActaModal = (item: SolicitudDetalleItem) => {
  if (!canManageItem(item)) return
  actaItem.value = item
  actaFileName.value = ''
  actaComment.value = ''
  actaOpen.value = true
}

const closeActaModal = () => {
  actaOpen.value = false
  actaItem.value = null
}

const onActaFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  actaFileName.value = file?.name ?? ''
}

const submitActaMock = () => {
  closeActaModal()
}

const openDeliveryModal = (item: SolicitudDetalleItem) => {
  if (!canDeliveryActions(item)) return
  deliveryItem.value = item
  deliveryDecision.value = 'derivar_logistica'
  deliveryComment.value = ''
  deliveryNotifyRequester.value = true
  deliveryNotifyLogistics.value = true
  deliveryOpen.value = true
}

const closeDeliveryModal = () => {
  deliveryOpen.value = false
  deliveryItem.value = null
}

const submitDeliveryMock = () => {
  closeDeliveryModal()
}

const confirmManage = async () => {
  if (!managedItem.value) return

  manageError.value = null

  const detailId = managedItem.value.id_detalle_solicitud
  if (detailId === null || detailId === undefined) {
    manageError.value = 'No se pudo identificar el detalle seleccionado.'
    return
  }

  manageSubmitting.value = true

  try {
    if (manageDecision.value === 'aprobar') {
      await aprobarDetalleSolicitud(detailId, {
        cantidad_aprobada: Math.max(0, Math.min(Math.trunc(toNumber(manageQuantity.value)), manageMaxQuantity.value)),
        motivo: manageComment.value.trim() || null,
        id_usuario_atendio: null,
      })
    } else {
      const motivo = manageComment.value.trim()
      if (!motivo) {
        manageError.value = 'El motivo es obligatorio para rechazar.'
        return
      }

      await rechazarDetalleSolicitud(detailId, {
        motivo,
        id_usuario_atendio: null,
      })
    }

    manageOpen.value = false
    emit('submitted')
  } catch (cause) {
    manageError.value = cause && typeof cause === 'object' && 'message' in cause
      ? String((cause as { message?: unknown }).message ?? 'No se pudo procesar la acción')
      : 'No se pudo procesar la acción'
  } finally {
    manageSubmitting.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    class="w-full max-w-[96rem]"
    :ui="{
      header: 'relative flex items-stretch p-0 min-h-0',
      wrapper: 'flex-1 min-w-0 w-full',
      title: 'w-full p-0',
      body: 'p-0',
    }"
    :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
  >
    <template #title>
      <div class="flex w-full items-center justify-between gap-3 border-b border-gray-200 bg-[#f8fafc] px-4 py-3 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
        <div class="flex min-w-0 items-center gap-3">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] dark:bg-[#13203a] dark:text-[#9cb7f5] dark:ring-[#29406f]">
            <UIcon name="i-lucide-file-search" class="h-4 w-4" />
          </span>
          <div class="min-w-0 leading-tight">
            <p class="text-sm font-semibold tracking-wide text-gray-950 dark:text-white">Detalle de solicitud</p>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">Items asociados a la solicitud seleccionada.</p>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">Las acciones de gestión solo están habilitadas para items del area RR.HH.</p>
          </div>
        </div>

        <span class="hidden shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2d5fc0] ring-1 ring-[#cbdcff] dark:bg-gray-900 dark:text-[#9cb7f5] dark:ring-gray-800 sm:inline-flex">
          #{{ selectedRequest?.id_solicitud ?? '--' }}
        </span>
      </div>
    </template>

    <template #body>
      <div class="bg-white px-5 py-5 dark:bg-gray-950">
        <div
          v-if="loading && !detail"
          class="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-900/40"
        >
          <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
            <span>Cargando detalle...</span>
          </div>
        </div>

        <div v-else class="space-y-5">
          <div
            v-if="error"
            class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{{ error }}</p>
              <UButton
                color="primary"
                variant="soft"
                class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                size="xs"
                @click="emit('retry')"
              >
                Reintentar
              </UButton>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <div class="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Solicitante</p>
              <div class="mt-2.5 flex items-center gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-sm font-black text-white">
                  {{ initials(selectedSolicitante) }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-base font-bold text-gray-950 dark:text-white">{{ selectedSolicitante }}</p>
                  <p class="truncate text-sm text-gray-500 dark:text-gray-400">{{ selectedEmail }}</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Registro</p>
              <div class="mt-2.5 space-y-1">
                <p class="text-[22px] font-black tracking-[-0.04em] text-gray-950 dark:text-white">{{ formatDate(selectedRequest?.fecha_registro) }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatTime(selectedRequest?.fecha_registro) }}</p>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Justificacion</p>
              <p class="mt-2 text-sm leading-5 text-gray-700 dark:text-gray-300">
                {{ textValue(selectedRequest?.justificacion) }}
              </p>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <div class="overflow-x-auto">
              <table class="w-full table-fixed border-separate border-spacing-0">
                <thead class="bg-[#2d5fc0] text-white">
                  <tr>
                    <th class="rounded-tl-2xl px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[72px]">ID</th>
                    <th class="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[220px]">Producto</th>
                    <th class="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[92px]">Area</th>
                    <th class="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[74px]">Solicitado</th>
                    <th class="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[74px]">Aprobado</th>
                    <th class="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[74px]">Atendido</th>
                    <th class="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[124px]">Estado</th>
                    <th class="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[220px]">Motivo / Fecha atencion</th>
                    <th class="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[84px] whitespace-nowrap">Stock actual</th>
                    <th class="rounded-tr-2xl px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[96px]">Acciones</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  <tr
                    v-for="item in selectedItems"
                    :key="String(item.id_detalle_solicitud ?? item.id_inventario ?? item.area_id ?? 'detail')"
                    class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
                  >
                    <td class="px-3 py-3 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">#{{ formatNumber(item.id_detalle_solicitud) }}</td>
                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <div class="space-y-1">
                        <p class="truncate font-semibold leading-5" :title="getItemProduct(item)">{{ getItemProduct(item) }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Inv. {{ formatNumber(item.id_inventario) }}</p>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <span class="inline-flex rounded-md bg-[#fff4d6] px-2 py-1 text-[11px] font-bold text-[#a16207] ring-1 ring-[#f7d27a]">{{ textValue(item.area) }}</span>
                    </td>
                    <td class="px-3 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{{ formatNumber(item.solicitado) }}</td>
                    <td class="px-3 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{{ formatNumber(item.aprobado) }}</td>
                    <td class="px-3 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{{ formatNumber(item.cantidad_atendida) }}</td>
                    <td class="px-3 py-3">
                      <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', stateTone(getItemState(item))]">
                        {{ getItemState(item) }}
                      </span>
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <div class="space-y-1">
                        <p class="truncate leading-5" :title="getItemReason(item)">{{ getItemReason(item) }}</p>
                        <p class="truncate text-xs text-gray-500 dark:text-gray-400" :title="`${formatDate(item.fecha_atencion)} ${formatTime(item.fecha_atencion)}`">
                          {{ formatDate(item.fecha_atencion) }} {{ formatTime(item.fecha_atencion) }}
                        </p>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{{ formatNumber(item.stock_actual) }}</td>
                    <td class="px-3 py-3 text-center">
                      <div v-if="canManageItem(item)" class="flex items-center justify-center gap-1.5">
                        <UButton
                          color="primary"
                          variant="soft"
                          icon="i-lucide-sliders-horizontal"
                          class="rounded-full bg-[#eef4ff] px-2 text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                          size="2xs"
                          :ui="{ label: 'hidden' }"
                          :title="getManageButtonTitle(item)"
                          :aria-label="getManageButtonTitle(item)"
                          :disabled="isManageButtonDisabled(item)"
                          @click="openManageModal(item)"
                        />
                        <UButton
                          color="neutral"
                          variant="soft"
                          icon="i-lucide-truck"
                          class="rounded-full px-2"
                          size="2xs"
                          :ui="{ label: 'hidden' }"
                          :title="getDeliveryButtonTitle(item)"
                          :aria-label="getDeliveryButtonTitle(item)"
                          @click="openDeliveryModal(item)"
                        />
                        <UButton
                          color="neutral"
                          variant="soft"
                          icon="i-lucide-upload"
                          class="rounded-full px-2"
                          size="2xs"
                          :ui="{ label: 'hidden' }"
                          title="Subir acta"
                          aria-label="Subir acta"
                          @click="openActaModal(item)"
                        />
                      </div>
                      <span
                        v-else
                        class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500"
                        title="Solo habilitado para RR.HH."
                      >
                        No aplica
                      </span>
                    </td>
                  </tr>

                  <tr v-if="!selectedItems.length">
                    <td colspan="10" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No hay items asociados a esta solicitud
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
          <UButton color="neutral" variant="soft" class="px-5" @click="emit('update:open', false)">
            Cerrar
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="actaOpen"
    class="w-full max-w-lg"
    :ui="{
      header: 'relative flex items-stretch p-0 min-h-0',
      wrapper: 'flex-1 min-w-0 w-full',
      title: 'w-full p-0',
      body: 'p-0',
    }"
    :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
  >
    <template #title>
      <div class="flex w-full items-start gap-3 border-b border-gray-200 bg-white px-5 py-4 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-200 dark:ring-indigo-900/60">
          <UIcon name="i-lucide-file-up" class="h-5 w-5" />
        </span>
        <div class="min-w-0 leading-tight">
          <p class="text-sm font-semibold tracking-wide text-gray-950 dark:text-white">Subir acta</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Maqueta para adjuntar acta al item seleccionado.</p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="bg-white px-5 py-5 dark:bg-gray-950">
        <div class="space-y-5">
          <div class="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Producto</p>
            <p class="mt-1 text-base font-bold text-gray-950 dark:text-white">{{ actaProduct }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Solo maqueta (sin API)</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Archivo del acta</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              class="block w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef4ff] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#2d5fc0] hover:file:bg-[#dfe9ff] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              @change="onActaFileChange"
            >
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ actaFileName || 'Aun no se selecciona archivo.' }}
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Comentario</label>
            <UTextarea
              v-model="actaComment"
              :rows="3"
              placeholder="Comentario interno del acta (opcional)"
            />
          </div>

          <p class="text-xs text-amber-700 dark:text-amber-300">
            Maqueta UI: el archivo no se guarda todavia y no se envia al backend.
          </p>

          <div class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <UButton color="neutral" variant="soft" class="px-5" @click="closeActaModal">
              Cancelar
            </UButton>
            <UButton
              color="primary"
              class="px-5 font-semibold"
              icon="i-lucide-upload"
              :disabled="!actaFileName"
              @click="submitActaMock"
            >
              Subir acta (maqueta)
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="deliveryOpen"
    class="w-full max-w-lg"
    :ui="{
      header: 'relative flex items-stretch p-0 min-h-0',
      wrapper: 'flex-1 min-w-0 w-full',
      title: 'w-full p-0',
      body: 'p-0',
    }"
    :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
  >
    <template #title>
      <div class="flex w-full items-start gap-3 border-b border-gray-200 bg-white px-5 py-4 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/30 dark:text-sky-200 dark:ring-sky-900/60">
          <UIcon name="i-lucide-truck" class="h-5 w-5" />
        </span>
        <div class="min-w-0 leading-tight">
          <p class="text-sm font-semibold tracking-wide text-gray-950 dark:text-white">Derivar / recojo en oficina</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Maqueta para items del area RR.HH.
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="bg-white px-5 py-5 dark:bg-gray-950">
        <div class="space-y-5">
          <div class="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Producto</p>
            <p class="mt-1 text-base font-bold text-gray-950 dark:text-white">{{ deliveryProduct }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Area RR.HH.</p>
          </div>

          <div>
            <p class="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-900 dark:text-gray-100">Tipo de accion</p>
            <div class="flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-900">
              <button
                type="button"
                class="flex-1 rounded-xl px-4 py-2 text-center text-sm font-medium transition"
                :class="deliveryDecision === 'derivar_logistica'
                  ? 'bg-white text-gray-950 shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'"
                @click="deliveryDecision = 'derivar_logistica'"
              >
                Derivar
              </button>

              <button
                type="button"
                class="flex-1 rounded-xl px-4 py-2 text-center text-sm font-medium transition"
                :class="deliveryDecision === 'recojo_oficina'
                  ? 'bg-white text-gray-950 shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'"
                @click="deliveryDecision = 'recojo_oficina'"
              >
                Recojo en oficina
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Comentario</label>
            <UTextarea
              v-model="deliveryComment"
              :rows="3"
              placeholder="Comentario interno (solo maqueta)"
            />
          </div>

          <div class="space-y-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/40">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-200">Notificar solicitante</span>
              <USwitch v-model="deliveryNotifyRequester" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-200">Notificar logistica</span>
              <USwitch v-model="deliveryNotifyLogistics" :disabled="deliveryDecision !== 'derivar_logistica'" />
            </div>
          </div>

          <p class="text-xs text-amber-700 dark:text-amber-300">
            Maqueta UI: no realiza derivacion real ni envio de notificaciones.
          </p>

          <div class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <UButton color="neutral" variant="soft" class="px-5" @click="closeDeliveryModal">
              Cancelar
            </UButton>
            <UButton
              color="primary"
              class="px-5 font-semibold"
              :icon="deliveryDecision === 'derivar_logistica' ? 'i-lucide-send' : 'i-lucide-briefcase'"
              @click="submitDeliveryMock"
            >
              {{ deliveryConfirmLabel }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="manageOpen"
    class="w-full max-w-xl"
    :ui="{
      header: 'relative flex items-stretch p-0 min-h-0',
      wrapper: 'flex-1 min-w-0 w-full',
      title: 'w-full p-0',
      body: 'p-0',
    }"
    :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
  >
    <template #title>
      <div class="flex w-full items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
        <div class="flex items-start gap-3">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800">
            <UIcon name="i-lucide-circle-check-big" class="h-5 w-5" />
          </span>
          <div class="min-w-0 leading-tight">
            <p class="text-sm font-semibold tracking-wide text-gray-950 dark:text-white">Gestionar producto</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Aprueba o rechaza la solicitud del producto seleccionado.</p>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="bg-white px-5 py-5 dark:bg-gray-950">
        <div class="space-y-5">
          <div class="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Producto</p>
            <p class="mt-1 text-base font-bold text-gray-950 dark:text-white">{{ manageProduct }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ manageProductId }}</p>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Solicitado</p>
                <p class="mt-1 text-[28px] font-black leading-none tracking-[-0.04em] text-gray-950 dark:text-white">{{ formatNumber(managedItem?.solicitado) }}</p>
              </div>
              <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">En stock</p>
                <p class="mt-1 text-[28px] font-black leading-none tracking-[-0.04em] text-gray-950 dark:text-white">{{ formatNumber(managedItem?.stock_actual) }}</p>
              </div>
            </div>
          </div>

          <div>
            <p class="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-900 dark:text-gray-100">Selecciona una acción</p>
            <div class="flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-900">
              <button
                type="button"
                class="flex-1 rounded-xl px-4 py-2 text-center text-sm font-medium transition"
                :class="manageDecision === 'aprobar'
                  ? 'bg-white text-gray-950 shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'"
                @click="manageDecision = 'aprobar'"
              >
                <span class="inline-flex items-center gap-2">
                  <UIcon name="i-lucide-circle-check-big" class="h-4 w-4 text-emerald-600" />
                  Aprobar
                </span>
              </button>

              <button
                type="button"
                class="flex-1 rounded-xl px-4 py-2 text-center text-sm font-medium transition"
                :class="manageDecision === 'rechazar'
                  ? 'bg-white text-gray-950 shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'"
                @click="manageDecision = 'rechazar'"
              >
                <span class="inline-flex items-center gap-2">
                  <UIcon name="i-lucide-circle-x" class="h-4 w-4 text-[#e53946]" />
                  Rechazar
                </span>
              </button>
            </div>
          </div>

          <div
            class="rounded-xl border px-4 py-3 text-sm transition"
            :class="manageDecision === 'aprobar'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200'"
          >
            {{ manageHelpText }}
          </div>

          <div
            v-if="manageError"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
          >
            {{ manageError }}
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Cantidad a aprobar</label>
            <UInput
              v-model="manageQuantity"
              type="number"
              min="0"
              :max="manageMaxQuantity"
              class="w-full"
              :disabled="manageSubmitting || manageDecision === 'rechazar'"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400">Máximo disponible: {{ manageMaxQuantity }} unidades</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Comentario / motivo</label>
            <UTextarea
              v-model="manageComment"
              :placeholder="manageDecision === 'aprobar'
                ? 'Escribe un comentario para aprobar'
                : 'Escribe un comentario para rechazar'"
              :rows="4"
              class="w-full"
              :disabled="manageSubmitting"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ manageCommentHint }}</p>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <UButton color="neutral" variant="soft" class="px-5" :disabled="manageSubmitting" @click="closeManageModal">
              Cancelar
            </UButton>
            <UButton
              color="primary"
              class="px-5 font-semibold"
              :class="manageConfirmClass"
              :loading="manageSubmitting"
              :disabled="!canSubmitManage"
              @click="confirmManage"
            >
              {{ manageConfirmLabel }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
