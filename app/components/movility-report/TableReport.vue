<template>
  <UTable
    sticky
    :loading="loading"
    :data="movilityReportList"
    :columns="columns"
    class="flex-1 h-[70vh] bg-white"
    :ui="{
  wrapper: 'border border-gray-200 rounded-lg overflow-hidden',
  thead: 'bg-gray-50',
  th: 'px-1 py-0.5 text-[11px] font-medium text-gray-600 whitespace-nowrap align-middle',
  td: 'px-2 py-1 text-xs text-gray-800 whitespace-nowrap align-middle',
  tbody: '[&>tr]:border-b [&>tr]:border-gray-200 [&>tr:hover]:bg-gray-50'
}"

  >
    <template #empty>
      <div
        v-if="error"
        class="w-full flex gap-4 justify-center items-center text-center"
      >
        <Icon name="lucide:alert-triangle" class="text-red-500" size="20" />

        <h2 class="text-sm font-semibold text-red-600">
          No se pudo cargar el reporte de movilidad
        </h2>

        <UButton
          color="error"
          variant="link"
          icon="i-lucide-refresh-cw"
          class="cursor-pointer"
          @click="refresh"
          :loading="loading"
        />
      </div>

      <div v-else class="flex flex-col items-center justify-center p-6">
        <UIcon name="i-lucide-inbox" size="48" class="mb-4 text-gray-400" />
        <p class="text-gray-500">
          No se encontraron registros para los criterios seleccionados.
        </p>
      </div>
    </template>
<template
  v-for="{ day, number, date } in daysFromMonth"
  #[`${date}-header`]
>
  <div
    class="flex flex-col items-center justify-center
           py-0.5 text-[10px]"
    :class="day === 'D' ? 'bg-blue-100 text-blue-700' : ''"
  >
    <span class="leading-none">
      {{ day }}
    </span>
    <span class="font-semibold leading-none">
      {{ number }}
    </span>
  </div>
</template>

    <template #fechaIngreso-cell>
      <span class="text-gray-800"> 28/08/2023 </span>
    </template>
    <template #movilidad-cell>
      <span class="text-green-600 font-medium"> 150 </span>
    </template>
    <template #provincia-cell>
      <span class="text-orange-500 font-medium"> Lambayeque </span>
    </template>
    <template #empresa-cell>
      <span class="text-blue-500 font-medium"> Cechriza SAC </span>
    </template>

    <template
      v-for="{ day, isHoliday, number, date } in daysFromMonth"
      #[`${date}-header`]
    >
      <div
        class="flex p-1 rounded flex-col mx-auto text-xs w-full items-center"
        :class="{
          'bg-red-500/20 border border-red-500/30': isHoliday,
          'bg-blue-500/20 border border-blue-500/30': day === 'D',
        }"
      >
        <span class="text-xs">
          {{ day }}
        </span>
        <span class="text-xs font-medium">
          {{ number }}
        </span>
      </div>
    </template>

    <template
  v-for="{ day, date } in daysFromMonth"
  #[`${date}-cell`]="{ row }"
>
  <div class="flex justify-center items-center">
    <span
      class="w-7 h-7
             flex items-center justify-center
             rounded-md
             text-xs font-bold
             text-white"
      :class="getDayBg(row.original[date]?.code, day)"
    >
      {{ getDayLabel(row.original[date]?.code, day) }}
    </span>
  </div>
</template>

<template
  v-for="{ day, number } in daysFromMonth"
  #[`${date}-header`]
>
  <div
    class="flex flex-col items-center justify-center
           py-1 text-[11px]"
    :class="day === 'D' ? 'bg-blue-100 text-blue-700' : ''"
  >
    <span class="leading-none">
      {{ day }}
    </span>
    <span class="font-semibold leading-none mt-0.5">
      {{ number }}
    </span>
  </div>
</template>

    <template #employee-cell="{ row }">
      <div class="flex items-center gap-3 max-w-fit">
        <UUser
          :name="row.original.employee.last_name"
          :description="row.original.employee.first_name"
        />
        <UButton
          icon="i-lucide-eye"
          variant="link"
          size="sm"
          class="ml-auto cursor-pointer"
          @click="(open = true), $emit('select:movility-report', row.original)"
        />
      </div>
    </template>
  </UTable>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { type Column } from "@tanstack/vue-table";
