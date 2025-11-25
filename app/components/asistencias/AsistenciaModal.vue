<template>
  <UModal :open="openModal" :close="{
    onClick: () => {

      handleClose();
    }

  }" :title="isEditing ? 'Editar Asistencia' : 'Registrar Nueva Asistencia'">
    <template #body>
      <div class="p-6">
       
        <!-- 📝 Formulario -->
        <UFormLabel ref="formRef" :schema="formSchema" :state="formData" @submit="handleSubmit" class="space-y-6">
          <!-- 📊 Grid de campos principales -->
          <div class="flex flex-wrap gap-6">
            <!-- 👤 Usuario -->
            <UFormGroup label="Usuario *" name="usuario_id" description="Selecciona el usuario para este registro">
             

              <USelectMenu v-model="formData.usuario_id"
              
              :items="usersForAttendances" item-value="value" item-label="label"
                placeholder="Seleccionar usuario" searchable clear-search-on-close :loading="loadingUsers"
                class="min-w-56"
                icon="i-lucide-user" />
            </UFormGroup>

            <!-- ✅ Tipo de Registro -->
            <!-- :options="tiposRegistroOptions" -->
            <UFormGroup label="Tipo de Registro *" name="tipo_registro" description="Indica si es entrada o salida">
              <!-- v-model="formData.tipo_registro" -->
              <USelect :items="Object.values(attendanceOptions)" item-value="value" item-label="label"
                v-model="formData.tipo_registro" placeholder="Seleccionar tipo" icon="i-lucide-clock" />
            </UFormGroup>
          </div>



          <!-- 📍 Ubicación -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
                Ubicación
              </h3>

              <UButton icon="i-lucide-locate" size="sm" variant="outline" @click="obtenerUbicacionActual"
                :loading="obteniendoUbicacion" :disabled="obteniendoUbicacion">
                {{ obteniendoUbicacion ? 'Obteniendo...' : 'Usar ubicación actual' }}
              </UButton>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup label="Latitud *" name="latitud" description="Coordenada de latitud">
                <UInput v-model.number="formData.latitud" type="number" step="0.000001" placeholder="-12.0520297"
                  icon="i-lucide-compass"
                   class="w-full"
                  />
              </UFormGroup>

              <UFormGroup label="Longitud *" name="longitud" description="Coordenada de longitud">
                <UInput v-model.number="formData.longitud" type="number" step="0.000001" placeholder="-77.0079043"
                  icon="i-lucide-compass" class="w-full" />
              </UFormGroup>
            </div>

            <!-- 🗺️ Vista previa del mapa -->
            <div v-if="formData.latitud && formData.longitud" class="mt-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-map" class="w-4 h-4 text-blue-600" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ubicación en el mapa:
                </span>
              </div>
              <UButton :to="getGoogleMapsUrl(formData.latitud, formData.longitud)" target="_blank" size="sm"
                variant="outline" icon="i-lucide-external-link">
                Ver en Google Maps
              </UButton>
            </div>
          </div>

          <!-- 📱 Información del Dispositivo -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-smartphone" class="w-5 h-5" />
              Información del Dispositivo
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- 📱 Dispositivo -->
              <UFormGroup label="Dispositivo *" name="dispositivo" description="Modelo del dispositivo">
                <UInput v-model="formData.dispositivo" placeholder="Samsung Galaxy S23" icon="i-lucide-smartphone" class="w-full" />
              </UFormGroup>

              <!-- 🔋 Batería -->
              <UFormGroup label="Nivel de Batería *" name="bateria" description="Porcentaje de batería (0-100)">
                <UInput v-model.number="formData.bateria" type="number" min="0" max="100" placeholder="85"
                  icon="i-lucide-battery" class="w-full">
                  <template #trailing>
                    <span class="text-gray-500 text-sm">%</span>
                  </template>
                </UInput>
              </UFormGroup>

              <!-- 📡 Método de Conexión -->
              <UFormGroup label="Método de Conexión *" name="metodo" description="Tipo de conexión utilizada">
                <USelectMenu
                 class="w-full"
                v-model="formData.metodo" :options="metodosConexionOptions"
                  placeholder="Seleccionar método" />
              </UFormGroup>
            </div>

            <!-- 🔄 Auto-detectar información del dispositivo -->
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <UButton icon="i-lucide-refresh-cw" variant="outline" size="sm" @click="autoDetectarDispositivo"
                :loading="detectandoDispositivo">
                {{ detectandoDispositivo ? 'Detectando...' : 'Auto-detectar información del dispositivo' }}
              </UButton>
            </div>
          </div>

          <UFormField label="Dirección Adicional" name="address"
           >
            <UInput v-model="formData.address" placeholder="Ej: Av. Siempre Viva 123, Ciudad" icon="i-lucide-home" class="w-full" />
          </UFormField>

        
        
          <!-- 🎯 Estado de envío -->
          <div v-if="estadoEnvio" class="p-4 rounded-lg" :class="{
            'bg-blue-50 dark:bg-blue-900/20': estadoEnvio.tipo === 'enviando',
            'bg-green-50 dark:bg-green-900/20': estadoEnvio.tipo === 'exito',
            'bg-red-50 dark:bg-red-900/20': estadoEnvio.tipo === 'error'
          }">
            <div class="flex items-center gap-2">
              <UIcon :name="estadoEnvio.icono" :class="{
                'text-blue-600 animate-spin': estadoEnvio.tipo === 'enviando',
                'text-green-600': estadoEnvio.tipo === 'exito',
                'text-red-600': estadoEnvio.tipo === 'error'
              }" class="w-5 h-5" />
              <span class="font-medium" :class="{
                'text-blue-700 dark:text-blue-300': estadoEnvio.tipo === 'enviando',
                'text-green-700 dark:text-green-300': estadoEnvio.tipo === 'exito',
                'text-red-700 dark:text-red-300': estadoEnvio.tipo === 'error'
              }">
                {{ estadoEnvio.mensaje }}
              </span>
            </div>
          </div>

          <!-- 🎮 Botones de acción -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton variant="outline" @click="handleClose" :disabled="enviandoFormulario">
              Cancelar
            </UButton>

            <div class="flex items-center gap-3">
              <!-- Preview del registro -->
              <!-- <UButton v-if="formIsValid" icon="i-lucide-eye" variant="outline"
                @click="mostrarPreview = !mostrarPreview">
                {{ mostrarPreview ? 'Ocultar' : 'Vista previa' }}
              </UButton> -->

              <UButton type="submit" :loading="enviandoFormulario" :disabled="!formIsValid || enviandoFormulario"
                :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus'"
                @click="handleSubmit"
                >
                {{ enviandoFormulario ? 'Guardando...' : (isEditing ? 'Actualizar registro' : 'Registrar asistencia') }}
              </UButton>
            </div>
          </div>

          <!-- 👁️ Preview del registro -->
          <UCollapse :open="mostrarPreview">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
              <h4 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <UIcon name="i-lucide-eye" class="w-4 h-4" />
                Vista previa del registro
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>Usuario:</strong> {{ getUsuarioLabel(formData.usuario_id) }}</div>
                <div><strong>Tipo:</strong> {{ formData.tipo_registro === 'check_in' ? 'Check In' : 'Check Out' }}</div>
                <div><strong>Evento:</strong> {{ formData.tipo_evento }}</div>
                <div><strong>Dispositivo:</strong> {{ formData.dispositivo }}</div>
                <div><strong>Ubicación:</strong> {{ formData.latitud }}, {{ formData.longitud }}</div>
                <div><strong>Batería:</strong> {{ formData.bateria }}%</div>
                <div><strong>Conexión:</strong> {{ getMetodoLabel(formData.metodo) }}</div>
              </div>
            </div>
          </UCollapse>
        </UFormLabel>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { attendanceOptions, AttendanceType } from '~/enums/attendance'
