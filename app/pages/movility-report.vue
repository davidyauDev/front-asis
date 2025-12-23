<template>
  <UDashboardPanel id="vacations">
    <template #header>
      <UDashboardNavbar title="Movilidad" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
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
