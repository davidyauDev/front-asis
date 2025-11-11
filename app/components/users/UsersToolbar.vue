<template>
  <div>
    <UDashboardToolbar>
      <template #left>
        <div class="flex items-center gap-3">
          <!-- Búsqueda con autocompletado -->
          <UInputMenu
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            :options="searchOptions"
            placeholder="Buscar usuarios..."
            icon="i-lucide-search"
            class="w-80"
            :loading="loading"
            size="sm"
            option-attribute="label"
            trailing-icon="i-lucide-command"
          />

          <!-- Toggle filtros -->
          <UButton
            :icon="showFilters ? 'i-lucide-x' : 'i-lucide-filter'"
            variant="outline"
            size="sm"
            @click="$emit('update:showFilters', !showFilters)"
            :color="showFilters ? 'primary' : 'neutral'"
            :label="showFilters ? 'Ocultar filtros' : `Filtros${hasActiveFilters ? ' activos' : ''}`"
          />
          
          <!-- Chips de filtros activos -->
          <div v-if="hasActiveFilters" class="flex items-center gap-1">
            <UChip 
              v-if="selectedRole"
              :text="selectedRole"
              color="primary"
              variant="soft"
              size="sm"
              @click="$emit('update:selectedRole', '')"
            />
            <UChip 
              v-if="selectedStatus"
              :text="selectedStatus"
              color="success"
              variant="soft"  
              size="sm"
              @click="$emit('update:selectedStatus', '')"
            />
          </div>
        </div>
      </template>

      <template #right>
        <div class="flex items-center gap-3">
          <!-- Información de paginación -->
          <div class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            <span v-if="paginationInfo.totalItems">
              {{ paginationInfo.from }}-{{ paginationInfo.to }} de {{ paginationInfo.totalItems }}
            </span>
          </div>

          <!-- Selector de elementos por página -->
          <USelectMenu
            :model-value="selectedPerPage"
            @update:model-value="$emit('update:selectedPerPage', $event)"
            :options="perPageOptions"
            size="xs"
            :loading="loading"
            class="w-20"
          />
          
          <!-- Indicador de última actualización -->
          <UTooltip :text="`Última actualización: ${lastUpdated.toLocaleTimeString()}`">
            <div class="text-xs text-gray-400 cursor-help">
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
            </div>
          </UTooltip>
        </div>
      </template>
    </UDashboardToolbar>

    <!-- Panel de filtros mejorado -->
    <UCard 
      v-if="showFilters" 
      class="border-x-0 border-t-0 border-b border-gray-200 dark:border-gray-800 rounded-none bg-gray-50/50 dark:bg-gray-900/50"
    >
      <div class="p-4">
        <div class="flex flex-wrap items-center gap-4">
          <UFormGroup label="Rol" size="sm">
            <USelectMenu
              :model-value="selectedRole"
              @update:model-value="$emit('update:selectedRole', $event)"
              :options="roleOptions"
              placeholder="Seleccionar rol"
              size="sm"
              class="w-48"
              clearable
            />
          </UFormGroup>
          
          <UFormGroup label="Estado" size="sm">
            <USelectMenu
              :model-value="selectedStatus"
              @update:model-value="$emit('update:selectedStatus', $event)"
              :options="statusOptions"
              placeholder="Seleccionar estado"
              size="sm"
              class="w-48"
              clearable
            />
          </UFormGroup>

          <!-- Rango de fechas -->
          <UFormGroup label="Registrado" size="sm">
            <UButton 
              icon="i-lucide-calendar-range"
              variant="outline"
              size="sm"
              class="w-48"
              @click="console.log('Abrir selector de fechas')"
            >
              Seleccionar período
            </UButton>
          </UFormGroup>

          <div class="flex-1"></div>

          <!-- Acciones de filtros -->
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              size="sm"
              icon="i-lucide-eraser"
              @click="$emit('clearFilters')"
            >
              Limpiar todo
            </UButton>
            
            <UButton
              color="primary"
              size="sm"
              icon="i-lucide-search"
              @click="$emit('applyFilters')"
            >
              Aplicar
            </UButton>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { UserListItem } from "~/types"

interface Props {
  search: string
  showFilters: boolean
  selectedRole: string
  selectedStatus: string
  selectedPerPage: number
  loading: boolean
  lastUpdated: Date
  users: readonly UserListItem[]
  paginationInfo: {
    from: number
    to: number
    totalItems: number
  }
}

const props = defineProps<Props>()
const emit = defineEmits([
  'update:search',
  'update:showFilters',
  'update:selectedRole',
  'update:selectedStatus',
  'update:selectedPerPage',
  'clearFilters',
  'applyFilters',
  'openUserPreview'
])

// Opciones computadas
const searchOptions = computed(() => 
  props.users.map(u => ({ 
    id: u.id, 
    label: u.name, 
    icon: 'i-lucide-user',
    suffix: u.email,
    click: () => emit('openUserPreview', u)
  }))
)

const hasActiveFilters = computed(() => 
  props.selectedRole || props.selectedStatus
)

// 📄 Opciones por página
const perPageOptions = [
  { label: "5 por página", value: 5 },
  { label: "10 por página", value: 10 },
  { label: "15 por página", value: 15 },
  { label: "25 por página", value: 25 },
  { label: "50 por página", value: 50 },
]

// 🏷️ Opciones de filtros
const roleOptions = [
  { label: "Todos los roles", value: "" },
  { label: "Gerente", value: "Gerente" },
  { label: "Jefe de Área", value: "Jefe de Área" },
  { label: "Supervisor", value: "Supervisor" },
  { label: "Técnico", value: "Técnico" },
  { label: "Administrativo", value: "Administrativo" },
]

const statusOptions = [
  { label: "Todos los estados", value: "" },
  { label: "Activo", value: "active" },
  { label: "Inactivo", value: "inactive" },
  { label: "Pendiente", value: "pending" },
]
</script>