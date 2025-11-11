<template>
  <div class="overflow-hidden">
    <!-- 📊 Header mejorado -->
    <div class="px-4 sm:px-6 py-3 border-b border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-900">
      <div class="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        <!-- Left: title -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-table" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="leading-tight">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">Registros de Asistencia</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ totalRecords.toLocaleString() }} registros</div>
          </div>
        </div>

        <!-- Right: controls (estilo UsersTable) -->
        <div class="flex items-center gap-2">
          <!-- Search (visual, sin logica adicional) -->
          <UInput
            placeholder="Buscar por nombre, ID o ubicación..."
            size="sm"
            clearable
            class="w-56"
            @clear="$emit('refresh')"
            @input.stop
          />

          <!-- Abrir filtros -->
          <UButton
            icon="i-lucide-sliders"
            size="sm"
            variant="outline"
            @click="$emit('openFilters')"
            title="Abrir filtros"
          />

          <!-- Refrescar -->
          <UButton
            icon="i-lucide-refresh-cw"
            size="sm"
            variant="ghost"
            @click="$emit('refresh')"
            title="Actualizar"
          />

          <!-- Agregar -->
          <UButton
            icon="i-lucide-plus"
            size="sm"
            variant="ghost"
            @click="$emit('add')"
          />
        </div>
      </div>
    </div>

    <!-- 🔄 Loading state -->
    <div v-if="loading" class="flex items-center justify-center p-12">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Cargando registros...</p>
      </div>
    </div>

    <!-- 📋 Vista Desktop - Tabla completa -->
    <div v-else-if="asistencias.length > 0" class="hidden lg:block">
      <div class="overflow-x-auto">
        <table class="w-full">
          <!-- Headers con ordenamiento -->
          <thead class="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button 
                  @click="$emit('sort', 'id')"
                  class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span>ID</span>
                  <UIcon name="i-lucide-arrows-up-down" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Empleado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button 
                  @click="$emit('sort', 'type')"
                  class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span>Tipo</span>
                  <UIcon name="i-lucide-arrows-up-down" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button 
                  @click="$emit('sort', 'timestamp')"
                  class="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span>Fecha y Hora</span>
                  <UIcon name="i-lucide-arrows-up-down" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ubicación
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dispositivo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado del Dispositivo
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="asistencia in asistencias"
              :key="asistencia.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer group"
              @click="$emit('view', asistencia)"
            >
              <!-- ID -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-mono text-gray-900 dark:text-gray-100 font-medium">
                  #{{ asistencia.id }}
                </span>
              </td>

              <!-- Usuario -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :alt="asistencia.usuario?.name"
                    size="sm"
                    class="ring-1 ring-gray-200 dark:ring-gray-700 grayscale bg-gray-200 dark:bg-gray-600"
                  >
                    {{ (asistencia.usuario?.name || '?').charAt(0).toUpperCase() }}
                  </UAvatar>
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {{ asistencia.usuario?.name || 'Usuario desconocido' }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ asistencia.usuario?.emp_code || `ID: ${asistencia.usuario_id}` }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Tipo de Registro -->
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :color="asistencia.tipo_registro === 'check_in' ? 'success' : 'error'"
                  variant="subtle"
                  class="inline-flex items-center gap-2"
                >
                  <UIcon 
                    :name="getTipoRegistroIcon(asistencia.tipo_registro)" 
                    class="w-3 h-3"
                  />
                  {{ asistencia.tipo_registro === 'check_in' ? 'Entrada' : 'Salida' }}
                </UBadge>
              </td>

              <!-- Fecha y Hora -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {{ formatFecha(asistencia.created_at) }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatTimestamp(asistencia.timestamp) }}
                </div>
              </td>

              <!-- Ubicación -->
              <td class="px-6 py-4">
                <div class="flex flex-col space-y-1">
                  <UButton
                    :to="getGoogleMapsUrl(asistencia.latitud, asistencia.longitud)"
                    target="_blank"
                    size="xs"
                    variant="outline"
                    icon="i-lucide-map-pin"
                    class="self-start"
                    @click.stop
                  >
                    Ver ubicación
                  </UButton>
                  <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ asistencia.latitud.toFixed(4) }}, {{ asistencia.longitud.toFixed(4) }}
                  </div>
                </div>
              </td>

              <!-- Dispositivo -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <UIcon 
                    :name="getDeviceIcon(asistencia.dispositivo)" 
                    class="w-4 h-4 text-gray-400"
                  />
                  <div>
                    <div class="text-sm text-gray-900 dark:text-gray-100 truncate max-w-24">
                      {{ asistencia.dispositivo || 'Desconocido' }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ getMetodoConexionConfig(asistencia.metodo)?.label }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Estado del Dispositivo -->
              <td class="px-6 py-4">
                <div class="space-y-2">
                  <!-- Batería -->
                  <div class="flex items-center gap-2">
                    <UIcon 
                      :name="getBateriaIcon(asistencia.bateria)" 
                      :class="getBateriaColor(asistencia.bateria)"
                      class="w-4 h-4"
                    />
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                      {{ asistencia.bateria || 'N/A' }}%
                    </span>
                  </div>
                  
                  <!-- Señal -->
                  <div v-if="asistencia.signal_strength" class="flex items-center gap-2">
                    <UIcon 
                      :name="getSignalIcon(asistencia.signal_strength)" 
                      :class="getSignalColor(asistencia.signal_strength)"
                      class="w-4 h-4"
                    />
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                      {{ asistencia.signal_strength }}/5
                    </span>
                  </div>

                  <!-- Conexión Internet -->
                  <div v-if="asistencia.is_internet_available !== undefined" class="flex items-center gap-2">
                    <UIcon 
                      :name="asistencia.is_internet_available ? 'i-lucide-wifi' : 'i-lucide-wifi-off'" 
                      :class="asistencia.is_internet_available ? 'text-green-500' : 'text-red-500'"
                      class="w-3 h-3"
                    />
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                      {{ asistencia.is_internet_available ? 'Online' : 'Offline' }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Acciones -->
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1 transition-all duration-200 hover:gap-2">
                  <UTooltip text="Ver detalles">
                    <UButton
                      icon="i-lucide-eye"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      class="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      @click.stop="$emit('view', asistencia)"
                    />
                  </UTooltip>
                  
                  <UTooltip text="Editar">
                    <UButton
                      icon="i-lucide-edit"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      class="hover:bg-green-50 hover:text-green-600 transition-colors"
                      @click.stop="$emit('edit', asistencia)"
                    />
                  </UTooltip>
                  
                  <UDropdown
                    :items="getActionItems(asistencia)"
                    :popper="{ placement: 'bottom-end' }"
                  >
                    <UButton
                      icon="i-lucide-more-horizontal"
                      size="xs"
                      variant="ghost"
                      @click.stop
                    />
                  </UDropdown>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 📱 Vista Tablet - Grid de Cards -->
    <div v-else-if="asistencias.length > 0" class="hidden md:block lg:hidden">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
        <UCard
          v-for="asistencia in asistencias"
          :key="asistencia.id"
          class="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4"
          :class="asistencia.tipo_registro === 'check_in' ? 'border-l-green-500' : 'border-l-red-500'"
          @click="$emit('view', asistencia)"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UAvatar
                  :alt="asistencia.usuario?.name"
                  size="sm"
                  class="ring-1 ring-gray-200 dark:ring-gray-700 grayscale bg-gray-200 dark:bg-gray-600"
                >
                  {{ (asistencia.usuario?.name || '?').charAt(0).toUpperCase() }}
                </UAvatar>
                <div>
                  <div class="font-medium text-sm truncate">
                    {{ asistencia.usuario?.name || 'Usuario desconocido' }}
                  </div>
                  <div class="text-xs text-gray-500">
                    #{{ asistencia.id }} • {{ asistencia.usuario?.emp_code }}
                  </div>
                </div>
              </div>
              
              <UBadge
                :color="asistencia.tipo_registro === 'check_in' ? 'success' : 'error'"
                variant="subtle"
              >
                {{ asistencia.tipo_registro === 'check_in' ? 'Entrada' : 'Salida' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-3">
            <!-- Fecha y hora -->
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-clock" class="w-4 h-4 text-gray-400" />
              <div>
                <div class="text-sm font-medium">{{ formatFecha(asistencia.created_at) }}</div>
                <div class="text-xs text-gray-500">{{ formatTimestamp(asistencia.timestamp) }}</div>
              </div>
            </div>

            <!-- Ubicación -->
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-400" />
              <UButton
                :to="getGoogleMapsUrl(asistencia.latitud, asistencia.longitud)"
                target="_blank"
                size="xs"
                variant="outline"
                @click.stop
              >
                Ver ubicación
              </UButton>
            </div>

            <!-- Estado del dispositivo -->
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1">
                <UIcon 
                  :name="getBateriaIcon(asistencia.bateria)" 
                  :class="getBateriaColor(asistencia.bateria)"
                  class="w-4 h-4"
                />
                <span class="text-xs">{{ asistencia.bateria || 'N/A' }}%</span>
              </div>
              
              <div class="flex items-center gap-1">
                <UIcon 
                  :name="getMetodoConexionConfig(asistencia.metodo)?.icon || 'i-lucide-wifi'" 
                  :class="getMetodoConexionConfig(asistencia.metodo)?.color || 'text-gray-500'"
                  class="w-4 h-4"
                />
                <span class="text-xs">{{ getMetodoConexionConfig(asistencia.metodo)?.label }}</span>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-end gap-2">
              <UButton
                icon="i-lucide-eye"
                size="xs"
                variant="outline"
                @click.stop="$emit('view', asistencia)"
              >
                Ver
              </UButton>
              <UButton
                icon="i-lucide-edit"
                size="xs"
                variant="outline"
                @click.stop="$emit('edit', asistencia)"
              >
                Editar
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>

    <!-- 📱 Vista Mobile - Cards apiladas -->
    <div v-else-if="asistencias.length > 0" class="block md:hidden">
      <div class="space-y-4 p-4">
        <div
          v-for="asistencia in asistencias"
          :key="asistencia.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all"
          :class="asistencia.tipo_registro === 'check_in' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'"
          @click="$emit('view', asistencia)"
        >
          <!-- Header del card móvil -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <UAvatar
                :alt="asistencia.usuario?.name"
                size="sm"
                class="ring-1 ring-gray-200 dark:ring-gray-700 grayscale bg-gray-200 dark:bg-gray-600"
              >
                {{ (asistencia.usuario?.name || '?').charAt(0).toUpperCase() }}
              </UAvatar>
              <div>
                <div class="font-medium text-sm">
                  {{ asistencia.usuario?.name || 'Usuario desconocido' }}
                </div>
                <div class="text-xs text-gray-500">
                  #{{ asistencia.id }} • {{ asistencia.usuario?.emp_code }}
                </div>
              </div>
            </div>
            
            <UBadge
              :color="asistencia.tipo_registro === 'check_in' ? 'success' : 'error'"
              variant="subtle"
              size="xs"
            >
              <UIcon 
                :name="getTipoRegistroIcon(asistencia.tipo_registro)" 
                class="w-3 h-3 mr-1"
              />
              {{ asistencia.tipo_registro === 'check_in' ? 'Entrada' : 'Salida' }}
            </UBadge>
          </div>

          <!-- Contenido principal -->
          <div class="space-y-3">
            <!-- Fecha y hora -->
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-clock" class="w-4 h-4 text-gray-400 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ formatFecha(asistencia.created_at) }}</div>
                <div class="text-xs text-gray-500 truncate">{{ formatTimestamp(asistencia.timestamp) }}</div>
              </div>
            </div>

            <!-- Ubicación -->
            <div class="flex items-center justify-between">
              <UButton
                :to="getGoogleMapsUrl(asistencia.latitud, asistencia.longitud)"
                target="_blank"
                size="xs"
                variant="outline"
                icon="i-lucide-map-pin"
                @click.stop
              >
                Ver mapa
              </UButton>
            </div>

            <!-- Estados del dispositivo -->
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-3">
                <!-- Batería -->
                <div class="flex items-center gap-1">
                  <UIcon 
                    :name="getBateriaIcon(asistencia.bateria)" 
                    :class="getBateriaColor(asistencia.bateria)"
                    class="w-3 h-3"
                  />
                  <span>{{ asistencia.bateria || 'N/A' }}%</span>
                </div>
                
                <!-- Conexión -->
                <div class="flex items-center gap-1">
                  <UIcon 
                    :name="getMetodoConexionConfig(asistencia.metodo)?.icon || 'i-lucide-wifi'" 
                    :class="getMetodoConexionConfig(asistencia.metodo)?.color || 'text-gray-500'"
                    class="w-3 h-3"
                  />
                  <span>{{ getMetodoConexionConfig(asistencia.metodo)?.label }}</span>
                </div>
              </div>

              <!-- Internet status -->
              <div v-if="asistencia.is_internet_available !== undefined" class="flex items-center gap-1">
                <UIcon 
                  :name="asistencia.is_internet_available ? 'i-lucide-wifi' : 'i-lucide-wifi-off'" 
                  :class="asistencia.is_internet_available ? 'text-green-500' : 'text-red-500'"
                  class="w-3 h-3"
                />
                <span>{{ asistencia.is_internet_available ? 'Online' : 'Offline' }}</span>
              </div>
            </div>

            <!-- Notas si existen -->
            <div v-if="asistencia.notes" class="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-2">
              <UIcon name="i-lucide-message-circle" class="w-3 h-3 mr-1 inline" />
              {{ asistencia.notes }}
            </div>
          </div>

          <!-- Footer con acciones -->
          <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <UButton
              icon="i-lucide-eye"
              size="xs"
              variant="outline"
              @click.stop="$emit('view', asistencia)"
            />
            <UButton
              icon="i-lucide-edit"
              size="xs"
              variant="outline"
              @click.stop="$emit('edit', asistencia)"
            />
            <UButton
              icon="i-lucide-trash"
              size="xs"
              variant="outline"
              color="error"
              @click.stop="$emit('delete', asistencia)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 😕 Estado vacío -->
    <div v-else-if="!loading" class="p-6">
      <div class="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 text-center">
        <div class="mx-auto mb-4 w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <UIcon name="i-lucide-inbox" class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay registros</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          No se encontraron registros que coincidan con los filtros actuales.
        </p>

        <!-- Resumen / ayuda sobre filtros -->
        <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Usa los filtros para acotar por fecha, empleado, tipo de registro o estado de sincronización.
        </div>

        <!-- Acciones principales -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <UButton
            icon="i-lucide-sliders"
            variant="outline"
            @click="$emit('openFilters')"
          >
            Abrir filtros
          </UButton>
          <UButton
            icon="i-lucide-x-circle"
            variant="outline"
            color="neutral"
            @click="$emit('clearFilters')"
          >
            Limpiar filtros
          </UButton>
        </div>

        <!-- Acciones secundarias -->
        <div class="flex items-center justify-center gap-3">
          <UButton icon="i-lucide-plus" @click="$emit('add')">Registrar asistencia</UButton>
          <UButton icon="i-lucide-refresh-cw" variant="outline" @click="$emit('refresh')">Actualizar</UButton>
        </div>

        <!-- Sugerencias rápidas -->
        <div class="mt-5 flex flex-wrap justify-center gap-2">
          <span class="text-xs px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">Ej: Hoy</span>
          <span class="text-xs px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">Ej: Empleado</span>
          <span class="text-xs px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">Ej: Pendientes</span>
        </div>
      </div>
    </div>

    <!-- 🔢 Paginación mejorada y responsive -->
    <div v-if="totalRecords > 0" class="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-4 sm:px-6 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Info de registros -->
        <div class="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
          Mostrando <span class="font-medium">{{ fromRecord }}</span> - <span class="font-medium">{{ toRecord }}</span> 
          de <span class="font-medium">{{ totalRecords.toLocaleString() }}</span> registros
        </div>
        
        <!-- Controles de paginación -->
        <div class="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2">
          <!-- Selector de registros por página -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Por página:</span>
            <USelectMenu
              v-model="selectedPerPage"
              :options="perPageOptions"
              size="sm"
              class="w-20"
              @update:model-value="(value: any) => changePerPage(value)"
            />
          </div>
          
          <!-- Paginación -->
          <UPagination
            v-model="currentPageModel"
            :page-count="perPage"
            :total="totalRecords"
            :max="isMobile ? 5 : 7"
            @update:model-value="changePage"
            :disabled="loading"
            size="sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AsistenciaRecord, AsistenciaStats, AttendanceUser } from '~/types'

interface Props {
  asistencias: AsistenciaRecord[]
  loading?: boolean
  totalRecords: number
  currentPage: number
  perPage: number
  fromRecord: number
  toRecord: number
  stats: AsistenciaStats
}

interface Emits {
  (e: 'edit', asistencia: AsistenciaRecord): void
  (e: 'delete', asistencia: AsistenciaRecord): void
  (e: 'view', asistencia: AsistenciaRecord): void
  (e: 'duplicate', asistencia: AsistenciaRecord): void
  (e: 'sync', asistencia: AsistenciaRecord): void
  (e: 'add'): void
  (e: 'refresh'): void
  (e: 'openFilters'): void
  (e: 'clearFilters'): void
  (e: 'pageChanged', page: number): void
  (e: 'perPageChanged', perPage: number): void
  (e: 'sort', field: string): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 🎯 Composables
const { 
  formatFecha, 
  formatTimestamp, 
  getGoogleMapsUrl, 
  getTipoRegistroIcon, 
  getMetodoConexionConfig, 
  getBateriaColor, 
  getBateriaIcon, 
  getDeviceIcon,
  getSignalIcon,
  getSignalColor
} = useAsistencias()

// � Detectar si es móvil
const isMobile = ref(false)

//  Estados locales
const currentPageModel = ref(props.currentPage)
const selectedPerPage = ref({ label: `${props.perPage} por página`, value: props.perPage })

// 🎯 Opciones de registros por página
const perPageOptions = [
  { label: '10 por página', value: 10 },
  { label: '15 por página', value: 15 },
  { label: '25 por página', value: 25 },
  { label: '50 por página', value: 50 },
  { label: '100 por página', value: 100 }
]

// 🔄 Watchers para sincronizar props con estado local
watch(() => props.currentPage, (newPage) => {
  currentPageModel.value = newPage
})

watch(() => props.perPage, (newPerPage) => {
  const foundOption = perPageOptions.find(option => option.value === newPerPage)
  if (foundOption) {
    selectedPerPage.value = foundOption
  } else {
    selectedPerPage.value = { label: '15 por página', value: 15 }
  }
})

// 📱 Detectar tamaño de pantalla
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 640
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})

