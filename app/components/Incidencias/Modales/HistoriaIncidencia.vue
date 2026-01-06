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
    class="max-w-2xl w-full"
  >
    <template #header>
      <div class="flex items-center gap-3 mb-2">
        <span class="i-heroicons-clipboard-document-list text-2xl text-primary-500" />
        <div>
          <h3 class="text-xl font-bold text-primary-800 leading-tight">Historial de Incidencias</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="i-heroicons-user-circle text-lg text-emerald-500" />
            <span class="text-base font-semibold text-emerald-700">{{ props.historialUser.nombre }} {{ props.historialUser.apellidos }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-8">
        <div class="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span class="i-heroicons-clock text-xl text-blue-400 mb-1" />
          <span class="font-semibold text-blue-900">Bruto</span>
          <span class="text-lg font-mono">{{ props.historialUser.bruto_hhmm }}</span>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span class="i-heroicons-exclamation-circle text-xl text-yellow-400 mb-1" />
          <span class="font-semibold text-yellow-900">Incidencias</span>
          <span class="text-lg font-mono">{{ props.historialUser.incidencias_hhmm }}</span>
        </div>
        <div class="bg-green-50 rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span class="i-heroicons-check-circle text-xl text-green-400 mb-1" />
          <span class="font-semibold text-green-900">Neto</span>
          <span class="text-lg font-mono">{{ props.historialUser.neto_hhmm }}</span>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="(dia, fecha) in props.historialUser.dias"
          :key="fecha"
          class="flex justify-between items-center bg-white border rounded-lg px-4 py-3 shadow-sm hover:bg-gray-50 transition"
        >
          <div>
            <p class="font-semibold text-gray-800">{{ fecha }}</p>
            <p v-if="dia.motivo" class="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span class="i-heroicons-information-circle text-xs text-blue-400" />
              {{ dia.motivo }}
            </p>
          </div>
          <span class="font-mono text-base px-3 py-1 rounded-lg"
            :class="[
              dia.valor === 'F' ? 'bg-pink-100 text-pink-700' :
              dia.valor === 'DM' ? 'bg-yellow-100 text-yellow-700' :
              dia.valor === 'V' ? 'bg-green-100 text-green-700' :
              dia.valor === 'TC' ? 'bg-orange-100 text-orange-700' :
              /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(dia.valor) ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            ]">
            {{ dia.valor }}
          </span>
        </div>
      </div>
    </template>
  </UModal>
</template>
