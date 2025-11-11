<template>
  <div class="rounded-lg overflow-hidden bg-white dark:bg-gray-950">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th class="px-4 py-3 w-12">
              <UCheckbox 
                :model-value="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="$emit('toggleSelectAll')"
                size="sm"
              />
            </th>
            <th v-for="col in columns" :key="col.key" class="px-4 py-3 text-left">
              <button 
                v-if="col.sortable"
                :class="getSortButtonClass(col.key)" 
                class="group flex items-center gap-1 font-medium"
                @click="$emit('sort', col.key)"
              >
                {{ col.label }}
                <UIcon 
                  :name="getSortIcon(col.key)" 
                  class="size-3 opacity-60 group-hover:opacity-100" 
                />
              </button>
              <span v-else class="text-xs font-medium text-gray-600 dark:text-gray-400">
                {{ col.label }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="user in users"
            :key="user.id"
            :class="[
              'hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors',
              selectedUsers.includes(user.id) ? 'bg-primary-50 dark:bg-primary-950/30' : ''
            ]"
          >
            <!-- Checkbox -->
            <td class="px-4 py-4">
              <UCheckbox 
                :model-value="selectedUsers.includes(user.id)"
                @change="$emit('toggleUser', user.id)"
                size="sm" 
              />
            </td>

            <!-- Código -->
            <td class="px-4 py-4">
              <UBadge 
                :label="user.emp_code" 
                variant="outline" 
                size="md"
                class="font-mono"
              />
            </td>

            <!-- Usuario -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <UAvatar 
                  :alt="user.name"
                  size="sm"
                  class="ring-1 ring-gray-200 dark:ring-gray-800"
                >
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
              <UBadge
                :label="(user as any).role || 'Sin rol'"
                color="neutral"
                variant="soft"
                size="md"
              />
            </td>

            <!-- Estado -->
            <td class="px-4 py-4">
              <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full" :class="getStatusContainerClass((user as any).status)">
                <span class="text-xs font-medium" :class="getStatusTextClass((user as any).status)">
                  {{ getStatusLabel((user as any).status) }}
                </span>
              </div>
            </td>

            <!-- Acciones -->
            <td class="px-4 py-4">
              <div class="flex items-center justify-end gap-1">
                <UTooltip text="Ver detalles">
                  <UButton 
                    icon="i-lucide-eye" 
                    size="xs" 
                    variant="ghost" 
                    @click="$emit('viewUser', user)" 
                  />
                </UTooltip>
                <UTooltip text="Editar">
                  <UButton 
                    icon="i-lucide-edit" 
                    size="xs" 
                    variant="ghost"
                    @click="$emit('editUser', user)" 
                  />
                </UTooltip>
                <UPopover>
                  <UButton 
                    icon="i-lucide-more-horizontal" 
                    size="xs" 
                    variant="ghost"
                  />
                  
                  <template #content>
                    <div class="p-1 space-y-1">
                      <UButton
                        label="Ver detalles"
                        icon="i-lucide-eye"
                        variant="ghost"
                        block
                        @click="$emit('viewUser', user)"
                      />
                      <UButton
                        label="Editar"
                        icon="i-lucide-edit"
                        variant="ghost"
                        block
                        @click="$emit('editUser', user)"
                      />
                      <UButton
                        label="Eliminar"
                        icon="i-lucide-trash-2"
                        variant="ghost"
                        color="error"
                        block
                        @click="$emit('deleteUser', user)"
                      />
                    </div>
                  </template>
                </UPopover>
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

interface Props {
  users: readonly UserListItem[];
  selectedUsers: number[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface Emits {
  (e: 'toggleSelectAll'): void
  (e: 'toggleUser', userId: number): void
  (e: 'sort', column: string): void
  (e: 'viewUser', user: UserListItem): void
  (e: 'editUser', user: UserListItem): void
  (e: 'deleteUser', user: UserListItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Columnas de la tabla
const columns = [
  { key: 'emp_code', label: 'Código', sortable: true },
  { key: 'name', label: 'Usuario', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rol', sortable: false },
  { key: 'status', label: 'Estado', sortable: false },
  { key: 'actions', label: '', sortable: false }
]

// Estados computados
const isAllSelected = computed(() => 
  props.users.length > 0 && props.selectedUsers.length === props.users.length
)

const isIndeterminate = computed(() => 
  props.selectedUsers.length > 0 && props.selectedUsers.length < props.users.length
)

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

const getStatusDotColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500'
    case 'inactive': return 'bg-red-500'
    default: return 'bg-yellow-500'
  }
}

const getStatusContainerClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-50 dark:bg-green-950/50'
    case 'inactive': return 'bg-red-50 dark:bg-red-950/50'
    default: return 'bg-yellow-50 dark:bg-yellow-950/50'
  }
}

const getStatusTextClass = (status: string) => {
  switch (status) {
    case 'active': return 'text-green-700 dark:text-green-400'
    case 'inactive': return 'text-red-700 dark:text-red-400'
    default: return 'text-yellow-700 dark:text-yellow-400'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Activo'
    case 'inactive': return 'Inactivo'
    default: return 'Pendiente'
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'error'
    default: return 'warning'
  }
}
</script>