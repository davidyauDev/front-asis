<template>
  <UDashboardPanel id="home">
    <template #header>
      <AppDashboardHeader
        title="Reporte de Asistencia"
        mobile-title="Reportes"
        :notification-count="5"
        :notification-shortcuts="['N']"
        @notification-click="isNotificationsSlideoverOpen = true"
      />
      <UDashboardToolbar>
        <div class="mt-2 w-full">
          <AppTabs
            v-model="currentTabType"
            ariaLabel="Reporte de asistencia"
            :items="tabItems"
            :list-class="width < 500 ? 'flex-col items-stretch' : 'items-end flex-wrap'"
          />
        </div>
      </UDashboardToolbar>

      <UDashboardToolbar v-if="currentTabType === ItemType.TECHNICIANS">
        <AppTabs
          v-model="currentEmployeeType"
          ariaLabel="Tipo de empleado"
          size="sm"
          :items="employeeItems"
          :list-class="'border-[#2d5fc0]/75 dark:border-[#6f8fda]/80'"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <DailyAttendanceReport v-if="currentTabType === ItemType.TODAY" />
      <MonthlyAttendanceReport
        v-else-if="currentTabType === ItemType.TECHNICIANS"
        :employee-type="currentEmployeeType"
      />
      <ReporteAsistenciasAdministrators v-else="currentTabType === ItemType.ADMINISTRATORS" />
    </template>
  </UDashboardPanel>

  <NotificationsSlideover />
</template>

<script setup lang="ts">

import MonthlyAttendanceReport from '~/components/home/attendance-report/month/AttendaceReport.vue'
import DailyAttendanceReport from '~/components/home/attendance-report/today/Today.vue'
import ReporteAsistenciasAdministrators from '~/components/home/attendance-report/summary/Administrators.vue'
import { EmployeeType, ItemType, useAttendanceReportStore } from '~/store/useAttendanceReportStore'
import { formatToDayMonthYear } from '~/utils/date'

definePageMeta({ middleware: 'auth' })

const { width } = useWindowSize()
const { isNotificationsSlideoverOpen } = useDashboard()

const currentTabType = ref<ItemType>(ItemType.TODAY)
const currentEmployeeType = ref<EmployeeType>(EmployeeType.TECHNICIANS)

const fechaFormateada = formatToDayMonthYear()

const store = useAttendanceReportStore()
const { getCompanies, getDepartments, getTakenAttendances, getEmployees } = store
const { company, department } = storeToRefs(store)

onMounted(async () => {
  try {
    const promises: Promise<any>[] = []
    // Cargar empresas y departamentos solo si no existen
    if (!company.value.list.length && !department.value.list.length) {
      promises.push(
        getCompanies(),
        getDepartments()
      )
    }
    // Siempre cargar estos
    promises.push(
      getEmployees(),
      getTakenAttendances()
    )
    await Promise.all(promises)

  } catch (error) {
    console.error('Error al inicializar el módulo', error)
  }
})


const tabItems = computed(() => [
  {
    label: 'Hoy',
    value: ItemType.TODAY,
    badge: `(${fechaFormateada})`,
  },
  {
    label: 'Reporte Mensual',
    value: ItemType.TECHNICIANS,
  },
  {
    label: 'Administrativos',
    value: ItemType.ADMINISTRATORS,
  },
])

const employeeItems = [
  {
    label: 'Técnicos',
    value: EmployeeType.TECHNICIANS,
  },
  {
    label: 'Todos',
    value: EmployeeType.ALL,
  },
]

</script>
