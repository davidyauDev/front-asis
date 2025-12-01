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
              <!-- <pre>{{ users }}</pre> -->
              <RutasRouteFilters
                :users="users"
                :filteredRoutes="filteredRoutes"
                :selectedRoute="selectedRoute"
               
                @selected-user="handleSelectedUser"
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
                  <!-- {{ filteredRoutes }} -->
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
import type { Route, RouteFilters, User } from "~/types";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const {
  users,
  filteredRoutes,
  selectedRoute,
  selectedUser,
  selectRoute,
  updateFilters,
  clearFilters,
  mapConfig,
  mapTargetCenter
} = useRutas();

const handleSelectRoute = (route: Route | null) => {
  if (route) {
    selectRoute(route.id);
    mapTargetCenter.value = null;
  } else {
    selectRoute(null);
  }
};

const handleSelectedUser = (user: User | null) => {
  console.log("Selected user in page:", user);
  selectedUser.value = user;
};

const handleUpdateFilters = (newFilters: Partial<RouteFilters>) => {
  updateFilters(newFilters);
};

const handleResetMap = () => {
  console.log("Resetting map center to default");
  const defaultCenter: [number, number] = [-9.189967, -75.015152];
  mapTargetCenter.value = defaultCenter;
//  mapTargetCenter.value = null;
};

const handleClearFilters = () => {
  clearFilters();
  selectedUser.value = null;
};

</script>
