<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Solicitudes de inventario',
})

const toast = useToast()

type SolicitudTab = 'pendientes' | 'procesando' | 'cerrados'

type SolicitudAreaTone = 'cyan' | 'amber' | 'blue'

type SolicitudArea = {
  label: string
  estado: string
  ratio: string
  progress: number
  tone: SolicitudAreaTone
}

type SolicitudItem = {
  codigo: string
  solicitante: string
  solicitado: number
  stock: number
  estado: {
    label: string
    tab: SolicitudTab
  }
  registro: string
  antiguedad: string
  areas: SolicitudArea[]
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
  {
    codigo: 'SOL-000153',
    solicitante: 'Alexander Alfredo Ari Flores',
    solicitado: 3,
    stock: 1,
    estado: { label: 'Pendiente de Atencion', tab: 'pendientes' },
    registro: '09/04/2026 09:50',
    antiguedad: '0 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000152',
    solicitante: 'Emma Soledad Julian Iturbe',
    solicitado: 4,
    stock: 2,
    estado: { label: 'En Proceso', tab: 'procesando' },
    registro: '08/04/2026 14:12',
    antiguedad: '1 dia',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'En proceso', ratio: '2/3', progress: 67, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000154',
    solicitante: 'Johana Cecilia Camacho Caceda',
    solicitado: 2,
    stock: 2,
    estado: { label: 'Cerrado', tab: 'cerrados' },
    registro: '07/04/2026 15:17',
    antiguedad: '2 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000155',
    solicitante: 'Joana Melissa Ortiz Reyes',
    solicitado: 5,
    stock: 3,
    estado: { label: 'Pendiente de Atencion', tab: 'pendientes' },
    registro: '07/04/2026 16:02',
    antiguedad: '2 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000156',
    solicitante: 'Marjorie Alexandra Osorio la Rosa',
    solicitado: 3,
    stock: 1,
    estado: { label: 'En Proceso', tab: 'procesando' },
    registro: '06/04/2026 09:28',
    antiguedad: '3 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'En proceso', ratio: '2/3', progress: 67, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'En proceso', ratio: '1/1', progress: 50, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000157',
    solicitante: 'Renzo Martin Diaz Salas',
    solicitado: 1,
    stock: 1,
    estado: { label: 'Cerrado', tab: 'cerrados' },
    registro: '06/04/2026 10:55',
    antiguedad: '3 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000158',
    solicitante: 'Camila Sofia Pinedo Vargas',
    solicitado: 4,
    stock: 1,
    estado: { label: 'Pendiente de Atencion', tab: 'pendientes' },
    registro: '05/04/2026 08:14',
    antiguedad: '4 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000159',
    solicitante: 'Luis Fernando Montes Velarde',
    solicitado: 2,
    stock: 2,
    estado: { label: 'En Proceso', tab: 'procesando' },
    registro: '05/04/2026 12:41',
    antiguedad: '4 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'En proceso', ratio: '1/2', progress: 50, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000160',
    solicitante: 'Fiorella Milagros Torres Prado',
    solicitado: 1,
    stock: 1,
    estado: { label: 'Cerrado', tab: 'cerrados' },
    registro: '04/04/2026 17:20',
    antiguedad: '5 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000161',
    solicitante: 'Rosa Elena Huamani Paredes',
    solicitado: 2,
    stock: 1,
    estado: { label: 'Pendiente de Atencion', tab: 'pendientes' },
    registro: '04/04/2026 13:09',
    antiguedad: '5 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000162',
    solicitante: 'Kevin Joel Salazar Luna',
    solicitado: 3,
    stock: 2,
    estado: { label: 'En Proceso', tab: 'procesando' },
    registro: '03/04/2026 11:33',
    antiguedad: '6 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'En proceso', ratio: '2/4', progress: 50, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Pendiente', ratio: '1/1', progress: 0, tone: 'blue' },
    ],
  },
  {
    codigo: 'SOL-000163',
    solicitante: 'Milagros Andrea Cueva Torres',
    solicitado: 1,
    stock: 1,
    estado: { label: 'Cerrado', tab: 'cerrados' },
    registro: '03/04/2026 14:47',
    antiguedad: '6 dias',
    areas: [
      { label: 'COMPRAS Y LOGISTICA', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'cyan' },
      { label: 'RR.HH.', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'amber' },
      { label: 'SS.GG.', estado: 'Cerrado', ratio: '1/1', progress: 100, tone: 'blue' },
    ],
  },
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
      item.antiguedad,
      item.areas.map(area => `${area.label} ${area.estado} ${area.ratio}`).join(' '),
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

