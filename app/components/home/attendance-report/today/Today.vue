<template>

    {{dailyTakenAttendace.params}}
    <div class="max-md:flex-col flex justify-center gap-4">

        <div class="min-w">

            <CompanyFilter v-model:company="company.dailySelecteds"
                v-model:param="dailyTakenAttendace.params.company_id" />
        </div>
        <DepartmentFilter v-model:department="department.dailySelecteds"
            v-model:param="dailyTakenAttendace.params.department_id" />
        <EmployeeFilter />
    </div>

    <div class="flex w-full max-lg:gap-y-4 flex-wrap justify-center items-center">
        <div class="lg:w-1/3 justify-center">
            <AttendanceSummary />
        </div>
        <div class="lg:w-1/3 flex items-center justify-center gap-4">
            <AttendanceBarChart />
        </div>
        <div class="lg:w-1/3 flex items-center justify-center gap-4">
            <ScatterTimeChart />
        </div>
    </div>

    <ReportTable :taken-attendaces="dailyTakenAttendace.list" />



</template>


<script setup lang="ts">
import AttendanceBarChart from './AttendanceBarChart.vue';
import AttendanceSummary from './AttendanceSummary.vue';
import CompanyFilter from '../CompanyFilter.vue';
import DepartmentFilter from '../DepartmentFilter.vue';
import EmployeeFilter from '../EmployeeFilter.vue';
import ReportTable from './ReportTable.vue';
import ScatterTimeChart from './ScatterTimeChart.vue';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const store = useAttendanceReportStore();
const { attendance, company, department } = storeToRefs(store);
const { getDailyTakenAttendances } = store;

const dailyTakenAttendace = computed(() => attendance.value.taken.daily);

watch(() => dailyTakenAttendace.value.params.company_id, () => {
    getDailyTakenAttendances();
})

watch(() => dailyTakenAttendace.value.params.department_id, () => {
    getDailyTakenAttendances();
})



</script>