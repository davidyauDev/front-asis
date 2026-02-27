<template>
  <UModal
    v-model:open="open"
    :ui="{
      title: 'py-5 px-6',
      content: 'max-w-5xl',
    }"
  >
    <template #title>
      <div class="flex items-start gap-4">
        <UAvatar size="lg" :alt="employeeData?.employee.first_name || 'Usuario'" />
        <div class="flex-1">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ employeeData?.employee.last_name }}, {{ employeeData?.employee.first_name }}
          </h4>
          <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              DNI: {{ employeeData?.employee.dni }}
            </span>
            <span v-if="employeeData?.employee.department_name" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {{ employeeData?.employee.department_name }}
            </span>
            <span v-if="employeeData?.employee.position_name" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              {{ employeeData?.employee.position_name }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #body>
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
            <div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Total dÃ­as</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ employeeData?.summary.total_days ?? 0 }}
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
            <div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Vacaciones</div>
            <div class="text-lg font-semibold text-amber-700 dark:text-amber-300">
              {{ employeeData?.summary.vacation_days ?? 0 }}
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
            <div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Desc. mÃ©dico</div>
            <div class="text-lg font-semibold text-blue-700 dark:text-blue-300">
              {{ employeeData?.summary.medical_leave_days ?? 0 }}
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
            <div class="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">No marcÃ³</div>
            <div class="text-lg font-semibold text-rose-700 dark:text-rose-300">
              {{ employeeData?.summary.no_mark_days ?? 0 }}
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden w-full"
        >
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
          >
            <div class="flex items-center gap-3">
              <button
                @click="previousMonth"
                class="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-2"
              >
                <span class="i-lucide-chevron-left"></span>
              </button>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
              <button
                @click="nextMonth"
                class="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md p-2"
              >
                <span class="i-lucide-chevron-right"></span>
              </button>
            </div>
            <button
              @click="goToToday"
              class="border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium"
            >
              Hoy
            </button>
          </div>
          <div
            class="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
          >
            <div
              v-for="day in weekDays"
              :key="day"
              class="p-3 text-center font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-800 last:border-r-0"
            >
              <div class="text-xs uppercase tracking-wide">{{ day }}</div>
            </div>
          </div>
          <div class="grid grid-cols-7 bg-white dark:bg-gray-950">
            <div
              v-for="day in calendarDays"
              :key="day.date.getTime()"
              class="min-h-[100px] border-r border-b border-gray-200 dark:border-gray-800 p-3 cursor-pointer group relative transition-colors"
              :class="{
                'bg-gray-50/50 dark:bg-gray-900/50': !day.isCurrentMonth,
                'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700':
                  day.isSelected,
                'hover:bg-gray-50 dark:hover:bg-gray-900':
                  day.isCurrentMonth && !day.isSelected && !day.isToday,
                'ring-1 ring-inset ring-gray-900 dark:ring-gray-100':
                  day.isToday && !day.isSelected,
              }"
              @click="selectDate(day.date)"
            >
              <div class="flex items-center justify-between mb-2">
                <div
                  class="flex items-center justify-center w-7 h-7 rounded-md text-sm font-medium transition-colors"
                  :class="{
                    'text-gray-400 dark:text-gray-600': !day.isCurrentMonth,
                    'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900':
                      day.isToday && !day.isSelected,
                    'text-gray-900 dark:text-gray-100 group-hover:bg-gray-100 dark:group-hover:bg-gray-800':
                      day.isCurrentMonth && !day.isToday && !day.isSelected,
                    'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900':
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
                      class="w-1.5 h-1.5 rounded-full border border-white dark:border-gray-950"
                      :class="getCategoriaColor(evento.categoria)"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded"
                  >
                    {{ day.events.length }}
                  </span>
                </div>
              </div>
              <div class="space-y-1">
                <div
                  v-for="evento in day.events.slice(0, 2)"
                  :key="evento.id"
                  class="text-xs p-1.5 rounded cursor-pointer transition-colors border-l-2"
                  :class="
                    getCategoriaColor(evento.categoria) +
                    ' bg-opacity-10 hover:bg-opacity-20 text-gray-800 dark:text-gray-200'
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
                  class="text-xs text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer p-1 rounded bg-gray-100 dark:bg-gray-800"
                >
                  <span class="i-lucide-plus mr-1"></span
                  >{{ day.events.length - 2 }} más eventos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>("isOpen");
import { ref, computed, watch } from "vue";

interface EmployeeData {
  employee: {
    id: number
    dni: string
    first_name: string
    last_name: string
    position_name: string
    department_name: string
  }
  summary: {
    total_days: number
    vacation_days: number
    medical_leave_days: number
    no_mark_days: number
    days_with_mobility: number
    mobility_amount_per_day: number
    total_mobility_to_pay: number
  }
  [key: string]: any 
}

const props = defineProps<{
  employeeData: EmployeeData | null
}>()

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

// Convertir los días del empleado en eventos del calendario
watch(() => props.employeeData, (newData) => {
  if (!newData) {
    eventos.value = []
    return
  }
  
  const newEventos: any[] = []
  
  // Iterar sobre todas las propiedades del objeto
  Object.keys(newData).forEach((key) => {
    // Verificar si la key es una fecha (formato YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      const dayData = newData[key]
      let categoria = 'especial'
      let nombre = 'Día trabajado'
      
      // Determinar la categoría según el código
      if (dayData.code === '1') {
        categoria = 'celebracion'
        nombre = 'Asistencia normal'
      } else if (dayData.code === 'V') {
        categoria = 'feriado'
        nombre = 'Vacaciones'
      } else if (dayData.code === 'DM') {
        categoria = 'cumpleanos'
        nombre = 'Descanso médico'
      } else if (dayData.code === '0') {
        categoria = 'aniversario'
        nombre = 'No marcó'
      }
      
      newEventos.push({
        id: key,
        nombre: nombre,
        descripcion: dayData.mobility_counted ? 'Movilidad contada' : 'Sin movilidad',
        fecha: key,
        categoria: categoria
      })
    }
  })
  
  eventos.value = newEventos
  
  // Si hay eventos, navegar al mes del primer evento
  if (newEventos.length > 0) {
    const primerEvento = parseYMDToLocalDate(newEventos[0].fecha)
    currentDate.value = new Date(primerEvento.getFullYear(), primerEvento.getMonth(), 1)
  }
}, { immediate: true })
</script>
