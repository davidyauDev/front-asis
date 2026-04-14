<script setup lang="ts">
import AppTabs, { type AppTabItem } from '~/components/AppTabs.vue'
import SolicitudDetalleModal from '~/components/rrhh/inventario/SolicitudDetalleModal.vue'
import {
  getSolicitudById,
  getSolicitudProductosRrhh,
  getSolicitudes,
  type SolicitudDetalleData,
  type SolicitudListItem,
  type SolicitudProductoRrhhItem,
} from '~/services/rrhh/solicitudes'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Solicitudes',
})

const loading = ref(false)
const error = ref<string | null>(null)
const requests = ref<SolicitudListItem[]>([])
const search = ref('')
const fromDate = ref('')
const toDate = ref('')
const activeTab = ref<'mixta' | 'interna_rrhh' | 'compra'>('mixta')
const purchaseLoading = ref(false)
const purchaseError = ref<string | null>(null)
const purchaseRequests = ref<SolicitudProductoRrhhItem[]>([])
const purchaseStaffId = ref('')
const purchaseProductId = ref('')

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

const isPendingRequest = (item: SolicitudListItem) => {
  const state = normalize(item.estado?.descripcion)
  return !state || state.includes('pend')
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

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '--'
  return value
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
  if (state.includes('apro')) return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
  if (state.includes('atenc') || state.includes('pend')) return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
  if (state.includes('cerr')) return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
  return 'bg-sky-100 text-sky-800 ring-1 ring-sky-200'
}

const tabItems = computed<AppTabItem[]>(() => [
  {
    label: 'MIXTA',
    value: 'mixta',
    badge: requests.value.length || undefined,
  },
  {
    label: 'INTERNA_RRHH',
    value: 'interna_rrhh',
  },
  {
    label: 'COMPRA',
    value: 'compra',
    badge: purchaseRequests.value.length || undefined,
  },
])

const isMixtaTab = computed(() => activeTab.value === 'mixta')
const isCompraTab = computed(() => activeTab.value === 'compra')
const currentLoading = computed(() => (isMixtaTab.value ? loading.value : purchaseLoading.value))

const loadRequests = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await getSolicitudes({
      search: search.value.trim() || undefined,
      from: fromDate.value || undefined,
      to: toDate.value || undefined,
    })

    requests.value = (response.data ?? []).filter(isPendingRequest)
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

const parseNumberFilter = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const loadPurchaseRequests = async () => {
  purchaseLoading.value = true
  purchaseError.value = null

  try {
    const response = await getSolicitudProductosRrhh({
      staff_id: parseNumberFilter(purchaseStaffId.value),
      id_producto: parseNumberFilter(purchaseProductId.value),
    })

    purchaseRequests.value = response.data ?? []
  } catch (cause) {
    purchaseRequests.value = []
    purchaseError.value = extractErrorMessage(cause)
  } finally {
    purchaseLoading.value = false
  }
}

const refreshPurchaseRequests = () => {
  void loadPurchaseRequests()
}

const clearPurchaseFilters = () => {
  purchaseStaffId.value = ''
  purchaseProductId.value = ''
  void loadPurchaseRequests()
}

