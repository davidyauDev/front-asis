<template>
    <div class="transition-colors group flex w-full justify-evenly">
        <p class="w-24 px-3 py-3 font-mono text-xs font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">{{ attendance.dni }}</p>
        <p class="w-36 px-3 py-3 text-xs font-medium text-gray-700 dark:text-gray-200">{{ attendance.apellidos }}</p>
        <p class="w-32 px-3 py-3 text-xs font-semibold text-gray-900 dark:text-gray-100">{{ attendance.nombres }}</p>
        <p class="w-28 px-3 py-3 text-xs text-gray-500 dark:text-gray-400">Sistemas_C</p>
        <p class="w-28 px-3 py-3 text-xs text-gray-500 dark:text-gray-400">Cechriza SAC</p>
    </div>
</template>

<script
  setup lang="ts"
>
const {attendance } =defineProps<{
    attendance: AttendanceSummary
}>()



</script>