const formatSolicitudSuffix = (codigo: string) => {
  const digits = codigo.replace(/^SOL-0*/, '')

  return digits || codigo
}

const areaToneClasses = (tone: SolicitudAreaTone) => {
  if (tone === 'cyan') return {
    shell: 'border-cyan-200 bg-cyan-50/90',
    title: 'text-cyan-800',
    badge: 'border-cyan-200 bg-white text-cyan-700',
    bar: 'bg-cyan-100',
    fill: 'bg-cyan-400',
  }

  if (tone === 'amber') return {
    shell: 'border-amber-200 bg-amber-50/90',
    title: 'text-amber-800',
    badge: 'border-amber-200 bg-white text-amber-700',
    bar: 'bg-amber-100',
    fill: 'bg-amber-400',
  }

  return {
    shell: 'border-sky-200 bg-sky-50/90',
    title: 'text-sky-800',
    badge: 'border-sky-200 bg-white text-sky-700',
    bar: 'bg-sky-100',
    fill: 'bg-sky-400',
  }
}

const getRegistroDate = (registro: string) => registro.split(' ')[0] || registro
const getRegistroTime = (registro: string) => registro.split(' ')[1] || ''

const managementModalOpen = ref(false)
const managementDecision = ref<'aprobar' | 'rechazar'>('aprobar')
const managementQuantity = ref(1)
const managementComment = ref('')
const selectedRequest = ref<SolicitudItem | null>(null)

const managementMaxQuantity = computed(() => Math.max(1, selectedRequest.value?.stock ?? 1))

const openManagementModal = (item: SolicitudItem) => {
  selectedRequest.value = item
  managementDecision.value = 'aprobar'
  managementQuantity.value = Math.max(1, Math.min(item.solicitado, item.stock))
  managementComment.value = ''
  managementModalOpen.value = true
}

const closeManagementModal = () => {
  managementModalOpen.value = false
}

const confirmManagement = () => {
  if (!selectedRequest.value) return

  if (!managementComment.value.trim()) {
    toast.add({
      title: 'Comentario requerido',
      description: 'Agrega un comentario para continuar con la gestion.',
      color: 'red',
    })
    return
  }

  toast.add({
    title: 'Gestion preparada',
    description: `${managementDecision.value === 'aprobar' ? 'Aprobacion' : 'Rechazo'} registrada para ${selectedRequest.value.codigo}.`,
  })

  closeManagementModal()
}

watch([search, fromDate, toDate, perPage, activeTab], () => {
  page.value = 1
})
</script>