// 🎯 Funciones de eventos
const changePage = (page: number) => {
  emit('pageChanged', page)
}

const changePerPage = (option: any) => {
  selectedPerPage.value = option
  emit('perPageChanged', option.value)
}

// 👤 Función para obtener avatar del empleado
const getEmployeeAvatar = (user?: AttendanceUser) => {
  if (!user) return undefined
  // Generar avatar basado en iniciales o usar Gravatar
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&color=fff&size=128`
}

// 🎬 Funciones para manejar acciones
const getActionItems = (asistencia: AsistenciaRecord) => {
  return [
    [
      { 
        label: 'Ver detalles', 
        icon: 'i-lucide-eye', 
        click: () => emit('view', asistencia) 
      },
      { 
        label: 'Duplicar registro', 
        icon: 'i-lucide-copy', 
        click: () => emit('duplicate', asistencia) 
      }
    ],
    [
      { 
        label: 'Forzar sincronización', 
        icon: 'i-lucide-refresh-cw', 
        click: () => emit('sync', asistencia),
        disabled: asistencia.sincronizado === 1
      },
      { 
        label: 'Eliminar', 
        icon: 'i-lucide-trash', 
        click: () => emit('delete', asistencia),
        class: 'text-red-600 dark:text-red-400'
      }
    ]
  ]
}
</script>

<style scoped>
/* Mejoras visuales específicas */
.table-row-hover {
  transition: all 0.15s ease-in-out;
}

.table-row-hover:hover {
  background-color: rgba(249, 250, 251, 1);
  transform: translateY(-1px);
}

.dark .table-row-hover:hover {
  background-color: rgba(31, 41, 55, 1);
}

/* Animaciones para los badges */
.badge-bounce {
  transition: transform 0.2s ease-in-out;
}

.badge-bounce:hover {
  transform: scale(1.05);
}

/* Estilos para cards responsivos */
@media (max-width: 768px) {
  .card-mobile {
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .card-mobile:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

/* Estados especiales para sincronización pendiente */
.pending-sync {
  background: linear-gradient(90deg, rgba(254, 252, 232, 0.5) 0%, transparent 100%);
  border-left: 3px solid #f59e0b;
}

.dark .pending-sync {
  background: linear-gradient(90deg, rgba(120, 53, 15, 0.2) 0%, transparent 100%);
}

/* Mejoras para tooltips en móvil */
@media (hover: none) {
  .tooltip-mobile {
    display: none;
  }
}

/* Animaciones suaves para loading states */
.skeleton {
  background: linear-gradient(90deg, 
    rgba(229, 231, 235, 1) 25%, 
    rgba(243, 244, 246, 1) 50%, 
    rgba(229, 231, 235, 1) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.dark .skeleton {
  background: linear-gradient(90deg, 
    rgba(55, 65, 81, 1) 25%, 
    rgba(75, 85, 99, 1) 50%, 
    rgba(55, 65, 81, 1) 75%
  );
  background-size: 200% 100%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Estilos para la imagen modal */
.image-modal img {
  max-height: 70vh;
  object-fit: contain;
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .table-row-hover,
  .card-mobile,
  .badge-bounce {
    transition: none;
  }
  
  .skeleton {
    animation: none;
  }
}

/* Focus states mejorados */
.focus-ring:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.dark .focus-ring:focus {
  outline-color: #60a5fa;
}
</style>