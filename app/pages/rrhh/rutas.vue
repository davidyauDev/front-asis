<template>
  <UDashboardPanel id="rutas">
    <template #header>
      <AppDashboardHeader
        title="Rutas GPS"
        mobile-title="Rutas"
        subtitle-icon="i-lucide-map-pinned"
        notification-tooltip="Alertas RRHH"
        notification-attention
        @notification-click="openRrhhNotifications"
      />
    </template>

    <template #body>
      <div class="flex-1 overflow-hidden">
        <div class="h-full overflow-y-auto">
          <div class="p-6">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div class="lg:col-span-1">
                <!-- Resumen de usuarios activos -->
                <div class="mb-4">
                  <div class="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 shadow-sm dark:border-blue-800 dark:bg-blue-900/40">
                    <UIcon name="i-heroicons-user-group" class="h-6 w-6 text-blue-500" />
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

              <div class="space-y-6 lg:col-span-3">
                <div
                  class="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
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
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Route, RouteFilters, User } from "~/types";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const { openNotifications: openRrhhNotifications } = useRrhhNotificationsPanel()

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
