<script setup lang="ts">
interface FilterItem {
  label: string
  value: string
}

interface Props {
  loading?: boolean
  statusItems: FilterItem[]
  priorityItems: FilterItem[]
  typeItems: FilterItem[]
  categoryItems: FilterItem[]
}

defineProps<Props>()

const search = defineModel<string>('search', { required: true })
const status = defineModel<string>('status', { required: true })
const priority = defineModel<string>('priority', { required: true })
const type = defineModel<string>('type', { required: true })
const category = defineModel<string>('category', { required: true })

const emit = defineEmits<{
  (e: 'reset'): void
  (e: 'refresh'): void
}>()
</script>

<template>
  <UCard class="border-gray-200/70 dark:border-gray-800/70">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_0.7fr_auto_auto]">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por ticket, titulo, solicitante, area o responsable"
      />

      <USelect v-model="status" :items="statusItems" placeholder="Estado" />
      <USelect v-model="priority" :items="priorityItems" placeholder="Prioridad" />
      <USelect v-model="type" :items="typeItems" placeholder="Tipo" />
      <USelect v-model="category" :items="categoryItems" placeholder="Categoria" />

      <UButton color="neutral" variant="outline" icon="i-lucide-eraser" @click="emit('reset')">
        Limpiar
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-refresh-cw"
        :loading="loading"
        @click="emit('refresh')"
      >
        Actualizar
      </UButton>
    </div>
  </UCard>
</template>
