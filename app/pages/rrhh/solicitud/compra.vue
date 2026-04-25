<script setup lang="ts">
import {
  getComprobantesGastoRrhh,
  type ComprobanteGastoRrhhItem,
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
const staffIdFilter = shallowRef('')
const estadoFilter = shallowRef('')
const mockEstadoMap = reactive<Record<number, string>>({})
const toast = useToast()

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

const getEstadoColor = (estado?: string | null): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  const normalized = (estado ?? '').toLowerCase()
  if (normalized.includes('aprob')) return 'success'
  if (normalized.includes('pend')) return 'warning'
  if (normalized.includes('rech')) return 'error'
  if (normalized.includes('pag')) return 'info'
  return 'neutral'
}

const getEstadoLabel = (estado?: string | null) => {
  const normalized = (estado ?? '').trim()
  return normalized || '--'
}

const getVisibleEstado = (item: ComprobanteGastoRrhhItem) => {
  return mockEstadoMap[item.solicitud_gasto.id] ?? item.solicitud_gasto.estado
}

const getDetalleImageUrl = (detalle: ComprobanteGastoRrhhItem['solicitud_gasto_detalles'][number]) => {
  const url = detalle.url_imagen || detalle.ruta_imagen
  if (!url) return null
  const normalized = url.trim()
  return normalized || null
}

const getDetalleProductoLabel = (detalle: ComprobanteGastoRrhhItem['solicitud_gasto_detalles'][number]) => {
  const producto = detalle.producto?.trim()
  return producto || `Producto #${detalle.id_producto}`
}

const getSolicitanteLabel = (item: ComprobanteGastoRrhhItem) => {
  const name = item.solicitud_gasto.solicitante?.trim()
  return name || '--'
}

const getComprobanteTipo = (item: ComprobanteGastoRrhhItem) => {
  const tipo = item.comprobante?.tipo?.trim()
  return tipo || '--'
}

const approveRequestMock = (item: ComprobanteGastoRrhhItem) => {
  mockEstadoMap[item.solicitud_gasto.id] = 'aprobada'
  toast.add({
    title: 'Solicitud aprobada',
    description: 'Cambio simulado solo en frontend.',
    color: 'success',
  })
}

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
    const response = await getComprobantesGastoRrhh({
      staff_id: parseNumberFilter(staffIdFilter.value),
      estado: parseTextFilter(estadoFilter.value),
    })

    comprobantes.value = response.data ?? []

    if (expandedItemId.value && !comprobantes.value.some((item) => item.id === expandedItemId.value)) {
      expandedItemId.value = null
    }
  } catch (cause) {
    comprobantes.value = []
    expandedItemId.value = null
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
              placeholder="estado"
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
                  <th class="w-[150px] px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">ARCHIVO</th>
                  <th class="w-[120px] rounded-tr-2xl px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">DETALLE</th>
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
                        S/ {{ formatMoney(item.comprobante.monto) }}
                      </td>
                      <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <UButton
                          v-if="item.comprobante.archivo_url"
                          :href="item.comprobante.archivo_url"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="primary"
                          variant="soft"
                          size="xs"
                          class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                          @click.stop
                        >
                          Ver archivo
                        </UButton>
                        <span v-else class="text-xs text-gray-500 dark:text-gray-400">Sin archivo</span>
                      </td>
                      <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                        <UButton
                          color="primary"
                          variant="soft"
                          size="xs"
                          class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                          :icon="isExpanded(item) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                          @click.stop="toggleRow(item)"
                        >
                          {{ isExpanded(item) ? 'Ocultar' : 'Ver' }}
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
                                {{ getComprobanteTipo(item) }} - {{ displayValue(item.comprobante.numero) }}
                              </p>
                              <p class="text-xs text-gray-500 dark:text-gray-400">
                                Monto: S/ {{ formatMoney(item.comprobante.monto) }}
                              </p>
                              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Archivo: {{ item.comprobante.archivo_url ? 'Disponible' : 'No disponible' }}
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

                          <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                            <div>
                              <p class="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                                Accion simulada
                              </p>
                              <p class="text-xs text-emerald-800 dark:text-emerald-300">
                                Este boton solo cambia el estado en el frontend.
                              </p>
                            </div>

                            <UButton
                              color="success"
                              class="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                              icon="i-lucide-check"
                              :disabled="getVisibleEstado(item) === 'aprobada'"
                              @click.stop="approveRequestMock(item)"
                            >
                              {{ getVisibleEstado(item) === 'aprobada' ? 'Aprobada' : 'Aprobar solicitud' }}
                            </UButton>
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
                                    v-for="detalle in item.solicitud_gasto_detalles"
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

                                  <tr v-if="!item.solicitud_gasto_detalles.length">
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
</template>
