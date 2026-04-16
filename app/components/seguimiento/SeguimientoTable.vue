<script setup lang="ts">
import type { Marcacion, SeguimientoSubTab, SeguimientoTableRow, TecnicoData, ValidationTarget } from '~/types/seguimiento'
import {
  esObjetoSinMarcacion,
  getConceptBadge,
  getMarcacionesCount,
  hasMarcaciones,
  shouldShowValidar,
} from '~/utils/seguimiento'

const props = defineProps<{
  items: SeguimientoTableRow[]
  expanded: Record<string, boolean>
  subTab: SeguimientoSubTab
  emptyState: {
    title: string
    description: string
  }
}>()

const emit = defineEmits<{
  toggle: [key: string]
  validar: [tecnico: ValidationTarget]
  sendWhatsApp: [tecnico: TecnicoData, mode: 'saludo' | 'seguimiento']
}>()

const detailOpen = ref(false)
const selectedRow = ref<SeguimientoTableRow | null>(null)

const openDetail = (row: SeguimientoTableRow) => {
  selectedRow.value = row
  detailOpen.value = true
}

const closeDetail = () => {
  detailOpen.value = false
  selectedRow.value = null
}

const getMarkBadge = (row: SeguimientoTableRow) => {
  if (hasMarcaciones(row.marcaciones)) {
    return {
      label: `${getMarcacionesCount(row.marcaciones)} marcaciones`,
      color: 'success' as const,
      variant: 'soft' as const,
    }
  }

  return {
    label: 'Sin marcaciones',
    color: 'neutral' as const,
    variant: 'soft' as const,
  }
}

const getConceptForRow = (row: SeguimientoTableRow) => {
  if (!row.dailyRecord) {
    return {
      text: 'Sin registro',
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    }
  }

  return getConceptBadge(row.dailyRecord)
}

const canSendWhatsApp = (row: SeguimientoTableRow) =>
  Boolean(row.whatsappTarget) && (props.subTab === 'marcaron' || !hasMarcaciones(row.marcaciones))

const getRouteStatusColor = (estado: string) => {
  switch (estado) {
    case 'Completado':
      return 'success' as const
    case 'En Proceso':
      return 'info' as const
    case 'Programado':
      return 'warning' as const
    default:
      return 'neutral' as const
  }
}

const formatPunchHour = (punchTime?: string) =>
  String(punchTime || '').split(' ')[1] || punchTime || '-'

const formatRouteTime = (value?: string | null) => {
  if (!value) {
    return '-'
  }

  return String(value).split(' ')[1] || value
}

const getMarkLocation = (marcacion: Marcacion) =>
  marcacion.terminal_alias || marcacion.area_alias || marcacion.gps_location || 'Sin ubicacion'

const selectedProfileItems = computed(() => {
  const row = selectedRow.value

  if (!row) {
    return []
  }

  return [
    { label: 'Cargo', value: row.posicion || 'Sin cargo registrado' },
    { label: 'Departamento', value: row.usuario.departamento || 'Sin departamento' },
    { label: 'Cobertura', value: `${row.rutasCount} rutas` },
  ]
})

const selectedRoutes = computed(() => selectedRow.value?.rutas ?? [])
const selectedMarks = computed(() =>
  Array.isArray(selectedRow.value?.marcaciones) ? selectedRow.value?.marcaciones ?? [] : [],
)
const selectedMarkCount = computed(() => getMarcacionesCount(selectedRow.value?.marcaciones))
const selectedMarkMessage = computed(() =>
  selectedRow.value && esObjetoSinMarcacion(selectedRow.value.marcaciones)
    ? selectedRow.value.marcaciones.message
    : '',
)
const selectedConcept = computed(() =>
  selectedRow.value
    ? getConceptBadge(selectedRow.value.dailyRecord)
    : {
        text: 'Sin registro',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
      },
)
</script>

