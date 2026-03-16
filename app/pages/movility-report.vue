<template>
  <UDashboardPanel id="vacations">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
        <template #leading>
          <div class="flex items-center gap-3">
            <UDashboardSidebarCollapse />
            <div class="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div class="hidden sm:flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <UIcon name="i-heroicons-truck" class="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 class="text-base font-semibold text-gray-900 dark:text-white">
                    Reporte de Movilidad
                  </h1>
                  <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <UIcon name="i-heroicons-map" class="w-3 h-3" />
                    Seguimiento de vehículos
                  </p>
                </div>
              </div>
              <h1 class="sm:hidden text-base font-semibold text-gray-900 dark:text-white">
                Movilidad
              </h1>
            </div>
          </div>
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <!-- Indicador de sincronización -->
            <UTooltip text="Datos actualizados">
              <div class="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-xs font-medium text-green-700 dark:text-green-400">En vivo</span>
              </div>
            </UTooltip>

            <!-- Notificaciones -->
            <UTooltip text="Vehículos con alertas">
              <UButton 
                color="neutral" 
                variant="ghost" 
                square 
                class="relative group"
              >
                <div class="relative">
                  <UIcon name="i-heroicons-bell" class="w-5 h-5 animate-ring text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  
                  <!-- Contador badge -->
                  <div class="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-md border border-white dark:border-gray-900">
                    2
                  </div>
                </div>
              </UButton>
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-2">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<style scoped>
@keyframes ring {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-10deg); }
  50% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  70% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-ring {
  animation: ring 2s ease-in-out infinite;
  transform-origin: 50% 0%;
}
</style>
