<script setup lang="ts">
import SolicitudDetalleModal from '~/components/rrhh/inventario/SolicitudDetalleModal.vue'
import {
  getSolicitudById,
  getSolicitudes,
  type SolicitudDetalleData,
  type SolicitudListItem,
} from '~/services/rrhh/solicitudes'

const loading = ref(false)
const error = ref<string | null>(null)
const requests = ref<SolicitudListItem[]>([])
const search = ref('')
const fromDate = ref('')
const toDate = ref('')

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailError = ref<string | null>(null)
const selectedRequest = ref<SolicitudListItem | null>(null)
const selectedDetail = ref<SolicitudDetalleData | null>(null)

type ActaFileKind = 'image' | 'pdf'
interface ActaUploadRecord {
  fileName: string
  fileUrl: string
  fileKind: ActaFileKind
  uploadedAt: string
}

const actaModalOpen = ref(false)
const actaRequest = ref<SolicitudListItem | null>(null)
const actaDraftFileName = ref<string | null>(null)
const actaDraftFileUrl = ref<string | null>(null)
const actaDraftFileKind = ref<ActaFileKind>('image')
const actaMap = reactive<Record<number, ActaUploadRecord>>({})
const toast = useToast()

interface DerivacionLogisticaRecord {
  comment: string
  derivedAt: string
}

const derivarModalOpen = ref(false)
const derivarRequest = ref<SolicitudListItem | null>(null)
const derivarComment = ref('')
const derivacionLogisticaMap = reactive<Record<number, DerivacionLogisticaRecord>>({})

const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase()

const extractErrorMessage = (cause: unknown) => {
  if (cause && typeof cause === 'object') {
    const candidate = cause as { message?: unknown; data?: { message?: unknown } }
    if (typeof candidate.data?.message === 'string') return candidate.data.message
    if (typeof candidate.message === 'string') return candidate.message
  }
  return 'No se pudo consultar las solicitudes'
}

const getUbicacionLabel = (item: SolicitudListItem) => {
  const ubicacion = (item.ubicacion ?? '').trim()
  return ubicacion || '--'
}

const getEstadoRrhhLabel = (item: SolicitudListItem) => {
  const estado = normalize(item.estado_rrhh)
  if (!estado) return '--'
  if (estado === 'pendiente') return 'Pendiente'
  if (estado === 'derivar_logistica') return 'Derivar a logística'
  if (estado === 'recojo_oficina') return 'Recojo en oficina'
  return estado.replace(/_/g, ' ')
}

const estadoRrhhTone = (value?: string | null) => {
  const estado = normalize(value)
  if (!estado) return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  if (estado === 'pendiente') return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
  if (estado === 'derivar_logistica') return 'bg-sky-100 text-sky-800 ring-1 ring-sky-200'
  if (estado === 'recojo_oficina') return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
}

const isMixtoSolicitud = (item: SolicitudListItem) => {
  const tipo = normalize(item.tipo_solicitud)
  return tipo === 'mixto' || tipo === 'mixta' || tipo.includes('mixt')
}

const hasDerivacionLogistica = (item: SolicitudListItem) => {
  const key = item.id_solicitud ?? null
  if (!key) return false
  return Boolean(derivacionLogisticaMap[key])
}

const openDerivarModal = (item: SolicitudListItem) => {
  derivarRequest.value = item
  derivarComment.value = ''
  derivarModalOpen.value = true
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

  toast.add({ title: 'Derivado a logística (solo frontend)', color: 'success' })
  closeDerivarModal()
}

const revokeBlobUrl = (url?: string | null) => {
  if (!url || !url.startsWith('blob:') || !import.meta.client) return
  URL.revokeObjectURL(url)
}

const getActaKey = (item: SolicitudListItem) => item.id_solicitud ?? null
const hasActa = (item: SolicitudListItem) => {
  const key = getActaKey(item)
  if (!key) return false
  return Boolean(actaMap[key])
}

const openActaModal = (item: SolicitudListItem) => {
  actaRequest.value = item
  actaDraftFileName.value = null
  actaDraftFileUrl.value = null
  actaDraftFileKind.value = 'image'
  actaModalOpen.value = true
}

