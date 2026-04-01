<script setup lang="ts">
import SeguimientoFilters from '~/components/seguimiento/SeguimientoFilters.vue'
import SeguimientoMainTabs from '~/components/seguimiento/SeguimientoMainTabs.vue'
import SeguimientoSubTabs from '~/components/seguimiento/SeguimientoSubTabs.vue'
import SeguimientoTable from '~/components/seguimiento/SeguimientoTable.vue'
import ValidationModal from '~/components/seguimiento/ValidationModal.vue'
import { useSeguimientoFeature } from '~/composables/useSeguimientoFeature'

const {
  activeSubTab,
  conRutasMarcados,
  conRutasNoMarcados,
  currentEmptyState,
  currentListCount,
  error,
  fechaSeleccionada,
  filtroEstado,
  handleFechaSeleccionada,
  isLoading,
  onValidationSubmit,
  openValidationModal,
  ordenarPor,
  pendingCount,
  recargarDatos,
  search,
  showValidationModal,
  sinRutasMarcados,
  sinRutasNoMarcados,
  tabActivo,
  tableRows,
  tableSource,
  tecnicosConRutas,
  tecnicosExpandidos,
  tecnicosSinRutas,
  toggleTecnico,
  validationLoading,
  validationTarget,
  enviarWhatsApp,
} = useSeguimientoFeature()

const { openNotifications: openRrhhNotifications } = useRrhhNotificationsPanel()
</script>

<template>
  <UDashboardPanel id="seguimiento">
    <template #header>
      <AppDashboardHeader
        title="Seguimiento de Tecnicos"
        mobile-title="Seguimiento"
        subtitle-icon="i-heroicons-signal"
        notification-tooltip="Tecnicos sin marcacion"
        notification-attention
        @notification-click="openRrhhNotifications"
      />
    </template>

    <template #body>
      <div class="space-y-4">
        <SeguimientoMainTabs
          v-model="tabActivo"
          :tecnicos-con-rutas="tecnicosConRutas"
          :tecnicos-sin-rutas="tecnicosSinRutas"
        />

        <SeguimientoSubTabs
          v-model="activeSubTab"
          :source="tableSource"
          :marcados="tableSource === 'con-rutas' ? conRutasMarcados.length : sinRutasMarcados.length"
          :no-marcados="tableSource === 'con-rutas' ? conRutasNoMarcados.length : sinRutasNoMarcados.length"
        />

        <section>
          <UCard v-if="isLoading" class="border-gray-200/70 dark:border-gray-800/70">
            <div class="space-y-6 p-2">
              <div class="flex items-start gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300">
                  <UIcon name="i-heroicons-arrow-path" class="h-5 w-5 animate-spin" />
                </div>

                <div class="space-y-2">
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Cargando seguimiento
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Estamos consultando tecnicos, rutas y marcaciones.
                  </p>
                </div>
              </div>

              <div class="grid gap-3 md:grid-cols-2">
                <USkeleton class="h-24 rounded-xl" />
                <USkeleton class="h-24 rounded-xl" />
              </div>

              <div class="space-y-3">
                <USkeleton class="h-12 w-full rounded-xl" />
                <USkeleton class="h-12 w-full rounded-xl" />
                <USkeleton class="h-12 w-full rounded-xl" />
                <USkeleton class="h-12 w-full rounded-xl" />
              </div>
            </div>
          </UCard>

          <UAlert
            v-else-if="error"
            color="error"
            variant="soft"
            icon="i-heroicons-exclamation-triangle"
            title="No se pudo cargar el seguimiento"
            :ui="{
              root: 'rounded-xl',
              title: 'text-sm font-semibold',
              description: 'text-sm',
            }"
          >
            <template #description>
              <div class="mt-2 flex flex-wrap items-center gap-3">
                <span>{{ error }}</span>
                <UButton
                  color="error"
                  variant="soft"
                  icon="i-heroicons-arrow-path"
                  @click="recargarDatos"
                >
                  Reintentar
                </UButton>
              </div>
            </template>
          </UAlert>

          <UCard
            v-else
            class="overflow-hidden border-gray-200/70 bg-white/95 shadow-sm backdrop-blur-sm dark:border-gray-800/70 dark:bg-gray-950/90"
            :ui="{ body: 'p-0' }"
          >
            <SeguimientoFilters
              :search="search"
              :filtro-estado="filtroEstado"
              :ordenar-por="ordenarPor"
              :fecha-seleccionada="fechaSeleccionada"
              :current-list-count="currentListCount"
              :is-loading="isLoading"
              @update:search="search = $event"
              @update:filtro-estado="filtroEstado = $event"
              @update:ordenar-por="ordenarPor = $event"
              @update:fecha-seleccionada="fechaSeleccionada = $event"
              @change-date="handleFechaSeleccionada"
              @reload="recargarDatos"
            />

            <SeguimientoTable
              :items="tableRows"
              :expanded="tecnicosExpandidos"
              :sub-tab="activeSubTab"
              :empty-state="currentEmptyState"
              @toggle="toggleTecnico"
              @validar="openValidationModal"
              @send-whats-app="enviarWhatsApp"
            />
          </UCard>
        </section>
      </div>

      <ValidationModal
        v-model:show="showValidationModal"
        :tecnico="validationTarget"
        :loading="validationLoading"
        @submit="onValidationSubmit"
      />
    </template>
  </UDashboardPanel>
</template>
