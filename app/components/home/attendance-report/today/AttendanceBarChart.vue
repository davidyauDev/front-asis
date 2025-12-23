<template>
  <div class="flex items-center gap-6">
    <!-- DONUT -->
    <apexchart
      type="donut"
      width="360"
      :options="chartOptions"
      :series="series"
    />

    <!-- RESUMEN LATERAL -->
    <div class="space-y-3 text-sm">
      <div
        v-for="(label, i) in labels"
        :key="label"
        class="flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: colors[i] }"
          />
          <span class="text-gray-600 dark:text-gray-300">
            {{ label }}
          </span>
        </div>

        <span class="font-semibold text-gray-900 dark:text-white">
          {{ attendances[i] }}
        </span>
      </div>

      
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore'

const colorMode = useColorMode()

const labels = ['Asistencia', 'Ausencias', 'Tardanzas']
const colors = ['#1447e6', '#99a1af', '#e7000b']

const store = useAttendanceReportStore()
const { attendance } = storeToRefs(store)

/* =========================
   VALORES REALES
========================= */
const attendances = computed<number[]>(() => {
  const { asistencias, ausencias, tardanzas } =
    attendance.value.taken.daily.summary

  return [asistencias, ausencias, tardanzas]
})

const total = computed(() =>
  attendances.value.reduce((a, b) => a + b, 0)
)

/* =========================
   PORCENTAJES
========================= */
const series = computed<number[]>(() => {
  if (total.value === 0) return [0, 0, 0]

  return attendances.value.map(v =>
    Math.round((v / total.value) * 100)
  )
})

/* =========================
   OPCIONES CHART
========================= */
const chartOptions = computed<ApexOptions>(() => ({
  labels,
  colors,

  chart: {
    background: 'transparent'
  },

  legend: {
    show: false // usamos resumen lateral
  },

  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${Math.round(val)}%`,
    style: {
      fontSize: '12px',
      fontWeight: '600'
    }
  },

  tooltip: {
    y: {
      formatter: (_: number, { seriesIndex }) =>
        `${attendances.value[seriesIndex]} registros`
    }
  },

  plotOptions: {
  pie: {
    donut: {
      size: '55%',
      labels: {
        show: false 
      }
    }
  }
}
,

  theme: {
    mode: colorMode.value as 'dark' | 'light'
  }
}))
</script>
