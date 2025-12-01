<template>
    <div class="flex flex-col flex-1 w-full">
        <div class="flex max-sm:flex-wrap justify-between px-4 py-3.5 gap-2 border-b border-accented">
            <!-- orientation="vertical" -->
            <UTabs :orientation="width < 400 ? 'vertical' : 'horizontal'" v-model="currentReportType"
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
                <UInput icon="i-lucide-search" v-model="globalFilter" class="max-w-sm"
                    placeholder="Buscar por nombre, apellido o DNI..." />
                <UButton icon="i-lucide-file-spreadsheet" class="cursor-pointer">
                    Excel
                </UButton>

                <UButton icon="i-lucide-download" class="cursor-pointer">
                    PDF
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
import { ReportType, useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const { width } = useWindowSize()

const store = useAttendanceReportStore()
// const { getEmployeesByDepartment, getAttendanceSummaryParams } = store;
const { attendance } = storeToRefs(store)


const currentReportType = ref<ReportType | null | undefined>(ReportType.WEEKLY)


watch(currentReportType, (reportType) => {
    attendance.value.type = reportType || ReportType.WEEKLY
})


const globalFilter = ref('')
</script>
