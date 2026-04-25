<script setup lang="ts">
const search = defineModel<string>('search', { required: true })
const fromDate = defineModel<string>('fromDate', { required: true })
const toDate = defineModel<string>('toDate', { required: true })

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  (event: 'filter'): void
  (event: 'clear'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-3 px-5 md:flex-row md:items-center">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Buscar por solicitante o justificacion..."
      class="w-full md:flex-1"
    />

    <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row">
      <UInput v-model="fromDate" type="date" icon="i-lucide-calendar-range" class="w-full md:w-56" />
      <UInput v-model="toDate" type="date" icon="i-lucide-calendar-range" class="w-full md:w-56" />
    </div>

    <div class="flex gap-2">
      <UButton
        color="primary"
        class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]"
        :loading="loading"
        @click="emit('filter')"
      >
        Filtrar
      </UButton>
      <UButton color="neutral" variant="soft" @click="emit('clear')">
        Limpiar
      </UButton>
    </div>
  </div>
</template>
