<script setup lang="ts">
const open = defineModel<boolean>("isOpen");

const props = defineProps<{
  historialUser: any
}>()

</script>


<template>
  <UModal
    v-model:open="open"
    size="lg"
    :close="{ color: 'primary', variant: 'outline', class: 'rounded-full' }"
  >
    <template #header>
      <div>
        <h3 class="text-lg font-semibold">
          Historial de Incidencias
        </h3>
        <p class="text-sm text-gray-500">
          {{ props.historialUser.nombre }}
          {{ props.historialUser.apellidos }}
        </p>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-3 gap-4 text-sm mb-6">
        <div>
          <p class="font-medium">Bruto</p>
          <p>{{ props.historialUser.bruto_hhmm }}</p>
        </div>
        <div>
          <p class="font-medium">Incidencias</p>
          <p>{{ props.historialUser.incidencias_hhmm }}</p>
        </div>
        <div>
          <p class="font-medium">Neto</p>
          <p>{{ props.historialUser.neto_hhmm }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <div
          v-for="(dia, fecha) in props.historialUser.dias"
          :key="fecha"
          class="flex justify-between items-start border-b pb-2"
        >
          <div>
            <p class="font-medium">{{ fecha }}</p>
            <p class="text-xs text-gray-500">
              {{ dia.motivo }}
            </p>
          </div>

          <span class="font-mono text-sm">
            {{ dia.valor }}
          </span>
        </div>
      </div>
    </template>
  </UModal>
</template>
