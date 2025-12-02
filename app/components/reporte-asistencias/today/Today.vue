<template>

    <div class="max-md:flex-col flex justify-center gap-4">
        <CompanyFilter />
        <DepartmentFilter />
        <EmployeeFilter />

    </div>

    <div class="flex w-full flex-wrap max-sm:justify-center items-center gap-10">
        <div class="lg:w-1/3 justify-center">
            <AttendanceSummary />

        </div>
        <div class="lg:w-1/3 flex items-center justify-center gap-4">

            <AttendanceBarChart />

        </div>
    </div>

    <!-- <HomeChart :range="range" :period="period" /> -->
     <ReportTable />

</template>


<script setup lang="ts">
import { sub } from 'date-fns';
import CompanyFilter from './CompanyFilter.vue';
import DepartmentFilter from './DepartmentFilter.vue';
import EmployeeFilter from './EmployeeFilter.vue';
import AttendanceBarChart from './AttendanceBarChart.vue';
import HomeChart from '~/components/home/HomeChart.client.vue';
import type { Period, Range } from '~/types';
import AttendanceSummary from './AttendanceSummary.vue';
import ReportTable from './ReportTable.vue';


const range = shallowRef<Range>({
    start: sub(new Date(), { days: 14 }),
    end: new Date()
})
const period = ref<Period>('daily')
</script>