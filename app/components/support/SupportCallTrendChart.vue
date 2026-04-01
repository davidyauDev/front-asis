<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

type Series = {
  name: string
  data: number[]
}

const props = defineProps<{
  title: string
  subtitle?: string
  categories: string[]
  series: Series[]
}>()

const month = defineModel<string>({ required: true })
const colorMode = useColorMode()

const seriesColors = ['#2d5fc0', '#4f8cff', '#a8c8ff'] as const

const monthOptions = [
  { label: 'Marzo 2026', value: '2026-03' },
  { label: 'Febrero 2026', value: '2026-02' },
  { label: 'Enero 2026', value: '2026-01' },
  { label: 'Ultimos 30 dias', value: '30d' },
]

const seriesTotals = computed(() =>
  props.series.map(series => series.data.reduce((sum, point) => sum + point, 0)),
)

const totalCalls = computed(() => seriesTotals.value.reduce((sum, value) => sum + value, 0))

const dailyTotals = computed(() =>
  props.categories.map((_, index) =>
    props.series.reduce((sum, series) => sum + (series.data[index] ?? 0), 0),
  ),
)

const peakTotal = computed(() => Math.max(...dailyTotals.value, 0))
const peakIndex = computed(() => dailyTotals.value.indexOf(peakTotal.value))
const peakDay = computed(() => props.categories[peakIndex.value] || 'N/A')
const averageCalls = computed(() => Math.round(totalCalls.value / Math.max(props.categories.length, 1)))

const momentum = computed(() => {
  if (dailyTotals.value.length < 14) {
    return 0
  }

  const midpoint = Math.floor(dailyTotals.value.length / 2)
  const firstHalf = dailyTotals.value.slice(0, midpoint).reduce((sum, value) => sum + value, 0)
  const secondHalf = dailyTotals.value.slice(midpoint).reduce((sum, value) => sum + value, 0)

  if (!firstHalf) {
    return 0
  }

  return Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
})

const seriesSummary = computed(() =>
  props.series.map((series, index) => ({
    name: series.name,
    total: seriesTotals.value[index] ?? 0,
    color: seriesColors[index % seriesColors.length],
    width: `${totalCalls.value ? ((seriesTotals.value[index] ?? 0) / totalCalls.value) * 100 : 0}%`,
  })),
)

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    background: 'transparent',
    fontFamily: 'inherit',
  },
  colors: seriesColors,
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.5,
      opacityFrom: 0.26,
      opacityTo: 0.03,
      stops: [0, 90, 100],
    },
  },
  grid: {
    borderColor: colorMode.value === 'dark' ? '#1f2937' : '#e5e7eb',
    strokeDashArray: 4,
    padding: { left: 8, right: 8 },
  },
  xaxis: {
    categories: props.categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      rotate: 0,
      style: {
        colors: colorMode.value === 'dark' ? '#9ca3af' : '#64748b',
        fontSize: '11px',
        fontWeight: 600,
      },
    },
  },
  yaxis: {
    min: 0,
    tickAmount: 4,
    labels: {
      style: {
        colors: colorMode.value === 'dark' ? '#9ca3af' : '#64748b',
      },
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: colorMode.value as 'dark' | 'light',
    shared: true,
    intersect: false,
  },
  theme: {
    mode: colorMode.value as 'dark' | 'light',
  },
}))
</script>

<template>
  <UCard class="rounded-[1.75rem] border border-gray-200/80 bg-white shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-6' }">
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
            {{ title }}
          </h2>
          <p v-if="subtitle" class="max-w-2xl text-sm text-muted">
            {{ subtitle }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden rounded-full border border-[#d7e1f5] bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#2d5fc0] dark:border-[#29426d] dark:bg-[#13203a] dark:text-[#c9d9ff] sm:inline-flex">
            {{ totalCalls }} llamadas registradas
          </div>

          <USelectMenu
            v-model="month"
            :options="monthOptions"
            :search-input="false"
            :ignoreFilter="true"
            value-key="value"
            size="sm"
            class="w-40"
          />
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div class="rounded-[1.4rem] border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-4 dark:border-gray-800 dark:from-slate-900/60 dark:to-gray-950">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap gap-2">
              <UBadge color="primary" variant="soft" class="rounded-full px-3 py-1">
                +{{ momentum }}% vs. primera mitad
              </UBadge>
              <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1">
                Promedio {{ averageCalls }} / dia
              </UBadge>
            </div>

            <p class="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
              Datos ficticios
            </p>
          </div>

          <apexchart
            type="area"
            height="320"
            :options="chartOptions"
            :series="series"
          />
        </div>

        <div class="space-y-3">
          <div class="rounded-2xl border border-gray-100 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-slate-900/50">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Total mensual
            </p>
            <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
              {{ totalCalls }}
            </p>
            <p class="mt-1 text-sm text-muted">
              llamadas acumuladas en el mes seleccionado
            </p>
          </div>

          <div class="rounded-2xl border border-gray-100 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-slate-900/50">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Pico diario
            </p>
            <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
              {{ peakTotal }}
            </p>
            <p class="mt-1 text-sm text-muted">
              maximo registrado el dia {{ peakDay }}
            </p>
          </div>

          <div class="rounded-2xl border border-gray-100 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-slate-900/50">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Promedio
            </p>
            <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
              {{ averageCalls }}
            </p>
            <p class="mt-1 text-sm text-muted">
              llamadas por dia en esta vista
            </p>
          </div>

          <div class="rounded-2xl border border-[#d7e1f5] bg-[#eef4ff] p-4 dark:border-[#29426d] dark:bg-[#13203a]">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-[#5a79b8] dark:text-[#8fb0ff]">
              Distribucion
            </p>

            <div class="mt-4 space-y-3">
              <div
                v-for="item in seriesSummary"
                :key="item.name"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span class="size-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
                    <span class="text-sm font-semibold text-gray-950 dark:text-white">
                      {{ item.name }}
                    </span>
                  </div>
                  <span class="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {{ item.total }}
                  </span>
                </div>

                <div class="mt-2 h-2 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
                  <div
                    class="h-full rounded-full"
                    :style="{ width: item.width, backgroundColor: item.color }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
