<template>

    <div class="max-md:flex-col flex justify-center gap-4">
        <CompanyFilter />
        <DepartmentFilter />
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

    <ReportTable />

</template>


<script setup lang="ts">
import AttendanceBarChart from './AttendanceBarChart.vue';
import AttendanceSummary from './AttendanceSummary.vue';
import CompanyFilter from './CompanyFilter.vue';
import DepartmentFilter from './DepartmentFilter.vue';
import EmployeeFilter from './EmployeeFilter.vue';
import ReportTable from './ReportTable.vue';
import ScatterTimeChart from './ScatterTimeChart.vue';
</script>