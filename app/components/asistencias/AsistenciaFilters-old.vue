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
          size="2xs"
          @click="clearAllFilters"
          class="text-gray-500 hover:text-red-500"
        />
        
        <UButton
          :icon="collapsed ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
          variant="ghost"
          size="2xs"
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

        <UPopover>
          <UButton 
            variant="outline" 
            size="sm"
            :color="hasDateFilters ? 'primary' : 'gray'"
          >
            <UIcon name="i-lucide-calendar" class="w-4 h-4" />
            <span class="hidden sm:inline ml-1">Fechas</span>
          </UButton>
          
          <template #panel="{ close }">
            <div class="p-4 w-80">
              <h4 class="font-medium mb-3">Rango de fechas</h4>
              <div class="space-y-3">
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
                <div class="flex justify-end pt-2">
                  <UButton @click="close" size="xs" variant="outline">
                    Cerrar
                  </UButton>
                </div>
              </div>
            </div>
          </template>
        </UPopover>

        <!-- Botón de filtros avanzados -->
        <UPopover v-if="false">
          <UButton 
            variant="outline" 
            size="sm"
            :color="hasAdvancedFilters ? 'primary' : 'gray'"
          >
            <UIcon name="i-lucide-settings-2" class="w-4 h-4" />
            <span class="hidden sm:inline ml-1">Más</span>
          </UButton>
          
          <template #panel="{ close }">
            <div class="p-4 w-64 space-y-3">
              <h4 class="font-medium mb-3">Filtros avanzados</h4>
              
              <UFormGroup label="Mes" size="sm">
                <USelectMenu
                  v-model="localFilters.month"
                  :options="monthOptions"
                  placeholder="Seleccionar mes"
                  size="sm"
                  clearable
                />
              </UFormGroup>

              <UFormGroup label="Año" size="sm">
                <USelectMenu
                  v-model="localFilters.year"
                  :options="yearOptions"
                  placeholder="Seleccionar año"
                  size="sm"
                  clearable
                />
              </UFormGroup>

              <div class="flex justify-end pt-2 space-x-2">
                <UButton @click="applyFilters; close()" size="xs" color="primary">
                  Aplicar
                </UButton>
                <UButton @click="close" size="xs" variant="outline">
                  Cerrar
                </UButton>
              </div>
            </div>
          </template>
        </UPopover>
      </div>
    </UCollapse>
  </div>
        <!-- 🔍 Filtros principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          <!-- Búsqueda general -->
          <div class="lg:col-span-2 xl:col-span-2">
            <UFormGroup 
              label="Búsqueda General" 
              hint="Buscar por nombre, código de empleado, dispositivo..."
            >
              <UInput
                v-model="localFilters.search"
                icon="i-lucide-search"
                placeholder="Ej: Juan Pérez, EMP001..."
                :loading="loading"
                clearable
              />
            </UFormGroup>
          </div>

          <!-- Usuario específico -->
          <div>
            <UFormGroup label="Empleado" hint="Filtrar por empleado específico">
              <USelectMenu
                v-model="selectedUser"
                :options="usersOptions"
                placeholder="Todos los empleados"
                searchable
                clear-search-on-close
                :loading="loadingUsers"
                option-attribute="label"
                value-attribute="value"
                clearable
              >
              </USelectMenu>
            </UFormGroup>
          </div>

          <!-- Tipo de asistencia -->
          <div>
            <UFormGroup label="Tipo de Asistencia" hint="Entrada o salida">
              <USelectMenu
                v-model="localFilters.type"
                :options="attendanceTypeOptions"
                placeholder="Entrada y Salida"
                clearable
              />
            </UFormGroup>
          </div>
        </div>

        <!-- 📅 Filtros de fecha -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-calendar" class="w-4 h-4 text-blue-500" />
            Filtros de Fecha
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Fecha desde -->
            <div>
              <UFormGroup label="Fecha Desde">
                <UInput
                  v-model="localFilters.start_date"
                  type="date"
                  icon="i-lucide-calendar"
                />
              </UFormGroup>
            </div>

            <!-- Fecha hasta -->
            <div>
              <UFormGroup label="Fecha Hasta">
                <UInput
                  v-model="localFilters.end_date"
                  type="date"
                  icon="i-lucide-calendar"
                />
              </UFormGroup>
            </div>

            <!-- Mes específico -->
            <div>
              <UFormGroup label="Mes" hint="Filtro rápido por mes">
                <USelectMenu
                  v-model="selectedMonth"
                  :options="monthOptions"
                  placeholder="Cualquier mes"
                  clearable
                />
              </UFormGroup>
            </div>

            <!-- Año específico -->
            <div>
              <UFormGroup label="Año" hint="Filtro rápido por año">
                <USelectMenu
                  v-model="selectedYear"
                  :options="yearOptions"
                  placeholder="Cualquier año"
                  clearable
                />
              </UFormGroup>
            </div>

            <!-- Registros por página -->
            <div>
              <UFormGroup label="Por página" hint="Cantidad de registros">
                <USelectMenu
                  v-model="selectedPerPage"
                  :options="perPageOptions"
                  placeholder="15 registros"
                />
              </UFormGroup>
            </div>
          </div>
        </div>

        <!-- 🎯 Filtros rápidos mejorados -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <UIcon name="i-lucide-zap" class="w-4 h-4 text-yellow-500" />
                Filtros Rápidos
              </h4>
              <div class="flex items-center gap-2 flex-wrap">
                <UButton
                  size="xs"
                  :variant="isQuickFilterActive('today') ? 'solid' : 'outline'"
                  :color="isQuickFilterActive('today') ? 'primary' : 'neutral'"
                  @click="setQuickFilter('today')"
                  class="transition-all"
                >
                  <UIcon name="i-lucide-calendar-days" class="w-3 h-3 mr-1" />
                  Hoy
                </UButton>
                
                <UButton
                  size="xs"
                  :variant="isQuickFilterActive('yesterday') ? 'solid' : 'outline'"
                  :color="isQuickFilterActive('yesterday') ? 'primary' : 'neutral'"
                  @click="setQuickFilter('yesterday')"
                  class="transition-all"
                >
                  <UIcon name="i-lucide-calendar-minus" class="w-3 h-3 mr-1" />
                  Ayer
                </UButton>
                
                <UButton
                  size="xs"
                  :variant="isQuickFilterActive('this_week') ? 'solid' : 'outline'"
                  :color="isQuickFilterActive('this_week') ? 'primary' : 'neutral'"
                  @click="setQuickFilter('this_week')"
                  class="transition-all"
                >
                  <UIcon name="i-lucide-calendar-range" class="w-3 h-3 mr-1" />
                  Esta semana
                </UButton>
                
                <UButton
                  size="xs"
                  :variant="isQuickFilterActive('this_month') ? 'solid' : 'outline'"
                  :color="isQuickFilterActive('this_month') ? 'primary' : 'neutral'"
                  @click="setQuickFilter('this_month')"
                  class="transition-all"
                >
                  <UIcon name="i-lucide-calendar-month" class="w-3 h-3 mr-1" />
                  Este mes
                </UButton>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <UIcon name="i-lucide-filter" class="w-4 h-4 text-green-500" />
                Por Tipo
              </h4>
              <div class="flex items-center gap-2 flex-wrap">
                <UButton
                  size="xs"
                  :variant="isQuickFilterActive('check_in') ? 'solid' : 'outline'"
                  :color="isQuickFilterActive('check_in') ? 'success' : 'neutral'"
                  @click="setQuickFilter('check_in')"
                  class="transition-all"
                >
                  <UIcon name="i-lucide-log-in" class="w-3 h-3 mr-1" />
                  Solo Entradas
                </UButton>
                
                <UButton
                  size="xs"
                  :variant="isQuickFilterActive('check_out') ? 'solid' : 'outline'"
                  :color="isQuickFilterActive('check_out') ? 'error' : 'neutral'"
                  @click="setQuickFilter('check_out')"
                  class="transition-all"
                >
                  <UIcon name="i-lucide-log-out" class="w-3 h-3 mr-1" />
                  Solo Salidas
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 📊 Ordenamiento -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4 text-purple-500" />
            Ordenamiento
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Campo de ordenamiento -->
            <div>
              <UFormGroup label="Ordenar por">
                <USelectMenu
                  v-model="localFilters.sort_by"
                  :options="sortOptions"
                  placeholder="Fecha (más reciente)"
                />
              </UFormGroup>
            </div>

            <!-- Dirección de ordenamiento -->
            <div>
              <UFormGroup label="Dirección">
                <USelectMenu
                  v-model="localFilters.sort_order"
                  :options="sortOrderOptions"
                  placeholder="Descendente"
                />
              </UFormGroup>
            </div>
          </div>
        </div>

        <!-- 🎛️ Acciones -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <UButton
              type="submit"
              icon="i-lucide-search"
              :loading="loading"
              :disabled="loading"
              class="flex-1 sm:flex-none"
            >
              {{ loading ? 'Buscando...' : 'Aplicar Filtros' }}
            </UButton>
            
            <UButton
              variant="outline"
              icon="i-lucide-rotate-ccw"
              @click="clearAllFilters"
              :disabled="!hasActiveFilters || loading"
              class="flex-1 sm:flex-none"
            >
              Limpiar
            </UButton>
          </div>

          <div v-if="hasActiveFilters" class="text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-info" class="w-4 h-4 mr-1 inline" />
            {{ activeFiltersCount }} filtro{{ activeFiltersCount !== 1 ? 's' : '' }} activo{{ activeFiltersCount !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- 📊 Resumen de filtros activos mejorado -->
        <div v-if="hasActiveFilters" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-filter" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Filtros Aplicados
              </h5>
              <div class="flex items-center gap-2 flex-wrap">
                <UBadge
                  v-for="(filter, key) in activeFiltersDisplay"
                  :key="key"
                  variant="subtle"
                  color="primary"
                  class="flex items-center gap-1 text-xs"
                >
                  <span>{{ filter.label }}: {{ filter.value }}</span>
                  <UButton
                    icon="i-lucide-x"
                    size="xs"
                    variant="ghost"
                    @click="removeFilter(key as string)"
                    class="p-0 h-3 w-3 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full"
                  />
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </form>
    </UCollapse>
  </div>
</template>

<script setup lang="ts">
import type { AsistenciaFilters, AttendanceFilters } from '~/types'

interface Props {
  loading?: boolean
  modelValue?: AsistenciaFilters
}

interface Emits {
  (e: 'update:modelValue', filters: AsistenciaFilters): void
  (e: 'filtersChanged', filters: AsistenciaFilters): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  modelValue: () => ({})
})

const emit = defineEmits<Emits>()

// 📊 Estados
const collapsed = ref(false)
const localFilters = ref<AsistenciaFilters>({ ...props.modelValue })
const loadingUsers = ref(false)
const selectedUser = ref<any>(null)
const selectedMonth = ref<any>(null)
const selectedYear = ref<any>(null)
const selectedPerPage = ref<any>(null)

// 🎯 Composables
const { tiposRegistro } = useAsistencias()

// 👥 Cargar usuarios desde la API real
const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('Token no disponible para cargar usuarios')
      return
    }

    const response = await $fetch<any>('http://127.0.0.1:8000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    // Transformar usuarios al formato del select
    if (response.data) {
      usersOptions.value = response.data.map((user: any) => ({
        label: `${user.name} (${user.emp_code})`, 
        value: user.id, 
        name: user.name, 
        emp_code: user.emp_code,
        email: user.email
      }))
    }
  } catch (error) {
    console.error('Error cargando usuarios:', error)
    // Mantener usuarios mock como fallback
  } finally {
    loadingUsers.value = false
  }
}

