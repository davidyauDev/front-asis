<script setup lang="ts">
import SolicitudDetalleModal from '~/components/rrhh/inventario/SolicitudDetalleModal.vue'
import SolicitudesFilters from '~/components/rrhh/inventario/SolicitudesFilters.vue'
import AppDataTable from '~/components/common/AppDataTable.vue'
import { useSolicitudes } from '~/composables/rrhh/useSolicitudes'
import {
  cerrarSolicitud,
  downloadActaRrhhPdf,
  getSolicitudById,
  subirActaRrhh,
  type CerrarSolicitudEstado,
  type SolicitudDetalleItem,
  type SolicitudDetalleData,
  type SolicitudListItem,
} from '~/services/rrhh/solicitudes'

definePageMeta({ middleware: 'auth' })

const { openNotifications: openRrhhNotifications } = useRrhhNotificationsPanel()

const {
  loading,
  error,
  requests,
  search,
  fromDate,
  toDate,
  getUbicacionLabel,
  getEstadoRrhhLabel,
  statusColor,
  formatDate,
  formatTime,
  getRequesterName,
  loadRequests,
  refreshRequests,
  clearFilters,
} = useSolicitudes()

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailError = ref<string | null>(null)
const selectedRequest = ref<SolicitudListItem | null>(null)
const selectedDetail = ref<SolicitudDetalleData | null>(null)

type ActaFileKind = 'image' | 'pdf'
type ActaDecision = CerrarSolicitudEstado | null

const actaModalOpen = ref(false)
const actaRequest = ref<SolicitudListItem | null>(null)
const actaDraftFileName = ref<string | null>(null)
const actaDraftFileUrl = ref<string | null>(null)
const actaDraftFileKind = ref<ActaFileKind>('image')
const actaDraftFile = ref<File | null>(null)
const actaDraftComment = ref('')
const actaSubmitting = ref(false)
const actaModalError = ref<string | null>(null)
const toast = useToast()
const actaDecisionMap = reactive<Record<number, ActaDecision>>({})
const actaDecisionSubmitting = ref(false)
const actaPreviewOpen = ref(false)
const actaPreviewRequest = ref<SolicitudListItem | null>(null)
const actaPreviewUrl = ref<string | null>(null)
const actaPreviewKind = ref<ActaFileKind>('pdf')

interface DerivacionLogisticaRecord {
  comment: string
  derivedAt: string
}

const derivarModalOpen = ref(false)
const derivarRequest = ref<SolicitudListItem | null>(null)
const derivarComment = ref('')
const derivacionLogisticaMap = reactive<Record<number, DerivacionLogisticaRecord>>({})

const columns = [
  { key: 'solicitud', label: 'Solicitud' },
  { key: 'solicitante', label: 'Solicitante' },
  { key: 'estado_general', label: 'Estado General' },
  { key: 'fecha_registro', label: 'Fecha de registro' },
  { key: 'departamento', label: 'Ubicacion' },
  { key: 'areas_intervienen', label: 'Areas que intervienen' },
  { key: 'acta_cargada', label: 'Acta cargada', align: 'center' as const },
  { key: 'acta', label: 'Acta Epp', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'center' as const },
] as const

const extractErrorMessage = (cause: unknown) => {
  if (cause && typeof cause === 'object') {
    const candidate = cause as { message?: unknown; data?: { message?: unknown } }
    if (typeof candidate.data?.message === 'string') return candidate.data.message
    if (typeof candidate.message === 'string') return candidate.message
  }
  return 'No se pudo consultar las solicitudes'
}

const closeDerivarModal = () => {
  derivarModalOpen.value = false
  derivarRequest.value = null
  derivarComment.value = ''
}

const confirmDerivarLogistica = () => {
  const key = derivarRequest.value?.id_solicitud
  if (!key) return

  derivacionLogisticaMap[key] = {
    comment: derivarComment.value.trim(),
    derivedAt: new Date().toISOString(),
  }

  toast.add({ title: 'Derivado a logistica (solo frontend)', color: 'success' })
  closeDerivarModal()
}

const revokeBlobUrl = (url?: string | null) => {
  if (!url || !url.startsWith('blob:') || !import.meta.client) return
  URL.revokeObjectURL(url)
}

const getActaKey = (item: SolicitudListItem) => item.id_solicitud ?? null
const getActaUrl = (item: SolicitudListItem) => {
  const value = item.acta_rrhh_url?.trim()
  return value || null
}
const getActaDecision = (item: SolicitudListItem): ActaDecision => {
  const key = getActaKey(item)
  if (!key) return null
  return actaDecisionMap[key] ?? null
}

