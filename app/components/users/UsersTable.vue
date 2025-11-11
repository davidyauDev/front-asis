<template>
  <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
                @click="$emit('sort', col.key)"
                class="group flex items-center gap-1 font-medium"
              >
                {{ col.label }}
                <UIcon 
                  :name="getSortIcon(col.key)" 
                  class="w-3 h-3 opacity-60 group-hover:opacity-100" 
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
              'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200',
              selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-950/50' : ''
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
                size="sm"
                class="font-mono"
              />
            </td>

            <!-- Usuario -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <UAvatar 
                  :alt="user.name"
                  size="sm"
                  class="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                >
                  {{ user.name.charAt(0).toUpperCase() }}
                </UAvatar>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">ID: {{ user.id }}</p>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-mail" class="w-3 h-3 text-gray-400" />
                <span class="text-sm text-gray-900 dark:text-white">{{ user.email }}</span>
              </div>
            </td>

            <!-- Rol -->
            <td class="px-4 py-4">
              <UBadge
                :label="(user as any).role || 'Sin rol'"
                color="neutral"
                variant="soft"
                size="sm"
              />
            </td>

            <!-- Estado -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <div 
                  :class="[
                    'w-2 h-2 rounded-full',
                    getStatusColor((user as any).status)
                  ]"
                />
                <UBadge 
                  :label="getStatusLabel((user as any).status)"
                  :color="getStatusBadgeColor((user as any).status)"
                  variant="soft"
                  size="xs"
                />
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
                <UDropdown 
                  :items="getActionItems(user)"
                  :popper="{ placement: 'bottom-end' }"
                >
                  <UTooltip text="Más acciones">
                    <UButton 
                      icon="i-lucide-more-horizontal" 
                      size="xs" 
                      variant="ghost"
                    />
                  </UTooltip>
                </UDropdown>
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
  const base = "flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer transition-colors"
  return props.sortBy === column
    ? base + " text-gray-900 dark:text-gray-100"
    : base
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-400'
    case 'inactive': return 'bg-red-400'
    default: return 'bg-yellow-400'
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

const getActionItems = (user: UserListItem) => [
  [
    { label: "Ver detalles", icon: "i-lucide-eye", click: () => emit('viewUser', user) },
    { label: "Editar", icon: "i-lucide-edit", click: () => emit('editUser', user) },
  ],
  [
    {
      label: "Eliminar",
      icon: "i-lucide-trash-2",
      click: () => emit('deleteUser', user),
      color: "red" as const,
    },
  ],
]
</script>