<template>
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


<script setup lang="ts">
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';
import ConsultarReporte from './ConsultarReporte.vue';
import SeleccionarSemanas from './SeleccionarSemanas.vue';
import FiltrarEmpleados from './FiltrarEmpleados.vue';
import TablaReportes from './TablaReportes.vue';

const store = useAttendanceReportStore();
const { getCompanies, getDepartments } = store;
const { company, department } = storeToRefs(store);

onMounted(
    () => {
        if (!company.value.list.length && !department.value.list.length) {
            getCompanies();
            getDepartments();
        }
    });


</script>