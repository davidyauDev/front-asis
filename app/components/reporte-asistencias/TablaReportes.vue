<template>
    <div class="flex flex-col flex-1 w-full">
        <div class="flex max-sm:flex-wrap justify-between px-4 py-3.5 gap-2 border-b border-accented">
            <!-- orientation="vertical" -->
            <UTabs :orientation="width < 400 ? 'vertical' : 'horizontal'" v-model="currentReportType!"
                @update:model-value="(value) => {
                    currentReportType = value as ReportType;
                }" :items="[
                    {
                        icon: 'i-lucide-layout-list',
                        label: 'Reporte semanal',
                        value: ReportType.WEEKLY
                    },
                    {
                        icon: 'i-lucide-calendar-days',
                        label: 'Detalle Diario', slot: 'diario',
                        value: ReportType.DAYLY
                    },
                ]">


            </UTabs>
            <div class="flex max-lg:flex-wrap max-sm:justify-end items-center gap-2">
                <UInput icon="i-lucide-search" v-model="attendance.globalFilter" class="max-w-sm"
                    placeholder="Buscar por nombre, apellido o DNI..." />
                <UButton :loading="loading" icon="i-lucide-file-spreadsheet" class="cursor-pointer"
                    @click="handleDownloadExcel">
                    Excel
                </UButton>

            </div>
        </div>

        <WeeklyReportTable v-if="currentReportType === ReportType.WEEKLY" />
        <DailyReportTable v-else-if="currentReportType === ReportType.DAYLY" />

    </div>
</template>

<script setup lang="ts">
import WeeklyReportTable from './WeeklyReportTable.vue'
import DailyReportTable from './DailyReportTable.vue'
import { useAttendanceReport } from '~/composables/useAttendanceReport';
import { ReportType, useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const { width } = useWindowSize()


const store = useAttendanceReportStore()
const { attendance } = storeToRefs(store)

const { fetchAttendacesDetails, fetchAttendancesSummary } = useAttendanceReport();


const currentReportType = ref<ReportType | null | undefined>(ReportType.WEEKLY)


watch(currentReportType, (reportType) => {
    attendance.value.type = reportType || ReportType.WEEKLY
})

const loading = ref(false);

const handleDownloadExcel = async () => {
    loading.value = true;

    const [params, excel] = [attendance.value.params, "excel"];
    try {
        if (currentReportType.value === ReportType.WEEKLY) {
            await fetchAttendancesSummary(params, excel);
        } else {
            await fetchAttendacesDetails(params, excel);
        }

    } finally {
        loading.value = false;
    }

}



</script>
