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

        <UTabs :items="tabItems" :orientation="width < 500 ? 'vertical' : 'horizontal'"
         
        class="flex-1 p-3 mx-auto" v-model="currentTabType" @update:model-value="(value) => {
          currentTabType = value as ItemType
        }">

        </UTabs>



      </UDashboardToolbar>

      <!-- <UDashboardToolbar v-if="currentTabType === ItemType.TECHNICIANS">
        <template #left>
          
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar> -->
    </template>

    <template #body>

      <ReporteAsistenciasAdministrators v-if="currentTabType === ItemType.ADMINISTRATORS" />

      <Today v-else-if="currentTabType === ItemType.TODAY" />


      <!-- <HomeStats :period="period" :range="range" />
      <HomeChart :period="period" :range="range" /> -->
      <!-- <HomeSales :period="period" :range="range" /> -->
    </template>

  </UDashboardPanel>
  <NotificationsSlideover />
</template>


<script setup lang="ts">

import { sub, format } from 'date-fns'
import { es } from 'date-fns/locale';

import type { DropdownMenuItem } from '@nuxt/ui'
import type { Period, Range } from '~/types'

import type { TabsItem } from '@nuxt/ui'

import Today from '~/components/reporte-asistencias/today/Today.vue'
import ReporteAsistenciasAdministrators
  from '~/components/reporte-asistencias/Administrators.vue'


  const { width } = useWindowSize();

const { isNotificationsSlideoverOpen } = useDashboard()



enum ItemType {
  TODAY = 'TODAY',
  TECHNICIANS = 'TECHNICIANS',
  ADMINISTRATORS = 'ADMINISTRATORS'
}

const currentTabType = ref<ItemType>(ItemType.TODAY);

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
    label: "Reporte de asistencia de técnicos",
    value: ItemType.TECHNICIANS,

  }, {
    label: "Reporte de asistencia de administrativos",
    value: ItemType.ADMINISTRATORS
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

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')
</script>
