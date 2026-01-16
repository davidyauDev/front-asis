<template>
    <UDashboardPanel id="seguimiento">
        <template #header>
            <UDashboardNavbar :ui="{ right: 'gap-3' }">
                <template #leading>
                    <div class="flex items-center gap-3">
                        <UDashboardSidebarCollapse />
                        <div class="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
                            <div class="hidden sm:flex items-center gap-2">
                                <div
                                    class="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <UIcon name="i-heroicons-map-pin"
                                        class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <h1 class="text-base font-semibold text-gray-900 dark:text-white">
                                        Seguimiento de Técnicos
                                    </h1>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <UIcon name="i-heroicons-signal" class="w-3 h-3" />
                                        Monitoreo en tiempo real
                                    </p>
                                </div>
                            </div>
                            <h1 class="sm:hidden text-base font-semibold text-gray-900 dark:text-white">
                                Seguimiento
                            </h1>
                        </div>
                    </div>
                </template>

                <template #right>
                    <div class="flex items-center gap-2">
                        <!-- Indicador de sincronización -->
                        <UTooltip text="Datos actualizados">
                            <div
                                class="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                <div class="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"></div>
                                <span class="text-xs font-medium text-gray-600 dark:text-gray-400">En vivo</span>
                            </div>
                        </UTooltip>

                        <!-- Notificaciones -->
                        <UTooltip text="Técnicos sin marcación">
                            <UButton color="gray" variant="ghost" square class="relative group">
                                <div class="relative">
                                    <UIcon name="i-heroicons-bell"
                                        class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />

                                    <!-- Contador badge -->
                                    <div
                                        class="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[9px] font-medium rounded-full flex items-center justify-center border border-white dark:border-gray-900">
                                        3
                                    </div>
                                </div>
                            </UButton>
                        </UTooltip>
                    </div>
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="p-2">
                <div
                    class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-5 mb-6 shadow-sm">
                    <div class="flex flex-wrap gap-2 items-center">
                        <div class="relative flex-1 min-w-[300px]">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 dark:text-gray-600"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input v-model="search" type="text"
                                placeholder="Buscar por nombre, DNI, agencia o cliente..."
                                class="w-full pl-10 pr-10 py-2.5 border border-gray-200/80 dark:border-gray-800/80 rounded-md bg-white dark:bg-gray-950 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 transition-all duration-200 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500" />
                            <div v-if="search" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <span
                                    class="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded">
                                    {{ datosAgrupadosFiltrados.length }}
                                </span>
                            </div>
                        </div>

                        <div class="relative">
                            <select v-model="filtroEstado"
                                class="appearance-none border border-gray-200/80 dark:border-gray-800/80 rounded-md pl-3 pr-8 py-2.5 bg-white dark:bg-gray-950 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700">
                                <option value="todos">Todos los técnicos</option>
                                <option value="con-marcacion">Con marcación</option>
                                <option value="sin-marcacion">Sin marcación</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-gray-400 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <div class="relative">
                            <select v-model="ordenarPor"
                                class="appearance-none border border-gray-200/80 dark:border-gray-800/80 rounded-md pl-3 pr-8 py-2.5 bg-white dark:bg-gray-950 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700">
                                <option value="original">Orden del sistema</option>
                                <option value="nombre">Ordenar: Nombre</option>
                                <option value="rutas">Más rutas</option>
                                <option value="marcaciones">Más marcaciones</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg class="h-4 w-4 text-gray-400 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <div class="relative">
                            <input v-model="fechaSeleccionada" type="date" @change="cargarDatos"
                                class="border border-gray-200/80 dark:border-gray-800/80 rounded-md px-3 py-2.5 bg-white dark:bg-gray-950 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700" />
                        </div>

                       

                        <button @click="recargarDatos" :disabled="isLoading"
                            class="border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
                            title="Recargar datos">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span class="hidden sm:inline">{{ isLoading ? 'Cargando...' : 'Actualizar' }}</span>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div v-for="card in resumenCards" :key="card.titulo"
                        class="bg-white dark:bg-gray-950 rounded-lg p-5 border border-gray-200/60 dark:border-gray-800/60 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm hover:shadow">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ card.titulo }}</span>
                            <div class="w-2 h-2 rounded-full" :class="{
                                'bg-emerald-500/80': card.estado === 'normal' && card.titulo !== 'Sin Marcación',
                                'bg-amber-500/80': card.estado === 'warning',
                                'bg-red-500/80': card.estado === 'critical' || (card.estado === 'warning' && card.titulo === 'Sin Marcación')
                            }"></div>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="text-3xl font-semibold text-gray-950 dark:text-gray-50">{{ card.valor }}</div>
                            <div v-if="card.titulo === 'Sin Marcación' && card.valor > 0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-red-500/70" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TABS -->
                <div class="mb-6">
                    <div class="flex gap-1 border-b border-gray-200/60 dark:border-gray-800/60">
                        <button @click="tabActivo = 'con-rutas'"
                            class="px-5 py-3 text-sm font-medium transition-all duration-200 relative" :class="{
                                'text-gray-950 dark:text-gray-50 border-b-2 border-gray-950 dark:border-gray-50': tabActivo === 'con-rutas',
                                'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300': tabActivo !== 'con-rutas'
                            }">
                            <span class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Con Rutas
                                <span class="ml-1 px-2 py-0.5 rounded-md text-xs font-medium" :class="{
                                    'bg-gray-950 dark:bg-gray-50 text-white dark:text-gray-950': tabActivo === 'con-rutas',
                                    'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400': tabActivo !== 'con-rutas'
                                }">
                                    {{ tecnicosConRutas }}
                                </span>
                            </span>
                        </button>
                        <button @click="tabActivo = 'sin-rutas'"
                            class="px-5 py-3 text-sm font-medium transition-all duration-200 relative" :class="{
                                'text-gray-950 dark:text-gray-50 border-b-2 border-gray-950 dark:border-gray-50': tabActivo === 'sin-rutas',
                                'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300': tabActivo !== 'sin-rutas'
                            }">
                            <span class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Sin Rutas
                                <span class="ml-1 px-2 py-0.5 rounded-md text-xs font-medium" :class="{
                                    'bg-gray-950 dark:bg-gray-50 text-white dark:text-gray-950': tabActivo === 'sin-rutas',
                                    'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400': tabActivo !== 'sin-rutas'
                                }">
                                    {{ tecnicosSinRutas }}
                                </span>
                            </span>
                        </button>
                    </div>
                </div>

                <section>
                    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
                        <svg class="animate-spin h-10 w-10 text-gray-950 dark:text-gray-50 mb-4"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <p class="text-gray-600 dark:text-gray-400 font-medium text-sm">Cargando datos...</p>
                    </div>

                    <div v-else-if="error"
                        class="bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/60 rounded-lg p-8 text-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            class="h-12 w-12 text-red-500/70 dark:text-red-400/70 mx-auto mb-4" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="text-base font-medium text-red-800 dark:text-red-200 mb-2">Error al cargar datos</h3>
                        <p class="text-red-600/80 dark:text-red-400/80 mb-5 text-sm">{{ error }}</p>
                        <button @click="recargarDatos"
                            class="bg-red-600 dark:bg-red-500 text-white px-5 py-2.5 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 text-sm font-medium shadow-sm">
                            Intentar nuevamente
                        </button>
                    </div>

                    <div v-else>
                        <!-- TÉCNICOS CON RUTAS -->
                        <div v-show="tabActivo === 'con-rutas'" class="animate-fadeIn">
                            <div
                                class="mb-5 text-sm bg-white dark:bg-gray-950 rounded-lg p-5 border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="font-medium text-gray-600 dark:text-gray-400">
                                        Mostrando <span class="font-semibold text-gray-950 dark:text-gray-50">{{
                                            datosAgrupadosFiltrados.length }}</span> técnico(s) con rutas
                                        <span v-if="search || filtroEstado !== 'todos'"
                                            class="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded text-xs ml-1">(filtrado)</span>
                                    </span>
                                    <button @click="showFilters = !showFilters"
                                        class="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 text-sm font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                        {{ showFilters ? 'Ocultar' : 'Más' }} opciones
                                    </button>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                                        <span class="text-xs text-gray-600 dark:text-gray-400">
                                            <span class="font-semibold text-emerald-700 dark:text-emerald-400">{{
                                                tecnicosConRutasConMarcacion }}</span> marcaron
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full bg-red-500/80"></div>
                                        <span class="text-xs text-gray-600 dark:text-gray-400">
                                            <span class="font-semibold text-red-700 dark:text-red-400">{{
                                                tecnicosConRutasSinMarcacion }}</span> no marcaron
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                                <div v-if="datosAgrupadosFiltrados.length === 0"
                                    class="text-center py-16 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg border border-gray-200/60 dark:border-gray-800/60">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        class="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p class="text-gray-700 dark:text-gray-300 font-medium text-sm mb-1">No se
                                        encontraron técnicos</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-500">Intenta ajustar los filtros de
                                        búsqueda</p>
                                </div>

                                <div v-for="[dni, tecnicoData] in datosAgrupadosFiltrados" :key="dni"
                                    class="bg-white dark:bg-gray-950 rounded-lg overflow-hidden transition-all duration-200 shadow-sm hover:shadow"
                                    :class="{
                                        'border-2 border-red-500/70 dark:border-red-500/70': esObjetoSinMarcacion(tecnicoData.iclock_transactions),
                                        'border border-gray-200/60 dark:border-gray-800/60': !esObjetoSinMarcacion(tecnicoData.iclock_transactions)
                                    }">
                                    <div class="p-5 cursor-pointer transition-all duration-200" :class="{
                                        'bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20': esObjetoSinMarcacion(tecnicoData.iclock_transactions),
                                        'hover:bg-gray-50/50 dark:hover:bg-gray-900/30': !esObjetoSinMarcacion(tecnicoData.iclock_transactions)
                                    }" @click="toggleTecnico(dni)">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-11 h-11 bg-gray-900 dark:bg-gray-100 rounded-md flex items-center justify-center text-white dark:text-gray-900 font-medium text-sm shrink-0 shadow-sm">
                                                    {{ tecnicoData.rutas[0]?.firstname?.charAt(0) || '' }}{{
                                                    tecnicoData.rutas[0]?.lastname?.charAt(0) || '' }}
                                                </div>

                                                <div class="min-w-0">
                                                    <h3
                                                        class="text-sm font-medium text-gray-950 dark:text-gray-50 truncate">
                                                        {{ tecnicoData.rutas[0]?.firstname || '' }} {{
                                                        tecnicoData.rutas[0]?.lastname || '' }}
                                                    </h3>
                                                    <p class="text-xs mt-0.5">
                                                        <span v-if="dni && dni !== 'null' && dni !== 'undefined'"
                                                            class="text-gray-500 dark:text-gray-400">DNI: {{ dni
                                                            }}</span>
                                                        <span v-else
                                                            class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md font-medium">Sin
                                                            técnico asignado</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-2 shrink-0">
                                                <span v-if="esObjetoSinMarcacion(tecnicoData.iclock_transactions)"
                                                    class="px-2.5 py-1 bg-red-600/90 dark:bg-red-500/90 text-white text-xs font-medium rounded-md shadow-sm"
                                                    title="Sin marcación">
                                                    Sin marcación
                                                </span>
                                                <span
                                                    v-else-if="Array.isArray(tecnicoData.iclock_transactions) && tecnicoData.iclock_transactions.length > 0"
                                                    class="px-2.5 py-1 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-md"
                                                    :title="`${tecnicoData.iclock_transactions.length} marcación(es)`">
                                                    {{ tecnicoData.iclock_transactions.length }}
                                                </span>

                                                <span
                                                    class="px-2.5 py-1 bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md"
                                                    :title="`${tecnicoData.rutas.length} ruta(s)`">
                                                    {{ tecnicoData.rutas.length }} rutas
                                                </span>

                                                <!-- Badge que muestra si existe daily_record (click para ver modal) -->
                                                <button v-if="getDailyRecord(tecnicoData)"
                                                    @click.stop="viewDailyRecord(tecnicoData)"
                                                    :class="`ml-2 px-2 py-1 text-xs font-medium rounded-md ${getConceptBadge(getDailyRecord(tecnicoData)).color}`">
                                                    {{ getConceptBadge(getDailyRecord(tecnicoData)).text }}
                                                </button>

                                                <button v-if="shouldShowValidar(tecnicoData)"
                                                    @click.stop="validarRuta(tecnicoData)"
                                                    class="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow text-xs font-medium flex items-center gap-1.5"
                                                    title="Validar asistencia manualmente">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5"
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Validar
                                                </button>

                                                <button v-if="esObjetoSinMarcacion(tecnicoData.iclock_transactions)"
                                                    @click.stop="enviarWhatsApp(tecnicoData)"
                                                    class="p-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow"
                                                    title="Enviar WhatsApp">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                        fill="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                </button>

                                                <!-- Mostrar daily_record si existe y no hay marcación -->
                                                <div v-if="getDailyRecord(tecnicoData) && (esObjetoSinMarcacion(tecnicoData.iclock_transactions) || (Array.isArray(tecnicoData.iclock_transactions) && tecnicoData.iclock_transactions.length === 0))"
                                                    class="flex items-center gap-2">
                                                   
                                                    <div v-if="showDailyRecord[getKeyForTecnico(tecnicoData)]"
                                                        class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs w-full border border-gray-200/60 dark:border-gray-800/60">
                                                        <pre
                                                            class="whitespace-pre-wrap">{{ formatDailyRecord(getDailyRecord(tecnicoData)) }}</pre>
                                                    </div>
                                                </div>

                                                <!-- daily_record panel is shown inside the Registro button block above -->

                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    class="h-4 w-4 text-gray-400 dark:text-gray-600 transition-transform duration-200"
                                                    :class="{ 'rotate-180': tecnicosExpandidos[dni] }" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-show="tecnicosExpandidos[dni]"
                                        class="p-6 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-200/60 dark:border-gray-800/60">
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <div
                                                    class="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-200/60 dark:border-gray-800/60">
                                                    <div
                                                        class="w-9 h-9 bg-gray-100 dark:bg-gray-800/80 rounded-md flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            class="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none"
                                                            viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <h4 class="text-sm font-medium text-gray-950 dark:text-gray-50">
                                                        Rutas Asignadas</h4>
                                                </div>
                                                <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                    <div v-for="ruta in tecnicoData.rutas" :key="ruta.ticket_id"
                                                        class="bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 shadow-sm hover:shadow">
                                                        <div class="flex items-start justify-between mb-2.5">
                                                            <div class="flex items-center gap-2">
                                                                <span
                                                                    class="text-xs font-medium bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300">{{
                                                                    ruta.number }}</span>
                                                                <span class="text-xs font-medium px-2.5 py-1 rounded-md"
                                                                    :class="{
                                                                        'bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': ruta.estado === 'Programado',
                                                                        'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400': ruta.estado === 'Completado',
                                                                        'bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400': ruta.estado === 'En Proceso'
                                                                    }">
                                                                    {{ ruta.estado }}
                                                                </span>
                                                            </div>
                                                            <span class="text-xs text-gray-500 dark:text-gray-400">{{
                                                                ruta.fecha_programada?.split(' ')[1] }}</span>
                                                        </div>
                                                        <p
                                                            class="text-sm font-medium text-gray-950 dark:text-gray-50 mb-2.5">
                                                            {{ ruta.agencia }}
                                                        </p>
                                                        <div
                                                            class="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                            <p>
                                                                <span
                                                                    class="font-medium text-gray-700 dark:text-gray-300">Equipo:</span>
                                                                {{ ruta.equipo }}
                                                            </p>
                                                            <p>
                                                                <span
                                                                    class="font-medium text-gray-700 dark:text-gray-300">Servicio:</span>
                                                                {{ ruta.topic }}
                                                            </p>
                                                            <p>
                                                                <span
                                                                    class="font-medium text-gray-700 dark:text-gray-300">Cliente:</span>
                                                                {{ ruta.cliente }}
                                                            </p>
                                                        </div>
                                                        <p v-if="ruta.subject !== 'S/N'"
                                                            class="text-xs text-gray-500 dark:text-gray-400 mt-2.5 pt-2.5 border-t border-gray-100 dark:border-gray-800/60">
                                                            {{ ruta.subject }}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div
                                                    class="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-200/60 dark:border-gray-800/60">
                                                    <div
                                                        class="w-9 h-9 bg-gray-100 dark:bg-gray-800/80 rounded-md flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            class="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none"
                                                            viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <h4 class="text-sm font-medium text-gray-950 dark:text-gray-50">
                                                        Marcaciones de Asistencia</h4>
                                                </div>
                                                <div v-if="esObjetoSinMarcacion(tecnicoData.iclock_transactions)"
                                                    class="bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/60 rounded-lg p-5 text-center shadow-sm">
                                                    <div
                                                        class="inline-flex items-center justify-center w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-full mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            class="h-5 w-5 text-red-600 dark:text-red-400" fill="none"
                                                            viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    </div>
                                                    <p class="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                                                        Sin registro de marcación</p>
                                                    <p class="text-xs text-red-600/80 dark:text-red-400/80">El técnico
                                                        no ha registrado asistencia hoy</p>
                                                </div>

                                                <div v-else-if="Array.isArray(tecnicoData.iclock_transactions)"
                                                    class="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                    <div v-for="marcacion in tecnicoData.iclock_transactions"
                                                        :key="marcacion.id"
                                                        class="bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800/60 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 shadow-sm hover:shadow">
                                                        <div class="flex items-start justify-between gap-3">
                                                            <div class="flex-1 min-w-0">
                                                                <div class="flex items-center justify-between mb-2.5">
                                                                    <div>
                                                                        <p
                                                                            class="text-sm font-medium text-gray-950 dark:text-gray-50">
                                                                            {{ new
                                                                                Date(marcacion.punch_time).toLocaleTimeString('es-PE',
                                                                            { hour: '2-digit', minute: '2-digit' }) }}
                                                                        </p>
                                                                        <p
                                                                            class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            {{ marcacion.terminal_sn }}</p>
                                                                    </div>
                                                                </div>
                                                                <div class="text-xs text-gray-600 dark:text-gray-400">
                                                                    <p class="mb-1.5">{{ marcacion.gps_location }}</p>
                                                                    <p class="text-gray-400 dark:text-gray-500">
                                                                        {{ marcacion.latitude }}, {{ marcacion.longitude
                                                                        }}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div v-if="marcacion.imagen_url" class="flex-shrink-0">
                                                                <img :src="marcacion.imagen_url" alt="Foto"
                                                                    class="w-16 h-16 object-cover rounded-md border border-gray-200/60 dark:border-gray-800/60 hover:scale-105 transition-transform duration-200 cursor-pointer shadow-sm"
                                                                    :title="'Ver imagen'" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TÉCNICOS SIN RUTAS -->
                        <div v-show="tabActivo === 'sin-rutas'" class="animate-fadeIn">
                            <div
                                class="mb-5 text-sm bg-white dark:bg-gray-950 rounded-lg p-5 border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="font-medium text-gray-600 dark:text-gray-400">
                                        Mostrando <span class="font-semibold text-gray-950 dark:text-gray-50">{{
                                            tecnicosSinRutasFiltrados.length }}</span> técnico(s) sin rutas
                                        <span v-if="search"
                                            class="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded text-xs ml-1">(filtrado)</span>
                                    </span>
                                </div>
                                <div class="flex items-center gap-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                                        <span class="text-xs text-gray-600 dark:text-gray-400">
                                            <span class="font-semibold text-emerald-700 dark:text-emerald-400">{{
                                                tecnicosSinRutasConMarcacion }}</span> marcaron
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 rounded-full bg-red-500/80"></div>
                                        <span class="text-xs text-gray-600 dark:text-gray-400">
                                            <span class="font-semibold text-red-700 dark:text-red-400">{{
                                                tecnicosSinRutasSinMarcacion }}</span> no marcaron
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                                <div v-if="tecnicosSinRutasFiltrados.length === 0"
                                    class="text-center py-16 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg border border-gray-200/60 dark:border-gray-800/60">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        class="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p class="text-gray-700 dark:text-gray-300 font-medium text-sm mb-1">Todos los
                                        técnicos tienen rutas asignadas</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-500">No hay técnicos sin rutas para
                                        la fecha seleccionada</p>
                                </div>

                                <div v-for="tecnico in tecnicosSinRutasFiltrados" :key="tecnico.dni"
                                    class="bg-white dark:bg-gray-950 rounded-lg overflow-hidden transition-all duration-200 border border-amber-200/70 dark:border-amber-900/70 shadow-sm hover:shadow">
                                    <div class="p-5 bg-amber-50/50 dark:bg-amber-950/10">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-11 h-11 bg-gray-900 dark:bg-gray-100 rounded-md flex items-center justify-center text-white dark:text-gray-900 font-medium text-sm shrink-0 shadow-sm">
                                                    {{ tecnico.nombre?.charAt(0) || 'T' }}{{ tecnico.apellido?.charAt(0)
                                                    || 'S' }}
                                                </div>

                                                <div class="min-w-0">
                                                    <h3
                                                        class="text-sm font-medium text-gray-950 dark:text-gray-50 truncate">
                                                        {{ tecnico.nombre_completo || 'Sin nombre' }}
                                                    </h3>
                                                    <p class="text-xs mt-0.5">
                                                        <span v-if="tecnico.dni && tecnico.dni !== 'null'"
                                                            class="text-gray-500 dark:text-gray-400">DNI: {{ tecnico.dni
                                                            }}</span>
                                                        <span v-else
                                                            class="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md font-medium">Sin
                                                            DNI</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div class="flex items-center gap-2 shrink-0">
                                                <span
                                                    class="px-2.5 py-1 bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-md"
                                                    title="Sin rutas asignadas">
                                                    Sin rutas
                                                </span>

                                                <span
                                                    v-if="Array.isArray(tecnico.marcaciones) && tecnico.marcaciones.length > 0"
                                                    class="px-2.5 py-1 bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-md"
                                                    title="Con marcación">
                                                    ✓ Marcó
                                                </span>
                                                <span v-else
                                                    class="px-2.5 py-1 bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-md"
                                                    title="Sin marcación">
                                                    Sin marcar
                                                </span>
                                                <button v-if="getDailyRecord(tecnico)"
                                                    @click.stop="viewDailyRecord(tecnico)"
                                                    class="ml-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-md">Registro</button>

                                                <button v-if="shouldShowValidar(tecnico)"
                                                    @click.stop="validarRutaSinRuta(tecnico)"
                                                    class="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow text-xs font-medium flex items-center gap-1.5"
                                                    title="Validar asistencia manualmente">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5"
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Validar
                                                </button>
                                            </div>
                                            <div v-if="showDailyRecord[getKeyForTecnico(tecnico)]"
                                                class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs w-full border border-gray-200/60 dark:border-gray-800/60">
                                                <pre
                                                    class="whitespace-pre-wrap">{{ formatDailyRecord(getDailyRecord(tecnico)) }}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <ValidationModal v-model:show="showValidationModal" :tecnico="validationTarget"
                :loading="validationLoading" @submit="onValidationSubmit" />

            <!-- Modal ligero para mostrar daily_record -->
            <div v-if="showDailyModal" class="fixed inset-0 z-50 flex items-center justify-center">
                <div class="absolute inset-0 bg-black/50" @click="showDailyModal = false" aria-hidden="true"></div>
                <div class="relative bg-white dark:bg-gray-950 rounded-lg shadow-lg w-full max-w-2xl mx-4 p-5"
                    role="dialog" aria-modal="true">
                    <header class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-50">Detalle de Registro</h3>
                        <button @click="showDailyModal = false"
                            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
                    </header>
                    <pre
                        class="text-xs overflow-auto max-h-[60vh] p-2 bg-gray-50 dark:bg-gray-900 rounded">{{ formatDailyRecord(dailyModalContent) }}</pre>
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '~/services/api'
import ValidationModal from '~/components/seguimiento/ValidationModal.vue'

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
    id?: number
    emp_code: string
    punch_time: string
    punch_state?: string
    verify_type?: number
    work_code?: string | null
    terminal_sn: string
    terminal_alias?: string | null
    area_alias?: string | null
    longitude?: string
    latitude?: string
    gps_location?: string
    mobile?: string
    source?: number
    purpose?: number
    crc?: string | null
    is_attendance?: number
    reserved?: string | null
    upload_time?: string
    sync_status?: number
    sync_time?: string | null
    emp_id?: number
    terminal_id?: number | null
    is_mask?: number
    temperature?: string
    identificador?: string | null
    imagen_url?: string | null
}

