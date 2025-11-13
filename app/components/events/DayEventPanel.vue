<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import type { EventoCalendario } from '~/composables/useEventos'
import EventDetailModal from '~/components/events/EventDetailModal.vue'

interface Props {
  selectedDate: Date | null;
  selectedDateEvents: EventoCalendario[];
}

interface Emits {
  (e: 'addEvent'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// State for the detail modal
const isDetailModalOpen = ref(false)
const selectedEventoForDetail = ref<EventoCalendario | null>(null)

const openEventDetails = (evento: EventoCalendario) => {
  selectedEventoForDetail.value = evento
  isDetailModalOpen.value = true
}

// Debug para verificar que el componente se está montando
onMounted(() => {
  console.log('🎯 DayEventPanel montado:', {
    selectedDate: props.selectedDate,
    eventCount: props.selectedDateEvents.length
  });
});

// Watcher para debug cuando cambie la fecha seleccionada
watch(() => props.selectedDate, (newDate) => {
  console.log('📅 DayEventPanel - fecha cambiada:', newDate?.toDateString());
}, { immediate: true });

// Función para obtener el color de la categoría
const getCategoriaColor = (categoria: string) => {
  const colorMap: Record<string, string> = {
    feriado: 'bg-red-500',
    celebracion: 'bg-green-500',
    cumpleanos: 'bg-yellow-500',
    aniversario: 'bg-pink-500',
    especial: 'bg-blue-500',
    default: 'bg-gray-400'
  };
  
  return colorMap[categoria?.toLowerCase()] || colorMap.default;
};

const handleAddEvent = () => {
  emit('addEvent');
};
</script>

<template>
  <div 
    v-if="selectedDate"
    class="w-96 border-l border-gray-200 dark:border-gray-700 bg-linear-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
  >
    <div class="p-6">
      <!-- Header del panel lateral -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-calendar-check" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ selectedDate.getDate() }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ selectedDate.toLocaleDateString('es-PE', { 
                weekday: 'long', 
                month: 'long'
              }) }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2 text-sm">
          <UBadge 
            :label="`${selectedDateEvents.length} evento${selectedDateEvents.length !== 1 ? 's' : ''}`" 
            :color="selectedDateEvents.length > 0 ? 'primary' : 'neutral'" 
            variant="soft" 
          />
          <UBadge 
            v-if="selectedDateEvents.some(e => e.programado)"
            label="Programados" 
            color="success" 
            variant="soft" 
          />
        </div>
      </div>

      <!-- Lista de eventos mejorada -->
      <div class="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pb-8 pr-2 -mr-2">
        <div 
          v-for="evento in selectedDateEvents" 
          :key="evento.id"
          class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
          @click="openEventDetails(evento)"
        >
          <div class="flex items-start gap-3">
            <div 
              class="w-4 h-4 rounded-full mt-1 shrink-0"
              :class="getCategoriaColor(evento.categoria)"
            ></div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {{ evento.nombre }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {{ evento.descripcion }}
              </p>
              
              <div class="flex items-center justify-between">
                <UBadge 
                  :label="evento.categoria" 
                  variant="soft" 
                  size="xs"
                  class="capitalize"
                />
                <div class="flex items-center gap-2">
                  <UBadge 
                    v-if="evento.programado"
                    label="Auto" 
                    color="success" 
                    variant="soft" 
                    size="xs"
                  />
                  <UButton
                    icon="i-lucide-search"
                    size="xs"
                    variant="ghost"
                    label="Ver"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón para agregar evento cuando ya hay eventos -->
        <div v-if="selectedDateEvents.length > 0" class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <UButton 
            color="primary" 
            variant="outline" 
            size="sm"
            icon="i-lucide-plus"
            @click="handleAddEvent"
            class="w-full"
          >
            Agregar Otro Evento
          </UButton>
        </div>

        <!-- Estado vacío mejorado -->
        <div v-if="selectedDateEvents.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon 
              name="i-lucide-calendar-plus" 
              class="w-8 h-8 text-gray-400 dark:text-gray-500"
            />
          </div>
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Día libre
          </h4>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
            No hay eventos programados para este día
          </p>
          <UButton 
            color="primary" 
            variant="outline" 
            size="sm"
            icon="i-lucide-plus"
            @click="handleAddEvent"
          >
            Agregar Evento
          </UButton>
        </div>

        <!-- Espacio adicional inferior para mejor UX en scroll -->
        <div class="h-6"></div>
      </div>
    </div>


   <EventDetailModal v-model:open="isDetailModalOpen" :evento="selectedEventoForDetail" />

  </div>
</template>