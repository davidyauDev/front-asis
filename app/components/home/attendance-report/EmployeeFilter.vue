<template>
  <UCard
    :ui="{
      header: 'px-3 py-2 flex items-center justify-between border-b'
    }"
  >
    <!-- HEADER -->
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-user" class="size-4 text-[#2d5fc0] dark:text-[#9cb7f5]" />
        <span class="font-semibold text-sm text-[#1d3f7f] dark:text-[#d9e5ff]">Nombres</span>
      </div>

      <UButton
        v-if="!isError && selecteds.length !== employee.list.length"
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
      class="max-h-48 overflow-y-auto flex flex-wrap gap-2 items-start pr-1"
      :class="extraClass"
    >
      <!-- SEARCH -->
      <UInput
        v-model="search"
        size="sm"
        icon="i-lucide-search"
        placeholder="Buscar empleado..."
        class="w-full mb-2"
      />

      <DataState
        :loading="loading"
        :error="isError"
        error-message="No se pudo cargar los empleados"
        @retry="getEmployees()"
      >
        <!-- LOADING -->
        <template #loading>
          <USkeleton
            v-for="_ in 8"
            :key="_"
            class="h-8 w-36 rounded-full"
          />
        </template>

        <!-- LIST -->
        <template v-if="filteredList.length">
          <button
            v-for="item in filteredList"
            :key="item.id"
            @click="handleSelectEmployee(item)"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer',
              'flex items-center gap-1.5',
              selecteds.some(s => s.id === item.id) 
                ? 'bg-[#2d5fc0] text-white border border-[#2d5fc0] shadow-sm ring-2 ring-[#2d5fc0]/15' 
                : 'border border-[#d7e1f5] bg-[#f7faff] text-[#4d6ea8] hover:bg-[#ebf2ff] dark:border-[#314d7d] dark:bg-[#13203a] dark:text-[#c2d2f8] dark:hover:bg-[#1a2c51]'
            ]"
          >
            <UIcon
              v-if="selecteds.some(s => s.id === item.id)"
              name="i-lucide-check"
              class="size-3.5"
            />
            {{ item.first_name }} {{ item.last_name }}
          </button>
        </template>

        <!-- EMPTY -->
        <p
          v-else
          class="w-full text-center text-xs text-muted-foreground py-3"
        >
          No se encontraron empleados
        </p>
      </DataState>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import DataState from '~/components/common/DataState.vue';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';
import type { Employee } from '~/composables/useAttendanceReport';

const store = useAttendanceReportStore();
const { getEmployees } = store;
const { employee } = storeToRefs(store);

const props = defineProps<{
  loading: boolean
  isError: boolean
  list: Employee[]
  class?: string
}>()

const { loading, isError, list, class: extraClass } = toRefs(props)

const storeSelecteds = defineModel<Employee[]>('employee', {
  required: true
});

const param = defineModel<number | undefined>('param');

const search = ref('');

const selecteds = computed<Employee[]>({
  get() {
    return storeSelecteds.value.length
      ? storeSelecteds.value
      : employee.value.list;
  },
  set(newSelecteds) {
    storeSelecteds.value = newSelecteds;
  }
});

const filteredList = computed(() => {
  if (!search.value.trim()) return list.value;

  const term = search.value.toLowerCase();

  return list.value.filter(emp =>
    `${emp.first_name} ${emp.last_name}`
      .toLowerCase()
      .includes(term)
  );
});

const handleSelectEmployee = (employeeItem: Employee) => {
  const allSelected =
    selecteds.value.length === employee.value.list.length;

  if (allSelected) {
    selecteds.value = [employeeItem];
    param.value = employeeItem.id;
    return;
  }

  const exists = selecteds.value.some(
    s => s.id === employeeItem.id
  );

  if (exists) {
    selecteds.value = selecteds.value.filter(
      s => s.id !== employeeItem.id
    );
  } else {
    selecteds.value = [...selecteds.value, employeeItem];
  }

  param.value = employeeItem.id;
};

const handleResertFilter = () => {
  selecteds.value = employee.value.list;
  param.value = undefined;
  search.value = '';
};
</script>
