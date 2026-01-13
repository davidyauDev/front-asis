<template>
  <div class="flex flex-col lg:flex-row gap-3">

    <!-- PANEL IZQUIERDO COMPACTO: AÑO + MES + RANGOS -->
    <div class="flex flex-col w-full lg:max-w-[280px] gap-3">

      <!-- AÑOS Y MESES COMBINADOS -->
      <UCard :ui="{ header: 'py-1.5', body: 'p-3' }">
        <template #header>
          <div class="text-xs font-medium">Período</div>
        </template>

        <!-- AÑOS - Dropdown compacto -->
        <div class="mb-3">
          <label class="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Año</label>
          <select 
            :value="calendarYear" 
            @change="goToYear(Number(($event.target as HTMLSelectElement).value))"
            class="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 bg-white dark:bg-gray-950 focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0"
          >
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- MESES - Grid compacto -->
        <div>
          <label class="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1 block">Mes</label>
          <div class="grid grid-cols-4 gap-1">
            <button
              v-for="m in months"
              :key="m.value"
              @click="goToMonth(m.value)"
              :class="[
                'text-[10px] px-1.5 py-1 rounded transition-colors',
                calendarMonth === m.value 
                  ? 'bg-primary text-white font-semibold' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
            >
              {{ m.label }}
            </button>
          </div>
        </div>
      </UCard>

      <!-- RANGOS RÁPIDOS COMPACTOS -->
      <UCard :ui="{ header: 'py-1.5', body: 'p-3' }">
        <template #header>
          <div class="text-xs font-medium">Selección rápida</div>
        </template>

        <div class="grid grid-cols-2 gap-1.5">
          <button
            @click="selectLastDays(7)"
            class="text-[10px] px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            7 días
          </button>
          <button
            @click="selectLastDays(15)"
            class="text-[10px] px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            15 días
          </button>
          <button
            @click="selectLastDays(30)"
            class="text-[10px] px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            30 días
          </button>
          <button
            @click="selectCurrentWeek"
            class="text-[10px] px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            Semana
          </button>
        </div>
      </UCard>
    </div>

    <!-- CALENDARIO -->
    <UCard class="flex-1" :ui="{ header: 'py-1.5' }">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium">
            Días
            <span v-if="selectedDaysCount > 0" class="ml-2 text-[10px] text-gray-500 dark:text-gray-400">
              ({{ selectedDaysCount }} {{ selectedDaysCount === 1 ? 'día' : 'días' }})
            </span>
          </span>
          <div class="flex gap-3">
            <UButton
              size="2xs"
              variant="outline"
              color="primary"
              icon="i-lucide-calendar-check"
              @click="selectAllDaysInMonth"
            >
              Mes
            </UButton>
            <UButton
              size="2xs"
              variant="outline"
              color="blue"
              icon="i-lucide-calendar-clock"
              @click="goToToday"
            >
              Hoy
            </UButton>
            <UButton
              size="xs"
              variant="outline"
              color="neutral"
              icon="i-lucide-x"
              @click="clearSelectionAndReset"
            >
              Limpiar
            </UButton>
          </div>
        </div>
      </template>

      <UCalendar
        multiple
        locale="es"
        :year-controls="false"
        v-model="calendar"
        v-model:placeholder="placeholder"
      />
    </UCard>
  </div>
</template>


<script setup lang="ts">
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { format } from 'date-fns'

/* =========================
   MODEL (ÚNICA FUENTE)
========================= */
const modelDates = defineModel<Date[]>('dates', {
  required: true,
  default: () => []
})

/* =========================
   PLACEHOLDER CALENDAR
========================= */
const today = new Date()

const placeholder = ref(
  new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  )
)

/* =========================
   CALENDAR BINDING
========================= */
const calendar = computed<CalendarDate[]>({
  get() {
    return modelDates.value.map(
      d => new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
    )
  },
  set(values) {
    modelDates.value = values.map(v =>
      v.toDate(getLocalTimeZone())
    )
  }
})

/* =========================
   DERIVED STATE (NO DUPLICADO)
========================= */
const calendarYear = computed(() => placeholder.value.year)
const calendarMonth = computed(() => placeholder.value.month)

/* =========================
   CONTROLS DATA
========================= */
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

const months = [
  { label: 'Ene', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Abr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Ago', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dic', value: 12 }
]

/* =========================
   NAVIGATION HELPERS
========================= */
const goToYear = (year: number) => {
  placeholder.value = new CalendarDate(
    year,
    placeholder.value.month,
    1
  )
}

const goToMonth = (month: number) => {
  placeholder.value = new CalendarDate(
    placeholder.value.year,
    month,
    1
  )
}

/* =========================
   SELECTION HELPERS
========================= */
const selectAllDaysInMonth = () => {
  const year = placeholder.value.year
  const month = placeholder.value.month
  
  // Obtener el número de días del mes
  const daysInMonth = new Date(year, month, 0).getDate()
  
  // Crear array con todos los días del mes
  const allDays: CalendarDate[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    allDays.push(new CalendarDate(year, month, day))
  }
  
  // Actualizar el modelo
  calendar.value = allDays
}

const clearSelection = () => {
  modelDates.value = []
}
</script>
