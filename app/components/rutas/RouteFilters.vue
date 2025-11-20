<script setup lang="ts">
import type { Route, RouteFilters, AttendanceUser } from "~/types";

const props = defineProps<{
  users: AttendanceUser[];
  filteredRoutes: Route[];
  selectedRoute: Route | null;
}>();

const emit = defineEmits<{
  selectRoute: [r: Route | null];
  updateFilters: [f: Partial<RouteFilters>];
  clearFilters: [];
}>();

const selectedUser = ref<AttendanceUser | null>(null);
const today = new Date().toISOString().split("T")[0];
const date = ref(today);

const applyFilters = () => {
  emit("updateFilters", { date: date.value });
};

const clearFilters = () => {
  selectedUser.value = null;
  date.value = today;
  emit("clearFilters");
};
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4" />
          <h3 class="font-semibold text-sm">Filtros</h3>
        </div>
      </template>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label
              class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block"
              >Fecha</label
            >
            <UInput v-model="date" type="date" size="xs" />
          </div>
        </div>
        <div class="flex gap-2 pt-1">
          <UButton
            block
            @click="applyFilters"
            icon="i-heroicons-magnifying-glass"
            size="xs"
            >Filtrar</UButton
          >
          <UButton
            block
            variant="soft"
            color="neutral"
            @click="clearFilters"
            icon="i-heroicons-x-mark"
            size="xs"
            >Limpiar</UButton
          >
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            <h3 class="text-sm font-semibold">Rutas</h3>
          </div>
          <UBadge size="xs" color="neutral" variant="subtle">{{
            filteredRoutes.length
          }}</UBadge>
        </div>
      </template>
      <div class="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
        <div
          v-if="filteredRoutes.length === 0"
          class="text-center py-8 text-gray-400"
        >
          <UIcon
            name="i-heroicons-inbox"
            class="w-10 h-10 mx-auto mb-2 opacity-40"
          />
          <p class="text-xs">Sin rutas disponibles</p>
        </div>
        <div
          v-for="r in filteredRoutes"
          :key="r.id"
          class="p-2.5 rounded-lg cursor-pointer transition-all border"
          :class="{
            'border-blue-400 bg-blue-50 dark:bg-blue-950/40 shadow-sm':
              selectedRoute?.id === r.id,
            'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30':
              selectedRoute?.id !== r.id,
          }"
          @click="emit('selectRoute', r)"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-900"
                :style="{ background: r.color }"
              />
              <span class="font-medium text-xs">{{ r.user.name }}</span>
            </div>
            <span class="text-[10px] text-gray-500 dark:text-gray-400">{{
              r.user.emp_code
            }}</span>
          </div>
          <div
            class="text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5 ml-4"
          >
            <div class="flex items-center gap-1">
              <UIcon name="i-heroicons-calendar-days" class="w-3 h-3" />
             {{ r.date }}
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
