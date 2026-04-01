<script setup lang="ts">
definePageMeta({
  layout: 'support',
  middleware: 'auth',
})

useHead({
  title: 'Mesa de ayuda - Llamadas',
})

type MetricCard = {
  title: string
  value: string
  trend: string
  tone: 'success' | 'error'
  subtitle: string
  icon: string
}

type RankedItem = {
  name: string
  total: number
}

const currentMonth = shallowRef('2026-03')
const techniciansMonth = shallowRef('all')
const callersMonth = shallowRef('all')
const callTypesMonth = shallowRef('all')

const metrics = [
  {
    title: 'Llamadas Hoy',
    value: '48',
    trend: '+0.0%',
    tone: 'success',
    subtitle: 'Respecto a ayer',
    icon: 'i-lucide-phone-call',
  },
  {
    title: 'Respecto al Mes Anterior',
    value: '612',
    trend: '+0.0%',
    tone: 'success',
    subtitle: 'Llamadas este mes',
    icon: 'i-lucide-calendar-range',
  },
  {
    title: 'Llamadas Este Ano',
    value: '6,918',
    trend: '-100.0%',
    tone: 'error',
    subtitle: 'Respecto al ano anterior',
    icon: 'i-lucide-chart-column',
  },
] satisfies MetricCard[]

const dailyCallSeries = [
  {
    name: 'Soporte',
    data: [0, 1, 1, 0, 2, 3, 2, 4, 5, 4, 3, 4, 6, 7, 8, 9, 8, 9, 11, 10, 9, 8, 7, 8, 9, 10, 8, 7, 6, 5, 4],
  },
  {
    name: 'Consulta',
    data: [0, 0, 1, 1, 1, 2, 3, 3, 4, 3, 3, 4, 5, 6, 7, 6, 6, 7, 8, 9, 9, 8, 8, 7, 7, 8, 6, 5, 5, 4, 3],
  },
  {
    name: 'Reclamo',
    data: [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1, 2, 2, 3, 2, 2, 2, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0],
  },
]

const dailyCategories = Array.from({ length: 31 }, (_, i) => String(i + 1))

const technicians = [
  { name: 'Ricardo Alberto Zumaeta Peralta', total: 18 },
  { name: 'Felix Manuel Galagarza Gutierrez', total: 14 },
  { name: 'Juan Carlos Angel Asencio Mendez', total: 12 },
  { name: 'Sergio Gerardo Manturano Cornejo', total: 11 },
  { name: 'Carlos Joal Silva Salazar', total: 9 },
] satisfies RankedItem[]

const callers = [
  { name: 'Emilio Arturo Mejia Avalos', total: 29 },
  { name: 'Jorge Luis Chavez Torres', total: 22 },
  { name: 'Diego Luis Zavala Taboada', total: 15 },
  { name: 'Omar Humberto Julian Grillo Huapaya', total: 12 },
  { name: 'Carlos Joal Silva Salazar', total: 11 },
] satisfies RankedItem[]

const callTypeSlices = [
  { label: 'Soporte', value: 34, color: '#2d5fc0' },
  { label: 'Consulta', value: 18, color: '#4f8cff' },
  { label: 'Reclamo', value: 8, color: '#a8c8ff' },
]
</script>

<template>
  <UDashboardPanel id="support-calls">
    <template #header>
      <AppDashboardHeader
        title="Mesa de ayuda"
        mobile-title="Mesa de ayuda"
        subtitle="Resumen operativo del soporte"
        subtitle-icon="i-lucide-lifebuoy"
        :notification-count="4"
        :notification-shortcuts="['N']"
      />
    </template>

    <template #body>
      <div class="space-y-8">
        <section class="overflow-hidden rounded-[2rem] border border-[#d7e1f5] bg-gradient-to-br from-[#eff4ff] via-white to-[#f8fbff] p-6 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)] dark:border-[#29426d] dark:from-[#101d33] dark:via-[#0f172a] dark:to-[#09111f]">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="space-y-3">
              <p class="text-xs font-black uppercase tracking-[0.28em] text-[#2d5fc0] dark:text-[#8fb0ff]">
                Panel de llamadas
              </p>
              <h2 class="text-2xl font-black tracking-[-0.05em] text-gray-950 dark:text-white sm:text-3xl">
                Volumen, motivos y eficiencia en una sola vista
              </h2>
              <p class="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Datos ficticios para mostrar el comportamiento diario de las llamadas, los perfiles con mayor carga y la mezcla de tipos de atencion.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.2)] dark:border-gray-800 dark:bg-gray-950/75">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                  En vivo
                </p>
                <p class="mt-2 text-2xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
                  48
                </p>
                <p class="mt-1 text-xs text-muted">
                  llamadas hoy
                </p>
              </div>

              <div class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.2)] dark:border-gray-800 dark:bg-gray-950/75">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                  Promedio
                </p>
                <p class="mt-2 text-2xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
                  31
                </p>
                <p class="mt-1 text-xs text-muted">
                  por dia este mes
                </p>
              </div>

              <div class="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.2)] dark:border-gray-800 dark:bg-gray-950/75">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                  Mix
                </p>
                <p class="mt-2 text-2xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
                  3 tipos
                </p>
                <p class="mt-1 text-xs text-muted">
                  soporte, consulta y reclamo
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="grid gap-4 xl:grid-cols-3">
          <UCard
            v-for="item in metrics"
            :key="item.title"
            class="overflow-hidden border border-gray-200/80 shadow-[0_10px_26px_-20px_rgba(15,23,42,0.18)] dark:border-gray-800"
            :ui="{ body: 'p-0' }"
          >
            <div
              class="flex min-h-36 items-stretch justify-between gap-4 rounded-3xl px-5 py-5 text-white"
              :class="item.tone === 'success'
                ? 'bg-gradient-to-br from-[#2d5fc0] to-[#4a7dff]'
                : 'bg-gradient-to-br from-rose-500 to-red-500'"
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
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="item.tone === 'success' ? 'success' : 'error'"
                    variant="soft"
                    class="rounded-full bg-white/20 text-white ring-1 ring-white/20"
                  >
                    {{ item.trend }}
                  </UBadge>
                  <span class="text-sm font-medium opacity-95">
                    {{ item.subtitle }}
                  </span>
                </div>
              </div>

              <div class="flex shrink-0 items-start pt-2">
                <div class="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                  <UIcon :name="item.icon" class="size-7" />
                </div>
              </div>
            </div>
          </UCard>
        </section>

        <SupportCallTrendChart
          v-model="currentMonth"
          title="Llamadas por Dia"
          subtitle="Tendencia diaria ficticia con separacion por tipo de llamada"
          :categories="dailyCategories"
          :series="dailyCallSeries"
        />

        <section class="grid gap-6 xl:grid-cols-3">
          <SupportTopRankingCard
            v-model="techniciansMonth"
            title="Tecnicos Mas Llamados"
            value-label="Llamadas"
            :items="technicians"
            accent="bg-[#2d5fc0]"
            :show-footer-action="false"
          />

          <SupportTopRankingCard
            v-model="callersMonth"
            title="Personas que Mas Llaman"
            value-label="Llamadas"
            :items="callers"
            accent="bg-emerald-500"
            :show-footer-action="false"
          />

          <SupportStatusDonutChart
            v-model="callTypesMonth"
            title="Tipos de Llamadas"
            subtitle="Distribucion ficticia por categoria"
            :slices="callTypeSlices"
          />
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