// 👥 Opciones de usuarios (inicialmente mock, luego se cargan desde API)
const usersOptions = ref([
  { 
    label: 'Juan Pérez', 
    value: 157, 
    name: 'Juan Pérez', 
    emp_code: 'EMP001',
    email: 'juan.perez@empresa.com' 
  },
  { 
    label: 'María González', 
    value: 158, 
    name: 'María González', 
    emp_code: 'EMP002',
    email: 'maria.gonzalez@empresa.com' 
  },
  { 
    label: 'Carlos Rodríguez', 
    value: 159, 
    name: 'Carlos Rodríguez', 
    emp_code: 'EMP003',
    email: 'carlos.rodriguez@empresa.com' 
  },
  { 
    label: 'Ana López', 
    value: 160, 
    name: 'Ana López', 
    emp_code: 'EMP004',
    email: 'ana.lopez@empresa.com' 
  },
  { 
    label: 'Luis Martínez', 
    value: 161, 
    name: 'Luis Martínez', 
    emp_code: 'EMP005',
    email: 'luis.martinez@empresa.com' 
  }
])

// 📝 Opciones para selects
const attendanceTypeOptions = computed(() => [
  { 
    label: 'Solo Entradas', 
    value: 'check_in',
    icon: 'i-lucide-log-in',
    color: 'text-green-600'
  },
  { 
    label: 'Solo Salidas', 
    value: 'check_out',
    icon: 'i-lucide-log-out',
    color: 'text-red-600'
  }
])

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