<template>
  <div>
    <div v-if="props.items.length === 0" class="px-6 py-14">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <UIcon name="i-lucide-inbox" class="h-6 w-6" />
        </div>
        <p class="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {{ props.emptyState.title }}
        </p>
        <p class="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
          {{ props.emptyState.description }}
        </p>
      </div>
    </div>

    <div v-else class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div class="overflow-x-auto">
        <table class="min-w-[1460px] table-fixed border-separate border-spacing-0">
          <thead class="bg-[#2d5fc0] text-white">
            <tr class="text-left text-[11px] font-semibold uppercase tracking-wider text-white">
              <th class="w-[5%] px-4 py-3.5">Ver</th>
              <th class="w-[340px] min-w-[340px] max-w-[340px] px-4 py-3.5">Tecnico</th>
              <th class="w-[17%] px-4 py-3.5">Cargo</th>
              <th class="w-[19%] px-4 py-3.5">Departamento</th>
              <th class="w-[12%] px-4 py-3.5">Cobertura</th>
              <th class="w-[10%] px-4 py-3.5">Estado</th>
              <th class="w-[8%] px-4 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
            <tr
              v-for="row in props.items"
              :key="row.key"
              class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/50"
            >
              <td class="px-4 py-4 align-top">
                <UButton
                  color="neutral"
                  variant="outline"
                  size="xs"
                  icon="i-lucide-eye"
                  class="rounded-full border-[#c9d8ff] bg-white text-[#2d5fc0] hover:bg-[#eef4ff]"
                  aria-label="Ver detalle"
                  @click.stop="openDetail(row)"
                >
                  Ver
                </UButton>
              </td>

              <td class="w-[340px] min-w-[340px] max-w-[340px] px-4 py-4 align-top">
                <div class="flex w-[340px] max-w-[340px] items-start gap-3">
                  <UAvatar
                    :alt="row.nombre"
                    size="md"
                    class="bg-gray-200 text-gray-700 ring-0 shadow-none"
                  >
                    {{ row.initials }}
                  </UAvatar>

                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {{ row.nombre }}
                    </div>
                    <div class="truncate text-sm text-gray-500 dark:text-gray-400">
                      {{ row.subtitle }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-4 align-top">
                <span class="truncate text-sm text-gray-700 dark:text-gray-200">
                  {{ row.posicion || 'Sin cargo registrado' }}
                </span>
              </td>

              <td class="px-4 py-4 align-top">
                <span class="truncate text-sm text-gray-700 dark:text-gray-200">
                  {{ row.usuario.departamento || 'Sin departamento' }}
                </span>
              </td>

              <td class="px-4 py-4 align-top">
                <span class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {{ row.rutasCount }} rutas
                </span>
              </td>

              <td class="px-4 py-4 align-top">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge :color="getMarkBadge(row).color" :variant="getMarkBadge(row).variant" class="rounded-full px-3 py-1">
                    {{ getMarkBadge(row).label }}
                  </UBadge>

                  <span :class="`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getConceptForRow(row).color}`">
                    {{ getConceptForRow(row).text }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-4 align-top">
                <div class="flex items-center justify-end gap-2">
                  <UButton
                    v-if="shouldShowValidar(row.validationTarget)"
                    color="primary"
                    variant="outline"
                    size="xs"
                    icon="i-lucide-badge-check"
                    class="rounded-full border-[#c9d8ff] text-[#2d5fc0] hover:bg-[#eef4ff]"
                    @click.stop="emit('validar', row.validationTarget)"
                  />

                  <UButton
                    v-if="canSendWhatsApp(row) && row.whatsappTarget"
                    color="success"
                    variant="outline"
                    size="xs"
                    icon="i-lucide-message-circle"
                    class="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300"
                    @click.stop="emit('sendWhatsApp', row.whatsappTarget, props.subTab === 'marcaron' ? 'saludo' : 'seguimiento')"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
        Total de registros:
        <span class="ml-1 font-semibold text-gray-900 dark:text-gray-100">
          {{ props.items.length }}
        </span>
      </div>
    </div>

    <UModal
      v-model:open="detailOpen"
      class="w-[calc(100vw-1rem)] max-w-[1500px]"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
      @close="closeDetail"
    >
      <template #title>
        <div class="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Seguimiento
          </p>
          <div class="mt-1 flex flex-wrap items-center justify-between gap-4">
            <div class="min-w-0">
              <h2 class="truncate text-lg font-bold text-gray-950 dark:text-white">
                {{ selectedRow?.nombre || 'Detalle del tecnico' }}
              </h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ selectedRow?.subtitle || 'Informacion operativa para la fecha seleccionada' }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1">
                {{ selectedRow?.rutasCount ?? 0 }} rutas
              </UBadge>
              <UBadge color="success" variant="soft" class="rounded-full px-3 py-1">
                {{ selectedMarkCount }} marcaciones
              </UBadge>
              <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-x" class="rounded-full" @click="closeDetail">
                Cerrar
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <template #body>
        <div class="bg-white p-4 dark:bg-gray-950">
          <div class="grid gap-0 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            <div class="p-4">
              <div class="mb-4 flex items-center gap-3">
                <UAvatar
                  :alt="selectedRow?.nombre || 'Tecnico'"
                  size="lg"
                  class="bg-gray-200 text-gray-700 ring-0 shadow-none"
                >
                  {{ selectedRow?.initials || 'TR' }}
                </UAvatar>

                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ selectedRow?.nombre || '-' }}
                  </div>
                  <div class="truncate text-sm text-gray-500 dark:text-gray-400">
                    {{ selectedRow?.subtitle || '-' }}
                  </div>
                </div>
              </div>

              <div class="divide-y divide-gray-200 dark:divide-gray-800">
                <div
                  v-for="item in selectedProfileItems"
                  :key="item.label"
                  class="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                    {{ item.label }}
                  </span>
                  <span class="max-w-[60%] truncate text-right text-gray-700 dark:text-gray-200">
                    {{ item.value }}
                  </span>
                </div>
              </div>
            </div>

            <div class="p-4">
              <div class="mb-3 flex items-center justify-between">
                <div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Rutas asignadas
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Detalle operativo para la fecha seleccionada.
                  </div>
                </div>
                <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1">
                  {{ selectedRoutes.length }}
                </UBadge>
              </div>

              <div v-if="selectedRoutes.length === 0" class="py-8 text-sm text-gray-500 dark:text-gray-400">
                Sin rutas asignadas para la fecha seleccionada.
              </div>

              <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
                <div v-for="ruta in selectedRoutes" :key="ruta.ticket_id" class="py-3">
                  <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <UBadge color="neutral" variant="outline" class="rounded-full px-2.5 py-1 font-mono">
                          {{ ruta.number }}
                        </UBadge>
                        <UBadge :color="getRouteStatusColor(ruta.estado)" variant="soft" class="rounded-full px-2.5 py-1">
                          {{ ruta.estado }}
                        </UBadge>
                      </div>
                      <div class="mt-2 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {{ ruta.agencia }}
                      </div>
                      <div class="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                        {{ ruta.topic }} | {{ ruta.cliente }}
                      </div>
                      <div class="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                        {{ ruta.subject }}
                      </div>
                    </div>

                    <div class="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {{ formatRouteTime(ruta.fecha_programada) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4">
              <div class="mb-3 flex items-center justify-between">
                <div>
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Marcaciones
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Evidencia de asistencia y ubicacion.
                  </div>
                </div>
                <UBadge :color="selectedMarkCount > 0 ? 'success' : 'neutral'" variant="soft" class="rounded-full px-3 py-1">
                  {{ selectedMarkCount }}
                </UBadge>
              </div>

              <div v-if="selectedMarkMessage" class="py-8 text-sm text-gray-500 dark:text-gray-400">
                {{ selectedMarkMessage }}
              </div>

              <div v-else-if="selectedMarkCount === 0" class="py-8 text-sm text-gray-500 dark:text-gray-400">
                Sin marcaciones registradas.
              </div>

              <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
                <div
                  v-for="marcacion in selectedMarks"
                  :key="marcacion.id || marcacion.punch_time"
                  class="flex items-center justify-between gap-4 py-3"
                >
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge color="success" variant="outline" class="rounded-full px-2.5 py-1 font-mono">
                        {{ formatPunchHour(marcacion.punch_time) }}
                      </UBadge>
                      <UBadge
                        v-if="marcacion.punch_state"
                        color="neutral"
                        variant="soft"
                        class="rounded-full px-2.5 py-1"
                      >
                        {{ marcacion.punch_state }}
                      </UBadge>
                    </div>
                    <div class="mt-2 truncate text-sm text-gray-700 dark:text-gray-200">
                      {{ getMarkLocation(marcacion) }}
                    </div>
                    <div class="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                      {{ marcacion.terminal_alias || marcacion.area_alias || marcacion.terminal_sn }}
                    </div>
                  </div>

                  <div v-if="marcacion.imagen_url" class="shrink-0">
                    <img
                      :src="marcacion.imagen_url"
                      alt="Foto"
                      class="h-12 w-12 rounded-lg border border-gray-200 object-cover dark:border-gray-800"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4">
            <UButton color="neutral" variant="soft" @click="closeDetail">
              Cerrar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
