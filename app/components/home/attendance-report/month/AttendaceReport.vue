<template>
    <div class="space-y-4">
        <!-- Botón para mostrar/ocultar filtros -->
        <div class="flex items-center justify-between">
            <UButton 
                @click="mostrarFiltros = !mostrarFiltros"
                variant="soft"
                color="gray"
                icon="i-lucide-filter"
                size="sm"
            >
                {{ mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros' }}
                <UIcon :name="mostrarFiltros ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="ml-2" />
            </UButton>
            
            <span v-if="!mostrarFiltros" class="text-xs text-gray-500 dark:text-gray-400">
                Los filtros están ocultos
            </span>
        </div>

        <!-- Panel de filtros con transición -->
        <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <div v-show="mostrarFiltros" class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
                    <!-- Company Filter -->
                    <div class="md:col-span-1 xl:col-span-2">
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Empresa
                        </label>
                        <CompanyFilter 
                            :loading="companyResponse.loading" 
                            :is-error="companyResponse.isError"
                            :list="companyResponse.list" 
                            v-model:company="currentCompanySelected"
                            v-model:param="currentParams.company_id" 
                        />
                    </div>

                    <!-- Department Filter -->
                    <div class="md:col-span-1 xl:col-span-2">
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Departamento
                        </label>
                        <DepartmentFilter 
                            :loading="departmentResponse.loading" 
                            :is-error="departmentResponse.isError"
                            :list="departmentResponse.list" 
                            class="max-h-72" 
                            v-model:department="currentDepartmentSelected"
                            v-model:param="currentParams.department_id" 
                        />
                    </div>

                    <!-- Employee Filter -->
                    <div class="md:col-span-1 xl:col-span-2">
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Empleado
                        </label>
                        <EmployeeFilter 
                            :loading="employeeResponse.loading" 
                            :is-error="employeeResponse.isError"
                            :list="employeeResponse.list" 
                            class="max-h-72" 
                            v-model:employee="currentEmployeeSelected"
                            v-model:param="currentParams.empleado_id" 
                        />
                    </div>

                    <!-- Date Range Picker -->
                    <div class="md:col-span-2 xl:col-span-6">
                        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rango de fechas
                        </label>
                        <DateRangePicker v-model:dates="currentParams.fechas" />
                    </div>
                </div>
            </div>
        </Transition>

        <ReportTable :employee-type="employeeType" />
    </div>
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

const mostrarFiltros = ref(true)

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
        if (!attendance.value.taken.tech.params.department_id) {

            employee.value.tech.list = employee.value.list.filter((dep) => dep.company_id === companyId);
        }
    } else {

        const departmentId = attendance.value.taken.tech.params.department_id;

        if (departmentId) {
            employee.value.tech.list = employee.value.list.filter((dep) => dep.department_id === departmentId);

        } else {
            employee.value.tech.list = employee.value.list

        }

        department.value.tech.list = department.value.list
    }

    attendance.value.taken.tech.pagination.pageIndex = 0;
})

watch(
  () => department.value.tech.selecteds,
  (departments) => {
    const ids = departments.map(d => d.id);
    attendance.value.taken.tech.params.departamento_ids = ids;
    store.attendance.params.departamento_ids = ids;
    if (ids.length) {
      employee.value.tech.list = employee.value.list.filter(emp =>
        ids.includes(emp.department_id)
      );
    } else {
      employee.value.tech.list = employee.value.list;
    }
    getTechTakenAttendances();
    attendance.value.taken.tech.pagination.pageIndex = 0;
  },
  { deep: true, immediate: true }
);

watch(
  () => employee.value.tech.selecteds,
  (empleado_ids) => {
    const ids = empleado_ids.map(d => d.id);
    attendance.value.taken.tech.params.empleado_ids = ids;
    store.attendance.params.empleado_ids = ids;
    getTechTakenAttendances();
    attendance.value.taken.tech.pagination.pageIndex = 0;
  },
  { deep: true, immediate: true }
);

/*
watch(() => attendance.value.taken.tech.params.empleado_id, (employeeId) => {
    getTechTakenAttendances();
    const currEmp = employee.value.list.find((em) => em.id === employeeId);
    if (currEmp) {
        company.value.tech.list = company.value.list.filter((com) => com.id === currEmp.company_id)
        department.value.tech.list = department.value.list.filter((dep) => dep.id === currEmp.department_id);
    } else {
        // company.value.tech.list = company.value.list
        const companyId = attendance.value.taken.tech.params.company_id;
        if (companyId) {
            department.value.tech.list = department.value.list.filter((dep) => dep.company_id === companyId);
            return;
        } else {
            company.value.tech.list = company.value.list
        }

        department.value.tech.list = department.value.list
    }

    attendance.value.taken.tech.pagination.pageIndex = 0;
})*/

 watch(
     () => attendance.value.taken.tech.params.fechas,
     () => {
         getTechTakenAttendances()
         attendance.value.taken.tech.pagination.pageIndex = 0;
     }


 );

watch(
  () => attendance.value.taken.all.params.fechas,
  (fechas) => {
    if (!fechas?.length) return;
    getAllTakenAttendances();
    attendance.value.taken.all.pagination.pageIndex = 0;
  },
  { deep: true }
);



//* ALL
watch(() => attendance.value.taken.all.params.company_id, (companyId) => {
    getAllTakenAttendances()
    if (companyId) {
        department.value.all.list = department.value.list.filter((dep) => dep.company_id === companyId);
        if (!attendance.value.taken.all.params.department_id) {

            employee.value.all.list = employee.value.list.filter((dep) => dep.company_id === companyId);
        }
    } else {
        department.value.all.list = department.value.list
        employee.value.all.list = employee.value.list
    }

    attendance.value.taken.all.pagination.pageIndex = 0;
})


department.value.all.selecteds


watch(() => department.value.all.selecteds , (departments) => {
    const ids = departments.map(d => d.id);
    store.attendance.taken.all.params.departamento_ids = ids;
    if (ids.length) {
      employee.value.all.list = employee.value.list.filter(emp =>
        ids.includes(emp.department_id)
      );
    } else {
      employee.value.all.list = employee.value.list;
    }
    getAllTakenAttendances();

    attendance.value.taken.all.pagination.pageIndex = 0;
}, { deep: true, immediate: true })

watch(() => employee.value.all.selecteds , (empleado_ids) => {
    const ids = empleado_ids.map(d => d.id);
    store.attendance.taken.all.params.empleado_ids = ids;
    getAllTakenAttendances();
    attendance.value.taken.all.pagination.pageIndex = 0;
}, { deep: true, immediate: true })


/*

watch(() => attendance.value.taken.all.params.empleado_id, (employeeId) => {
    getAllTakenAttendances();
    const currEmp = employee.value.list.find((em) => em.id === employeeId);
    if (currEmp) {
        company.value.all.list = company.value.list.filter((com) => com.id === currEmp.company_id)
        department.value.all.list = department.value.list.filter((dep) => dep.id === currEmp.department_id);
    } else {
        // company.value.all.list = company.value.list
        const companyId = attendance.value.taken.all.params.company_id;
        if (companyId) {
            department.value.all.list = department.value.list.filter((dep) => dep.company_id === companyId);
            return;
        }
        department.value.all.list = department.value.list
    }
    attendance.value.taken.all.pagination.pageIndex = 0;
})*/

watch(
    () => attendance.value.taken.tech.params.fechas,
    () => {
        getAllTakenAttendances()
        attendance.value.taken.all.pagination.pageIndex = 0;
    }
);

</script>