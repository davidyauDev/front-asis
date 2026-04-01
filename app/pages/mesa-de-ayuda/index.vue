<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

useHead({
  title: 'Mesa de ayuda - Tickets',
})

type DashboardTab = 'summary' | 'daily'

type MetricCard = {
  title: string
  value: string
  caption: string
  icon: string
  gradient: string
}

type RankedItem = {
  name: string
  total: number
}

type DayPoint = {
  day: string
  total: number
}

type BadgeColor = 'primary' | 'success' | 'warning'

const currentTab = shallowRef<DashboardTab>('summary')
const summaryMonth = shallowRef('all')
const techniciansMonth = shallowRef('all')
const resolvedMonth = shallowRef('all')

const tabItems = computed(() => [
  { label: 'Resumen General', value: 'summary' },
  { label: 'Gráfica por Día', value: 'daily' },
])

const summaryMetrics = [
  {
    title: 'Total General',
    value: '601',
    caption: 'Tickets del año 2026',
    icon: 'i-lucide-ticket',
    gradient: 'from-[#2d5fc0] to-[#4a7dff]',
  },
  {
    title: 'Cerrados',
    value: '590',
    caption: '98.2% del total',
    icon: 'i-lucide-circle-check-big',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    title: 'Faltan por Cerrar',
    value: '11',
    caption: '1.8% del total',
    icon: 'i-lucide-clock-3',
    gradient: 'from-orange-500 to-amber-500',
  },
] satisfies MetricCard[]

const technicians = [
  { name: 'Pablo Cesar Mauricio Mendez', total: 23 },
  { name: 'Boward Davis Mucho Villegas', total: 21 },
  { name: 'Giancarlo Sutta Medina', total: 15 },
  { name: 'Alexander Guillermo Magán Rosales', total: 14 },
  { name: 'Saúl Mariano De La Cruz Martinez', total: 13 },
] satisfies RankedItem[]

const resolvedUsers = [
  { name: 'Emilio Arturo Mejia Avalos', total: 253 },
  { name: 'Jorge Luis Chavez Torres', total: 187 },
  { name: 'Carlos Joal Silva Salazar', total: 69 },
  { name: 'Sergio Gerardo Manturano Cornejo', total: 27 },
  { name: 'Ruben Alejandro Zarate Rios', total: 19 },
] satisfies RankedItem[]

const statusSlices = [
  { label: 'Cerrados', value: 590, color: '#2d5fc0' },
  { label: 'En seguimiento', value: 6, color: '#0ea5e9' },
  { label: 'Pendientes', value: 4, color: '#f59e0b' },
  { label: 'Reabiertos', value: 1, color: '#10b981' },
]

const daySeries = [
  { day: 'Lun', total: 74 },
  { day: 'Mar', total: 96 },
  { day: 'Mie', total: 83 },
  { day: 'Jue', total: 111 },
  { day: 'Vie', total: 102 },
  { day: 'Sab', total: 64 },
  { day: 'Dom', total: 71 },
] satisfies DayPoint[]

const dailyStatuses = [
  { label: 'Pendientes', total: 18, color: 'warning' },
  { label: 'En seguimiento', total: 27, color: 'primary' },
  { label: 'Resueltos', total: 53, color: 'success' },
] satisfies Array<{ label: string; total: number; color: BadgeColor }>

const dailyBars = computed(() => {
  const max = Math.max(...daySeries.map(point => point.total))

  return daySeries.map(point => ({
    ...point,
    height: `${Math.max(18, Math.round((point.total / max) * 100))}%`,
  }))
})

const summaryTotal = '601'
const closedPercent = '98.2%'
const pendingPercent = '1.8%'
</script>

