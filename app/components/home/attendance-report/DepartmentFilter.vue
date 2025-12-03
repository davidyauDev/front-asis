<template>
  <UCard :ui="{
    header: 'p-2'
  }">
    <template #header>
      Departmento
    </template>
    <div class="flex flex-wrap max-h-48 overflow-y-auto gap-2" :class="extraClass">
      <UButton v-for="item in department.list" :key="item.id" class="cursor-pointer"
        :class="!selected.includes(item) && 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100  text-gray-700 border transition'"
        @click="selected = selected.includes(item)
          ? selected.filter(s => s?.id !== item.id)
          : [...selected, item]">


        {{ item.dept_name }}
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">

import { ref } from 'vue'

const { class: extraClass } = defineProps({
  class: String,
})

// import { ref } from 'vue'
import { type Company, type Department } from '~/composables/useAttendanceReport'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';


const store = useAttendanceReportStore();
const { company, department } = storeToRefs(store);


// const selected = ref<Company[]>(company.value.list)

const departments = ref([
  { id: 1, name: "ADM_Cech..." },
  { id: 2, name: "Ingenieros_C" },
  { id: 3, name: "Operacion..." },
  { id: 4, name: "Sistemas_C" },
  { id: 5, name: "SSGG_C" },
  { id: 6, name: "TEC_Lima_C" },
  { id: 7, name: "TEC_Provin..." },
  { id: 8, name: "TEC_Taller_C" },

])

const selected = ref<Department[]>(
  department.value.list
)
</script>
