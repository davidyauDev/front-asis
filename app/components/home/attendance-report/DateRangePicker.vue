<template>
  <div class="flex flex-col lg:flex-row gap-4">

    <!-- PANEL IZQUIERDO: AÑO + MES -->
    <div class="flex flex-col w-full lg:max-w-sm gap-4">

      <!-- AÑOS -->
      <UCard :ui="{ header: 'py-2' }">
        <template #header>Año</template>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="y in years"
            :key="y"
            size="sm"
            :variant="calendarYear === Number(y) ? 'solid' : 'outline'"
            :color="calendarYear === Number(y) ? 'primary' : 'neutral'"
            @click="goToYear(Number(y))"
          >
            {{ y }}
          </UButton>
        </div>
      </UCard>

      <!-- MESES -->
      <UCard :ui="{ header: 'py-2' }">
        <template #header>Mes</template>

        <div class="grid grid-cols-3 gap-2">
          <UButton
            v-for="m in months"
            :key="m.value"
            size="xs"
            :variant="calendarMonth === m.value ? 'solid' : 'outline'"
            :color="calendarMonth === m.value ? 'primary' : 'neutral'"
            @click="goToMonth(m.value)"
          >
            {{ m.label }}
          </UButton>
        </div>
      </UCard>

      <!-- RANGOS RÁPIDOS -->
      <UCard :ui="{ header: 'py-2' }">
        <template #header>Selección rápida</template>

        <div class="flex flex-col gap-2">
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-calendar-days"
            @click="selectLastDays(7)"
            block
          >
            Últimos 7 días
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-calendar-days"
            @click="selectLastDays(15)"
            block
          >
            Últimos 15 días
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-calendar-days"
            @click="selectLastDays(30)"
            block
          >
            Últimos 30 días
          </UButton>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            icon="i-lucide-calendar-range"
            @click="selectCurrentWeek"
            block
          >
            Semana actual
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- CALENDARIO -->
    <UCard class="flex-1" :ui="{ header: 'py-2' }">
      <template #header>
        <div class="flex items-center justify-between">
          <span>
            Días
            <span v-if="selectedDaysCount > 0" class="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({{ selectedDaysCount }} {{ selectedDaysCount === 1 ? 'día' : 'días' }})
            </span>
          </span>
          <div class="flex gap-2">
            <UButton
              size="xs"
              variant="outline"
              color="primary"
              icon="i-lucide-calendar-check"
              @click="selectAllDaysInMonth"
            >
              Mes completo
            </UButton>
            <UButton
              size="xs"
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
const selectedDaysCount = computed(() => modelDates.value.length)

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
  
  // Obtener el número de días del mes (month está en 1-12, Date usa 0-11)
  const daysInMonth = new Date(year, month, 0).getDate()
  
  // Validar que no sean fechas futuras
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  const allDays: CalendarDate[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dateToAdd = new Date(year, month - 1, day)
    // Solo agregar si no es fecha futura
    if (dateToAdd <= today) {
      allDays.push(new CalendarDate(year, month, day))
    }
  }
  
  calendar.value = allDays
}

