<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Solicitudes de inventario',
})

const toast = useToast()

type SolicitudTab = 'pendientes' | 'procesando' | 'cerrados'
type SolicitudPriority = 'Alta' | 'Media' | 'Baja'
type SolicitudDelivery = 'Directo' | 'Programado' | 'Almacen'

type SolicitudItem = {
  codigo: string
  solicitante: string
  estado: {
    label: string
    tab: SolicitudTab
  }
  registro: string
  prioridad: SolicitudPriority
  entrega: SolicitudDelivery
}

const activeTab = shallowRef<SolicitudTab>('pendientes')
const search = shallowRef('')
const fromDate = shallowRef('')
const toDate = shallowRef('')
const perPage = shallowRef(10)
const page = shallowRef(1)

const perPageOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
]

const requests = ref<SolicitudItem[]>([
  { codigo: 'SOL-000152', solicitante: 'Alexander Alfredo Ari Flores', estado: { label: 'En Proceso', tab: 'procesando' }, registro: '06/04/2026 11:42', prioridad: 'Media', entrega: 'Directo' },
  { codigo: 'SOL-000153', solicitante: 'Emma Soledad Julian Iturbe', estado: { label: 'Pendiente', tab: 'pendientes' }, registro: '06/04/2026 12:05', prioridad: 'Alta', entrega: 'Programado' },
  { codigo: 'SOL-000154', solicitante: 'Johana Cecilia Camacho Caceda', estado: { label: 'Cerrado', tab: 'cerrados' }, registro: '05/04/2026 15:17', prioridad: 'Baja', entrega: 'Almacen' },
  { codigo: 'SOL-000155', solicitante: 'Joana Melissa Ortiz Reyes', estado: { label: 'Pendiente', tab: 'pendientes' }, registro: '05/04/2026 16:02', prioridad: 'Alta', entrega: 'Directo' },
  { codigo: 'SOL-000156', solicitante: 'Marjorie Alexandra Osorio la Rosa', estado: { label: 'En Proceso', tab: 'procesando' }, registro: '04/04/2026 09:28', prioridad: 'Media', entrega: 'Programado' },
  { codigo: 'SOL-000157', solicitante: 'Renzo Martin Diaz Salas', estado: { label: 'Cerrado', tab: 'cerrados' }, registro: '04/04/2026 10:55', prioridad: 'Baja', entrega: 'Almacen' },
  { codigo: 'SOL-000158', solicitante: 'Camila Sofia Pinedo Vargas', estado: { label: 'Pendiente', tab: 'pendientes' }, registro: '03/04/2026 08:14', prioridad: 'Media', entrega: 'Directo' },
  { codigo: 'SOL-000159', solicitante: 'Luis Fernando Montes Velarde', estado: { label: 'En Proceso', tab: 'procesando' }, registro: '03/04/2026 12:41', prioridad: 'Alta', entrega: 'Programado' },
  { codigo: 'SOL-000160', solicitante: 'Fiorella Milagros Torres Prado', estado: { label: 'Cerrado', tab: 'cerrados' }, registro: '02/04/2026 17:20', prioridad: 'Media', entrega: 'Almacen' },
  { codigo: 'SOL-000161', solicitante: 'Rosa Elena Huamani Paredes', estado: { label: 'Pendiente', tab: 'pendientes' }, registro: '02/04/2026 13:09', prioridad: 'Alta', entrega: 'Directo' },
  { codigo: 'SOL-000162', solicitante: 'Kevin Joel Salazar Luna', estado: { label: 'En Proceso', tab: 'procesando' }, registro: '01/04/2026 11:33', prioridad: 'Media', entrega: 'Programado' },
  { codigo: 'SOL-000163', solicitante: 'Milagros Andrea Cueva Torres', estado: { label: 'Cerrado', tab: 'cerrados' }, registro: '01/04/2026 14:47', prioridad: 'Baja', entrega: 'Almacen' },
])

const tabs = computed(() => ({
  pendientes: requests.value.filter(item => item.estado.tab === 'pendientes').length,
  procesando: requests.value.filter(item => item.estado.tab === 'procesando').length,
  cerrados: requests.value.filter(item => item.estado.tab === 'cerrados').length,
}))

const tabItems = computed(() => [
  { label: 'Pendientes', value: 'pendientes', badge: tabs.value.pendientes },
  { label: 'Procesando', value: 'procesando', badge: tabs.value.procesando },
  { label: 'Cerrados', value: 'cerrados', badge: tabs.value.cerrados },
])

const filteredRequests = computed(() => {
  const query = search.value.trim().toLowerCase()
  const from = fromDate.value.trim()
  const to = toDate.value.trim()

  return requests.value.filter((item) => {
    const matchesTab = item.estado.tab === activeTab.value
    const matchesQuery = !query || [
      item.codigo,
      item.solicitante,
      item.estado.label,
      item.registro,
      item.prioridad,
      item.entrega,
    ].join(' ').toLowerCase().includes(query)

    const datePart = item.registro.slice(6, 10) + '-' + item.registro.slice(3, 5) + '-' + item.registro.slice(0, 2)
    const matchesFrom = !from || datePart >= from
    const matchesTo = !to || datePart <= to

    return matchesTab && matchesQuery && matchesFrom && matchesTo
  })
})

