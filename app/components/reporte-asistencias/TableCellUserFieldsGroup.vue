<template>
    <div class=" transition-colors group w-full  flex justify-evenly">
        <p class="py-3 px-3 font-mono text-xs font-medium text-emerald-700  w-24">{{ attendance.dni }}</p>
        <p class="py-3 px-3 text-xs  font-medium w-36">{{  attendance.apellidos  }}</p>
        <p class="py-3 px-3 text-xs font-semibold text-foreground  w-32">{{ attendance.nombres }}</p>
        <p class="py-3 px-3 text-xs text-muted-foreground  w-28">Sistemas_C</p>
        <p class="py-3 px-3 text-xs text-muted-foreground  w-28">Cechriza SAC</p>
    </div>
</template>

<script
  setup lang="ts"
>
const {attendance } =defineProps<{
    attendance: AttendanceSummary
}>()



</script>