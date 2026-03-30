<template>
  <UDashboardPanel id="asistencias">
    <template #header>
      <AppDashboardHeader
        title="Reporte de Asistencias"
        :show-live-badge="false"
        :show-notifications="false"
      />
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div class="border-default lg:col-span-2 lg:border-r lg:pr-6">
          <ConsultarReporte />
        </div>

        <SeleccionarSemanas />

        <div class="border-default lg:col-span-2 lg:border-l lg:pl-6">
          <FiltrarEmpleados />
        </div>
      </div>

      <TablaReportes />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import ConsultarReporte from '~/components/reporte-asistencias/ConsultarReporte.vue'
import SeleccionarSemanas from '~/components/reporte-asistencias/SeleccionarSemanas.vue'
import FiltrarEmpleados from '~/components/reporte-asistencias/FiltrarEmpleados.vue'
import TablaReportes from '~/components/reporte-asistencias/TablaReportes.vue'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore'

const { getCompanies, getDepartments } = useAttendanceReportStore()

onMounted(() => {
  getCompanies()
  getDepartments()
})
</script>
