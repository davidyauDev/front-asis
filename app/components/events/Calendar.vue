<script setup lang="ts">
import type { EventoCalendario } from '~/composables/useEventos'
import DayEventPanel from '~/components/events/DayEventPanel.vue'
import EventDetailModal from '~/components/events/EventDetailModal.vue'

interface Props {
  eventos: EventoCalendario[];
}

interface Emits {
  (e: 'dateSelected', date: string): void;
  (e: 'monthChanged', year: number, month: number): void;
  (e: 'addEventClick', date: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isDetailModalOpen = ref(false)
const selectedEventoForDetail = ref<EventoCalendario | null>(null)

const openEventDetails = (evento: EventoCalendario) => {
  console.log('Abriendo detalles para el evento:', evento)
  selectedEventoForDetail.value = evento
  isDetailModalOpen.value = true
}

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(new Date()); // Inicializar con la fecha de hoy
const viewMode = ref<'month' | 'week' | 'day'>('month');

const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const formatLocalYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseYMDToLocalDate = (ymd: string) => {
  const [ys, ms, ds] = ymd.split('-') as [string, string, string];
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  return new Date(isNaN(y) ? 1970 : y, (isNaN(m) ? 1 : m) - 1, isNaN(d) ? 1 : d);
};

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  let currentDay = new Date(startDate);
  
  // Generar 42 días (6 semanas)
  for (let i = 0; i < 42; i++) {
    // Comparación sin desfases: comparar por YYYY-MM-DD local
    const currentDayYMD = formatLocalYMD(currentDay);
    const dayEvents = props.eventos.filter(evento => {
      const eventDate = typeof evento.fecha === 'string' ? parseYMDToLocalDate(evento.fecha) : new Date(evento.fecha as any);
      return formatLocalYMD(eventDate) === currentDayYMD;
    });
    
    const isToday = currentDay.toDateString() === new Date().toDateString();
    const isSelected = selectedDate.value !== null && selectedDate.value.toDateString() === currentDay.toDateString();
    
    // Debug para día 7
    if (currentDay.getDate() === 7) {
      console.log(`Día 7 - isToday: ${isToday}, isSelected: ${isSelected}, selectedDate: ${selectedDate.value?.toDateString()}`);
    }
    
    days.push({
      date: new Date(currentDay),
      dayNumber: currentDay.getDate(),
      isCurrentMonth: currentDay.getMonth() === month,
      isToday: isToday,
      isSelected: isSelected,
      events: dayEvents
    });
    
    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  return days;
});

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  emit('monthChanged', currentYear.value, currentMonth.value + 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  emit('monthChanged', currentYear.value, currentMonth.value + 1);
};

const selectDate = (date: Date) => {
  selectedDate.value = new Date(date); 
  console.log('Fecha seleccionada:', date.toDateString(), 'selectedDate:', selectedDate.value?.toDateString());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const fechaString = `${year}-${month}-${day}`;
  emit('dateSelected', fechaString);
};

const goToToday = () => {
  currentDate.value = new Date();
  selectedDate.value = new Date();
};

const handleAddEvent = () => {
  if (selectedDate.value) {
    const year = selectedDate.value.getFullYear();
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.value.getDate()).padStart(2, '0');
    const fechaString = `${year}-${month}-${day}`;
    emit('addEventClick', fechaString);
  }
};

const getCategoriaColor = (categoria: string) => {
  const colores = {
    feriado: 'bg-red-500',
    celebracion: 'bg-green-500',
    cumpleanos: 'bg-yellow-500',
    aniversario: 'bg-pink-500',
    especial: 'bg-blue-500'
  };
  return colores[categoria as keyof typeof colores] || 'bg-gray-500';
};

const getCategoriaColorHex = (categoria: string) => {
  const colores = {
    feriado: '#ef4444',
    celebracion: '#22c55e',
    cumpleanos: '#eab308',
    aniversario: '#ec4899',
    especial: '#3b82f6'
  };
  return colores[categoria as keyof typeof colores] || '#6b7280';
};

const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return [];
  const selectedYMD = formatLocalYMD(selectedDate.value);
  return props.eventos.filter(evento => {
    const eventDate = typeof evento.fecha === 'string' ? parseYMDToLocalDate(evento.fecha) : new Date(evento.fecha as any);
    return formatLocalYMD(eventDate) === selectedYMD;
  });
});

