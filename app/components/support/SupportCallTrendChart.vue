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

const monthOptions = [
  { label: 'marzo', value: '2026-03' },
  { label: 'febrero', value: '2026-02' },
  { label: 'enero', value: '2026-01' },
  { label: 'últimos 30 días', value: '30d' },
]

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    background: 'transparent',
    fontFamily: 'inherit',
  },
  colors: ['#2d5fc0', '#4f8cff', '#a8c8ff'],
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
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    markers: {
      width: 10,
      height: 10,
      strokeWidth: 0,
      radius: 999,
    },
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
  <UCard class="rounded-[1.75rem] border border-gray-200/80 bg-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)] dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-6' }">
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-1 text-sm text-muted">
          {{ subtitle }}
        </p>
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

    <div class="rounded-[1.4rem] border border-gray-100 bg-gradient-to-b from-slate-50 to-white p-4 dark:border-gray-800 dark:from-slate-900/60 dark:to-gray-950">
      <apexchart
        type="area"
        height="360"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </UCard>
</template>