import { eachDayOfInterval, format } from "date-fns";
import { es, se } from "date-fns/locale";
import { getCodeOp, type MovilityReport } from "~/interfaces/movility-report";

const open = defineModel("open", {
  type: Boolean,
  required: true,
});

const { rangeDate, searchTerm } = defineProps<{
  rangeDate: {
    start: Date;
    end: Date;
  };
  searchTerm: string;
}>();

defineEmits<{
  (e: "select:movility-report", movilityReport: MovilityReport): void;
}>();

const holidays = ref<string[]>();

// const datesArray = eachDayOfInterval(rangeDate);
const currentYear = computed(() => format(rangeDate.start, "yyyy"));
const currentMonth = computed(() => format(rangeDate.start, "MM"));
function getDayLabel(code?: string, day?: string) {
  if (day === 'D') return 'D'
  return code || '✓'
}

function getDayBg(code?: string, day?: string) {
  if (day === 'D') return 'bg-blue-500'
  if (code === 'V') return 'bg-yellow-500'
  if (code === 'DM') return 'bg-red-500'
  if (code === '-') return 'bg-gray-500'
  return 'bg-green-500'
}

const {
  data,
  pending: loading,
  error,
  refresh,
} = await useFetch<MovilityReport[]>("/daily-records/monthly-summary", {
  method: "POST",
  $fetch: useNuxtApp().$api,
  body: computed(() => ({
    year: Number(currentYear.value),
    month: Number(currentMonth.value),
  })),
  default: () => [],

  watch: [currentYear, currentMonth],
});

const movilityReportList = computed<MovilityReport[]>(() => {
  let filtered = data.value;

  if (searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.employee.first_name.toLowerCase().includes(term) ||
        item.employee.last_name.toLowerCase().includes(term) ||
        item.employee.position_name.toLowerCase().includes(term)
    );
  }

  return filtered;
});

const daysFromMonth = computed(() =>
  eachDayOfInterval(rangeDate).map((date) => ({
    date: format(date, "yyyy-MM-dd"),
    day: format(date, "eee", {
      locale: es,
    })
      .toUpperCase()
      .slice(0, 1),
    number: format(date, "dd", {
      locale: es,
    }),
    isHoliday:
      holidays.value?.some((holiday) => {
        const onlyDate = format(date, "yyyy-MM-dd");
        return onlyDate === holiday;
      }) || false,
  }))
);

type Holiday = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
};

watch(
  currentYear,
  async (year) => {
    const res = await $fetch<Holiday[]>(
      `https://date.nager.at/api/v4/PublicHolidays/${year}/PE`
    );
    holidays.value = res.map((d) => d.date);
  },
  {
    immediate: true,
  }
);

const UButton = resolveComponent("UButton");

const columns = computed<TableColumn<MovilityReport>[]>(() => {
  const base: TableColumn<MovilityReport>[] = [
    {
      accessorKey: "employee.id",
      header: "#",
      cell: ({ row }) => row.original.employee.id,
      size: 40,
    },
    {
      accessorKey: "employee",
      header: "Empleado",
      size: 220,
    },
    {
      accessorKey: "employee.department_name",
      header: "Cargo",
    },
    {
      accessorKey: "fechaIngreso",
      header: "F. Ingreso",
      size: 110,
    },
    { accessorKey: "movilidad", header: "Movilidad", size: 110 },
    { accessorKey: "provincia", header: "Provincia", size: 110 },
    { accessorKey: "empresa", header: "Empresa", size: 110 },

    { accessorKey: "summary.total_days", header: "Total", size: 60 },
    { accessorKey: "summary.vacation_days", header: "Vac", size: 60 },
    { accessorKey: "summary.no_mark_days", header: "NM", size: 60 },
    { accessorKey: "summary.days_with_mobility", header: "DM", size: 60 },
  ];

  const dynamicCols = daysFromMonth.value.map(({ day, number, date }) => ({
    accessorKey: date,
    header: `${day} ${number}`,
    size: 42,
  }));

  return [...base.slice(0, 7), ...dynamicCols, ...base.slice(7)];
});

function getHeader(
  column: Column<any>,
  label: string,
  position: "left" | "right"
) {
  const isPinned = column.getIsPinned();

  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label,
    icon: isPinned ? "i-lucide-pin-off" : "i-lucide-pin",
    class: "-mx-2.5",
    onClick() {
      column.pin(isPinned === position ? false : position);
    },
  });
}
</script>
