<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Solicitar Reabastecimiento',
})

const toast = useToast()

type ReabastecimientoStatus = 'pending' | 'processing' | 'closed'

type ReabastecimientoRequest = {
  id: string
  requester: string
  area: string
  status: ReabastecimientoStatus
  justification: string
  createdAt: string
}

type CatalogItem = {
  id: number
  code: string
  name: string
  stock: number
}

type RequestLine = {
  id: number
  description: string
  quantity: number
}

type TrackingEvent = {
  at: string
  actor: string
  role: string
  title: string
  comment: string
  status: ReabastecimientoStatus
}

const activeTab = shallowRef<ReabastecimientoStatus>('pending')
const createModalOpen = shallowRef(false)
const trackingModalOpen = shallowRef(false)
const selectedTrackingId = shallowRef<string | null>(null)
const requestSearch = shallowRef('')
const requestDate = shallowRef('')
const requestPerPage = shallowRef(20)
const requestPage = shallowRef(1)
const catalogSearch = shallowRef('')
const requestJustification = shallowRef('')

const requests = ref<ReabastecimientoRequest[]>([
  {
    id: 'CECH_REA_0000006',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'justificacion prueba',
    createdAt: '2025-11-24 11:15:23',
  },
  {
    id: 'CECH_REA_0000007',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'prueba',
    createdAt: '2025-11-24 11:16:03',
  },
  {
    id: 'CECH_REA_0000008',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'solicitud de prueba',
    createdAt: '2025-11-24 11:17:51',
  },
  {
    id: 'CECH_REA_0000009',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: '',
    createdAt: '2025-11-24 11:23:22',
  },
  {
    id: 'CECH_REA_0000010',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'justificacion de prueba',
    createdAt: '2025-11-24 11:29:06',
  },
  {
    id: 'CECH_REA_0000013',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'sdads',
    createdAt: '2025-11-24 11:34:25',
  },
  {
    id: 'CECH_REA_0000014',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'prueba',
    createdAt: '2025-11-24 11:36:49',
  },
  {
    id: 'CECH_REA_0000015',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'prueba',
    createdAt: '2025-11-24 11:38:53',
  },
  {
    id: 'CECH_REA_0000016',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'justificacion prueba',
    createdAt: '2025-11-24 11:46:16',
  },
  {
    id: 'CECH_REA_0000018',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'justificacion prueba',
    createdAt: '2025-11-24 11:51:51',
  },
  {
    id: 'CECH_REA_0000019',
    requester: 'Johana Cecilia Camacho Caceda',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Reposicion de EPP para ingreso a planta',
    createdAt: '2025-11-24 12:03:18',
  },
  {
    id: 'CECH_REA_0000020',
    requester: 'Joel Ronald Colque Fuentes',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Solicitud en revision por compras',
    createdAt: '2025-11-24 12:10:42',
  },
  {
    id: 'CECH_REA_0000021',
    requester: 'Karen Aytlen Orozco Guerrero',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Aprobado para entrega parcial',
    createdAt: '2025-11-24 12:18:09',
  },
  {
    id: 'CECH_REA_0000022',
    requester: 'Joana Melissa Ortiz Reyes',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Reposicion de stock por campaña interna',
    createdAt: '2025-11-24 12:24:55',
  },
  {
    id: 'CECH_REA_0000023',
    requester: 'Marjorie Alexandra Osorio la Rosa',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Se valida disponibilidad en almacén',
    createdAt: '2025-11-24 12:31:16',
  },
  {
    id: 'CECH_REA_0000024',
    requester: 'Axel Fabian Panduro Acosta',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Solicitud finalizada sin observaciones',
    createdAt: '2025-11-24 12:39:40',
  },
  {
    id: 'CECH_REA_0000025',
    requester: 'Julian Arturo Romero Sosa',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Pedido urgente por reposicion de stock',
    createdAt: '2025-11-24 12:45:12',
  },
  {
    id: 'CECH_REA_0000026',
    requester: 'Luis Alberto Camacho Caceda',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'En revision por disponibilidad de almacén',
    createdAt: '2025-11-24 12:53:26',
  },
  {
    id: 'CECH_REA_0000027',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Aprobado y derivado a entrega',
    createdAt: '2025-11-24 13:01:44',
  },
  {
    id: 'CECH_REA_0000028',
    requester: 'Marjorie Alexandra Osorio la Rosa',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Solicitud adicional por cambio de turno',
    createdAt: '2025-11-24 13:08:09',
  },
  {
    id: 'CECH_REA_0000029',
    requester: 'Rosa Elena Huamani Paredes',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Reposicion de implementos por cierre mensual',
    createdAt: '2025-11-24 13:12:31',
  },
  {
    id: 'CECH_REA_0000030',
    requester: 'Daniel Alberto Velez Rojas',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Aprobado para entrega de almacén',
    createdAt: '2025-11-24 13:19:05',
  },
  {
    id: 'CECH_REA_0000031',
    requester: 'Fiorella Milagros Torres Prado',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Pedido de EPP para nuevo ingreso',
    createdAt: '2025-11-24 13:24:48',
  },
  {
    id: 'CECH_REA_0000032',
    requester: 'Kevin Joel Salazar Luna',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Pedido en revisión por compras',
    createdAt: '2025-11-24 13:29:12',
  },
  {
    id: 'CECH_REA_0000033',
    requester: 'Milagros Andrea Cueva Torres',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Solicitud cerrada y entregada',
    createdAt: '2025-11-24 13:35:40',
  },
  {
    id: 'CECH_REA_0000034',
    requester: 'Renzo Martin Diaz Salas',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Reposicion por stock minimo',
    createdAt: '2025-11-24 13:41:07',
  },
  {
    id: 'CECH_REA_0000035',
    requester: 'Jazmin Alejandra Romero Leon',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Validación de inventario en curso',
    createdAt: '2025-11-24 13:46:22',
  },
  {
    id: 'CECH_REA_0000036',
    requester: 'Luis Fernando Montes Velarde',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Aprobado y enviado a despacho',
    createdAt: '2025-11-24 13:52:58',
  },
  {
    id: 'CECH_REA_0000037',
    requester: 'Camila Sofia Pinedo Vargas',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Pedido programado para mañana',
    createdAt: '2025-11-24 13:58:14',
  },
  {
    id: 'CECH_REA_0000038',
    requester: 'Oscar Jesus Medina Castillo',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Pendiente de autorización final',
    createdAt: '2025-11-24 14:03:41',
  },
])

