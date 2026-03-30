<script setup lang="ts">
import type { SeguimientoTab } from '~/types/seguimiento'

const props = defineProps<{
  modelValue: SeguimientoTab
  tecnicosConRutas: number
  tecnicosSinRutas: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SeguimientoTab]
}>()

const model = computed<SeguimientoTab>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const items = computed(() => [
  { label: 'Con rutas', value: 'con-rutas', badge: props.tecnicosConRutas },
  { label: 'Sin rutas', value: 'sin-rutas', badge: props.tecnicosSinRutas },
] satisfies { label: string; value: SeguimientoTab; badge: number }[])
</script>

<template>
  <div class="overflow-hidden rounded-t-lg border border-gray-200 border-b-0 bg-white dark:border-gray-800 dark:bg-gray-950">
    <AppTabs
      v-model="model"
      ariaLabel="Tabs principales de seguimiento"
      :items="items"
    />
  </div>
</template>
