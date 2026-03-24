<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SeguimientoConRutasTable from '~/components/seguimiento/SeguimientoConRutasTable.vue'
import SeguimientoFilters from '~/components/seguimiento/SeguimientoFilters.vue'
import SeguimientoSinRutasTable from '~/components/seguimiento/SeguimientoSinRutasTable.vue'
import SeguimientoTabs from '~/components/seguimiento/SeguimientoTabs.vue'
import ValidationModal from '~/components/seguimiento/ValidationModal.vue'
import { apiFetch } from '~/services/api'
import type {
  ApiResponse,
  SeguimientoSubTab,
  SeguimientoTab,
  TecnicoConRutaEntry,
  TecnicoData,
  Usuario,
  ValidationTarget,
} from '~/types/seguimiento'
import { getMarcacionesCount, hasMarcaciones } from '~/utils/seguimiento'

const search = ref('')
const filtroEstado = ref('todos')
const ordenarPor = ref('original')
const fechaSeleccionada = ref(new Date().toISOString().split('T')[0] || '')
const tabActivo = ref<SeguimientoTab>('con-rutas')
const subTabConRutas = ref<SeguimientoSubTab>('marcaron')
const subTabSinRutas = ref<SeguimientoSubTab>('marcaron')

const isLoading = ref(false)
const error = ref<string | null>(null)
const usuariosConRutaData = ref<Usuario[]>([])
const usuariosSinRutaData = ref<Usuario[]>([])
const tecnicosExpandidos = ref<Record<string, boolean>>({})

const showValidationModal = ref(false)
const validationTarget = ref<ValidationTarget | null>(null)
const validationLoading = ref(false)

const conceptoMap: Record<string, number> = {
  asistencia: 1,
  vacaciones: 2,
  descanso_medico: 3,
  sin_ruta: 4,
  no_marco: 5,
  cese: 6,
}

const toggleTecnico = (key: string) => {
  tecnicosExpandidos.value[key] = !tecnicosExpandidos.value[key]
}

const openValidationModal = (target: ValidationTarget) => {
  validationTarget.value = target
  showValidationModal.value = true
}

