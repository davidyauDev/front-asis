<template>
  <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">



    <UCard v-for="stat in stats" :key="stat.title" class="text-center">

      <div data-slot="card-content" class="p-0">
        <!-- <div class="h-1.5 bg-gradient-to-r from-teal-500 to-teal-600"></div> -->
        <div class="p-4">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">{{ stat.title }}</p>
              <p class="text-2xl font-bold text-foreground tracking-tight">{{ stat.value }}</p>
              <p v-if="stat.description" class="text-[11px] text-muted-foreground">{{ stat.description }}</p>
            </div>
            <div :class="`rounded-xl p-2.5 shadow-md group-hover:scale-110 transition-transform ${stat.color}`">
              <UIcon :name="stat.icon" class="h-5 w-5 text-white" />

            </div>

          </div>
        </div>
      </div>
    </UCard>



  </div>
</template>

<script setup lang="ts">
const stats = [
  {
    title: 'Total Empleados',
    value: '4',
    icon: 'i-lucide-users',
    color: 'bg-teal-500',
    description: 'En el período',
  },
  {
    title: 'Horas Trabajadas',
    value: '733h 39m',
    icon: 'i-lucide-clock',
    color: 'bg-green-500',
    description: 'Total acumulado',
  },
  {
    title: 'Promedio / Empleado',
    value: '183h 25m',
    icon: 'i-lucide-activity',
    color: 'bg-blue-500',
    description: 'Horas trabajadas',
  },
  {
    title: 'Total Tardanzas',
    value: '13h 51m',
    icon: 'i-lucide-triangle-alert',
    color: 'bg-yellow-500',
    description: '3 empleados',
  },
  {
    title: 'Tasa Puntualidad',
    value: '25%',
    icon: 'i-lucide-check-circle',
    color: 'bg-purple-500',
    description: 'Sin tardanzas',
  }
];
</script>