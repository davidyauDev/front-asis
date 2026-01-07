
<template>
    <UDashboardPanel id="seguimiento">
       <template #header>
      <UDashboardNavbar title="Seguimiento" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
         <div class="seguimiento-container p-6">
        <!-- Encabezado -->
        <header class="mb-6">
            <h1 class="text-2xl font-bold mb-1 flex items-center gap-2">
                <span>Seguimiento de Técnicos</span>
                <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Módulo Operativo</span>
            </h1>
            <p class="text-gray-600 mb-4">Monitorea en tiempo real el estado de técnicos en ruta, actividad diaria y cumplimiento de asistencia. Detección temprana de incidencias y trazabilidad para acciones correctivas.</p>
            
            <!-- Barra de búsqueda y filtros -->
            <div class="flex flex-wrap gap-3 items-center mb-4">
                <div class="relative flex-1 min-w-62.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        v-model="search" 
                        type="text" 
                        placeholder="Buscar por nombre, DNI, agencia o cliente..." 
                        class="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                    <span v-if="search" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        {{ datosAgrupadosFiltrados.length }} resultado(s)
                    </span>
                </div>
                
                <select v-model="filtroEstado" class="border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500">
                    <option value="todos">Todos los técnicos</option>
                    <option value="con-marcacion">✓ Con marcación</option>
                    <option value="sin-marcacion">⚠ Sin marcación</option>
                </select>
                
                <select v-model="ordenarPor" class="border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500">
                    <option value="nombre">Ordenar: Nombre</option>
                    <option value="rutas">Ordenar: Más rutas</option>
                    <option value="marcaciones">Ordenar: Más marcaciones</option>
                </select>
                
                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" @click="generarReporte">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar
                </button>
                
                <button 
                    @click="recargarDatos" 
                    :disabled="isLoading"
                    class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Recargar datos"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-5 w-5" 
                        :class="{ 'animate-spin': isLoading }"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span class="hidden sm:inline">{{ isLoading ? 'Cargando...' : 'Actualizar' }}</span>
                </button>
            </div>
            
            <!-- Filtros avanzados colapsables -->
            <div v-if="showFilters" class="mb-4 p-4 bg-gray-50 border rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Registros por página</label>
                        <select v-model.number="itemsPorPagina" class="border rounded-lg px-3 py-2 w-full">
                            <option :value="5">5 por página</option>
                            <option :value="10">10 por página</option>
                            <option :value="25">25 por página</option>
                            <option :value="50">50 por página</option>
                            <option :value="100">100 por página</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Indicadores resumen -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                <div
                    v-for="card in resumenCards"
                    :key="card.titulo"
                    class="bg-white border rounded-lg p-4 shadow-sm"
                >
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-gray-600">{{ card.titulo }}</span>
                        <span
                            class="w-2 h-2 rounded-full"
                            :class="{
                                'bg-green-500': card.estado === 'normal',
                                'bg-yellow-500': card.estado === 'warning',
                                'bg-red-500': card.estado === 'critical'
                            }"
                        ></span>
                    </div>
                    <div class="text-2xl font-bold text-gray-900">{{ card.valor }}</div>
                </div>
            </div>
        </header>

        <!-- Navegación por secciones -->
        <nav class="mb-6">
            <ul class="flex gap-4 border-b">
                <li v-for="tab in tabs" :key="tab.value">
                    <button
                        class="px-4 py-2 -mb-px border-b-2"
                        :class="activeTab === tab.value ? 'border-blue-600 text-blue-700 font-semibold' : 'border-transparent text-gray-500'"
                        @click="activeTab = tab.value"
                    >
                        {{ tab.label }}
                    </button>
                </li>
            </ul>
        </nav>

        <!-- Secciones -->
        <section v-if="activeTab === 'general'">
            <!-- Estado de carga -->
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
                <svg class="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600 font-medium">Cargando datos de seguimiento...</p>
            </div>

            <!-- Estado de error -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-red-800 mb-2">Error al cargar datos</h3>
                <p class="text-red-600 mb-4">{{ error }}</p>
                <button 
                    @click="recargarDatos"
                    class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Intentar nuevamente
                </button>
            </div>

            <!-- Contenido principal -->
            <div v-else>
            <!-- Información de resultados -->
            <div class="mb-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                    Mostrando {{ datosPaginados.length }} de {{ datosAgrupadosFiltrados.length }} técnico(s)
                    <span v-if="search || filtroEstado !== 'todos'" class="text-blue-600">(filtrado)</span>
                </span>
                <button 
                    @click="showFilters = !showFilters" 
                    class="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    {{ showFilters ? 'Ocultar' : 'Más' }} opciones
                </button>
            </div>

            <!-- Lista de técnicos -->
            <div class="space-y-3">
                <div v-if="datosPaginados.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-gray-600 font-medium">No se encontraron técnicos</p>
                    <p class="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                </div>

                <!-- Iteración por cada técnico -->
                <div
                    v-for="[dni, tecnicoData] in datosPaginados"
                    :key="dni"
                    class="bg-white border rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                    <!-- Encabezado del técnico - Siempre visible -->
                    <div 
                        class="bg-linear-to-r from-blue-50 to-blue-100 p-3 border-b cursor-pointer hover:from-blue-100 hover:to-blue-150 transition-colors"
                        @click="toggleTecnico(dni)"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <!-- Avatar -->
                                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {{ tecnicoData.rutas[0]?.firstname.charAt(0) }}{{ tecnicoData.rutas[0]?.lastname.charAt(0) }}
                                </div>
                                
                                <!-- Info básica -->
                                <div class="min-w-0">
                                    <h3 class="text-base font-semibold text-gray-900 truncate">
                                        {{ tecnicoData.rutas[0]?.firstname }} {{ tecnicoData.rutas[0]?.lastname }}
                                    </h3>
                                    <p class="text-xs text-gray-600">DNI: {{ dni }}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2 shrink-0">
                                <!-- Badges compactos -->
                                <span
                                    v-if="esObjetoSinMarcacion(tecnicoData.iclock_transactions)"
                                    class="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1"
                                    title="Sin marcación"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Sin marcación
                                </span>
                                <span
                                    v-else-if="Array.isArray(tecnicoData.iclock_transactions) && tecnicoData.iclock_transactions.length > 0"
                                    class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1"
                                    :title="`${tecnicoData.iclock_transactions.length} marcación(es)`"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {{ tecnicoData.iclock_transactions.length }}
                                </span>
                                
                                <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full" :title="`${tecnicoData.rutas.length} ruta(s)`">
                                    📋 {{ tecnicoData.rutas.length }}
                                </span>
                                
                                <!-- Icono expandir/colapsar -->
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    class="h-5 w-5 text-gray-500 transition-transform"
                                    :class="{ 'rotate-180': tecnicosExpandidos[dni] }"
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- Contenido expandible: Rutas y Asistencia -->
                    <div v-show="tecnicosExpandidos[dni]" class="p-4 bg-gray-50">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <!-- Columna izquierda: Rutas asignadas -->
                            <div>
                                <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Rutas Asignadas
                                </h4>
                                <div class="space-y-2 max-h-96 overflow-y-auto">
                                    <div
                                        v-for="ruta in tecnicoData.rutas"
                                        :key="ruta.ticket_id"
                                        class="border rounded p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div class="flex items-start justify-between mb-2">
                                            <div>
                                                <span class="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{{ ruta.number }}</span>
                                                <span
                                                    class="ml-2 text-xs px-2 py-1 rounded"
                                                    :class="{
                                                        'bg-yellow-100 text-yellow-700': ruta.estado === 'Programado',
                                                        'bg-green-100 text-green-700': ruta.estado === 'Completado',
                                                        'bg-blue-100 text-blue-700': ruta.estado === 'En Proceso'
                                                    }"
                                                >
                                                    {{ ruta.estado }}
                                                </span>
                                            </div>
                                            <span class="text-xs text-gray-500">{{ ruta.fecha_programada?.split(' ')[1] }}</span>
                                        </div>
                                        <p class="text-sm font-medium text-gray-900 mb-1">{{ ruta.agencia }}</p>
                                        <div class="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                            <span>📦 {{ ruta.equipo }}</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                            <span>🔧 {{ ruta.topic }}</span>
                                            <span>•</span>
                                            <span>🏢 {{ ruta.cliente }}</span>
                                        </div>
                                        <p v-if="ruta.subject !== 'S/N'" class="text-xs text-gray-500 mt-1">{{ ruta.subject }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Columna derecha: Marcaciones de asistencia -->
                            <div>
                                <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Marcaciones de Asistencia
                                </h4>
                                <!-- Si no marcó -->
                                <div
                                    v-if="esObjetoSinMarcacion(tecnicoData.iclock_transactions)"
                                    class="border border-red-200 rounded p-4 bg-red-50"
                                >
                                    <div class="flex items-center gap-2 text-red-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span class="font-medium">El técnico no ha registrado marcación</span>
                                    </div>
                                </div>

                                <!-- Si tiene marcaciones -->
                                <div
                                    v-else-if="Array.isArray(tecnicoData.iclock_transactions)"
                                    class="space-y-2 max-h-96 overflow-y-auto"
                                >
                                    <div
                                        v-for="marcacion in tecnicoData.iclock_transactions"
                                        :key="marcacion.id"
                                        class="border rounded p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div class="flex items-start justify-between mb-2">
                                            <span class="text-sm font-medium text-gray-900">
                                                {{ new Date(marcacion.punch_time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }}
                                            </span>
                                            <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{{ marcacion.terminal_sn }}</span>
                                        </div>
                                        <p class="text-xs text-gray-600 mb-2">
                                            📍 {{ marcacion.gps_location }}
                                        </p>
                                        <div class="text-xs text-gray-500">
                                            <p>Lat: {{ marcacion.latitude }} | Long: {{ marcacion.longitude }}</p>
                                        </div>
                                        <!-- Imagen si existe -->
                                        <div v-if="marcacion.imagen_url" class="mt-2">
                                            <img
                                                :src="marcacion.imagen_url"
                                                alt="Foto de marcación"
                                                class="w-full h-32 object-cover rounded border"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Paginación -->
            <div v-if="totalPaginas > 1" class="mt-6 flex items-center justify-between border-t pt-4">
                <div class="text-sm text-gray-600">
                    Página {{ paginaActual }} de {{ totalPaginas }}
                </div>
                <div class="flex gap-2">
                    <button
                        @click="cambiarPagina(paginaActual - 1)"
                        :disabled="paginaActual === 1"
                        class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        ← Anterior
                    </button>
                    
                    <!-- Números de página -->
                    <button
                        v-for="pagina in totalPaginas"
                        :key="pagina"
                        v-show="Math.abs(pagina - paginaActual) <= 2 || pagina === 1 || pagina === totalPaginas"
                        @click="cambiarPagina(pagina)"
                        class="px-3 py-1 border rounded-lg transition-colors"
                        :class="{
                            'bg-blue-600 text-white border-blue-600': pagina === paginaActual,
                            'hover:bg-gray-50': pagina !== paginaActual
                        }"
                    >
                        {{ pagina }}
                    </button>
                    
                    <button
                        @click="cambiarPagina(paginaActual + 1)"
                        :disabled="paginaActual === totalPaginas"
                        class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Siguiente →
                    </button>
                </div>
            </div>
            </div>
        </section>
        <section v-else-if="activeTab === 'alertas'">
            <div class="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-yellow-800">Sección de Alertas - En desarrollo</p>
            </div>
        </section>
        <section v-else-if="activeTab === 'comunicaciones'">
            <div class="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-blue-800">Sección de Comunicaciones - En desarrollo</p>
            </div>
        </section>
        <section v-else-if="activeTab === 'rutas'">
            <div class="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                <p class="text-purple-800">Sección de Rutas - En desarrollo</p>
            </div>
        </section>
    </div>
    </template>

   
    </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { apiFetch } from '~/services/api'

// Interfaces para tipar los datos
interface Ruta {
    ticket_id: number
    number: string
    fecha_programada: string
    fecha_programada_formateada: string
    fecha_actual: string
    id_tecnico: number
    firstname: string
    lastname: string
    dni: string
    equipo: string
    serie: string
    agencia: string
    topic_id: number
    topic: string
    cliente: string
    status_id: number
    estado: string
    subject: string
    id_solucion: number | null
    incidencia: string | null
    falla: string | null
}

interface Marcacion {
    id: number
    emp_code: string
    punch_time: string
    punch_state: string
    verify_type: number
    work_code: string | null
    terminal_sn: string
    terminal_alias: string | null
    area_alias: string | null
    longitude: string
    latitude: string
    gps_location: string
    mobile: string
    source: number
    purpose: number
    crc: string | null
    is_attendance: number
    reserved: string | null
    upload_time: string
    sync_status: number
    sync_time: string | null
    emp_id: number
    terminal_id: number | null
    is_mask: number
    temperature: string
    identificador: string | null
    imagen_url: string | null
}

interface TecnicoData {
    rutas: Ruta[]
    iclock_transactions: Marcacion[] | { message: string }
}

// Helper para verificar tipo de iclock_transactions
const esObjetoSinMarcacion = (obj: any): obj is { message: string } => {
    return obj && typeof obj === 'object' && 'message' in obj && !Array.isArray(obj)
}

// Mock de tabs/secciones
const tabs = [
    { label: 'General', value: 'general' },
    { label: 'Alertas', value: 'alertas' },
    { label: 'Registro de Comunicaciones', value: 'comunicaciones' },
    { label: 'Rutas', value: 'rutas' },
]
const activeTab = ref('general')

// Buscador, filtros y paginación
const search = ref('')
const showFilters = ref(false)
const filtroEstado = ref('todos') // 'todos', 'con-marcacion', 'sin-marcacion'
const ordenarPor = ref('nombre') // 'nombre', 'rutas', 'marcaciones'
const itemsPorPagina = ref(10)
const paginaActual = ref(1)
const tecnicosExpandidos = ref<Record<string, boolean>>({})

// Estados de carga
const isLoading = ref(false)
const error = ref<string | null>(null)

const generarReporte = () => {
    alert('Funcionalidad de generación de reporte (mock)')
}

const toggleTecnico = (dni: string) => {
    tecnicosExpandidos.value[dni] = !tecnicosExpandidos.value[dni]
}

// Computed: Calcular estadísticas dinámicas basadas en los datos
const tecnicosActivos = computed(() => {
    return Object.keys(datosAgrupados.value).length
})

const tecnicosConMarcacion = computed(() => {
    return Object.values(datosAgrupados.value).filter((tecnico: any) => 
        Array.isArray(tecnico.iclock_transactions) && tecnico.iclock_transactions.length > 0
    ).length
})

const tecnicosSinMarcacion = computed(() => {
    return Object.values(datosAgrupados.value).filter((tecnico: any) => 
        esObjetoSinMarcacion(tecnico.iclock_transactions)
    ).length
})

const totalRutas = computed(() => {
    return Object.values(datosAgrupados.value).reduce((total: number, tecnico: any) => 
        total + tecnico.rutas.length, 0
    )
})

// Mock de indicadores resumen con datos calculados
const resumenCards = computed(() => [
    {
        titulo: 'Técnicos Activos',
        valor: tecnicosActivos.value,
        estado: 'normal',
        icono: 'mdi-account-check',
    },
    {
        titulo: 'Con Marcación',
        valor: tecnicosConMarcacion.value,
        estado: 'normal',
        icono: 'mdi-check-circle',
    },
    {
        titulo: 'Sin Marcación',
        valor: tecnicosSinMarcacion.value,
        estado: tecnicosSinMarcacion.value > 0 ? 'warning' : 'normal',
        icono: 'mdi-alert',
    },
    {
        titulo: 'Total Rutas',
        valor: totalRutas.value,
        estado: 'normal',
        icono: 'mdi-map-marker-multiple',
    },
])

// Datos filtrados y ordenados
const datosAgrupadosFiltrados = computed(() => {
    let datos = Object.entries(datosAgrupados.value)
    
    // Filtrar por búsqueda
    if (search.value.trim()) {
        const searchLower = search.value.toLowerCase()
        datos = datos.filter(([dni, tecnicoData]: [string, any]) => {
            const nombre = `${tecnicoData.rutas[0]?.firstname} ${tecnicoData.rutas[0]?.lastname}`.toLowerCase()
            const agencias = tecnicoData.rutas.map((r: any) => r.agencia.toLowerCase()).join(' ')
            const cliente = tecnicoData.rutas.map((r: any) => r.cliente.toLowerCase()).join(' ')
            
            return dni.includes(searchLower) || 
                   nombre.includes(searchLower) || 
                   agencias.includes(searchLower) ||
                   cliente.includes(searchLower)
        })
    }
    
    // Filtrar por estado de marcación
    if (filtroEstado.value === 'con-marcacion') {
        datos = datos.filter(([_, tecnicoData]: [string, any]) => 
            Array.isArray(tecnicoData.iclock_transactions) && tecnicoData.iclock_transactions.length > 0
        )
    } else if (filtroEstado.value === 'sin-marcacion') {
        datos = datos.filter(([_, tecnicoData]: [string, any]) => 
            esObjetoSinMarcacion(tecnicoData.iclock_transactions)
        )
    }
    
    // Ordenar
    datos.sort(([dniA, dataA]: [string, any], [dniB, dataB]: [string, any]) => {
        if (ordenarPor.value === 'nombre') {
            const nombreA = `${dataA.rutas[0]?.firstname} ${dataA.rutas[0]?.lastname}`
            const nombreB = `${dataB.rutas[0]?.firstname} ${dataB.rutas[0]?.lastname}`
            return nombreA.localeCompare(nombreB)
        } else if (ordenarPor.value === 'rutas') {
            return dataB.rutas.length - dataA.rutas.length
        } else if (ordenarPor.value === 'marcaciones') {
            const marcacionesA = Array.isArray(dataA.iclock_transactions) ? dataA.iclock_transactions.length : 0
            const marcacionesB = Array.isArray(dataB.iclock_transactions) ? dataB.iclock_transactions.length : 0
            return marcacionesB - marcacionesA
        }
        return 0
    })
    
    return datos
})

// Datos paginados
const datosPaginados = computed(() => {
    const inicio = (paginaActual.value - 1) * itemsPorPagina.value
    const fin = inicio + itemsPorPagina.value
    return datosAgrupadosFiltrados.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
    return Math.ceil(datosAgrupadosFiltrados.value.length / itemsPorPagina.value)
})

const cambiarPagina = (pagina: number) => {
    paginaActual.value = pagina
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Reset pagination when filters change
watch([search, filtroEstado, ordenarPor], () => {
    paginaActual.value = 1
})

// Datos del backend - estructura agrupada por DNI
const datosAgrupados = ref<Record<string, TecnicoData>>({})

// Función para cargar datos desde el backend
const cargarDatos = async () => {
    isLoading.value = true
    error.value = null
    
    try {
        const response = await apiFetch('/api/seguimiento-tecnico')
        
        // Asumiendo que el backend devuelve { grouped: {...} }
        if (response.grouped) {
            datosAgrupados.value = response.grouped
        } else {
            datosAgrupados.value = response
        }
    } catch (err: any) {
        console.error('Error al cargar datos de seguimiento:', err)
        error.value = err.message || 'Error al cargar los datos'
    } finally {
        isLoading.value = false
    }
}

// Recargar datos
const recargarDatos = () => {
    cargarDatos()
}

// Cargar datos al montar el componente
onMounted(() => {
    cargarDatos()
})

// Mock de datos para secciones (se completarán en siguientes pasos)
const tecnicos = ref([])
const alertas = ref([])
const comunicaciones = ref([])
const rutas = ref([])

// Componentes de sección (se crearán más adelante cuando se necesiten)
// import ResumenCard from '../components/seguimiento/ResumenCard.vue'
// import TecnicosEnRuta from '../components/seguimiento/TecnicosEnRuta.vue'
// import AlertasSection from '../components/seguimiento/AlertasSection.vue'
// import ComunicacionesSection from '../components/seguimiento/ComunicacionesSection.vue'
// import RutasSection from '../components/seguimiento/RutasSection.vue'
</script>

<style scoped>
.seguimiento-container {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
    min-height: 90vh;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>