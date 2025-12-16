``<template>
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
                    <USkeleton v-for="_ in Array.from({ length: 10 })" class="h-8 w-36" />
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

const handleSelectEmployee = (employeeItem: Employee) => {
  // 1️⃣ Detectar estado inicial (todos seleccionados)
  const allSelected =
    selecteds.value.length === employee.value.list.length;

  // Primer click: romper "todos"
  if (allSelected) {
    selecteds.value = [employeeItem];
    param.value = employeeItem.id;
    return;
  }

  // 2️⃣ Multiselección normal
  const exists = selecteds.value.some(
    s => s.id === employeeItem.id
  );

  if (exists) {
    // quitar solo el clickeado
    selecteds.value = selecteds.value.filter(
      s => s.id !== employeeItem.id
    );
  } else {
    // agregar sin perder los demás
    selecteds.value = [...selecteds.value, employeeItem];
  }

  // opcional: último clickeado
  param.value = employeeItem.id;
};


const handleResertFilter = () => {
    selecteds.value = employee.value.list
    param.value = undefined;
}
</script>