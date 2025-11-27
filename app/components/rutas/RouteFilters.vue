<script setup lang="ts">
import { getAttendanceOp } from "~/enums/attendance";
import type { Route, RouteFilters, User } from "~/types";

const props = defineProps<{
  users: User[];
  filteredRoutes: Route[];
  selectedRoute: Route | null;
}>();

const emit = defineEmits<{
  selectRoute: [r: Route | null];
  selectedUser: [u: User | null];
  updateFilters: [f: Partial<RouteFilters>];
  clearFilters: [];
  resetMap: [];
}>();


const {
  loading,
} = useRutas();

const selectedUser = ref<User | null>(null);
const today = new Date().toISOString().split("T")[0];
const date = ref(today);


const applyFilters = () => {
  emit("updateFilters", { date: date.value });
}


const clearFilters = () => {
  selectedUser.value = null;

  date.value = today;
  emit("clearFilters");
};

const selectUser = (user: User) => {
  if (selectedUser.value?.id === user.id) {
    selectedUser.value = null;
    emit('selectedUser', null);
    // You might want to emit an event or clear filters based on the selected user here
    return;
  }
  selectedUser.value = user;
  emit('selectedUser', user);
  // You might want to emit an event or filter routes based on the selected user here
};


const listarTodos = () => {
  emit('selectRoute', null);
  emit('selectedUser', null);
  emit('resetMap')
  selectedUser.value = null;
}
</script>

<template>
  <!-- {{ loading }} -->
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
            <label class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Fecha</label>
            <UInput v-model="date" type="date" size="xs" />
          </div>
         
        </div>
        <div class="flex gap-2 pt-1">
          <UButton block @click="applyFilters" icon="i-heroicons-magnifying-glass" size="xs" :loading="loading">Filtrar
          </UButton>
          <UButton block variant="soft" color="neutral" @click="clearFilters" :loading="loading"
            icon="i-heroicons-x-mark" size="xs">
            Limpiar
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            <h3 class="text-sm font-semibold">Rutas</h3>
          </div>
          <div class="flex items-center gap-2">
            <UButton size="xs" color="primary" variant="soft" @click="listarTodos">Listar todos</UButton>
            <UBadge size="xs" color="neutral" variant="subtle">{{ filteredRoutes.length }}</UBadge>
          </div>
        </div>


      </template>
      <div class="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
        <div v-if="users.length === 0" class="text-center py-8 text-gray-400">
          <UIcon name="i-heroicons-inbox" class="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p class="text-xs">Sin rutas disponibles</p>
        </div>


        <div v-else v-for="user in users" :key="user.id" class="p-2.5 rounded-lg cursor-pointer transition-all border"
          :class="{
            'border-blue-400 bg-blue-50 dark:bg-blue-950/40 shadow-sm':
              selectedUser?.id === user.id,
            'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30':
              selectedUser?.id !== user.id,
          }" @click="selectUser(user)">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <!-- :style="{ background: user.color }" -->
              <!-- <div
                class="w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-900"
              ></div> -->
              <UAvatar :name="user.name" :alt="user.name" size="xs" />
              <span class="font-medium text-xs">{{ user.name }}</span>
            </div>



            <UPopover arrow v-if="selectedUser?.id === user.id">
              <!-- <UButton label="Open" color="neutral" variant="subtle" /> -->

              <UButton size="xs" variant="link" color="neutral" class="cursor-pointer" icon="i-lucide-eye" @click="(e) => {
                e.preventDefault();
                e.stopPropagation();

              }">

              </UButton>


              <template #content>
                <div class="p-3 max-w-xs">
                  <h4 class="font-semibold text-sm mb-2">Rutas</h4>
                  <!-- <div v-if="filteredRoutes.filter(r => r.user_id === user.id).length === 0"
                    class="text-center text-gray-400 text-xs">
                    No hay rutas disponibles
                  </div> -->
                  <div class="space-y-2 max-h-60 overflow-y-auto">
                    <!-- @click="$emit('selectRoute', r); $emit('resetMap')" -->
                    <div v-for="r in filteredRoutes.filter(r => r.user_id === user.id)" :key="r.id"
                      @click="$emit('selectRoute', r);"
                      class="p-2.5 rounded-lg cursor-pointer  transition-all border border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/30">


                      <div class="flex items-center gap-5 justify-between mb-1.5">
                        <div class="flex items-center gap-2">
                          <div class="w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-900"
                            :style="{ background: r.color }" />
                          <span class="font-medium text-xs">{{ r.address }}</span>
                        </div>
                        <!-- <span class="text-[10px] text-gray-500 dark:text-gray-400">{{
                          r.user.emp_code
                        }}</span> -->
                        <UBadge size="xs" :color="getAttendanceOp(r.type).color" variant="subtle">
                          {{ getAttendanceOp(r.type).label }}
                        </UBadge>

                      </div>
                      <div class="text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5 ml-4">
                        <div class="flex items-center gap-1">
                          <UIcon name="i-heroicons-calendar-days" class="w-3 h-3" />
                          {{
                            r.date
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </UPopover>
            <!-- <span class="text-[10px] text-gray-500 dark:text-gray-400">{{
              user
            }}</span> -->
          </div>
          <div class="text-[10px] text-gray-500 dark:text-gray-400 space-y-0.5 ml-4">
            <div class="flex items-center gap-1">
              <!-- <UIcon name="i-heroicons-calendar-days" class="w-3 h-3" />
              {{
                r.date
              }} -->
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
