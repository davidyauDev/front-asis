<template>
    <UCard :ui="{
        header: 'p-2 flex items-center'
    }">
        <template #header>
            Empresa
            <UButton :disabled="selecteds.length === company.list.length" v-if="!company.isError" icon="i-lucide-funnel"
                variant="link" @click="selecteds = company.list" />
        </template>


        <div class="space-y-2 max-h-48 overflow-y-auto flex flex-wrap gap-2">

            <DataState :loading="company.loading" :error="company.isError"
                error-message="No se pudo cargas las empresas" @retry="getCompanies">

                <template #loading>
                    <USkeleton v-for="_ in Array.from({ length: 2 })" class="h-8 w-36" />
                </template>


                <UButton v-for="item in company.list" :key="item.id" class="cursor-pointer" :class="!selecteds.some(s => s.id === item.id) &&
                    'bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-gray-700 border transition'"
                    @click="handleSelectCompany(item)">
                    {{ item.company_name }}
                </UButton>

            </DataState>
        </div>
    </UCard>
</template>


<script setup lang="ts">
import { type Company } from '~/composables/useAttendanceReport'
import DataState from '~/components/common/DataState.vue';
import { EmployeeType, useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const store = useAttendanceReportStore();
const { getCompanies } = store;
const { company, attendance } = storeToRefs(store);

const { employeeType } = defineProps<{
    employeeType?: EmployeeType
}>()

const storeSelecteds = computed<Company[]>({
    get() {
        if (employeeType === EmployeeType.ALL) {
            return company.value.allMonthlySelecteds
        } else if (employeeType === EmployeeType.TECHNICIANS) {

            return company.value.techMonthlySelecteds
        }
        return company.value.dailySelecteds
    },

    set(newSelecteds) {
        if (employeeType === EmployeeType.ALL) {
            return company.value.allMonthlySelecteds = newSelecteds
        } else if (employeeType === EmployeeType.TECHNICIANS) {
            return company.value.techMonthlySelecteds = newSelecteds
        }
        return company.value.dailySelecteds = newSelecteds
    }
})

const selecteds = computed<Company[]>({
    get() {
        // Siempre devolver los seleccionados actuales
        return storeSelecteds.value.length ? storeSelecteds.value : company.value.list
    },

    set(newSelecteds) {
        storeSelecteds.value = newSelecteds
    }
})

const handleSelectCompany = (company: Company) => {
    if (employeeType === EmployeeType.ALL) { } else if (employeeType === EmployeeType.TECHNICIANS) { } else {
        attendance.value.taken.daily.params.empresa_id = company.id;
    }
    
    selecteds.value = selecteds.value.some(s => s.id === company.id)
        ? selecteds.value.filter(s => s.id === company.id) // remover
        : [company]
}



</script>