const perPageOptions = [
  { label: '10 registros', value: 10 },
  { label: '15 registros', value: 15 },
  { label: '25 registros', value: 25 },
  { label: '50 registros', value: 50 },
  { label: '100 registros', value: 100 }
]

const sortOptions = [
  { label: 'Fecha de registro', value: 'timestamp' },
  { label: 'Fecha de creación', value: 'created_at' },
  { label: 'Usuario', value: 'user_id' },
  { label: 'Tipo de asistencia', value: 'type' }
]

const sortOrderOptions = [
  { label: 'Más reciente primero', value: 'desc' },
  { label: 'Más antiguo primero', value: 'asc' }
]

// 🧮 Computadas
const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(value => 
    value !== undefined && value !== null && value !== ''
  ) || selectedUser.value || selectedMonth.value || selectedYear.value || selectedPerPage.value
})

const activeFiltersCount = computed(() => {
  let count = 0
  Object.values(localFilters.value).forEach(value => {
    if (value !== undefined && value !== null && value !== '') count++
  })
  if (selectedUser.value) count++
  if (selectedMonth.value) count++
  if (selectedYear.value) count++
  if (selectedPerPage.value) count++
  return count
})

const activeFiltersDisplay = computed(() => {
  const display: Record<string, { label: string; value: string }> = {}
  
  if (localFilters.value.search) {
    display.search = { label: 'Búsqueda', value: localFilters.value.search }
  }
  
  if (selectedUser.value) {
    display.user_id = { label: 'Empleado', value: selectedUser.value.name || selectedUser.value.label }
  }
  
  if (localFilters.value.type) {
    const tipo = attendanceTypeOptions.value.find(t => t.value === localFilters.value.type)
    display.type = { label: 'Tipo', value: tipo?.label || localFilters.value.type }
  }
  
  if (localFilters.value.start_date) {
    display.start_date = { label: 'Desde', value: formatDisplayDate(localFilters.value.start_date) }
  }
  
  if (localFilters.value.end_date) {
    display.end_date = { label: 'Hasta', value: formatDisplayDate(localFilters.value.end_date) }
  }

  if (selectedMonth.value) {
    const month = monthOptions.find(m => m.value === selectedMonth.value)
    display.month = { label: 'Mes', value: month?.label || selectedMonth.value.toString() }
  }

  if (selectedYear.value) {
    display.year = { label: 'Año', value: selectedYear.value.toString() }
  }

  if (localFilters.value.sort_by) {
    const sort = sortOptions.find(s => s.value === localFilters.value.sort_by)
    display.sort_by = { label: 'Ordenar por', value: sort?.label || localFilters.value.sort_by }
  }

  if (localFilters.value.sort_order) {
    const order = sortOrderOptions.find(o => o.value === localFilters.value.sort_order)
    display.sort_order = { label: 'Orden', value: order?.label || localFilters.value.sort_order }
  }

  if (selectedPerPage.value) {
    display.per_page = { label: 'Por página', value: selectedPerPage.value.label || selectedPerPage.value.toString() }
  }
  
  return display
})