<template>
  <UDashboardPanel id="support-home">
    <template #header>
      <AppDashboardHeader
        title="Mesa de ayuda"
        mobile-title="Mesa de ayuda"
        subtitle="Resumen operativo del soporte"
        subtitle-icon="i-lucide-lifebuoy"
        :notification-count="4"
        :notification-shortcuts="['N']"
      />

      <UDashboardToolbar>
        <div class="mt-2 flex w-full items-center justify-between gap-4">
          <AppTabs
            v-model="currentTab"
            ariaLabel="Secciones de mesa de ayuda"
            :items="tabItems"
            :list-class="'w-fit'"
          />

          <UButton
            color="success"
            variant="solid"
            size="sm"
            icon="i-lucide-file-spreadsheet"
            class="shrink-0 self-start whitespace-nowrap rounded-full border border-emerald-400/20 px-4 py-2.5 font-semibold shadow-[0_10px_22px_-16px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(16,185,129,0.55)] sm:self-auto"
          >
            Generar Excel
          </UButton>
        </div>
      </UDashboardToolbar>
    </template>

    <template #body>
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
        mode="out-in"
      >
        <div v-if="currentTab === 'summary'" key="summary" class="space-y-8">
          <section class="grid gap-4 xl:grid-cols-3">
            <UCard
              v-for="item in summaryMetrics"
              :key="item.title"
              class="overflow-hidden border border-gray-200/80 shadow-[0_10px_26px_-20px_rgba(15,23,42,0.18)] dark:border-gray-800"
              :ui="{ body: 'p-0' }"
            >
              <div
                class="flex min-h-36 items-stretch justify-between gap-4 rounded-3xl px-5 py-5 text-white"
                :class="`bg-gradient-to-br ${item.gradient}`"
              >
                <div class="flex flex-col justify-between gap-3">
                  <div class="space-y-2">
                    <p class="text-sm font-semibold opacity-95">
                      {{ item.title }}
                    </p>
                    <p class="text-4xl font-black tracking-[-0.05em]">
                      {{ item.value }}
                    </p>
                  </div>
                  <p class="text-sm font-medium opacity-95">
                    {{ item.caption }}
                  </p>
                </div>

                <div class="flex shrink-0 items-start pt-2">
                  <div class="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                    <UIcon :name="item.icon" class="size-7" />
                  </div>
                </div>
              </div>
            </UCard>
          </section>

          <section class="grid gap-6 xl:grid-cols-2">
            <SupportStatusDonutChart
              v-model="summaryMonth"
              title="Estado de tickets"
              subtitle="Distribución general de la mesa de ayuda"
              :slices="statusSlices"
            />

            <SupportDailyTrendChart
              title="Tendencia semanal"
              subtitle="Evolución ficticia de tickets durante los últimos 7 días"
              :series="daySeries"
            />
          </section>

          <section class="grid gap-6 xl:grid-cols-2">
            <SupportTopRankingCard
              v-model="techniciansMonth"
              title="Técnicos con más tickets"
              value-label="Total de llamadas"
              :items="technicians"
              accent="bg-[#2d5fc0]"
            />

            <SupportTopRankingCard
              v-model="resolvedMonth"
              title="Usuarios con más tickets resueltos"
              value-label="Total de tickets resueltos"
              :items="resolvedUsers"
              accent="bg-emerald-500"
            />
          </section>
        </div>

        <div v-else key="daily" class="space-y-8">
          <section class="grid gap-4 md:grid-cols-3">
            <UCard class="border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
              <p class="text-sm font-medium text-muted">
                Tickets del día
              </p>
              <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
                {{ summaryTotal }}
              </p>
              <p class="mt-1 text-sm text-muted">
                acumulados en el 2026
              </p>
            </UCard>

            <UCard class="border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
              <p class="text-sm font-medium text-muted">
                Cerrados
              </p>
              <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
                {{ closedPercent }}
              </p>
              <p class="mt-1 text-sm text-muted">
                rendimiento de resolución
              </p>
            </UCard>

            <UCard class="border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
              <p class="text-sm font-medium text-muted">
                Pendientes
              </p>
              <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
                {{ pendingPercent }}
              </p>
              <p class="mt-1 text-sm text-muted">
                casos por cerrar
              </p>
            </UCard>
          </section>

          <section class="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <UCard class="rounded-[1.75rem] border border-gray-200/80 bg-white shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-6' }">
              <div class="mb-6 flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
                    Gráfica por día
                  </h2>
                  <p class="mt-1 text-sm text-muted">
                    Distribución ficticia de tickets durante la semana.
                  </p>
                </div>
              </div>

              <div class="flex h-72 items-end gap-3 rounded-3xl bg-gradient-to-b from-gray-50 to-white p-5 dark:from-gray-900/70 dark:to-gray-950">
                <div
                  v-for="point in dailyBars"
                  :key="point.day"
                  class="flex flex-1 flex-col items-center justify-end gap-3"
                >
                  <div class="flex h-full w-full items-end">
                    <div class="flex w-full items-end justify-center rounded-2xl bg-gradient-to-t from-[#2d5fc0] to-[#5f84ff] shadow-[0_6px_14px_-10px_rgba(45,95,192,0.45)]" :style="{ height: point.height }" />
                  </div>
                  <div class="space-y-1 text-center">
                    <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                      {{ point.day }}
                    </p>
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {{ point.total }}
                    </p>
                  </div>
                </div>
              </div>
            </UCard>

            <div class="space-y-6">
              <UCard class="rounded-[1.75rem] border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-6' }">
                <h3 class="text-lg font-black tracking-[-0.03em] text-gray-950 dark:text-white">
                  Estado diario
                </h3>

                <div class="mt-5 space-y-4">
                  <div
                    v-for="item in dailyStatuses"
                    :key="item.label"
                    class="rounded-2xl border border-gray-100 p-4 dark:border-gray-800"
                  >
                    <div class="flex items-center justify-between gap-4">
                      <div class="space-y-1">
                        <p class="text-sm font-semibold text-gray-950 dark:text-white">
                          {{ item.label }}
                        </p>
                        <p class="text-xs uppercase tracking-[0.18em] text-muted">
                          Resumen ficticio
                        </p>
                      </div>
                      <UBadge :color="item.color" variant="soft">
                        {{ item.total }}
                      </UBadge>
                    </div>
                  </div>
                </div>
              </UCard>

              <UCard class="rounded-[1.75rem] border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-6' }">
                <h3 class="text-lg font-black tracking-[-0.03em] text-gray-950 dark:text-white">
                  Acciones rápidas
                </h3>

                <div class="mt-5 space-y-3">
                  <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-gray-700 dark:bg-slate-900/60 dark:text-gray-200">
                    Exportar tickets del día
                  </div>
                  <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-gray-700 dark:bg-slate-900/60 dark:text-gray-200">
                    Reasignar pendientes
                  </div>
                  <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-gray-700 dark:bg-slate-900/60 dark:text-gray-200">
                    Revisar cierres manuales
                  </div>
                </div>
              </UCard>
            </div>
          </section>
        </div>
      </Transition>
    </template>
  </UDashboardPanel>
</template>
