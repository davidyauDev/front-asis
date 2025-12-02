<template>
    <UDashboardPanel id="asistencias">


        <template #header>

            <UDashboardNavbar title="Reporte de Asistencias" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
            </UDashboardNavbar>

        </template>

        <template #body>



            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div class="lg:border-r border-default lg:col-span-2 lg:pr-6">
                    <ConsultarReporte />
                </div>

                <SeleccionarSemanas />

                <div class="lg:border-l border-default lg:col-span-2 lg:pl-6">
                    <FiltrarEmpleados />
                </div>
            </div>
        

            <TablaReportes />
         
        </template>



    </UDashboardPanel>



</template>

<script setup lang="ts">
import ConsultarReporte from '~/components/reporte-asistencias/ConsultarReporte.vue';
import SeleccionarSemanas from '~/components/reporte-asistencias/SeleccionarSemanas.vue';
import FiltrarEmpleados from '~/components/reporte-asistencias/FiltrarEmpleados.vue';
import TablaReportes from '~/components/reporte-asistencias/TablaReportes.vue';
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const { getCompanies, getDepartments } = useAttendanceReportStore()


onMounted(() => {
    getCompanies();
    getDepartments();
});


</script>