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
import ConsultarReporte from './ConsultarReporte.vue';
import SeleccionarSemanas from './SeleccionarSemanas.vue';
import FiltrarEmpleados from './FiltrarEmpleados.vue';
import TablaReportes from './TablaReportes.vue';

</script>