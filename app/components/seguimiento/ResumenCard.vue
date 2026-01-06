<template>
  <div :class="['rounded p-4 flex flex-col items-start shadow border', cardColor]">
    <div class="flex items-center gap-2 mb-2">
      <span v-if="icono" :class="['mdi', icono, 'text-2xl']"></span>
      <span class="font-semibold text-lg">{{ valor }}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm font-medium">{{ titulo }}</span>
      <span :class="['badge', badgeColor]">{{ estadoLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  titulo: String,
  valor: [String, Number],
  estado: String, // normal | warning | critical
  icono: String,
})

const estadoLabel = computed(() => {
  if (props.estado === 'normal') return 'Normal'
  if (props.estado === 'warning') return 'Advertencia'
  if (props.estado === 'critical') return 'Crítico'
  return ''
})
const cardColor = computed(() => {
  if (props.estado === 'normal') return 'border-green-200 bg-green-50'
  if (props.estado === 'warning') return 'border-yellow-200 bg-yellow-50'
  if (props.estado === 'critical') return 'border-red-200 bg-red-50'
  return 'border-gray-200 bg-gray-50'
})
const badgeColor = computed(() => {
  if (props.estado === 'normal') return 'bg-green-200 text-green-800'
  if (props.estado === 'warning') return 'bg-yellow-200 text-yellow-800'
  if (props.estado === 'critical') return 'bg-red-200 text-red-800'
  return 'bg-gray-200 text-gray-800'
})
</script>

<style scoped>
.badge {
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
