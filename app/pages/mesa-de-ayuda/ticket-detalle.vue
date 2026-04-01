<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

type TicketStatus = 'solucionado' | 'en_proceso' | 'pausado' | 'anulado'

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

  return {
    id: formatTicketId(index),
    code: formatTicketCode(index),
    technician: technicianNames[index % technicianNames.length]!,
    equipment: equipmentModels[index % equipmentModels.length]!,
    agency: agencyNames[index % agencyNames.length]!,
    assignedTo: assignedUsers[index % assignedUsers.length]!,
    createdBy: createdUsers[index % createdUsers.length]!,
    createdAt: formatDate(index),
    status,
  }
})

const route = useRoute()
const ticketId = computed(() => String(route.query.id || ''))

const ticket = computed(() => tickets.find(item => item.id === ticketId.value) || null)

useHead(() => ({
  title: ticket.value
    ? `${ticket.value.id} - Mesa de ayuda`
    : 'Detalle de ticket - Mesa de ayuda',
}))

const shortTicketNumber = computed(() =>
  ticket.value ? ticket.value.id.replace(/^TCK-0+/, '') : '',
)

const historyQuery = shallowRef('')

const ticketStatusMeta = computed(() => {
  if (!ticket.value) {
    return {
      label: 'Sin estado',
      tone: 'neutral' as const,
      icon: 'i-lucide-circle',
    }
  }

  switch (ticket.value.status) {
    case 'solucionado':
      return {
        label: 'Solucionado',
        tone: 'success' as const,
        icon: 'i-lucide-badge-check',
      }
    case 'en_proceso':
      return {
        label: 'En proceso',
        tone: 'primary' as const,
        icon: 'i-lucide-loader-circle',
      }
    case 'pausado':
      return {
        label: 'Pausado',
        tone: 'warning' as const,
        icon: 'i-lucide-pause-circle',
      }
    case 'anulado':
      return {
        label: 'Anulado',
        tone: 'error' as const,
        icon: 'i-lucide-circle-off',
      }
  }
})

const timeline = [
  {
    title: 'Cerrado',
    badge: 'Cerrado',
    tone: 'error' as const,
    icon: 'i-lucide-circle-check-big',
    time: '30/03/2026 13:50',
    author: 'Miguel Gonzalo',
    assignedTo: 'Miguel Gonzalo',
    note: 'Equipo presenta problemas en el proceso de monedas se necesita pulido de sort disc.',
  },
  {
    title: 'Asignado manualmente',
    badge: 'En proceso',
    tone: 'primary' as const,
    icon: 'i-lucide-user-cog',
    time: '30/03/2026 13:47',
    author: 'Miguel Gonzalo',
    assignedTo: 'Miguel Gonzalo',
    note: 'El ticket fue asignado manualmente por el usuario.',
  },
  {
    title: 'Reasignado automaticamente',
    badge: 'Derivado',
    tone: 'warning' as const,
    icon: 'i-lucide-refresh-cw',
    time: '30/03/2026 12:32',
    author: 'Dacio Wilder',
    assignedTo: 'Dacio Wilder',
    note: 'Ticket reasignado automaticamente segun prioridad del modelo.',
  },
  {
    title: 'Creado desde llamada',
    badge: 'Ingreso',
    tone: 'neutral' as const,
    icon: 'i-lucide-phone-call',
    time: '30/03/2026 12:02',
    author: 'Emilio Arturo',
    assignedTo: 'Carlos Alberto',
    note: 'Registro inicial generado desde la llamada de soporte.',
  },
] satisfies Array<{
  title: string
  badge: string
  tone: 'error' | 'primary' | 'warning' | 'neutral'
  icon: string
  time: string
  author: string
  assignedTo: string
  note: string
}>

const matchesHistory = (item: (typeof timeline)[number], query: string) =>
  [item.title, item.badge, item.author, item.assignedTo, item.note, item.time]
    .join(' ')
    .toLowerCase()
    .includes(query)

