
import type {
  SeguimientoEstadoFiltro,
  SeguimientoOrden,
  SeguimientoSubTab,
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

  const search = shallowRef('')
  const filtroEstado = shallowRef<SeguimientoEstadoFiltro>('todos')
  const ordenarPor = shallowRef<SeguimientoOrden>('original')
  const fechaSeleccionada = shallowRef(new Date().toISOString().split('T')[0] || '')
  const tabActivo = shallowRef<SeguimientoTab>('con-rutas')
  const subTabConRutas = shallowRef<SeguimientoSubTab>('marcaron')
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

  const enviarWhatsApp = (tecnicoData: TecnicoData) => {
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

    const mensaje = buildSeguimientoWhatsAppMessage(tecnicoData, fechaSeleccionada.value)
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