const selectLastDays = (days: number) => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  const currentViewYear = placeholder.value.year
  const currentViewMonth = placeholder.value.month
  
  // Verificar si el usuario está viendo el mes actual
  const isCurrentMonth = currentViewYear === today.getFullYear() && 
                         currentViewMonth === (today.getMonth() + 1)
  
  let endDate: Date
  
  if (isCurrentMonth) {
    // Si está en el mes actual, usar hoy como fecha final
    endDate = new Date(today)
  } else {
    // Si está en otro mes, usar el último día de ese mes como fecha final
    endDate = new Date(currentViewYear, currentViewMonth, 0)
    endDate.setHours(23, 59, 59, 999)
    
    // Validar que no sea fecha futura
    if (endDate > today) {
      endDate = new Date(today)
    }
  }
  
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - (days - 1))
  startDate.setHours(0, 0, 0, 0)
  
  const selectedDays: CalendarDate[] = []
  
  // Clonar fecha para evitar mutaciones
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    selectedDays.push(
      new CalendarDate(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate()
      )
    )
  }
  
  calendar.value = selectedDays
  
  // Mantener el mes actual de visualización o ir al mes con más días
  if (!isCurrentMonth) {
    // Si no estamos en el mes actual, quedarnos en el mes que el usuario seleccionó
    // solo si la mayoría de días están en ese mes
    const daysInViewMonth = selectedDays.filter(d => 
      d.year === currentViewYear && d.month === currentViewMonth
    ).length
    
    if (daysInViewMonth >= days / 2) {
      // La mayoría de días están en el mes actual, mantener la vista
      return
    }
  }
  
  // Determinar el mes más relevante para mostrar
  const monthCounts = new Map<string, { year: number, month: number, count: number }>()
  
  selectedDays.forEach(day => {
    const key = `${day.year}-${day.month}`
    const existing = monthCounts.get(key)
    if (existing) {
      existing.count++
    } else {
      monthCounts.set(key, { year: day.year, month: day.month, count: 1 })
    }
  })
  
  // Encontrar el mes con más días seleccionados
  let maxCount = 0
  let targetYear = endDate.getFullYear()
  let targetMonth = endDate.getMonth() + 1
  
  monthCounts.forEach(({ year, month, count }) => {
    if (count > maxCount) {
      maxCount = count
      targetYear = year
      targetMonth = month
    }
  })
  
  placeholder.value = new CalendarDate(targetYear, targetMonth, 1)
}

const selectCurrentWeek = () => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  const dayOfWeek = today.getDay() // 0 = Domingo, 1 = Lunes, ...
  
  // Calcular el lunes de esta semana (inicio de semana)
  const startOfWeek = new Date(today)
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startOfWeek.setDate(today.getDate() + diff)
  startOfWeek.setHours(0, 0, 0, 0)
  
  // Calcular el domingo (fin de semana), pero sin pasar de hoy
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  // No seleccionar días futuros
  const maxDate = endOfWeek > today ? today : endOfWeek
  
  const selectedDays: CalendarDate[] = []
  
  // Iterar sin mutar la fecha original
  for (let d = new Date(startOfWeek); d <= maxDate; d.setDate(d.getDate() + 1)) {
    selectedDays.push(
      new CalendarDate(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate()
      )
    )
  }
  
  calendar.value = selectedDays
  
  // Determinar el mes con más días en la semana
  const monthCounts = new Map<string, { year: number, month: number, count: number }>()
  
  selectedDays.forEach(day => {
    const key = `${day.year}-${day.month}`
    const existing = monthCounts.get(key)
    if (existing) {
      existing.count++
    } else {
      monthCounts.set(key, { year: day.year, month: day.month, count: 1 })
    }
  })
  
  // Encontrar el mes con más días en la semana
  let maxCount = 0
  let targetYear = today.getFullYear()
  let targetMonth = today.getMonth() + 1
  
  monthCounts.forEach(({ year, month, count }) => {
    if (count > maxCount) {
      maxCount = count
      targetYear = year
      targetMonth = month
    }
  })
  
  // Actualizar placeholder al mes más relevante
  placeholder.value = new CalendarDate(targetYear, targetMonth, 1)
}

const goToToday = () => {
  const today = new Date()
  
  // Navegar al mes actual
  placeholder.value = new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  )
  
  // Seleccionar el día de hoy
  calendar.value = [
    new CalendarDate(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    )
  ]
}

const clearSelection = () => {
  modelDates.value = []
}

const clearSelectionAndReset = () => {
  // Limpiar selección
  modelDates.value = []
  
  // Regresar al mes actual
  const today = new Date()
  placeholder.value = new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  )
}
</script>
