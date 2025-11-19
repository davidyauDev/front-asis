<template>
  <UDashboardPanel id="rutas">
    <UDashboardNavbar title="Rutas GPS" />
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto">
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div class="lg:col-span-1">
              <RutasRouteFilters
                :users="users"
                :filteredRoutes="filteredRoutes"
                :selectedRoute="selectedRoute"
                @selectRoute="handleSelectRoute"
                @updateFilters="handleUpdateFilters"
                @clearFilters="handleClearFilters"
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

const handleClearFilters = () => {
  clearFilters();
};
</script>
