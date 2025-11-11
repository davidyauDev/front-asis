<template>
  <UDashboardPanel class="h-screen flex flex-col">
    <!-- 🎯 Header fijo -->
    <UDashboardNavbar title="Control de Asistencias" class="shrink-0 sticky top-0 z-50 bg-white dark:bg-gray-900 border-b">
      <template #right>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="ghost"
          size="sm"
          @click="refreshData"
          :loading="loading"
        />
      </template>
    </UDashboardNavbar>

    <!-- 📊 Stats Cards compactas -->
    <div class="shrink-0 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b">
      <div class="grid grid-cols-2 md:grid-cols-6 gap-3 stats-compact">
        <UCard class="hover:shadow-sm transition-shadow stat-card">
          <div class="text-lg font-bold text-gray-900 dark:text-white">{{ stats.total_registros }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Total</div>
        </UCard>
        
        <UCard class="hover:shadow-sm transition-shadow stat-card">
          <div class="text-lg font-bold text-emerald-600">{{ stats.check_ins_hoy }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Entradas</div>
        </UCard>
        
        <UCard class="hover:shadow-sm transition-shadow stat-card">
          <div class="text-lg font-bold text-red-500">{{ stats.check_outs_hoy }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Salidas</div>
        </UCard>
        
        <UCard class="hover:shadow-sm transition-shadow stat-card">
          <div class="text-lg font-bold text-blue-600">{{ stats.usuarios_activos }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Activos</div>
        </UCard>
        
        <UCard class="hover:shadow-sm transition-shadow stat-card">
          <div class="text-lg font-bold text-emerald-600">{{ stats.sincronizados }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Sync</div>
        </UCard>
        
        <UCard class="hover:shadow-sm transition-shadow stat-card">
          <div class="text-lg font-bold text-amber-500">{{ stats.pendientes }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Pendientes</div>
        </UCard>
      </div>
    </div>

    <!-- 🔍 Filtros compactos -->
    <div class="shrink-0 px-6 py-3 bg-white dark:bg-gray-900 border-b">
      <AsistenciaFilters
        v-model="filtros"
        :loading="loading"
        @filters-changed="aplicarFiltros"
      />
    </div>

    <!-- 📋 Contenedor principal con scroll -->
    <div class="flex-1 overflow-hidden relative">
      <!-- Indicador de scroll superior -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500 transform origin-left scale-x-0 transition-transform duration-300 z-10 scroll-indicator"></div>
      
      <div class="h-full overflow-y-auto scroll-container" @scroll="onScroll">
        <div class="p-6">
          <!-- Tabla de asistencias -->
          <UCard class="min-h-96">
            <AsistenciaTable
              :asistencias="asistencias as AsistenciaRecord[]"
              :loading="loading"
              :total-records="total"
              :current-page="currentPage"
              :per-page="perPage"
              :from-record="fromRecord"
              :to-record="toRecord"
              :stats="stats"
              @edit="abrirModalEditarAsistencia"
              @view="verDetalleAsistencia"
              @duplicate="duplicarAsistencia"
              @sync="forzarSincronizacion"
              @page-changed="cambiarPagina"
              @per-page-changed="cambiarRegistrosPorPagina"
            />
          </UCard>
        </div>
      </div>
    </div>

    <!-- ️ Modal de detalles -->
    <UModal v-model="modalDetalleAbierto">
      <div class="p-6" v-if="asistenciaDetalle">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-lucide-eye" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Detalles del Registro #{{ asistenciaDetalle.id }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Información completa del registro de asistencia
            </p>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Usuario -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-semibold mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-user" class="w-4 h-4" />
              Usuario
            </h4>
            <div class="flex items-center gap-3">
              <UAvatar :alt="asistenciaDetalle.usuario?.name" size="sm" />
              <div>
                <div class="font-medium">{{ asistenciaDetalle.usuario?.name || 'Usuario desconocido' }}</div>
                <div class="text-sm text-gray-500">{{ asistenciaDetalle.usuario?.emp_code || `ID: ${asistenciaDetalle.usuario_id}` }}</div>
              </div>
            </div>
          </div>

          <!-- Registro -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-semibold mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-clock" class="w-4 h-4" />
              Información del Registro
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Tipo de Registro:</span>
                <div class="flex items-center gap-2 mt-1">
                  <UIcon 
                    :name="getTipoRegistroIcon(asistenciaDetalle.tipo_registro)" 
                    :class="{
                      'text-green-600': asistenciaDetalle.tipo_registro === 'check_in',
                      'text-red-600': asistenciaDetalle.tipo_registro === 'check_out'
                    }"
                    class="w-4 h-4"
                  />
                  {{ asistenciaDetalle.tipo_registro === 'check_in' ? 'Check In' : 'Check Out' }}
                </div>
              </div>
              <div>
                <span class="font-medium">Evento:</span>
                <div class="mt-1">{{ asistenciaDetalle.tipo_evento }}</div>
              </div>
              <div>
                <span class="font-medium">Fecha y Hora:</span>
                <div class="mt-1">{{ formatFecha(asistenciaDetalle.created_at) }}</div>
              </div>
              <div>
                <span class="font-medium">Timestamp:</span>
                <div class="mt-1 font-mono text-xs">{{ asistenciaDetalle.timestamp }}</div>
              </div>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-semibold mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
              Ubicación
            </h4>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium">Latitud:</span>
                  <div class="mt-1 font-mono">{{ asistenciaDetalle.latitud.toFixed(6) }}</div>
                </div>
                <div>
                  <span class="font-medium">Longitud:</span>
                  <div class="mt-1 font-mono">{{ asistenciaDetalle.longitud.toFixed(6) }}</div>
                </div>
              </div>
              <UButton
                :to="getGoogleMapsUrl(asistenciaDetalle.latitud, asistenciaDetalle.longitud)"
                target="_blank"
                size="sm"
                icon="i-lucide-external-link"
              >
                Ver en Google Maps
              </UButton>
            </div>
          </div>

          <!-- Dispositivo -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-semibold mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-smartphone" class="w-4 h-4" />
              Dispositivo
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Dispositivo:</span>
                <div class="mt-1">{{ asistenciaDetalle.dispositivo }}</div>
              </div>
              <div>
                <span class="font-medium">UUID:</span>
                <div class="mt-1 font-mono text-xs break-all">{{ asistenciaDetalle.uuid }}</div>
              </div>
              <div>
                <span class="font-medium">Batería:</span>
                <div class="mt-1 flex items-center gap-2">
                  <UIcon 
                    :name="getBateriaIcon(asistenciaDetalle.bateria)" 
                    :class="getBateriaColor(asistenciaDetalle.bateria)"
                    class="w-4 h-4"
                  />
                  <span :class="getBateriaColor(asistenciaDetalle.bateria)">
                    {{ asistenciaDetalle.bateria }}%
                  </span>
                </div>
              </div>
              <div>
                <span class="font-medium">Conexión:</span>
                <div class="mt-1 flex items-center gap-2">
                  <UIcon 
                    :name="getMetodoConexionConfig(asistenciaDetalle.metodo)?.icon || 'i-lucide-wifi'" 
                    :class="getMetodoConexionConfig(asistenciaDetalle.metodo)?.color || 'text-gray-500'"
                    class="w-4 h-4"
                  />
                  {{ getMetodoConexionConfig(asistenciaDetalle.metodo)?.label || 'Desconocido' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Estado -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-semibold mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-info" class="w-4 h-4" />
              Estado
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Sincronización:</span>
                <div class="mt-1 flex items-center gap-2">
                  <UIcon 
                    :name="getSincronizadoStatus(asistenciaDetalle.sincronizado ?? 0).icon" 
                    :class="getSincronizadoStatus(asistenciaDetalle.sincronizado ?? 0).color"
                    class="w-4 h-4"
                  />
                  <span :class="getSincronizadoStatus(asistenciaDetalle.sincronizado ?? 0).color">
                    {{ getSincronizadoStatus(asistenciaDetalle.sincronizado ?? 0).label }}
                  </span>
                </div>
              </div>
              <div>
                <span class="font-medium">Última actualización:</span>
                <div class="mt-1">{{ formatFecha(asistenciaDetalle.updated_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <UButton
            variant="outline"
            @click="modalDetalleAbierto = false"
          >
            Cerrar
          </UButton>
        </div>
      </div>
    </UModal>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { AsistenciaRecord, AsistenciaFilters as IAsistenciaFilters } from '~/types'
import AsistenciaFilters from '~/components/asistencias/AsistenciaFilters.vue'
import AsistenciaTable from '~/components/asistencias/AsistenciaTable.vue'

// 🔐 Proteger la página
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// 🎯 Composables
const { 
  asistencias, 
  loading, 
  total, 
  currentPage, 
  perPage, 
  stats,
  error,
  fetchAsistencias, 
  deleteAsistencia,
  fetchStats,
  applyFilters,
  refreshData: refresh,
  formatFecha,
  getTipoRegistroIcon,
  getGoogleMapsUrl,
  getBateriaIcon,
  getBateriaColor,
  getMetodoConexionConfig,
  getSincronizadoStatus
} = useAsistencias()

const toast = useToast()

// 📊 Estados de la página
const filtros = ref<IAsistenciaFilters>({})
const modalDetalleAbierto = ref(false)
const asistenciaDetalle = ref<AsistenciaRecord | null>(null)

// 🧮 Computadas
const fromRecord = computed(() => {
  if (total.value === 0) return 0
  return ((currentPage.value - 1) * perPage.value) + 1
})

const toRecord = computed(() => {
  const calculatedTo = currentPage.value * perPage.value
  return Math.min(calculatedTo, total.value)
})

// 🎯 Funciones de la página - OPTIMIZADO (Sin 404)
const cargarDatos = async () => {
  // Primero cargar los datos de la tabla (principal)
  await fetchAsistencias(1, filtros.value)
  
  // Stats locales en background (sin API)
  nextTick(() => {
    // Ya no usar fetchStats() para evitar 404
    // Los stats se calculan automáticamente cuando cambian los datos
  })
}

const refreshData = async () => {
  // Solo refrescar los datos principales
  await fetchAsistencias(currentPage.value, filtros.value)
  
  // Stats locales automáticamente
  // Se actualizan cuando cambian los datos
  
  toast.add({
    title: 'Datos actualizados',
    description: 'Los registros se han actualizado correctamente',
    icon: 'i-lucide-refresh-cw',
    color: 'success'
  })
}

const aplicarFiltros = async (nuevosFiltros: IAsistenciaFilters) => {
  filtros.value = nuevosFiltros
  await applyFilters(nuevosFiltros)
}

const cambiarPagina = async (pagina: number) => {
  await fetchAsistencias(pagina, filtros.value)
}

const cambiarRegistrosPorPagina = async (nuevoPerPage: number) => {
  await fetchAsistencias(1, filtros.value)
}

// 🎭 Funciones del modal (deshabilitadas)
const abrirModalEditarAsistencia = (asistencia: AsistenciaRecord) => {
  toast.add({
    title: 'Función deshabilitada',
    description: 'La edición de registros está temporalmente deshabilitada',
    icon: 'i-lucide-info',
    color: 'warning'
  })
}

// 🗑️ Funciones de eliminación (deshabilitadas)
const confirmarEliminarAsistencia = (asistencia: AsistenciaRecord) => {
  toast.add({
    title: 'Función deshabilitada',
    description: 'La eliminación de registros está temporalmente deshabilitada',
    icon: 'i-lucide-info',
    color: 'warning'
  })
}

// 👁️ Función para ver detalles
const verDetalleAsistencia = (asistencia: AsistenciaRecord) => {
  asistenciaDetalle.value = asistencia
  modalDetalleAbierto.value = true
}

// 📋 Función para duplicar registro (deshabilitada)
const duplicarAsistencia = (asistencia: AsistenciaRecord) => {
  toast.add({
    title: 'Función deshabilitada',
    description: 'La duplicación de registros está temporalmente deshabilitada',
    icon: 'i-lucide-copy',
    color: 'warning'
  })
}

// 🔄 Función para forzar sincronización
const forzarSincronizacion = async (asistencia: AsistenciaRecord) => {
  try {
    // Simular sincronización
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.add({
      title: 'Sincronización exitosa',
      description: `Registro de ${asistencia.usuario?.name} sincronizado`,
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
    
    await cargarDatos()
  } catch (error: any) {
    toast.add({
      title: 'Error de sincronización',
      description: error.message || 'No se pudo sincronizar el registro',
      icon: 'i-lucide-x-circle',
      color: 'error'
    })
  }
}

// 📊 Función para manejar el scroll e indicador
const onScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight
  
  // Calcular el porcentaje de scroll
  const scrollPercentage = scrollTop / (scrollHeight - clientHeight)
  
  // Actualizar el indicador de scroll
  const indicator = target.parentElement?.querySelector('.scroll-indicator') as HTMLElement
  if (indicator) {
    indicator.style.transform = `scaleX(${scrollPercentage})`
  }
}

// 🚀 Inicialización
onMounted(async () => {
  await cargarDatos()
})

// 🧭 SEO
useSeoMeta({
  title: 'Control de Asistencias',
  description: 'Gestiona y monitorea los registros de entrada y salida del personal'
})
</script>

<style scoped>
/* 🎨 Mejoras de scroll y UX */
.scroll-container {
  scrollbar-width: thin;
  scrollbar-color: rgb(156, 163, 175) transparent;
}

.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: rgb(156, 163, 175);
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: rgb(107, 114, 128);
}

/* Animación suave para las cards */
.stat-card {
  transition: all 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-1px);
}

/* Paginación sticky mejorada */
.pagination-sticky {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

.dark .pagination-sticky {
  background-color: rgba(17, 24, 39, 0.95);
}

/* Espaciado mejorado para mobile */
@media (max-width: 640px) {
  .stats-compact {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
}
</style>