<template>
    <UCard :ui="{
        header: 'p-2 flex items-center justify-between'
    }">
        <template #header>
            Nombres
            <UButton :disabled="selecteds.length === employee.list.length" v-if="!isError" class="cursor-pointer"
                icon="i-lucide-funnel" variant="link" @click="handleResertFilter" />
        </template>

        <div class="max-h-48 overflow-y-auto flex gap-2  flex-wrap items-center" :class="extraClass">
            

             <DataState :loading="loading" :error="isError"
                error-message="No se pudo cargas las empresas" @retry="getEmployees()">

                <template #loading>
                    <USkeleton v-for="_ in Array.from({ length: 2 })" class="h-8 w-36" />
                </template>


                <UButton
                v-if="list.length"
                v-for="item in list" :key="item.id" class="cursor-pointer" :class="!selecteds.some(s => s.id === item.id) &&
                    'bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-gray-700 border transition'"
                    @click="handleSelectEmployee(item)">
                    {{ item.first_name }}  {{ item.last_name }}
                </UButton>
                <small v-else class="text-center">No se encontraron empleados</small>

            </DataState>
        </div>
    </UCard>
</template>


<script setup lang="ts">
import DataState from '~/components/common/DataState.vue';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const store = useAttendanceReportStore();
const { getEmployees } = store;
const { employee } = storeToRefs(store);

const { loading, isError, list, class: extraClass } = defineProps<{
    loading: boolean,
    isError: boolean,
    list: Employee[],
    class?: string
}>()


const storeSelecteds = defineModel<Employee[]>('employee', {
    required: true
});

const param = defineModel<number | undefined>('param');


const selecteds = computed<Employee[]>({
    get() {
        return storeSelecteds.value.length ? storeSelecteds.value : employee.value.list
    },

    set(newSelecteds) {
        storeSelecteds.value = newSelecteds
    }
})

const handleSelectEmployee = (employee: Employee) => {
    param.value = employee.id;
    selecteds.value = selecteds.value.some(s => s.id === employee.id)
        ? selecteds.value.filter(s => s.id === employee.id) // remover
        : [employee]
}

const handleResertFilter = () => {
    selecteds.value = employee.value.list
    param.value = undefined;
}
</script>