import type { AsistenciaCreateRequest, AsistenciaRecord, TipoEvento, TipoRegistro, MetodoConexion } from '~/types'

interface Props {
  modelValue?: boolean
  asistencia?: AsistenciaRecord | null
  openModal: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', asistencia: AsistenciaRecord): void
  (e: 'error', error: string): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 🎯 Composables
const {
  createAsistencia,
  updateAsistencia,
  tiposEvento,
  tiposRegistro,
  metodosConexion,
  getCurrentLocation,
  getBatteryLevel,
  getGoogleMapsUrl
} = useAsistencias()

const {
  getAllUsers,
  allUsers,
} = useUsers()



const usersForAttendances = computed(() => {
  return allUsers.value.map(user => ({
    value: user.id,
    label: `${user.name}`
  }));
});


// 📊 Estados
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditing = computed(() => !!props.asistencia)
const formRef = ref()
const mostrarPreview = ref(false)
const obteniendoUbicacion = ref(false)
const detectandoDispositivo = ref(false)
const enviandoFormulario = ref(false)
const loadingUsers = ref(false)

// 📝 Datos del formulario
const formData = ref<AsistenciaCreateRequest & { descripcion?: string }>({
  address: '',
  emp_code: '',
  usuario_id: '',
  tipo_registro: AttendanceType.CHECK_IN,
  tipo_evento: 'Inicio de jornada laboral',
  latitud: 0,
  longitud: 0,
  dispositivo: '',
  bateria: 100,
  metodo: 'WIFI'
})

// 📊 Estado de envío
interface EstadoEnvio {
  tipo: 'enviando' | 'exito' | 'error'
  mensaje: string
  icono: string
}

const estadoEnvio = ref<EstadoEnvio | null>(null)

// 🎯 Opciones para selects
const usuariosOptions = ref([
  { label: 'Juan Pérez (EMP001)', value: 157 },
  { label: 'María González (EMP002)', value: 158 },
  { label: 'Carlos Rodríguez (EMP003)', value: 159 },
  { label: 'Ana López (EMP004)', value: 160 },
  { label: 'Luis Martínez (EMP005)', value: 161 }
])

const tiposRegistroOptions = computed(() =>
  tiposRegistro.map(t => ({ ...t, value: t.value }))
)

const tiposEventoOptions = computed(() =>
  tiposEvento.map(t => ({ ...t, value: t.value }))
)

const metodosConexionOptions = computed(() =>
  metodosConexion.map(m => ({ ...m, value: m.value }))
)

// 📋 Schema de validación
const formSchema = z.object({
  usuario_id: z.any().refine((val) => val !== '', {
    message: 'El usuario es requerido'
  }),
  tipo_registro: z.nativeEnum(AttendanceType),
  tipo_evento: z.enum(['Inicio de jornada laboral', 'Fin de jornada laboral']),
  latitud: z.number().min(-90).max(90, 'Latitud debe estar entre -90 y 90'),
  longitud: z.number().min(-180).max(180, 'Longitud debe estar entre -180 y 180'),
  dispositivo: z.string().min(1, 'El dispositivo es requerido'),
  bateria: z.number().min(0).max(100, 'Batería debe estar entre 0 y 100'),
  metodo: z.enum(['MOVIL', 'WIFI', 'SIN_CONEXION']),
  descripcion: z.string().optional(),
  address: z.string().optional()
})

// ✅ Validación del formulario
const formIsValid = computed(() => {
  try {
    formSchema.parse(formData.value)
    return true
  } catch {
    return false
  }
})

// 🎯 Funciones
const obtenerUbicacionActual = async () => {
  obteniendoUbicacion.value = true
  try {
    const ubicacion = await getCurrentLocation()
    formData.value.latitud = Number(ubicacion.latitud.toFixed(6))
    formData.value.longitud = Number(ubicacion.longitud.toFixed(6))

    estadoEnvio.value = {
      tipo: 'exito',
      mensaje: 'Ubicación obtenida correctamente',
      icono: 'i-lucide-check-circle'
    }

    setTimeout(() => {
      estadoEnvio.value = null
    }, 3000)
  } catch (error: any) {
    estadoEnvio.value = {
      tipo: 'error',
      mensaje: 'Error al obtener ubicación: ' + error.message,
      icono: 'i-lucide-alert-circle'
    }

    setTimeout(() => {
      estadoEnvio.value = null
    }, 5000)
  } finally {
    obteniendoUbicacion.value = false
  }
}

const autoDetectarDispositivo = async () => {
  detectandoDispositivo.value = true
  try {
    // Detectar información del dispositivo
    const userAgent = navigator.userAgent
    let dispositivo = 'Dispositivo desconocido'

    if (userAgent.includes('iPhone')) {
      dispositivo = 'iPhone'
    } else if (userAgent.includes('Samsung')) {
      dispositivo = 'Samsung Galaxy'
    } else if (userAgent.includes('Pixel')) {
      dispositivo = 'Google Pixel'
    } else if (userAgent.includes('Android')) {
      dispositivo = 'Android Device'
    } else if (userAgent.includes('Windows')) {
      dispositivo = 'Windows Device'
    } else if (userAgent.includes('Mac')) {
      dispositivo = 'Mac Device'
    }

    formData.value.dispositivo = dispositivo

    // Detectar nivel de batería
    try {
      const batteryLevel = await getBatteryLevel()
      formData.value.bateria = batteryLevel
    } catch {
      formData.value.bateria = 100
    }

    // Detectar tipo de conexión
    // @ts-ignore - Connection API experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
      if (connection.type === 'wifi') {
        formData.value.metodo = 'WIFI'
      } else if (connection.type === 'cellular') {
        formData.value.metodo = 'MOVIL'
      }
    }

    estadoEnvio.value = {
      tipo: 'exito',
      mensaje: 'Información del dispositivo detectada correctamente',
      icono: 'i-lucide-check-circle'
    }

    setTimeout(() => {
      estadoEnvio.value = null
    }, 3000)
  } catch (error: any) {
    estadoEnvio.value = {
      tipo: 'error',
      mensaje: 'Error al detectar información del dispositivo',
      icono: 'i-lucide-alert-circle'
    }

    setTimeout(() => {
      estadoEnvio.value = null
    }, 5000)
  } finally {
    detectandoDispositivo.value = false
  }
}