const refreshActiveTab = () => {
  if (isCompraTab.value) {
    void loadPurchaseRequests()
    return
  }

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

watch(activeTab, (tab) => {
  if (tab !== 'compra') return
  if (purchaseRequests.value.length || purchaseLoading.value) return
  void loadPurchaseRequests()
})

onMounted(() => {
  void loadRequests()
})
</script>

<template>
  <div class="space-y-5">
    <UCard class="overflow-hidden border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85" :ui="{ body: 'p-0' }">
      <div class="space-y-5">
        <div class="flex flex-col gap-4 border-b border-gray-200 px-5 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <h1 class="text-xl font-bold text-gray-950 dark:text-white">Solicitudes pendientes</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Consulta del nuevo controlador <code>SolicitudController</code> para ver solicitudes y su detalle.
            </p>
          </div>

          <UButton
            color="primary"
            variant="soft"
            icon="i-lucide-rotate-cw"
            class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
            :loading="currentLoading"
            @click="refreshActiveTab"
          >
            Actualizar
          </UButton>
        </div>

        <div class="px-5">
          <AppTabs v-model="activeTab" :ariaLabel="'Solicitudes de inventario'" :items="tabItems" />
        </div>

        <div v-if="isMixtaTab" class="space-y-5">
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
              <UButton color="primary" class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]" :loading="loading" @click="refreshRequests">
                Filtrar
              </UButton>
              <UButton color="neutral" variant="soft" @click="clearFilters">
                Limpiar
              </UButton>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-gray-200 mx-5 dark:border-gray-800">
            <div class="overflow-x-auto overflow-y-auto max-h-[68vh]">
              <table class="min-w-full border-separate border-spacing-0">
                <thead class="bg-[#2d5fc0] text-white">
                  <tr>
                    <th class="rounded-tl-2xl px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitud</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitante</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha de registro</th>
                    <th class="rounded-tr-2xl px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  <tr v-if="loading">
                    <td colspan="5" class="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div class="flex items-center justify-center gap-3">
                        <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
                        <span>Cargando solicitudes...</span>
                      </div>
                    </td>
                  </tr>

                  <tr v-else-if="error">
                    <td colspan="5" class="px-5 py-10 text-center text-sm text-red-600 dark:text-red-400">
                      <div class="space-y-3">
                        <p class="font-semibold">{{ error }}</p>
                        <UButton color="primary" variant="soft" class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]" :loading="loading" @click="refreshRequests">
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
                    <td colspan="5" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No hay solicitudes pendientes para mostrar.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else-if="isCompraTab" class="space-y-5 pb-5">
          <div class="flex flex-col gap-3 px-5 md:flex-row md:items-center">
            <UInput
              v-model="purchaseStaffId"
              type="number"
              placeholder="Filtrar por staff_id"
              class="w-full md:w-64"
            />
            <UInput
              v-model="purchaseProductId"
              type="number"
              placeholder="Filtrar por id_producto"
              class="w-full md:w-64"
            />

            <div class="flex gap-2">
              <UButton color="primary" class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]" :loading="purchaseLoading" @click="refreshPurchaseRequests">
                Filtrar
              </UButton>
              <UButton color="neutral" variant="soft" @click="clearPurchaseFilters">
                Limpiar
              </UButton>
            </div>
          </div>

          <div class="mx-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <div class="max-h-[68vh] overflow-x-auto overflow-y-auto">
              <table class="min-w-[2200px] border-separate border-spacing-0">
                <thead class="bg-[#2d5fc0] text-white">
                  <tr>
                    <th class="rounded-tl-2xl px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">ID</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">CODIGO PRODUCTO</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">DESCRIPCION</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">FIRSTNAME</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">LASTNAME</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">CANTIDAD SOLICITADA</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">OBSERVACION ATENCION</th>
                    <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">FECHA REGISTRO</th>
                    <th class="rounded-tr-2xl px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">FECHA NECESARIA</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  <tr v-if="purchaseLoading">
                    <td colspan="9" class="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div class="flex items-center justify-center gap-3">
                        <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
                        <span>Cargando productos de RRHH...</span>
                      </div>
                    </td>
                  </tr>

                  <tr v-else-if="purchaseError">
                    <td colspan="9" class="px-5 py-10 text-center text-sm text-red-600 dark:text-red-400">
                      <div class="space-y-3">
                        <p class="font-semibold">{{ purchaseError }}</p>
                        <UButton color="primary" variant="soft" class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]" :loading="purchaseLoading" @click="refreshPurchaseRequests">
                          Reintentar
                        </UButton>
                      </div>
                    </td>
                  </tr>

                  <tr
                    v-for="item in purchaseRequests"
                    v-else
                    :key="`purchase-${item.id}`"
                    class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
                  >
                    <td class="px-5 py-4 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                      {{ item.id }}
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {{ displayValue(item.producto?.codigo_producto) }}
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      <p class="max-w-[260px] whitespace-normal break-words">{{ displayValue(item.producto?.descripcion) }}</p>
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {{ displayValue(item.staff?.firstname) }}
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {{ displayValue(item.staff?.lastname) }}
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {{ displayValue(item.detalle?.cantidad_solicitada) }}
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      <p class="max-w-[260px] whitespace-normal break-words">{{ displayValue(item.detalle?.observacion_atencion) }}</p>
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {{ formatDate(item.solicitud?.fecha_registro) }}
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {{ formatDate(item.solicitud?.fecha_necesaria) }}
                    </td>
                  </tr>

                  <tr v-if="!purchaseLoading && !purchaseError && !purchaseRequests.length">
                    <td colspan="9" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No hay registros para mostrar.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else class="px-5 pb-5">
          <UCard class="border-dashed border-gray-200 bg-gray-50/80 shadow-none dark:border-gray-800 dark:bg-gray-900/50" :ui="{ body: 'p-6' }">
            <div class="space-y-2">
              <h2 class="text-lg font-bold text-gray-950 dark:text-white">
                INTERNA_RRHH
              </h2>
              <p class="text-sm leading-6 text-gray-600 dark:text-gray-300">
                Esta pestaña queda preparada por ahora y no muestra registros todavía.
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </UCard>

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
