<template>
    <div class="space-y-4">
        <!-- Panel de filtros -->
            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
                    <!-- Company Filter + Filtros especiales -->
                    <div class="md:col-span-1 xl:col-span-2 space-y-3">
                        <div>
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

                        <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Filtros especiales
                            </label>
                            <UCard
                                :ui="{
                                    header: 'px-3 py-2 flex items-center justify-between border-b'
                                }"
                            >
                                <template #header>
                                    <div class="flex items-center gap-2">
                                        <UIcon name="i-lucide-sparkles" class="size-4 text-primary" />
                                        <span class="font-semibold text-sm">Filtros especiales</span>
                                    </div>
                                </template>

                                <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    <div class="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            @click="applySpecialFilter([155, 64])"
                                            :class="[
                                                'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                                                isSpecialFilterActive([155, 64])
                                                    ? 'bg-primary text-white shadow-md hover:shadow-lg hover:scale-105 ring-2 ring-primary/20'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                                            ]"
                                        >
                                            <UIcon
                                                v-if="isSpecialFilterActive([155, 64])"
                                                name="i-lucide-check"
                                                class="size-3.5"
                                            />
                                            Ingenieros productos
                                        </button>

                                        <button
                                            type="button"
                                            @click="applySpecialFilter([9])"
                                            :class="[
                                                'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                                                isSpecialFilterActive([9])
                                                    ? 'bg-primary text-white shadow-md hover:shadow-lg hover:scale-105 ring-2 ring-primary/20'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                                            ]"
                                        >
                                            <UIcon
                                                v-if="isSpecialFilterActive([9])"
                                                name="i-lucide-check"
                                                class="size-3.5"
                                            />
                                            Ingenieros productos Ydieza
                                        </button>
                                    </div>
                                </div>
                            </UCard>
                        </div>
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
                            :persist-key="`attendance-home-month-${props.employeeType}`"
                            v-model:department="currentDepartmentSelected"
                            v-model:param="currentParams.departamento_ids" 
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

        <ReportTableTodos
          v-if="props.employeeType === EmployeeType.ALL"
          :params="detalleParams"
        />
        <ReportTable
          v-else
          :employee-type="props.employeeType"
        />
    </div>
</template>

<script setup lang="ts">
import { EmployeeType, useAttendanceReportStore } from '~/store/useAttendanceReportStore';
import type { AttendanceParams } from '~/composables/useAttendanceReport'
import CompanyFilter from '../CompanyFilter.vue';
import DateRangePicker from '../DateRangePicker.vue';
import DepartmentFilter from '../DepartmentFilter.vue';
import EmployeeFilter from '../EmployeeFilter.vue';
import ReportTable from './ReportTable.vue';
import ReportTableTodos from './ReportTableTodos.vue'

const store = useAttendanceReportStore();
const { getAttendanceDetails, getTechTakenAttendances } = store;
const { company, department, employee, attendance } = storeToRefs(store);

const props = defineProps<{
  employeeType: EmployeeType
}>()

const technicianDefaultDepartmentIds = [2, 5, 7, 9, 10] as const
const technicianDepartmentIdSet = new Set<number>(technicianDefaultDepartmentIds)

const isReady = ref(false)
const refreshReport = () => {
  if (!isReady.value) return
  if (props.employeeType === EmployeeType.TECHNICIANS) {
    getTechTakenAttendances()
  } else {
    getAttendanceDetails(detalleParams.value)
  }
}

onMounted(async () => {
    await Promise.all([
        store.getCompanies(),
        store.getDepartments(),
        store.getEmployees(),
    ])

    if (props.employeeType === EmployeeType.TECHNICIANS) {
        const normalized = (attendance.value.taken.tech.params.departamento_ids ?? [])
            .filter((id) => technicianDepartmentIdSet.has(id))

        attendance.value.taken.tech.params.departamento_ids = normalized.length
            ? normalized
            : [...technicianDefaultDepartmentIds]

        const selected = department.value.tech.selecteds.filter((d) => technicianDepartmentIdSet.has(d.id))
        department.value.tech.selecteds = selected.length
            ? selected
            : department.value.list.filter((d) => technicianDepartmentIdSet.has(d.id))
    }

    isReady.value = true
    refreshReport()
})

