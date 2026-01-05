<template>
  <UModal
    v-model:open="open"
    :ui="{
      title: 'py-6',
      content: 'max-w-3xl',
    }"
  >
    <template #title>
      <div class="flex items-center gap-4">
        <UAvatar size="xl" alt="Reyna, Fredy Kenlly" />
        <div class="flex-1 gap-2 flex flex-col">
          <h4
            id="radix-_r_5_"
            data-slot="dialog-title"
            class="text-xl font-bold text-foreground"
          >
            Portugal Reyna, Fredy Kenlly
          </h4>

         
        </div>
      </div>
    </template>
    <template #body>
      <div class="flex flex-col items-center justify-center w-full mt-4">
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-5xl"
        >
          <div
            class="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            <div class="flex items-center gap-4">
              <button
                @click="previousMonth"
                class="text-white hover:bg-white/20 rounded-full p-2"
              >
                <span class="i-lucide-chevron-left"></span>
              </button>
              <h2 class="text-2xl font-bold">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
              <button
                @click="nextMonth"
                class="text-white hover:bg-white/20 rounded-full p-2"
              >
                <span class="i-lucide-chevron-right"></span>
              </button>
            </div>
            <button
              @click="goToToday"
              class="border border-white/30 text-white px-4 py-2 rounded hover:bg-white/20"
            >
              Hoy
            </button>
          </div>
          <div
            class="grid grid-cols-7 bg-gradient-to-r from-gray-100 to-gray-200"
          >
            <div
              v-for="day in weekDays"
              :key="day"
              class="p-4 text-center font-semibold text-gray-700 border-r last:border-r-0"
            >
              <div class="text-sm uppercase tracking-wider">{{ day }}</div>
            </div>
          </div>
          <div class="grid grid-cols-7 bg-white">
            <div
              v-for="day in calendarDays"
              :key="day.date.getTime()"
              class="min-h-[100px] border-r border-b border-gray-200 p-3 cursor-pointer group relative transition-all duration-200"
              :class="{
                'bg-gray-50/50': !day.isCurrentMonth,
                'bg-blue-100 border-blue-400 ring-2 ring-blue-300':
                  day.isSelected,
                'hover:bg-blue-50':
                  day.isCurrentMonth && !day.isSelected && !day.isToday,
                'ring-2 ring-green-500 ring-inset bg-green-50':
                  day.isToday && !day.isSelected,
              }"
              @click="selectDate(day.date)"
            >
              <div class="flex items-center justify-between mb-2">
                <div
                  class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
                  :class="{
                    'text-gray-400': !day.isCurrentMonth,
                    'bg-green-600 text-white shadow-lg':
                      day.isToday && !day.isSelected,
                    'text-gray-900 group-hover:bg-blue-100':
                      day.isCurrentMonth && !day.isToday && !day.isSelected,
                    'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200':
                      day.isSelected,
                  }"
                >
                  {{ day.dayNumber }}
                </div>
                <div
                  v-if="day.events.length > 0"
                  class="flex items-center gap-1"
                >
                  <div class="flex -space-x-1">
                    <div
                      v-for="(evento, index) in day.events.slice(0, 3)"
                      :key="index"
                      class="w-2 h-2 rounded-full border border-white"
                      :class="getCategoriaColor(evento.categoria)"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full"
                  >
                    {{ day.events.length }}
                  </span>
                </div>
              </div>
              <div class="space-y-1">
                <div
                  v-for="evento in day.events.slice(0, 2)"
                  :key="evento.id"
                  class="text-xs p-2 rounded-md cursor-pointer hover:shadow-sm transition-all duration-200 border-l-2"
                  :class="
                    getCategoriaColor(evento.categoria) +
                    ' bg-opacity-10 hover:bg-opacity-20 text-gray-800'
                  "
                  :style="{
                    borderLeftColor: getCategoriaColorHex(evento.categoria),
                  }"
                  :title="evento.nombre + ' - ' + evento.descripcion"
                >
                  <div class="font-medium truncate">{{ evento.nombre }}</div>
                </div>
                <div
                  v-if="day.events.length > 2"
                  class="text-xs text-gray-500 font-medium hover:text-blue-600 cursor-pointer p-1 rounded bg-gray-100"
                >
                  <span class="i-lucide-plus mr-1"></span
                  >{{ day.events.length - 2 }} más eventos
                </div>
              </div>
              <div
                class="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>("isOpen");
import { ref, computed } from "vue";

// Datos de ejemplo para eventos
const eventos = ref([
  {
    id: 1,
    nombre: "Reunión de equipo",
    descripcion: "Planificación mensual",
    fecha: "2026-01-10",
    categoria: "feriado",
  },
  {
    id: 2,
    nombre: "Entrega de informe",
    descripcion: "Informe anual",
    fecha: "2026-01-15",
    categoria: "celebracion",
  },
  {
    id: 3,
    nombre: "Capacitación",
    descripcion: "Capacitación interna",
    fecha: "2026-01-20",
    categoria: "especial",
  },
]);

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(new Date());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const formatLocalYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const parseYMDToLocalDate = (ymd: string) => {
  const [ys, ms, ds] = ymd.split("-");
  return new Date(Number(ys), Number(ms) - 1, Number(ds));
};

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  const days = [];
  let currentDay = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    const currentDayYMD = formatLocalYMD(currentDay);
    const dayEvents = eventos.value.filter(
      (evento) =>
        formatLocalYMD(parseYMDToLocalDate(evento.fecha)) === currentDayYMD
    );
    const isToday = currentDay.toDateString() === new Date().toDateString();
    const isSelected =
      selectedDate.value &&
      selectedDate.value.toDateString() === currentDay.toDateString();
    days.push({
      date: new Date(currentDay),
      dayNumber: currentDay.getDate(),
      isCurrentMonth: currentDay.getMonth() === month,
      isToday,
      isSelected,
      events: dayEvents,
    });
    currentDay.setDate(currentDay.getDate() + 1);
  }
  return days;
});

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};
const goToToday = () => {
  currentDate.value = new Date();
  selectedDate.value = new Date();
};
const selectDate = (date: Date) => {
  selectedDate.value = new Date(date);
};
const getCategoriaColor = (categoria: string) => {
  const colores: Record<string, string> = {
    feriado: "bg-red-500",
    celebracion: "bg-green-500",
    cumpleanos: "bg-yellow-500",
    aniversario: "bg-pink-500",
    especial: "bg-blue-500",
  };
  return colores[categoria] || "bg-gray-500";
};
const getCategoriaColorHex = (categoria: string) => {
  const colores: Record<string, string> = {
    feriado: "#ef4444",
    celebracion: "#22c55e",
    cumpleanos: "#eab308",
    aniversario: "#ec4899",
    especial: "#3b82f6",
  };
  return colores[categoria] || "#6b7280";
};
</script>