<template>
  <div class="space-y-5">
    <UCard class="overflow-hidden border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85" :ui="{ body: 'p-0' }">
      <div class="space-y-5 ">
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
            placeholder="Buscar por solicitud, solicitante o area..."
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
          <div class="overflow-x-auto overflow-y-auto max-h-[68vh]">
            <table class="min-w-full border-separate border-spacing-0">
              <thead class="bg-[#2d5fc0] text-white">
                <tr>
                  <th class="rounded-tl-2xl px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitud</th>
                  <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitante</th>
                  <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
                  <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Areas</th>
                  <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Registro</th>
                  <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Antiguedad</th>
                  <th class="rounded-tr-2xl px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                <tr
                  v-for="item in visibleRequests"
                  :key="item.codigo"
                  class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
                >
                  <td class="px-5 py-3 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                    <div class="space-y-1">
                      <p>{{ item.codigo }}</p>
                      <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
                        #{{ formatSolicitudSuffix(item.codigo) }}
                      </p>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                    <div class="space-y-1">
                      <p class="max-w-[220px] font-semibold leading-5">
                        {{ item.solicitante }}
                      </p>
                      <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-500">
                        Solicitante
                      </p>
                    </div>
                  </td>
                  <td class="px-5 py-3">
                    <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', stateTone(item.estado.tab)]">
                      {{ item.estado.label }}
                    </span>
                  </td>
                  <td class="px-5 py-3">
                    <div class="grid gap-2 xl:grid-cols-3">
                      <div
                        v-for="area in item.areas"
                        :key="area.label"
                        :class="[
                          'rounded-xl border p-2.5',
                          areaToneClasses(area.tone).shell,
                        ]"
                      >
                        <div class="space-y-2.5">
                          <div class="flex items-center justify-between gap-3 border-b border-black/5 pb-1.5">
                            <p :class="['text-[10px] font-extrabold uppercase tracking-[0.14em]', areaToneClasses(area.tone).title]">
                              {{ area.label }}
                            </p>
                          </div>

                          <div class="flex items-center justify-between gap-3">
                            <span :class="['inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold', areaToneClasses(area.tone).badge]">
                              {{ area.estado }}
                            </span>
                            <span class="text-[10px] font-semibold text-gray-500 dark:text-gray-300">
                              {{ area.ratio }} {{ area.progress }}%
                            </span>
                          </div>

                          <div :class="['h-1.5 rounded-full', areaToneClasses(area.tone).bar]">
                            <div
                              :class="['h-1.5 rounded-full', areaToneClasses(area.tone).fill]"
                              :style="{ width: `${area.progress}%` }"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    <div class="space-y-1">
                      <p class="font-medium">
                        {{ getRegistroDate(item.registro) }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ getRegistroTime(item.registro) }}
                      </p>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span class="inline-flex rounded-md bg-[#fff2f2] px-3 py-1 text-[11px] font-bold text-[#e53946] ring-1 ring-[#ffb6b6]">
                      {{ item.antiguedad }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <UButton
                      color="primary"
                      variant="soft"
                      icon="i-lucide-sliders-horizontal"
                      class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                      size="xs"
                      aria-label="Gestionar"
                      title="Gestionar"
                      @click.stop="openManagementModal(item)"
                    />
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
<UModal
  v-model:open="managementModalOpen"
  class="w-full max-w-3xl"
  :ui="{
    header: 'relative flex items-stretch p-0 min-h-0',
    wrapper: 'flex-1 min-w-0 w-full',
    title: 'w-full p-0',
    body: 'p-0',
  }"
  :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