// 🛠️ Utilidades
const formatDisplayDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// 🎯 Funciones principales
const applyFilters = () => {
  // Combinar todos los filtros
  const combinedFilters: AsistenciaFilters = {
    ...localFilters.value,
    user_id: selectedUser.value?.value || undefined,
    month: selectedMonth.value || undefined,
    year: selectedYear.value || undefined,
    per_page: selectedPerPage.value?.value || undefined
  }

  // Limpiar valores vacíos
  Object.keys(combinedFilters).forEach(key => {
    const value = combinedFilters[key as keyof AsistenciaFilters]
    if (value === undefined || value === null || value === '') {
      delete combinedFilters[key as keyof AsistenciaFilters]
    }
  })

  emit('update:modelValue', combinedFilters)
  emit('filtersChanged', combinedFilters)
}

const clearAllFilters = () => {
  localFilters.value = {}
  selectedUser.value = null
  selectedMonth.value = null
  selectedYear.value = null
  selectedPerPage.value = null
  
  emit('update:modelValue', {})
  emit('filtersChanged', {})
}

const removeFilter = (key: string) => {
  if (key === 'user_id') {
    selectedUser.value = null
  } else if (key === 'month') {
    selectedMonth.value = null
  } else if (key === 'year') {
    selectedYear.value = null
  } else if (key === 'per_page') {
    selectedPerPage.value = null
  } else {
    delete localFilters.value[key as keyof AsistenciaFilters]
  }
  applyFilters()
}

const setQuickFilter = (type: string) => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  // Limpiar filtros de fecha primero para evitar conflictos
  localFilters.value.start_date = undefined
  localFilters.value.end_date = undefined
  localFilters.value.type = undefined
  selectedMonth.value = null
  selectedYear.value = null
  
  switch (type) {
    case 'today':
      localFilters.value.start_date = todayStr
      localFilters.value.end_date = todayStr
      break
      
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      localFilters.value.start_date = yesterdayStr
      localFilters.value.end_date = yesterdayStr
      break
      
    case 'this_week':
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      localFilters.value.start_date = startOfWeek.toISOString().split('T')[0]
      localFilters.value.end_date = todayStr
      break

    case 'this_month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      localFilters.value.start_date = startOfMonth.toISOString().split('T')[0]
      localFilters.value.end_date = todayStr
      break
      
    case 'check_in':
      localFilters.value.type = 'check_in'
      break
      
    case 'check_out':
      localFilters.value.type = 'check_out'
      break
  }
  
  applyFilters()
}

