<template>
  <div class="rounded-lg overflow-hidden bg-white dark:bg-gray-950">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <!-- <th class="px-4 py-3 w-12">
              <UCheckbox :model-value="isAllSelected" :indeterminate="isIndeterminate"
                @change="$emit('toggleSelectAll')" size="sm" />
            </th> -->
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-left">
              <button v-if="col.sortable" :class="getSortButtonClass(col.key)"
                class="group flex items-center gap-1 font-medium" @click="$emit('sort', col.key)">
                {{ col.label }}
                <UIcon :name="getSortIcon(col.key)" class="size-3 opacity-60 group-hover:opacity-100" />
              </button>
              <span v-else class="text-xs font-medium text-gray-600 dark:text-gray-400">
                {{ col.label }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="user in users" :key="user.id" :class="[
            'hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors',
           
          ]">
            <!-- Checkbox -->
            <!-- <td class="px-4 py-4">
              <UCheckbox :model-value="selectedUsers.includes(user.id)" @change="$emit('toggleUser', user.id)"
                size="sm" />
            </td> -->

            <!-- Código -->
            <td class="px-4 py-4">
              <UBadge :label="user.emp_code" variant="outline" size="md" class="font-mono" />
            </td>

            <!-- Usuario -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <UAvatar :alt="user.name" size="sm" class="ring-1 ring-gray-200 dark:ring-gray-800">
                  {{ user.name.charAt(0).toUpperCase() }}
                </UAvatar>
                <div>
                  <p class="text-xs font-medium text-gray-700 dark:text-gray-200">{{ user.name }}</p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">ID: {{ user.id }}</p>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-mail" class="size-4 text-gray-400 dark:text-gray-500" />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ user.email }}</span>
              </div>
            </td>

            <!-- Rol -->
            <td class="px-4 py-4">
              <UBadge :label="getRoleOp(user.role).label" :color="getRoleOp(user.role).color" variant="soft" size="md" />
            </td>

           

            <td class="px-4 py-4">
              <!-- <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full" :class="getStatusContainerClass((user as any).status)"> -->
              <!-- <span class="text-xs font-medium p-1 rounded-full" :class="getStatusDotColor((user.active))"> -->
              <button :disabled="loading" @click="$emit('toggleUserActive', user.id)"
                class="ml-2 text-sm cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-full flex items-center gap-1 transition-colors">
                <UIcon :name="user.active ? 'i-lucide-shield-check' : 'i-lucide-shield-off'"
                  class="size-3 text-white" />
                <!-- </span> -->

                {{ user.active ? 'Sí' : 'No' }}
              </button>
              <!-- </div> -->
            </td>

            <!-- Acciones -->
            <td class="px-4 py-4">
              <div class="flex items-center justify-end gap-1">
                <UTooltip text="Ver detalles">
                  <UButton icon="i-lucide-eye" size="xs" variant="ghost" @click="$emit('viewUser', user)" />
                </UTooltip>
                <UTooltip text="Editar">
                  <UButton icon="i-lucide-edit" size="xs" variant="ghost" @click="$emit('editUser', user)" />
                </UTooltip>



                <UTooltip v-if="user.id !== userAuth?.id" :text="user.deleted_at ? 'Restaurar' : 'Eliminar'">
                  <UButton v-if="!user.deleted_at" icon="i-lucide-trash-2" size="xs" variant="ghost" color="error"
                    @click="$emit('deleteUser', user)" />
                  <UButton v-else icon="i-lucide-timer-reset" size="xs" variant="ghost" color="success"
                    @click="$emit('restoreUser', user)" />

                </UTooltip>



              
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserListItem } from "~/types"
import { getRoleOp } from "~/enums/user"

const { user: userAuth } = useAuth()

interface Props {
  users: readonly UserListItem[];
  loading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface Emits {
  // (e: 'toggleSelectAll'): void
  // (e: 'toggleUser', userId: number): void
  (e: 'sort', column: string): void
  (e: 'viewUser', user: UserListItem): void
  (e: 'editUser', user: UserListItem): void
  (e: 'deleteUser', user: UserListItem): void
  (e: 'restoreUser', user: UserListItem): void
  (e: 'toggleUserActive', userId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Columnas de la tabla
const columns = [
  { key: 'emp_code', label: 'Código', sortable: true },
  { key: 'name', label: 'Usuario', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rol', sortable: false },
  { key: 'active', label: 'Activo', sortable: false },
  { key: 'actions', label: '', sortable: false }
]


// Funciones de utilidad
const getSortIcon = (column: string) => {
  if (props.sortBy !== column) return "i-lucide-arrow-up-down"
  return props.sortOrder === "asc" ? "i-lucide-arrow-up" : "i-lucide-arrow-down"
}

const getSortButtonClass = (column: string) => {
  const base = "flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors"
  return props.sortBy === column
    ? base + " !text-gray-900 dark:!text-gray-100"
    : base
}

</script>