const modalCatalogItems = ref<CatalogItem[]>([
  { id: 1, code: 'E01', name: 'Guante de Seguridad', stock: 4 },
  { id: 2, code: 'E02', name: 'Tapon de seguridad', stock: 3 },
  { id: 3, code: 'E03', name: 'Lente de Seguridad', stock: 1 },
  { id: 4, code: 'E04', name: 'Respirador de Media Cara 3M', stock: 3 },
  { id: 5, code: 'E05', name: 'Filtro para Particulas 2091', stock: 0 },
  { id: 6, code: 'E06', name: 'Botas de seguridad TALLA 39', stock: 1 },
  { id: 7, code: 'E07', name: 'BLOQUEADOR SOLAR', stock: 9 },
  { id: 8, code: 'E08', name: 'Mascarilla KN95', stock: 10 },
  { id: 9, code: 'E09', name: 'Casco de Seguridad', stock: 1 },
  { id: 10, code: 'E10', name: 'Chaleco reflectivo TALLA XL', stock: 1 },
  { id: 11, code: 'E11', name: 'Cubrepies Quirurgicos', stock: 11 },
  { id: 12, code: 'E12', name: 'Gorro quirurgico', stock: 50 },
  { id: 13, code: 'E13', name: 'Mochila sobre ruedas Stanley', stock: 0 },
  { id: 14, code: 'E14', name: 'Lente de seguridad polarizado', stock: 7 },
  { id: 15, code: 'E15', name: 'Cinta reflectiva industrial', stock: 2 },
  { id: 16, code: 'E16', name: 'Protector auditivo tipo copa', stock: 14 },
  { id: 17, code: 'E17', name: 'Arnes de seguridad de cuerpo completo', stock: 6 },
  { id: 18, code: 'E18', name: 'Botiquin de primeros auxilios', stock: 9 },
])