onMounted(() => {
  emit('monthChanged', currentYear.value, currentMonth.value + 1);
});
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
    <div class="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-calendar" class="w-8 h-8" />
            <div>
              <h2 class="text-2xl font-bold">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
              <p class="text-blue-100 text-sm">
                {{ eventos.length }} eventos programados este mes
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-1 bg-white/20 rounded-lg p-1">
            <UButton
              icon="i-lucide-chevron-left"
              size="sm"
              variant="ghost"
              @click="previousMonth"
              class="text-white hover:bg-white/20"
            />
            <UButton
              icon="i-lucide-chevron-right"
              size="sm"
              variant="ghost"
              @click="nextMonth"
              class="text-white hover:bg-white/20"
            />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <UButton
            size="sm"
            variant="outline"
            @click="goToToday"
            class="border-white/30 text-white hover:bg-white/20"
          >
            <UIcon name="i-lucide-calendar-days" class="w-4 h-4 mr-2" />
            Hoy
          </UButton>
          
          <USelectMenu
            v-model="viewMode"
            :options="[
              { label: 'Vista Mes', value: 'month', icon: 'i-lucide-calendar' },
              { label: 'Vista Semana', value: 'week', icon: 'i-lucide-calendar-range' },
              { label: 'Vista Día', value: 'day', icon: 'i-lucide-calendar-clock' }
            ]"
            size="sm"
            class="min-w-32"
          />
        </div>
      </div>
    </div>

    <div class="flex bg-gray-50 dark:bg-gray-800">
      <!-- 📅 Vista del calendario principal -->
      <div class="flex-1 bg-white dark:bg-gray-900">
        <!-- Días de la semana con mejor diseño -->
        <div class="grid grid-cols-7 bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
          <div 
            v-for="day in weekDays" 
            :key="day"
            class="p-4 text-center font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 last:border-r-0"
          >
            <div class="text-sm uppercase tracking-wider">{{ day }}</div>
          </div>
        </div>

        <!-- Grid de días mejorado -->
        <div class="grid grid-cols-7 bg-white dark:bg-gray-900">
          <div 
            v-for="day in calendarDays" 
            :key="day.date.getTime()"
            class="min-h-[140px] border-r border-b border-gray-200 dark:border-gray-700 p-3 cursor-pointer transition-all duration-200 group relative"
            :class="{
              'bg-gray-50/50 dark:bg-gray-800/50': !day.isCurrentMonth,
              'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-600 ring-2 ring-blue-300 dark:ring-blue-600': day.isSelected,
              'hover:bg-blue-50 dark:hover:bg-blue-950/20': day.isCurrentMonth && !day.isSelected && !day.isToday,
              'ring-2 ring-green-500 ring-inset bg-green-50 dark:bg-green-950/20': day.isToday && !day.isSelected
            }"
            @click="selectDate(day.date)"
          >
            <!-- Número del día con mejor estilo -->
            <div class="flex items-center justify-between mb-2">
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
                :class="{
                  'text-gray-400 dark:text-gray-600': !day.isCurrentMonth,
                  'bg-green-600 text-white shadow-lg': day.isToday && !day.isSelected,
                  'text-gray-900 dark:text-white group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50': day.isCurrentMonth && !day.isToday && !day.isSelected,
                  'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200': day.isSelected
                }"
              >
                {{ day.dayNumber }}
              </div>
              
              <!-- Indicador de eventos mejorado -->
              <div v-if="day.events.length > 0" class="flex items-center gap-1">
                <div class="flex -space-x-1">
                  <div 
                    v-for="(evento, index) in day.events.slice(0, 3)" 
                    :key="index"
                    class="w-2 h-2 rounded-full border border-white dark:border-gray-900"
                    :class="getCategoriaColor(evento.categoria)"
                  ></div>
                </div>
                <span class="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                  {{ day.events.length }}
                </span>
              </div>
            </div>

            <!-- Eventos del día con mejor diseño -->
            <div class="space-y-1">
              <div 
                v-for="evento in day.events.slice(0, 2)" 
                :key="evento.id"
                class="text-xs p-2 rounded-md cursor-pointer hover:shadow-sm transition-all duration-200 border-l-2"
                :class="getCategoriaColor(evento.categoria) + ' bg-opacity-10 hover:bg-opacity-20 text-gray-800 dark:text-gray-200'"
                :style="{ borderLeftColor: getCategoriaColorHex(evento.categoria) }"
                :title="evento.nombre + ' - ' + evento.descripcion"
                @click.stop="openEventDetails(evento)"
              >
                <div class="font-medium truncate">{{ evento.nombre }}</div>
                <div v-if="evento.programado" class="flex items-center gap-1 mt-1">
                  <UIcon name="i-lucide-clock" class="w-3 h-3 text-green-600" />
                  <span class="text-green-600 font-medium">Auto</span>
                </div>
              </div>
              
              <!-- Indicador de más eventos -->
              <div 
                v-if="day.events.length > 2"
                class="text-xs text-gray-500 dark:text-gray-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer p-1 rounded bg-gray-100 dark:bg-gray-800"
              >
                <UIcon name="i-lucide-plus" class="w-3 h-3 inline mr-1" />
                {{ day.events.length - 2 }} más eventos
              </div>
            </div>

            <!-- Overlay de hover -->
            <div class="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded"></div>
          </div>
        </div>
      </div>

      <DayEventPanel 
        :selected-date="selectedDate"
        :selected-date-events="selectedDateEvents"
        @add-event="handleAddEvent"
      />
    </div>
    
    <EventDetailModal v-model="isDetailModalOpen" :evento="selectedEventoForDetail" />
  </div>
</template>

<style scoped>
.calendar-transition {
  transition: all 0.3s ease;
}

.calendar-day:hover {
  transform: scale(1.02);
}
</style>