>
  <template #title>
    <div class="flex w-full items-center justify-between gap-4 border-b border-gray-200 bg-[#f8fafc] px-6 py-4 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#c9d9ff] dark:bg-[#13203a] dark:text-[#9cb7f5] dark:ring-[#29406f]">
          <UIcon name="i-lucide-sliders-horizontal" class="h-5 w-5" />
        </span>
        <div class="min-w-0 leading-tight">
          <p class="text-sm font-semibold tracking-wide text-gray-950 dark:text-white">Gestionar item</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">Define aprobacion o rechazo del item seleccionado.</p>
        </div>
      </div>
      <span class="hidden rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2d5fc0] ring-1 ring-[#cbdcff] dark:bg-gray-900 dark:text-[#9cb7f5] dark:ring-gray-800 sm:inline-flex">
        {{ selectedRequest?.codigo || 'SIN SELECCION' }}
      </span>
    </div>
  </template>

  <template #body>
    <div class="bg-white px-6 py-6 dark:bg-gray-950">
      <div class="space-y-6">
        <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Solicitud seleccionada</p>
                <p class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                  {{ selectedRequest?.codigo }}
                </p>
              </div>
              <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', stateTone(selectedRequest?.estado.tab ?? 'pendientes')]">
                {{ selectedRequest?.estado.label }}
              </span>
            </div>
          </div>

          <div class="grid gap-0 sm:grid-cols-2">
            <div class="border-b border-gray-200 px-4 py-4 sm:border-b-0 sm:border-r dark:border-gray-800">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Solicitado</p>
              <p class="mt-2 text-2xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
                {{ selectedRequest?.solicitado ?? 0 }}
              </p>
            </div>
            <div class="px-4 py-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Stock</p>
              <p class="mt-2 text-2xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
                {{ selectedRequest?.stock ?? 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Accion</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="rounded-2xl border p-4 text-left transition shadow-sm"
              :class="managementDecision === 'aprobar'
                ? 'border-[#2d5fc0] bg-[#eef4ff] text-[#1f4fa8] ring-1 ring-[#cbdcff] dark:border-[#2d5fc0] dark:bg-[#13203a] dark:text-[#cfe0ff] dark:ring-[#29406f]'
                : 'border-gray-200 bg-white text-gray-900 hover:bg-[#f7f9ff] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900/60'"
              @click="managementDecision = 'aprobar'"
            >
              <div class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#2d5fc0] ring-1 ring-[#cbdcff] dark:bg-gray-900 dark:text-[#9cb7f5] dark:ring-[#29406f]">
                  <UIcon name="i-lucide-badge-check" class="h-4 w-4" />
                </span>
                <div class="space-y-1">
                  <p class="text-sm font-bold uppercase tracking-[0.2em]">Aprobar</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Confirma cantidad disponible para atender.</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              class="rounded-2xl border p-4 text-left transition shadow-sm"
              :class="managementDecision === 'rechazar'
                ? 'border-[#e53946] bg-[#fff1f1] text-[#c62834] ring-1 ring-[#ffd0d3] dark:border-[#e53946] dark:bg-[#351114] dark:text-[#ffb3bb] dark:ring-[#6f1e27]'
                : 'border-gray-200 bg-white text-gray-900 hover:bg-[#f7f9ff] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900/60'"
              @click="managementDecision = 'rechazar'"
            >
              <div class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#e53946] ring-1 ring-[#ffd0d3] dark:bg-gray-900 dark:text-[#ff8792] dark:ring-[#6f1e27]">
                  <UIcon name="i-lucide-ban" class="h-4 w-4" />
                </span>
                <div class="space-y-1">
                  <p class="text-sm font-bold uppercase tracking-[0.2em]">Rechazar</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Indica motivo del rechazo para el solicitante.</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
          <label class="pt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Cantidad a aprobar</label>
          <UInput
            v-model="managementQuantity"
            type="number"
            min="1"
            :max="managementMaxQuantity"
            class="w-full"
          />
          <p class="md:col-start-2 text-sm text-gray-500 dark:text-gray-400">
            Maximo: {{ managementMaxQuantity }}
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
          <label class="pt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Comentario / motivo</label>
          <UTextarea
            v-model="managementComment"
            :placeholder="managementDecision === 'aprobar'
              ? 'Escribe un comentario para aprobar'
              : 'Escribe un comentario para rechazar'"
            :rows="5"
            class="w-full"
          />
          <p class="md:col-start-2 text-sm text-gray-500 dark:text-gray-400">
            Este comentario es obligatorio para aprobar y rechazar.
          </p>
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
          <UButton color="neutral" variant="soft" class="px-5" @click="closeManagementModal">
            Cancelar
          </UButton>
          <UButton
            color="primary"
            class="bg-[#2d5fc0] px-5 font-semibold text-white shadow-[0_10px_24px_rgba(45,95,192,0.18)] hover:bg-[#244ea4]"
            @click="confirmManagement"
          >
            Confirmar
          </UButton>
        </div>
      </div>
    </div>
  </template>
</UModal>
</template>
