<template>
    <div class="w-full">
        <VueApexCharts type="scatter" :options="chartOptions" :series="series" height="300" />
    </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'


const colorMode = useColorMode();

// Datos simulados (puedes reemplazarlo con props)
const points = [
    { x: '05:45', y: '05:45:36' },
    { x: '06:05', y: '06:05:26' },
    { x: '06:14', y: '06:14:24' },
    { x: '06:43', y: '06:43:12' },
    { x: '07:40', y: '07:40:48' },
    { x: '08:09', y: '08:09:36' },
]

// Convertimos HH:mm:ss → segundos para graficarlo
const timeToSeconds = (t: string) => {
    const [h = 0, m = 0, s = 0] = t.split(':').map(Number)
    return h * 3600 + m * 60 + s
}

const series = [
    {
        name: 'Horas',
        data: points.map(p => ({
            x: p.x,
            y: timeToSeconds(p.y)
        }))
    }
]



const chartOptions = computed<ApexOptions>(() => ({
    chart: {
        type: 'scatter',
        toolbar: { show: false },
        background: 'transparent'
    },



    colors: ['#2E93fA'],



    yaxis: {
        min: timeToSeconds('05:30:00'),
        max: timeToSeconds('09:00:00'),
        labels: {
            formatter: (value: number) => {
                const h = Math.floor(value / 3600)
                const m = Math.floor((value % 3600) / 60)
                const s = value % 60
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            },

        }
    },

    tooltip: {
        y: {
            formatter: (value) => {
                const h = Math.floor(value / 3600)
                const m = Math.floor((value % 3600) / 60)
                const s = value % 60
                return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            }
        }
    },
    theme: {
        mode: colorMode.value as 'dark' | 'light'
    }
}))
</script>
