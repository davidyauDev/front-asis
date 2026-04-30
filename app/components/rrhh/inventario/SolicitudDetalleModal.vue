<script setup lang="ts">
import type {
  EstadoRrhhValue,
  SolicitudDetalleData,
  SolicitudDetalleItem,
  SolicitudListItem,
} from '~/services/rrhh/solicitudes'
import {
  aprobarDetalleSolicitud,
  derivarDetalleALogistica,
  rechazarDetalleSolicitud,
  subirActaRrhh,
  updateEstadoRrhh,
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
type InternalStatusOption = {
  value: EstadoRrhhValue
  label: string
}

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
const toast = useToast()

const requestType = computed(() => {
  const detailType = (props.detail?.solicitud as { tipo_solicitud?: string | null } | undefined)?.tipo_solicitud
  const parentType = (props.request as { tipo_solicitud?: string | null } | null)?.tipo_solicitud
  const selectedType = (selectedRequest.value as { tipo_solicitud?: string | null } | null)?.tipo_solicitud
  return normalize(detailType || parentType || selectedType)
})

const isInternalRequest = computed(() => {
  const type = requestType.value
  return type === 'interno' || type.includes('inter')
})
const isMixtoRequest = computed(() => {
  const type = requestType.value
  return type === 'mixto' || type.includes('mixt')
})
const hasGlobalActions = computed(() => isInternalRequest.value || isMixtoRequest.value)
const selectedRequestActaUrl = computed(() => {
  const request = selectedRequest.value as { acta_rrhh_url?: string | null } | null
  return request?.acta_rrhh_url?.trim() || ''
})
const selectedRequestSeguimiento = computed(() => {
  const request = selectedRequest.value as {
    estado_rrhh?: string | null
    estado_rrhh_comentario?: string | null
  } | null
  return {
    estado: normalize(request?.estado_rrhh),
    comentario: request?.estado_rrhh_comentario?.trim() || '',
  }
})
const hasRegisteredActa = computed(() => Boolean(selectedRequestActaUrl.value))
const hasRegisteredSeguimiento = computed(() => {
  const { estado, comentario } = selectedRequestSeguimiento.value
  return estado === 'derivar_logistica' || estado === 'recojo_oficina' || Boolean(comentario)
})
const hasPendingAttentionDetail = computed(() => {
  return selectedItems.value.some((item) => {
    const state = normalize(getItemState(item))
    return item.id_estado_detalle === 11 || state.includes('pendiente de atencion')
  })
})
const showActaAction = computed(() => hasGlobalActions.value && !hasRegisteredActa.value)
const showSeguimientoAction = computed(() => hasGlobalActions.value && !hasRegisteredSeguimiento.value)
const hasVisibleGlobalActions = computed(() => showActaAction.value || showSeguimientoAction.value)

const manageOpen = ref(false)
const managedItem = ref<SolicitudDetalleItem | null>(null)
const manageDecision = ref<ManageDecision>('aprobar')
const manageQuantity = ref(0)
const manageComment = ref('')
const manageSubmitting = ref(false)
const manageError = ref<string | null>(null)

const globalDeliveryComment = ref('')
const internalStatusOptions: InternalStatusOption[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'derivar_logistica', label: 'Derivado a logistica' },
  { value: 'recojo_oficina', label: 'Recojo en oficina' },
]
const globalInternalStatus = ref('')
const globalActaFileName = ref('')
const globalActaComment = ref('')
const globalActaFile = ref<File | null>(null)
const actaModalOpen = ref(false)
const seguimientoModalOpen = ref(false)
const actaSubmitting = ref(false)
const seguimientoSubmitting = ref(false)
const actaError = ref<string | null>(null)
const seguimientoError = ref<string | null>(null)
const selectedInternalStatusLabel = computed(() => (
  internalStatusOptions.find(option => option.value === globalInternalStatus.value)?.label || ''
))
const imagePreviewOpen = ref(false)
const imagePreviewSrc = ref<string | null>(null)
const imagePreviewAlt = ref('Imagen del producto')

watch(requestType, (type) => {
  if (type.includes('mixt')) {
    globalInternalStatus.value = 'derivar_logistica'
    return
  }

  if (type.includes('inter')) {
    globalInternalStatus.value = internalStatusOptions[0]?.value || ''
  }
}, { immediate: true })

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
const getItemImageUrl = (item: SolicitudDetalleItem) => {
  const productImage = typeof item.producto === 'object' ? item.producto?.url_imagen : null
  const imageUrl = item.url_imagen || productImage
  if (!imageUrl) return null
  const normalized = imageUrl.trim()
  return normalized || null
}

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

const onGlobalActaFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0] ?? null
  globalActaFile.value = file
  globalActaFileName.value = file?.name ?? ''
}

const openActaModal = () => {
  if (hasPendingAttentionDetail.value) return
  actaError.value = null
  actaModalOpen.value = true
}

const openSeguimientoModal = () => {
  if (hasPendingAttentionDetail.value) return
  seguimientoError.value = null
  seguimientoModalOpen.value = true
}

const canSubmitActa = computed(() => {
  if (!hasGlobalActions.value) return false
  if (hasPendingAttentionDetail.value) return false
  if (actaSubmitting.value) return false
  return !!globalActaFile.value
})

const submitActa = async () => {
  actaError.value = null
  actaSubmitting.value = true

  try {
    const requestId = selectedRequest.value?.id_solicitud
    if (!requestId) throw new Error('No se pudo identificar la solicitud.')
    if (!globalActaFile.value) throw new Error('Selecciona un archivo de acta.')

    const response = await subirActaRrhh(requestId, {
      acta_rrhh: globalActaFile.value,
      acta_rrhh_comentario: globalActaComment.value.trim() || null,
    })

    const uploadedData = response.data ?? null
    const uploadedUrl = uploadedData?.acta_rrhh_url?.trim() || null
    const uploadedComment = uploadedData?.acta_rrhh_comentario?.trim() || globalActaComment.value.trim() || null
    const request = selectedRequest.value as { acta_rrhh_url?: string | null; acta_rrhh_comentario?: string | null } | null

    if (request) {
      request.acta_rrhh_url = uploadedUrl
      request.acta_rrhh_comentario = uploadedComment
    }

    toast.add({ title: 'Acta registrada', description: 'El acta se subio correctamente.', color: 'success' })
    actaModalOpen.value = false
    emit('submitted')
  } catch (cause) {
    actaError.value = cause && typeof cause === 'object' && 'message' in cause
      ? String((cause as { message?: unknown }).message ?? 'No se pudo subir el acta')
      : 'No se pudo subir el acta'
  } finally {
    actaSubmitting.value = false
  }
}

const canSubmitSeguimiento = computed(() => {
  if (!hasGlobalActions.value) return false
  if (hasPendingAttentionDetail.value) return false
  if (seguimientoSubmitting.value) return false
  if (!selectedItems.value.length) return false
  if (isInternalRequest.value && !globalInternalStatus.value) return false
  return true
})

const submitSeguimiento = async () => {
  seguimientoError.value = null
  seguimientoSubmitting.value = true

  try {
    const requestId = selectedRequest.value?.id_solicitud
    if (!requestId) throw new Error('No se pudo identificar la solicitud.')
    if (!globalInternalStatus.value) throw new Error('Selecciona un estado para registrar seguimiento.')

    if (isMixtoRequest.value) {
      const detailIds = selectedItems.value
        .filter(item => item.area_id === 11)
        .map(item => item.id_detalle_solicitud)
        .filter((id): id is number => typeof id === 'number' && Number.isFinite(id))

      if (!detailIds.length) throw new Error('No hay detalles del area RR.HH. para derivar a logistica.')

      await Promise.all(detailIds.map(id => derivarDetalleALogistica(id)))
    }

    await updateEstadoRrhh(requestId, {
      estado_rrhh: globalInternalStatus.value,
      estado_rrhh_comentario: globalDeliveryComment.value.trim() || null,
    })

    const request = selectedRequest.value as {
      estado_rrhh?: string | null
      estado_rrhh_comentario?: string | null
    } | null

    if (request) {
      request.estado_rrhh = globalInternalStatus.value
      request.estado_rrhh_comentario = globalDeliveryComment.value.trim() || null
    }

    const internalStatusLabel = selectedInternalStatusLabel.value || 'Seguimiento actualizado'
    selectedItems.value.forEach((item) => {
      item.estado = { descripcion: internalStatusLabel }
      item.observacion_atencion = globalDeliveryComment.value.trim() || item.observacion_atencion
      item.fecha_atencion = new Date().toISOString()
    })

    toast.add({ title: 'Seguimiento registrado', description: 'El estado RR.HH. se actualizo correctamente.', color: 'success' })
    seguimientoModalOpen.value = false
    emit('submitted')
  } catch (cause) {
    seguimientoError.value = cause && typeof cause === 'object' && 'message' in cause
      ? String((cause as { message?: unknown }).message ?? 'No se pudo registrar el seguimiento')
      : 'No se pudo registrar el seguimiento'
  } finally {
    seguimientoSubmitting.value = false
  }
}

