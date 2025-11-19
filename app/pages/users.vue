<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import type { CreateUserPayload, UserListItem } from "~/types";
import { roleOptions } from "~/enums/user";
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { EMAIL_REGEX } from '~/constants/regex'

type Mode = 'view' | 'edit' | 'create';

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
  toggleUserActive,
  deleteUserFromList,
  updateUserInList,
  restoreUser,
  createUser
} = useUsers();

const toast = useToast();

const search = ref("");
const selectedUsers = ref<number[]>([]);
const selectedPerPage = ref(10);
const showFilters = ref(false);
const selectedRole = ref('');
const selectedStatus = ref('');
const selectedUser = ref<UserListItem | null>(null);
const mode = ref<Mode | null>(null);
const showUserPreview = ref(false);
const isRefreshing = ref(false);

const isViewMode = computed(() => mode.value === 'view');

const currentId = computed(() => selectedUser.value ? selectedUser.value.id : null);




const formState = reactive<CreateUserPayload>({
  name: '',
  emp_code: '',
  email: '',
  role: '',
  password: '',
  active: true,

})


const hasErrors = computed(() => {
  return validate(formState).length > 0;
});

type Schema = typeof formState

function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.email) errors.push({ name: 'email', message: 'Este campo es obligatorio' })
  else if (!EMAIL_REGEX.test(state.email)) errors.push({ name: 'email', message: 'Correo electrónico inválido' })
  if (!state.password && mode.value === 'create') errors.push({ name: 'password', message: 'La contraseña es obligatoria' })
  if (!state.name) errors.push({ name: 'name', message: 'El nombre es obligatorio' })
  if (!state.emp_code) errors.push({ name: 'emp_code', message: 'El código es obligatorio' })
  if (!state.role) errors.push({ name: 'role', message: 'El rol es obligatorio' })
  return errors
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  event.preventDefault();
  if (hasErrors.value) return;

  const userPayload: CreateUserPayload = {
    name: formState.name,
    emp_code: formState.emp_code,
    email: formState.email,
    role: formState.role,
    password: formState.password,
    active: formState.active,
  };

  if (mode.value === 'edit' && currentId.value !== null) {
    const updatedUser = await updateUserInList(currentId.value, userPayload);
    if (!updatedUser) return;
    // Close modal
    showUserPreview.value = false;
    selectedUser.value = null;
    return;
  }

  const newUser = await createUser(userPayload);
  if (!newUser) return;
  // Reset form
  resetForm();

  // Close modal
  showUserPreview.value = false;
}

const resetForm = () => {
  formState.name = '';
  formState.emp_code = '';
  formState.email = '';
  formState.role = '';
  formState.password = '';
  formState.active = true;
}

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



const toggleUserSelection = (userId: number) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index >= 0) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(userId);
  }
};

const openUserPreview = (user: UserListItem, type: Mode) => {
  // selectedUser.value = { ...user };

  formState.name = user.name;
  formState.emp_code = user.emp_code;
  formState.email = user.email;
  formState.role = user.role;
  formState.active = user.active;


  selectedUser.value = user;


  mode.value = type;
  showUserPreview.value = true;
};

const viewUser = (user: UserListItem, type: Mode) => openUserPreview(user, type);


const deleteUser = (user: UserListItem) => deleteUserFromList(user.id);

