<template>
    <UCard class="lg:max-w-1/3">
        <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-sm">Nombres</span>
        </div>

        <div class="max-h-48 overflow-y-auto flex gap-2 flex-wrap items-center">
            <UButton v-for="item in employees" :key="item.id" class="cursor-pointer"
                :class="!selected.includes(item) && 'bg-gray-100 dark:bg-gray-800 dark:text-gray-100  text-gray-700 border transition'"
                @click="selected = selected.includes(item)
                    ? selected.filter(s => s?.id !== item.id)
                    : [...selected, item]">


                {{ item.name }}
            </UButton>
        </div>
    </UCard>
</template>


<script setup lang="ts">
import { ref } from 'vue'

const employees = ref([
    { id: 1, name: "Adrián Lenny" },
    { id: 2, name: "Brandy Brayan" },
    { id: 3, name: "Brigitte Judit" },
    { id: 4, name: "Carlos M." },
    { id: 5, name: "Diana R." }
])

const selected = ref([
    employees.value[0],
    employees.value[1],
    employees.value[2],
])
</script>