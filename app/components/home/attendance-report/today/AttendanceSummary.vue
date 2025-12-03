<script setup lang="ts">
interface Row {
    label: string
    value: number
    color: string
}

const rows: Row[] = [
    { label: 'Asistencia', value: 8, color: 'bg-blue-700' },
    { label: 'Ausencias', value: 137, color: 'bg-gray-400' },
    { label: 'Tardanzas', value: 0, color: 'bg-red-600' },
]
</script>

<template>
    <div class="mx-auto max-w-sm rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">

        <!-- Header -->
        <div class="grid grid-cols-2 bg-black text-white font-bold p-2">
            <div>Tipo</div>
            <div>Total</div>
        </div>

        <!-- Body -->
        <div>
            <div v-for="row in rows" :key="row.label" class="grid grid-cols-2 text-white font-semibold"
                :class="row.color">
                <div class="p-2">{{ row.label }}</div>
                <div class="p-2 text-right">{{ row.value }}</div>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Hover opcional */
.grid-cols-2:hover {
    filter: brightness(1.05);
}
</style>