const closeActaModal = () => {
  actaModalOpen.value = false
  actaRequest.value = null
  actaDraftFileName.value = null
  actaDraftFileUrl.value = null
  actaDraftFileKind.value = 'image'
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

  // Draft only; saved blob is kept in actaMap until unmount.
  revokeBlobUrl(actaDraftFileUrl.value)
  actaDraftFileUrl.value = URL.createObjectURL(file)
  actaDraftFileName.value = file.name
  actaDraftFileKind.value = getActaKind(file.name, file.type)
}

const saveActaDraft = () => {
  const key = actaRequest.value?.id_solicitud
  if (!key || !actaDraftFileUrl.value || !actaDraftFileName.value) {
    toast.add({ title: 'Selecciona un archivo', color: 'warning' })
    return
  }

  // Replace existing saved acta (revoke old blob).
  const existing = actaMap[key]
  if (existing) revokeBlobUrl(existing.fileUrl)

  actaMap[key] = {
    fileName: actaDraftFileName.value,
    fileUrl: actaDraftFileUrl.value,
    fileKind: actaDraftFileKind.value,
    uploadedAt: new Date().toISOString(),
  }

  toast.add({ title: 'Acta subida (solo frontend)', color: 'success' })
  closeActaModal()
}

const clearActa = () => {
  const key = actaRequest.value?.id_solicitud
  if (!key) return
  const existing = actaMap[key]
  if (existing) revokeBlobUrl(existing.fileUrl)
  delete actaMap[key]
  toast.add({ title: 'Acta eliminada', color: 'info' })
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

const getRequesterName = (item: SolicitudListItem) => {
  return item.solicitante
    || [item.firstname, item.lastname].filter(Boolean).join(' ')
    || [item.staff?.firstname, item.staff?.lastname].filter(Boolean).join(' ')
    || '--'
}

const stateTone = (value?: string | null) => {
  const state = normalize(value)
  if (state.includes('rech')) return 'bg-red-100 text-red-800 ring-1 ring-red-200'
  if (state.includes('apro')) return 'bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff]'
  if (state.includes('atenc') || state.includes('pend')) return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
  if (state.includes('cerr')) return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  return 'bg-sky-100 text-sky-800 ring-1 ring-sky-200'
}

const loadRequests = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await getSolicitudes({
      search: search.value.trim() || undefined,
      from: fromDate.value || undefined,
      to: toDate.value || undefined,
    })

    // Mostrar exactamente lo que devuelve el endpoint (sin filtrar por estado).
    requests.value = response.data ?? []
  } catch (cause) {
    requests.value = []
    error.value = extractErrorMessage(cause)
  } finally {
    loading.value = false
  }
}

const refreshRequests = () => {
  void loadRequests()
}

