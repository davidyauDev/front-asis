<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import type { UserListItem } from "~/types";

definePageMeta({ middleware: "auth" });

const {
  users,
  loading,
  error,
  paginationInfo,
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

const search = ref("");
const selectedUsers = ref<number[]>([]);
const selectedPerPage = ref(10);
const showFilters = ref(false);
const selectedRole = ref('');
const selectedStatus = ref('');
const selectedUser = ref<UserListItem | null>(null);
const showUserPreview = ref(false);
const isRefreshing = ref(false);
const isCreatingUser = ref(false);



const handleRefresh = async () => {
  isRefreshing.value = true;
  await refreshUsers();
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

const openUserPreview = (user: UserListItem) => {
  selectedUser.value = user;
  showUserPreview.value = true;
};

const viewUser = (user: UserListItem) => openUserPreview(user);
const editUser = (user: UserListItem) => console.log("Editar usuario:", user);
const deleteUser = (user: UserListItem) => console.log("Eliminar usuario:", user);

//  Búsqueda con debounce
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
  } catch (err) {
    console.error('Error al inicializar usuarios:', err);
  }
});

</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Usuarios" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Refrescar">
            <UButton
              color="neutral"
              variant="ghost"
              square
              :loading="isRefreshing"
              @click="handleRefresh"
            >
              <UIcon name="i-lucide-refresh-cw" class="size-5 shrink-0" />
            </UButton>
          </UTooltip>

          <UButton
            icon="i-lucide-user-plus"
            @click="isCreatingUser = true"
          >
            Nuevo Usuario
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar usuarios..."
            class="w-64"
            :loading="loading"
          />

          <UButton
            :icon="showFilters ? 'i-lucide-x' : 'i-lucide-filter'"
            :color="showFilters ? 'primary' : 'neutral'"
            variant="ghost"
            @click="showFilters = !showFilters"
          >
            {{ showFilters ? 'Ocultar' : 'Filtros' }}
          </UButton>
        </template>

        <template #right>
          <span v-if="paginationInfo.totalItems" class="text-sm text-muted">
            {{ paginationInfo.from }}-{{ paginationInfo.to }} de {{ paginationInfo.totalItems }}
          </span>

          <USelectMenu
            v-model="selectedPerPage"
            :options="[
              { label: '10', value: 10 },
              { label: '25', value: 25 },
              { label: '50', value: 50 }
            ]"
            :loading="loading"
            @update:model-value="handlePerPageChange"
          />
        </template>
      </UDashboardToolbar>

      <!-- Panel de filtros expandible -->
      <div v-if="showFilters" class="border-t">
        <div class="p-4 flex items-center gap-4">
          <USelectMenu
            v-model="selectedRole"
            :options="[
              { label: 'Todos los roles', value: '' },
              { label: 'Gerente', value: 'Gerente' },
              { label: 'Jefe de Área', value: 'Jefe de Área' },
              { label: 'Supervisor', value: 'Supervisor' }
            ]"
            placeholder="Rol"
            clearable
          />
          
          <USelectMenu
            v-model="selectedStatus"
            :options="[
              { label: 'Todos', value: '' },
              { label: 'Activo', value: 'active' },
              { label: 'Inactivo', value: 'inactive' }
            ]"
            placeholder="Estado"
            clearable
          />

          <UButton
            variant="ghost"
            icon="i-lucide-eraser"
            @click="selectedRole = ''; selectedStatus = ''"
          >
            Limpiar
          </UButton>
        </div>
      </div>
    </template>

    <!-- Contenido principal -->
    <template #body>
      <!-- Estado de carga -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
        mode="out-in"
      >
        <div v-if="loading && users.length === 0" key="loading" class="min-h-[calc(100vh-16rem)]">
          <div class="space-y-4">
            <!-- Skeleton de la tabla -->
            <div class="rounded-lg overflow-hidden bg-white dark:bg-gray-950">
              <!-- Header de tabla -->
              <div class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <USkeleton class="h-4 w-full" />
              </div>
              <!-- Filas -->
              <div class="divide-y divide-gray-100 dark:divide-gray-800">
                <div v-for="i in 10" :key="i" class="px-4 py-4 flex items-center gap-4">
                  <USkeleton class="size-4 rounded" />
                  <USkeleton class="h-6 w-20" />
                  <USkeleton class="size-8 rounded-full" />
                  <USkeleton class="h-5 w-32" />
                  <USkeleton class="h-5 w-48" />
                  <USkeleton class="h-6 w-24" />
                  <USkeleton class="h-6 w-20" />
                  <div class="ml-auto flex gap-2">
                    <USkeleton class="size-8 rounded" />
                    <USkeleton class="size-8 rounded" />
                    <USkeleton class="size-8 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <!-- Skeleton de paginación -->
            <div class="flex justify-between items-center">
              <USkeleton class="h-5 w-32" />
              <USkeleton class="h-10 w-64" />
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" key="error" class="min-h-[calc(100vh-16rem)] flex items-center justify-center">
          <UAlert
            :title="error"
            color="error"
            variant="subtle"
            icon="i-lucide-alert-circle"
            class="max-w-xl"
          >
            <template #actions>
              <UButton 
                @click="handleRefresh" 
                color="error" 
                variant="outline"
                icon="i-lucide-refresh-cw"
                :loading="isRefreshing"
              >
                Reintentar
              </UButton>
            </template>
          </UAlert>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="!users.length" key="empty" class="min-h-[calc(100vh-16rem)] flex items-center justify-center">
          <UCard class="max-w-lg">
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <UIcon name="i-lucide-users" class="size-12 text-muted mb-4 animate-pulse" />
              <h3 class="text-lg font-semibold mb-2">
                {{ search ? 'Sin resultados' : 'No hay usuarios' }}
              </h3>
              <p class="text-sm text-muted mb-4">
                {{ search ? 'No se encontraron usuarios para tu búsqueda' : 'Aún no se han registrado usuarios' }}
              </p>
              <UButton 
                v-if="search" 
                @click="search = ''"
                variant="outline"
              >
                Limpiar búsqueda
              </UButton>
            </div>
          </UCard>
        </div>

        <!-- Lista de usuarios -->
        <div v-else key="content" class="space-y-4 min-h-[calc(100vh-16rem)]">
          <!-- Acciones en lote -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-4 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 -translate-y-4 scale-95"
          >
            <UsersBulkActions
              v-if="selectedUsers.length > 0"
              :selected-users="selectedUsers"
              @send-email="console.log('Send email')"
              @deactivate-users="console.log('Deactivate')"
              @clear-selection="selectedUsers = []"
            />
          </Transition>

          <!-- Tabla de usuarios -->
          <UsersTable
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

          <!-- Paginación -->
          <UsersPagination
            :pagination-info="paginationInfo"
            :selected-count="selectedUsers.length"
            @go-to-page="goToPage"
          />
        </div>
      </Transition>
    </template>
  </UDashboardPanel>

  <!-- Modal de vista previa -->
  <USlideover v-model="showUserPreview">
    <UCard v-if="selectedUser" class="flex flex-col flex-1">
      <template #header>
        <div class="flex items-center gap-3">
          <UAvatar :alt="selectedUser.name" size="md">
            {{ selectedUser.name.charAt(0).toUpperCase() }}
          </UAvatar>
          <div class="flex-1">
            <h3 class="font-semibold">{{ selectedUser.name }}</h3>
            <p class="text-sm text-muted">{{ selectedUser.emp_code }}</p>
          </div>
          <UButton 
            icon="i-lucide-x" 
            color="neutral" 
            variant="ghost"
            square
            @click="showUserPreview = false"
          />
        </div>
      </template>

      <div class="flex-1 space-y-4">
        <div class="space-y-1">
          <div class="text-sm text-muted">Email</div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-mail" class="size-4 text-muted" />
            <span class="text-sm">{{ selectedUser.email }}</span>
          </div>
        </div>


        <div class="space-y-1">
          <div class="text-sm text-muted">Estado</div>
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full bg-success"></div>
            <span class="text-sm">Activo</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <div class="text-xs text-muted">
            Última conexión: {{ new Date().toLocaleDateString() }}
          </div>
          
          <div class="flex items-center gap-2">
            <UButton 
              icon="i-lucide-edit"
              @click="editUser(selectedUser!); showUserPreview = false"
            >
              Editar
            </UButton>
            <UButton 
              color="neutral"
              variant="ghost"
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