const getActaPreviewKindFromUrl = (url: string): ActaFileKind => {
  const normalized = url.toLowerCase()
  return normalized.endsWith('.pdf') ? 'pdf' : 'image'
}

const openActaPreview = (item: SolicitudListItem) => {
  const url = getActaUrl(item)
  if (!url) return
  actaPreviewRequest.value = item
  actaPreviewUrl.value = url
  actaPreviewKind.value = getActaPreviewKindFromUrl(url)
  actaPreviewOpen.value = true
}

const closeActaPreview = () => {
  actaPreviewOpen.value = false
  actaPreviewRequest.value = null
  actaPreviewUrl.value = null
}

const setActaDecision = (item: SolicitudListItem, decision: Exclude<ActaDecision, null>) => {
  const key = getActaKey(item)
  if (!key) return

  actaDecisionSubmitting.value = true

  cerrarSolicitud(key, { estado: decision })
    .then(async (response) => {
      actaDecisionMap[key] = decision
      await loadRequests()
      toast.add({
        title: response.message || 'Estado actualizado correctamente',
        color: decision === 'cerrada' ? 'success' : 'warning',
      })
      closeActaPreview()
    })
    .catch((cause: unknown) => {
      const status = (cause as { status?: number })?.status
      let message = extractErrorMessage(cause)
      if (status === 404) message = 'Solicitud no encontrada'
      else if (status === 422) message = 'Validacion fallida: estado invalido'
      else if (status === 500) message = 'Error interno del servidor'

      toast.add({
        title: message,
        color: 'error',
      })
    })
    .finally(() => {
      actaDecisionSubmitting.value = false
    })
}

const hasActa = (item: SolicitudListItem) => {
  const key = getActaKey(item)
  return Boolean(key && getActaUrl(item))
}

const openActaModal = (item: SolicitudListItem) => {
  actaRequest.value = item
  actaDraftFileName.value = null
  revokeBlobUrl(actaDraftFileUrl.value)
  actaDraftFileUrl.value = null
  actaDraftFileKind.value = 'image'
  actaDraftFile.value = null
  actaDraftComment.value = item.acta_rrhh_comentario ?? ''
  actaModalError.value = null
  actaModalOpen.value = true
}

const closeActaModal = () => {
  revokeBlobUrl(actaDraftFileUrl.value)
  actaModalOpen.value = false
  actaRequest.value = null
  actaDraftFileName.value = null
  actaDraftFileUrl.value = null
  actaDraftFileKind.value = 'image'
  actaDraftFile.value = null
  actaDraftComment.value = ''
  actaModalError.value = null
}

const getActaKind = (fileName: string, mimeType: string): ActaFileKind => {
  const lowerName = fileName.toLowerCase()
  const lowerType = mimeType.toLowerCase()
  if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) return 'pdf'
  return 'image'
}

const onActaFileSelected = (event: Event) => {
  if (!import.meta.client) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  revokeBlobUrl(actaDraftFileUrl.value)
  actaDraftFileUrl.value = URL.createObjectURL(file)
  actaDraftFileName.value = file.name
  actaDraftFileKind.value = getActaKind(file.name, file.type)
  actaDraftFile.value = file
  actaModalError.value = null
}

const saveActaDraft = async () => {
  const key = actaRequest.value?.id_solicitud
  if (!key || !actaDraftFile.value) {
    toast.add({ title: 'Selecciona un archivo', color: 'warning' })
    return
  }

  actaSubmitting.value = true
  actaModalError.value = null

  try {
    const response = await subirActaRrhh(key, {
      acta_rrhh: actaDraftFile.value,
      acta_rrhh_comentario: actaDraftComment.value.trim() || null,
    })

    const data = response.data ?? {}
    const uploadedUrl = typeof data.acta_rrhh_url === 'string' ? data.acta_rrhh_url : null
    const uploadedComment = typeof data.acta_rrhh_comentario === 'string'
      ? data.acta_rrhh_comentario
      : (actaDraftComment.value.trim() || null)

    const listItem = requests.value.find(item => item.id_solicitud === key)
    if (listItem) {
      listItem.acta_rrhh_url = uploadedUrl
      listItem.acta_rrhh_comentario = uploadedComment
    }

    if (selectedRequest.value?.id_solicitud === key) {
      selectedRequest.value.acta_rrhh_url = uploadedUrl
      selectedRequest.value.acta_rrhh_comentario = uploadedComment
    }

    await loadRequests()

    toast.add({
      title: response.message || 'Acta RR.HH. subida correctamente',
      color: 'success',
    })
    closeActaModal()
  } catch (cause) {
    actaModalError.value = extractErrorMessage(cause)
  } finally {
    actaSubmitting.value = false
  }
}

