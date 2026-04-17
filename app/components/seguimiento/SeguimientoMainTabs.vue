<script setup lang="ts">
import type { SeguimientoTab } from '~/types/seguimiento'

const props = defineProps<{
  modelValue: SeguimientoTab
  tecnicosConRutas: number
  tecnicosSinRutas: number
}>()

const { width } = useWindowSize()
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
  <AppTabs
      v-model="model"
      ariaLabel="Tabs principales de seguimiento"
      :items="items"
       :list-class="width < 500 ? 'flex-col items-stretch' : 'items-end flex-wrap'"
    />
</template>
