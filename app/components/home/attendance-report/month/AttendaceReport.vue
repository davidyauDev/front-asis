<template>

    <div class="flex gap-6 flex-wrap justify-center ">

        <div class="xl:basis-[calc(15%-1.5rem)]">
            <CompanyFilter v-model:company="currentCompanySelected" />
        </div>
        <div class="xl:basis-[calc(55%-1.5rem)]">
            <DateRangePicker />
        </div>

        <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <DepartmentFilter class="max-h-72" v-model:department="currentDepartmentSelected" />
        </div>

        <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <EmployeeFilter class="max-h-72" />
        </div>

    </div>

    <ReportTable :employee-type="employeeType" />


</template>

<script setup lang="ts">
import { EmployeeType, useAttendanceReportStore } from '~/store/useAttendanceReportStore';
import CompanyFilter from '../CompanyFilter.vue';
import DateRangePicker from '../DateRangePicker.vue';
import DepartmentFilter from '../DepartmentFilter.vue';
import EmployeeFilter from '../EmployeeFilter.vue';
import ReportTable from './ReportTable.vue';

const store = useAttendanceReportStore();
const { company, department } = storeToRefs(store);

const { employeeType } = defineProps<{
    employeeType: EmployeeType
}>()


const currentCompanySelected = computed<Company[]>({
    get: () => {
        return employeeType === EmployeeType.TECHNICIANS ? company.value.techMonthlySelecteds : company.value.allMonthlySelecteds;
    },
    set: (newSelecteds) => {
        if (employeeType === EmployeeType.TECHNICIANS) {
            company.value.techMonthlySelecteds = newSelecteds
        } else {
            company.value.allMonthlySelecteds = newSelecteds
        }
    }
});

const currentDepartmentSelected = computed<Department[]>({
    get: () => {
        return employeeType === EmployeeType.TECHNICIANS ? department.value.techMonthlySelecteds : department.value.allMonthlySelecteds;
    },
    set: (newSelecteds) => {
        if (employeeType === EmployeeType.TECHNICIANS) {
            department.value.techMonthlySelecteds = newSelecteds
        } else {
            department.value.allMonthlySelecteds = newSelecteds
        }
    }
})

</script>