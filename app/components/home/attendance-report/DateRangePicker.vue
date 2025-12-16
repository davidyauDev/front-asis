<template>
  <div class="flex items-center gap-2 sm:divide-x divide-default">


    <div class="flex flex-col w-full md:max-w-xs xl:max-w-md gap-2 justify-center">

      <!-- AÑOS -->
      <UCard :ui="{
        header: 'py-2'
      }">
        <template #header>Año</template>
        <div class="flex gap-2 flex-wrap">
          <UButton v-for="y in years" :key="y" class="cursor-pointer"
            :class="selectedYear !== y && 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100  text-gray-700 border transition'"
            @click="selectYear(y)">
            {{ y }}
          </UButton>
        </div>
      </UCard>

      <!-- MESES -->
      <UCard :ui="{
        header: 'py-2'
      }">
        <template #header>Mes</template>
        <div class="flex gap-2 flex-wrap">
          <UButton v-for="month in months" :key="month.value" class="cursor-pointer"
            :class="selectedMonth !== month.value.toString() && 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100  text-gray-700 border transition'"
            @click="selectMonth(month.value)">
            {{ month.label }}
          </UButton>
        </div>
      </UCard>

    </div>

    <!-- CALENDARIO -->
    <UCard class="w-full" :ui="{
      header: 'py-2'
    }">
      <template #header>Días</template>
      

       <UCalendar multiple v-model="calendar" locale="es" :year-controls="false"  @update:placeholder="(value) => {
  selectedMonth = value.month.toString()
  selectedYear = value.year.toString()
}"
/>

    </UCard>
  </div>
</template>


<script setup lang="ts">
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import { format } from 'date-fns';

const currentDateModel = defineModel<Date[]>('dates', {
  required: true,
  default: () => []
})





const toCalendarDate = (date: Date) => {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
}


const calendar = computed<CalendarDate[]>({
  get: () => {
    if (!Array.isArray(currentDateModel.value)) return []

    return currentDateModel.value.map(date =>
      new CalendarDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      )
    )
  },

  set: (newValues) => {
    if (!Array.isArray(newValues)) {
      currentDateModel.value = []
      return
    }

    currentDateModel.value = newValues.map(cd =>
      cd.toDate(getLocalTimeZone())
    )
  }
})


// --- AÑOS ---
const years = ['2025', '2024']
const selectedYear = ref(format(new Date(), 'yyyy'))

// --- MESES ---
const months = [
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

const selectedMonth = ref((new Date().getMonth() + 1).toString())

// --- Cambiar año ---
const selectYear = (year: string) => {
  selectedYear.value = year
  // si ya hay un mes seleccionado: mantenerlo
  const month = Number(selectedMonth.value) || 1
  calendar.value = new CalendarDate(Number(year), month, 1)
}

// --- Cambiar mes ---
const selectMonth = (month: number) => {
  selectedMonth.value = month.toString()
  const year = Number(selectedYear.value)
  calendar.value = new CalendarDate(Number(year), month, 1)
}
</script>
