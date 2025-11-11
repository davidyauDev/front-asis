<template>
  <div class="p-4">
    <!-- 🎯 Header compacto -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-filter" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Filtros</h3>
        <UBadge v-if="hasActiveFilters" variant="soft" color="primary" size="xs">
          {{ activeFiltersCount }}
        </UBadge>
      </div>
      
      <div class="flex items-center space-x-1">
        <UButton
          v-if="hasActiveFilters"
          icon="i-lucide-x"
          variant="ghost"
          size="xs"
          @click="clearAllFilters"
          class="text-gray-500 hover:text-red-500"
        />
        
        <UButton
          :icon="collapsed ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
          variant="ghost"
          size="xs"
          @click="collapsed = !collapsed"
          class="text-gray-500"
        />
      </div>
    </div>

    <UCollapse :open="!collapsed">
      <!-- 🚀 Filtros rápidos en una sola línea -->
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <!-- Búsqueda rápida -->
        <div class="flex-1 min-w-0">
          <UInput
            v-model="localFilters.search"
            placeholder="Buscar empleado, dispositivo..."
            icon="i-lucide-search"
            size="sm"
            @input="debouncedApplyFilters"
            class="w-full"
          />
        </div>

        <!-- Filtros rápidos -->
        <USelectMenu
          v-model="localFilters.user_id"
          :options="userOptions"
          placeholder="Empleado"
          size="sm"
          class="w-36"
          clearable
          searchable
          :loading="loadingUsers"
        />

        <USelectMenu
          v-model="localFilters.type"
          :options="quickTypeOptions"
          placeholder="Tipo"
          size="sm"
          class="w-24"
          clearable
        />

        <!-- Botón de fechas simple -->
        <UButton 
          variant="outline" 
          size="sm"
          :color="hasDateFilters ? 'primary' : 'neutral'"
          @click="toggleDateFilters"
        >
          <UIcon name="i-lucide-calendar" class="w-4 h-4" />
          <span class="hidden sm:inline ml-1">Fechas</span>
        </UButton>

        <!-- Botón de filtros avanzados simple -->
        <UButton 
          variant="outline" 
          size="sm"
          :color="hasAdvancedFilters ? 'primary' : 'neutral'"
          @click="toggleAdvancedFilters"
        >
          <UIcon name="i-lucide-settings-2" class="w-4 h-4" />
          <span class="hidden sm:inline ml-1">Más</span>
        </UButton>
      </div>

      <!-- 📅 Filtros de fecha expandidos -->
      <div v-if="showDateFilters" class="grid grid-cols-2 gap-3 mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <UFormGroup label="Desde" size="sm">
          <UInput
            v-model="localFilters.start_date"
            type="date"
            size="sm"
            @change="applyFilters"
          />
        </UFormGroup>
        <UFormGroup label="Hasta" size="sm">
          <UInput
            v-model="localFilters.end_date"
            type="date"
            size="sm"
            @change="applyFilters"
          />
        </UFormGroup>
      </div>

      <!-- ⚙️ Filtros avanzados expandidos -->
      <div v-if="showAdvancedFilters" class="grid grid-cols-2 gap-3 mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <UFormGroup label="Mes" size="sm">
          <USelectMenu
            v-model="localFilters.month"
            :options="monthOptions"
            placeholder="Seleccionar mes"
            size="sm"
            clearable
            @update:model-value="applyFilters"
          />
        </UFormGroup>
        <UFormGroup label="Año" size="sm">
          <USelectMenu
            v-model="localFilters.year"
            :options="yearOptions"
            placeholder="Seleccionar año"
            size="sm"
            clearable
            @update:model-value="applyFilters"
          />
        </UFormGroup>
      </div>
    </UCollapse>
  </div>
</template>

<script setup lang="ts">
import type { AsistenciaFilters, AttendanceFilters } from '~/types'

// 🎯 Props & Emits
interface Props {
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'filters-changed': [filters: AsistenciaFilters]
  'apply': [filters: AsistenciaFilters]
}>()

// 📊 Estados reactivos
const collapsed = ref(false)
const loadingUsers = ref(false)
const userOptions = ref<Array<{ label: string; value: number }>>([])
const showDateFilters = ref(false)
const showAdvancedFilters = ref(false)

// 📝 Filtros locales
const localFilters = ref<AsistenciaFilters>({
  search: '',
  user_id: undefined,
  type: undefined,
  start_date: '',
  end_date: '',
  month: undefined,
  year: undefined,
  sort_by: 'created_at',
  sort_order: 'desc',
  per_page: 15
})

// 🎨 Opciones para selects
const quickTypeOptions = [
  { label: 'Entrada', value: 'check_in' },
  { label: 'Salida', value: 'check_out' }
]

const monthOptions = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
]

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push({ label: i.toString(), value: i })
  }
  return years
})

// 🧮 Computed
const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(value => 
    value !== undefined && value !== '' && value !== null
  )
})

const activeFiltersCount = computed(() => {
  return Object.values(localFilters.value).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length
})

const hasDateFilters = computed(() => {
  return !!(localFilters.value.start_date || localFilters.value.end_date)
})

const hasAdvancedFilters = computed(() => {
  return !!(localFilters.value.month || localFilters.value.year)
})

// 🎯 Funciones
const applyFilters = () => {
  emit('filters-changed', { ...localFilters.value })
  emit('apply', { ...localFilters.value })
}

const debouncedApplyFilters = useDebounceFn(applyFilters, 500)

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    user_id: undefined,
    type: undefined,
    start_date: '',
    end_date: '',
    month: undefined,
    year: undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 15
  }
  applyFilters()
}

const toggleDateFilters = () => {
  showDateFilters.value = !showDateFilters.value
}

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

// 🚀 Cargar usuarios
const loadUsers = async () => {
  try {
    loadingUsers.value = true
    const token = localStorage.getItem('auth_token')
    if (!token) return

    const response = await $fetch<any>('http://127.0.0.1:8000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    userOptions.value = response.data?.map((user: any) => ({
      label: user.name,
      value: user.id
    })) || []
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loadingUsers.value = false
  }
}

// 🎪 Lifecycle
onMounted(() => {
  loadUsers()
})
</script>