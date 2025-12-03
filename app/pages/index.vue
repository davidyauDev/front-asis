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
        <UTabs :items="tabItems" :orientation="width < 500 ? 'vertical' : 'horizontal'" class="flex-1 p-3 mx-auto"
          v-model="currentTabType" @update:model-value="(value) => {
            currentTabType = value as ItemType
          }">

        </UTabs>
      </UDashboardToolbar>

      <UDashboardToolbar v-if="currentTabType === ItemType.TECHNICIANS">
        <UTabs :items="employeeItems" :orientation="width < 500 ? 'vertical' : 'horizontal'" variant="link"
          class="flex-1 p-3 mx-auto" v-model="currentEmployeeType" @update:model-value="(value) => {
            currentEmployeeType = value as EmployeeType
          }">

        </UTabs>
      </UDashboardToolbar>

    </template>

    <template #body>

      <ReporteAsistenciasAdministrators v-if="currentTabType === ItemType.ADMINISTRATORS" />

      <Today v-else-if="currentTabType === ItemType.TODAY" />

      <template v-else>
        <div class="flex gap-6 flex-wrap justify-center ">

          <div class="xl:basis-[calc(15%-1.5rem)]">
            <CompanyFilter />
          </div>
          <div class="xl:basis-[calc(55%-1.5rem)]">
            <DateRangePicker />
          </div>

          <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <DepartmentFilter class="max-h-72" />
          </div>

          <div class="sm:basis-[calc(50%-1.5rem)] xl:basis-[calc(15%-1.5rem)]">
            <EmployeeFilter class="max-h-72" />
          </div>

        </div>

        <ReportTable :employee-type="currentEmployeeType" />


      </template>

    </template>

  </UDashboardPanel>
  <NotificationsSlideover />
</template>


<script setup lang="ts">

import { format } from 'date-fns'
import { es } from 'date-fns/locale';

import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period } from '~/types'

import type { TabsItem } from '@nuxt/ui'

import Today from '~/components/reporte-asistencias/today/Today.vue'
import ReporteAsistenciasAdministrators
  from '~/components/reporte-asistencias/Administrators.vue'
import DateRangePicker from '~/components/reporte-asistencias/DateRangePicker.vue';
import CompanyFilter from '~/components/reporte-asistencias/today/CompanyFilter.vue';
import DepartmentFilter from '~/components/reporte-asistencias/today/DepartmentFilter.vue';
import EmployeeFilter from '~/components/reporte-asistencias/today/EmployeeFilter.vue';
import ReportTable from '~/components/reporte-asistencias/ReportTable.vue';
import { EmployeeType } from '~/store/useAttendanceReportStore';

const { width } = useWindowSize();

const { isNotificationsSlideoverOpen } = useDashboard()



enum ItemType {
  TODAY = 'TODAY',
  TECHNICIANS = 'TECHNICIANS',
  ADMINISTRATORS = 'ADMINISTRATORS'
}


const currentTabType = ref<ItemType>(ItemType.TECHNICIANS);

const currentEmployeeType = ref<EmployeeType>(EmployeeType.TECHNICIANS);

const fechaActual = new Date();
const fechaFormateada = format(fechaActual, 'dd MMMM yyyy', {
  locale: es
});

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
    label: "Personal administrativo",
    value: EmployeeType.ADMINISTRATORS
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


const period = ref<Period>('daily')
</script>
