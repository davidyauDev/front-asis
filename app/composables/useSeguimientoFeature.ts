
import type {
  SeguimientoEstadoFiltro,
  SeguimientoOrden,
  SeguimientoSubTab,
  SeguimientoWhatsAppMode,
  SeguimientoTableRow,
  SeguimientoTableSource,
  SeguimientoTab,
  TecnicoConRutaEntry,
  TecnicoData,
  Usuario,
  ValidationSubmitPayload,
  ValidationTarget,
} from '~/types/seguimiento'
import { createEmployeeConcept, getSeguimientoTecnico } from '~/services/seguimiento.service'
import {
  buildSeguimientoRowsFromConRutas,
  buildSeguimientoRowsFromSinRutas,
} from '~/utils/seguimientoTable'
import {
  buildSeguimientoConRutasEntries,
  buildSeguimientoDailyRecord,
  filterAndSortSeguimientoConRutas,
  filterSeguimientoSinRutas,
  getSeguimientoEmptyState,
  patchSeguimientoUsersCollection,
  patchSeguimientoValidationTarget,
  splitSeguimientoConRutasByMarcacion,
  splitSeguimientoSinRutasByMarcacion,
} from '~/utils/seguimientoData'
import {
  buildSeguimientoWhatsAppMessage,
  buildSeguimientoWhatsAppUrl,
  normalizeWhatsAppPhone,
  resolveSeguimientoConceptId,
} from '~/utils/seguimientoActions'

