<script setup lang="ts">
import type { SeguimientoSubTab, SeguimientoTab } from '~/types/seguimiento'

const props = defineProps<{
  tabActivo: SeguimientoTab
  subTabConRutas: SeguimientoSubTab
  subTabSinRutas: SeguimientoSubTab
  tecnicosConRutas: number
  tecnicosSinRutas: number
  conRutasMarcados: number
  conRutasNoMarcados: number
  sinRutasMarcados: number
  sinRutasNoMarcados: number
}>()

const emit = defineEmits<{
  'update:tabActivo': [value: SeguimientoTab]
  'update:subTabConRutas': [value: SeguimientoSubTab]
  'update:subTabSinRutas': [value: SeguimientoSubTab]
}>()

const mainTab = computed<SeguimientoTab>({
  get: () => props.tabActivo,
  set: (value) => emit('update:tabActivo', value),
})

const conRutasTab = computed<SeguimientoSubTab>({
  get: () => props.subTabConRutas,
  set: (value) => emit('update:subTabConRutas', value),
})

const sinRutasTab = computed<SeguimientoSubTab>({
  get: () => props.subTabSinRutas,
  set: (value) => emit('update:subTabSinRutas', value),
})

const mainItems = computed(() => [
  { label: 'Con Rutas', value: 'con-rutas', badge: props.tecnicosConRutas },
  { label: 'Sin Rutas', value: 'sin-rutas', badge: props.tecnicosSinRutas },
] satisfies { label: string; value: SeguimientoTab; badge: number }[])

const conRutasItems = computed(() => [
  { label: 'Marcaron', value: 'marcaron', badge: props.conRutasMarcados },
  { label: 'No marcaron', value: 'no-marcaron', badge: props.conRutasNoMarcados },
] satisfies { label: string; value: SeguimientoSubTab; badge: number }[])

const sinRutasItems = computed(() => [
  { label: 'Marcaron', value: 'marcaron', badge: props.sinRutasMarcados },
  { label: 'No marcaron', value: 'no-marcaron', badge: props.sinRutasNoMarcados },
] satisfies { label: string; value: SeguimientoSubTab; badge: number }[])
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-hidden rounded-t-lg border border-gray-200 border-b-0 bg-white dark:border-gray-800 dark:bg-gray-950">
      <AppTabs
        v-model="mainTab"
        aria-label="Tabs de seguimiento"
        :items="mainItems"
      />
    </div>

    <div
      class="overflow-hidden rounded-t-lg border border-gray-200 border-b-0 bg-white dark:border-gray-800 dark:bg-gray-950"
    >
      <AppTabs
        v-if="tabActivo === 'con-rutas'"
        v-model="conRutasTab"
        aria-label="Subtabs de seguimiento con rutas"
        size="sm"
        :items="conRutasItems"
      />

      <AppTabs
        v-else
        v-model="sinRutasTab"
        aria-label="Subtabs de seguimiento sin rutas"
        size="sm"
        :items="sinRutasItems"
      />
    </div>
  </div>
</template>
