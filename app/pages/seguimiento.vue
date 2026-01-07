
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
         <div>
        <header class="mb-6">
            <h1 class="text-2xl font-bold mb-1 flex items-center gap-2">
                <span>Seguimiento de Técnicos</span>
               
            </h1>
            <p class="text-gray-600 mb-4">Monitorea en tiempo real el estado, actividad diaria y cumplimiento de asistencia.</p>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div class="flex flex-wrap gap-3 items-center">
                    <div class="relative flex-1 min-w-[300px]">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input 
                            v-model="search" 
                            type="text" 
                            placeholder="Buscar por nombre, DNI, agencia o cliente..." 
                            class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                        />
                        <div v-if="search" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {{ datosAgrupadosFiltrados.length }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="relative">
                        <select v-model="filtroEstado" class="appearance-none border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-400">
                            <option value="todos">Todos los técnicos</option>
                            <option value="con-marcacion">Con marcación</option>
                            <option value="sin-marcacion">Sin marcación</option>
                        </select>
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    
                    <div class="relative">
                        <select v-model="ordenarPor" class="appearance-none border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-400">
                            <option value="original">Orden del sistema</option>
                            <option value="nombre">Ordenar: Nombre</option>
                            <option value="rutas">Más rutas</option>
                            <option value="marcaciones">Más marcaciones</option>
                        </select>
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </div>
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    
                    <button class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm" @click="generarReporte">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Exportar</span>
                    </button>
                    
                    <button 
                        @click="recargarDatos" 
                        :disabled="isLoading"
                        class="bg-white border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
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
            </div>
            
            <div v-if="showFilters" class="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 class="text-sm font-bold text-gray-800">Opciones Avanzadas</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Registros por página
                        </label>
                        <select v-model.number="itemsPorPagina" class="border border-gray-300 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium">
                            <option :value="5">5 por página</option>
                            <option :value="10">10 por página</option>
                            <option :value="25">25 por página</option>
                            <option :value="50">50 por página</option>
                            <option :value="100">100 por página</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                <div
                    v-for="card in resumenCards"
                    :key="card.titulo"
                    class="bg-white rounded-lg p-4 border transition-all duration-200"
                    :class="{
                        'border-blue-200 hover:border-blue-300': card.titulo === 'Técnicos Activos',
                        'border-green-200 hover:border-green-300': card.titulo === 'Con Marcación',
                        'border-red-200 hover:border-red-300 card-danger-alert': card.titulo === 'Sin Marcación',
                        'border-purple-200 hover:border-purple-300': card.titulo === 'Total Rutas'
                    }"
                >
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-medium text-gray-600">{{ card.titulo }}</span>
                        <div 
                            class="w-2 h-2 rounded-full"
                            :class="{
                                'bg-green-500': card.estado === 'normal' && card.titulo !== 'Sin Marcación',
                                'bg-yellow-500': card.estado === 'warning',
                                'bg-red-500 danger-dot-pulse': card.estado === 'critical' || (card.estado === 'warning' && card.titulo === 'Sin Marcación')
                            }"
                        ></div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="text-3xl font-bold text-gray-900">{{ card.valor }}</div>
                        <div v-if="card.titulo === 'Sin Marcación' && card.valor > 0" class="danger-icon-shake">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <section>
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
                <svg class="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600 font-medium">Cargando datos de seguimiento...</p>
            </div>

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

            <div v-else>
            <div class="mb-4 flex items-center justify-between text-sm text-gray-600 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <span class="font-medium">
                    Mostrando <span class="font-bold text-blue-600">{{ datosPaginados.length }}</span> de <span class="font-bold text-blue-600">{{ datosAgrupadosFiltrados.length }}</span> técnico(s)
                    <span v-if="search || filtroEstado !== 'todos'" class="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs ml-1">(filtrado)</span>
                </span>
                <button 
                    @click="showFilters = !showFilters" 
                    class="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 font-semibold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    {{ showFilters ? 'Ocultar' : 'Más' }} opciones
                </button>
            </div>

            <div class="space-y-3">
                <div v-if="datosPaginados.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-gray-600 font-medium">No se encontraron técnicos</p>
                    <p class="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                </div>

                <div
                    v-for="[dni, tecnicoData] in datosPaginados"
                    :key="dni"
                    class="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg"
                    :class="{
                        'border-4 border-red-500': esObjetoSinMarcacion(tecnicoData.iclock_transactions),
                        'border border-gray-200 hover:border-blue-300': !esObjetoSinMarcacion(tecnicoData.iclock_transactions)
                    }"
                >
                    <div 
                        class="p-4 cursor-pointer transition-colors"
                        :class="{
                            'bg-red-50 hover:bg-red-100': esObjetoSinMarcacion(tecnicoData.iclock_transactions),
                            'bg-gray-50 hover:bg-gray-100': !esObjetoSinMarcacion(tecnicoData.iclock_transactions)
                        }"
                        @click="toggleTecnico(dni)"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                    {{ tecnicoData.rutas[0]?.firstname.charAt(0) }}{{ tecnicoData.rutas[0]?.lastname.charAt(0) }}
                                </div>
                                
                                <div class="min-w-0">
                                    <h3 class="text-base font-semibold text-gray-900 truncate">
                                        {{ tecnicoData.rutas[0]?.firstname }} {{ tecnicoData.rutas[0]?.lastname }}
                                    </h3>
                                    <p class="text-xs text-gray-500">
                                        DNI: {{ dni }}
                                    </p>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2 shrink-0">
                                <span
                                    v-if="esObjetoSinMarcacion(tecnicoData.iclock_transactions)"
                                    class="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded"
                                    title="Sin marcación"
                                >
                                    Sin marcación
                                </span>
                                <span
                                    v-else-if="Array.isArray(tecnicoData.iclock_transactions) && tecnicoData.iclock_transactions.length > 0"
                                    class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded"
                                    :title="`${tecnicoData.iclock_transactions.length} marcación(es)`"
                                >
                                    {{ tecnicoData.iclock_transactions.length }}
                                </span>
                                
                                <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded" :title="`${tecnicoData.rutas.length} ruta(s)`">
                                    {{ tecnicoData.rutas.length }} rutas
                                </span>
                                
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    class="h-4 w-4 text-gray-400 transition-transform"
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

                    <div v-show="tecnicosExpandidos[dni]" class="p-5 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h4 class="text-base font-bold text-gray-800">Rutas Asignadas</h4>
                                </div>
                                <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    <div
                                        v-for="ruta in tecnicoData.rutas"
                                        :key="ruta.ticket_id"
                                        class="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                                    >
                                        <div class="flex items-start justify-between mb-2">
                                            <div class="flex items-center gap-2">
                                                <span class="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">{{ ruta.number }}</span>
                                                <span
                                                    class="text-xs font-medium px-2 py-1 rounded"
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
                                        <p class="text-sm font-medium text-gray-900 mb-2">
                                            {{ ruta.agencia }}
                                        </p>
                                        <div class="space-y-1 text-xs text-gray-600">
                                            <p>
                                                <span class="font-medium text-gray-700">Equipo:</span> {{ ruta.equipo }}
                                            </p>
                                            <p>
                                                <span class="font-medium text-gray-700">Servicio:</span> {{ ruta.topic }}
                                            </p>
                                            <p>
                                                <span class="font-medium text-gray-700">Cliente:</span> {{ ruta.cliente }}
                                            </p>
                                        </div>
                                        <p v-if="ruta.subject !== 'S/N'" class="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">{{ ruta.subject }}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 class="text-base font-bold text-gray-800">Marcaciones de Asistencia</h4>
                                </div>
                                <div
                                    v-if="esObjetoSinMarcacion(tecnicoData.iclock_transactions)"
                                    class="bg-red-50 border border-red-200 rounded-lg p-4 text-center animate-pulse-slow"
                                >
                                    <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2 animate-bounce-slow">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <p class="text-sm font-medium text-red-700">Sin registro de marcación</p>
                                    <p class="text-xs text-red-600 mt-1">El técnico no ha registrado asistencia hoy</p>
                                </div>

                                <div
                                    v-else-if="Array.isArray(tecnicoData.iclock_transactions)"
                                    class="space-y-2 max-h-96 overflow-y-auto pr-2"
                                >
                                    <div
                                        v-for="marcacion in tecnicoData.iclock_transactions"
                                        :key="marcacion.id"
                                        class="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                                    >
                                        <div class="flex items-start justify-between gap-3">
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p class="text-base font-semibold text-gray-900">
                                                            {{ new Date(marcacion.punch_time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) }}
                                                        </p>
                                                        <p class="text-xs text-gray-500">{{ marcacion.terminal_sn }}</p>
                                                    </div>
                                                </div>
                                                <div class="text-xs text-gray-600">
                                                    <p class="mb-1">{{ marcacion.gps_location }}</p>
                                                    <p class="text-gray-400">
                                                        {{ marcacion.latitude }}, {{ marcacion.longitude }}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div v-if="marcacion.imagen_url" class="flex-shrink-0">
                                                <img
                                                    :src="marcacion.imagen_url"
                                                    alt="Foto"
                                                    class="w-16 h-16 object-cover rounded border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                                    :title="'Ver imagen'"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="totalPaginas > 1" class="mt-6 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                <div class="text-xs font-medium text-gray-600">
                    Página {{ paginaActual }} de {{ totalPaginas }}
                </div>
                <div class="flex gap-1">
                    <button
                        @click="cambiarPagina(paginaActual - 1)"
                        :disabled="paginaActual === 1"
                        class="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Anterior
                    </button>
                    
                    <button
                        v-for="pagina in totalPaginas"
                        :key="pagina"
                        v-show="Math.abs(pagina - paginaActual) <= 2 || pagina === 1 || pagina === totalPaginas"
                        @click="cambiarPagina(pagina)"
                        class="min-w-[32px] px-2 py-1.5 text-xs font-medium border rounded transition-colors"
                        :class="{
                            'bg-gray-900 text-white border-gray-900': pagina === paginaActual,
                            'border-gray-200 hover:bg-gray-50': pagina !== paginaActual
                        }"
                    >
                        {{ pagina }}
                    </button>
                    
                    <button
                        @click="cambiarPagina(paginaActual + 1)"
                        :disabled="paginaActual === totalPaginas"
                        class="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
            </div>
        </section>
       
       
       
    </div>
    </template>

   
    </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { apiFetch } from '~/services/api'

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