const requestPageCount = computed(() => Math.max(1, Math.ceil(filteredRequests.value.length / perPage.value)))
const requestShowingStart = computed(() => (filteredRequests.value.length ? ((page.value - 1) * perPage.value) + 1 : 0))
const requestShowingEnd = computed(() => (filteredRequests.value.length ? Math.min(page.value * perPage.value, filteredRequests.value.length) : 0))
const visibleRequests = computed(() => filteredRequests.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))

const stateTone = (tab: SolicitudTab) => {
  if (tab === 'pendientes') return 'bg-[#f2cb21] text-[#6a4b00]'
  if (tab === 'procesando') return 'bg-[#2d5fc0] text-white'
  return 'bg-[#5f6b7a] text-white'
}

const priorityTone = (priority: SolicitudPriority) => {
  if (priority === 'Alta') return 'bg-[#e53946] text-white'
  if (priority === 'Media') return 'bg-[#f2cb21] text-[#6a4b00]'
  return 'bg-[#67c51f] text-white'
}

const deliveryTone = (delivery: SolicitudDelivery) => {
  if (delivery === 'Directo') return 'bg-[#6f5ce8] text-white'
  if (delivery === 'Programado') return 'bg-[#2d5fc0] text-white'
  return 'bg-[#5f6b7a] text-white'
}

const actionItems = (item: SolicitudItem) => [
  {
    label: 'Ver detalle',
    icon: 'i-lucide-eye',
    onSelect: () => toast.add({
      title: 'Detalle disponible',
      description: `Se abriria el detalle de ${item.codigo}.`,
    }),
  },
  {
    label: 'Historial',
    icon: 'i-lucide-history',
    onSelect: () => toast.add({
      title: 'Historial disponible',
      description: `Se abriria el historial de ${item.codigo}.`,
    }),
  },
]

watch([search, fromDate, toDate, perPage, activeTab], () => {
  page.value = 1
})
</script>

<template>
  <div class="space-y-5 p-2">
    <UCard class="overflow-hidden border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85" :ui="{ body: 'p-0' }">
      <div class="space-y-5 p-5">
        <div class="space-y-1">
          <h1 class="text-xl font-bold text-gray-950 dark:text-white">
            Solicitudes de inventario
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Seguimiento de pedidos internos, estados y trazabilidad operativa.
          </p>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-end">
          <AppTabs
            v-model="activeTab"
            ariaLabel="Solicitudes de inventario"
            size="sm"
            :items="tabItems"
            list-class="w-fit"
          />
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar por solicitud, solicitante, estado o prioridad..."
            class="w-full md:flex-1"
          />

          <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <UInput
              v-model="fromDate"
              type="date"
              icon="i-lucide-calendar-range"
              class="w-full md:w-56"
            />
            <UInput
              v-model="toDate"
              type="date"
              icon="i-lucide-calendar-range"
              class="w-full md:w-56"
            />
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <table class="min-w-full border-collapse">
            <thead class="bg-[#2d5fc0] text-white">
              <tr>
                <th class="rounded-tl-2xl px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitud</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitante</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Registro</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Prioridad</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Entrega</th>
                <th class="rounded-tr-2xl px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr v-for="item in visibleRequests" :key="item.codigo" class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60">
                <td class="px-5 py-3 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                  {{ item.codigo }}
                </td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {{ item.solicitante }}
                </td>
                <td class="px-5 py-3">
                  <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', stateTone(item.estado.tab)]">
                    {{ item.estado.label }}
                  </span>
                </td>
                <td class="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ item.registro }}
                </td>
                <td class="px-5 py-3 text-center">
                  <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', priorityTone(item.prioridad)]">
                    {{ item.prioridad }}
                  </span>
                </td>
                <td class="px-5 py-3 text-center">
                  <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', deliveryTone(item.entrega)]">
                    {{ item.entrega }}
                  </span>
                </td>
                <td class="px-5 py-3 text-center">
                  <UTooltip text="Mas acciones">
                    <UDropdownMenu :items="actionItems(item)" :content="{ align: 'end' }">
                      <UButton
                        color="warning"
                        variant="soft"
                        icon="i-lucide-ellipsis-vertical"
                        class="rounded-full bg-[#fff4d6] text-[#a16207] ring-1 ring-[#f7d27a] hover:bg-[#ffecb2]"
                        size="xs"
                        aria-label="Acciones"
                        title="Acciones"
                      />
                    </UDropdownMenu>
                  </UTooltip>
                </td>
              </tr>

              <tr v-if="!visibleRequests.length">
                <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay resultados para el filtro actual
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Mostrando</span>
            <span class="font-semibold text-gray-950 dark:text-white">{{ requestShowingStart }}</span>
            <span>a</span>
            <span class="font-semibold text-gray-950 dark:text-white">{{ requestShowingEnd }}</span>
            <span>de</span>
            <span class="font-semibold text-gray-950 dark:text-white">{{ filteredRequests.length }}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600 dark:text-gray-400">Por pagina</span>
            <USelectMenu
              v-model="perPage"
              :items="perPageOptions"
              value-key="value"
              label-key="label"
              class="w-24"
            />
            <UPagination
              v-model:page="page"
              :page-count="perPage"
              :total="filteredRequests.length"
              :sibling-count="1"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Pagina {{ page }} de {{ requestPageCount }}
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
