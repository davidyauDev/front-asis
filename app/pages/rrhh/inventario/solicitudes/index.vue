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
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha de registro</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Ubicacion</th>
              <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Tipo</th>
              <th class="rounded-tr-2xl px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
            <tr v-if="loading">
              <td colspan="6" class="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center justify-center gap-3">
                  <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
                  <span>Cargando solicitudes...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="error">
              <td colspan="6" class="px-5 py-10 text-center text-sm text-red-600 dark:text-red-400">
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

              <td class="px-5 py-4 text-center">
                <UButton
                  color="primary"
                  variant="soft"
                  icon="i-lucide-eye"
                  class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                  size="xs"
                  @click.stop="openDetail(item)"
                >
                  Ver items
                </UButton>
              </td>
            </tr>

            <tr v-if="!loading && !error && !requests.length">
              <td colspan="6" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
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
  </div>
</template>
