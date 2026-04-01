<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DashboardSlaCompliancePayload } from '~/services/sistemas-ti/dashboard'

const props = defineProps<{
  slaCompliance: DashboardSlaCompliancePayload
}>()

const labels = computed(() =>
  props.slaCompliance.daily.map(item =>
    format(new Date(`${item.date}T00:00:00`), 'EEE dd MMM', { locale: es }),
  ),
)

const series = computed(() => ([
  {
    name: 'Cumplido',
    data: props.slaCompliance.daily.map(item => item.complied),
  },
  {
    name: 'Incumplido',
    data: props.slaCompliance.daily.map(item => item.breached),
  },
]))

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  stroke: {
    width: [3, 2],
    curve: 'smooth',
  },
  colors: ['hsl(142 76% 36%)', 'hsl(0 84% 60%)'],
  markers: {
    size: 4,
    strokeWidth: 2,
    strokeColors: '#fff',
  },
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.2)',
    strokeDashArray: 4,
  },
  xaxis: {
    categories: labels.value,
    labels: {
      rotate: -25,
      trim: true,
      style: {
        fontSize: '11px',
      },
    },
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 4,
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'left',
  },
  tooltip: {
    shared: true,
    intersect: false,
  },
}))
</script>

<template>
  <UCard class="border-gray-200/70 dark:border-gray-800/70">
    <template #header>
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          Cumplimiento de SLA
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Semana actual comparando cumplimiento e incumplimiento.
        </p>
      </div>
    </template>

    <apexchart
      type="line"
      height="320"
      :options="chartOptions"
      :series="series"
    />
  </UCard>
</template>