const filteredTimeline = computed(() => {
  const q = historyQuery.value.trim().toLowerCase()

  if (!q) {
    return timeline
  }

  return timeline.filter(item => matchesHistory(item, q))
})

const duration = '1h 48m 8s'
const openedAt = '30/03/2026 12:02'
const closedAt = '30/03/2026 13:50'

const detailFields = computed(() => {
  if (!ticket.value) {
    return []
  }

  return [
    { label: 'Falla reportada', value: 'Revision de equipo' },
    { label: 'Comentario inicial', value: 'Error en equipo' },
    { label: 'Tecnico', value: ticket.value.technician },
    { label: 'Agencia', value: ticket.value.agency },
    { label: 'Modelo del equipo', value: ticket.value.equipment },
    { label: 'Area inicial', value: 'Sin area' },
    { label: 'Motivo de derivacion', value: 'Tecnico no logro resolver en esta instancia' },
    { label: 'Asignado a', value: ticket.value.assignedTo },
    { label: 'Observacion inicial', value: 'No hay observaciones' },
  ]
})
</script>

<template>
  <UDashboardPanel id="support-ticket-detail">
    <template #body>
      <div v-if="ticket" class="space-y-6 p-4 sm:p-6 lg:p-8">
        <section class="overflow-hidden rounded-[1.9rem] border border-[#d7e1f5] bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.32)] dark:border-[#29426d] dark:bg-gray-950">
          <div class="flex flex-col gap-5 border-b border-gray-200/80 px-5 py-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
            <div class="flex items-start gap-4">
              <UButton
                to="/mesa-de-ayuda/support-ticket"
                color="neutral"
                variant="ghost"
                icon="i-lucide-arrow-left"
                class="rounded-full"
              >
                Volver
              </UButton>

              <div class="flex items-start gap-4">
                <div class="flex size-12 shrink-0 items-center justify-center rounded-3xl bg-[#eef4ff] text-[#2d5fc0] shadow-[0_14px_28px_-22px_rgba(45,95,192,0.6)] dark:bg-[#13203a] dark:text-[#8fb0ff]">
                  <UIcon name="i-lucide-file-text" class="size-5" />
                </div>

                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <h1 class="text-2xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
                      Detalle del Ticket
                    </h1>
                    <UBadge
                      :color="ticketStatusMeta.tone"
                      variant="soft"
                      class="rounded-full px-3 py-1.5 text-xs font-semibold"
                    >
                      <UIcon :name="ticketStatusMeta.icon" class="mr-1 size-3.5" />
                      {{ ticketStatusMeta.label }}
                    </UBadge>
                  </div>

                  <p class="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Seguimiento ficticio con una lectura rápida de apertura, cierre, estado actual y línea de tiempo de los cambios.
                  </p>

                  <div class="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ ticket.id }}
                    </span>
                    <span aria-hidden="true">•</span>
                    <span>{{ ticket.technician }}</span>
                    <span aria-hidden="true">•</span>
                    <span>{{ ticket.agency }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <UBadge color="primary" variant="soft" class="rounded-full px-4 py-2 text-sm font-semibold">
                Inicio: {{ openedAt }}
              </UBadge>
              <UBadge color="success" variant="soft" class="rounded-full px-4 py-2 text-sm font-semibold">
                Cierre: {{ closedAt }}
              </UBadge>
              <UBadge color="neutral" variant="soft" class="rounded-full px-4 py-2 text-sm font-semibold">
                Total: {{ duration }}
              </UBadge>
            </div>
          </div>

          <div class="grid gap-3 px-5 py-4 sm:grid-cols-3">
            <div class="rounded-[1.35rem] border border-gray-200/80 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
              <p class="text-xs font-bold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                ID
              </p>
              <p class="mt-1 text-sm font-semibold text-gray-950 dark:text-white">
                {{ shortTicketNumber }}
              </p>
            </div>
            <div class="rounded-[1.35rem] border border-gray-200/80 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
              <p class="text-xs font-bold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                Técnico
              </p>
              <p class="mt-1 text-sm font-semibold text-gray-950 dark:text-white">
                {{ ticket.technician }}
              </p>
            </div>
            <div class="rounded-[1.35rem] border border-gray-200/80 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
              <p class="text-xs font-bold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                Equipo
              </p>
              <p class="mt-1 text-sm font-semibold text-gray-950 dark:text-white">
                {{ ticket.equipment }}
              </p>
            </div>
          </div>
        </section>

        <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <UCard class="rounded-[1.8rem] border border-gray-200/80 bg-white shadow-[0_16px_34px_-26px_rgba(15,23,42,0.26)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-0' }">
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 px-5 py-5 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2d5fc0] dark:bg-[#13203a] dark:text-[#8fb0ff]">
                  <UIcon name="i-lucide-file-text" class="size-5" />
                </div>
                <div>
                  <h2 class="text-xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
                    Datos del Ticket
                  </h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Campos de lectura y contexto operativo.
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <UBadge color="neutral" variant="soft" class="rounded-full px-4 py-2 font-semibold">
                  ID: {{ shortTicketNumber }}
                </UBadge>
                <UBadge color="primary" variant="soft" class="rounded-full px-4 py-2 font-semibold">
                  {{ ticket.id }}
                </UBadge>
                <UBadge color="success" variant="soft" class="rounded-full px-4 py-2 font-semibold">
                  {{ ticket.equipment }}
                </UBadge>
              </div>
            </div>

            <div class="grid gap-4 px-5 py-5 md:grid-cols-2">
              <div
                v-for="field in detailFields"
                :key="field.label"
                class="space-y-2"
              >
                <p class="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {{ field.label }}
                </p>
                <div class="min-h-14 rounded-2xl border border-gray-200/80 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-200">
                  {{ field.value }}
                </div>
              </div>
            </div>

            <div class="px-5 pb-5">
              <div class="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                    <UIcon name="i-lucide-check-circle-2" class="size-5" />
                  </div>
                  <div class="space-y-1">
                    <p class="font-semibold">
                      Mensaje
                    </p>
                    <p class="text-sm leading-6">
                      Este ticket se encuentra cerrado y no puede ser modificado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <UCard class="rounded-[1.8rem] border border-gray-200/80 bg-white shadow-[0_16px_34px_-26px_rgba(15,23,42,0.26)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-0' }">
            <div class="flex items-center justify-between gap-3 border-b border-gray-200/80 px-5 py-5 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2d5fc0] dark:bg-[#13203a] dark:text-[#8fb0ff]">
                  <UIcon name="i-lucide-history" class="size-5" />
                </div>
                <div>
                  <h2 class="text-xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
                    Historial del Ticket
                  </h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Cronología de actividad del ticket #{{ shortTicketNumber }}
                  </p>
                </div>
              </div>

              <UBadge color="neutral" variant="soft" class="rounded-full px-4 py-2 font-semibold">
                {{ ticket.id }}
              </UBadge>
            </div>

            <div class="border-b border-gray-200/80 px-5 py-5 dark:border-gray-800">
              <div class="relative">
                <UIcon
                  name="i-lucide-search"
                  class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                />
                <UInput
                  v-model="historyQuery"
                  placeholder="Buscar comentarios..."
                  class="w-full"
                  :ui="{ base: 'rounded-full pl-10 border-gray-200/80 bg-white/90 shadow-sm dark:border-gray-800 dark:bg-gray-950/80' }"
                />
              </div>
            </div>

            <div class="max-h-[740px] overflow-y-auto px-5 py-5">
              <div class="space-y-5">
                <div class="flex items-center justify-between gap-4">
                  <div class="space-y-1">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                      Cronología
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Eventos del ticket ordenados del más reciente al inicial.
                    </p>
                  </div>

                  <UBadge color="neutral" variant="soft" class="rounded-full px-4 py-2 font-semibold">
                    {{ filteredTimeline.length }} eventos
                  </UBadge>
                </div>

                <div v-if="filteredTimeline.length" class="relative">
                  <div class="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-blue-200 via-slate-200 to-transparent dark:from-blue-400/30 dark:via-slate-700 dark:to-transparent" />

                  <div class="space-y-5">
                    <article
                      v-for="(item, index) in filteredTimeline"
                      :key="`${item.title}-${item.time}`"
                      class="relative pl-14"
                    >
                      <div
                        class="absolute left-0 top-1 flex size-10 items-center justify-center rounded-3xl border shadow-[0_14px_24px_-18px_rgba(15,23,42,0.38)]"
                        :class="item.tone === 'error'
                          ? 'border-rose-100 bg-rose-50 text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
                          : item.tone === 'primary'
                            ? 'border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300'
                            : item.tone === 'warning'
                              ? 'border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
                              : 'border-slate-100 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'"
                      >
                        <UIcon :name="item.icon" class="size-4" />
                      </div>

                      <div
                        class="rounded-[1.55rem] border bg-white px-5 py-4 shadow-[0_16px_30px_-26px_rgba(15,23,42,0.3)] transition-transform duration-200 hover:-translate-y-0.5 dark:bg-gray-950"
                        :class="item.tone === 'error'
                          ? 'border-rose-100/80 dark:border-rose-500/20'
                          : item.tone === 'primary'
                            ? 'border-blue-100/80 dark:border-blue-500/20'
                            : item.tone === 'warning'
                              ? 'border-amber-100/80 dark:border-amber-500/20'
                              : 'border-gray-200/80 dark:border-gray-800'"
                      >
                        <div class="flex flex-wrap items-start justify-between gap-3">
                          <div class="space-y-2">
                            <div class="flex flex-wrap items-center gap-2">
                              <p class="font-semibold tracking-[-0.02em] text-gray-950 dark:text-white">
                                {{ item.title }}
                              </p>
                              <UBadge
                                :color="item.tone === 'error' ? 'error' : item.tone === 'primary' ? 'primary' : item.tone === 'warning' ? 'warning' : 'neutral'"
                                variant="soft"
                                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                              >
                                {{ item.badge }}
                              </UBadge>
                            </div>

                            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>
                                Por: <span class="font-semibold text-gray-950 dark:text-white">{{ item.author }}</span>
                              </span>
                              <span>
                                Asignado a: <span class="font-semibold text-gray-950 dark:text-white">{{ item.assignedTo }}</span>
                              </span>
                            </div>
                          </div>

                          <div class="text-right">
                            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {{ item.time }}
                            </p>
                            <p class="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                              Paso {{ String(index + 1).padStart(2, '0') }}
                            </p>
                          </div>
                        </div>

                        <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {{ item.note }}
                        </p>
                      </div>
                    </article>
                  </div>
                </div>

                <div v-else class="rounded-2xl border border-dashed border-gray-200 px-5 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  No encontramos movimientos con ese texto.
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div v-else class="p-8">
        <UCard class="mx-auto max-w-xl border border-gray-200/80 bg-white shadow-[0_16px_34px_-26px_rgba(15,23,42,0.26)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-8' }">
          <div class="space-y-4 text-center">
            <div class="mx-auto flex size-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <UIcon name="i-lucide-search-x" class="size-8" />
            </div>
            <div class="space-y-2">
              <h1 class="text-2xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
                Ticket no encontrado
              </h1>
              <p class="text-sm leading-6 text-gray-600 dark:text-gray-400">
                El identificador solicitado no existe en los datos ficticios.
              </p>
            </div>
            <UButton
              to="/mesa-de-ayuda/support-ticket"
              color="primary"
              variant="solid"
              icon="i-lucide-arrow-left"
              class="rounded-full px-5"
            >
              Volver a la tabla
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