const isQuickFilterActive = (type: string): boolean => {
  const today = new Date().toISOString().split('T')[0]
  
  switch (type) {
    case 'today':
      return localFilters.value.start_date === today && localFilters.value.end_date === today
      
    case 'yesterday':
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      return localFilters.value.start_date === yesterdayStr && localFilters.value.end_date === yesterdayStr
      
    case 'this_week':
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const startStr = startOfWeek.toISOString().split('T')[0]
      return localFilters.value.start_date === startStr && localFilters.value.end_date === today
      
    case 'this_month':
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      const startMonthStr = startOfMonth.toISOString().split('T')[0]
      return localFilters.value.start_date === startMonthStr && localFilters.value.end_date === today
      
    case 'check_in':
      return localFilters.value.type === 'check_in'
      
    case 'check_out':
      return localFilters.value.type === 'check_out'
      
    default:
      return false
  }
}

// 🔄 Watchers
watch(() => props.modelValue, (newValue) => {
  localFilters.value = { ...newValue }
  
  // Sincronizar los selectores especiales
  if (newValue.user_id) {
    selectedUser.value = usersOptions.value.find(u => u.value === newValue.user_id) || null
  }
  if (newValue.month) {
    selectedMonth.value = newValue.month
  }
  if (newValue.year) {
    selectedYear.value = newValue.year
  }
  if (newValue.per_page) {
    selectedPerPage.value = perPageOptions.find(p => p.value === newValue.per_page) || null
  }
}, { deep: true })

// Auto-aplicar filtros cuando cambia la búsqueda (con debounce)
watchDebounced(
  () => localFilters.value.search,
  () => {
    if (localFilters.value.search !== props.modelValue.search) {
      applyFilters()
    }
  },
  { debounce: 500 }
)

// Watchers para los selectores especiales
watch(selectedUser, (newUser) => {
  if (newUser?.value !== localFilters.value.user_id) {
    applyFilters()
  }
})

watch(selectedMonth, (newMonth) => {
  if (newMonth !== localFilters.value.month) {
    applyFilters()
  }
})

watch(selectedYear, (newYear) => {
  if (newYear !== localFilters.value.year) {
    applyFilters()
  }
})

watch(selectedPerPage, (newPerPage) => {
  if (newPerPage?.value !== localFilters.value.per_page) {
    applyFilters()
  }
})

// 🎬 Ciclo de vida
onMounted(() => {
  // Establecer valores por defecto
  selectedPerPage.value = perPageOptions[1] // 15 registros
  localFilters.value.sort_by = 'timestamp'
  localFilters.value.sort_order = 'desc'
  
  // Cargar usuarios desde la API
  loadUsers()
})
</script>

<style scoped>
/* Mejoras visuales para los filtros */
.filter-section {
  transition: all 0.3s ease;
}

.filter-section:hover {
  background-color: rgba(249, 250, 251, 0.5);
}

.dark .filter-section:hover {
  background-color: rgba(31, 41, 55, 0.3);
}

/* Animaciones para los filtros rápidos */
.quick-filter-btn {
  transition: all 0.2s ease;
}

.quick-filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Estilos para badges de filtros activos */
.filter-badge {
  transition: all 0.2s ease;
}

.filter-badge:hover {
  transform: scale(1.02);
}

/* Mejoras para el estado colapsado */
.collapse-transition {
  transition: all 0.3s ease;
}

/* Estados de focus mejorados */
.form-input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-color: #3b82f6;
}

.dark .form-input:focus {
  outline-color: #60a5fa;
  border-color: #60a5fa;
}

/* Animaciones para loading states */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Mejoras responsive */
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-filters {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .quick-filter-btn {
    flex: 1;
    min-width: fit-content;
  }
}

/* Estados de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .filter-section,
  .quick-filter-btn,
  .filter-badge,
  .collapse-transition {
    transition: none;
  }
  
  .quick-filter-btn:hover {
    transform: none;
  }
}

/* Alto contraste para mejor accesibilidad */
@media (prefers-contrast: high) {
  .filter-badge {
    border: 2px solid currentColor;
  }
  
  .quick-filter-btn {
    border: 2px solid currentColor;
  }
}
</style>