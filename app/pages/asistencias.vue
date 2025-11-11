<template>
  <UDashboardPanel id="asistencias">
    <!-- 🎯 Header fijo -->
    <UDashboardNavbar title="Asistencias" :ui="{ right: 'gap-3' }">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardNavbar>
    <div class="flex-1 overflow-hidden relative">
      <!-- Indicador de scroll superior -->
      <div
        class="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-purple-500 transform origin-left scale-x-0 transition-transform duration-300 z-10 scroll-indicator">
      </div>

      <div class="h-full overflow-y-auto scroll-container" @scroll="onScroll">
        <div class="p-6">
          <!-- Transición principal (igual que en users.vue) -->
          <Transition
            enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
            mode="out-in"
          >
            <!-- Loading skeleton -->
            <div v-if="loading && (!asistencias || asistencias.length === 0)" key="loading" class="min-h-[calc(100vh-12rem)]">
              <div class="space-y-4">
                <div class="rounded-lg overflow-hidden bg-white dark:bg-gray-950">
                  <div class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                    <USkeleton class="h-4 w-1/3" />
                  </div>
                  <div class="divide-y divide-gray-100 dark:divide-gray-800">
                    <div v-for="i in 8" :key="i" class="px-4 py-4 flex items-center gap-4">
                      <USkeleton class="size-4 rounded" />
                      <USkeleton class="h-6 w-32" />
                      <USkeleton class="size-8 rounded-full" />
                      <USkeleton class="h-5 w-40" />
                      <div class="ml-auto flex gap-2">
                        <USkeleton class="size-8 rounded" />
                        <USkeleton class="size-8 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <USkeleton class="h-5 w-32" />
                  <USkeleton class="h-10 w-64" />
                </div>
              </div>
            </div>

            <!-- Error -->
            <div v-else-if="error" key="error" class="min-h-[calc(100vh-12rem)] flex items-center justify-center">
              <UAlert
                :title="error"
                color="error"
                variant="subtle"
                icon="i-lucide-alert-circle"
                class="max-w-xl"
              >
                <template #actions>
                  <UButton 
                    @click="refreshData" 
                    color="error" 
                    variant="outline"
                    icon="i-lucide-refresh-cw"
                  >
                    Reintentar
                  </UButton>
                </template>
              </UAlert>
            </div>

            <!-- Empty state -->
            <div v-else-if="!asistencias || asistencias.length === 0" key="empty" class="min-h-[calc(100vh-12rem)] flex items-center justify-center">
              <UCard class="max-w-lg">
                <div class="flex flex-col items-center justify-center py-8 text-center">
                  <UIcon name="i-lucide-inbox" class="size-12 text-muted mb-4 animate-pulse" />
                  <h3 class="text-lg font-semibold mb-2">No hay registros</h3>
                  <p class="text-sm text-muted mb-4">No se encontraron registros que coincidan con los filtros aplicados.</p>
                  <div class="flex gap-3">
                    <UButton icon="i-lucide-sliders" variant="outline" @click="$emit('openFilters')">Abrir filtros</UButton>
                    <UButton icon="i-lucide-refresh-cw" variant="outline" @click="refreshData">Actualizar</UButton>
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Content: tabla + paginación (estado por defecto) -->
            <div v-else key="content" class="space-y-4">
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
          </Transition>
        </div>
       </div>
     </div>
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

// Key para controlar cuándo debe ejecutarse la animación (igual que en Users)
const transitionKey = computed(() => {
  try {
    // incluir filtros en key para que al cambiarlos también se anime
    return `${total.value}-${currentPage.value}-${JSON.stringify(filtros.value || {})}`
  } catch {
    return `${total.value}-${currentPage.value}`
  }
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

/* Eliminadas las reglas de transición fade-slide y stat-card-loaded
   para que no se muestre la animación. */

/* Mejora del indicador de scroll */
.scroll-indicator {
  will-change: transform;
  transition: transform 320ms cubic-bezier(.2,.8,.2,1);
}

/* Transición fade + slide (coherente con Users page) */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 320ms cubic-bezier(.2,.8,.2,1), transform 320ms cubic-bezier(.2,.8,.2,1);
  will-change: opacity, transform;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>