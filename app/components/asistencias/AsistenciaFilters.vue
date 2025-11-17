<template>
  <div class="p-4 space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <UIcon name="i-lucide-filter" class="w-4 h-4 text-primary-600" />
        <h3 class="text-sm font-semibold">Filtros</h3>

        <UBadge
          v-if="activeFiltersCount > 0"
          color="primary"
          variant="soft"
          size="xs"
        >
          {{ activeFiltersCount }}
        </UBadge>
      </div>

      <div class="flex items-center space-x-1">
        <UButton
          v-if="activeFiltersCount > 0"
          icon="i-lucide-trash-2"
          color="primary"
          variant="ghost"
          size="xs"
          @click="clearAllFilters"
        >
          Limpiar
        </UButton>
        <UButton
          :icon="collapsed ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
          variant="ghost"
          size="xs"
          @click="collapsed = !collapsed"
        />
      </div>
    </div>

    <UCollapse :open="!collapsed">
      <div class="space-y-4">

        <div class="flex flex-wrap items-center gap-2">
          <!-- Search -->
          <UInput
            v-model="localFilters.search"
            placeholder="Buscar empleado, dispositivo..."
            icon="i-lucide-search"
            size="sm"
            class="flex-1"
            @input="debouncedApplyFilters"
          />

          <!-- Tipo -->
          <USelect
            v-model="localFilters.type"
            :items="quickTypeOptions"
            placeholder="Tipo"
            size="sm"
            clearable
            class="w-32"
            @update:model-value="applyFilters"
          />

          <!-- Fecha -->
          <UButton
            variant="soft"
            :color="hasDateFilters ? 'primary' : 'gray'"
            size="sm"
            icon="i-lucide-calendar"
            @click="toggleDateFilters"
          >
            Fechas
          </UButton>

          <!-- Avanzado -->
          <UButton
            variant="soft"
            :color="hasAdvancedFilters ? 'primary' : 'gray'"
            size="sm"
            icon="i-lucide-settings-2"
            @click="toggleAdvancedFilters"
          >
            Más
          </UButton>
        </div>

        <!-- 📅 DATE FILTERS -->
        <Transition name="fade">
          <div
            v-if="showDateFilters"
            class="grid grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40"
          >
            <UFormGroup label="Desde">
              <UInput
                v-model="localFilters.start_date"
                type="date"
                size="sm"
                @change="applyFilters"
              />
            </UFormGroup>

            <UFormGroup label="Hasta">
              <UInput
                v-model="localFilters.end_date"
                type="date"
                size="sm"
                @change="applyFilters"
              />
            </UFormGroup>
          </div>
        </Transition>

        <!-- ⚙ ADVANCED FILTERS -->
        <Transition name="fade">
          <div
            v-if="showAdvancedFilters"
            class="grid grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40"
          >
            <UFormGroup label="Mes">
              <USelect
                v-model="localFilters.month"
                :items="monthOptions"
                size="sm"
                clearable
                @update:model-value="applyFilters"
              />
            </UFormGroup>

            <UFormGroup label="Año">
              <USelect
                v-model="localFilters.year"
                :items="yearOptions"
                size="sm"
                clearable
                @update:model-value="applyFilters"
              />
            </UFormGroup>
          </div>
        </Transition>

      </div>
    </UCollapse>

  </div>
</template>

<script setup lang="ts">
import type { AsistenciaFilters } from '~/types'
import type { SelectItem } from '@nuxt/ui'

const emit = defineEmits<{
  'apply': [filters: AsistenciaFilters]
  'filters-changed': [filters: AsistenciaFilters]
}>()

/* -------------------- STATE -------------------- */
const collapsed = ref(false)
const showDateFilters = ref(false)
const showAdvancedFilters = ref(false)

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

const quickTypeOptions: SelectItem[] = [
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
  const years = []
  const now = new Date().getFullYear()
  for (let y = now; y >= now - 5; y--) {
    years.push({ label: y.toString(), value: y })
  }
  return years
})

/* -------------------- COMPUTED -------------------- */
const activeFiltersCount = computed(() => {
  return Object.entries(localFilters.value)
    .filter(([k, v]) => v !== '' && v !== undefined && v !== null)
    .length
})

const hasDateFilters = computed(() => !!localFilters.value.start_date || !!localFilters.value.end_date)
const hasAdvancedFilters = computed(() => !!localFilters.value.month || !!localFilters.value.year)

/* -------------------- METHODS -------------------- */
const applyFilters = () => {
  emit('filters-changed', { ...localFilters.value })
  emit('apply', { ...localFilters.value })
}

const debouncedApplyFilters = useDebounceFn(applyFilters, 500)

const clearAllFilters = () => {
  Object.assign(localFilters.value, {
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
  applyFilters()
}

const toggleDateFilters = () => (showDateFilters.value = !showDateFilters.value)
const toggleAdvancedFilters = () => (showAdvancedFilters.value = !showAdvancedFilters.value)
</script>


