<template>
    <UCard :ui="{
        header: 'p-2'
    }">
        <template #header>
            Empresa
        </template>
       

        <div class="space-y-2 max-h-48 overflow-y-auto flex flex-wrap gap-2">

            <UButton v-for="item in companies" :key="item.id" class="cursor-pointer"
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

const companies = ref([
    { id: 1, name: 'Cechriza SAC' },
    { id: 2, name: 'Tecnologías Perú' },
    { id: 3, name: 'Industrial Corp' }
])

const selected = ref([companies.value[0]])
</script>