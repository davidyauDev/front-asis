<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

useHead({
  title: 'Mesa de ayuda - Support Ticket',
})

type TicketTab = 'all' | 'solucionado' | 'en_proceso' | 'pausado' | 'anulado'
type TicketStatus = Exclude<TicketTab, 'all'>
type PaginationToken = number | 'ellipsis'

type TicketRecord = {
  id: string
  code: string
  technician: string
  equipment: string
  agency: string
  assignedTo: string
  createdBy: string
  createdAt: string
  status: TicketStatus
}

type StatusConfig = {
  label: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
}

const statusConfig: Record<TicketStatus, StatusConfig> = {
  solucionado: {
    label: 'Cerrado',
    color: 'error',
  },
  en_proceso: {
    label: 'En proceso',
    color: 'primary',
  },
  pausado: {
    label: 'Pausado',
    color: 'warning',
  },
  anulado: {
    label: 'Anulado',
    color: 'neutral',
  },
}

const tabItems = [
  { label: 'Todos', value: 'all' },
  { label: 'Solucionados', value: 'solucionado' },
  { label: 'En Proceso', value: 'en_proceso' },
  { label: 'Pausados', value: 'pausado' },
  { label: 'Anulados', value: 'anulado' },
] satisfies Array<{ label: string; value: TicketTab }>

const perPageOptions = [
  { label: '8', value: 8 },
  { label: '12', value: 12 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
]

const ticketTab = shallowRef<TicketTab>('all')
const search = shallowRef('')
const selectedPerPage = shallowRef(8)
const currentPage = shallowRef(1)

const technicianNames = [
  'Jose Antonio Muriel Mamani',
  'Abdon Ramiro Heros Sanchez',
  'Alex Raul Valle Astucuri',
  'Abelardo Quispe Perez',
  'Arnulfo Wilfredo Perez Tolentino',
  'Nestor Erasmo Ramos Huillca',
  'Jhonatan Lopez Sanchez',
  'Elvin Montalvan Perez',
  'Felix Manuel Galagarza Gutierrez',
  'Juan Carlos Angel Asencio Mendez',
  'Sergio Gerardo Manturano Cornejo',
  'Carlos Joal Silva Salazar',
]

const agencyNames = [
  'VEND_S.A.C.-AREQUIPA',
  'BCP-SANTA ANITA',
  'BCP-MERCADO CENTRAL',
  'COOPAC LOS ANDES-ABANCAY',
  'BCP-HUANUCO',
  'BCP-GAMARRA',
  'COOPERATIVA DE AHORRO Y CREDITO SAN MARTIN DE PORRES LTDA.-Iquitos',
  'COOPAC SAN MARTIN DE PORRES LTDA-Bellavista',
  'BCP-MIRAFLORES',
  'BCP-SURCO',
  'BCP-SAN ISIDRO',
]

const equipmentModels = [
  'DTC(123041597)',
  'MG2000(V2406-00...)',
  'MG2000(V2211-00...)',
  'NEWT3(N23F44-B8...)',
  'CUMM_MM2(0007-2...)',
  'K5A(K19J05-A034...)',
  'NEWT3(N24F34-BB...)',
  'NEWT3(N23L80-BA...)',
  'KDL-100',
  'CIMA 7016',
]

const assignedUsers = [
  'Emilio Arturo',
  'Jorge Luis',
  'Miguel Gonzalo',
  'Carlos Alberto',
  'Ana Paula',
  'Diana Rocio',
]

const createdUsers = [
  'Emilio Arturo',
  'Jorge Luis',
  'Miguel Gonzalo',
]

const statusCycle: TicketStatus[] = [
  'solucionado',
  'solucionado',
  'solucionado',
  'solucionado',
  'solucionado',
  'en_proceso',
  'solucionado',
  'pausado',
  'solucionado',
  'anulado',
]

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function formatDate(index: number) {
  const day = String(31 - (index % 31)).padStart(2, '0')
  const hour = String(8 + (index % 10)).padStart(2, '0')
  const minute = String((index * 11) % 60).padStart(2, '0')

  return `${day}/03/2026 ${hour}:${minute}`
}

function formatTicketId(index: number) {
  return `TCK-${String(1171 + index).padStart(11, '0')}`
}

function formatTicketCode(index: number) {
  return `OSO${String(97845 + (index * 19)).slice(-6)}`
}

const tickets = Array.from({ length: 1143 }, (_, index): TicketRecord => {
  const status = statusCycle[index % statusCycle.length]!
  const technician = technicianNames[index % technicianNames.length]!
  const equipment = equipmentModels[index % equipmentModels.length]!
  const agency = agencyNames[index % agencyNames.length]!
  const assignedTo = assignedUsers[index % assignedUsers.length]!
  const createdBy = createdUsers[index % createdUsers.length]!

  return {
    id: formatTicketId(index),
    code: formatTicketCode(index),
    technician,
    equipment,
    agency,
    assignedTo,
    createdBy,
    createdAt: formatDate(index),
    status,
  }
})

const filteredTickets = computed(() => {
  const query = normalizeText(search.value.trim())

  return tickets.filter((ticket) => {
    if (ticketTab.value !== 'all' && ticket.status !== ticketTab.value) {
      return false
    }

    if (!query) {
      return true
    }

    const searchable = [
      ticket.id,
      ticket.code,
      ticket.technician,
      ticket.equipment,
      ticket.agency,
      ticket.assignedTo,
      ticket.createdBy,
      statusConfig[ticket.status].label,
    ]

    return searchable.some(item => normalizeText(item).includes(query))
  })
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredTickets.value.length / selectedPerPage.value)),
)

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * selectedPerPage.value

  return filteredTickets.value.slice(start, start + selectedPerPage.value)
})

