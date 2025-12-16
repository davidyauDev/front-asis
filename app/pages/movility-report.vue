<template>
  <UDashboardPanel id="vacations">
    <template #header>
      <UDashboardNavbar title="Vacaciones" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <!-- HEADER -->
        <div class="flex items-center justify-end mb-6">
          <UButton icon="i-heroicons-arrow-down-tray" color="primary">
            Exportar
          </UButton>
        </div>

        <!-- FILTROS -->
        <div class="flex items-center justify-between mb-4">
          <PickMonth v-model="modelValue" />

          <div class="flex gap-2">
            <UInput
              v-model="searchTerm"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar empleado..."
              class="w-64"
            />

            <!-- <USelect :items="['Todos', 'Cechriza SAC', 'Otra Empresa']" class="w-48" /> -->
            <DataState
              :loading="department.loading"
              :error="department.isError"
              error-message="No se pudo cargar los departamentos"
              @retry="getDepartments(true)"
            >
              <template #loading>
                <USkeleton class="h-8 w-48" />
              </template>

              <USelect
                v-model="departmentSelectedId"
                v-if="department.list.length"
                :items="departments"
                class="w-48"
                placeholder="Filtrar por departamento"
                label-key="label"
                value-key="value"
              />
            </DataState>
          </div>
        </div>

        <UCard
          class="mb-4"
          :ui="{
            body: 'flex items-center gap-6 px-5 py-3',
          }"
        >
          <!-- TÍTULO -->
          <span class="text-sm font-medium text-gray-600"> Leyenda: </span>

          <!-- ITEMS -->
          <div class="flex items-center gap-4 flex-wrap">
            <div
              v-for="item in movilityReportCodeOp"
              :key="item.value"
              class="flex items-center gap-2"
            >
              <UBadge
                class="w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-md"
                :class="item.bg"
              >
                {{ item.value }}
              </UBadge>

              <span class="text-sm text-gray-700">
                {{ item.label }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- TABLA -->
        <TableReport
          :range-date="rangeDate"
          v-model:open="openDetailModal"
          :search-term="searchTerm"
          @select:movility-report="
            (selectedMovilityReport = $event), (openDetailModal = true)
          "
        />

        <DetailModal
          v-model:open="openDetailModal"
          :range-date="modelValue"
          :selected-movility-report="selectedMovilityReport"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { endOfMonth, startOfMonth } from "date-fns";
import DataState from "~/components/common/DataState.vue";
import DetailModal from "~/components/movility-report/DetailModal.vue";
import PickMonth from "~/components/movility-report/PickMonth.vue";
import TableReport from "~/components/movility-report/TableReport.vue";
import { useAttendanceReportStore } from "~/store/useAttendanceReportStore";
import { type Department } from "~/composables/useAttendanceReport";
import {
  movilityReportCodeOp,
  type MovilityReport,
} from "~/interfaces/movility-report";

definePageMeta({ middleware: "auth" });

const store = useAttendanceReportStore();
const { getDepartments } = store;
const { department } = storeToRefs(store);

const openDetailModal = ref(false);

const selectedMovilityReport = ref<null | MovilityReport>(null);

const modelValue = shallowRef({
  start: toCalendarDate(startOfMonth(new Date())),
  end: toCalendarDate(endOfMonth(new Date())),
});

const searchTerm = ref("");

const departmentSelectedId = ref<number | undefined>(undefined);

const departmentSelected = computed<Department | null>(() => {
  if (!departmentSelectedId.value) return null;
  return (
    department.value.list.find(
      (dep) => dep.id === departmentSelectedId.value
    ) || null
  );
});

const departments = computed<
  {
    label: string;
    value: number;
  }[]
>(() => [
  {
    label: "Todos",
    value: 0,
  },
  ...department.value.list.map((dep) => ({
    label: dep.dept_name,
    value: dep.id,
  })),
]);

const rangeDate = computed(() => ({
  start: fromCalToDate(modelValue.value.start),
  end: fromCalToDate(modelValue.value.end),
}));

onMounted(getDepartments);
</script>
