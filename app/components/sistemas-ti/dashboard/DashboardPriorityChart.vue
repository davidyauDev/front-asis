<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { DashboardTicketsByPriority } from '~/services/sistemas-ti/dashboard'

const props = defineProps<{
  tickets: DashboardTicketsByPriority
}>()

const priorityData = computed(() => ([
  {
    key: 'URGENT',
    label: 'Critica',
    value: props.tickets.URGENT || 0,
    color: 'hsl(0 84% 60%)',
  },
  {
    key: 'HIGH',
    label: 'Alta',
    value: props.tickets.HIGH || 0,
    color: 'hsl(25 95% 53%)',
  },
  {
    key: 'MEDIUM',
    label: 'Media',
    value: props.tickets.MEDIUM || 0,
    color: 'hsl(38 92% 50%)',
  },
  {
    key: 'LOW',
    label: 'Baja',
    value: props.tickets.LOW || 0,
    color: 'hsl(142 76% 36%)',
  },
]))

const totalTickets = computed(() =>
  priorityData.value.reduce((sum, item) => sum + item.value, 0),
)

const chartSeries = computed(() => priorityData.value.map(item => item.value))

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  labels: priorityData.value.map(item => item.label),
  colors: priorityData.value.map(item => item.color),
  stroke: {
    width: 0,
  },
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    y: {
      formatter: (value: number) => `${value} tickets`,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '62%',
        labels: {
          show: true,
          name: {
            show: true,
            color: '#6b7280',
            offsetY: -8,
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 600,
            color: '#111827',
            offsetY: 8,
          },
          total: {
            show: true,
            label: 'Total',
            color: '#6b7280',
            formatter: () => `${totalTickets.value}`,
          },
        },
      },
    },
  },
}))
</script>

<template>
  <UCard class="border-gray-200/70 dark:border-gray-800/70">
    <template #header>
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
          Tickets por prioridad
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Distribucion de urgencias en las ultimas 24 horas.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <apexchart
        type="donut"
        height="320"
        :options="chartOptions"
        :series="chartSeries"
      />

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div
          v-for="item in priorityData"
          :key="item.key"
          class="flex items-center gap-2 rounded-lg border border-gray-200/70 px-3 py-2 text-xs dark:border-gray-800/70"
        >
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
          <span class="font-medium text-gray-700 dark:text-gray-200">{{ item.label }}</span>
          <span class="ml-auto text-gray-500 dark:text-gray-400">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