const showingFrom = computed(() => {
  if (!filteredTickets.value.length) {
    return 0
  }

  return (currentPage.value - 1) * selectedPerPage.value + 1
})

const showingTo = computed(() => {
  return Math.min(currentPage.value * selectedPerPage.value, filteredTickets.value.length)
})

const paginationItems = computed<PaginationToken[]>(() => {
  const total = pageCount.value
  const current = currentPage.value

  if (total <= 11) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 6) {
    return [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      'ellipsis',
      total - 1,
      total,
    ]
  }

  if (current >= total - 5) {
    return [
      1,
      2,
      'ellipsis',
      total - 9,
      total - 8,
      total - 7,
      total - 6,
      total - 5,
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ]
  }

  return [
    1,
    2,
    'ellipsis',
    current - 2,
    current - 1,
    current,
    current + 1,
    current + 2,
    'ellipsis',
    total - 1,
    total,
  ]
})

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), pageCount.value)
}

watch([ticketTab, search, selectedPerPage], () => {
  currentPage.value = 1
})

watch(pageCount, (count) => {
  if (currentPage.value > count) {
    currentPage.value = count
  }
}, { immediate: true })
</script>

<template>
  <UDashboardPanel id="support-ticket">
    <template #header>
      <AppDashboardHeader
        title="Gestion de Registros de Llamadas de Ticket"
        mobile-title="Support Ticket"
        subtitle="Seguimiento y control ficticio de tickets por llamada."
        subtitle-icon="i-lucide-ticket"
        icon="i-lucide-ticket"
      >
        
      </AppDashboardHeader>
    </template>

    <template #body>
      <div class="space-y-6 p-4 sm:p-6 lg:p-8">
        <section class="overflow-hidden rounded-[1.8rem] border border-gray-200/80 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.28)] dark:border-gray-800 dark:bg-gray-950">
          <div class="border-b border-gray-200/80 px-5 py-5 dark:border-gray-800">
            <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span class="font-medium text-gray-600 dark:text-gray-400">Mostrar</span>
                <USelectMenu
                  v-model="selectedPerPage"
                  :items="perPageOptions"
                  :search-input="false"
                  :ignoreFilter="true"
                  value-key="value"
                  class="w-20"
                  size="sm"
                />
                <span class="font-medium text-gray-600 dark:text-gray-400">registros</span>
              </div>

              <div class="flex flex-1 flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
                <AppTabs
                  v-model="ticketTab"
                  ariaLabel="Filtros de tickets"
                  :items="tabItems"
                  class="w-fit shrink-0"
                  list-class="w-fit"
                />

                <UInput
                  v-model="search"
                  icon="i-lucide-search"
                  placeholder="Search..."
                  class="w-full xl:w-72"
                />
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-[1360px] w-full border-separate border-spacing-0">
              <thead>
                <tr class="bg-gray-50/90 dark:bg-gray-900/70">
                  <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    ID
                  </th>
                  <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Codigo
                  </th>
                  <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Tecnico
                  </th>
                  <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Equipo
                  </th>
                  <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Agencia
                  </th>
                  <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Asignado a
                  </th>
                  <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Creado por
                  </th>
                  <th class="border-b border-gray-200/80 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Estado
                  </th>
                  <th class="border-b border-gray-200/80 px-5 py-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="ticket in paginatedTickets"
                  :key="ticket.id"
                  class="transition-colors odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/50 dark:odd:bg-gray-950 dark:even:bg-gray-900/40 dark:hover:bg-blue-950/20"
                >
                  <td class="border-b border-gray-100 px-5 py-4 text-sm font-medium text-[#2d5fc0] dark:border-gray-800">
                    {{ ticket.id }}
                  </td>
                  <td class="border-b border-gray-100 px-5 py-4 text-sm font-medium text-[#2d5fc0] dark:border-gray-800">
                    {{ ticket.code }}
                  </td>
                  <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                    <div class="max-w-[220px] truncate font-medium">
                      {{ ticket.technician }}
                    </div>
                  </td>
                  <td class="border-b border-gray-100 px-5 py-4 text-sm text-[#2d5fc0] dark:border-gray-800">
                    <div class="max-w-[190px] truncate font-medium">
                      {{ ticket.equipment }}
                    </div>
                  </td>
                  <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                    <div class="max-w-[270px] truncate font-medium">
                      {{ ticket.agency }}
                    </div>
                  </td>
                  <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                    <div class="max-w-[150px] truncate font-medium">
                      {{ ticket.assignedTo }}
                    </div>
                  </td>
                  <td class="border-b border-gray-100 px-5 py-4 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200">
                    <div class="space-y-0.5">
                      <p class="font-medium">
                        {{ ticket.createdBy }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ ticket.createdAt }}
                      </p>
                    </div>
                  </td>
                  <td class="border-b border-gray-100 px-5 py-4 text-sm dark:border-gray-800">
                    <UBadge
                      :color="statusConfig[ticket.status].color"
                      variant="soft"
                      class="rounded-full px-3 py-1 font-semibold"
                    >
                      {{ statusConfig[ticket.status].label }}
                    </UBadge>
                  </td>
                  <td class="border-b border-gray-100 px-5 py-4 text-center dark:border-gray-800">
                    <UButton
                      color="error"
                      variant="ghost"
                      icon="i-lucide-trash-2"
                      class="rounded-full"
                      aria-label="Eliminar ticket"
                    />
                  </td>
                </tr>

                <tr v-if="!paginatedTickets.length">
                  <td colspan="9" class="px-5 py-16 text-center">
                    <div class="mx-auto max-w-sm space-y-3">
                      <UIcon name="i-lucide-inbox" class="mx-auto size-10 text-gray-300 dark:text-gray-600" />
                      <p class="text-base font-semibold text-gray-800 dark:text-gray-200">
                        No hay tickets que coincidan con los filtros actuales.
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        Prueba ajustando el estado o buscando por codigo, tecnico, agencia o equipo.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex flex-col gap-4 border-t border-gray-200/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredTickets.length }} registros
            </p>

            <div v-if="pageCount > 1" class="flex flex-wrap items-center gap-1.5">
              <UButton
                color="neutral"
                variant="outline"
                label="Previous"
                icon="i-lucide-chevron-left"
                :disabled="currentPage === 1"
                class="h-10 rounded-lg px-4"
                @click="goToPage(currentPage - 1)"
              />

              <template v-for="item in paginationItems" :key="`${item}`">
                <span
                  v-if="item === 'ellipsis'"
                  class="flex h-10 min-w-10 items-center justify-center px-2 text-sm font-semibold text-gray-400 dark:text-gray-500"
                >
                  ...
                </span>

                <UButton
                  v-else
                  :label="String(item)"
                  :color="item === currentPage ? 'primary' : 'neutral'"
                  :variant="item === currentPage ? 'solid' : 'outline'"
                  class="h-10 min-w-10 rounded-lg px-3"
                  @click="goToPage(item)"
                />
              </template>

              <UButton
                color="neutral"
                variant="outline"
                label="Next"
                :trailing="true"
                icon="i-lucide-chevron-right"
                :disabled="currentPage === pageCount"
                class="h-10 rounded-lg px-4"
                @click="goToPage(currentPage + 1)"
              />
            </div>
          </div>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