const clearFilters = () => {
  search.value = ''
  fromDate.value = ''
  toDate.value = ''
  void loadRequests()
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
  for (const record of Object.values(actaMap)) {
    revokeBlobUrl(record.fileUrl)
  }
  revokeBlobUrl(actaDraftFileUrl.value)
})
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 px-5 md:flex-row md:items-center">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por solicitante o justificacion..."
        class="w-full md:flex-1"
      />

      <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row">
        <UInput v-model="fromDate" type="date" icon="i-lucide-calendar-range" class="w-full md:w-56" />
        <UInput v-model="toDate" type="date" icon="i-lucide-calendar-range" class="w-full md:w-56" />
      </div>

      <div class="flex gap-2">
        <UButton
          color="primary"
          class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]"
          :loading="loading"
          @click="refreshRequests"
        >
          Filtrar
        </UButton>
        <UButton color="neutral" variant="soft" @click="clearFilters">
          Limpiar
        </UButton>
      </div>
    </div>

    <div class="mx-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <div class="max-h-[68vh] overflow-x-auto overflow-y-auto">
        <table class="min-w-full border-separate border-spacing-0">
          <thead class="bg-[#2d5fc0] text-white">
            <tr>
              <th class="rounded-tl-2xl px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitud</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitante</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Estado General</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha de registro</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Ubicacion</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Tipo</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Seguimiento RRHH</th>
              <th class="rounded-tr-2xl px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
            <tr v-if="loading">
              <td colspan="8" class="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center justify-center gap-3">
                  <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
                  <span>Cargando solicitudes...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="error">
              <td colspan="8" class="px-5 py-10 text-center text-sm text-red-600 dark:text-red-400">
                <div class="space-y-3">
                  <p class="font-semibold">{{ error }}</p>
                  <UButton
                    color="primary"
                    variant="soft"
                    class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                    :loading="loading"
                    @click="refreshRequests"
                  >
                    Reintentar
                  </UButton>
                </div>
              </td>
            </tr>

            <tr
              v-for="item in requests"
              v-else
              :key="String(item.id_solicitud ?? item.id_usuario_solicitante ?? 'request')"
              class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
            >
              <td class="px-5 py-4 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                #{{ item.id_solicitud ?? '--' }}
              </td>
              <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                <div class="space-y-1">
                  <p class="max-w-[280px] font-semibold leading-5">{{ getRequesterName(item) }}</p>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-500">
                    Usuario #{{ item.id_usuario_solicitante ?? '--' }}
                  </p>
                </div>
              </td>
              <td class="px-5 py-4">
                <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', stateTone(item.estado?.descripcion)]">
                  {{ item.estado?.descripcion || '--' }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                <div class="space-y-1">
                  <p class="font-medium">{{ formatDate(item.fecha_registro) }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatTime(item.fecha_registro) }}</p>
                </div>
              </td>

              <td class="px-5 py-4">
                <span
                  v-if="getUbicacionLabel(item) !== '--'"
                  class="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800 ring-1 ring-teal-200 dark:bg-teal-950/25 dark:text-teal-200 dark:ring-teal-900/40"
                >
                  <UIcon name="i-lucide-map-pin" class="h-4 w-4" />
                  <span class="max-w-[140px] truncate">{{ getUbicacionLabel(item) }}</span>
                </span>
                <span v-else class="text-sm text-gray-600 dark:text-gray-300">{{ getUbicacionLabel(item) }}</span>
              </td>
              <td>
                {{item.tipo_solicitud ? item.tipo_solicitud.toUpperCase() : '--' }}
              </td>
              <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                <div class="space-y-1.5">
                  <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', estadoRrhhTone(item.estado_rrhh)]">
                    {{ getEstadoRrhhLabel(item) }}
                  </span>
                  <p
                    v-if="item.estado_rrhh_comentario"
                    class="max-w-[280px] truncate text-xs text-gray-500 dark:text-gray-400"
                    :title="item.estado_rrhh_comentario"
                  >
                    {{ item.estado_rrhh_comentario }}
                  </p>
                </div>
              </td>

              <td class="px-5 py-4 text-center">
                <div class="flex flex-wrap items-center justify-center gap-2">
                  <UButton
                    color="primary"
                    variant="soft"
                    icon="i-lucide-sliders-horizontal"
                    class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                    size="xs"
                    @click.stop="openDetail(item)"
                  >
                    Gestionar
                  </UButton>

                  <UButton
                    :color="hasActa(item) ? 'success' : 'neutral'"
                    variant="soft"
                    icon="i-lucide-upload"
                    size="xs"
                    :ui="{ base: 'rounded-full' }"
                    @click.stop="openActaModal(item)"
                  >
                    {{ hasActa(item) ? 'Acta subida' : 'Subir acta' }}
                  </UButton>

                </div>
              </td>
            </tr>

            <tr v-if="!loading && !error && !requests.length">
              <td colspan="8" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay solicitudes para mostrar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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
          <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Archivo (solo frontend)
            </p>
            <input
              type="file"
              accept=".pdf,image/*"
              class="mt-3 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#eef4ff] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#2d5fc0] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              @change="onActaFileSelected"
            >
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {{ actaDraftFileName || 'Sin archivo seleccionado' }}
            </p>
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
            <UButton color="neutral" variant="outline" @click="closeActaModal">
              Cancelar
            </UButton>
            <UButton
              v-if="actaRequest?.id_solicitud && actaMap[actaRequest.id_solicitud]"
              color="error"
              variant="soft"
              @click="clearActa"
            >
              Eliminar acta
            </UButton>
            <UButton color="primary" :disabled="!actaDraftFileUrl" @click="saveActaDraft">
              Guardar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="derivarModalOpen" :title="`Derivar a logística - Solicitud #${derivarRequest?.id_solicitud ?? '--'}`">
      <template #content>
        <div class="space-y-4 p-4 sm:p-5">
          <div class="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">Confirmación</p>
            <p class="mt-1 text-xs text-amber-800 dark:text-amber-300">
              Esta acción es solo maqueta frontend. Sirve para simular que la solicitud pasa a logística.
            </p>
          </div>

          <UFormGroup label="Comentario para logística (opcional)">
            <UTextarea
              v-model="derivarComment"
              :rows="4"
              placeholder="Ej: Prioridad alta. Coordinar entrega con almacén..."
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