interface Usuario {
    id: number
    dni: string
    nombre: string
    apellido: string
    nombre_completo: string
    department_id: number
    departamento: string
    position_id: number
    posicion: string
    email: string
    mobile: string
    status: number
    marcaciones: Marcacion[] | { message: string }
    rutas: Ruta[]
}

interface ApiResponse {
    success: boolean
    fecha: string
    dni: string | null
    total_usuarios: number
    total_con_ruta: number
    total_sin_ruta: number
    usuarios_con_ruta: Usuario[]
    usuarios_sin_ruta: Usuario[]
}

interface TecnicoData {
    usuario: Usuario
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
const tecnicosExpandidos = ref<Record<string, boolean>>({})
const fechaSeleccionada = ref(new Date().toISOString().split('T')[0])
const tabActivo = ref<'con-rutas' | 'sin-rutas'>('con-rutas')

const isLoading = ref(false)
const error = ref<string | null>(null)

// Datos de usuarios con y sin rutas
const usuariosConRutaData = ref<Usuario[]>([])
const usuariosSinRutaData = ref<Usuario[]>([])



const generarReporte = () => {
    alert('Funcionalidad de generación de reporte (mock)')
}

const toggleTecnico = (dni: string) => {
    tecnicosExpandidos.value[dni] = !tecnicosExpandidos.value[dni]
}

const enviarWhatsApp = (tecnicoData: any) => {
    const nombre = tecnicoData.usuario?.nombre_completo || 'Técnico'
    alert(`[DESARROLLO] Funcionalidad WhatsApp para: ${nombre}\n\nAquí se implementará el envío de mensaje de WhatsApp al técnico que no ha marcado asistencia.`)
}
// Modal de validación
const showValidationModal = ref(false)
const validationTarget = ref<any | null>(null)
const validationLoading = ref(false)

const validarRuta = (tecnicoData: any) => {
    validationTarget.value = tecnicoData
    showValidationModal.value = true
}

const validarRutaSinRuta = (tecnico: any) => {
    validationTarget.value = tecnico
    showValidationModal.value = true
}

// Detecta si ya existe un daily_record en distintas estructuras posibles
const hasDailyRecordForTecnico = (t: any) => {
    if (!t) return false
    if (t.daily_record) return true
    if (t.usuario && t.usuario.daily_record) return true
    if (Array.isArray(t.rutas)) {
        if (t.rutas.some((r: any) => r.daily_record)) return true
    }
    if (Array.isArray(t.marcaciones)) {
        if (t.marcaciones.some((m: any) => (m as any).daily_record)) return true
    }
    // also check iclock_transactions items
    if (Array.isArray(t.iclock_transactions)) {
        if (t.iclock_transactions.some((m: any) => m.daily_record)) return true
    }
    return false
}

// Lógica combinada para mostrar el botón Validar: no hay marcación y no existe daily_record
const shouldShowValidar = (t: any) => {
    let noMarcacion = false
    if (t == null) return false
    if ('iclock_transactions' in t) {
        noMarcacion = esObjetoSinMarcacion(t.iclock_transactions) || (Array.isArray(t.iclock_transactions) && t.iclock_transactions.length === 0)
    } else if ('marcaciones' in t) {
        noMarcacion = !Array.isArray(t.marcaciones) || t.marcaciones.length === 0
    }
    return noMarcacion && !hasDailyRecordForTecnico(t)
}

// Estado para mostrar paneles de daily_record
const showDailyRecord = ref<Record<string, boolean>>({})
const showDailyModal = ref(false)
const dailyModalContent = ref<any | null>(null)

const getKeyForTecnico = (t: any) => {
    return String(t?.usuario?.dni || t?.dni || t?.emp_code || t?.usuario?.id || t?.id || '')
}

const toggleDailyRecord = (t: any) => {
    const k = getKeyForTecnico(t)
    showDailyRecord.value[k] = !showDailyRecord.value[k]
}

const viewDailyRecord = (t: any) => {
    dailyModalContent.value = getDailyRecord(t)
    showDailyModal.value = true
}

const getDailyRecord = (t: any) => {
    if (!t) return null
    if (t.daily_record) return t.daily_record
    if (t.usuario && t.usuario.daily_record) return t.usuario.daily_record
    if (Array.isArray(t.rutas)) {
        for (const r of t.rutas) if (r.daily_record) return r.daily_record
    }
    if (Array.isArray(t.marcaciones)) {
        for (const m of t.marcaciones) if (m.daily_record) return m.daily_record
    }
    if (Array.isArray(t.iclock_transactions)) {
        for (const m of t.iclock_transactions) if (m.daily_record) return m.daily_record
    }
    return null
}

const formatDailyRecord = (dr: any) => {
    try {
        return dr ? JSON.stringify(dr, null, 2) : ''
    } catch (e) {
        return String(dr)
    }
}

const getConceptBadge = (dailyRecord: any) => {
    if (!dailyRecord || !dailyRecord.concept_id) {
        return { text: 'Registro', color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' }
    }
    
    const conceptId = dailyRecord.concept_id
    
    switch(conceptId) {
        case 1: // Asistencia
            return { text: 'Asistencia', color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' }
        case 2: // Vacaciones (V)
            return { text: 'Vacaciones', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }
        case 3: // Descanso Médico (DM)
            return { text: 'Descanso Médico', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' }
        case 4: // Sin Ruta (SR)
            return { text: 'Sin Ruta', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' }
        case 5: // No Marcó (NM)
            return { text: 'No Marcó', color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
        case 6: // Cese (X)
            return { text: 'Cese', color: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300' }
        default:
            return { text: 'Registro', color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' }
    }
}

const conceptoMap: Record<string, number> = {
    asistencia: 1,        // 1
    vacaciones: 2,        // V (2)
    descanso_medico: 3,   // DM (3)
    sin_ruta: 4,          // SR (4)
    no_marco: 5,          // NM (5)
    cese: 6               // X (6)
}

const onValidationSubmit = async (payload: { motivo: string; comentario?: string }) => {
    validationLoading.value = true
    try {
        const usuario = validationTarget.value?.usuario || validationTarget.value || {}
        const employee_id = usuario.id || null
        const emp_code = (usuario.dni || usuario.emp_code || usuario.codigo || '')
        let concept_id: number | null = null
        if (typeof payload.motivo === 'number') {
            concept_id = payload.motivo
        } else if (typeof payload.motivo === 'string') {
            concept_id = conceptoMap[payload.motivo] || null
        }
        const start_date = fechaSeleccionada.value
        const end_date = fechaSeleccionada.value

        const body = {
            employee_id,
            emp_code,
            concept_id,
            start_date,
            end_date,
            comment: payload.comentario || null
        }

        // Llamada al endpoint solicitado por el backend
        await apiFetch('/api/employee-concepts', { method: 'POST', body: JSON.stringify(body) })

        // Si no lanza error, considerar exitoso: marcar localmente el registro diario
        const fakeDaily = {
            id: Date.now(),
            date: start_date,
            employee_id,
            emp_code,
            concept_id,
            day_code: '1',
            mobility_eligible: false,
            source: 'employee_concepts',
            notes: payload.comentario || 'Registro manual',
            processed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        // Actualizar objeto objetivo en memoria para que la UI oculte el botón inmediatamente
        if (validationTarget.value) {
            // si es la estructura que contiene usuario
            if (validationTarget.value.usuario) {
                validationTarget.value.usuario.daily_record = fakeDaily
            } else {
                validationTarget.value.daily_record = fakeDaily
            }
        }

        // también actualizar en los arrays de usuarios si es posible
        const dniKey = emp_code || usuario.dni || null
        if (dniKey) {
            usuariosConRutaData.value = usuariosConRutaData.value.map(u => {
                if ((u.dni || '') === String(dniKey) || u.id === employee_id) {
                    // @ts-ignore
                    u.daily_record = fakeDaily
                }
                return u
            })
            usuariosSinRutaData.value = usuariosSinRutaData.value.map(u => {
                if ((u.dni || '') === String(dniKey) || u.id === employee_id) {
                    // @ts-ignore
                    u.daily_record = fakeDaily
                }
                return u
            })
        }

        // Simular delay para mejor UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        showValidationModal.value = false
        validationTarget.value = null
        validationLoading.value = false
    } catch (err: any) {
        validationLoading.value = false
        console.error('Error al registrar concepto del empleado:', err)
    }
}

const tecnicosActivos = computed(() => {
    return usuariosConRutaData.value.length + usuariosSinRutaData.value.length
})

const tecnicosConMarcacion = computed(() => {
    const conRutaConMarcacion = usuariosConRutaData.value.filter(u =>
        Array.isArray(u.marcaciones) && u.marcaciones.length > 0
    ).length
    const sinRutaConMarcacion = usuariosSinRutaData.value.filter(u =>
        Array.isArray(u.marcaciones) && u.marcaciones.length > 0
    ).length
    return conRutaConMarcacion + sinRutaConMarcacion
})

const tecnicosSinMarcacion = computed(() => {
    const conRutaSinMarcacion = usuariosConRutaData.value.filter(u =>
        esObjetoSinMarcacion(u.marcaciones)
    ).length
    const sinRutaSinMarcacion = usuariosSinRutaData.value.filter(u =>
        esObjetoSinMarcacion(u.marcaciones)
    ).length
    return conRutaSinMarcacion + sinRutaSinMarcacion
})

const totalRutas = computed(() => {
    return usuariosConRutaData.value.reduce((total, usuario) =>
        total + usuario.rutas.length, 0
    )
})

// Computeds para técnicos con y sin rutas
const tecnicosConRutas = computed(() => {
    return usuariosConRutaData.value.length
})

const tecnicosSinRutas = computed(() => {
    return usuariosSinRutaData.value.length
})

// Computeds para estadísticas de marcación por tab
const tecnicosConRutasConMarcacion = computed(() => {
    return usuariosConRutaData.value.filter(u =>
        Array.isArray(u.marcaciones) && u.marcaciones.length > 0
    ).length
})

const tecnicosConRutasSinMarcacion = computed(() => {
    return usuariosConRutaData.value.filter(u =>
        esObjetoSinMarcacion(u.marcaciones)
    ).length
})

const tecnicosSinRutasConMarcacion = computed(() => {
    return usuariosSinRutaData.value.filter(u =>
        Array.isArray(u.marcaciones) && u.marcaciones.length > 0
    ).length
})

const tecnicosSinRutasSinMarcacion = computed(() => {
    return usuariosSinRutaData.value.filter(u =>
        esObjetoSinMarcacion(u.marcaciones)
    ).length
})

const tecnicosSinRutasFiltrados = computed(() => {
    let tecnicos = usuariosSinRutaData.value

    if (search.value.trim()) {
        const searchLower = search.value.toLowerCase()
        tecnicos = tecnicos.filter((tecnico) => {
            const nombre = tecnico.nombre_completo.toLowerCase()
            const dni = (tecnico.dni || '').toString().toLowerCase()

            return dni.includes(searchLower) || nombre.includes(searchLower)
        })
    }

    if (filtroEstado.value === 'con-marcacion') {
        tecnicos = tecnicos.filter((tecnico) =>
            Array.isArray(tecnico.marcaciones) && tecnico.marcaciones.length > 0
        )
    } else if (filtroEstado.value === 'sin-marcacion') {
        tecnicos = tecnicos.filter((tecnico) =>
            esObjetoSinMarcacion(tecnico.marcaciones)
        )
    }

    return tecnicos
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

    // Convertir usuariosConRutaData a formato de datosAgrupados
    const agrupados: Record<string, TecnicoData> = {}
    usuariosConRutaData.value.forEach(usuario => {
        agrupados[usuario.dni] = {
            usuario,
            rutas: usuario.rutas,
            iclock_transactions: usuario.marcaciones
        }
    })

    datos = Object.entries(agrupados)

    if (search.value.trim()) {
        const searchLower = search.value.toLowerCase()
        datos = datos.filter(([dni, tecnicoData]: [string, any]) => {
            const nombre = tecnicoData.usuario.nombre_completo.toLowerCase()
            const agencias = tecnicoData.rutas.map((r: any) => r.agencia?.toLowerCase() || '').join(' ')
            const cliente = tecnicoData.rutas.map((r: any) => r.cliente?.toLowerCase() || '').join(' ')

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
                const nombreA = dataA.usuario.nombre_completo
                const nombreB = dataB.usuario.nombre_completo
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

            return 0
        })
    }

    return datos
})

const cargarDatos = async () => {
    isLoading.value = true
    error.value = null

    try {
        const params = new URLSearchParams()
        if (fechaSeleccionada.value) {
            params.append('fecha', fechaSeleccionada.value)
        }

        const url = `/api/seguimiento-tecnico${params.toString() ? '?' + params.toString() : ''}`
        const response: ApiResponse = await apiFetch(url)

        if (response.success) {
            usuariosConRutaData.value = response.usuarios_con_ruta || []
            usuariosSinRutaData.value = response.usuarios_sin_ruta || []
        } else {
            usuariosConRutaData.value = []
            usuariosSinRutaData.value = []
        }

    } catch (err: any) {
        console.error('Error al cargar datos de seguimiento:', err)
        error.value = err.message || 'Error al cargar los datos'
        usuariosConRutaData.value = []
        usuariosSinRutaData.value = []
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

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
}
</style>