<template>
  <UDashboardPanel id="rutas">
    <UDashboardNavbar title="Rutas GPS" />
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto">
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div class="lg:col-span-1">
              <!-- Resumen de usuarios activos -->
              <div class="mb-4">
                <div class="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 shadow-sm">
                  <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-blue-500" />
                  <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Usuarios activos</div>
                    <div class="text-lg font-bold text-blue-700 dark:text-blue-200">{{ users.length }}</div>
                  </div>
                </div>
              </div>
              <RutasRouteFilters
                :users="users"
                :filteredRoutes="filteredRoutes"
                :selectedRoute="selectedRoute"
                @selectRoute="handleSelectRoute"
                @updateFilters="handleUpdateFilters"
                @clearFilters="handleClearFilters"
                @resetMap="handleResetMap"
              />
            </div>
            <div class="lg:col-span-3 space-y-6">
              <div
                class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800"
              >
                <div class="h-[770px]">
                  <RutasRouteMap
                    :route="selectedRoute"
                    :config="mapConfig"
                    :all-routes="filteredRoutes"
                    :target-center="mapTargetCenter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Route, RouteFilters } from "~/types";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const {
  users,
  filteredRoutes,
  selectedRoute,
  selectRoute,
  updateFilters,
  clearFilters,
  mapConfig,
  mapTargetCenter
} = useRutas();

const handleSelectRoute = (route: Route | null) => {
  if (route) {
    selectRoute(route.id);
  } else {
    selectRoute(null);
  }
};

const handleUpdateFilters = (newFilters: Partial<RouteFilters>) => {
  updateFilters(newFilters);
};

const handleResetMap = () => {
 mapTargetCenter.value = null;
};

const handleClearFilters = () => {
  clearFilters();
};
</script>
