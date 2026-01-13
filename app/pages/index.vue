<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Reporte Asistencia General" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Usuarios sin asistencia completa" :shortcuts="['N']">
            <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0 animate-ring" />
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
            list: 'flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800',
            item: {
              base: 'px-4 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors focus:outline-none',
              active: 'tab-active-custom text-white dark:bg-white dark:text-black',
              inactive: 'bg-transparent text-gray-600 dark:text-gray-400'
            },
            marker: 'hidden'
          }" />
      </UDashboardToolbar>
      <UDashboardToolbar v-if="currentTabType === ItemType.TECHNICIANS">
        <UTabs :items="employeeItems" class="flex-1 flex justify-center" v-model="currentEmployeeType"
          @update:model-value="(value) => {
            currentEmployeeType = value as EmployeeType
          }" :ui="{
            list: 'flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800',
            item: {
              base: 'px-4 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors focus:outline-none',
              active: 'tab-active-custom text-white dark:bg-white dark:text-black',
              inactive: 'bg-transparent text-gray-600 dark:text-gray-400'
            },
            marker: 'hidden'
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

<style scoped>
@keyframes ring {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-10deg); }
  50% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  70% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-ring {
  animation: ring 2s ease-in-out infinite;
  transform-origin: 50% 0%;
}
</style>
