<template>
    <div class="mx-auto max-w-sm rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">

        <!-- Header -->
        <div class="grid grid-cols-2 bg-black text-white font-bold p-2">
            <div>Tipo</div>
            <div>Total</div>
        </div>

        <!-- Body -->
        <div>
            <div v-for="row in rows" :key="row.label" class="grid grid-cols-2 text-white font-semibold"
                :class="row.color">
                <div class="p-2">{{ row.label }}</div>
                <div class="p-2 text-right">{{ row.value }}</div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore'



interface Row {
    label: string
    value: number
    color: string
}

const store = useAttendanceReportStore();
const { attendance } = storeToRefs(store);

const rows = computed<Row[]>(() => {
    const dailySummary = attendance.value.taken.daily.summary;
    return [
        { label: 'Asistencia', value: dailySummary.asistencias, color: 'bg-blue-700' },
        { label: 'Ausencias', value: dailySummary.ausencias, color: 'bg-gray-400' },
        { label: 'Tardanzas', value: dailySummary.tardanzas, color: 'bg-red-600' },
    ]
})
</script>

<style scoped>
/* Hover opcional */
.grid-cols-2:hover {
    filter: brightness(1.05);
}
</style>
