<template>
  <UDashboardNavbar>
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #title>
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Usuarios</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ totalUsers }} usuarios registrados
          </p>
        </div>
        
        <!-- Indicadores de estado -->
        <div class="hidden md:flex items-center gap-2">
          <UBadge 
            :label="`${activeUsers} activos`" 
            color="success" 
            variant="soft" 
            size="sm"
          />
          <UBadge 
            v-if="onlineUsers > 0"
            :label="`${onlineUsers} online`" 
            color="primary" 
            variant="soft" 
            size="sm"
          />
        </div>
      </div>
    </template>

    <template #right>
      <div class="flex items-center gap-2">
        

        <!-- Selector de vista mejorado -->
        <UButtonGroup size="sm" orientation="horizontal">
          <UButton
            v-for="mode in viewModeOptions"
            :key="mode.value"
            :icon="mode.icon"
            :variant="viewMode === mode.value ? 'solid' : 'outline'"
            :color="viewMode === mode.value ? 'primary' : 'neutral'"
            size="sm"
            @click="$emit('update:viewMode', mode.value as 'table' | 'grid' | 'compact')"
            :aria-label="mode.label"
          />
        </UButtonGroup>

        <!-- Dropdown de acciones -->
        <UDropdown :items="actionItems">
          <UButton 
            icon="i-lucide-more-horizontal" 
            color="neutral"
            variant="outline"
            size="sm"
          />
        </UDropdown>

        <!-- Botón principal -->
        <UButton 
          icon="i-lucide-plus" 
          color="primary"
          size="sm"
          :loading="isCreating"
          @click="$emit('createUser')"
        >
          Nuevo
        </UButton>
      </div>
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
interface Props {
  totalUsers: number
  activeUsers: number
  onlineUsers: number
  viewMode: 'table' | 'grid' | 'compact'
  isMobile: boolean
  isRefreshing: boolean
  isCreating: boolean
}

interface Emits {
  (e: 'update:viewMode', value: 'table' | 'grid' | 'compact'): void
  (e: 'refresh'): void
  (e: 'createUser'): void
  (e: 'export', type: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 🎨 Opciones de vista
const viewModeOptions = [
  { label: "Tabla", value: "table", icon: "i-lucide-table" },
  { label: "Grid", value: "grid", icon: "i-lucide-grid-3x3" },
  { label: "Compacta", value: "compact", icon: "i-lucide-list" },
]

// 🎨 Configuración de comandos rápidos
const searchCommands = [
  {
    id: 'new-user',
    label: 'Nuevo Usuario',
    icon: 'i-lucide-user-plus',
    click: () => emit('createUser')
  },
  {
    id: 'refresh',
    label: 'Actualizar',
    icon: 'i-lucide-refresh-cw',
    click: () => emit('refresh')
  },
  {
    id: 'export',
    label: 'Exportar',
    icon: 'i-lucide-download',
    click: () => emit('export', 'csv')
  }
]

// Dropdown de acciones
const actionItems = [
  [{
    label: 'Actualizar',
    icon: 'i-lucide-refresh-cw',
    click: () => emit('refresh'),
    disabled: props.isRefreshing
  }],
  [{
    label: 'Exportar CSV',
    icon: 'i-lucide-download',
    click: () => emit('export', 'csv')
  }, {
    label: 'Exportar Excel',
    icon: 'i-lucide-file-spreadsheet',
    click: () => emit('export', 'excel')
  }],
  [{
    label: 'Configuración',
    icon: 'i-lucide-settings',
    click: () => console.log('Settings')
  }]
]
</script>