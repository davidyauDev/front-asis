<template>

    <div class="flex gap-6 flex-wrap justify-center ">

        <div class="xl:basis-[calc(15%-1.5rem)]">
            <CompanyFilter :loading="companyResponse.loading" :is-error="companyResponse.isError"
                :list="companyResponse.list" v-model:company="currentCompanySelected" />
        </div>
        <div class="xl:basis-[calc(55%-1.5rem)]">
            <DateRangePicker />
        </div>

        <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <DepartmentFilter :loading="departmentResponse.loading" :is-error="departmentResponse.isError"
                :list="departmentResponse.list" class="max-h-72" v-model:department="currentDepartmentSelected" />
        </div>

        <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <EmployeeFilter :loading="employeeResponse.loading" :is-error="employeeResponse.isError"
                :list="employeeResponse.list" class="max-h-72" v-model:employee="currentEmployeeSelected" />
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
const { company, department, employee } = storeToRefs(store);

const { employeeType } = defineProps<{
    employeeType: EmployeeType
}>()


const companyResponse = computed(() => {
    if (employeeType === EmployeeType.TECHNICIANS) {
        return {
            loading: company.value.tech.loading,
            isError: company.value.tech.isError,
            list: company.value.tech.list
        }
    }

    return {
        loading: company.value.all.loading,
        isError: company.value.all.isError,
        list: company.value.all.list
    }
})

const departmentResponse = computed(() => {
    if (employeeType === EmployeeType.TECHNICIANS) {
        return {
            loading: department.value.tech.loading,
            isError: department.value.tech.isError,
            list: department.value.tech.list
        }
    }

    return {
        loading: department.value.all.loading,
        isError: department.value.all.isError,
        list: department.value.all.list
    }
})

const employeeResponse = computed(() => {
    if (employeeType === EmployeeType.TECHNICIANS) {
        return {
            loading: employee.value.tech.loading,
            isError: employee.value.tech.isError,
            list: employee.value.tech.list
        }
    }

    return {
        loading: employee.value.all.loading,
        isError: employee.value.all.isError,
        list: employee.value.all.list
    }
})


const currentCompanySelected = computed<Company[]>({
    get: () => {
        return employeeType === EmployeeType.TECHNICIANS ? company.value.tech.selecteds : company.value.all.selecteds;
    },
    set: (newSelecteds) => {
        if (employeeType === EmployeeType.TECHNICIANS) {
            company.value.tech.selecteds = newSelecteds
        } else {
            company.value.all.selecteds = newSelecteds
        }
    }
});

const currentDepartmentSelected = computed<Department[]>({
    get: () => {
        return employeeType === EmployeeType.TECHNICIANS ? department.value.tech.selecteds : department.value.all.selecteds
    },
    set: (newSelecteds) => {
        if (employeeType === EmployeeType.TECHNICIANS) {
            department.value.tech.selecteds = newSelecteds
        } else {
            department.value.all.selecteds = newSelecteds
        }
    }
})


const currentEmployeeSelected = computed<Employee[]>({
    get: () => {
        return employeeType === EmployeeType.TECHNICIANS ? employee.value.tech.selecteds : employee.value.all.selecteds;
    },
    set: (newSelecteds) => {
        if (employeeType === EmployeeType.TECHNICIANS) {
            employee.value.tech.selecteds = newSelecteds
        } else {
            employee.value.tech.selecteds = newSelecteds
        }
    }
})



</script>