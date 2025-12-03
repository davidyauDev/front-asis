<template>

    <div class="flex gap-6 flex-wrap justify-center ">

        <div class="xl:basis-[calc(15%-1.5rem)]">
            <CompanyFilter :employee-type="employeeType" />
        </div>
        <div class="xl:basis-[calc(55%-1.5rem)]">
            <DateRangePicker />
        </div>

        <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <DepartmentFilter class="max-h-72" />
        </div>

        <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <EmployeeFilter class="max-h-72" />
        </div>

    </div>

    <ReportTable :employee-type="employeeType" />


</template>

<script setup lang="ts">
import { ItemType, EmployeeType } from '~/store/useAttendanceReportStore';
import CompanyFilter from '../CompanyFilter.vue';
import DateRangePicker from '../DateRangePicker.vue';
import DepartmentFilter from '../DepartmentFilter.vue';
import EmployeeFilter from '../EmployeeFilter.vue';
import ReportTable from './ReportTable.vue';

const { employeeType } = defineProps<{
    employeeType: EmployeeType
}>()
</script>