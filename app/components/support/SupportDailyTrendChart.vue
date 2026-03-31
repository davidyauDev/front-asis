<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

type DayPoint = {
  day: string
  total: number
}

const props = defineProps<{
  title: string
  subtitle?: string
  series: DayPoint[]
}>()

const colorMode = useColorMode()

const chartSeries = computed(() => [
  {
    name: 'Tickets',
    data: props.series.map(point => point.total),
  },
])

const categories = computed(() => props.series.map(point => point.day))
const total = computed(() => props.series.reduce((sum, point) => sum + point.total, 0))
const peak = computed(() => props.series.reduce((max, point) => Math.max(max, point.total), 0))

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    sparkline: { enabled: false },
    background: 'transparent',
    fontFamily: 'inherit',
  },
  colors: ['#2d5fc0'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 4,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.55,
      opacityFrom: 0.32,
      opacityTo: 0.04,
      stops: [0, 90, 100],
    },
  },
  grid: {
    borderColor: colorMode.value === 'dark' ? '#1f2937' : '#e5e7eb',
    strokeDashArray: 4,
    padding: { left: 12, right: 12 },
  },
  xaxis: {
    categories: categories.value,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: {
        colors: colorMode.value === 'dark' ? '#9ca3af' : '#64748b',
        fontSize: '12px',
        fontWeight: 600,
      },
    },
  },
  yaxis: {
    min: 0,
    labels: {
      style: {
        colors: colorMode.value === 'dark' ? '#9ca3af' : '#64748b',
      },
    },
  },
  tooltip: {
    theme: colorMode.value as 'dark' | 'light',
    y: {
      formatter: value => `${value} tickets`,
    },
  },
  theme: {
    mode: colorMode.value as 'dark' | 'light',
  },
  legend: {
    show: false,
  },
}))

const momentum = computed(() => {
  if (props.series.length < 2) {
    return 0
  }

  const last = props.series[props.series.length - 1]?.total ?? 0
  const prev = props.series[props.series.length - 2]?.total ?? 0
  return prev === 0 ? 0 : Math.round(((last - prev) / prev) * 100)
})
</script>

<template>
  <UCard class="rounded-[1.75rem] border border-gray-200/80 bg-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-6' }">
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-1 text-sm text-muted">
          {{ subtitle }}
        </p>
      </div>

      <div class="rounded-2xl border border-[#d7e1f5] bg-[#eef4ff] px-3 py-2 text-sm font-semibold text-[#2d5fc0] dark:border-[#29426d] dark:bg-[#13203a] dark:text-[#c9d9ff]">
        {{ momentum >= 0 ? '+' : '' }}{{ momentum }}% vs. semana previa
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <div class="rounded-[1.4rem] border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-4 dark:border-gray-800 dark:from-slate-900/60 dark:to-gray-950">
        <apexchart
          type="area"
          height="320"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>

      <div class="grid gap-3">
        <div class="rounded-2xl border border-gray-100 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-slate-900/50">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            Total semanal
          </p>
          <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
            {{ total }}
          </p>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-slate-900/50">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            Pico diario
          </p>
          <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
            {{ peak }}
          </p>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-slate-900/50">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            Promedio
          </p>
          <p class="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
            {{ Math.round(total / Math.max(series.length, 1)) }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