const getUsuarioLabel = (userId: number) => {
  const user = usuariosOptions.value.find(u => u.value === userId)
  return user?.label || 'Usuario desconocido'
}

const getMetodoLabel = (metodo: MetodoConexion) => {
  const method = metodosConexion.find(m => m.value === metodo)
  return method?.label || 'Desconocido'
}

const handleSubmit = async () => {
  
  if (!formIsValid.value) return

  enviandoFormulario.value = true
  estadoEnvio.value = {
    tipo: 'enviando',
    mensaje: isEditing.value ? 'Actualizando registro...' : 'Guardando registro...',
    icono: 'i-lucide-loader'
  }

  try {
    let result: AsistenciaRecord

    const empCode = allUsers.value.find(u => u.id === formData.value.usuario_id?.value)?.emp_code || ''
   
    formData.value.emp_code = empCode

    console.log('Datos del formulario a enviar:', formData.value)

    if (isEditing.value && props.asistencia) {
      result = await updateAsistencia(props.asistencia.id, formData.value)
    } else {
      result = await createAsistencia(formData.value)
    }

    estadoEnvio.value = {
      tipo: 'exito',
      mensaje: isEditing.value ? 'Registro actualizado exitosamente ✅' : 'Registro guardado exitosamente ✅',
      icono: 'i-lucide-check-circle'
    }

    emit('success', result)

    setTimeout(() => {
      handleClose()
    }, 2000)
  } catch (error: any) {
    estadoEnvio.value = {
      tipo: 'error',
      mensaje: 'Error ❌: ' + (error.message || 'No se pudo guardar el registro'),
      icono: 'i-lucide-alert-circle'
    }

    emit('error', error.message || 'Error desconocido')
  } finally {
    enviandoFormulario.value = false
  }
}

