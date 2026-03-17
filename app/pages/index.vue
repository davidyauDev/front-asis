<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
        <template #leading>
          <div class="flex items-center gap-3">
            <UDashboardSidebarCollapse />
            <div class="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div class="hidden sm:flex items-center gap-2">
                <div class="flex flex-wrap items-center gap-3">
                  <h1 class="text-base font-semibold text-gray-900 dark:text-white">
                    Reporte de Asistencia
                  </h1>
                  
                </div>
              </div>
              <h1 class="sm:hidden text-base font-semibold text-gray-900 dark:text-white">
                Reportes
              </h1>
            </div>
          </div>
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <!-- Indicador de sincronización -->
            <UTooltip text="Datos actualizados">
              <div class="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-xs font-medium text-green-700 dark:text-green-400">En vivo</span>
              </div>
            </UTooltip>

            <!-- Notificaciones -->
            <UTooltip text="Usuarios sin asistencia completa" :shortcuts="['N']">
              <UButton 
                color="neutral" 
                variant="ghost" 
                square 
                @click="isNotificationsSlideoverOpen = true" 
                class="relative group"
              >
                <div class="relative">
                  <UIcon name="i-heroicons-bell" class="w-5 h-5 animate-ring text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  
                  <!-- Contador badge -->
                  <div class="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-md border border-white dark:border-gray-900">
                    5
                  </div>
                </div>
              </UButton>
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <nav class="w-full mt-2">
          <div
            class="flex gap-0 border-b-2 border-primary-600 dark:border-primary-500"
            :class="width < 500 ? 'flex-col items-stretch' : 'items-end flex-wrap'"
            role="tablist"
            aria-label="Reporte de asistencia"
          >
            <button
              v-for="(item, idx) in tabItems"
              :key="item.value"
              type="button"
              role="tab"
              :aria-selected="item.value === currentTabType"
              :tabindex="item.value === currentTabType ? 0 : -1"
              @click="currentTabType = item.value"
              class="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded-none first:rounded-tl-md last:rounded-tr-md"
              :class="[
                idx ? '-ml-px' : '',
                item.value === currentTabType
                  ? 'bg-primary-600 text-white border-primary-600 -mb-[2px]'
                  : 'bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800/70'
              ]"
            >
              {{ item.label }}
              <span
                v-if="item.value === ItemType.TODAY"
                class="ml-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tracking-normal normal-case"
                :class="item.value === currentTabType
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100'"
              >
                ({{ fechaFormateada }})
              </span>
            </button>
          </div>
        </nav>
      </UDashboardToolbar>
      <UDashboardToolbar v-if="currentTabType === ItemType.TECHNICIANS">
        <nav class="w-full">
          <div
            class="flex gap-0 border-b-2 border-primary-600 dark:border-primary-500"
            role="tablist"
            aria-label="Tipo de empleado"
          >
            <button
              v-for="(item, idx) in employeeItems"
              :key="item.value"
              type="button"
              role="tab"
              :aria-selected="item.value === currentEmployeeType"
              :tabindex="item.value === currentEmployeeType ? 0 : -1"
              @click="currentEmployeeType = item.value"
              class="px-5 py-2 text-[11px] font-semibold uppercase tracking-wide border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded-none first:rounded-tl-md last:rounded-tr-md"
              :class="[
                idx ? '-ml-px' : '',
                item.value === currentEmployeeType
                  ? 'bg-primary-600 text-white border-primary-600 -mb-[2px]'
                  : 'bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800/70'
              ]"
            >
              {{ item.label }}
            </button>
          </div>
        </nav>
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
import type { DropdownMenuItem } from '@nuxt/ui';

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


const tabItems = [
  {
    label: "Hoy",
    value: ItemType.TODAY
  },
  {
    label: "Reporte Mensual",
    value: ItemType.TECHNICIANS
  }, 
  {
    label: "Administrativos",
    value: ItemType.ADMINISTRATORS
  }
]

const employeeItems = [
  {
    label: "Técnicos",
    value: EmployeeType.TECHNICIANS
  }, 
  {
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
