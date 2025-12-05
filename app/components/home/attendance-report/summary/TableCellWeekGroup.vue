<template>
    <div class=" transition-colors group w-full h-full flex justify-evenly">
        <p class="py-3 px-3 w-full h-full text-center font-mono  text-xs" :class="[secondBackgroundColor, firstColor]">{{
            attendance.delay || 'Sin registro' }}
        </p>
        <p class="py-3 px-3 w-full h-full text-center font-mono text-xs" :class="[firstBackgroundColor, secondColor]">{{
            attendance.worked ||'Sin registro' }}
        </p>
    </div>
</template>

<script setup lang="ts">
const { attendance, firstBackgroundColor, secondBackgroundColor, firstColor, secondColor } = defineProps<{
    attendance: {
        delay: string | null,
        worked: string | null,
    },
    firstBackgroundColor: string,
    secondBackgroundColor: string,
    firstColor: string,
    secondColor: string,

}>();



</script>