const requestLines = ref<RequestLine[]>([
  { id: 125, description: 'Guante de Seguridad', quantity: 1 },
  { id: 126, description: 'Tapon de seguridad', quantity: 1 },
  { id: 129, description: 'Filtro para Particulas 2091', quantity: 1 },
])

const perPageOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
]

const statusLabel: Record<ReabastecimientoStatus, string> = {
  pending: 'Pendiente Aprobacion Compras',
  processing: 'Procesando',
  closed: 'Aprobado',
}

const tabCounts = computed(() => ({
  pending: requests.value.filter(item => item.status === 'pending').length,
  processing: requests.value.filter(item => item.status === 'processing').length,
  closed: requests.value.filter(item => item.status === 'closed').length,
}))

const tabItems = computed(() => [
  { label: 'Pendientes', value: 'pending', badge: tabCounts.value.pending },
  { label: 'Procesando', value: 'processing', badge: tabCounts.value.processing },
  { label: 'Cerrados', value: 'closed', badge: tabCounts.value.closed },
])

const activeRequests = computed(() => {
  return requests.value.filter(item => item.status === activeTab.value)
})

const filteredRequests = computed(() => {
  const query = requestSearch.value.trim().toLowerCase()
  const date = requestDate.value.trim()

  return activeRequests.value.filter((item) => {
    const matchesQuery = !query
      || [item.id, item.requester, item.area, item.justification, item.createdAt]
        .join(' ')
        .toLowerCase()
        .includes(query)

    const matchesDate = !date || item.createdAt.startsWith(date)

    return matchesQuery && matchesDate
  })
})

const visibleRequests = computed(() => {
  const start = (requestPage.value - 1) * requestPerPage.value
  return filteredRequests.value.slice(start, start + requestPerPage.value)
})

const requestPageCount = computed(() => Math.max(1, Math.ceil(filteredRequests.value.length / requestPerPage.value)))

