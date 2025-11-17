<template>
  <UDashboardPanel id="rutas">
    <UDashboardNavbar title="Rutas GPS" />

    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto">
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Panel de filtros - Ocupa 1 columna -->
            <div class="lg:col-span-1">
              <RutasRouteFilters :users="users" :filteredRoutes="filteredRoutes" :selectedRoute="selectedRoute"
                :stats="stats" @selectRoute="handleSelectRoute" @updateFilters="handleUpdateFilters"
                @clearFilters="handleClearFilters" />
            </div>

            <!-- Mapa y detalles - Ocupa 3 columnas -->
            <div class="lg:col-span-3 space-y-6">
              <!-- Mapa -->
              <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                <div class="h-[770px]">
                  <RutasRouteMap :route="selectedRoute" :config="mapConfig" :all-routes="filteredRoutes" />
                </div>
              </div>

              <UCard v-if="selectedRoute">
                <template #header>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-primary" />
                      <div>
                        <h3 class="text-lg font-semibold">Detalles de la Ruta</h3>
                        <p class="text-sm text-gray-500">{{ selectedRoute.user.name }} - {{
                          formatDate(selectedRoute.start_time) }}</p>
                      </div>
                    </div>
                    <UBadge :color="getColorForUser(selectedRoute.user.id)" variant="subtle">
                      {{ selectedRoute.stops.length }} paradas
                    </UBadge>
                  </div>
                </template>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <!-- Distancia -->
                  <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <UIcon name="i-lucide-map" class="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Distancia Total</p>
                      <p class="text-lg font-semibold">{{ selectedRoute.total_distance.toFixed(2) }} km</p>
                    </div>
                  </div>

                  <!-- Duración -->
                  <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <UIcon name="i-lucide-clock" class="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Duración</p>
                      <p class="text-lg font-semibold">{{ formatDuration(selectedRoute.total_duration) }}</p>
                    </div>
                  </div>

                  <!-- Velocidad Promedio -->
                  <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <UIcon name="i-lucide-gauge" class="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Velocidad Promedio</p>
                      <p class="text-lg font-semibold">{{ selectedRoute.average_speed.toFixed(1) }} km/h</p>
                    </div>
                  </div>

                  <!-- Velocidad Máxima -->
                  <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <UIcon name="i-lucide-zap" class="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Velocidad Máxima</p>
                      <p class="text-lg font-semibold">{{ selectedRoute.max_speed.toFixed(1) }} km/h</p>
                    </div>
                  </div>
                </div>

                <!-- Paradas -->

              </UCard>

            </div>
          </div>
        </div>
      </div>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Route, RouteFilters } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const {
  routes,
  users,
  filters,
  filteredRoutes,
  stats,
  selectedRoute,
  selectRoute,
  updateFilters,
  clearFilters,
  mapConfig,
  formatDuration: formatDurationUtil,
  getUserColor
} = useRutas()

// Manejadores de eventos
const handleSelectRoute = (route: Route | null) => {
  if (route) {
    selectRoute(route.id)
  } else {
    selectRoute(null)
  }
}

const handleUpdateFilters = (newFilters: Partial<RouteFilters>) => {
  updateFilters(newFilters)
}

const handleClearFilters = () => {
  clearFilters()
}

// Utilidades de formato
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = formatDurationUtil

const getColorForUser = (userId: number): 'primary' | 'success' | 'warning' => {
  const color = getUserColor(userId)
  // Mapear colores hex a colores de Nuxt UI
  if (color === '#3B82F6') return 'primary'  // blue
  if (color === '#10B981') return 'success'  // green
  return 'warning'  // amber
}
</script>
