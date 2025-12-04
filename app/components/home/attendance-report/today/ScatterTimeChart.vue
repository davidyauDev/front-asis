<template>
    <div class="w-full">
        <VueApexCharts type="scatter" :options="chartOptions" :series="series" height="300" />
    </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';


const colorMode = useColorMode();

const store = useAttendanceReportStore();
const { attendance } = storeToRefs(store);


const dailyTakenAttendace = computed(() => attendance.value.taken.daily);

const points = computed<{
    x: string,
    y: string
}[]>(() => {
    const list = dailyTakenAttendace.value.list
    return list
        .filter((att) => att.Ingreso)
        .map((att) => ({
            x: att.Ingreso || '',
            y: att.Salida || ''
        }))
})



// Convertimos HH:mm:ss → segundos para graficarlo
const timeToSeconds = (t: string) => {
    const [h = 0, m = 0, s = 0] = t.split(':').map(Number)
    return h * 3600 + m * 60 + s
}

const series = computed(() => [
    {
        name: 'Horas',
        data: points.value.map(p => ({
            x: p.x,
            y: timeToSeconds(p.x)
        }))
    }
])


const maxValue = computed(() => {
  const arr = series.value[0]?.data.map(d => d.y)
  return  Math.max(...arr!)
})



const chartOptions = computed<ApexOptions>(() => ({
    chart: {
        type: 'scatter',
        toolbar: { show: false },
        background: 'transparent'
    },



    colors: ['#2E93fA'],



    yaxis: {
        min: timeToSeconds('05:30:00'),
        max: maxValue.value,
        labels: {
            formatter: (value: number) => {
                value = Math.round(value);
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
