<template>
    <div class="flex gap-6 flex-wrap justify-center ">
        <div class="xl:basis-[calc(15%-1.5rem)]">
            <CompanyFilter :loading="companyResponse.loading" :is-error="companyResponse.isError"
                :list="companyResponse.list" v-model:company="currentCompanySelected"
                v-model:param="currentParams.company_id" />
        </div>
        <div class="xl:basis-[calc(55%-1.5rem)]">
            <DateRangePicker v-model:date="currentParams.fecha" />
        </div>

        <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <DepartmentFilter :loading="departmentResponse.loading" :is-error="departmentResponse.isError"
                :list="departmentResponse.list" class="max-h-72" v-model:department="currentDepartmentSelected"
                v-model:param="currentParams.department_id" />
        </div>

        <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <EmployeeFilter :loading="employeeResponse.loading" :is-error="employeeResponse.isError"
                :list="employeeResponse.list" class="max-h-72" v-model:employee="currentEmployeeSelected"
                v-model:param="currentParams.empleado_id" />
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
const { getAllTakenAttendances, getTechTakenAttendances } = store;
const { company, department, employee, attendance } = storeToRefs(store);

const { employeeType } = defineProps<{
    employeeType: EmployeeType
}>()

const currentParams = computed(() => {
    if (employeeType === EmployeeType.TECHNICIANS) {
        return attendance.value.taken.tech.params;
    }
    return attendance.value.taken.all.params;
});

const companyResponse = computed(() => {
    if (employeeType === EmployeeType.TECHNICIANS) {
        const employeeCompanies = new Set(
            attendance.value.taken.tech.list.map(e => e.Empresa_id)
        )

        const filteredCompany = company.value.tech.list.filter(
            com => employeeCompanies.has(com.id)
        )

        return {
            loading: company.value.tech.loading,
            isError: company.value.tech.isError,
            list: filteredCompany
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
        const employeeDeparments = new Set(
            attendance.value.taken.tech.list.map(e => e.Departamento_id)
        )

        const filteredDepartments = department.value.tech.list.filter(
            com => employeeDeparments.has(com.id)
        )

        return {
            loading: department.value.tech.loading,
            isError: department.value.tech.isError,
            list: filteredDepartments
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

        const employees = new Set(
            attendance.value.taken.tech.list.map(e => e.Empleado_id)
        )

        const filteredEmployees = employee.value.tech.list.filter(
            com => employees.has(com.id)
        )

        return {
            loading: employee.value.tech.loading,
            isError: employee.value.tech.isError,
            list: filteredEmployees
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
            employee.value.all.selecteds = newSelecteds
        }
    }
})


//* TECH
watch(() => attendance.value.taken.tech.params.company_id, (companyId) => {
    getTechTakenAttendances()
    if (companyId) {
        department.value.tech.list = department.value.list.filter((dep) => dep.company_id === companyId);
        employee.value.tech.list = employee.value.list.filter((dep) => dep.company_id === companyId);
    } else {
        department.value.tech.list = department.value.list
        employee.value.tech.list = employee.value.list
    }
})

watch(() => attendance.value.taken.tech.params.department_id, (departmentId) => {
    getTechTakenAttendances();
    const currDep = department.value.list.find((dep) => dep.id === departmentId);
    if (currDep) {
        company.value.tech.list = company.value.list.filter((com) => com.id === currDep.company_id)
        employee.value.tech.list = employee.value.list.filter((dep) => dep.department_id === currDep.id);
    } else {
        company.value.tech.list = company.value.list
        employee.value.tech.list = employee.value.list
    }
})

watch(() => attendance.value.taken.tech.params.empleado_id, (employeeId) => {
    getTechTakenAttendances();
    const currEmp = employee.value.list.find((em) => em.id === employeeId);
    if (currEmp) {
        company.value.tech.list = company.value.list.filter((com) => com.id === currEmp.company_id)
        department.value.tech.list = department.value.list.filter((dep) => dep.id === currEmp.department_id);
    } else {
        company.value.tech.list = company.value.list
        department.value.tech.list = department.value.list
    }
})

watch(
  () => attendance.value.taken.tech.params.fecha,
  (newFecha, oldFecha) => {
    if (newFecha?.toISOString() === oldFecha?.toISOString()) return;
    getTechTakenAttendances()
  }
);


//* ALL
watch(() => attendance.value.taken.all.params.company_id, (companyId) => {
    getAllTakenAttendances()
    if (companyId) {
        department.value.all.list = department.value.list.filter((dep) => dep.company_id === companyId);
        employee.value.all.list = employee.value.list.filter((dep) => dep.company_id === companyId);
    } else {
        department.value.all.list = department.value.list
        employee.value.all.list = employee.value.list
    }
})

watch(() => attendance.value.taken.all.params.department_id, (departmentId) => {
    getAllTakenAttendances();
    const currDep = department.value.list.find((dep) => dep.id === departmentId);
    if (currDep) {
        company.value.all.list = company.value.list.filter((com) => com.id === currDep.company_id)
        employee.value.all.list = employee.value.list.filter((dep) => dep.department_id === currDep.id);
    } else {
        company.value.all.list = company.value.list
        employee.value.all.list = employee.value.list
    }
})

watch(() => attendance.value.taken.all.params.empleado_id, (employeeId) => {
    getAllTakenAttendances();
    const currEmp = employee.value.list.find((em) => em.id === employeeId);
    if (currEmp) {
        company.value.all.list = company.value.list.filter((com) => com.id === currEmp.company_id)
        department.value.all.list = department.value.list.filter((dep) => dep.id === currEmp.department_id);
    } else {
        company.value.all.list = company.value.list
        department.value.all.list = department.value.list
    }
})

watch(
  () => attendance.value.taken.tech.params.fecha,
  (newFecha, oldFecha) => {
    if (newFecha?.toISOString() === oldFecha?.toISOString()) return;
    getAllTakenAttendances()
  }
);




</script>