export function useSeguimientoFeature() {
  const toast = useToast()
  const route = useRoute()

  const search = shallowRef('')
  const filtroEstado = shallowRef<SeguimientoEstadoFiltro>('todos')
  const ordenarPor = shallowRef<SeguimientoOrden>('original')
  const todayIso = new Date().toISOString().split('T')[0] || ''
  const queryTab = Array.isArray(route.query.tab) ? route.query.tab[0] : route.query.tab
  const querySubTab = Array.isArray(route.query.subtab) ? route.query.subtab[0] : route.query.subtab
  const queryFecha = Array.isArray(route.query.fecha) ? route.query.fecha[0] : route.query.fecha

  const fechaSeleccionada = shallowRef(
    typeof queryFecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(queryFecha)
      ? queryFecha
      : todayIso,
  )
  const tabActivo = shallowRef<SeguimientoTab>(queryTab === 'sin-rutas' ? 'sin-rutas' : 'con-rutas')
  const subTabConRutas = shallowRef<SeguimientoSubTab>(querySubTab === 'no-marcaron' ? 'no-marcaron' : 'marcaron')
  const subTabSinRutas = shallowRef<SeguimientoSubTab>('marcaron')

  const isLoading = shallowRef(false)
  const error = shallowRef<string | null>(null)
  const usuariosConRutaData = ref<Usuario[]>([])
  const usuariosSinRutaData = ref<Usuario[]>([])
  const tecnicosExpandidos = ref<Record<string, boolean>>({})

  const showValidationModal = shallowRef(false)
  const validationTarget = ref<ValidationTarget | null>(null)
  const validationLoading = shallowRef(false)

  const toggleTecnico = (key: string) => {
    tecnicosExpandidos.value = {
      ...tecnicosExpandidos.value,
      [key]: !tecnicosExpandidos.value[key],
    }
  }

  const openValidationModal = (target: ValidationTarget) => {
    validationTarget.value = target
    showValidationModal.value = true
  }

  const onValidationSubmit = async (payload: ValidationSubmitPayload) => {
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
      const conceptId = resolveSeguimientoConceptId(payload.motivo)

      await createEmployeeConcept({
        employee_id: employeeId,
        emp_code: empCode,
        concept_id: conceptId,
        start_date: fechaSeleccionada.value,
        end_date: fechaSeleccionada.value,
        comment: payload.comentario || null,
      })

      const dailyRecord = buildSeguimientoDailyRecord(
        fechaSeleccionada.value,
        employeeId,
        empCode,
        conceptId,
        payload.comentario,
      )

      validationTarget.value = patchSeguimientoValidationTarget(
        validationTarget.value,
        dailyRecord,
      )

      if (empCode || employeeId) {
        usuariosConRutaData.value = patchSeguimientoUsersCollection(
          usuariosConRutaData.value,
          employeeId,
          empCode,
          dailyRecord,
        )

        usuariosSinRutaData.value = patchSeguimientoUsersCollection(
          usuariosSinRutaData.value,
          employeeId,
          empCode,
          dailyRecord,
        )
      }

      showValidationModal.value = false
      validationTarget.value = null

      toast.add({
        title: 'Validacion registrada',
        description: 'El concepto del empleado fue guardado correctamente.',
        color: 'success',
      })
    } catch (err: any) {
      console.error('Error al registrar concepto del empleado:', err)
      toast.add({
        title: 'Error',
        description: err?.message || 'No se pudo registrar la validacion.',
        color: 'error',
      })
    } finally {
      validationLoading.value = false
    }
  }

  const enviarWhatsApp = (tecnicoData: TecnicoData, mode: SeguimientoWhatsAppMode = 'seguimiento') => {
    const usuario = tecnicoData.usuario || ({} as Usuario)
    const nombre = usuario.nombre_completo || 'Tecnico'
    const phone = normalizeWhatsAppPhone(usuario.mobile || '')

    if (!phone) {
      toast.add({
        title: 'Numero invalido',
        description: `El tecnico "${nombre}" no tiene un numero valido en mobile.`,
        color: 'warning',
      })
      return
    }

    const mensaje = buildSeguimientoWhatsAppMessage(tecnicoData, fechaSeleccionada.value, mode)
    const url = buildSeguimientoWhatsAppUrl(phone, mensaje)
    const openedWindow = window.open('', '_blank')

    if (openedWindow) {
      openedWindow.opener = null
      openedWindow.location.assign(url)
      return
    }

    window.location.assign(url)
  }

  const tecnicosConRutas = computed(() => usuariosConRutaData.value.length)
  const tecnicosSinRutas = computed(() => usuariosSinRutaData.value.length)

  const tecnicosSinRutasFiltrados = computed(() =>
    filterSeguimientoSinRutas(
      usuariosSinRutaData.value,
      search.value,
      filtroEstado.value,
    ),
  )

  const datosAgrupadosFiltrados = computed<TecnicoConRutaEntry[]>(() =>
    filterAndSortSeguimientoConRutas(
      buildSeguimientoConRutasEntries(usuariosConRutaData.value),
      search.value,
      filtroEstado.value,
      ordenarPor.value,
    ),
  )

  const conRutasBySubTab = computed(() =>
    splitSeguimientoConRutasByMarcacion(datosAgrupadosFiltrados.value),
  )

  const sinRutasBySubTab = computed(() =>
    splitSeguimientoSinRutasByMarcacion(tecnicosSinRutasFiltrados.value),
  )

  const conRutasMarcados = computed(() => conRutasBySubTab.value.marcaron)
  const conRutasNoMarcados = computed(() => conRutasBySubTab.value['no-marcaron'])

  const datosConRutasActual = computed(() => conRutasBySubTab.value[subTabConRutas.value])

  const sinRutasMarcados = computed(() => sinRutasBySubTab.value.marcaron)
  const sinRutasNoMarcados = computed(() => sinRutasBySubTab.value['no-marcaron'])

  const tecnicosSinRutasActual = computed(() => sinRutasBySubTab.value[subTabSinRutas.value])

  const currentListCount = computed(() =>
    tabActivo.value === 'con-rutas'
      ? datosConRutasActual.value.length
      : tecnicosSinRutasActual.value.length,
  )

  const tableSource = computed<SeguimientoTableSource>(() => tabActivo.value)

  const activeSubTab = computed<SeguimientoSubTab>({
    get: () =>
      tableSource.value === 'con-rutas' ? subTabConRutas.value : subTabSinRutas.value,
    set: (value) => {
      if (tableSource.value === 'con-rutas') {
        subTabConRutas.value = value
        return
      }

      subTabSinRutas.value = value
    },
  })

  const tableRows = computed<SeguimientoTableRow[]>(() =>
    tableSource.value === 'con-rutas'
      ? buildSeguimientoRowsFromConRutas(datosConRutasActual.value)
      : buildSeguimientoRowsFromSinRutas(tecnicosSinRutasActual.value),
  )

  const pendingCount = computed(
    () => conRutasNoMarcados.value.length + sinRutasNoMarcados.value.length,
  )

  const currentEmptyState = computed(() => getSeguimientoEmptyState(tableSource.value))

  const cargarDatos = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await getSeguimientoTecnico({
        fecha: fechaSeleccionada.value || undefined,
      })

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

  const recargarDatos = () => cargarDatos()

  const handleFechaSeleccionada = (value: string) => {
    fechaSeleccionada.value = value
    cargarDatos()
  }

  watch(
    () => route.query,
    (query) => {
      const nextTab = Array.isArray(query.tab) ? query.tab[0] : query.tab
      const nextSubTab = Array.isArray(query.subtab) ? query.subtab[0] : query.subtab
      const nextFecha = Array.isArray(query.fecha) ? query.fecha[0] : query.fecha

      if (typeof nextFecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(nextFecha) && nextFecha !== fechaSeleccionada.value) {
        fechaSeleccionada.value = nextFecha
        cargarDatos()
      }

      if (nextTab === 'con-rutas' || nextTab === 'sin-rutas') {
        tabActivo.value = nextTab
      }

      if (nextSubTab === 'marcaron' || nextSubTab === 'no-marcaron') {
        if (tabActivo.value === 'con-rutas') {
          subTabConRutas.value = nextSubTab
        } else {
          subTabSinRutas.value = nextSubTab
        }
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    cargarDatos()
  })

  return {
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
  }
}
