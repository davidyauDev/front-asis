<template>
  <UTabs
    :items="[
      { label: 'Hora Entrada', slot: 'entrada' },
      { label: 'Hora Salida', slot: 'salida' },
      { label: 'Ubicaciones', slot: 'ubicacion' },
      { label: 'Retrasos', slot: 'retrasos' }
    ]"
    class="mt-6"
  >
    <template #entrada>
      <TabHoraEntrada />
    </template>

    <template #salida>
      <TabHoraSalida />
    </template>

    <template #ubicacion>
      <TabUbicaciones />
    </template>

    <template #retrasos>
      <TabRetrasos />
    </template>

  </UTabs>
</template>

<script setup>
import TabHoraEntrada from './TabHoraEntrada.vue'
import TabHoraSalida from './TabHoraSalida.vue'
import TabUbicaciones from './TabUbicaciones.vue'
import TabRetrasos from './TabRetrasos.vue'
</script>
