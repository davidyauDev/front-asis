<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import type { UserListItem } from "~/types";

definePageMeta({ middleware: "auth" });

// 🎯 Composables principales
const {
  users,
  loading,
  error,
  paginationInfo,
  searchQuery,
  sortBy,
  sortOrder,
  goToPage,
  searchUsers,
  refreshUsers,
  initializeUsers,
  changePerPage,
  changeSorting,
} = useUsers();

const toast = useToast();

// 🎯 Estado local reactivo
const search = ref("");
const selectedUsers = ref<number[]>([]);
const selectedPerPage = ref(10);
const viewMode = ref<'table' | 'grid' | 'compact'>('table');
const showFilters = ref(false);
const selectedRole = ref('');
const selectedStatus = ref('');
const selectedUser = ref<UserListItem | null>(null);
const showUserPreview = ref(false);
const isRefreshing = ref(false);
const lastUpdated = ref(new Date());
const isCreatingUser = ref(false);
const isMobile = ref(false);

// 📊 Estadísticas computadas
const userStats = computed(() => ({
  total: paginationInfo.value.totalItems || 0,
  active: users.value.filter(u => (u as any).status === 'active').length,
  online: Math.floor(Math.random() * users.value.length * 0.3),
}));

// 🔄 Funciones principales
const handleRefresh = async () => {
  isRefreshing.value = true;
  await refreshUsers();
  lastUpdated.value = new Date();
  isRefreshing.value = false;
  
  toast.add({
    title: "Lista actualizada",
    description: `${users.value.length} usuarios cargados`,
    color: "success",
  });
};

const handlePerPageChange = async (value: any) => {
  const newValue = typeof value === 'object' ? value.value : value;
  selectedPerPage.value = newValue;
  await changePerPage(newValue);
};

// 🏷️ Gestión de selección
const toggleSelectAll = () => {
  if (selectedUsers.value.length === users.value.length) {
    selectedUsers.value = [];
  } else {
    selectedUsers.value = users.value.map(u => u.id);
  }
};

const toggleUserSelection = (userId: number) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index >= 0) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(userId);
  }
};

// 👤 Acciones de usuario
const openUserPreview = (user: UserListItem) => {
  selectedUser.value = user;
  showUserPreview.value = true;
};

const viewUser = (user: UserListItem) => openUserPreview(user);
const editUser = (user: UserListItem) => console.log("Editar usuario:", user);
const deleteUser = (user: UserListItem) => console.log("Eliminar usuario:", user);

// 📱 Detección móvil
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// 🔍 Búsqueda con debounce
watchDebounced(
  search,
  async (query) => {
    await searchUsers(query);
  },
  { debounce: 250, maxWait: 600 }
);