watch(
  () => props.employeeType,
  () => {
    refreshReport()
  }
)

const isSpecialFilterActive = (ids: number[]) => {
    const selecteds = props.employeeType === EmployeeType.TECHNICIANS
        ? employee.value.tech.selecteds
        : employee.value.all.selecteds;
    const selectedIds = selecteds.map(e => e.id);
    if (selectedIds.length !== ids.length) return false;
    const selectedSet = new Set(selectedIds);
    return ids.every(id => selectedSet.has(id));
};

const applySpecialFilter = (ids: number[]) => {
    const selected = employee.value.list.filter(emp =>
        ids.includes(emp.id)
    );

    if (props.employeeType === EmployeeType.TECHNICIANS) {
        if (isSpecialFilterActive(ids)) {
            employee.value.tech.selecteds = [];
        } else {
            employee.value.tech.selecteds = selected;
        }
        return;
    }

    if (isSpecialFilterActive(ids)) {
        employee.value.all.selecteds = [];
    } else {
        employee.value.all.selecteds = selected;
    }
};

const currentParams = computed(() => {
    if (props.employeeType === EmployeeType.TECHNICIANS) {
        return attendance.value.taken.tech.params;
    }
    return attendance.value.taken.all.params;
});

const companyResponse = computed(() => {
    if (props.employeeType === EmployeeType.TECHNICIANS) {
        const employeeCompanies = new Set(
            attendance.value.taken.tech.list.map(e => e.Empresa_id)
        )

        const filteredCompany = company.value.tech.list.filter(
            com => employeeCompanies.has(com.id)
        )

        return {
            loading: company.value.tech.loading || attendance.value.taken.tech.loading,
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
    if (props.employeeType === EmployeeType.TECHNICIANS) {
        return {
            loading: department.value.tech.loading || attendance.value.taken.tech.loading,
            isError: department.value.tech.isError,
            list: department.value.tech.list.filter((dep) => technicianDepartmentIdSet.has(dep.id))
        }
    }

    return {
        loading: department.value.all.loading,
        isError: department.value.all.isError,
        list: department.value.all.list
    }
})

const employeeResponse = computed(() => {
    if (props.employeeType === EmployeeType.TECHNICIANS) {

        const employees = new Set(
            attendance.value.taken.tech.list.map(e => e.Empleado_id)
        )

        const filteredEmployees = employee.value.tech.list.filter(
            com => employees.has(com.id)
        )

        return {
            loading: employee.value.tech.loading || attendance.value.taken.tech.loading,
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
        return props.employeeType === EmployeeType.TECHNICIANS ? company.value.tech.selecteds : company.value.all.selecteds;
    },
    set: (newSelecteds) => {
        if (props.employeeType === EmployeeType.TECHNICIANS) {
            company.value.tech.selecteds = newSelecteds
        } else {
            company.value.all.selecteds = newSelecteds
        }
    }
});

const currentDepartmentSelected = computed<Department[]>({
    get: () => {
        return props.employeeType === EmployeeType.TECHNICIANS ? department.value.tech.selecteds : department.value.all.selecteds
    },
    set: (newSelecteds) => {
        if (props.employeeType === EmployeeType.TECHNICIANS) {
            department.value.tech.selecteds = newSelecteds
        } else {
            department.value.all.selecteds = newSelecteds
        }
    }
})


const currentEmployeeSelected = computed<Employee[]>({
    get: () => {
        return props.employeeType === EmployeeType.TECHNICIANS ? employee.value.tech.selecteds : employee.value.all.selecteds;
    },
    set: (newSelecteds) => {
        if (props.employeeType === EmployeeType.TECHNICIANS) {
            employee.value.tech.selecteds = newSelecteds
        } else {
            employee.value.all.selecteds = newSelecteds
        }
    }
})


const detalleParams = computed<AttendanceParams>(() => {
  const companyId = attendance.value.taken.all.params.company_id
  const empresaIds = companyId
    ? [companyId]
    : (company.value.list.length ? company.value.list.map(c => c.id) : undefined)

  const departamentoIds = attendance.value.taken.all.params.departamento_ids ?? []
  const usuarioIds = attendance.value.taken.all.params.empleado_ids ?? []
  const fechas = attendance.value.taken.all.params.fechas ?? []

  return {
    empresa_ids: empresaIds,
    departamento_ids: departamentoIds.length ? departamentoIds : undefined,
    usuarios: usuarioIds.length ? usuarioIds : undefined,
    fechas: fechas.length ? fechas : undefined,
  }
})

//* TECH
watch(() => attendance.value.taken.tech.params.company_id, (companyId) => {
    if (props.employeeType !== EmployeeType.TECHNICIANS) return
    getTechTakenAttendances()
    if (companyId) {
        department.value.tech.list = department.value.list.filter((dep) => dep.company_id === companyId);
        if (!attendance.value.taken.tech.params.departamento_ids?.length) {

            employee.value.tech.list = employee.value.list.filter((dep) => dep.company_id === companyId);
        }
    } else {

        const departmentIds = attendance.value.taken.tech.params.departamento_ids ?? [];

        if (departmentIds.length) {
            const departmentsSet = new Set(departmentIds);
            employee.value.tech.list = employee.value.list.filter((emp) => departmentsSet.has(emp.department_id));

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
    if (props.employeeType !== EmployeeType.TECHNICIANS) return
    const normalizedIds = departments
      .map(d => d.id)
      .filter((id) => technicianDepartmentIdSet.has(id))

    const ids = normalizedIds.length ? normalizedIds : [...technicianDefaultDepartmentIds]

    if (normalizedIds.length !== departments.length) {
      department.value.tech.selecteds = department.value.list.filter((d) => ids.includes(d.id))
      return
    }

    attendance.value.taken.tech.params.departamento_ids = ids;
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
    if (props.employeeType !== EmployeeType.TECHNICIANS) return
    const ids = empleado_ids.map(d => d.id);
    attendance.value.taken.tech.params.empleado_ids = ids;
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
          if (props.employeeType !== EmployeeType.TECHNICIANS) return
          getTechTakenAttendances()
          attendance.value.taken.tech.pagination.pageIndex = 0;
      }


 );

//* ALL
watch(() => attendance.value.taken.all.params.company_id, (companyId) => {
    if (props.employeeType !== EmployeeType.ALL) return
    getAttendanceDetails(detalleParams.value)
    if (companyId) {
        department.value.all.list = department.value.list.filter((dep) => dep.company_id === companyId);
        if (!attendance.value.taken.all.params.departamento_ids?.length) {

            employee.value.all.list = employee.value.list.filter((dep) => dep.company_id === companyId);
        }
    } else {
        department.value.all.list = department.value.list
        employee.value.all.list = employee.value.list
    }

    attendance.value.taken.all.pagination.pageIndex = 0;
})


watch(() => department.value.all.selecteds , (departments) => {
    if (props.employeeType !== EmployeeType.ALL) return
    const ids = departments.map(d => d.id);
    store.attendance.taken.all.params.departamento_ids = ids;
    if (ids.length) {
      employee.value.all.list = employee.value.list.filter(emp =>
        ids.includes(emp.department_id)
      );
    } else {
      employee.value.all.list = employee.value.list;
    }
    getAttendanceDetails(detalleParams.value);

    attendance.value.taken.all.pagination.pageIndex = 0;
}, { deep: true, immediate: true })

watch(() => employee.value.all.selecteds , (empleado_ids) => {
    if (props.employeeType !== EmployeeType.ALL) return
    const ids = empleado_ids.map(d => d.id);
    store.attendance.taken.all.params.empleado_ids = ids;
    getAttendanceDetails(detalleParams.value);
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
    () => attendance.value.taken.all.params.fechas,
    () => {
        if (props.employeeType !== EmployeeType.ALL) return
        getAttendanceDetails(detalleParams.value)
        attendance.value.taken.all.pagination.pageIndex = 0;
    }
);

</script>
