<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Inicio" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Usuarios sin asistencia completa" :shortcuts="['N']">
            <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
              <UChip color="error" inset>
                <UIcon name="i-lucide-user-round-x" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UTabs v-model="currentTabType" :items="tabItems" :orientation="width < 500 ? 'vertical' : 'horizontal'"
          class="flex-1 flex justify-center mt-2" :ui="{
            list: `
        flex gap-2 p-1 rounded-xl
        bg-gray-100 dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
      `,
            item: {
              base: `
          px-6 py-2
          text-sm font-semibold
          rounded-lg
          cursor-pointer
          transition-all duration-200 ease-out
          focus:outline-none
          focus-visible:ring-2 focus-visible:ring-green-500
        `,
              active: `
          bg-green-500 text-white
          shadow-md
          scale-[1.02]
        `,
              inactive: `
          text-gray-600 dark:text-gray-400
          hover:bg-white dark:hover:bg-gray-800
          hover:text-gray-800 dark:hover:text-gray-200
          hover:shadow
          hover:-translate-y-[1px]
        `
            },
            marker: 'hidden'
          }" />
      </UDashboardToolbar>





      <UDashboardToolbar v-if="currentTabType === ItemType.TECHNICIANS">
        <UTabs :items="employeeItems" variant="link" class="flex-1 p-3 mx-auto" v-model="currentEmployeeType"
          @update:model-value="(value) => {
            currentEmployeeType = value as EmployeeType
          }">

        </UTabs>
      </UDashboardToolbar>

    </template>

    <template #body>
      <DailyAttendanceReport v-if="currentTabType === ItemType.TODAY" />
      <MonthlyAttendanceReport v-else-if="currentTabType === ItemType.TECHNICIANS"
        :employee-type="currentEmployeeType" />
      <ReporteAsistenciasAdministrators v-else="currentTabType === ItemType.ADMINISTRATORS" />



    </template>

  </UDashboardPanel>
  <NotificationsSlideover />
</template>


<script setup lang="ts">

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { DropdownMenuItem, TabsItem } from '@nuxt/ui';

import MonthlyAttendanceReport from '~/components/home/attendance-report/month/AttendaceReport.vue';
import DailyAttendanceReport from '~/components/home/attendance-report/today/Today.vue';
import ReporteAsistenciasAdministrators from '~/components/home/attendance-report/summary/Administrators.vue';


import { EmployeeType, ItemType, useAttendanceReportStore } from '~/store/useAttendanceReportStore';

definePageMeta({ middleware: "auth" });

const { width } = useWindowSize();

const { isNotificationsSlideoverOpen } = useDashboard()

const currentTabType = ref<ItemType>(ItemType.TODAY);

const currentEmployeeType = ref<EmployeeType>(EmployeeType.TECHNICIANS);

const fechaActual = new Date();
const fechaFormateada = format(fechaActual, 'dd MMMM yyyy', {
  locale: es
});


const store = useAttendanceReportStore();
const { getCompanies, getDepartments, getTakenAttendances, getEmployees } = store;
const { company, department } = storeToRefs(store);

onMounted(
  () => {
    if (!company.value.list.length && !department.value.list.length) {
      getCompanies();
      getDepartments();
    }
  });

onMounted(getEmployees);
onMounted(getTakenAttendances)


const tabItems: TabsItem[] = [
  {
    label: fechaFormateada,
    value: ItemType.TODAY
  },
  {
    label: "Reporte de asistencia",
    value: ItemType.TECHNICIANS,

  }, {
    label: "Reporte de asistencia de administrativos",
    value: ItemType.ADMINISTRATORS
  }
]

const employeeItems: TabsItem[] = [
  {
    label: "Técnicos",
    value: EmployeeType.TECHNICIANS,

  }, {
    label: "Todos",
    value: EmployeeType.ALL
  }
]

const items = [[{
  label: 'New mail',
  icon: 'i-lucide-send',
  to: '/inbox'
}, {
  label: 'New customer',
  icon: 'i-lucide-user-plus',
  to: '/customers'
}]] satisfies DropdownMenuItem[][]
</script>