// 🚀 Inicialización
onMounted(async () => {
  try {
    if (!users.value?.length) {
      await initializeUsers();
    }
    selectedPerPage.value = paginationInfo.value.perPage;
    
    // Configurar detección móvil
    checkMobile();
    window.addEventListener('resize', checkMobile);
  } catch (err) {
    console.error('Error al inicializar usuarios:', err);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// 🧭 Meta de página
useHead({ title: "Usuarios - Asisten" });
</script>

<template>
  <UDashboardPanel id="users">
    <!-- Header -->
    <template #header>
      <UsersHeader
        :total-users="userStats.total"
        :active-users="userStats.active" 
        :online-users="userStats.online"
        v-model:view-mode="viewMode"
        :is-mobile="isMobile"
        :is-refreshing="isRefreshing"
        :is-creating="isCreatingUser"
        @refresh="handleRefresh"
        @create-user="isCreatingUser = true"
        @export="(type) => console.log('Export:', type)"
      />

      <!-- Toolbar -->
      <div class="border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center gap-3">
            <!-- Búsqueda -->
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Buscar usuarios..."
              class="w-80"
              :loading="loading"
              size="sm"
            />

            <!-- Toggle filtros -->
            <UButton
              :icon="showFilters ? 'i-lucide-x' : 'i-lucide-filter'"
              variant="outline"
              size="sm"
              @click="showFilters = !showFilters"
              :color="showFilters ? 'primary' : 'neutral'"
            >
              {{ showFilters ? 'Ocultar' : 'Filtros' }}
            </UButton>
          </div>

          <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span v-if="paginationInfo.totalItems">
              {{ paginationInfo.from }}-{{ paginationInfo.to }} de {{ paginationInfo.totalItems }}
            </span>

            <USelectMenu
              v-model="selectedPerPage"
              :options="[
                { label: '5 por página', value: 5 },
                { label: '10 por página', value: 10 },
                { label: '15 por página', value: 15 },
                { label: '25 por página', value: 25 },
                { label: '50 por página', value: 50 }
              ]"
              size="xs"
              :loading="loading"
              @update:model-value="handlePerPageChange"
              class="w-24"
            />
          </div>
        </div>

        <!-- Panel de filtros -->
        <div v-if="showFilters" class="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
          <div class="flex flex-wrap items-center gap-4">
            <UFormGroup label="Rol" size="sm">
              <USelectMenu
                v-model="selectedRole"
                :options="[
                  { label: 'Todos los roles', value: '' },
                  { label: 'Gerente', value: 'Gerente' },
                  { label: 'Jefe de Área', value: 'Jefe de Área' },
                  { label: 'Supervisor', value: 'Supervisor' },
                  { label: 'Técnico', value: 'Técnico' },
                  { label: 'Administrativo', value: 'Administrativo' }
                ]"
                placeholder="Seleccionar rol"
                size="sm"
                class="w-48"
                clearable
              />
            </UFormGroup>
            
            <UFormGroup label="Estado" size="sm">
              <USelectMenu
                v-model="selectedStatus"
                :options="[
                  { label: 'Todos los estados', value: '' },
                  { label: 'Activo', value: 'active' },
                  { label: 'Inactivo', value: 'inactive' },
                  { label: 'Pendiente', value: 'pending' }
                ]"
                placeholder="Seleccionar estado"
                size="sm"
                class="w-48"
                clearable
              />
            </UFormGroup>

            <div class="flex-1"></div>

            <div class="flex items-center gap-2">
              <UButton
                variant="ghost"
                size="sm"
                icon="i-lucide-eraser"
                @click="selectedRole = ''; selectedStatus = ''"
              >
                Limpiar
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Contenido principal -->
    <template #body>
      <div class="space-y-4">
        <!-- Estados especiales -->
        <div v-if="loading && users.length === 0" class="space-y-3">
          <div v-for="i in 5" :key="i" class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div class="animate-pulse flex items-center space-x-4">
              <div class="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <UAlert
          v-else-if="error"
          :title="error"
          color="error"
          variant="soft"
          icon="i-lucide-alert-circle"
        >
          <template #description>
            <div class="space-y-2">
              <p class="text-sm">Hubo un problema al cargar los usuarios.</p>
              <UButton 
                @click="handleRefresh" 
                color="error" 
                variant="outline" 
                size="sm"
                icon="i-lucide-refresh-cw"
                :loading="isRefreshing"
              >
                Reintentar
              </UButton>
            </div>
          </template>
        </UAlert>

        <div v-else-if="!users.length" class="text-center py-12">
          <div class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <UIcon name="i-lucide-users" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {{ search ? "Sin resultados" : "No hay usuarios" }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {{ search ? `No se encontraron usuarios para "${search}"` : "Aún no se han registrado usuarios" }}
          </p>
          <UButton 
            v-if="search" 
            variant="outline" 
            size="sm"
            @click="search = ''"
          >
            Limpiar búsqueda
          </UButton>
        </div>

        <!-- Contenido principal -->
        <div v-else>
          <!-- Acciones en lote -->
          <UsersBulkActions
            v-if="selectedUsers.length > 0"
            :selected-users="selectedUsers"
            @send-email="console.log('Send email')"
            @deactivate-users="console.log('Deactivate')"
            @clear-selection="selectedUsers = []"
          />

          <!-- Vista de tabla -->
          <UsersTable
            v-if="viewMode === 'table'"
            :users="users"
            :selected-users="selectedUsers"
            :sort-by="sortBy"
            :sort-order="sortOrder"
            @toggle-select-all="toggleSelectAll"
            @toggle-user="toggleUserSelection"
            @sort="changeSorting"
            @view-user="viewUser"
            @edit-user="editUser"
            @delete-user="deleteUser"
          />

          <!-- Otras vistas (simplificadas por ahora) -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard v-for="user in users" :key="user.id" class="p-4">
              <div class="flex items-center gap-3">
                <UAvatar :alt="user.name" size="sm">
                  {{ user.name.charAt(0).toUpperCase() }}
                </UAvatar>
                <div>
                  <p class="font-medium">{{ user.name }}</p>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
              </div>
            </UCard>
          </div>

          <div v-else class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y">
            <div v-for="user in users" :key="user.id" class="p-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UCheckbox 
                  :model-value="selectedUsers.includes(user.id)"
                  @change="toggleUserSelection(user.id)"
                  size="sm"
                />
                <UAvatar :alt="user.name" size="sm">
                  {{ user.name.charAt(0).toUpperCase() }}
                </UAvatar>
                <div>
                  <p class="font-medium">{{ user.name }}</p>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
              </div>
              <UButton 
                icon="i-lucide-more-horizontal" 
                size="xs" 
                variant="ghost"
                @click="openUserPreview(user)"
              />
            </div>
          </div>

          <!-- Paginación -->
          <UsersPagination
            :pagination-info="paginationInfo"
            :selected-count="selectedUsers.length"
            @go-to-page="goToPage"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Modal de vista previa -->
  <USlideover v-model="showUserPreview" side="right">
    <UCard v-if="selectedUser" class="flex flex-col flex-1">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <UAvatar :alt="selectedUser.name" size="lg">
              {{ selectedUser.name.charAt(0).toUpperCase() }}
            </UAvatar>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedUser.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedUser.emp_code }}</p>
            </div>
          </div>
          <UButton 
            icon="i-lucide-x" 
            color="neutral" 
            variant="ghost" 
            size="sm"
            @click="showUserPreview = false"
          />
        </div>
      </template>

      <div class="flex-1 space-y-6 p-6">
        <!-- Información básica -->
        <UFormGroup label="Información de contacto">
          <div class="space-y-3">
            <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <UIcon name="i-lucide-mail" class="w-4 h-4 text-gray-500" />
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ selectedUser.email }}</p>
              </div>
            </div>
          </div>
        </UFormGroup>

        <!-- Estado -->
        <UFormGroup label="Estado">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-400"></div>
            <span class="text-sm">Activo</span>
          </div>
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex items-center justify-between p-6">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Última conexión: {{ new Date().toLocaleDateString() }}
          </div>
          
          <div class="flex items-center gap-3">
            <UButton 
              icon="i-lucide-edit"
              size="sm"
              @click="editUser(selectedUser!); showUserPreview = false"
            >
              Editar
            </UButton>
            <UButton 
              variant="outline"
              size="sm"
              @click="showUserPreview = false"
            >
              Cerrar
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </USlideover>
</template>