watchDebounced(
  search,
  async (query) => {
    await searchUsers(query);
  },
  { debounce: 250, maxWait: 600 }
);

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


      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar usuarios..." class="w-64"
            :loading="loading" />


        </template>

        <template #right>
          <span v-if="paginationInfo.totalItems" class="text-sm text-muted">
            {{ paginationInfo.from }}-{{ paginationInfo.to }} de {{ paginationInfo.totalItems }}
          </span>

          <USelectMenu :search-input="false" :ignoreFilter="true" value-key="value" v-model="selectedPerPage" :items="[
            { label: '10', value: 10 },
            { label: '25', value: 25 },
            { label: '50', value: 50 }
          ]" :loading="loading" @update:model-value="handlePerPageChange" />
        </template>
      </UDashboardToolbar>

      <!-- Panel de filtros expandible -->
      <div v-if="showFilters" class="border-t">
        <div class="p-4 flex items-center gap-4">
          <USelectMenu v-model="selectedRole" :options="[
            { label: 'Todos los roles', value: '' },
            { label: 'Gerente', value: 'Gerente' },
            { label: 'Jefe de Área', value: 'Jefe de Área' },
            { label: 'Supervisor', value: 'Supervisor' }
          ]" placeholder="Rol" clearable />

          <USelectMenu v-model="selectedStatus" :options="[
            { label: 'Todos', value: '' },
            { label: 'Activo', value: 'active' },
            { label: 'Inactivo', value: 'inactive' }
          ]" placeholder="Estado" clearable />

          <UButton variant="ghost" icon="i-lucide-eraser" @click="selectedRole = ''; selectedStatus = ''">
            Limpiar
          </UButton>
        </div>
      </div>
    </template>

    <!-- Contenido principal -->
    <template #body>
      <!-- Estado de carga -->
      <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95" mode="out-in">
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
          <UAlert :title="error" color="error" variant="subtle" icon="i-lucide-alert-circle" class="max-w-xl">
            <template #actions>
              <UButton @click="handleRefresh" color="error" variant="outline" icon="i-lucide-refresh-cw"
                :loading="isRefreshing">
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
              <UButton v-if="search" @click="search = ''" variant="outline">
                Limpiar búsqued a
              </UButton>
            </div>
          </UCard>
        </div>

        <!-- Lista de usuarios -->
        <div v-else key="content" class="space-y-4 min-h-[calc(100vh-16rem)]">

          <div class="flex justify-end mb-4">

            <UButton variant="outline" size="sm"
            class="ml-auto"
            @click="() => { mode = 'create'; showUserPreview = true }"
            :loading="loading" icon="i-lucide-user-plus">
            Agregar usuario
          </UButton>
          
        </div>

          <UsersTable :users="users" :sort-by="sortBy" :loading="loading" :sort-order="sortOrder"
            @toggle-user="toggleUserSelection" @sort="changeSorting" @view-user="user => viewUser(user, 'view')"
            @edit-user="user => viewUser(user, 'edit')" @delete-user="deleteUser" @restore-user="restoreUser"
            @toggle-user-active="toggleUserActive" />

          <UsersPagination :pagination-info="paginationInfo" :selected-count="selectedUsers.length"
            @go-to-page="goToPage" />
        </div>
      </Transition>
    </template>
  </UDashboardPanel>

  <!-- Modal de vista previa -->
  <!-- <USlideover v-model="showUserPreview">
    <template #header>
      <h3 class="text-lg font-semibold">Detalles del Usuario</h3>
    </template> -->

  <UModal v-model:open="showUserPreview" @update:open="(isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
  }" :title="isViewMode ? 'Vista de Usuario' : mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'" size="lg">
    <template #body>
      <UCard class="space-y-6 p-4">

        <!-- Header -->

        <div v-if="mode != 'create'" class="flex items-center gap-4">
          <UAvatar :alt="formState.name" size="lg">
            {{ formState.name.charAt(0).toUpperCase() }}
          </UAvatar>

          <div class="flex flex-col gap-1 flex-1">
            <h3 class="text-lg font-semibold">
              {{ formState.name }}
            </h3>
            <p class="text-sm text-muted">
              Código: {{ formState.emp_code }}
            </p>
          </div>
        </div>

        <!-- Form -->
        <UForm :validate="validate" :state="formState" class="flex flex-col items-stretch  gap-4" :class="[
          mode !== 'create' ? 'my-8' : 'mb-8'
        ]" @submit="onSubmit">

          <!-- Nombre -->
          <UFormField label="Nombre completo" class="w-full" name="name">
            <template v-if="isViewMode && selectedUser">
              <p class="text-sm">{{ selectedUser.name }}</p>
            </template>
            <UInput v-else v-model="formState.name" placeholder="Nombre del usuario" class="w-full" />
          </UFormField>

          <!-- Código -->
          <UFormField label="Código de empleado" class="w-full" name="emp_code">
            <template v-if="isViewMode && selectedUser">
              <p class="text-sm">{{ selectedUser.emp_code }}</p>
            </template>
            <UInput v-else v-model="formState.emp_code" class="w-full" placeholder="Código de empleado" />
          </UFormField>

          <!-- Email -->
          <UFormField label="Correo electrónico" class="w-full" name="email">
            <template v-if="isViewMode && selectedUser">
              <p class="text-sm">{{ selectedUser.email }}</p>
            </template>
            <UInput v-else  v-model="formState.email" class="w-full" placeholder="Correo electrónico" />
          </UFormField>

          <!-- Password -->

          <UFormField v-if="mode === 'create'" label="Contraseña" class="w-full" name="password">
            <UInput type="password" v-model="formState.password" class="w-full" placeholder="Contraseña" />
          </UFormField>


          <div class="flex max-sm:flex-wrap justify-between gap-4">



            <!-- Rol -->
            <UFormField label="Rol" class="w-full" name="role">
              <template v-if="isViewMode && selectedUser">
                <p class="text-sm">{{ selectedUser.role }}</p>
              </template>
              <USelect v-else v-model="formState.role" :items="Object.values(roleOptions)" item-label="label"
                item-value="value" placeholder="Selecciona un rol" />
            </UFormField>

            <!-- Estado -->
            <UFormField label="Estado" class="w-full" name="active">
              <template v-if="isViewMode && selectedUser">
                <UBadge :color="selectedUser.active ? 'success' : 'error'" size="sm">
                  {{ selectedUser.active ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </template>


              <USelect v-else v-model="formState.active" :items="[
                { label: 'Activo', value: true },
                { label: 'Inactivo', value: false }
              ]" />
            </UFormField>
          </div>

          <!-- Footer -->
          <div class="flex justify-between items-center pt-4 border-t gap-6 border-gray-200 dark:border-gray-700">
      

            <div class="flex items-center gap-2 ml-auto">

              <UButton type="submit" :disabled="hasErrors || isViewMode" v-if="!isViewMode" :loading="loading"
                icon="i-lucide-save" color="primary" class="cursor-pointer">

                Guardar
              </UButton>

              <UButton color="neutral" variant="ghost" @click="showUserPreview = false; selectedUser = null">
                Cerrar
              </UButton>
            </div>
          </div>
        </UForm>
      </UCard>
    </template>
  </UModal>





  <!-- </USlideover> -->
</template>