const downloadActa = async (item: SolicitudListItem) => {
  if (!import.meta.client) return
  const id = item.id_solicitud
  if (!id) return

  try {
    const { blob, fileName } = await downloadActaRrhhPdf(id)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName || `acta_rrhh_${id}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  } catch (cause) {
    toast.add({
      title: extractErrorMessage(cause),
      color: 'error',
    })
  }
}

const isDetalleAprobado = (detalle: SolicitudDetalleItem) => {
  if (detalle.id_estado_detalle === 2) return true
  if (typeof detalle.estado === 'string') return detalle.estado.trim().toLowerCase() === 'aprobado'
  return (detalle.estado?.descripcion ?? '').trim().toLowerCase() === 'aprobado'
}

const canDownloadActa = (item: SolicitudListItem) => {
  const details = (item as SolicitudListItem & { detalles?: SolicitudDetalleItem[] }).detalles
  if (!Array.isArray(details) || details.length === 0) return false

  return details.some(detalle => Number(detalle.area_id) === 11 && isDetalleAprobado(detalle))
}

const openDetail = async (item: SolicitudListItem) => {
  selectedRequest.value = item
  selectedDetail.value = null
  detailError.value = null
  detailOpen.value = true
  detailLoading.value = true

  try {
    const response = await getSolicitudById(item.id_solicitud ?? 0)
    selectedDetail.value = response.data
  } catch (cause) {
    detailError.value = extractErrorMessage(cause)
  } finally {
    detailLoading.value = false
  }
}

const retryDetail = () => {
  if (!selectedRequest.value) return
  void openDetail(selectedRequest.value)
}

const handleDetailSubmitted = async () => {
  if (!selectedRequest.value) return
  await loadRequests()
  await openDetail(selectedRequest.value)
}

onMounted(() => {
  void loadRequests()
})

onBeforeUnmount(() => {
  revokeBlobUrl(actaDraftFileUrl.value)
})
</script>

<template>
  <UDashboardPanel id="solicitud-epps">
    <template #header>
      <AppDashboardHeader
        title="Solicitudes Epps"
        :show-live-badge="false"
        notification-tooltip="Alertas RRHH"
        notification-attention
        @notification-click="openRrhhNotifications"
      />
    </template>
    <template #body>
      <div class="space-y-5">

        <SolicitudesFilters
          v-model:search="search"
          v-model:from-date="fromDate"
          v-model:to-date="toDate"
          :loading="loading"
          @filter="refreshRequests"
          @clear="clearFilters"
        />

        <AppDataTable
          :rows="requests"
          :columns="columns"
          :loading="loading"
          :error="error"
          empty-text="No hay solicitudes para mostrar."
          row-key="id_solicitud"
          table-class="min-w-[1320px] w-full table-fixed border-separate border-spacing-0"
          max-height-class="max-h-[80vh]"
          body-class="divide-y divide-gray-100/80 bg-white dark:divide-gray-800/80 dark:bg-gray-950"
          row-class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
          @retry="refreshRequests"
        >
      <template #loading>
        <div class="flex items-center justify-center gap-3">
          <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
          <span>Cargando solicitudes...</span>
        </div>
      </template>

      <template #cell-solicitud="{ row }">
        <span class="text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
          #{{ row.id_solicitud ?? '--' }}
        </span>
      </template>

      <template #cell-solicitante="{ row }">
        <div class="space-y-1 text-sm text-gray-700 dark:text-gray-200">
          <p class="max-w-[280px] font-semibold leading-5">{{ getRequesterName(row) }}</p>
        </div>
      </template>

      <template #cell-estado_general="{ row }">
        <UBadge class="capitalize" variant="subtle" :color="statusColor(row.estado?.descripcion)">
          {{ row.estado?.descripcion || '--' }}
        </UBadge>
      </template>

      <template #cell-fecha_registro="{ row }">
        <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <p class="font-medium">{{ formatDate(row.fecha_registro) }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatTime(row.fecha_registro) }}</p>
        </div>
      </template>

      <template #cell-ubicacion="{ row }">
        <div class="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200">
          <UIcon name="i-lucide-map-pin" class="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span class="max-w-[140px] truncate">{{ getUbicacionLabel(row) }}</span>
        </div>
      </template>

      <template #cell-tipo="{ row }">
        <span class="text-sm text-gray-700 dark:text-gray-200">
          {{ row.tipo_solicitud ? row.tipo_solicitud.toUpperCase() : '--' }}
        </span>
      </template>

      <template #cell-areas_intervienen>
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:ring-sky-800/60">
            SSOMA
          </span>
          <span class="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/60">
            Logistica
          </span>
        </div>
      </template>

      <template #cell-acta_cargada="{ row }">
        <div class="mx-auto flex max-w-[220px] flex-col items-center gap-2">
          <template v-if="getActaUrl(row)">
            <UButton
              size="xs"
              color="primary"
              variant="soft"
              icon="i-lucide-eye"
              class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
              @click.stop="openActaPreview(row)"
            >
              Previsualizar
            </UButton>
            <UBadge
              v-if="getActaDecision(row)"
              :color="getActaDecision(row) === 'cerrada' ? 'success' : 'error'"
              variant="soft"
              class="capitalize"
            >
              {{ getActaDecision(row) }}
            </UBadge>
          </template>
          <span
            v-else
            class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900/60"
          >
            <UIcon name="i-lucide-clock-3" class="h-3.5 w-3.5" />
            Sin acta
          </span>
        </div>
      </template>

      <template #cell-acta="{ row }">
        <div class="flex items-center justify-center">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 p-2 text-white ring-1 ring-red-300 shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100 dark:ring-red-700/70"
            :aria-label="`Descargar acta solicitud ${row.id_solicitud ?? ''}`"
            :disabled="!row.id_solicitud || !canDownloadActa(row)"
            @click.stop="downloadActa(row)"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="1.5" />
              <path d="M14 2v5h5" stroke="currentColor" stroke-width="1.5" />
              <text x="12" y="17" text-anchor="middle" font-size="6.2" font-weight="700" fill="currentColor">PDF</text>
            </svg>
          </button>
        </div>
      </template>

      <template #cell-seguimiento_rrhh="{ row }">
        <div class="space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
          <UBadge class="capitalize" variant="subtle" :color="statusColor(row.estado_rrhh)">
            {{ getEstadoRrhhLabel(row) }}
          </UBadge>
          <p
            v-if="row.estado_rrhh_comentario"
            class="max-w-[280px] truncate text-xs text-gray-500 dark:text-gray-400"
            :title="row.estado_rrhh_comentario"
          >
            {{ row.estado_rrhh_comentario }}
          </p>
          <a
            v-if="getActaUrl(row)"
            :href="getActaUrl(row) || '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs font-medium text-[#2d5fc0] hover:text-[#244ea4] hover:underline dark:text-[#9cb7f5] dark:hover:text-[#bfd0ff]"
          >
            <UIcon name="i-lucide-file-text" class="h-3.5 w-3.5" />
            Ver acta RR.HH.
          </a>
          <span
            v-else
            class="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900/60"
          >
            <UIcon name="i-lucide-clock-3" class="h-3.5 w-3.5" />
            Acta pendiente
          </span>
        </div>
      </template>

      <template #cell-acciones="{ row }">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <UButton
            color="primary"
            variant="soft"
            icon="i-lucide-sliders-horizontal"
            class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
            size="xs"
            @click.stop="openDetail(row)"
          >
            Gestionar
          </UButton>
          <UButton
            color="success"
            variant="soft"
            icon="i-simple-icons-whatsapp"
            class="rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800/60"
            size="xs"
            square
            :aria-label="`WhatsApp solicitud ${row.id_solicitud ?? ''}`"
            @click.stop
          />
        </div>
      </template>
        </AppDataTable>

        <SolicitudDetalleModal
          v-model:open="detailOpen"
          :loading="detailLoading"
          :error="detailError"
          :request="selectedRequest"
          :detail="selectedDetail"
          @retry="retryDetail"
          @submitted="handleDetailSubmitted"
        />

        <UModal v-model:open="actaModalOpen" :title="`Subir acta - Solicitud #${actaRequest?.id_solicitud ?? '--'}`">
      <template #content>
        <div class="space-y-4 p-4 sm:p-5">
          <div
            v-if="actaModalError"
            class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          >
            {{ actaModalError }}
          </div>

          <div class="rounded-xl border border-gray-200 bg-[#f8fafc] p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Estado actual
            </p>
            <div class="mt-3">
              <a
                v-if="actaRequest && getActaUrl(actaRequest)"
                :href="getActaUrl(actaRequest) || '#'"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm font-medium text-[#2d5fc0] hover:text-[#244ea4] hover:underline dark:text-[#9cb7f5] dark:hover:text-[#bfd0ff]"
              >
                <UIcon name="i-lucide-file-check-2" class="h-4 w-4" />
                Ver acta cargada
              </a>
              <span
                v-else
                class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900/60"
              >
                <UIcon name="i-lucide-clock-3" class="h-4 w-4" />
                Acta pendiente
              </span>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Archivo
            </p>
            <input
              type="file"
              accept=".pdf,image/*"
              class="mt-3 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#eef4ff] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#2d5fc0] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              :disabled="actaSubmitting"
              @change="onActaFileSelected"
            >
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {{ actaDraftFileName || 'Sin archivo seleccionado' }}
            </p>

            <div class="mt-4 space-y-2">
              <label class="text-sm font-semibold text-gray-900 dark:text-gray-100">Comentario (opcional)</label>
              <UTextarea
                v-model="actaDraftComment"
                :rows="3"
                placeholder="Ej: Acta subida por RR.HH."
                :disabled="actaSubmitting"
              />
            </div>
          </div>

          <div v-if="actaDraftFileUrl" class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Vista previa
            </p>
            <div class="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/60">
              <img
                v-if="actaDraftFileKind === 'image'"
                :src="actaDraftFileUrl"
                alt="Acta"
                class="max-h-[50vh] w-full object-contain"
              >
              <iframe
                v-else
                :src="actaDraftFileUrl"
                class="h-[50vh] w-full"
                title="Acta PDF"
              />
            </div>
          </div>

          <div class="flex flex-wrap justify-end gap-2">
            <UButton color="neutral" variant="outline" :disabled="actaSubmitting" @click="closeActaModal">
              Cancelar
            </UButton>
            <UButton color="primary" :loading="actaSubmitting" :disabled="!actaDraftFile" @click="saveActaDraft">
              Guardar
            </UButton>
          </div>
        </div>
      </template>
        </UModal>

        <UModal v-model:open="actaPreviewOpen" class="w-full max-w-6xl" title="Vista previa del acta RR.HH.">
          <template #content>
            <div class="space-y-3 p-4 sm:p-5">
              <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950/60">
                <img
                  v-if="actaPreviewUrl && actaPreviewKind === 'image'"
                  :src="actaPreviewUrl"
                  alt="Vista previa del acta"
                  class="max-h-[78vh] w-full object-contain"
                >
                <iframe
                  v-else-if="actaPreviewUrl"
                  :src="actaPreviewUrl"
                  class="h-[78vh] w-full"
                  title="Vista previa del acta"
                />
              </div>
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-2">
                  <UButton
                    size="sm"
                    color="success"
                    variant="soft"
                    icon="i-lucide-check"
                    class="rounded-full"
                    :loading="actaDecisionSubmitting"
                    :disabled="!actaPreviewRequest || actaDecisionSubmitting"
                    @click="actaPreviewRequest && setActaDecision(actaPreviewRequest, 'cerrada')"
                  >
                    Cerrar
                  </UButton>
                  <UButton
                    size="sm"
                    color="error"
                    variant="soft"
                    icon="i-lucide-x"
                    class="rounded-full"
                    :loading="actaDecisionSubmitting"
                    :disabled="!actaPreviewRequest || actaDecisionSubmitting"
                    @click="actaPreviewRequest && setActaDecision(actaPreviewRequest, 'rechazada')"
                  >
                    Rechazar
                  </UButton>
                </div>
                <UButton color="neutral" variant="outline" :disabled="actaDecisionSubmitting" @click="closeActaPreview">
                  Cerrar
                </UButton>
              </div>
            </div>
          </template>
        </UModal>

        <UModal v-model:open="derivarModalOpen" :title="`Derivado a logistica - Solicitud #${derivarRequest?.id_solicitud ?? '--'}`">
      <template #content>
        <div class="space-y-4 p-4 sm:p-5">
          <div class="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">Confirmacion</p>
            <p class="mt-1 text-xs text-amber-800 dark:text-amber-300">
              Esta accion es solo maqueta frontend. Sirve para simular que la solicitud pasa a logistica.
            </p>
          </div>

          <UFormGroup label="Comentario para logistica (opcional)">
            <UTextarea
              v-model="derivarComment"
              :rows="4"
              placeholder="Ej: Prioridad alta. Coordinar entrega con almacen..."
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="closeDerivarModal">
              Cancelar
            </UButton>
            <UButton color="warning" @click="confirmDerivarLogistica">
              Derivar
            </UButton>
          </div>
        </div>
      </template>
        </UModal>
      </div>
    </template>
  </UDashboardPanel>
</template>
