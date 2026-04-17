<script setup lang="ts">
import type { SeguimientoEstadoFiltro, SeguimientoOrden } from '~/types/seguimiento'

const props = defineProps<{
  search: string
  filtroEstado: SeguimientoEstadoFiltro
  ordenarPor: SeguimientoOrden
  fechaSeleccionada: string
  currentListCount: number
  isLoading: boolean
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:filtroEstado': [value: SeguimientoEstadoFiltro]
  'update:ordenarPor': [value: SeguimientoOrden]
  'update:fechaSeleccionada': [value: string]
  'change-date': [value: string]
  reload: []
}>()

const estadoOptions = [
  { label: 'Todos los tecnicos', value: 'todos' },
  { label: 'Con marcacion', value: 'con-marcacion' },
  { label: 'Sin marcacion', value: 'sin-marcacion' },
] satisfies Array<{ label: string; value: SeguimientoEstadoFiltro }>

const orderOptions = [
  { label: 'Orden del sistema', value: 'original' },
  { label: 'Ordenar por nombre', value: 'nombre' },
  { label: 'Mas rutas', value: 'rutas' },
  { label: 'Mas marcaciones', value: 'marcaciones' },
] satisfies Array<{ label: string; value: SeguimientoOrden }>

const todayDate = new Date().toISOString().split('T')[0] || ''
const hasSearch = computed(() => props.search.trim().length > 0)
const hasCustomDate = computed(() =>
  props.fechaSeleccionada.length > 0 && props.fechaSeleccionada !== todayDate,
)



const onFechaChange = (value: string | number) => {
  const normalizedValue = String(value || '')
  emit('update:fechaSeleccionada', normalizedValue)
  emit('change-date', normalizedValue)
}
</script>

<template>
  <div class="border-gray-200/70 px-4 py-4 dark:border-gray-800/70">
    <div class="flex flex-col gap-3">
      <div class="grid gap-3 xl:grid-cols-[minmax(0,1.9fr)_repeat(3,minmax(0,1fr))]">
        <UInput
          :model-value="props.search"
          icon="i-lucide-search"
          size="md"
          autocomplete="off"
          placeholder="Buscar por tecnico, DNI, agencia o cliente..."
          class="w-full"
          :ui="{ base: 'rounded-xl' }"
          @update:model-value="emit('update:search', String($event || ''))"
        />

        <USelect
          :model-value="props.filtroEstado"
          :items="estadoOptions"
          item-label="label"
          item-value="value"
          size="md"
          class="w-full"
          :ui="{ base: 'rounded-xl' }"
          @update:model-value="emit('update:filtroEstado', $event as SeguimientoEstadoFiltro)"
        />

        <USelect
          :model-value="props.ordenarPor"
          :items="orderOptions"
          item-label="label"
          item-value="value"
          size="md"
          class="w-full"
          :ui="{ base: 'rounded-xl' }"
          @update:model-value="emit('update:ordenarPor', $event as SeguimientoOrden)"
        />

        <UInput
          :model-value="props.fechaSeleccionada"
          type="date"
          icon="i-lucide-calendar-days"
          size="md"
          class="w-full"
          :ui="{ base: 'rounded-xl' }"
          @update:model-value="onFechaChange"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          v-if="hasSearch"
          color="primary"
          variant="soft"
          class="rounded-full px-3 py-1"
        >
          Busqueda activa
        </UBadge>
        <UBadge
          v-if="props.filtroEstado !== 'todos'"
          color="warning"
          variant="soft"
          class="rounded-full px-3 py-1"
        >
          Estado filtrado
        </UBadge>
        <UBadge
          v-if="props.ordenarPor !== 'original'"
          color="info"
          variant="soft"
          class="rounded-full px-3 py-1"
        >
          Orden personalizado
        </UBadge>
        <UBadge
          v-if="hasCustomDate"
          color="success"
          variant="soft"
          class="rounded-full px-3 py-1"
        >
          Fecha {{ props.fechaSeleccionada }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
