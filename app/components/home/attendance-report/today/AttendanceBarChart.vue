<template>
  <apexchart type="donut" width="380" :options="chartOptions" :series="series" />
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';

const colorMode = useColorMode();

const labels = ['Asistencia', 'Ausencias', 'Tardanzas']
const colors = ['#1447e6', '#99a1af', '#e7000b'];
const series = [20, 30, 50]

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