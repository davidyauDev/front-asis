<template>
    <div class="max-md:flex-col flex justify-center gap-4">

        <div class="min-w">

            <CompanyFilter :loading="company.daily.loading" :is-error="company.daily.isError" :list="company.daily.list"
                v-model:company="company.daily.selecteds" v-model:param="dailyTakenAttendace.params.company_id" />
        </div>
        <DepartmentFilter :loading="department.daily.loading" :is-error="department.daily.isError"
            :list="department.daily.list" v-model:department="department.daily.selecteds"
            v-model:param="dailyTakenAttendace.params.department_id" />

        <EmployeeFilter class="max-w-2xl min-w-72" :loading="employee.daily.loading" :is-error="employee.daily.isError"
            :list="employee.daily.list" v-model:employee="employee.daily.selecteds"
            v-model:param="dailyTakenAttendace.params.empleado_id" />
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
const { attendance, company, department, employee } = storeToRefs(store);
const { getDailyTakenAttendances } = store;

const dailyTakenAttendace = computed(() => attendance.value.taken.daily);

watch(() => dailyTakenAttendace.value.params.company_id, (companyId) => {
    getDailyTakenAttendances();
    if (companyId) {
        department.value.daily.list = department.value.list.filter((dep) => dep.company_id === companyId);
        employee.value.daily.list = employee.value.list.filter((dep) => dep.company_id === companyId);
    } else {
        department.value.daily.list = department.value.list
        employee.value.daily.list = employee.value.list
    }
})

watch(() => dailyTakenAttendace.value.params.department_id, (departmentId) => {
    getDailyTakenAttendances();
    const currDep = department.value.list.find((dep) => dep.id === departmentId);
    if (currDep) {
        company.value.daily.list = company.value.list.filter((com) => com.id === currDep.company_id)
        employee.value.daily.list = employee.value.list.filter((dep) => dep.department_id === currDep.id);
    } else {
        company.value.daily.list = company.value.list
        employee.value.daily.list = employee.value.list
    }
})

watch(() => dailyTakenAttendace.value.params.empleado_id, (employeeId) => {
    getDailyTakenAttendances();
    const currEmp = employee.value.list.find((em) => em.id === employeeId);
    if (currEmp) {

        company.value.daily.list = company.value.list.filter((com) => com.id === currEmp.company_id)
        department.value.daily.list = department.value.list.filter((dep) => dep.id === currEmp.department_id);
    } else {
        company.value.daily.list = company.value.list
        department.value.daily.list = department.value.list
    }

})




</script>