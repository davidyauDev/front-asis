<script setup lang="ts">
import type { SeguimientoSubTab, SeguimientoTab } from '~/types/seguimiento'

const props = defineProps<{
  source: SeguimientoTab
  modelValue: SeguimientoSubTab
  marcados: number
  noMarcados: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SeguimientoSubTab]
}>()

const model = computed<SeguimientoSubTab>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const items = computed(() => [
  { label: 'Marcaron', value: 'marcaron', badge: props.marcados },
  { label: 'No marcaron', value: 'no-marcaron', badge: props.noMarcados },
] satisfies { label: string; value: SeguimientoSubTab; badge: number }[])

const ariaLabel = computed(() =>
  props.source === 'con-rutas'
    ? 'Subtabs de seguimiento con rutas'
    : 'Subtabs de seguimiento sin rutas',
)
</script>

<template>
  <div class="w-full">
    <AppTabs
      v-model="model"
      :ariaLabel="ariaLabel"
      size="sm"
      :items="items"
    />
  </div>
</template>