const esObjetoSinMarcacion = (obj: any): obj is { message: string } => {
    return obj && typeof obj === 'object' && 'message' in obj && !Array.isArray(obj)
}

const search = ref('')
const showFilters = ref(false)
const filtroEstado = ref('todos') 
const ordenarPor = ref('original') 
const itemsPorPagina = ref(10)
const paginaActual = ref(1)
const tecnicosExpandidos = ref<Record<string, boolean>>({})

const isLoading = ref(false)
const error = ref<string | null>(null)

const generarReporte = () => {
    alert('Funcionalidad de generación de reporte (mock)')
}

const toggleTecnico = (dni: string) => {
    tecnicosExpandidos.value[dni] = !tecnicosExpandidos.value[dni]
}

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

const resumenCards = computed(() => [
    {
        titulo: 'Técnicos Activos',
        valor: tecnicosActivos.value,
        estado: 'normal',
    },
    {
        titulo: 'Con Marcación',
        valor: tecnicosConMarcacion.value,
        estado: 'normal',
    },
    {
        titulo: 'Sin Marcación',
        valor: tecnicosSinMarcacion.value,
        estado: tecnicosSinMarcacion.value > 0 ? 'warning' : 'normal',
    },
    {
        titulo: 'Total Rutas',
        valor: totalRutas.value,
        estado: 'normal',
    },
])

