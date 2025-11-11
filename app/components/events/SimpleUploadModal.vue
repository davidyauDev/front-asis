<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Props {
  isOpen: boolean;
  preSelectedDate?: string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'upload', data: any): void;
  (e: 'event-created', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Esquema de validación
const schema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
  estado: z.string().default('programado')
});

type Schema = z.output<typeof schema>;

// Autenticación
const { user, isLoggedIn } = useAuth();
const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000';

// Estado del formulario
const state = reactive<Partial<Schema>>({
  titulo: undefined,
  descripcion: undefined,
  fecha_inicio: props.preSelectedDate || undefined,
  fecha_fin: props.preSelectedDate || undefined,
  estado: 'programado'
});

// Estado de archivos e imágenes
const selectedFiles = ref<File[]>([]);
const previews = ref<string[]>([]);
const imageDescriptions = ref<string[]>([]);
const imageAuthors = ref<string[]>([]);
const dragActive = ref(false);
const uploading = ref(false);
const fileInput = ref<HTMLInputElement>();

// Watchers
watch(() => props.preSelectedDate, (fecha) => {
  if (fecha) {
    state.fecha_inicio = fecha;
    state.fecha_fin = fecha;
  }
}, { immediate: true });

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});

// Función para obtener token
const getAuthToken = (): string | null => {
  if (import.meta.client) {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Computed
const canSubmit = computed(() => {
  return state.titulo && state.descripcion && state.fecha_inicio && 
         state.fecha_fin && selectedFiles.value.length > 0 && !uploading.value;
});

// Métodos de archivo
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  const files = Array.from(e.dataTransfer?.files || []);
  processFiles(files);
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  processFiles(files);
};

const processFiles = (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    const toast = useToast();
    toast.add({
      title: 'Archivo inválido',
      description: 'Por favor selecciona solo archivos de imagen',
      color: 'error'
    });
    return;
  }

  selectedFiles.value.push(...imageFiles);
  
  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previews.value.push(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    imageDescriptions.value.push('');
    imageAuthors.value.push('');
  });
};

const removeImage = (index: number) => {
  selectedFiles.value.splice(index, 1);
  previews.value.splice(index, 1);
  imageDescriptions.value.splice(index, 1);
  imageAuthors.value.splice(index, 1);
};

const clearImages = () => {
  selectedFiles.value = [];
  previews.value = [];
  imageDescriptions.value = [];
  imageAuthors.value = [];
};

const resetForm = () => {
  Object.assign(state, {
    titulo: undefined,
    descripcion: undefined,
    fecha_inicio: props.preSelectedDate || undefined,
    fecha_fin: props.preSelectedDate || undefined,
    estado: 'programado'
  });
  clearImages();
};