const handleClose = () => {
  

  emit('close')

  

  // Reset form después de un delay para evitar flash
  setTimeout(() => {
    resetForm()
  }, 300)
}

onMounted(async () => {
  try {
    if (!allUsers.value?.length) {
      await getAllUsers();
    }

  } catch (err) {
    console.error('Error al inicializar usuarios:', err);
  }
});

const resetForm = () => {
  formData.value = {
    emp_code: '',
    usuario_id: '',
    tipo_registro: AttendanceType.CHECK_IN,
    tipo_evento: 'Inicio de jornada laboral',
    latitud: 0,
    longitud: 0,
    dispositivo: '',
    bateria: 100,
    metodo: 'WIFI',
    descripcion: '',
    address: ''
  }
}

// 🔄 Watchers
watch(() => props.asistencia, (newAsistencia) => {
  if (newAsistencia) {
    const user = usersForAttendances.value.find(u => u.value === newAsistencia.usuario_id);


    
    // Llenar el formulario con los datos del registro a editar
    formData.value = {
      emp_code: newAsistencia.emp_code || '',
      usuario_id: user,
      tipo_registro: newAsistencia.tipo_registro,
      tipo_evento: newAsistencia.tipo_evento,
      latitud: newAsistencia.latitud,
      longitud: newAsistencia.longitud,
      dispositivo: newAsistencia.dispositivo,
      bateria: newAsistencia.bateria,
      metodo: newAsistencia.metodo
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Auto-sincronizar tipo de evento con tipo de registro
watch(() => formData.value.tipo_registro, (newTipo) => {
  if (newTipo === 'check_in') {
    formData.value.tipo_evento = 'Inicio de jornada laboral'
  } else if (newTipo === 'check_out') {
    formData.value.tipo_evento = 'Fin de jornada laboral'
  }
})
</script>

<style scoped>
/* Estilos para mejorar la apariencia del modal */
:deep(.modal-content) {
  max-height: 90vh;
  overflow-y: auto;
}
</style>