const enviarWhatsApp = (tecnicoData: TecnicoData) => {
  const normalizeWhatsAppPhone = (raw: string) => {
    const digits = String(raw || '').replace(/[^\d]/g, '')
    if (!digits) {
      return null
    }

    let phone = digits

    if (phone.startsWith('00')) {
      phone = phone.slice(2)
    }

    if (phone.startsWith('0')) {
      phone = phone.slice(1)
    }

    if (phone.length === 9 && phone.startsWith('9')) {
      phone = `51${phone}`
    }

    return phone.length < 10 ? null : phone
  }

  const usuario = tecnicoData.usuario || ({} as Usuario)
  const nombre = usuario.nombre_completo || 'Técnico'
  const mobileRaw = usuario.mobile || ''
  const phone = normalizeWhatsAppPhone(mobileRaw)

  if (!phone) {
    alert(`No se pudo enviar WhatsApp: el técnico "${nombre}" no tiene un número válido en el campo mobile.`)
    return
  }

  const fecha = fechaSeleccionada.value
  const departamento = usuario.departamento ? ` (${usuario.departamento})` : ''
  const mensaje = [
    `Hola ${nombre}${departamento},`,
    '',
    `Te escribo por el seguimiento de asistencia del día ${fecha}.`,
    'Veo que no se registró tu marcación.',
    '',
    '¿Puedes confirmarme si tuviste algún inconveniente?',
  ].join('\n')

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`
  const openedWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (!openedWindow) {
    window.location.href = url
  }
}

const handleFechaSeleccionada = (value: string) => {
  fechaSeleccionada.value = value
  cargarDatos()
}

const onValidationSubmit = async (payload: { motivo: string | number; comentario?: string }) => {
  if (!validationTarget.value) {
    return
  }

  validationLoading.value = true

  try {
    const usuario =
      'usuario' in validationTarget.value
        ? validationTarget.value.usuario
        : validationTarget.value

    const employeeId = usuario.id || null
    const empCode = usuario.dni || ''
    let conceptId: number | null = null

    if (typeof payload.motivo === 'number') {
      conceptId = payload.motivo
    } else if (typeof payload.motivo === 'string') {
      conceptId = conceptoMap[payload.motivo] || null
    }

    const body = {
      employee_id: employeeId,
      emp_code: empCode,
      concept_id: conceptId,
      start_date: fechaSeleccionada.value,
      end_date: fechaSeleccionada.value,
      comment: payload.comentario || null,
    }

    await apiFetch('/api/employee-concepts', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const fakeDaily = {
      id: Date.now(),
      date: fechaSeleccionada.value,
      employee_id: employeeId,
      emp_code: empCode,
      concept_id: conceptId,
      day_code: '1',
      mobility_eligible: false,
      source: 'employee_concepts',
      notes: payload.comentario || 'Registro manual',
      processed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if ('usuario' in validationTarget.value) {
      validationTarget.value.usuario.daily_record = fakeDaily
    } else {
      validationTarget.value.daily_record = fakeDaily
    }

    if (empCode || employeeId) {
      usuariosConRutaData.value = usuariosConRutaData.value.map((usuarioItem) => {
        if ((usuarioItem.dni || '') === String(empCode) || usuarioItem.id === employeeId) {
          usuarioItem.daily_record = fakeDaily
        }
        return usuarioItem
      })

      usuariosSinRutaData.value = usuariosSinRutaData.value.map((usuarioItem) => {
        if ((usuarioItem.dni || '') === String(empCode) || usuarioItem.id === employeeId) {
          usuarioItem.daily_record = fakeDaily
        }
        return usuarioItem
      })
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    showValidationModal.value = false
    validationTarget.value = null
  } catch (err: any) {
    console.error('Error al registrar concepto del empleado:', err)
  } finally {
    validationLoading.value = false
  }
}

const tecnicosConRutas = computed(() => usuariosConRutaData.value.length)
const tecnicosSinRutas = computed(() => usuariosSinRutaData.value.length)

const tecnicosSinRutasFiltrados = computed(() => {
  let tecnicos = usuariosSinRutaData.value

  if (search.value.trim()) {
    const searchLower = search.value.toLowerCase()
    tecnicos = tecnicos.filter((tecnico) => {
      const nombre = tecnico.nombre_completo.toLowerCase()
      const dni = String(tecnico.dni || '').toLowerCase()
      return dni.includes(searchLower) || nombre.includes(searchLower)
    })
  }

  if (filtroEstado.value === 'con-marcacion') {
    tecnicos = tecnicos.filter((tecnico) => hasMarcaciones(tecnico.marcaciones))
  } else if (filtroEstado.value === 'sin-marcacion') {
    tecnicos = tecnicos.filter((tecnico) => !hasMarcaciones(tecnico.marcaciones))
  }

  return tecnicos
})

const datosAgrupadosFiltrados = computed<TecnicoConRutaEntry[]>(() => {
  const agrupados: Record<string, TecnicoData> = {}

  usuariosConRutaData.value.forEach((usuario) => {
    agrupados[usuario.dni] = {
      usuario,
      rutas: usuario.rutas,
      iclock_transactions: usuario.marcaciones,
    }
  })

  let datos = Object.entries(agrupados) as TecnicoConRutaEntry[]

  if (search.value.trim()) {
    const searchLower = search.value.toLowerCase()
    datos = datos.filter(([dni, tecnicoData]) => {
      const nombre = tecnicoData.usuario.nombre_completo.toLowerCase()
      const agencias = tecnicoData.rutas.map((ruta) => ruta.agencia?.toLowerCase() || '').join(' ')
      const cliente = tecnicoData.rutas.map((ruta) => ruta.cliente?.toLowerCase() || '').join(' ')

      return (
        dni.includes(searchLower) ||
        nombre.includes(searchLower) ||
        agencias.includes(searchLower) ||
        cliente.includes(searchLower)
      )
    })
  }

  if (filtroEstado.value === 'con-marcacion') {
    datos = datos.filter(([, tecnicoData]) => hasMarcaciones(tecnicoData.iclock_transactions))
  } else if (filtroEstado.value === 'sin-marcacion') {
    datos = datos.filter(([, tecnicoData]) => !hasMarcaciones(tecnicoData.iclock_transactions))
  }

  if (ordenarPor.value !== 'original') {
    datos.sort(([, dataA], [, dataB]) => {
      if (ordenarPor.value === 'nombre') {
        return dataA.usuario.nombre_completo.localeCompare(dataB.usuario.nombre_completo)
      }

      if (ordenarPor.value === 'rutas') {
        return dataB.rutas.length - dataA.rutas.length
      }

      if (ordenarPor.value === 'marcaciones') {
        return (
          getMarcacionesCount(dataB.iclock_transactions) -
          getMarcacionesCount(dataA.iclock_transactions)
        )
      }

      return 0
    })
  } else {
    datos.sort(([, dataA], [, dataB]) => {
      const aSinMarcacion = !hasMarcaciones(dataA.iclock_transactions)
      const bSinMarcacion = !hasMarcaciones(dataB.iclock_transactions)

      if (aSinMarcacion && !bSinMarcacion) {
        return -1
      }

      if (!aSinMarcacion && bSinMarcacion) {
        return 1
      }

      return 0
    })
  }

  return datos
})

const conRutasMarcados = computed(() =>
  datosAgrupadosFiltrados.value.filter(([, tecnicoData]) => {
    const marcaciones = tecnicoData.iclock_transactions
    return Array.isArray(marcaciones) && marcaciones.length > 0
  }),
)

const conRutasNoMarcados = computed(() =>
  datosAgrupadosFiltrados.value.filter(([, tecnicoData]) => {
    const marcaciones = tecnicoData.iclock_transactions
    return !Array.isArray(marcaciones) || marcaciones.length === 0
  }),
)

const datosConRutasActual = computed(() =>
  subTabConRutas.value === 'marcaron' ? conRutasMarcados.value : conRutasNoMarcados.value,
)

const sinRutasMarcados = computed(() =>
  tecnicosSinRutasFiltrados.value.filter(
    (tecnico) => Array.isArray(tecnico.marcaciones) && tecnico.marcaciones.length > 0,
  ),
)

const sinRutasNoMarcados = computed(() =>
  tecnicosSinRutasFiltrados.value.filter(
    (tecnico) => !Array.isArray(tecnico.marcaciones) || tecnico.marcaciones.length === 0,
  ),
)

const tecnicosSinRutasActual = computed(() =>
  subTabSinRutas.value === 'marcaron' ? sinRutasMarcados.value : sinRutasNoMarcados.value,
)

const currentListCount = computed(() =>
  tabActivo.value === 'con-rutas'
    ? datosConRutasActual.value.length
    : tecnicosSinRutasActual.value.length,
)

const cargarDatos = async () => {
  isLoading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    if (fechaSeleccionada.value) {
      params.append('fecha', fechaSeleccionada.value)
    }

    const url = `/api/seguimiento-tecnico${params.toString() ? `?${params.toString()}` : ''}`
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

<template>
  <UDashboardPanel id="seguimiento">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
        <template #leading>
          <div class="flex items-center gap-3">
            <UDashboardSidebarCollapse />

            <div class="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div class="hidden sm:flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
            <UTooltip text="Datos actualizados">
              <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div class="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" />
                <span class="text-xs font-medium text-gray-600 dark:text-gray-400">En vivo</span>
              </div>
            </UTooltip>

            <UTooltip text="Técnicos sin marcación">
              <UButton color="neutral" variant="ghost" square class="relative group">
                <div class="relative">
                  <UIcon
                    name="i-heroicons-bell"
                    class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
                  />

                  <div class="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-[9px] font-medium rounded-full flex items-center justify-center border border-white dark:border-gray-900">
                    {{ conRutasNoMarcados.length + sinRutasNoMarcados.length }}
                  </div>
                </div>
              </UButton>
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-5 space-y-4">
        <SeguimientoTabs
          :tab-activo="tabActivo"
          :sub-tab-con-rutas="subTabConRutas"
          :sub-tab-sin-rutas="subTabSinRutas"
          :tecnicos-con-rutas="tecnicosConRutas"
          :tecnicos-sin-rutas="tecnicosSinRutas"
          :con-rutas-marcados="conRutasMarcados.length"
          :con-rutas-no-marcados="conRutasNoMarcados.length"
          :sin-rutas-marcados="sinRutasMarcados.length"
          :sin-rutas-no-marcados="sinRutasNoMarcados.length"
          @update:tab-activo="tabActivo = $event"
          @update:sub-tab-con-rutas="subTabConRutas = $event"
          @update:sub-tab-sin-rutas="subTabSinRutas = $event"
        />

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

        <section>
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
            <svg
              class="animate-spin h-10 w-10 text-gray-950 dark:text-gray-50 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p class="text-gray-600 dark:text-gray-400 font-medium text-sm">Cargando datos...</p>
          </div>

          <div
            v-else-if="error"
            class="bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/60 rounded-lg p-8 text-center shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-red-500/70 dark:text-red-400/70 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-base font-medium text-red-800 dark:text-red-200 mb-2">Error al cargar datos</h3>
            <p class="text-red-600/80 dark:text-red-400/80 mb-5 text-sm">{{ error }}</p>
            <button
              class="bg-red-600 dark:bg-red-500 text-white px-5 py-2.5 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 text-sm font-medium shadow-sm"
              @click="recargarDatos"
            >
              Intentar nuevamente
            </button>
          </div>

          <div v-else class="space-y-4">
            <div v-show="tabActivo === 'con-rutas'" class="animate-fadeIn">
              <SeguimientoConRutasTable
                :items="datosConRutasActual"
                :expanded="tecnicosExpandidos"
                @toggle="toggleTecnico"
                @validar="openValidationModal"
                @send-whats-app="enviarWhatsApp"
              />
            </div>

            <div v-show="tabActivo === 'sin-rutas'" class="animate-fadeIn">
              <SeguimientoSinRutasTable
                :items="tecnicosSinRutasActual"
                :expanded="tecnicosExpandidos"
                @toggle="toggleTecnico"
                @validar="openValidationModal"
              />
            </div>
          </div>
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

<style scoped>
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
