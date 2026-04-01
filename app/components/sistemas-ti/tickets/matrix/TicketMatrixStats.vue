<script setup lang="ts">
defineProps<{
  stats: {
    total: number
    open: number
    inProgress: number
    resolved: number
    closed: number
    breached: number
  }
}>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
    <UCard class="border-gray-200/70 dark:border-gray-800/70">
      <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        Total
      </p>
      <p class="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">
        {{ stats.total }}
      </p>
    </UCard>

    <UCard class="border-gray-200/70 dark:border-gray-800/70">
      <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        Abiertos
      </p>
      <p class="mt-2 text-2xl font-black text-blue-700 dark:text-blue-300">
        {{ stats.open }}
      </p>
    </UCard>

    <UCard class="border-gray-200/70 dark:border-gray-800/70">
      <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        En progreso
      </p>
      <p class="mt-2 text-2xl font-black text-amber-700 dark:text-amber-300">
        {{ stats.inProgress }}
      </p>
    </UCard>

    <UCard class="border-gray-200/70 dark:border-gray-800/70">
      <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        Resueltos
      </p>
      <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">
        {{ stats.resolved }}
      </p>
    </UCard>

    <UCard class="border-gray-200/70 dark:border-gray-800/70">
      <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        Cerrados
      </p>
      <p class="mt-2 text-2xl font-black text-gray-700 dark:text-gray-300">
        {{ stats.closed }}
      </p>
    </UCard>

    <UCard class="border-gray-200/70 dark:border-gray-800/70">
      <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
        SLA vencido
      </p>
      <p class="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">
        {{ stats.breached }}
      </p>
    </UCard>
  </div>
</template>
