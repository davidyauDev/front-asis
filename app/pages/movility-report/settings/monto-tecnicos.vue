<template>
  <div>
    <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
      <div class="flex border-b border-emerald-600">
        <div class="bg-emerald-600 text-white px-6 py-3 text-sm font-semibold uppercase tracking-wide">
          Monto Técnicos
        </div>
        <div class="flex-1" />
      </div>

      <EmployeeMobilityAdmin />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmployeeMobilityAdmin from '~/components/movility-report/EmployeeMobilityAdmin.vue'

definePageMeta({ middleware: 'auth' })
</script>
