<template>
  <div class="space-y-4">

    <!-- Título -->
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-calendar" class="text-green-700" />
      <span class="font-semibold text-green-700 text-base">Seleccionar Semanas</span>
    </div>

    <!-- Lista de semanas -->
    <div class="space-y-3">

      <div
        v-for="semana in semanas"
        :key="semana.id"
        class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
              bg-white dark:bg-gray-900
              hover:shadow-sm"
        :class="{
          'border-gray-200': !semana.color,
          'border-orange-400 bg-orange-50': semana.color === 'orange',
          'border-green-400 bg-green-50': semana.color === 'green',
          'border-pink-400 bg-pink-50': semana.color === 'pink',
        }"
      >
        <!-- Checkbox -->
        <UCheckbox :model-value="false" />

        <!-- Indicador de color -->
        <span
          class="w-3 h-3 rounded-full"
          :class="{
            'bg-red-500': semana.color === 'red',
            'bg-orange-400': semana.color === 'orange',
            'bg-green-500': semana.color === 'green',
            'bg-pink-500': semana.color === 'pink',
          }"
        />

        <!-- Texto -->
        <span class="font-medium text-gray-700 dark:text-gray-200">
          {{ semana.label }}
        </span>
      </div>

    </div>

  </div>
</template>

<script setup>
const semanas = [
  { id: 1, label: '1era Semana', color: 'red' },
  { id: 2, label: '2da Semana', color: 'orange' },
  { id: 3, label: '3era Semana', color: 'green' },
  { id: 4, label: '4ta Semana', color: 'pink' }
]
</script>