const openImagePreview = (item: SolicitudDetalleItem) => {
  const imageUrl = getItemImageUrl(item)
  if (!imageUrl) return
  imagePreviewSrc.value = imageUrl
  imagePreviewAlt.value = `Imagen de ${getItemProduct(item)}`
  imagePreviewOpen.value = true
}

const closeImagePreview = () => {
  imagePreviewOpen.value = false
  imagePreviewSrc.value = null
  imagePreviewAlt.value = 'Imagen del producto'
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
  <UModal v-model:open="modalOpen" class="w-full max-w-[96rem]" :ui="{
    header: 'relative flex items-stretch p-0 min-h-0',
    wrapper: 'flex-1 min-w-0 w-full',
    title: 'w-full p-0',
    body: 'p-0',
  }" :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }">
    <template #title>
      
    </template>

    <template #body>
      <div class="bg-white px-5 py-5 dark:bg-gray-950">
        <div v-if="loading && !detail"
          class="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-900/40">
          <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
            <span>Cargando detalle...</span>
          </div>
        </div>

        <div v-else class="space-y-5">
          <div v-if="error"
            class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{{ error }}</p>
              <UButton color="primary" variant="soft"
                class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]" size="xs"
                @click="emit('retry')">
                Reintentar
              </UButton>
            </div>
          </div>

        

                    <div
            v-if="hasVisibleGlobalActions"
            class="rounded-2xl border border-[#2d5fc0]/15 bg-[#f7f9ff] p-4 shadow-sm dark:border-[#29406f]/40 dark:bg-[#0b1220] sm:p-5"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-sm font-semibold text-gray-950 dark:text-white">
                  Acciones globales ({{ isMixtoRequest ? 'MIXTO' : 'INTERNO' }})
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-300">
                  Gestiona acta y seguimiento desde modales separados.
                </p>
              </div>
              <span
                class="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-gray-700 ring-1 ring-gray-200 dark:bg-gray-950 dark:text-gray-200 dark:ring-gray-800"
              >
                <UIcon name="i-lucide-layers-3" class="h-4 w-4 text-[#2d5fc0] dark:text-[#9cb7f5]" />
                {{ selectedItems.length }} items
              </span>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-3">
              <div
                v-if="hasPendingAttentionDetail"
                class="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200"
              >
                Debes gestionar los detalles con estado Pendiente de Atencion antes de subir acta o registrar seguimiento.
              </div>
              <UButton
                v-if="showActaAction"
                color="primary"
                variant="soft"
                icon="i-lucide-file-up"
                class="rounded-md bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                :disabled="hasPendingAttentionDetail"
                @click="openActaModal"
              >
                Subir acta
              </UButton>
              <UButton
                v-if="showSeguimientoAction"
                color="primary"
                icon="i-lucide-git-branch-plus"
                class="rounded-md bg-[#2d5fc0] text-white hover:bg-[#244ea4]"
                :disabled="hasPendingAttentionDetail"
                @click="openSeguimientoModal"
              >
                Seguimiento
              </UButton>
            </div>
          </div>
          <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <div class="overflow-x-auto">
              <table class="w-full table-fixed border-separate border-spacing-0">
                <thead class="bg-[#2d5fc0] text-white">
                  <tr>
                    <th
                      class="rounded-tl-2xl px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[72px]">
                      ID</th>
                    <th class="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[220px]">
                      Producto</th>
                    <th class="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[92px]">Area
                    </th>
                    <th class="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[74px]">
                      Solicitado</th>
                    <th class="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[74px]">
                      Aprobado</th>
                    <th class="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[92px]">Imagen
                    </th>
                    <th class="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[124px]">Estado
                    </th>
                    <th class="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider w-[220px]">Motivo
                      / Fecha atencion</th>
                    <th
                      class="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[84px] whitespace-nowrap">
                      Stock actual</th>
                    <th
                      class="rounded-tr-2xl px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider w-[96px]">
                      Acciones</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  <tr v-for="item in selectedItems"
                    :key="String(item.id_detalle_solicitud ?? item.id_inventario ?? item.area_id ?? 'detail')"
                    class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60">
                    <td class="px-3 py-3 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">#{{
                      formatNumber(item.id_detalle_solicitud) }}</td>
                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <div class="space-y-1">
                        <p class="truncate font-semibold leading-5" :title="getItemProduct(item)">{{
                          getItemProduct(item) }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Inv. {{ formatNumber(item.id_inventario) }}
                        </p>
                      </div>
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                      <span
                        class="inline-flex rounded-md bg-[#fff4d6] px-2 py-1 text-[11px] font-bold text-[#a16207] ring-1 ring-[#f7d27a]">{{
                        textValue(item.area) }}</span>
                    </td>
                    <td class="px-3 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{{
                      formatNumber(item.solicitado) }}</td>
                    <td class="px-3 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{{
                      formatNumber(item.aprobado) }}</td>
                    <td class="px-3 py-3 text-center">
                      <button v-if="getItemImageUrl(item)" type="button"
                        class="mx-auto block rounded-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5fc0] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                        :title="`Ver imagen de ${getItemProduct(item)}`"
                        :aria-label="`Ver imagen de ${getItemProduct(item)}`" @click="openImagePreview(item)">
                        <img :src="getItemImageUrl(item) || ''" :alt="`Imagen de ${getItemProduct(item)}`"
                          class="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                          loading="lazy">
                      </button>
                      <span v-else class="text-xs font-semibold text-gray-400 dark:text-gray-500">
                        Producto no requiere imagen
                      </span>
                    </td>
                    <td class="px-3 py-3">
                      <span
                        :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', stateTone(getItemState(item))]">
                        {{ getItemState(item) }}
                      </span>
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <div class="space-y-1">
                        <p class="truncate leading-5" :title="getItemReason(item)">{{ getItemReason(item) }}</p>
                        <p class="truncate text-xs text-gray-500 dark:text-gray-400"
                          :title="`${formatDate(item.fecha_atencion)} ${formatTime(item.fecha_atencion)}`">
                          {{ formatDate(item.fecha_atencion) }} {{ formatTime(item.fecha_atencion) }}
                        </p>
                      </div>
                    </td>
                    <td
                      class="px-3 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {{ formatNumber(item.stock_actual) }}</td>
                    <td class="px-3 py-3 text-center">
                      <div v-if="canManageItem(item)" class="flex items-center justify-center gap-1.5">
                        <UButton color="primary" variant="soft" icon="i-lucide-sliders-horizontal"
                          class="rounded-full bg-[#eef4ff] px-2 text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                          size="2xs" :ui="{ label: 'hidden' }" :title="getManageButtonTitle(item)"
                          :aria-label="getManageButtonTitle(item)" :disabled="isManageButtonDisabled(item)"
                          @click="openManageModal(item)" />
                      </div>
                      <span v-else
                        class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500"
                        title="Solo habilitado para RR.HH.">
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

  <UModal v-model:open="actaModalOpen" class="w-full max-w-2xl" title="Subir acta global">
    <template #content>
      <div class="space-y-4 p-4">
        <div v-if="actaError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {{ actaError }}
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Archivo de acta</label>
          <input
            type="file"
            accept=".pdf,image/*"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#eef4ff] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#2d5fc0] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
            :disabled="actaSubmitting"
            @change="onGlobalActaFileChange"
          >
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ globalActaFileName || 'Sin archivo seleccionado' }}</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Comentario del acta</label>
          <UTextarea v-model="globalActaComment" :rows="3" class="w-full" :disabled="actaSubmitting" />
        </div>

        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="soft" :disabled="actaSubmitting" @click="actaModalOpen = false">Cancelar</UButton>
          <UButton color="primary" class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]" :loading="actaSubmitting" :disabled="!canSubmitActa" @click="submitActa">Registrar acta</UButton>
        </div>
      </div>
    </template>
  </UModal>

  <UModal v-model:open="seguimientoModalOpen" class="w-full max-w-2xl" title="Seguimiento global">
    <template #content>
      <div class="space-y-4 p-4">
        <div v-if="seguimientoError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {{ seguimientoError }}
        </div>

        <div v-if="isMixtoRequest" class="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
          Accion global: derivar a logistica (solo area RR.HH.).
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Estado RR.HH.</label>
          <select
            v-model="globalInternalStatus"
            class="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
            :disabled="seguimientoSubmitting || isMixtoRequest"
          >
            <option value="" disabled>Selecciona un estado</option>
            <option v-for="option in internalStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ isMixtoRequest ? 'Comentario de derivacion' : 'Comentario interno' }}</label>
          <UTextarea
            v-model="globalDeliveryComment"
            :placeholder="isMixtoRequest ? 'Ej: Entrega urgente. Coordinar con almacen...' : 'Ej: Derivado hoy a logistica.'"
            :rows="3"
            class="w-full"
            :disabled="seguimientoSubmitting"
          />
        </div>

        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="soft" :disabled="seguimientoSubmitting" @click="seguimientoModalOpen = false">Cancelar</UButton>
          <UButton color="primary" class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]" :loading="seguimientoSubmitting" :disabled="!canSubmitSeguimiento" @click="submitSeguimiento">Registrar seguimiento</UButton>
        </div>
      </div>
    </template>
  </UModal>

  <UModal v-model:open="imagePreviewOpen" title="Vista previa de imagen">
    <template #content>
      <div class="space-y-3 p-4 sm:p-5">
        <div
          class="flex min-h-[260px] max-h-[78vh] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
          <img v-if="imagePreviewSrc" :src="imagePreviewSrc" :alt="imagePreviewAlt"
            class="max-h-[74vh] w-auto max-w-full object-contain">
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No hay imagen para mostrar.
          </p>
        </div>

        <div class="flex justify-end">
          <UButton color="neutral" variant="outline" @click="closeImagePreview">
            Cerrar
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <UModal v-model:open="manageOpen" class="w-full max-w-xl" :ui="{
    header: 'relative flex items-stretch p-0 min-h-0',
    wrapper: 'flex-1 min-w-0 w-full',
    title: 'w-full p-0',
    body: 'p-0',
  }" :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }">
    <template #title>
      <div
        class="flex w-full items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
        <div class="flex items-start gap-3">
          <span
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800">
            <UIcon name="i-lucide-circle-check-big" class="h-5 w-5" />
          </span>
          <div class="min-w-0 leading-tight">
            <p class="text-sm font-semibold tracking-wide text-gray-950 dark:text-white">Gestionar producto</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Aprueba o rechaza la solicitud del producto
              seleccionado.</p>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="bg-white px-5 py-5 dark:bg-gray-950">
        <div class="space-y-5">
          <div
            class="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Producto
            </p>
            <p class="mt-1 text-base font-bold text-gray-950 dark:text-white">{{ manageProduct }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ manageProductId }}</p>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                  Solicitado</p>
                <p class="mt-1 text-[28px] font-black leading-none tracking-[-0.04em] text-gray-950 dark:text-white">{{
                  formatNumber(managedItem?.solicitado) }}</p>
              </div>
              <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">En
                  stock</p>
                <p class="mt-1 text-[28px] font-black leading-none tracking-[-0.04em] text-gray-950 dark:text-white">{{
                  formatNumber(managedItem?.stock_actual) }}</p>
              </div>
            </div>
          </div>

          <div>
            <p class="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-900 dark:text-gray-100">
              Selecciona una acción</p>
            <div class="flex rounded-2xl bg-gray-100 p-1 dark:bg-gray-900">
              <button type="button" class="flex-1 rounded-xl px-4 py-2 text-center text-sm font-medium transition"
                :class="manageDecision === 'aprobar'
                  ? 'bg-white text-gray-950 shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'"
                @click="manageDecision = 'aprobar'">
                <span class="inline-flex items-center gap-2">
                  <UIcon name="i-lucide-circle-check-big" class="h-4 w-4 text-emerald-600" />
                  Aprobar
                </span>
              </button>

              <button type="button" class="flex-1 rounded-xl px-4 py-2 text-center text-sm font-medium transition"
                :class="manageDecision === 'rechazar'
                  ? 'bg-white text-gray-950 shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'"
                @click="manageDecision = 'rechazar'">
                <span class="inline-flex items-center gap-2">
                  <UIcon name="i-lucide-circle-x" class="h-4 w-4 text-[#e53946]" />
                  Rechazar
                </span>
              </button>
            </div>
          </div>

          <div class="rounded-xl border px-4 py-3 text-sm transition" :class="manageDecision === 'aprobar'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
            : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200'">
            {{ manageHelpText }}
          </div>

          <div v-if="manageError"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            {{ manageError }}
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Cantidad a aprobar</label>
            <UInput v-model="manageQuantity" type="number" min="0" :max="manageMaxQuantity" class="w-full"
              :disabled="manageSubmitting || manageDecision === 'rechazar'" />
            <p class="text-sm text-gray-500 dark:text-gray-400">Máximo disponible: {{ manageMaxQuantity }} unidades</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Comentario / motivo</label>
            <UTextarea v-model="manageComment" :placeholder="manageDecision === 'aprobar'
              ? 'Escribe un comentario para aprobar'
              : 'Escribe un comentario para rechazar'" :rows="4" class="w-full" :disabled="manageSubmitting" />
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ manageCommentHint }}</p>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <UButton color="neutral" variant="soft" class="px-5" :disabled="manageSubmitting" @click="closeManageModal">
              Cancelar
            </UButton>
            <UButton color="primary" class="px-5 font-semibold" :class="manageConfirmClass" :loading="manageSubmitting"
              :disabled="!canSubmitManage" @click="confirmManage">
              {{ manageConfirmLabel }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>


