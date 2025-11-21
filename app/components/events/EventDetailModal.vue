<script setup lang="ts">
import { computed } from 'vue'
import { getEventoStatusOp } from '~/enums/evento'

// Tipo completo del evento
interface EventoImagen {
  url: string
  descripcion?: string
}


interface EventoCalendario {
  id: number
  nombre: string
  fecha: string
  categoria: string
  programado: boolean
  descripcion: string
  imagenes?: EventoImagen[]
  fecha_fin?: string
  estado?: string
}
const selectedDateForUpload = ref<string | null>(null);

// v-model para abrir/cerrar el modal
const isOpen = defineModel('open', { type: Boolean, default: false })
const props = defineProps<{ evento?: EventoCalendario | null }>()

const openEditModal = ref(false)
// Color según categoría
const categoriaColor = computed(() => {
  const colorMap: Record<string, string> = {
    feriado: 'red',
    celebracion: 'green',
    cumpleanos: 'yellow',
    aniversario: 'pink',
    especial: 'blue',
    default: 'gray'
  }
  return colorMap[props.evento?.categoria?.toLowerCase() ?? 'default']
})

// Cierre manual
const handleClose = () => {
  isOpen.value = false
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="props.evento?.nombre || 'Detalle del evento'">
    <template #body>
      <div class="p-4 space-y-5">
        <!-- Encabezado -->
        <div class="flex items-start gap-3">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
            <UIcon name="i-lucide-calendar" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {{ props.evento?.nombre || 'Sin título' }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-snug">
              {{ props.evento?.descripcion || 'Sin descripción disponible' }}
            </p>
          </div>
        </div>

        <!-- Info general -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          

          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Estado</p>
            
            <UBadge
              :color="getEventoStatusOp(props.evento?.estado ?? 0).color"
              variant="soft" 
              size="sm"
              class="capitalize mt-1"
            >
            
              {{ getEventoStatusOp(props.evento?.estado ?? 0).label}}
            </UBadge>
          </div>

          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Inicio</p>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ new Date(props.evento?.fecha || '').toLocaleDateString('es-PE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) }}
            </p>
          </div>

          <div v-if="props.evento?.fecha_fin">
            <p class="text-sm text-gray-500 dark:text-gray-400">Fin</p>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ new Date(props.evento?.fecha_fin || '').toLocaleDateString('es-PE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) }}
            </p>
          </div>
        </div>

        <!-- Galería de imágenes -->
        <div v-if="props.evento?.imagenes?.length" class="mt-4">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Imágenes</p>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            <div
              v-for="(img, index) in props.evento.imagenes"
              :key="index"
              class="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group"
            >
              <img
                :src="img.url_imagen"
                :alt="img.descripcion || 'Imagen del evento'"
                class="object-cover w-full h-32 transition-transform duration-300 group-hover:scale-105"
              />
              <div
                v-if="img.descripcion"
                class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate"
              >
                {{ img.descripcion }}
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex justify-end gap-2 pt-4">
          <UButton
            label="Cerrar"
            variant="outline"
            color="neutral"
            @click="handleClose"
          />
          <UButton
            label="Editar evento"
            @click="openEditModal = true"
            color="primary"
            icon="i-lucide-pencil"
            variant="soft"
          />
        </div>
      </div>
    </template>
  </UModal>

<LazyEventsSimpleUploadModal
  :is-open="openEditModal"
  :pre-selected-date="selectedDateForUpload || undefined"
  @close="openEditModal = false; isOpen = false"
  @event-created="() => {}"
  :selected-event="{ ...props.evento }"
/>
</template>

