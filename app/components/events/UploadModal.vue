<script setup lang="ts">
interface Props {
  isOpen: boolean;
  evento?: any;
  preSelectedDate?: string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'upload', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

//  Estado del componente
const dragActive = ref(false);
const uploading = ref(false);
const selectedFiles = ref<File[]>([]);
const previews = ref<string[]>([]);
const fechaProgramada = ref('');
const horaProgramada = ref('08:00');
const descripcionEvento = ref('');
const categoriaSeleccionada = ref('celebracion');
const fileInput = ref<HTMLInputElement>();
const fechasMultiples = ref<string[]>([]);
const permitirFechasMultiples = ref(false);

//  Opciones de configuración
const categorias = [
  { label: 'Celebración', value: 'celebracion', icon: 'i-lucide-party-popper' },
  { label: 'Feriado', value: 'feriado', icon: 'i-lucide-calendar-x' },
  { label: 'Cumpleaños', value: 'cumpleanos', icon: 'i-lucide-cake' },
  { label: 'Aniversario', value: 'aniversario', icon: 'i-lucide-heart' },
  { label: 'Especial', value: 'especial', icon: 'i-lucide-star' }
];

//  Drag & Drop handlers
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
};

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
      title: "Error",
      description: "Solo se permiten archivos de imagen",
      color: "error"
    });
    return;
  }

  selectedFiles.value = [...selectedFiles.value, ...imageFiles];
  
  // Crear previews
  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previews.value.push(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  previews.value.splice(index, 1);
};

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) {
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Selecciona al menos una imagen",
      color: "error"
    });
    return;
  }

  uploading.value = true;
  
  try {
    // Convertir archivos a base64 para almacenamiento local
    const imagenesBase64 = await Promise.all(
      selectedFiles.value.map(async (file) => {
        return new Promise<{name: string, data: string, size: number}>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              name: file.name,
              data: e.target?.result as string,
              size: file.size
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    
    // Simular delay de subida
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const uploadData = {
      imagenes: imagenesBase64,
      descripcion: descripcionEvento.value,
      categoria: categoriaSeleccionada.value,
      fechaProgramada: fechaProgramada.value,
      fechasMultiples: permitirFechasMultiples.value ? fechasMultiples.value.filter(f => f) : [],
      hora: horaProgramada.value,
      programado: (fechaProgramada.value || fechasMultiples.value.length > 0) ? true : false,
      fechaCreacion: new Date().toISOString()
    };

    emit('upload', uploadData);
    closeModal();

    const toast = useToast();
    toast.add({
      title: "✅ ¡Éxito!",
      description: `${selectedFiles.value.length} imagen(es) subida(s) correctamente`,
      color: "success"
    });

  } catch (error) {
    const toast = useToast();
    toast.add({
      title: "❌ Error",
      description: "Error al procesar las imágenes",
      color: "error"
    });
  } finally {
    uploading.value = false;
  }
};

const closeModal = () => {
  selectedFiles.value = [];
  previews.value = [];
  fechaProgramada.value = '';
  horaProgramada.value = '08:00';
  descripcionEvento.value = '';
  categoriaSeleccionada.value = 'celebracion';
  fechasMultiples.value = [];
  permitirFechasMultiples.value = false;
  emit('close');
};

// 📅 Configurar fecha por defecto si hay evento o fecha preseleccionada
watch(() => props.evento, (evento) => {
  if (evento) {
    fechaProgramada.value = evento.fecha;
    descripcionEvento.value = evento.descripcion || '';
    categoriaSeleccionada.value = evento.categoria || 'celebracion';
  }
});

watch(() => props.preSelectedDate, (fecha) => {
  if (fecha) {
    fechaProgramada.value = fecha;
    // Limpiar otros campos para nueva entrada
    descripcionEvento.value = '';
    categoriaSeleccionada.value = 'celebracion';
  }
}, { immediate: true });
</script>

<template>
  <UModal 
    :model-value="isOpen" 
    @update:model-value="closeModal"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ evento 
                ? `Subir imagen para ${evento.nombre}` 
                : preSelectedDate 
                  ? `Crear evento para ${new Date(preSelectedDate).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}`
                  : 'Crear nuevo evento con imágenes' 
              }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ preSelectedDate 
                ? `Agrega imágenes y detalles para el evento del ${new Date(preSelectedDate).toLocaleDateString('es-PE')}`
                : 'Selecciona las imágenes y programa cuándo se publicarán'
              }}
            </p>
          </div>
          <UButton 
            icon="i-lucide-x" 
            variant="ghost" 
            size="sm" 
            @click="closeModal"
          />
        </div>
      </template>

      <div class="space-y-6">
        <!-- 📁 Zona de subida de archivos mejorada -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            📸 Subir Imágenes del Evento
          </label>
          
          <!-- Drag & Drop Area mejorada -->
          <div 
            class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300"
            :class="dragActive 
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/30 transform scale-105 shadow-lg' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <div class="space-y-4">
              <!-- Icono animado -->
              <div class="relative">
                <UIcon 
                  name="i-lucide-cloud-upload" 
                  class="w-16 h-16 mx-auto transition-all duration-300"
                  :class="dragActive 
                    ? 'text-primary-500 animate-bounce' 
                    : 'text-gray-400 hover:text-primary-400'"
                />
                <div 
                  v-if="dragActive"
                  class="absolute inset-0 rounded-full bg-primary-100 dark:bg-primary-900 opacity-30 animate-ping"
                ></div>
              </div>
              
              <!-- Texto dinámico -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {{ dragActive 
                    ? '¡Perfecto! Suelta las imágenes aquí' 
                    : '🎨 Arrastra y suelta imágenes del evento' 
                  }}
                </h4>
                <p class="text-gray-500 dark:text-gray-400 mb-6">
                  {{ dragActive 
                    ? 'Estoy listo para recibir tus imágenes' 
                    : 'O haz clic para explorar tus archivos' 
                  }}
                </p>
              </div>
              
              <!-- Botón estilizado -->
              <UButton 
                color="primary" 
                variant="solid"
                size="lg"
                icon="i-lucide-image-plus"
                @click="fileInput?.click()"
                :class="dragActive ? 'animate-pulse' : ''"
                class="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {{ dragActive ? 'Suelta aquí' : 'Seleccionar Imágenes' }}
              </UButton>
            </div>
            
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            
            <!-- Info mejorada -->
            <div class="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <UIcon name="i-lucide-info" class="w-4 h-4" />
              <span>Formatos: JPG, PNG, GIF, WebP • Máximo: 10MB por imagen</span>
            </div>
          </div>
        </div>

        <!-- 🖼️ Vista previa de imágenes mejorada -->
        <div v-if="previews.length > 0" class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <UIcon name="i-lucide-images" class="w-4 h-4" />
              Vista Previa
              <UBadge 
                :label="`${previews.length} imagen${previews.length !== 1 ? 'es' : ''}`" 
                color="primary" 
                variant="soft" 
                size="sm"
              />
            </label>
            
            <!-- Botón para agregar más imágenes -->
            <UButton
              icon="i-lucide-plus"
              color="primary"
              variant="outline"
              size="xs"
              @click="fileInput?.click()"
            >
              Agregar más
            </UButton>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="(preview, index) in previews" 
              :key="index"
              class="relative group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <!-- Imagen -->
              <div class="aspect-square relative overflow-hidden">
                <img 
                  :src="preview" 
                  :alt="`Preview ${index + 1}`"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                <!-- Overlay con acciones -->
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <!-- Botón de zoom/preview -->
                    <UButton
                      icon="i-lucide-zoom-in"
                      color="neutral"
                      variant="solid"
                      size="sm"
                    />
                    <!-- Botón de eliminar -->
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="solid"
                      size="sm"
                      @click="removeFile(index)"
                    />
                  </div>
                </div>
                
                <!-- Indicador de posición -->
                <div class="absolute top-2 left-2">
                  <UBadge 
                    :label="(index + 1).toString()" 
                    color="primary" 
                    variant="solid" 
                    size="xs"
                  />
                </div>
              </div>
              
              <!-- Info del archivo -->
              <div class="p-3">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {{ selectedFiles[index]?.name || `Imagen ${index + 1}` }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ Math.round((selectedFiles[index]?.size || 0) / 1024) }}KB
                  </p>
                </div>
                
                <!-- Barra de progreso de carga -->
                <div v-if="uploading" class="mt-2">
                  <UProgress 
                    :value="100" 
                    color="primary" 
                    size="xs"
                    class="animate-pulse"
                  />
                  <p class="text-xs text-center text-gray-500 mt-1">Subiendo...</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Stats de archivos -->
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-images" class="w-4 h-4" />
                <span>{{ previews.length }} imagen{{ previews.length !== 1 ? 'es' : '' }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-hard-drive" class="w-4 h-4" />
                <span>{{ Math.round(selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024 * 100) / 100 }} MB</span>
              </div>
            </div>
            
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              @click="selectedFiles = []; previews = []"
            >
              Limpiar todo
            </UButton>
          </div>
        </div>

        <!-- ⚙️ Configuración del evento mejorada -->
        <UCard class="bg-gray-50 dark:bg-gray-800/50">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-settings" class="w-5 h-5 text-primary-500" />
              <h4 class="font-medium text-gray-900 dark:text-white">Configuración del Evento</h4>
            </div>
          </template>

          <div class="space-y-6">
            <!-- Título/Descripción del evento -->
            <div>
              <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UIcon name="i-lucide-type" class="w-4 h-4" />
                Título del Evento
              </label>
              <UInput
                v-model="descripcionEvento"
                placeholder="Ej: Celebración del Día del Trabajador..."
                size="lg"
                icon="i-lucide-sparkles"
                class="w-full"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- Categoría con iconos -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <UIcon name="i-lucide-tag" class="w-4 h-4" />
                  Categoría del Evento
                </label>
                <USelectMenu
                  v-model="categoriaSeleccionada"
                  :options="categorias"
                  placeholder="Seleccionar categoría"
                  size="lg"
                  option-attribute="label"
                  value-attribute="value"
                />
              </div>

              <!-- Fecha de programación -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                  Fecha de Publicación
                </label>
                <UInput
                  v-model="fechaProgramada"
                  type="date"
                  size="lg"
                  :min="new Date().toISOString().split('T')[0]"
                  :disabled="permitirFechasMultiples"
                />
              </div>

              <!-- Hora de programación -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <UIcon name="i-lucide-clock" class="w-4 h-4" />
                  Hora de Publicación
                </label>
                <UInput
                  v-model="horaProgramada"
                  type="time"
                  size="lg"
                />
              </div>

              <!-- Toggle para fechas múltiples -->
              <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3">
                  <UIcon name="i-lucide-calendar-range" class="w-5 h-5 text-primary-500" />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">Fechas Múltiples</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Programar para varias fechas</p>
                  </div>
                </div>
                <UToggle 
                  v-model="permitirFechasMultiples" 
                  size="md"
                />
              </div>
            </div>

            <!-- Selector de fechas múltiples mejorado -->
            <div v-if="permitirFechasMultiples" class="space-y-4">
              <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <UIcon name="i-lucide-calendar-days" class="w-4 h-4" />
                Fechas Específicas
              </label>
              
              <div class="space-y-3">
                <TransitionGroup name="list" tag="div">
                  <div 
                    v-for="(fecha, index) in fechasMultiples" 
                    :key="index"
                    class="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-500" />
                    <UInput
                      v-model="fechasMultiples[index]"
                      type="date"
                      size="md"
                      :min="new Date().toISOString().split('T')[0]"
                      class="flex-1"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="sm"
                      @click="fechasMultiples.splice(index, 1)"
                    />
                  </div>
                </TransitionGroup>
                
                <UButton
                  icon="i-lucide-plus"
                  color="primary"
                  variant="outline"
                  size="md"
                  @click="fechasMultiples.push('')"
                  class="w-full"
                >
                  Agregar Nueva Fecha
                </UButton>
              </div>
            </div>
          </div>
        </UCard>

        <!-- 📊 Resumen de programación -->
        <div v-if="fechaProgramada && horaProgramada" class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-lucide-info" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 class="font-medium text-blue-900 dark:text-blue-100">Programación</h4>
          </div>
          <p class="text-sm text-blue-800 dark:text-blue-200">
            Las imágenes se publicarán automáticamente el 
            <strong>{{ new Date(fechaProgramada).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</strong>
            a las <strong>{{ horaProgramada }}</strong>
          </p>
        </div>
      </div>

      <template #footer>
        <div class="bg-gray-50 dark:bg-gray-800 -mx-6 -mb-6 px-6 py-4">
          <!-- Resumen antes de subir -->
          <div v-if="selectedFiles.length > 0 && !uploading" class="mb-4 p-3 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 rounded-lg">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-info" class="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
              <div class="flex-1">
                <h4 class="font-medium text-primary-900 dark:text-primary-100 mb-1">Resumen del evento</h4>
                <ul class="text-sm text-primary-800 dark:text-primary-200 space-y-1">
                  <li>📸 {{ selectedFiles.length }} imagen{{ selectedFiles.length !== 1 ? 'es' : '' }} seleccionada{{ selectedFiles.length !== 1 ? 's' : '' }}</li>
                  <li v-if="descripcionEvento">🏷️ {{ descripcionEvento }}</li>
                  <li v-if="fechaProgramada">📅 Programado para {{ new Date(fechaProgramada).toLocaleDateString('es-PE') }} a las {{ horaProgramada }}</li>
                  <li v-if="fechasMultiples.length > 0">📅 {{ fechasMultiples.length }} fecha{{ fechasMultiples.length !== 1 ? 's' : '' }} programada{{ fechasMultiples.length !== 1 ? 's' : '' }}</li>
                  <li>🎯 Categoría: {{ categorias.find(c => c.value === categoriaSeleccionada)?.label }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Barra de progreso durante subida -->
          <div v-if="uploading" class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Subiendo imágenes...</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ selectedFiles.length }} archivo{{ selectedFiles.length !== 1 ? 's' : '' }}</span>
            </div>
            <UProgress 
              :value="100" 
              color="primary" 
              size="md"
              class="animate-pulse"
            />
            <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">Esto puede tomar unos segundos...</p>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end gap-3">
            <UButton 
              variant="outline" 
              @click="closeModal"
              :disabled="uploading"
              icon="i-lucide-x"
              size="md"
            >
              Cancelar
            </UButton>
            <UButton 
              color="primary" 
              @click="uploadFiles"
              :loading="uploading"
              :disabled="selectedFiles.length === 0"
              size="md"
              :icon="uploading ? 'i-lucide-loader-2' : 'i-lucide-upload'"
              class="min-w-[140px]"
            >
              {{ uploading 
                ? 'Subiendo...' 
                : selectedFiles.length === 0 
                  ? 'Selecciona imágenes'
                  : `Crear evento ${selectedFiles.length > 1 ? `(${selectedFiles.length})` : ''}`
              }}
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<style scoped>
/* Animaciones para drag & drop mejoradas */
.drag-active {
  transform: scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Hover effect para preview images */
.preview-container:hover img {
  transform: scale(1.05);
}

/* Animaciones para la lista de fechas múltiples */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

/* Animación de pulsación para elementos interactivos */
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .8;
  }
}

/* Efecto de brillo en botones principales */
.btn-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Transiciones suaves para todos los elementos */
* {
  transition: all 0.2s ease;
}

/* Efecto de enfoque mejorado */
.focus-enhanced:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: rgb(59, 130, 246);
}

/* Animación de carga personalizada */
.upload-progress {
  background: linear-gradient(
    90deg,
    var(--primary-50) 0%,
    var(--primary-100) 50%,
    var(--primary-50) 100%
  );
  background-size: 200% 100%;
  animation: loading-wave 1.5s ease-in-out infinite;
}

@keyframes loading-wave {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Efecto hover para cards */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>