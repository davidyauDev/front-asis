<template>
  <UCard
    :ui="{
      header: 'px-3 py-2 flex items-center justify-between border-b'
    }"
  >
    <!-- HEADER -->
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-network" class="size-4 text-primary" />
        <span class="font-semibold text-sm">Departamento</span>
      </div>

      <UButton
        v-if="!isError && selecteds.length !== department.list.length"
        icon="i-lucide-rotate-ccw"
        size="xs"
        variant="ghost"
        color="gray"
        class="cursor-pointer"
        @click="handleResertFilter"
      >
        Limpiar
      </UButton>
    </template>

    <!-- BODY -->
    <div
      class="space-y-2 max-h-48 overflow-y-auto pr-1"
      :class="extraClass"
    >
      <DataState
        :loading="loading"
        :error="isError"
        error-message="No se pudo cargar los departamentos"
        @retry="getDepartments(true)"
      >
        <!-- LOADING -->
        <template #loading>
          <div class="flex flex-wrap gap-2">
            <USkeleton
              v-for="_ in 8"
              :key="_"
              class="h-8 w-28 rounded-full"
            />
          </div>
        </template>

        <!-- LIST -->
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="item in list"
            :key="item.id"
            size="xs"
            class="rounded-full transition-all"
            :variant="selecteds.some(s => s.id === item.id) ? 'solid' : 'outline'"
            :color="selecteds.some(s => s.id === item.id) ? 'primary' : 'gray'"
            @click="handleSelectDepartment(item)"
          >
            <UIcon
              v-if="selecteds.some(s => s.id === item.id)"
              name="i-lucide-check"
              class="size-3 mr-1" 
            />
            {{ item.dept_name }}
          </UButton>
        </div>
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

const param = defineModel<number[] | undefined>('param');


const selecteds = computed<Department[]>({
  get() {
    return storeSelecteds.value.length ? storeSelecteds.value : department.value.list
  },

  set(newSelecteds) {
    storeSelecteds.value = newSelecteds
  }
})

const handleSelectDepartment = (departmentItem: Department) => {
  const allSelected =
    selecteds.value.length === department.value.list.length;

  // Primer click: romper "todos"
  if (allSelected) {
    selecteds.value = [departmentItem];
    return;
  }

  const exists = selecteds.value.some(
    s => s.id === departmentItem.id
  );

  if (exists) {
    selecteds.value = selecteds.value.filter(
      s => s.id !== departmentItem.id
    );
  } else {
    selecteds.value = [...selecteds.value, departmentItem];
  }
};





const handleResertFilter = () => {
  selecteds.value = department.value.list
  //param.value = undefined;
}


</script>