const datosAgrupadosFiltrados = computed(() => {
    let datos: [string, any][]
    
    if (ordenOriginal.value.length > 0) {
        datos = ordenOriginal.value.map(dni => [dni, datosAgrupados.value[dni]])
    } else {
        datos = Object.entries(datosAgrupados.value)
    }
    
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
    
    if (filtroEstado.value === 'con-marcacion') {
        datos = datos.filter(([_, tecnicoData]: [string, any]) => 
            Array.isArray(tecnicoData.iclock_transactions) && tecnicoData.iclock_transactions.length > 0
        )
    } else if (filtroEstado.value === 'sin-marcacion') {
        datos = datos.filter(([_, tecnicoData]: [string, any]) => 
            esObjetoSinMarcacion(tecnicoData.iclock_transactions)
        )
    }
    
    if (ordenarPor.value !== 'original') {
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
    } else {
        datos.sort(([dniA, dataA]: [string, any], [dniB, dataB]: [string, any]) => {
            const aSinMarcacion = esObjetoSinMarcacion(dataA.iclock_transactions)
            const bSinMarcacion = esObjetoSinMarcacion(dataB.iclock_transactions)
            
            if (aSinMarcacion && !bSinMarcacion) return -1
            if (!aSinMarcacion && bSinMarcacion) return 1
            
            return ordenOriginal.value.indexOf(dniA) - ordenOriginal.value.indexOf(dniB)
        })
    }
    
    return datos
})

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch([search, filtroEstado, ordenarPor], () => {
    paginaActual.value = 1
})

const datosAgrupados = ref<Record<string, TecnicoData>>({})
const ordenOriginal = ref<string[]>([])

const cargarDatos = async () => {
    isLoading.value = true
    error.value = null
    
    try {
        const response = await apiFetch('/api/seguimiento-tecnico')
        
        let datos = response.grouped || response
        
        if (typeof datos === 'object' && !Array.isArray(datos)) {
            ordenOriginal.value = Object.keys(datos)
            datosAgrupados.value = datos
        }
    } catch (err: any) {
        console.error('Error al cargar datos de seguimiento:', err)
        error.value = err.message || 'Error al cargar los datos'
    } finally {
        isLoading.value = false
    }
}

const recargarDatos = () => {
    cargarDatos()
}

onMounted(() => {
    cargarDatos()
})

</script>

<style scoped>


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

@keyframes pulse-slow {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.95;
    }
}

.animate-pulse-slow {
    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes bounce-slow {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-5px);
    }
}

.animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
}

@keyframes card-danger-alert {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3);
    }
    50% {
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
    }
}

.card-danger-alert {
    animation: card-danger-alert 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes danger-dot-pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.3);
        opacity: 0.8;
    }
}

.danger-dot-pulse {
    animation: danger-dot-pulse 2s ease-in-out infinite;
}

@keyframes danger-icon-shake {
    0%, 100% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(-8deg);
    }
    75% {
        transform: rotate(8deg);
    }
}

.danger-icon-shake {
    animation: danger-icon-shake 2.5s ease-in-out infinite;
}
</style>