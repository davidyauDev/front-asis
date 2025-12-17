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
    </div>

    <!-- CALENDARIO -->
    <UCard class="flex-1" :ui="{ header: 'py-2' }">
      <template #header>Días</template>

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
const years = ['2025', '2024']

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
</script>