const filteredCatalog = computed(() => {
  const query = catalogSearch.value.trim().toLowerCase()

  if (!query) {
    return modalCatalogItems.value
  }

  return modalCatalogItems.value.filter((item) => {
    return [item.code, item.name, String(item.stock)]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
})

const visibleCatalog = computed(() => filteredCatalog.value)

const selectedTrackingRequest = computed(() => {
  if (!selectedTrackingId.value) return null
  return requests.value.find(item => item.id === selectedTrackingId.value) ?? null
})

const shiftTimestamp = (timestamp: string, minutes: number) => {
  const date = new Date(timestamp.replace(' ', 'T'))

  if (Number.isNaN(date.getTime())) {
    return timestamp
  }

  date.setMinutes(date.getMinutes() + minutes)

  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const trackingTimeline = computed<TrackingEvent[]>(() => {
  const request = selectedTrackingRequest.value

  if (!request) {
    return []
  }

  const timeline: TrackingEvent[] = [
    {
      at: request.createdAt,
      actor: request.requester,
      role: 'Solicitante',
      title: 'Solicitud registrada',
      comment: request.justification || 'Solicitud enviada al flujo de reabastecimiento.',
      status: 'pending',
    },
    {
      at: shiftTimestamp(request.createdAt, 18),
      actor: 'Laura Medina',
      role: 'Jefatura RRHH',
      title: 'Revision inicial',
      comment: 'Se valida el pedido, el area y la urgencia declarada.',
      status: 'pending',
    },
  ]

  if (request.status === 'pending') {
    timeline.push({
      at: shiftTimestamp(request.createdAt, 52),
      actor: 'Carlos Paredes',
      role: 'Compras',
      title: 'Pendiente de aprobacion',
      comment: 'Queda a la espera de visto bueno para pasar a compras.',
      status: 'pending',
    })

    return timeline
  }

  timeline.push({
    at: shiftTimestamp(request.createdAt, 52),
    actor: 'Carlos Paredes',
    role: 'Compras',
    title: 'Aprobacion de compras',
    comment: 'La solicitud fue derivada para compra o despacho interno.',
    status: 'processing',
  })

  if (request.status === 'processing') {
    timeline.push({
      at: shiftTimestamp(request.createdAt, 96),
      actor: 'Maritza Ramos',
      role: 'Almacen',
      title: 'En proceso de atencion',
      comment: 'Se esta preparando el pedido y verificando stock.',
      status: 'processing',
    })

    return timeline
  }

  timeline.push({
    at: shiftTimestamp(request.createdAt, 96),
    actor: 'Maritza Ramos',
    role: 'Almacen',
    title: 'Pedido preparado',
    comment: 'Se confirmo la salida de productos y se programa la entrega.',
    status: 'processing',
  })
  timeline.push({
    at: shiftTimestamp(request.createdAt, 132),
    actor: 'Maritza Ramos',
    role: 'Almacen',
    title: 'Solicitud cerrada',
    comment: 'Pedido entregado y seguimiento finalizado sin observaciones.',
    status: 'closed',
  })

  return timeline
})

const trackingDiscussion = computed(() => trackingTimeline.value.map(event => ({
  at: event.at,
  actor: event.actor,
  role: event.role,
  message: event.comment,
})))

const stateTone = (status: ReabastecimientoStatus) => {
  if (status === 'closed') {
    return 'bg-[#5f6b7a] text-white'
  }

  if (status === 'processing') {
    return 'bg-[#f2ae42] text-white'
  }

  return 'bg-[#67c51f] text-white'
}

const stockTone = (stock: number) => {
  if (stock <= 3) return 'bg-[#e53946] text-white ring-1 ring-[#f6b7bc]'
  if (stock <= 10) return 'bg-[#f2cb21] text-[#6a4b00] ring-1 ring-[#f7e08a]'
  return 'bg-[#2d5fc0] text-white ring-1 ring-[#b8c9ef]'
}

const addToRequest = (item: CatalogItem) => {
  const exists = requestLines.value.some(row => row.description === item.name)

  if (exists) {
    toast.add({
      title: 'Ya agregado',
      description: 'Ese producto ya esta en la solicitud.',
      color: 'warning',
    })
    return
  }

  requestLines.value.push({
    id: Math.max(...requestLines.value.map(row => row.id), 0) + 1,
    description: item.name,
    quantity: 1,
  })
}

const removeRequestLine = (id: number) => {
  requestLines.value = requestLines.value.filter(item => item.id !== id)
}


const processRequest = () => {
  toast.add({
    title: 'Solicitud preparada',
    description: 'La maqueta de reabastecimiento quedo lista.',
  })
}

const onAction = (id: string) => {
  toast.add({
    title: 'Accion disponible',
    description: `Se preparo la accion para ${id}.`,
  })
}

const onTracking = (id: string) => {
  selectedTrackingId.value = id
  trackingModalOpen.value = true
}

watch(trackingModalOpen, (isOpen) => {
  if (!isOpen) {
    selectedTrackingId.value = null
  }
})

watch([requestSearch, requestDate, requestPerPage, activeTab], () => {
  requestPage.value = 1
})
</script>

<template>
  <div class="">
    <UCard class="overflow-hidden border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85" :ui="{ body: 'p-0' }">
      <div class="space-y-5 p-5">
        <div class="">
          
          <h1 class="text-xl font-bold text-gray-950 dark:text-white">
            Solicitar Reabastecimiento
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Seguimiento de solicitudes, aprobaciones y trazabilidad del pedido.
          </p>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-end">
          <AppTabs
            v-model="activeTab"
            ariaLabel="Solicitudes de reabastecimiento"
            size="sm"
            :items="tabItems"
            list-class="w-fit"
          />

          <UButton
            color="primary"
            icon="i-lucide-plus"
            class="w-fit bg-[#2d5fc0] px-5 font-semibold shadow-[0_10px_24px_rgba(45,95,192,0.18)] hover:bg-[#244ea4] md:ml-auto"
            @click="createModalOpen = true"
          >
            Agregar
          </UButton>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <UInput
            v-model="requestSearch"
            icon="i-lucide-search"
            placeholder="Buscar por id, solicitante, area o justificacion..."
            class="w-full md:flex-1"
          />

          <UInput
            v-model="requestDate"
            type="date"
            icon="i-lucide-calendar"
            class="w-full md:w-56"
          />
        </div>

        <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <table class="min-w-full border-separate border-spacing-0">
            <thead class="bg-[#2d5fc0] text-white">
              <tr>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Id</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitante</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Area</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Justificacion</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha de Creacion</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr
                v-for="item in visibleRequests"
                :key="item.id"
                class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
              >
                <td class="px-5 py-3 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                  {{ item.id }}
                </td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {{ item.requester }}
                </td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {{ item.area }}
                </td>
                <td class="px-5 py-3">
                  <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', stateTone(item.status)]">
                    {{ statusLabel[item.status] }}
                  </span>
                </td>
                <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {{ item.justification || '-' }}
                </td>
                <td class="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ item.createdAt }}
                </td>
                <td class="px-5 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <UButton
                      color="primary"
                      variant="soft"
                      icon="i-lucide-map-pinned"
                      class="rounded-full bg-[#eef4ff] text-[#2d5fc0] hover:bg-[#dfe9ff]"
                      size="xs"
                      aria-label="Tracking"
                      title="Tracking"
                      @click="onTracking(item.id)"
                    />
                    <UButton
                      color="primary"
                      variant="soft"
                      icon="i-lucide-plus"
                      class="rounded-full"
                      size="xs"
                      aria-label="Acciones"
                      title="Acciones"
                      @click="onAction(item.id)"
                    />
                  </div>
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
            <span class="font-semibold text-gray-950 dark:text-white">
              {{ filteredRequests.length ? ((requestPage - 1) * requestPerPage) + 1 : 0 }}
            </span>
            <span>a</span>
            <span class="font-semibold text-gray-950 dark:text-white">
              {{ Math.min(requestPage * requestPerPage, filteredRequests.length) }}
            </span>
            <span>de</span>
            <span class="font-semibold text-gray-950 dark:text-white">{{ filteredRequests.length }}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600 dark:text-gray-400">Por pagina</span>
            <USelectMenu
              v-model="requestPerPage"
              :items="perPageOptions"
              value-key="value"
              label-key="label"
              class="w-24"
            />
            <UPagination
              v-model:page="requestPage"
              :page-count="requestPerPage"
              :total="filteredRequests.length"
              :sibling-count="1"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Pagina {{ requestPage }} de {{ requestPageCount }}
            </span>
          </div>
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="createModalOpen"
      class="w-[calc(100vw-1rem)] max-w-[1560px]"
      :ui="{
        content: 'h-[94vh] overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        wrapper: 'w-full items-center justify-center',
        body: 'h-[calc(94vh-72px)] overflow-hidden p-0',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div>
           
            <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
              Solicitud de Reabastecimiento
            </h2>
          </div>

         
        </div>
      </template>

      <template #body>
        <div class="flex h-full flex-col bg-white p-4 dark:bg-gray-950">
          <div class="grid h-[calc(94vh-144px)] min-h-0 flex-1 gap-4 md:grid-cols-2">
            <UCard class="min-w-0 h-full overflow-hidden border-gray-200/70 bg-white/90 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/90" :ui="{ body: 'flex h-full min-h-0 flex-col p-0' }">
              <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Productos en Almacen
                    </p>
                    <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                      Inventario disponible
                    </h3>
                  </div>

                  <UIcon name="i-lucide-warehouse" class="h-5 w-5 text-[#2d5fc0]" />
                </div>

                <div class="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <UInput
                    v-model="catalogSearch"
                    icon="i-lucide-search"
                    placeholder="Buscar por codigo o producto..."
                    class="w-full lg:max-w-sm"
                  />
                </div>
              </div>

              <div class="mt-3 h-[calc(94vh-310px)] min-h-[300px] overflow-y-auto overflow-x-hidden pr-1">
                <table class="min-w-full border-separate border-spacing-0">
                  <thead class="bg-[#2d5fc0] text-white">
                    <tr>
                      <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Producto</th>
                      <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Producto</th>
                      <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Stock</th>
                      <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Accion</th>
                    </tr>
                  </thead>

                  <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                    <tr
                      v-for="item in visibleCatalog"
                      :key="item.id"
                      class="transition-colors odd:bg-[#fbfbff] even:bg-white hover:bg-[#eef4ff] dark:odd:bg-gray-900/50 dark:even:bg-gray-950 dark:hover:bg-gray-900/70"
                    >
                      <td class="px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {{ item.code }}
                      </td>
                      <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                        {{ item.name }}
                      </td>
                      <td class="px-4 py-2.5 text-center">
                        <span :class="['inline-flex min-w-14 justify-center rounded-md px-3 py-1 text-xs font-bold', stockTone(item.stock)]">
                          {{ item.stock }}
                        </span>
                      </td>
                      <td class="px-4 py-2.5 text-center">
                        <UButton
                          color="primary"
                          variant="soft"
                          size="xs"
                          icon="i-lucide-plus"
                          class="rounded-full bg-[#2d5fc0]/10 text-[#2d5fc0] hover:bg-[#2d5fc0]/15"
                          @click="addToRequest(item)"
                        >
                          Agregar
                        </UButton>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </UCard>

            <UCard class="min-w-0 h-full overflow-hidden border-gray-200/70 bg-white/90 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/90" :ui="{ body: 'flex h-full min-h-0 flex-col p-0' }">
              <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Solicitud de Productos
                </p>
                <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                  Detalle del pedido
                </h3>
              </div>

              <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Justificacion</label>
                  <UTextarea
                    v-model="requestJustification"
                    :rows="2"
                    placeholder="Explica por que se requiere el reabastecimiento..."
                    class="w-full"
                  />
                </div>

                <div class="h-[170px] overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <table class="min-w-full border-separate border-spacing-0">
                    <thead class="bg-[#f4f1ff] text-[#49558f] dark:bg-[#101b31] dark:text-[#d1ddfb]">
                      <tr>
                        <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">ID</th>
                        <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Descripcion</th>
                        <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Cant.</th>
                        <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Quitar</th>
                      </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                      <tr v-for="item in requestLines" :key="item.id" class="transition-colors hover:bg-[#f8f7ff] dark:hover:bg-gray-900/60">
                        <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">{{ item.id }}</td>
                        <td class="px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">{{ item.description }}</td>
                        <td class="px-4 py-2.5 text-center">
                          <UInput v-model="item.quantity" type="number" min="1" class="mx-auto w-20" />
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <UButton
                            color="error"
                            size="xs"
                            icon="i-lucide-x"
                            class="rounded-md"
                            @click="removeRequestLine(item.id)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <UButton
                  color="primary"
                  class="w-full justify-center bg-[#2d5fc0] py-3 font-semibold text-white shadow-[0_12px_26px_rgba(45,95,192,0.18)] hover:bg-[#244ea4]"
                  @click="processRequest"
                >
                  Procesar Pedido
                </UButton>
              </div>
            </UCard>
          </div>

          <div class="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
            <UButton color="neutral" variant="soft" @click="createModalOpen = false">
              Cerrar
            </UButton>
            <UButton
              color="primary"
              class="bg-[#6f5ce8] font-semibold text-white shadow-[0_10px_24px_rgba(111,92,232,0.16)] hover:bg-[#5c48df]"
              @click="processRequest"
            >
              Guardar maqueta
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="trackingModalOpen"
      class="max-w-5xl"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
              Tracking de solicitud
            </p>
            <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
              {{ selectedTrackingRequest?.id || 'Sin solicitud seleccionada' }}
            </h2>
          </div>

          <UBadge
            v-if="selectedTrackingRequest"
            :class="['rounded-full px-3 py-1', stateTone(selectedTrackingRequest.status)]"
          >
            {{ statusLabel[selectedTrackingRequest.status] }}
          </UBadge>
        </div>
      </template>

      <template #body>
        <div v-if="selectedTrackingRequest" class="space-y-5 bg-white p-5 dark:bg-gray-950">
          <div class="grid gap-3 md:grid-cols-4">
            <div class="rounded-2xl border border-gray-200 bg-[#eef4ff] p-4 dark:border-gray-800 dark:bg-[#13203a]">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7aa3] dark:text-[#9cb7f5]">Solicitante</p>
              <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">{{ selectedTrackingRequest.requester }}</p>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-900">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7aa3] dark:text-[#9cb7f5]">Area</p>
              <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">{{ selectedTrackingRequest.area }}</p>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-900">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7aa3] dark:text-[#9cb7f5]">Creacion</p>
              <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">{{ selectedTrackingRequest.createdAt }}</p>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-900">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7aa3] dark:text-[#9cb7f5]">Estado actual</p>
              <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">{{ statusLabel[selectedTrackingRequest.status] }}</p>
            </div>
          </div>

          <div class="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Historial de cambios
                </p>
                <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                  Estado, aprobadores y seguimiento
                </h3>
              </div>

              <div class="max-h-[360px] space-y-4 overflow-auto p-5">
                <div
                  v-for="(event, index) in trackingTimeline"
                  :key="`${event.at}-${index}`"
                  class="relative pl-6"
                >
                  <span class="absolute left-[2px] top-2 h-full w-px bg-gray-200 dark:bg-gray-800"></span>
                  <span :class="['absolute left-0 top-2 h-3 w-3 rounded-full ring-4 ring-white dark:ring-gray-950', event.status === 'closed' ? 'bg-[#5f6b7a]' : event.status === 'processing' ? 'bg-[#f2ae42]' : 'bg-[#67c51f]']"></span>

                  <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-900/60">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p class="text-sm font-semibold text-gray-950 dark:text-white">{{ event.title }}</p>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ event.actor }} - {{ event.role }}</p>
                      </div>
                      <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ event.at }}</span>
                    </div>
                    <p class="mt-3 text-sm text-gray-700 dark:text-gray-300">
                      {{ event.comment }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Discusion
                </p>
                <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                  Comentarios de aprobacion
                </h3>
              </div>

              <div class="max-h-[360px] space-y-3 overflow-auto p-5">
                <div
                  v-for="(comment, index) in trackingDiscussion"
                  :key="`${comment.at}-${index}`"
                  class="rounded-2xl border border-gray-200 bg-[#f9fbff] p-4 dark:border-gray-800 dark:bg-gray-900/60"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div>
                      <p class="text-sm font-semibold text-gray-950 dark:text-white">{{ comment.actor }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ comment.role }}</p>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ comment.at }}</span>
                  </div>
                  <p class="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    {{ comment.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
