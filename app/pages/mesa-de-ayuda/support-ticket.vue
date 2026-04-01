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

const statusBadgeClass: Record<TicketStatus, string> = {
  solucionado: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
  en_proceso: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
  pausado: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  anulado: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300',
}

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
        title="Tickets de soporte"
        mobile-title="Support Ticket"
        subtitle="Seguimiento y control de tickets por llamada."
        subtitle-icon="i-lucide-ticket"
        icon="i-lucide-ticket"
      />
    </template>

    <template #body>
      <div class="space-y-1  lg:p-1">
        <section class="flex justify-center">
          <AppTabs
            v-model="ticketTab"
            ariaLabel="Filtros de tickets"
            :items="tabItems"
            class="w-fit shrink-0"
            list-class="w-fit"
          />
        </section>

        <section class="overflow-hidden rounded-[1.9rem] border border-gray-200/80 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.24)] dark:border-gray-800 dark:bg-gray-950">
          <div class="border-b border-gray-200/80 px-5 py-5 dark:border-gray-800">
            <div class="grid gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-center">
              <div class="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
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
                <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1">
                  {{ filteredTickets.length }} resultados
                </UBadge>
                <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1">
                  Pagina {{ currentPage }} de {{ pageCount }}
                </UBadge>
              </div>

              <div class="flex flex-wrap justify-center gap-3 xl:justify-end">
                <UButton
                  color="success"
                  variant="solid"
                  icon="i-lucide-file-down"
                  class="h-11 rounded-full border border-emerald-400/20 px-5 font-semibold shadow-[0_10px_22px_-16px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(16,185,129,0.55)]"
                >
                  Exportar Excel
                </UButton>

                <UButton
                  color="primary"
                  variant="solid"
                  icon="i-lucide-plus"
                  :trailing="true"
                  class="h-11 rounded-full bg-gradient-to-r from-[#5662ff] to-[#4f6dff] px-5 font-semibold shadow-[0_10px_22px_-16px_rgba(79,109,255,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(79,109,255,0.55)]"
                >
                  Nuevo ticket por llamada
                </UButton>
              </div>

              <div class="flex justify-end">
                <div class="relative w-full xl:w-80">
                  <UIcon
                    name="i-lucide-search"
                    class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                  />
                  <UInput
                    v-model="search"
                    placeholder="Buscar ticket, codigo, equipo o tecnico..."
                    class="w-full"
                    :ui="{ base: 'rounded-full pl-9 border-gray-200/80 bg-white/90 shadow-sm dark:border-gray-800 dark:bg-gray-950/80' }"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-[1360px] w-full border-separate border-spacing-0">
              <thead class="sticky top-0 z-10 bg-white/95 backdrop-blur dark:bg-gray-950/95">
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

              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr
                  v-for="ticket in paginatedTickets"
                  :key="ticket.id"
                  class="group bg-white transition hover:bg-[#f8fbff] dark:bg-gray-950 dark:hover:bg-gray-900/70"
                >
                  <td class="px-5 py-4 align-top text-sm font-semibold text-[#2d5fc0] dark:text-[#8fb0ff]">
                    <NuxtLink
                      :to="`/mesa-de-ayuda/ticket-detalle?id=${ticket.id}`"
                      class="inline-flex items-center gap-1 rounded-full transition hover:text-[#1f49b5] hover:underline"
                    >
                      {{ ticket.id }}
                      <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
                    </NuxtLink>
                  </td>
                  <td class="px-5 py-4 align-top text-sm font-semibold text-[#2d5fc0] dark:text-[#8fb0ff]">
                    {{ ticket.code }}
                  </td>
                  <td class="px-5 py-4 align-top text-sm text-gray-800 dark:text-gray-200">
                    <div class="max-w-[220px] truncate font-medium leading-6">
                      {{ ticket.technician }}
                    </div>
                  </td>
                  <td class="px-5 py-4 align-top text-sm text-[#2d5fc0] dark:text-[#8fb0ff]">
                    <div class="max-w-[190px] truncate font-medium leading-6">
                      {{ ticket.equipment }}
                    </div>
                  </td>
                  <td class="px-5 py-4 align-top text-sm text-gray-700 dark:text-gray-300">
                    <div class="max-w-[270px] truncate font-medium leading-6">
                      {{ ticket.agency }}
                    </div>
                  </td>
                  <td class="px-5 py-4 align-top text-sm text-gray-800 dark:text-gray-200">
                    <div class="max-w-[150px] truncate font-medium leading-6">
                      {{ ticket.assignedTo }}
                    </div>
                  </td>
                  <td class="px-5 py-4 align-top text-sm text-gray-800 dark:text-gray-200">
                    <div class="space-y-0.5">
                      <p class="font-medium leading-6">
                        {{ ticket.createdBy }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ ticket.createdAt }}
                      </p>
                    </div>
                  </td>
                  <td class="px-5 py-4 align-top text-sm">
                    <span
                      class="inline-flex rounded-full px-3 py-1 text-sm font-semibold"
                      :class="statusBadgeClass[ticket.status]"
                    >
                      {{ statusConfig[ticket.status].label }}
                    </span>
                  </td>
                  <td class="px-5 py-4 align-top text-center">
                    <UButton
                      color="error"
                      variant="ghost"
                      icon="i-lucide-trash-2"
                      size="sm"
                      class="rounded-full opacity-75 transition hover:opacity-100"
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
                label="Anterior"
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
                label="Siguiente"
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
