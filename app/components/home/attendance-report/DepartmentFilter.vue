<template>
  <UCard :ui="{
    header: 'p-2 flex items-center justify-between'
  }">
    <template #header>
      Departmento
      <UButton :disabled="selecteds.length === department.list.length" v-if="!isError" class="cursor-pointer"
        icon="i-lucide-funnel" variant="link" @click="handleResertFilter" />
    </template>
    <div class="flex flex-wrap max-h-48 overflow-y-auto gap-2" :class="extraClass">
      <DataState :loading="loading" :error="isError"
        error-message="No se pudo cargas los departamentos" @retry="getDepartments(true)">

        <template #loading>
          <USkeleton v-for="_ in Array.from({ length: 14 })" class="h-8 w-32" />
        </template>

        <UButton v-for="item in list" :key="item.id" class="cursor-pointer" :class="!selecteds.some(s => s.id === item.id) &&
          'bg-gray-100 dark:bg-gray-800 dark:text-gray-100 text-gray-700 border transition'"
          @click="handleSelectDepartment(item)">
          {{ item.dept_name }}
        </UButton>


      </DataState>
    </div>
  </UCard>
</template>

<script setup lang="ts">

import DataState from '~/components/common/DataState.vue';
import { type Department } from '~/composables/useAttendanceReport';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';


const store = useAttendanceReportStore();
const { getDepartments } = store;
const { department } = storeToRefs(store);


const { loading, isError, list, class: extraClass } = defineProps<{
    loading: boolean,
    isError: boolean,
    list: Department[],
    class?: string
}>()


const storeSelecteds = defineModel<Department[]>('department', {
  required: true
});

const param = defineModel<number | undefined>('param');


const selecteds = computed<Department[]>({
  get() {
    return storeSelecteds.value.length ? storeSelecteds.value : department.value.list
  },

  set(newSelecteds) {
    storeSelecteds.value = newSelecteds
  }
})

const handleSelectDepartment = (department: Department) => {
  param.value = department.id;
  selecteds.value = selecteds.value.some(s => s.id === department.id)
    ? selecteds.value.filter(s => s.id === department.id) // remover
    : [department]
}

const handleResertFilter = () => {
  selecteds.value = department.value.list
  param.value = undefined;
}


</script>
