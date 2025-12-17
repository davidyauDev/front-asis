<template>
  <UCard
    :ui="{
      header: 'px-3 py-2 flex items-center justify-between border-b'
    }"
  >
    <!-- HEADER -->
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-user" class="size-4 text-primary" />
        <span class="font-semibold text-sm">Nombres</span>
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
      class="max-h-48 overflow-y-auto flex flex-wrap gap-2 items-center pr-1"
      :class="extraClass"
    >
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
        <template v-if="list.length">
          <UButton
            v-for="item in list"
            :key="item.id"
            size="xs"
            class="rounded-full transition-all cursor-pointer"
            :variant="selecteds.some(s => s.id === item.id) ? 'solid' : 'outline'"
            :color="selecteds.some(s => s.id === item.id) ? 'primary' : 'gray'"
            @click="handleSelectEmployee(item)"
          >
            <UIcon
              v-if="selecteds.some(s => s.id === item.id)"
              name="i-lucide-check"
              class="size-3 mr-1"
            />
            {{ item.first_name }} {{ item.last_name }}
          </UButton>
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