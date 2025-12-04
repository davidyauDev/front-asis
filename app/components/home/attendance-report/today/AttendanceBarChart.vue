<template>
  <apexchart type="donut" width="380" :options="chartOptions" :series="series" />
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const colorMode = useColorMode();

const labels = ['Asistencia', 'Ausencias', 'Tardanzas']
const colors = ['#1447e6', '#99a1af', '#e7000b'];
// const series = [20, 30, 50]

const store = useAttendanceReportStore();
const { attendance } = storeToRefs(store);

const series = computed<number[]>(() => {
  const dailySummary = attendance.value.taken.daily.summary;

  const { asistencias, ausencias, tardanzas } = dailySummary;

  const total = asistencias + ausencias + tardanzas;

  if (total === 0) return [0, 0, 0];

  return [
    Math.round((asistencias / total) * 100),
    Math.round((ausencias / total) * 100),
    Math.round((tardanzas / total) * 100),
  ];
});

const attendances = computed<number[]>(() => {
  const dailySummary = attendance.value.taken.daily.summary;

  const { asistencias, ausencias, tardanzas } = dailySummary;
  return [asistencias, ausencias, tardanzas]
})

const chartOptions = computed<ApexOptions>(() => ({
  labels,
  colors,
  legend: {
    position: 'right',
  },
  chart: {
    background: 'transparent'
  },
  dataLabels: {
    enabled: true,
    formatter: (value: number) => `${Math.round(value)}%`,
  },
  tooltip: {
    y: {
      formatter: (_: number, { seriesIndex, w }) => {
        const realValue = attendances.value[seriesIndex] 
        return realValue?.toString() || '' 
      }
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '40%',
      }
    }
  },
  theme: {
    mode: colorMode.value as 'dark' | 'light'
  }
}))
</script>