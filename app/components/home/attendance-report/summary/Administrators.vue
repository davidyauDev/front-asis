<template>
    <div class="space-y-6">
        <section class="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div class="lg:border-r border-default lg:col-span-2 lg:pr-4">
                    <ConsultarReporte />
                </div>

                <SeleccionarSemanas />

                <div class="lg:border-l border-default lg:col-span-2 lg:pl-4">
                    <FiltrarEmpleados />
                </div>
            </div>
        </section>

        <section class="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
            <AppTabs
                v-model="currentReportType"
                aria-label="Tipo de reporte"
                :items="reportTabs"
            />

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <UInput
                    icon="i-lucide-search"
                    v-model="attendance.globalFilter"
                    class="w-full sm:max-w-md"
                    placeholder="Buscar por nombre, apellido o DNI..."
                />

                <UButton
                    :loading="loading"
                    icon="i-lucide-file-spreadsheet"
                    class="cursor-pointer"
                    @click="handleDownloadExcel"
                >
                    Excel
                </UButton>
            </div>

            <WeeklyReportTable v-if="currentReportType === ReportType.WEEKLY" />
            <DailyReportTable v-else />
        </section>
    </div>
</template>


<script setup lang="ts">
import ConsultarReporte from './ConsultarReporte.vue';
import SeleccionarSemanas from './SeleccionarSemanas.vue';
import FiltrarEmpleados from './FiltrarEmpleados.vue';
import WeeklyReportTable from './WeeklyReportTable.vue'
import DailyReportTable from './DailyReportTable.vue'
import { useAttendanceReport } from '~/composables/useAttendanceReport'
import { ReportType, useAttendanceReportStore } from '~/store/useAttendanceReportStore'

const store = useAttendanceReportStore()
const { attendance } = storeToRefs(store)

const { fetchAttendacesDetails, fetchAttendancesSummary } = useAttendanceReport()

const currentReportType = ref<ReportType>(ReportType.WEEKLY)

const reportTabs = [
    { label: 'Reporte semanal', value: ReportType.WEEKLY },
    { label: 'Detalle diario', value: ReportType.DAYLY },
] as const

watch(currentReportType, (reportType) => {
    attendance.value.type = reportType || ReportType.WEEKLY
})

const loading = ref(false)

const handleDownloadExcel = async () => {
    loading.value = true

    const [params, excel] = [attendance.value.params, 'excel'] as const

    try {
        if (currentReportType.value === ReportType.WEEKLY) {
            await fetchAttendancesSummary(params, excel)
        } else {
            await fetchAttendacesDetails(params, excel)
        }
    } finally {
        loading.value = false
    }
}

</script>