// Envío del formulario
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  if (!isLoggedIn.value) {
    const toast = useToast();
    toast.add({
      title: 'No autenticado',
      description: 'Necesitas iniciar sesión para crear eventos',
      color: 'error'
    });
    return;
  }

  if (selectedFiles.value.length === 0) {
    const toast = useToast();
    toast.add({
      title: 'Imágenes requeridas',
      description: 'Debes seleccionar al menos una imagen',
      color: 'error'
    });
    return;
  }

  uploading.value = true;
  const toast = useToast();

  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Token de autenticación no encontrado');
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('titulo', event.data.titulo);
    formData.append('descripcion', event.data.descripcion);
    formData.append('fecha_inicio', event.data.fecha_inicio);
    formData.append('fecha_fin', event.data.fecha_fin);
    formData.append('estado', event.data.estado);

    // Agregar archivos
    selectedFiles.value.forEach((file, index) => {
      formData.append('imagenes_archivos[]', file);
      formData.append('descripcion_imagenes[]', imageDescriptions.value[index] || '');
      formData.append('autor_imagenes[]', imageAuthors.value[index] || '');
    });

    console.log('🌐 Enviando evento a la API...');

    const response = await fetch(`${apiBaseUrl}/api/eventos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      } else if (response.status === 403) {
        throw new Error('No tienes permisos para crear eventos.');
      } else if (response.status === 422) {
        const errorData = await response.text();
        throw new Error(`Error de validación: ${errorData}`);
      }
      throw new Error(`Error del servidor (${response.status})`);
    }

    const result = await response.json();
    console.log('✅ Evento creado:', result);

    // Emitir eventos para notificar al padre
    emit('upload', result);
    emit('event-created', result);
    
    toast.add({
      title: 'Evento creado exitosamente',
      description: `"${event.data.titulo}" se creó y el calendario se actualizará automáticamente`,
      color: 'success'
    });

    emit('close');
    
  } catch (error: any) {
    console.error('💥 Error:', error);
    toast.add({
      title: 'Error al crear evento',
      description: error.message || 'Ocurrió un error inesperado',
      color: 'error'
    });
  } finally {
    uploading.value = false;
  }
};

const handleClose = () => {
  resetForm();
  emit('close');
};
</script>

<template>
  <UModal 
    :open="isOpen" 
    class="max-w-4xl"
    @close="handleClose"
  >
    <!-- Trigger (invisible, controlled by parent) -->
    <template #trigger>
      <div></div>
    </template>

    <!-- Header -->
    <template #header>
  <div class="flex items-center justify-between w-full">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
        <UIcon name="i-lucide-calendar-plus" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Nuevo Evento
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Crea un evento con imágenes para fechas especiales
        </p>
      </div>
    </div>

    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      square
      @click="handleClose"
      class="hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <UIcon name="i-lucide-x" class="h-5 w-5" />
    </UButton>
  </div>
</template>


    <!-- Body -->
    <template #body>
      <!-- Verificación de autenticación -->
      <div v-if="!isLoggedIn" class="text-center py-8">
        <UIcon name="i-lucide-shield-x" class="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Acceso Requerido
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Necesitas iniciar sesión para crear eventos.
        </p>
        <UButton label="Entendido" @click="handleClose" />
      </div>

      <!-- Formulario principal -->
      <div v-else>
        <UForm 
          :schema="schema" 
          :state="state" 
          class="space-y-8" 
          @submit="onSubmit"
        >
          <!-- Contenedor principal del formulario -->
          <div class="grid grid-cols-1 gap-8">
            
            <!-- Información básica del evento -->
            <div class="space-y-6">
              <div class="pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Información del Evento
                </h3>
              </div>
              
              <div class="grid grid-cols-1 gap-6">
                <UFormField label="Título del evento" name="titulo" required class="w-full">
                  <UInput 
                    v-model="state.titulo" 
                    placeholder="Ej: Día del Programador"
                    icon="i-lucide-type"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Descripción del evento" name="descripcion" required class="w-full">
                  <UTextarea 
                    v-model="state.descripcion" 
                    placeholder="Describe el evento en detalle..."
                    :rows="4"
                    size="lg"
                    class="w-full resize-none"
                  />
                </UFormField>
              </div>
            </div>

            <!-- Fechas y configuración -->
            <div class="space-y-6">
              <div class="pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Fechas y Estado
                </h3>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UFormField label="Fecha de inicio" name="fecha_inicio" required class="w-full">
                  <UInput 
                    v-model="state.fecha_inicio" 
                    type="date"
                    icon="i-lucide-calendar"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Fecha de fin" name="fecha_fin" required class="w-full">
                  <UInput 
                    v-model="state.fecha_fin" 
                    type="date"
                    icon="i-lucide-calendar"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="grid grid-cols-1 gap-6">
                <UFormField label="Estado del evento" name="estado" class="w-full">
                  <USelectMenu 
                    v-model="state.estado" 
                    :options="[
                      { label: '📅 Programado', value: 'programado' },
                      { label: '✅ Activo', value: 'activo' },
                      { label: '❌ Cancelado', value: 'cancelado' },
                      { label: '🏁 Completado', value: 'completado' }
                    ]"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>
          </div>

          <!-- Sección de imágenes -->
          <div class="grid grid-cols-1 gap-8">
            <div class="space-y-6">
              <div class="pb-2 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Imágenes del Evento <span class="text-red-500">*</span>
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sube imágenes para acompañar tu evento
                    </p>
                  </div>
                  <UBadge 
                    v-if="selectedFiles.length > 0" 
                    :label="`${selectedFiles.length} archivo${selectedFiles.length !== 1 ? 's' : ''}`"
                    color="primary"
                    size="lg"
                  />
                </div>
              </div>

              <!-- Drag & Drop Area -->
              <div 
                class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200"
                :class="{
                  'border-primary-400 bg-primary-50 dark:bg-primary-950/20': dragActive,
                  'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50': !dragActive
                }"
                @dragover.prevent="dragActive = true"
                @dragleave.prevent="dragActive = false"
                @drop.prevent="handleDrop"
              >
              <UIcon 
                name="i-lucide-image-plus" 
                class="h-10 w-10 text-gray-400 mx-auto mb-3"
              />
              <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {{ dragActive ? '¡Suelta las imágenes!' : 'Arrastra imágenes aquí' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                o haz clic para seleccionar
              </p>
              <UButton
                type="button"
                size="sm"
                variant="outline"
                @click="fileInput?.click()"
              >
                <UIcon name="i-lucide-folder-open" class="h-4 w-4 mr-2" />
                Seleccionar archivos
              </UButton>
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
            </div>

              <!-- Vista previa de imágenes -->
              <div v-if="selectedFiles.length > 0" class="space-y-6">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vista previa de imágenes
                  </h4>
                  <UButton
                    size="sm"
                    color="error"
                    variant="ghost"
                    @click="clearImages"
                  >
                    <UIcon name="i-lucide-trash-2" class="h-4 w-4 mr-2" />
                    Limpiar todas
                  </UButton>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div 
                    v-for="(file, index) in selectedFiles" 
                    :key="index"
                    class="relative group border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div class="relative">
                      <img 
                        :src="previews[index]" 
                        :alt="`Preview ${index + 1}`"
                        class="w-full h-32 object-cover rounded-lg"
                      />
                      <UButton
                        size="xs"
                        color="error"
                        class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        @click="removeImage(index)"
                      >
                        <UIcon name="i-lucide-x" class="h-3 w-3" />
                      </UButton>
                    </div>
                    
                    <div class="space-y-3">
                      <UInput
                        v-model="imageDescriptions[index]"
                        placeholder="Descripción de la imagen"
                        size="sm"
                        class="w-full"
                      />
                      <UInput
                        v-model="imageAuthors[index]"
                        placeholder="Autor (opcional)"
                        size="sm"
                        class="w-full"
                      />
                    </div>
                    
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                      {{ file.name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen del evento -->
          <div v-if="state.titulo && state.fecha_inicio" class="grid grid-cols-1 gap-6">
            <UCard class="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div class="flex items-start gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <UIcon name="i-lucide-info" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="flex-1 space-y-2">
                  <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wide">
                    Resumen del Evento
                  </h4>
                  <div class="space-y-1">
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                      <span class="font-medium">{{ state.titulo }}</span>
                    </p>
                    <p class="text-sm text-blue-700 dark:text-blue-300">
                      📅 {{ state.fecha_inicio }} → {{ state.fecha_fin }}
                    </p>
                    <p v-if="selectedFiles.length > 0" class="text-xs text-blue-600 dark:text-blue-400">
                      🖼️ {{ selectedFiles.length }} imagen{{ selectedFiles.length !== 1 ? 'es' : '' }} adjunta{{ selectedFiles.length !== 1 ? 's' : '' }}
                    </p>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Botones de acción -->
          <div class="grid grid-cols-1 gap-6">
            <div class="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <UButton
                label="Cancelar"
                color="neutral"
                variant="ghost"
                size="lg"
                @click="handleClose"
                :disabled="uploading"
                class="w-full sm:w-auto"
              />
              <UButton
                type="submit"
                :loading="uploading"
                :disabled="!canSubmit"
                size="lg"
                class="w-full sm:w-auto"
              >
                <UIcon name="i-lucide-save" class="h-4 w-4 mr-2" />
                {{ uploading ? 'Creando...' : 'Crear Evento' }}
              </UButton>
            </div>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>