<script setup lang="ts">
interface Props {
  title: string
  description: string
  sourcePage: string
}

defineProps<Props>()
</script>

<template>
  <UDashboardPanel :id="title.toLowerCase().replace(/\s+/g, '-')">
    <template #header>
      <AppDashboardHeader
        :title="title"
        :mobile-title="title"
        :subtitle="description"
        icon="i-lucide-cpu"
        tone="neutral"
        :show-notifications="false"
      />
    </template>

    <template #body>
      <div class="space-y-4">
        <UAlert
          color="warning"
          variant="soft"
          icon="i-lucide-construction"
          title="Migracion inicial completada"
          description="La estructura base del modulo ya esta creada en Nuxt y lista para conectar a endpoints reales."
        />

        <UCard class="border-gray-200/70 dark:border-gray-800/70">
          <div class="space-y-3 p-1">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
              Origen del modulo
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Vista migrada desde <span class="font-mono text-gray-800 dark:text-gray-100">{{ sourcePage }}</span>.
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Si quieres, el siguiente paso es integrar operaciones CRUD y filtros con los mismos contratos del backend de SIGSA-TI.
            </p>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
