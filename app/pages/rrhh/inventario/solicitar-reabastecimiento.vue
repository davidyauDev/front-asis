<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Solicitar Reabastecimiento',
})

const toast = useToast()
const config = useRuntimeConfig()
const authToken = useCookie<string | null>('auth_token', { sameSite: 'lax' })

const ESTADO_REABASTECIMIENTO = {
  PENDIENTE: 10,
  APROBADO: 11,
  COMPLETADO: 12,
  RECHAZADO: 13,
  CANCELADO: 14,
  OBSERVADO: 15,
} as const



const REABASTECIMIENTO_TABS = ['pendientes', 'observadas', 'aprobadas', 'rechazadas', 'completadas', 'canceladas'] as const
const REABASTECIMIENTO_ESTADOS_SOLICITANTE_EDITABLES: number[] = [
  ESTADO_REABASTECIMIENTO.PENDIENTE,
  ESTADO_REABASTECIMIENTO.OBSERVADO,
]

type ReabastecimientoTab = typeof REABASTECIMIENTO_TABS[number]

type ReabastecimientoEstadoInventario = {
  id_estado: number
  descripcion: string
}

type ReabastecimientoRequest = {
  id_solicitud_reb: number
  codigo: string
  id_usuario_solicitante: number
  solicitante: string
  id_area_solicitante: number
  area: string
  id_estado_general: number
  estado_inventario: ReabastecimientoEstadoInventario
  fecha_creacion: string
  justificacion: string
  detalles_count: number
  total_productos?: number
  total_unidades?: number
}

type ReabastecimientoRequestListMeta = {
  tabs: Record<ReabastecimientoTab, {
    label: string
    count: number
  }>
  active_tab: ReabastecimientoTab
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

type ReabastecimientoRequestListResponse = {
  success: boolean
  data: {
    data: ReabastecimientoRequest[]
    meta: ReabastecimientoRequestListMeta
  } | null
  message: string
}

type ReabastecimientoRequestDetailItem = {
  id_detalle_reb: number
  id_solicitud_reb: number
  id_producto: number
  codigo: string
  descripcion: string
  categoria: string
  tipo: string
  stock: number
  cantidad_solicitada: number
}

type ReabastecimientoRequestDetailResponse = {
  success: boolean
  data: {
    solicitud: ReabastecimientoRequest
    detalles: ReabastecimientoRequestDetailItem[]
  } | null
  message: string
}

type UpdateReabastecimientoDetailResponse = {
  success: boolean
  data: {
    id_detalle_reb: number
    id_solicitud_reb: number
    id_producto: number
    cantidad_solicitada: number
  } | null
  message: string
}

type DeleteReabastecimientoDetailResponse = {
  success: boolean
  data: {
    id_detalle_reb: number
    id_solicitud_reb: number
  } | null
  message: string
}

type CreateReabastecimientoDetailResponse = {
  success: boolean
  data: {
    id_detalle_reb: number
    id_solicitud_reb: number
    id_producto: number
    cantidad_solicitada: number
  } | null
  message: string
}

type CreateReabastecimientoDetailPayload = {
  id_solicitud_reb: number
  id_producto: number
  cantidad_solicitada: number
}

type CatalogItem = {
  idProducto: number | string
  code: string
  name: string
  stock: number
}

type InventoryApiItem = {
  id_producto: number | string
  codigo: string
  descripcion: string
  categoria: string
  tipo: string
  stock: number
  estado: string
  area: string
}

type InventoryApiResponse = {
  success: boolean
  data: InventoryApiItem[] | null
  message: string
}

type RequestLine = {
  id: number
  idProducto?: number | string
  description: string
  stock: number
  quantity: number
}

type AttachmentRow = {
  id: number
  description: string
  file: File | null
  previewUrl: string | null
}

type ReabastecimientoFileLogStaff = {
  staff_id: number
  dept_id: number
  role_id: number
  username: string
  firstname: string
  lastname: string
  full_name: string
}

type ReabastecimientoFileLogItem = {
  id_log_reb: number
  id_solicitud_reb: number
  id_usuario_comenta: number
  comentario: string
  archivo_ruta: string
  archivo_url: string
  archivo_nombre_original: string
  staff: ReabastecimientoFileLogStaff
  fecha_creacion: string
}

type ReabastecimientoFileListResponse = {
  success: boolean
  data: {
    data: ReabastecimientoFileLogItem[]
    meta: {
      pagination: {
        current_page: number
        per_page: number
        total: number
        last_page: number
      }
    }
  } | null
  message: string
}

type ReabastecimientoFileUploadResponse = {
  success: boolean
  data: ReabastecimientoFileLogItem | null
  message: string
}

type ReabastecimientoTrackingStaff = {
  full_name?: string
  username?: string
}

type ReabastecimientoTrackingItem = {
  id_flujo_reb: number
  id_log_reb?: number
  id_solicitud_reb: number
  id_area_responsable?: number | null
  id_usuario_asignado?: number | null
  id_usuario_comenta?: number | null
  id_estado?: number | null
  estado_descripcion?: string | null
  comentarios?: string | null
  comentario?: string | null
  archivo?: string | null
  archivo_ruta?: string | null
  archivo_url?: string | null
  archivo_nombre_original?: string | null
  responsable?: string | null
  area?: string | null
  staff?: ReabastecimientoTrackingStaff | null
  fecha_actualizacion?: string | null
  fecha_creacion?: string | null
}

type ReabastecimientoTrackingListResponse = {
  success: boolean
  data: {
    data: ReabastecimientoTrackingItem[]
    meta: {
      pagination: {
        current_page: number
        per_page: number
        total: number
        last_page: number
      }
    }
  } | null
  message: string
}

type ReabastecimientoTrackingCreateResponse = {
  success: boolean
  data: ReabastecimientoTrackingItem | null
  message: string
}

type ReabastecimientoFileDeleteResponse = {
  success: boolean
  data: {
    id_log_reb: number
    id_solicitud_reb: number
  } | null
  message: string
}

type DetailProductRow = {
  id_detalle_reb: number | string
  id_producto?: number | string
  codigo?: string
  descripcion: string
  cantidad_solicitada: number
  stock?: number
}

const activeTab = shallowRef<ReabastecimientoTab>('pendientes')
const createModalOpen = shallowRef(false)
const requestSearch = shallowRef('')
const requestDateFrom = shallowRef('')
const requestDateTo = shallowRef('')
const requestPerPage = shallowRef(10)
const requestPage = shallowRef(1)
const catalogSearch = shallowRef('')
const catalogLoading = shallowRef(false)
const catalogError = shallowRef<string | null>(null)
const requestLoading = shallowRef(false)
const requestError = shallowRef<string | null>(null)
const requestItems = ref<ReabastecimientoRequest[]>([])
const requestTabsMeta = ref<ReabastecimientoRequestListMeta['tabs']>({
  pendientes: { label: 'Pendientes', count: 0 },
  observadas: { label: 'Observadas', count: 0 },
  aprobadas: { label: 'Aprobadas', count: 0 },
  rechazadas: { label: 'Rechazadas', count: 0 },
  completadas: { label: 'Completadas', count: 0 },
  canceladas: { label: 'Canceladas', count: 0 },
})
const requestPagination = ref({
  currentPage: 1,
  perPage: 10,
  total: 0,
  lastPage: 1,
})
const requestDetailLoading = shallowRef(false)
const requestDetailError = shallowRef<string | null>(null)
const requestDetailData = ref<ReabastecimientoRequestDetailResponse['data']>(null)
const detailModalOpen = shallowRef(false)
const selectedRequestSummary = shallowRef<ReabastecimientoRequest | null>(null)
const currentDetailRequestId = shallowRef<number | null>(null)
const requestJustification = shallowRef('')
const showJustification = shallowRef(false)
const attachmentRowSeed = shallowRef(1)
const detailTrackingComment = shallowRef('')
const detailTrackingFile = shallowRef<File | null>(null)
const detailTrackingFileInput = ref<HTMLInputElement | null>(null)
const detailTrackingHistory = ref<ReabastecimientoTrackingItem[]>([])
const detailTrackingLoading = shallowRef(false)
const detailTrackingError = shallowRef<string | null>(null)
const detailTrackingSubmitting = shallowRef(false)
const detailTrackingDeletingId = shallowRef<number | null>(null)
const detailFilesItems = ref<ReabastecimientoFileLogItem[]>([])
const detailFilesLoading = shallowRef(false)
const detailFilesError = shallowRef<string | null>(null)
const detailFilesSearch = shallowRef('')
const detailFilesUploadOpen = shallowRef(false)
const detailFilesUploadFile = shallowRef<File | null>(null)
const detailFilesUploadComment = shallowRef('')
const detailFilesUploadFileInput = ref<HTMLInputElement | null>(null)
const detailFilesUploadSubmitting = shallowRef(false)
const detailFilesDeleteConfirmOpen = shallowRef(false)
const detailFilesDeleteTarget = shallowRef<ReabastecimientoFileLogItem | null>(null)
const detailFilesDeleteSubmitting = shallowRef(false)
const detailProductRows = ref<DetailProductRow[]>([])
const detailProductSelected = shallowRef<number | string | undefined>(undefined)
const detailProductQuantity = shallowRef(1)
const detailProductConfirmOpen = shallowRef(false)
const detailProductPending = shallowRef<CatalogItem | null>(null)
const detailProductEditingRows = shallowRef<Record<string, boolean>>({})
const detailProductQuantityBackup = shallowRef<Record<string, number>>({})
const detailProductEditConfirmOpen = shallowRef(false)
const detailProductEditTarget = shallowRef<DetailProductRow | null>(null)
const detailProductDeleteConfirmOpen = shallowRef(false)
const detailProductDeleteTarget = shallowRef<DetailProductRow | null>(null)
const detailProductEditSubmitting = shallowRef(false)
const detailProductDeleteSubmitting = shallowRef(false)
const detailProductCreateSubmitting = shallowRef(false)
const requestSubmitting = shallowRef(false)
const stateChangeModalOpen = shallowRef(false)
const stateChangeRequest = shallowRef<ReabastecimientoRequest | null>(null)
const stateChangeTargetEstado = shallowRef<number | null>(null)
const stateChangeActionLabel = shallowRef('')
const stateChangeComment = shallowRef('')
const stateChangeFile = shallowRef<File | null>(null)
const stateChangeFileInput = ref<HTMLInputElement | null>(null)
const stateChangeSubmitting = shallowRef(false)

const modalCatalogItems = ref<CatalogItem[]>([])

const requestLines = ref<RequestLine[]>([])

const createAttachmentRow = (id: number): AttachmentRow => ({
  id,
  description: '',
  file: null,
  previewUrl: null,
})

const attachmentRows = ref<AttachmentRow[]>([createAttachmentRow(1)])

const canAddAttachmentRow = computed(() => {
  const lastRow = attachmentRows.value.at(-1)

  if (!lastRow) {
    return false
  }

  return Boolean(lastRow.description.trim() || lastRow.file)
})

const perPageOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
]

const tabItems = computed(() => REABASTECIMIENTO_TABS.map(tab => ({
  label: requestTabsMeta.value[tab]?.label ?? tab,
  value: tab,
  badge: requestTabsMeta.value[tab]?.count ?? 0,
})))

const visibleRequests = computed(() => {
  return requestItems.value
})

const requestPageCount = computed(() => Math.max(1, requestPagination.value.lastPage || 1))

const requestShowingStart = computed(() => {
  if (!requestPagination.value.total) {
    return 0
  }

  return ((requestPagination.value.currentPage - 1) * requestPagination.value.perPage) + 1
})

const requestShowingEnd = computed(() => {
  if (!requestPagination.value.total) {
    return 0
  }

  return Math.min(requestPagination.value.currentPage * requestPagination.value.perPage, requestPagination.value.total)
})

const getRequestStateId = (request?: ReabastecimientoRequest | null) => {
  return Number(request?.estado_inventario?.id_estado ?? request?.id_estado_general ?? 0)
}

const currentDetailStateId = computed(() => getRequestStateId(selectedRequestSummary.value))
const canCancelSelectedRequest = computed(() => currentDetailStateId.value === ESTADO_REABASTECIMIENTO.PENDIENTE)
const canResubmitSelectedRequest = computed(() => currentDetailStateId.value === ESTADO_REABASTECIMIENTO.OBSERVADO)
const canEditDetailProducts = computed(() => currentDetailStateId.value === ESTADO_REABASTECIMIENTO.OBSERVADO)
const canManageDetailFiles = computed(() => REABASTECIMIENTO_ESTADOS_SOLICITANTE_EDITABLES.includes(currentDetailStateId.value))
const canManageDetailTracking = computed(() => canManageDetailFiles.value)
const detailActionsLocked = computed(() => !canEditDetailProducts.value)
const detailFilesLocked = computed(() => !canManageDetailFiles.value)
const detailTrackingLocked = computed(() => !canManageDetailTracking.value)
const canRegisterDetailTracking = computed(() => canManageDetailTracking.value && Boolean(detailTrackingComment.value.trim() || detailTrackingFile.value))
const canRegisterDetailFile = computed(() => canManageDetailFiles.value && Boolean(detailFilesUploadComment.value.trim() || detailFilesUploadFile.value))

const detailStateBanner = computed(() => {
  if (!selectedRequestSummary.value) {
    return null
  }

  const stateId = currentDetailStateId.value

  if (stateId === ESTADO_REABASTECIMIENTO.OBSERVADO) {
    return {
      tone: 'bg-[#7c74ff] text-white',
      title: 'La solicitud está observada. Puedes ajustar productos y adjuntos antes de volver a solicitar.',
    }
  }

  if (stateId === ESTADO_REABASTECIMIENTO.PENDIENTE) {
    return {
      tone: 'bg-[#eef4ff] text-[#2d5fc0]',
      title: 'Solicitud pendiente de aprobación por Compras.',
    }
  }

  if (stateId === ESTADO_REABASTECIMIENTO.APROBADO) {
    return {
      tone: 'bg-[#eaf8ef] text-[#2f8f1f]',
      title: 'Solicitud aprobada. El seguimiento ya está cerrado para edición.',
    }
  }

  if (stateId === ESTADO_REABASTECIMIENTO.RECHAZADO) {
    return {
      tone: 'bg-[#fff0f2] text-[#cf3444]',
      title: 'Solicitud rechazada. Revisa el historial para identificar la observación.',
    }
  }

  if (stateId === ESTADO_REABASTECIMIENTO.COMPLETADO) {
    return {
      tone: 'bg-[#eef7ff] text-[#1676c2]',
      title: 'Solicitud completada. El detalle se mantiene solo como consulta.',
    }
  }

  if (stateId === ESTADO_REABASTECIMIENTO.CANCELADO) {
    return {
      tone: 'bg-[#f3f4f6] text-[#5f6b7a]',
      title: 'Solicitud cancelada por el solicitante.',
    }
  }

  return null
})

const detailActionMeta = computed(() => {
  if (currentDetailStateId.value === ESTADO_REABASTECIMIENTO.PENDIENTE) {
    return {
      title: 'Acción disponible',
      label: 'Cancelar',
      icon: 'i-lucide-ban',
      tone: 'error' as const,
      buttonClass: 'font-semibold',
      submitLabel: 'Guardar estado',
      targetEstado: ESTADO_REABASTECIMIENTO.CANCELADO,
      hint: 'Puedes cancelar la solicitud mientras siga pendiente.',
    }
  }

  if (currentDetailStateId.value === ESTADO_REABASTECIMIENTO.OBSERVADO) {
    return {
      title: 'Acción disponible',
      label: 'Volver a solicitar',
      icon: 'i-lucide-send',
      tone: 'warning' as const,
      buttonClass: 'bg-[#f4d36b] text-[#7a5a00] hover:bg-[#efc84e]',
      submitLabel: 'Guardar estado',
      targetEstado: ESTADO_REABASTECIMIENTO.PENDIENTE,
      hint: 'Actualiza el detalle y reenvía la solicitud a revisión.',
    }
  }

  return null
})

const canCancelRequestItem = (request: ReabastecimientoRequest) => getRequestStateId(request) === ESTADO_REABASTECIMIENTO.PENDIENTE

const filteredCatalog = computed(() => {
  const query = catalogSearch.value.trim().toLowerCase()

  if (!query) {
    return modalCatalogItems.value
  }

  return modalCatalogItems.value.filter((item) => {
    return [item.code, item.name, String(item.stock)]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
})

const visibleCatalog = computed(() => filteredCatalog.value)
const detailProductOptions = computed(() => modalCatalogItems.value.map(item => ({
  label: `${item.code} - ${item.name}`,
  value: item.idProducto,
})))

type CreateReabastecimientoDetail = {
  id_producto: number
  cantidad_solicitada: number
}

type CreateReabastecimientoPayload = {
  id_usuario_solicitante?: number
  id_area_solicitante?: number
  id_estado_general?: number
  justificacion: string
  detalles: CreateReabastecimientoDetail[]
}

type CreateReabastecimientoResponse = {
  success?: boolean
  data?: {
    id_solicitud_reb: number
    detalles_registrados: number
  } | null
  message?: string
}

type UpdateReabastecimientoStateResponse = {
  success: boolean
  data: {
    id_solicitud_reb: number
    id_estado_final: number
    id_flujo_reb: number
  } | null
  message: string
}


const formatLocalDate = (dateString: string) => {
  // const dateUtc = 
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}


const loadRequests = async () => {
  requestLoading.value = true
  requestError.value = null

  try {
    const response = await $fetch<ReabastecimientoRequestListResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
      query: {
        tab: activeTab.value,
        search: requestSearch.value.trim() || undefined,
        from: requestDateFrom.value || undefined,
        to: requestDateTo.value || undefined,
        page: requestPage.value,
        per_page: requestPerPage.value,
      },
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo consultar las solicitudes de reabastecimiento.')
    }

    requestItems.value = response.data.data ?? []
    requestTabsMeta.value = response.data.meta.tabs
    requestPagination.value = {
      currentPage: response.data.meta.pagination.current_page,
      perPage: response.data.meta.pagination.per_page,
      total: response.data.meta.pagination.total,
      lastPage: response.data.meta.pagination.last_page,
    }
  } catch (error: any) {
    console.error('Error cargando solicitudes de reabastecimiento:', error)
    requestItems.value = []
    requestError.value = error?.data?.message || error?.message || 'No se pudo consultar las solicitudes de reabastecimiento.'
  } finally {
    requestLoading.value = false
  }
}

const loadCatalog = async () => {
  catalogLoading.value = true
  catalogError.value = null

  try {
    const response = await $fetch<InventoryApiResponse>(`${config.public.apiBaseUrl}/api/inventario`, {
      method: 'GET',
      params: {
        noBotas: true
      },
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
    })

    if (!response.success || !Array.isArray(response.data)) {
      throw new Error(response.message || 'No se pudo consultar el inventario.')
    }

    modalCatalogItems.value = response.data.map((item, index) => ({
      idProducto: item.id_producto ?? index + 1,
      code: item.codigo,
      name: item.descripcion,
      stock: Number(item.stock) || 0,
    }))
  } catch (error: any) {
    console.error('Error cargando inventario disponible:', error)
    modalCatalogItems.value = []
    catalogError.value = error?.data?.message || error?.message || 'No se pudo consultar el inventario.'
  } finally {
    catalogLoading.value = false
  }
}

const requestStateTone = (descripcion: string, idEstado?: number | null) => {
  const tone = descripcion?.toLowerCase?.() ?? ''

  if (idEstado === ESTADO_REABASTECIMIENTO.PENDIENTE || tone.includes('pendiente')) {
    return 'bg-[#f2cb21] text-[#6a4b00]'
  }

  if (idEstado === ESTADO_REABASTECIMIENTO.OBSERVADO || tone.includes('observ')) {
    return 'bg-[#2d5fc0] text-white'
  }

  if (idEstado === ESTADO_REABASTECIMIENTO.APROBADO || tone.includes('aprob')) {
    return 'bg-[#67c51f] text-white'
  }

  if (idEstado === ESTADO_REABASTECIMIENTO.COMPLETADO || tone.includes('complet') || tone.includes('final')) {
    return 'bg-[#0ea5e9] text-white'
  }

  if (idEstado === ESTADO_REABASTECIMIENTO.RECHAZADO || tone.includes('rech')) {
    return 'bg-[#e53946] text-white'
  }

  if (idEstado === ESTADO_REABASTECIMIENTO.CANCELADO || tone.includes('cancel') || tone.includes('anul')) {
    return 'bg-[#5f6b7a] text-white'
  }

  return 'bg-[#2d5fc0] text-white'
}

const stockTone = (stock: number) => {
  if (stock <= 3) return 'bg-[#e53946] text-white ring-1 ring-[#f6b7bc]'
  if (stock <= 10) return 'bg-[#f2cb21] text-[#6a4b00] ring-1 ring-[#f7e08a]'
  return 'bg-[#2d5fc0] text-white ring-1 ring-[#b8c9ef]'
}

const syncDetailProductRows = (detalles: ReabastecimientoRequestDetailItem[] = []) => {
  detailProductRows.value = detalles.map((detalle) => ({
    id_detalle_reb: detalle.id_detalle_reb,
    id_producto: detalle.id_producto,
    codigo: detalle.codigo,
    descripcion: detalle.descripcion,
    cantidad_solicitada: detalle.cantidad_solicitada,
    stock: detalle.stock,
  }))
}

const addDetailProductRow = () => {
  if (detailActionsLocked.value) {
    return
  }

  if (detailProductSelected.value == null || detailProductSelected.value === '') {
    toast.add({
      title: 'Busca un producto',
      description: 'Selecciona un producto antes de agregar.',
      color: 'warning',
    })
    return
  }

  const match = modalCatalogItems.value.find((item) => String(item.idProducto) === String(detailProductSelected.value))

  if (!match) {
    toast.add({
      title: 'Sin resultados',
      description: 'No se encontro el producto seleccionado.',
      color: 'warning',
    })
    return
  }

  const exists = detailProductRows.value.some((row) => row.codigo === match.code || row.descripcion === match.name)

  if (exists) {
    toast.add({
      title: 'Producto duplicado',
      description: 'Ese producto ya esta agregado en el detalle.',
      color: 'warning',
    })
    return
  }

  detailProductPending.value = match
  detailProductConfirmOpen.value = true
}

const confirmAddDetailProductRow = () => {
  if (detailActionsLocked.value) {
    return
  }

  if (!selectedRequestSummary.value) {
    toast.add({
      title: 'Solicitud requerida',
      description: 'Primero selecciona una solicitud para agregar detalles.',
      color: 'warning',
    })
    return
  }

  if (!detailProductPending.value) {
    toast.add({
      title: 'Producto requerido',
      description: 'Selecciona un producto antes de confirmar.',
      color: 'warning',
    })
    return
  }

  const solicitudId = selectedRequestSummary.value.id_solicitud_reb || currentDetailRequestId.value

  if (!solicitudId) {
    toast.add({
      title: 'Solicitud requerida',
      description: 'No se pudo identificar la solicitud seleccionada.',
      color: 'warning',
    })
    return
  }

  const quantity = Math.max(1, Math.trunc(Number(detailProductQuantity.value) || 1))

  detailProductCreateSubmitting.value = true

  void $fetch<CreateReabastecimientoDetailResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/detalles`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
    },
    body: {
      id_solicitud_reb: solicitudId,
      id_producto: Number(detailProductPending.value.idProducto),
      cantidad_solicitada: quantity,
    } satisfies CreateReabastecimientoDetailPayload,
  }).then(async (response) => {
    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo registrar el detalle de reabastecimiento.')
    }

    toast.add({
      title: 'Detalle agregado',
      description: 'El producto fue agregado correctamente a la solicitud.',
      color: 'success',
    })

    detailProductConfirmOpen.value = false
    detailProductPending.value = null
    detailProductSelected.value = undefined
    detailProductQuantity.value = 1

    if (selectedRequestSummary.value) {
      await openRequestDetail(selectedRequestSummary.value)
    }

    void loadRequests()
  }).catch((error: any) => {
    console.error('Error registrando detalle de reabastecimiento:', error)
    const validationMessages = error?.data?.errors
      ? Object.values(error.data.errors).flat().filter(Boolean).join(' ')
      : ''

    toast.add({
      title: 'No se pudo agregar',
      description: validationMessages || error?.data?.message || error?.message || 'No se pudo registrar el detalle de reabastecimiento.',
      color: 'error',
    })
  }).finally(() => {
    detailProductCreateSubmitting.value = false
  })
}

const cancelAddDetailProductRow = () => {
  detailProductConfirmOpen.value = false
  detailProductPending.value = null
  detailProductCreateSubmitting.value = false
}

const removeDetailProductRowLocal = (rowId: number | string) => {
  detailProductRows.value = detailProductRows.value.filter((row) => row.id_detalle_reb !== rowId)
}

const isTemporaryDetailProductRow = (rowId: number | string) => String(rowId).startsWith('tmp-')

const syncDetailProductRowQuantity = (rowId: number | string, quantity: number) => {
  const row = detailProductRows.value.find(item => item.id_detalle_reb === rowId)

  if (!row) {
    return
  }

  row.cantidad_solicitada = quantity
}

const isDetailProductRowEditing = (rowId: number | string) => Boolean(detailProductEditingRows.value[String(rowId)])

const startEditDetailProductRow = (row: DetailProductRow) => {
  if (detailActionsLocked.value) {
    return
  }

  const key = String(row.id_detalle_reb)

  detailProductQuantityBackup.value = {
    ...detailProductQuantityBackup.value,
    [key]: Number(row.cantidad_solicitada) || 1,
  }

  detailProductEditingRows.value = {
    ...detailProductEditingRows.value,
    [key]: true,
  }
}

const cancelEditDetailProductRow = (row: DetailProductRow) => {
  const key = String(row.id_detalle_reb)
  const backup = detailProductQuantityBackup.value[key]

  if (typeof backup === 'number') {
    row.cantidad_solicitada = backup
  }

  const nextEditing = { ...detailProductEditingRows.value }
  const nextBackup = { ...detailProductQuantityBackup.value }
  delete nextEditing[key]
  delete nextBackup[key]
  detailProductEditingRows.value = nextEditing
  detailProductQuantityBackup.value = nextBackup
  detailProductEditTarget.value = null
  detailProductEditConfirmOpen.value = false
  detailProductEditSubmitting.value = false
}

const promptConfirmEditDetailProductRow = (row: DetailProductRow) => {
  if (detailActionsLocked.value) {
    return
  }

  const nextQuantity = Math.max(1, Math.trunc(Number(row.cantidad_solicitada) || 1))
  row.cantidad_solicitada = nextQuantity
  detailProductEditTarget.value = row
  detailProductEditConfirmOpen.value = true
}

const confirmEditDetailProductRow = () => {
  if (detailActionsLocked.value) {
    return
  }

  if (!detailProductEditTarget.value) {
    detailProductEditConfirmOpen.value = false
    return
  }

  const row = detailProductEditTarget.value
  const key = String(row.id_detalle_reb)
  const nextQuantity = Math.max(1, Math.trunc(Number(row.cantidad_solicitada) || 1))

  detailProductEditSubmitting.value = true

  const finalizeEdit = (message: string) => {
    const nextEditing = { ...detailProductEditingRows.value }
    const nextBackup = { ...detailProductQuantityBackup.value }
    delete nextEditing[key]
    delete nextBackup[key]
    detailProductEditingRows.value = nextEditing
    detailProductQuantityBackup.value = nextBackup
    detailProductEditTarget.value = null
    detailProductEditConfirmOpen.value = false
    detailProductEditSubmitting.value = false

    toast.add({
      title: 'Cantidad actualizada',
      description: message,
      color: 'success',
    })
  }

  if (isTemporaryDetailProductRow(row.id_detalle_reb)) {
    syncDetailProductRowQuantity(row.id_detalle_reb, nextQuantity)
    detailProductEditSubmitting.value = false
    finalizeEdit('El cambio se confirmo correctamente.')
    return
  }

  void $fetch<UpdateReabastecimientoDetailResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/detalles/${row.id_detalle_reb}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
    },
    body: {
      id_producto: Number(row.id_producto ?? 0),
      cantidad_solicitada: nextQuantity,
    },
  }).then((response) => {
    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo actualizar el detalle de reabastecimiento.')
    }

    syncDetailProductRowQuantity(row.id_detalle_reb, nextQuantity)
    finalizeEdit('El detalle fue actualizado correctamente.')
  }).catch((error: any) => {
    console.error('Error actualizando detalle de reabastecimiento:', error)
    if (detailProductEditTarget.value) {
      cancelEditDetailProductRow(detailProductEditTarget.value)
    } else {
      detailProductEditSubmitting.value = false
    }
    toast.add({
      title: 'No se pudo actualizar',
      description: error?.data?.message || error?.message || 'No se pudo actualizar el detalle de reabastecimiento.',
      color: 'error',
    })
  })
}

const cancelConfirmEditDetailProductRow = () => {
  if (detailProductEditTarget.value) {
    cancelEditDetailProductRow(detailProductEditTarget.value)
    return
  }

  detailProductEditConfirmOpen.value = false
}

const promptRemoveDetailProductRow = (row: DetailProductRow) => {
  if (detailActionsLocked.value) {
    return
  }

  detailProductDeleteTarget.value = row
  detailProductDeleteConfirmOpen.value = true
}

const cancelRemoveDetailProductRow = () => {
  detailProductDeleteConfirmOpen.value = false
  detailProductDeleteTarget.value = null
}

const confirmRemoveDetailProductRow = () => {
  if (detailActionsLocked.value) {
    return
  }

  if (!detailProductDeleteTarget.value) {
    detailProductDeleteConfirmOpen.value = false
    return
  }

  const row = detailProductDeleteTarget.value

  detailProductDeleteSubmitting.value = true

  const finishDelete = () => {
    removeDetailProductRowLocal(row.id_detalle_reb)
    detailProductDeleteConfirmOpen.value = false
    detailProductDeleteTarget.value = null
    toast.add({
      title: 'Detalle eliminado',
      description: 'El detalle de reabastecimiento fue eliminado correctamente.',
      color: 'success',
    })
  }

  if (isTemporaryDetailProductRow(row.id_detalle_reb)) {
    finishDelete()
    detailProductDeleteSubmitting.value = false
    return
  }

  void $fetch<DeleteReabastecimientoDetailResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/detalles/${row.id_detalle_reb}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
    },
  }).then((response) => {
    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo eliminar el detalle de reabastecimiento.')
    }

    finishDelete()
  }).catch((error: any) => {
    console.error('Error eliminando detalle de reabastecimiento:', error)
    toast.add({
      title: 'No se pudo eliminar',
      description: error?.data?.message || error?.message || 'No se pudo eliminar el detalle de reabastecimiento.',
      color: 'error',
    })
  }).finally(() => {
    detailProductDeleteSubmitting.value = false
  })
}

const resetDetailProductState = () => {
  detailProductRows.value = []
  detailProductQuantity.value = 1
  detailProductConfirmOpen.value = false
  detailProductPending.value = null
  detailProductEditingRows.value = {}
  detailProductQuantityBackup.value = {}
  detailProductEditConfirmOpen.value = false
  detailProductEditTarget.value = null
  detailProductDeleteConfirmOpen.value = false
  detailProductDeleteTarget.value = null
  detailProductCreateSubmitting.value = false
}

const resetDetailTrackingState = () => {
  detailTrackingHistory.value = []
  detailTrackingComment.value = ''
  detailTrackingFile.value = null
  detailTrackingLoading.value = false
  detailTrackingError.value = null
  detailTrackingSubmitting.value = false
  detailTrackingDeletingId.value = null

  if (detailTrackingFileInput.value) {
    detailTrackingFileInput.value.value = ''
  }
}

const resetDetailFilesState = () => {
  detailFilesItems.value = []
  detailFilesSearch.value = ''
  detailFilesUploadOpen.value = false
  detailFilesUploadFile.value = null
  detailFilesUploadComment.value = ''
  detailFilesUploadSubmitting.value = false
  detailFilesError.value = null
  detailFilesDeleteConfirmOpen.value = false
  detailFilesDeleteTarget.value = null
  detailFilesDeleteSubmitting.value = false

  if (detailFilesUploadFileInput.value) {
    detailFilesUploadFileInput.value.value = ''
  }
}

const resetDetailModalState = () => {
  selectedRequestSummary.value = null
  currentDetailRequestId.value = null
  requestDetailData.value = null
  requestDetailError.value = null
  requestDetailLoading.value = false
  resetDetailTrackingState()
  resetDetailFilesState()
  resetDetailProductState()
  resetStateChange()
}

const addToRequest = (item: CatalogItem) => {
  const exists = requestLines.value.some(row => row.idProducto === item.idProducto || row.description === item.name)

  if (exists) {
    toast.add({
      title: 'Ya agregado',
      description: 'Ese producto ya esta en la solicitud.',
      color: 'warning',
    })
    return
  }

  requestLines.value.push({
    id: Math.max(...requestLines.value.map(row => row.id), 0) + 1,
    idProducto: item.idProducto,
    description: item.name,
    stock: item.stock,
    quantity: 1,
  })
}

const removeRequestLine = (id: number) => {
  requestLines.value = requestLines.value.filter(item => item.id !== id)
}

const addAttachmentRow = () => {
  if (!canAddAttachmentRow.value) {
    toast.add({
      title: 'Completa el adjunto',
      description: 'Primero escribe una descripcion o sube un archivo en la fila actual.',
      color: 'warning',
    })
    return
  }

  attachmentRowSeed.value += 1
  attachmentRows.value.push(createAttachmentRow(attachmentRowSeed.value))
}

const removeAttachmentRow = (id: number) => {
  const row = attachmentRows.value.find(item => item.id === id)
  if (row?.previewUrl) {
    URL.revokeObjectURL(row.previewUrl)
  }

  attachmentRows.value = attachmentRows.value.filter(item => item.id !== id)

  if (!attachmentRows.value.length) {
    attachmentRows.value = [createAttachmentRow(1)]
    attachmentRowSeed.value = 1
  }
}

const onAttachmentFileChange = (id: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  const row = attachmentRows.value.find(item => item.id === id)

  if (!row) {
    return
  }

  if (row.previewUrl) {
    URL.revokeObjectURL(row.previewUrl)
  }

  row.file = file
  row.previewUrl = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null
}

const resetRequestForm = () => {
  attachmentRows.value.forEach((row) => {
    if (row.previewUrl) {
      URL.revokeObjectURL(row.previewUrl)
    }
  })

  requestLines.value = []
  attachmentRows.value = [createAttachmentRow(1)]
  attachmentRowSeed.value = 1
  requestJustification.value = ''
  showJustification.value = false
  catalogSearch.value = ''
}

const uploadInitialAttachments = async (requestId: number) => {
  const rows = attachmentRows.value.filter(row => row.description.trim() || row.file)
  let uploaded = 0

  for (const row of rows) {
    const formData = new FormData()
    const comentario = row.description.trim()

    if (comentario) {
      formData.append('comentario', comentario)
    }

    if (row.file) {
      formData.append('archivo', row.file)
    }

    const response = await $fetch<ReabastecimientoFileUploadResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes/${requestId}/archivos`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
      body: formData,
    })

    if (!response.success) {
      throw new Error(response.message || 'No se pudo registrar un adjunto inicial.')
    }

    uploaded += 1
  }

  return uploaded
}

const processRequest = async () => {
  if (requestSubmitting.value) {
    return
  }

  if (!requestLines.value.length) {
    toast.add({
      title: 'Detalles requeridos',
      description: 'Agrega al menos un producto antes de registrar la solicitud.',
      color: 'warning',
    })
    return
  }

  const justificacion = requestJustification.value.trim() || 'Solicitud de reabastecimiento'
  const detalles = requestLines.value
    .map((row) => ({
      id_producto: Number(row.idProducto),
      cantidad_solicitada: Math.max(1, Math.trunc(Number(row.quantity) || 1)),
    }))
    .filter(item => Number.isFinite(item.id_producto) && item.id_producto > 0)

  if (!detalles.length) {
    toast.add({
      title: 'Productos invalidos',
      description: 'Uno o más productos no tienen un identificador válido.',
      color: 'warning',
    })
    return
  }

  requestSubmitting.value = true

  try {
    const response = await $fetch<CreateReabastecimientoResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
      body: {
        justificacion,
        detalles,
      } satisfies CreateReabastecimientoPayload,
    })

    if (response.success === false) {
      throw new Error(response.message || 'No se pudo registrar la solicitud de reabastecimiento.')
    }

    let adjuntosRegistrados = 0
    const solicitudId = response.data?.id_solicitud_reb

    if (solicitudId) {
      try {
        adjuntosRegistrados = await uploadInitialAttachments(solicitudId)
      } catch (attachmentError: any) {
        console.error('Error registrando adjuntos iniciales:', attachmentError)
        toast.add({
          title: 'Solicitud registrada con advertencia',
          description: attachmentError?.data?.message || attachmentError?.message || 'La solicitud fue creada, pero no se pudieron guardar todos los adjuntos.',
          color: 'warning',
        })
      }
    }

    toast.add({
      title: 'Solicitud registrada',
      description: `Se registró la solicitud ${solicitudId ?? ''} con ${response.data?.detalles_registrados ?? detalles.length} detalle(s)${adjuntosRegistrados ? ` y ${adjuntosRegistrados} adjunto(s)` : ''}.`.trim(),
      color: 'success',
    })

    createModalOpen.value = false
    resetRequestForm()
    requestPage.value = 1
    await loadRequests()
  } catch (error: any) {
    console.error('Error registrando solicitud de reabastecimiento:', error)
    const validationMessages = error?.data?.errors
      ? Object.values(error.data.errors).flat().filter(Boolean).join(' ')
      : ''

    toast.add({
      title: 'No se pudo registrar',
      description: validationMessages
        || error?.data?.message
        || error?.message
        || 'No se pudo registrar la solicitud de reabastecimiento.',
      color: 'error',
    })
  } finally {
    requestSubmitting.value = false
  }
}

const openRequestDetail = async (item: ReabastecimientoRequest) => {
  selectedRequestSummary.value = item
  currentDetailRequestId.value = item.id_solicitud_reb
  detailFilesSearch.value = ''
  detailFilesItems.value = []
  detailFilesError.value = null
  requestDetailData.value = null
  requestDetailError.value = null
  requestDetailLoading.value = true
  detailModalOpen.value = true

  if (!modalCatalogItems.value.length && !catalogLoading.value) {
    void loadCatalog()
  }

  try {
    const response = await $fetch<ReabastecimientoRequestDetailResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes/${item.id_solicitud_reb}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo consultar el detalle de la solicitud.')
    }

    requestDetailData.value = response.data
    syncDetailProductRows(response.data.detalles || [])

    if (getRequestStateId(item) === ESTADO_REABASTECIMIENTO.PENDIENTE) {
      stateChangeRequest.value = item
      stateChangeTargetEstado.value = ESTADO_REABASTECIMIENTO.CANCELADO
      stateChangeActionLabel.value = 'Cancelar'
      stateChangeComment.value = ''
      stateChangeFile.value = null

      if (stateChangeFileInput.value) {
        stateChangeFileInput.value.value = ''
      }
    } else if (getRequestStateId(item) === ESTADO_REABASTECIMIENTO.OBSERVADO) {
      stateChangeRequest.value = item
      stateChangeTargetEstado.value = ESTADO_REABASTECIMIENTO.PENDIENTE
      stateChangeActionLabel.value = 'Volver a solicitar'
      stateChangeComment.value = ''
      stateChangeFile.value = null

      if (stateChangeFileInput.value) {
        stateChangeFileInput.value.value = ''
      }
    } else {
      resetStateChange()
    }

    await Promise.all([
      loadDetailTrackingHistory(item.id_solicitud_reb),
      loadRequestFiles(item.id_solicitud_reb),
    ])
  } catch (error: any) {
    console.error('Error cargando detalle de solicitud:', error)
    requestDetailError.value = error?.data?.message || error?.message || 'No se pudo consultar el detalle de la solicitud.'
  } finally {
    requestDetailLoading.value = false
  }
}

const loadRequestFiles = async (requestId = currentDetailRequestId.value) => {
  if (!requestId) {
    detailFilesItems.value = []
    detailFilesError.value = null
    return
  }

  detailFilesLoading.value = true
  detailFilesError.value = null

  try {
    const params = new URLSearchParams()
    const search = detailFilesSearch.value.trim()

    if (search) {
      params.set('search', search)
    }

    const query = params.toString()
    const endpoint = `${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes/${requestId}/archivos${query ? `?${query}` : ''}`

    const response = await $fetch<ReabastecimientoFileListResponse>(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo consultar el historial de archivos.')
    }

    detailFilesItems.value = response.data.data || []
  } catch (error: any) {
    console.error('Error cargando historial de archivos:', error)
    detailFilesItems.value = []
    detailFilesError.value = error?.data?.message || error?.message || 'No se pudo consultar el historial de archivos.'
  } finally {
    detailFilesLoading.value = false
  }
}

const loadDetailTrackingHistory = async (requestId = currentDetailRequestId.value) => {
  if (!requestId) {
    detailTrackingHistory.value = []
    detailTrackingError.value = null
    return
  }

  detailTrackingLoading.value = true
  detailTrackingError.value = null

  try {
    const endpoint = `${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes/${requestId}/seguimiento`

    const response = await $fetch<ReabastecimientoTrackingListResponse>(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo consultar el seguimiento de la solicitud.')
    }

    detailTrackingHistory.value = response.data.data || []
  } catch (error: any) {
    console.error('Error cargando seguimiento de solicitud:', error)
    detailTrackingHistory.value = []
    detailTrackingError.value = error?.data?.message || error?.message || 'No se pudo consultar el seguimiento de la solicitud.'
  } finally {
    detailTrackingLoading.value = false
  }
}

const upsertDetailFileItem = (item: ReabastecimientoFileLogItem) => {
  detailFilesItems.value = [
    item,
    ...detailFilesItems.value.filter(existing => existing.id_log_reb !== item.id_log_reb),
  ]
}

const upsertDetailTrackingItem = (item: ReabastecimientoTrackingItem) => {
  detailTrackingHistory.value = [
    item,
    ...detailTrackingHistory.value.filter(existing => existing.id_flujo_reb !== item.id_flujo_reb),
  ]
}

const openDetailFilesUpload = () => {
  if (detailFilesLocked.value) {
    return
  }

  if (!selectedRequestSummary.value || !currentDetailRequestId.value) {
    toast.add({
      title: 'Solicitud requerida',
      description: 'Selecciona una solicitud antes de adjuntar archivos.',
      color: 'warning',
    })
    return
  }

  detailFilesUploadOpen.value = true
}

const resetDetailFilesUploadState = () => {
  detailFilesUploadOpen.value = false
  detailFilesUploadFile.value = null
  detailFilesUploadComment.value = ''
  detailFilesUploadSubmitting.value = false

  if (detailFilesUploadFileInput.value) {
    detailFilesUploadFileInput.value.value = ''
  }
}

const onDetailFilesUploadFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  detailFilesUploadFile.value = input.files?.[0] ?? null
}

const applyDetailFilesSearch = () => {
  void loadRequestFiles()
}

const confirmDetailFilesUpload = async () => {
  if (detailFilesLocked.value) {
    return
  }

  if (!selectedRequestSummary.value || !currentDetailRequestId.value) {
    toast.add({
      title: 'Solicitud requerida',
      description: 'Selecciona una solicitud antes de adjuntar archivos.',
      color: 'warning',
    })
    return
  }

  const comentario = detailFilesUploadComment.value.trim()

  if (!comentario && !detailFilesUploadFile.value) {
    toast.add({
      title: 'Contenido requerido',
      description: 'Agrega un comentario o un archivo antes de guardar.',
      color: 'warning',
    })
    return
  }

  const requestId = currentDetailRequestId.value
  const formData = new FormData()

  if (comentario) {
    formData.append('comentario', comentario)
  }

  if (detailFilesUploadFile.value) {
    formData.append('archivo', detailFilesUploadFile.value)
  }

  detailFilesUploadSubmitting.value = true

  try {
    const response = await $fetch<ReabastecimientoFileUploadResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes/${requestId}/archivos`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
      body: formData,
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo adjuntar el archivo.')
    }

    upsertDetailFileItem(response.data)

    toast.add({
      title: 'Archivo adjuntado',
      description: 'El archivo se guardo correctamente.',
      color: 'success',
    })

    resetDetailFilesUploadState()
    await loadRequestFiles(requestId)
  } catch (error: any) {
    console.error('Error adjuntando archivo:', error)
    const validationMessages = error?.data?.errors
      ? Object.values(error.data.errors).flat().filter(Boolean).join(' ')
      : ''

    toast.add({
      title: 'No se pudo adjuntar',
      description: validationMessages || error?.data?.message || error?.message || 'No se pudo adjuntar el archivo.',
      color: 'error',
    })
  } finally {
    detailFilesUploadSubmitting.value = false
  }
}

const promptRemoveDetailFile = (item: ReabastecimientoFileLogItem) => {
  if (detailFilesLocked.value) {
    return
  }

  detailFilesDeleteTarget.value = item
  detailFilesDeleteConfirmOpen.value = true
}

const cancelRemoveDetailFile = () => {
  detailFilesDeleteConfirmOpen.value = false
  detailFilesDeleteTarget.value = null
  detailFilesDeleteSubmitting.value = false
}

const confirmRemoveDetailFile = async () => {
  if (detailFilesLocked.value) {
    return
  }

  if (!detailFilesDeleteTarget.value) {
    detailFilesDeleteConfirmOpen.value = false
    return
  }

  const target = detailFilesDeleteTarget.value
  detailFilesDeleteSubmitting.value = true

  try {
    const response = await $fetch<ReabastecimientoFileDeleteResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/archivos/${target.id_log_reb}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo eliminar el archivo.')
    }

    toast.add({
      title: 'Archivo eliminado',
      description: 'El archivo fue eliminado correctamente.',
      color: 'success',
    })

    detailFilesDeleteConfirmOpen.value = false
    detailFilesDeleteTarget.value = null
    await loadRequestFiles()
  } catch (error: any) {
    console.error('Error eliminando archivo:', error)
    toast.add({
      title: 'No se pudo eliminar',
      description: error?.data?.message || error?.message || 'No se pudo eliminar el archivo.',
      color: 'error',
    })
  } finally {
    detailFilesDeleteSubmitting.value = false
  }
}

const onAction = (item: ReabastecimientoRequest) => {
  void openRequestDetail(item)
}

const retryRequestDetail = () => {
  if (!selectedRequestSummary.value) {
    return
  }

  void openRequestDetail(selectedRequestSummary.value)
}

const closeRequestDetail = () => {
  detailModalOpen.value = false
  resetDetailModalState()
}

const onDetailTrackingFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  detailTrackingFile.value = input.files?.[0] ?? null
}

const registerDetailTracking = async () => {
  if (detailTrackingLocked.value) {
    return
  }

  if (!selectedRequestSummary.value || !currentDetailRequestId.value) {
    return
  }

  const comentario = detailTrackingComment.value.trim()
  if (!comentario && !detailTrackingFile.value) {
    toast.add({
      title: 'Seguimiento requerido',
      description: 'Agrega un comentario o un archivo antes de registrar el seguimiento.',
      color: 'warning',
    })
    return
  }

  const requestId = currentDetailRequestId.value
  const formData = new FormData()

  if (comentario) {
    formData.append('comentarios', comentario)
    formData.append('comentario', comentario)
  }

  if (detailTrackingFile.value) {
    formData.append('archivo', detailTrackingFile.value)
  }

  detailTrackingSubmitting.value = true

  try {
    const response = await $fetch<ReabastecimientoTrackingCreateResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes/${requestId}/seguimiento`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
      body: formData,
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo registrar el seguimiento.')
    }

    upsertDetailTrackingItem(response.data)

    toast.add({
      title: 'Seguimiento registrado',
      description: 'El seguimiento se guardo correctamente.',
      color: 'success',
    })

    detailTrackingComment.value = ''
    detailTrackingFile.value = null

    if (detailTrackingFileInput.value) {
      detailTrackingFileInput.value.value = ''
    }

    await loadDetailTrackingHistory(requestId)
  } catch (error: any) {
    console.error('Error registrando seguimiento:', error)
    const validationMessages = error?.data?.errors
      ? Object.values(error.data.errors).flat().filter(Boolean).join(' ')
      : ''

    toast.add({
      title: 'No se pudo registrar',
      description: validationMessages || error?.data?.message || error?.message || 'No se pudo registrar el seguimiento.',
      color: 'error',
    })
  } finally {
    detailTrackingSubmitting.value = false
  }
}

const removeDetailTracking = async (item: ReabastecimientoTrackingItem) => {
  if (detailTrackingLocked.value) {
    return
  }

  if (!currentDetailRequestId.value) {
    return
  }

  const confirmation = window.confirm(`Eliminar el seguimiento ${item.id_flujo_reb}?`)
  if (!confirmation) {
    return
  }

  detailTrackingDeletingId.value = item.id_flujo_reb

  try {
    const response = await $fetch<{ success: boolean; data: null | { id_flujo_reb: number }; message: string }>(
      `${config.public.apiBaseUrl}/api/reabastecimiento/seguimiento/${item.id_flujo_reb}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
        },
      },
    )

    if (!response.success) {
      throw new Error(response.message || 'No se pudo eliminar el seguimiento.')
    }

    toast.add({
      title: 'Seguimiento eliminado',
      description: 'El seguimiento fue eliminado correctamente.',
      color: 'success',
    })

    await loadDetailTrackingHistory()
  } catch (error: any) {
    console.error('Error eliminando seguimiento:', error)
    toast.add({
      title: 'No se pudo eliminar',
      description: error?.data?.message || error?.message || 'No se pudo eliminar el seguimiento.',
      color: 'error',
    })
  } finally {
    detailTrackingDeletingId.value = null
  }
}

const resetStateChange = () => {
  stateChangeModalOpen.value = false
  stateChangeRequest.value = null
  stateChangeTargetEstado.value = null
  stateChangeActionLabel.value = ''
  stateChangeComment.value = ''
  stateChangeFile.value = null
  stateChangeSubmitting.value = false

  if (stateChangeFileInput.value) {
    stateChangeFileInput.value.value = ''
  }
}

const openStateChange = (request: ReabastecimientoRequest, targetEstado: number) => {
  const currentState = getRequestStateId(request)

  if (targetEstado === ESTADO_REABASTECIMIENTO.CANCELADO && currentState !== ESTADO_REABASTECIMIENTO.PENDIENTE) {
    return
  }

  if (targetEstado === ESTADO_REABASTECIMIENTO.PENDIENTE && currentState !== ESTADO_REABASTECIMIENTO.OBSERVADO) {
    return
  }

  stateChangeRequest.value = request
  stateChangeTargetEstado.value = targetEstado
  stateChangeActionLabel.value = targetEstado === ESTADO_REABASTECIMIENTO.CANCELADO ? 'Cancelar solicitud' : 'Reenviar solicitud'
  stateChangeComment.value = targetEstado === ESTADO_REABASTECIMIENTO.CANCELADO
    ? 'Solicitud cancelada por el solicitante.'
    : 'Solicitud actualizada y reenviada para revisión.'
  stateChangeFile.value = null
  stateChangeModalOpen.value = true

  if (stateChangeFileInput.value) {
    stateChangeFileInput.value.value = ''
  }
}

const openStateChangeForSelected = (targetEstado: number) => {
  if (!selectedRequestSummary.value) {
    return
  }

  openStateChange(selectedRequestSummary.value, targetEstado)
}

const onStateChangeFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  stateChangeFile.value = input.files?.[0] ?? null
}

const submitStateChange = async () => {
  if (!stateChangeRequest.value || !stateChangeTargetEstado.value || stateChangeSubmitting.value) {
    return
  }

  const comentario = stateChangeComment.value.trim()
  if (!comentario) {
    toast.add({
      title: 'Comentario requerido',
      description: 'El comentario es obligatorio para cambiar el estado.',
      color: 'warning',
    })
    return
  }

  const requestId = stateChangeRequest.value.id_solicitud_reb
  const targetEstado = stateChangeTargetEstado.value
  const formData = new FormData()
  formData.append('id_estado_reb', String(targetEstado))
  formData.append('comentario', comentario)

  if (stateChangeFile.value) {
    formData.append('archivo', stateChangeFile.value)
  }

  stateChangeSubmitting.value = true

  try {
    const response = await $fetch<UpdateReabastecimientoStateResponse>(`${config.public.apiBaseUrl}/api/reabastecimiento/solicitudes/${requestId}/estado`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
      body: formData,
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'No se pudo actualizar la solicitud.')
    }

    toast.add({
      title: 'Estado actualizado',
      description: response.message || 'La solicitud fue actualizada correctamente.',
      color: 'success',
    })

    resetStateChange()
    await loadRequests()

    if (selectedRequestSummary.value?.id_solicitud_reb === requestId) {
      const refreshed = requestItems.value.find(item => item.id_solicitud_reb === requestId)
      if (refreshed) {
        await openRequestDetail(refreshed)
      } else {
        closeRequestDetail()
      }
    }
  } catch (error: any) {
    console.error('Error actualizando estado de reabastecimiento:', error)
    const validationMessages = error?.data?.errors
      ? Object.values(error.data.errors).flat().filter(Boolean).join(' ')
      : ''

    toast.add({
      title: 'No se pudo actualizar',
      description: validationMessages || error?.data?.message || error?.message || 'No se pudo actualizar la solicitud.',
      color: 'error',
    })
  } finally {
    stateChangeSubmitting.value = false
  }
}

watch([requestSearch, requestDateFrom, requestDateTo, requestPerPage, activeTab], () => {
  if (requestPage.value !== 1) {
    requestPage.value = 1
    return
  }

  void loadRequests()
})

watch(requestPage, () => {
  void loadRequests()
})

watch(detailActionsLocked, (isLocked) => {
  if (!isLocked) {
    return
  }

  cancelAddDetailProductRow()
  cancelConfirmEditDetailProductRow()
  cancelRemoveDetailProductRow()
})

watch(detailFilesLocked, (isLocked) => {
  if (!isLocked) {
    return
  }

  resetDetailFilesUploadState()
  cancelRemoveDetailFile()
})

watch(detailTrackingLocked, (isLocked) => {
  if (!isLocked) {
    return
  }

  detailTrackingComment.value = ''
  detailTrackingFile.value = null
  detailTrackingSubmitting.value = false
  detailTrackingDeletingId.value = null

  if (detailTrackingFileInput.value) {
    detailTrackingFileInput.value.value = ''
  }
})

watch(createModalOpen, (isOpen) => {
  if (!isOpen) {
    resetRequestForm()
    return
  }

  void loadCatalog()
})

watch(detailModalOpen, (isOpen) => {
  if (!isOpen) {
    resetDetailModalState()
  }
})

onMounted(() => {
  void loadRequests()
})
</script>

<template>
  <div class="">
    <UCard class="overflow-hidden border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85" :ui="{ body: 'p-0' }">
      <div class="space-y-5 ">
        <div class="">
          
          <h1 class="text-xl font-bold text-gray-950 dark:text-white">
            Solicitar Reabastecimiento
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Seguimiento de tus solicitudes y trazabilidad del pedido.
          </p>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-end">
          <AppTabs
            v-model="activeTab"
            ariaLabel="Solicitudes de reabastecimiento"
            size="sm"
            :items="tabItems"
            list-class="w-fit"
          />

          <UButton
            color="primary"
            icon="i-lucide-plus"
            class="w-fit bg-[#2d5fc0] px-5 font-semibold shadow-[0_10px_24px_rgba(45,95,192,0.18)] hover:bg-[#244ea4] md:ml-auto"
            @click="createModalOpen = true"
          >
            Agregar
          </UButton>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <UInput
            v-model="requestSearch"
            icon="i-lucide-search"
            placeholder="Buscar por id, solicitante, area o justificacion..."
            class="w-full md:flex-1"
          />

          <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <UInput
              v-model="requestDateFrom"
              type="date"
              icon="i-lucide-calendar-range"
              class="w-full md:w-56"
            />

            <UInput
              v-model="requestDateTo"
              type="date"
              icon="i-lucide-calendar-range"
              class="w-full md:w-56"
            />
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <table class="min-w-full border-separate border-spacing-0">
            <thead class="bg-[#2d5fc0] text-white">
              <tr>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Codigo</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Solicitante</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Area</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Estado</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Productos</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Unidades</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Justificacion</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha de Creacion</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr v-if="requestLoading">
                <td colspan="9" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Cargando solicitudes de reabastecimiento...
                </td>
              </tr>

              <tr v-else-if="requestError">
                <td colspan="9" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div class="space-y-2">
                    <p>{{ requestError }}</p>
                    <UButton color="primary" variant="soft" size="xs" @click="loadRequests">
                      Reintentar
                    </UButton>
                  </div>
                </td>
              </tr>

              <template v-else>
                <tr
                  v-for="item in visibleRequests"
                  :key="item.id_solicitud_reb"
                  class="cursor-pointer transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
                  @click="openRequestDetail(item)"
                >
                  <td class="px-5 py-3 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                    {{ item.codigo }}
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ item.solicitante }}
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ item.area }}
                  </td>
                  <td class="px-5 py-3">
                    <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', requestStateTone(item.estado_inventario.descripcion, item.estado_inventario.id_estado)]">
                      {{ item.estado_inventario.descripcion }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {{ item.total_productos ?? item.detalles_count ?? 0 }}
                  </td>
                  <td class="px-5 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {{ item.total_unidades ?? '-' }}
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ item.justificacion || '-' }}
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {{ item.fecha_creacion }}
                  </td>
                  <td class="px-5 py-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <UButton
                        color="primary"
                        variant="soft"
                        icon="i-lucide-eye"
                        class="rounded-full bg-[#eef4ff] text-[#2d5fc0] hover:bg-[#dfe9ff]"
                        size="xs"
                        aria-label="Ver detalle"
                        title="Ver detalle"
                        @click.stop="openRequestDetail(item)"
                      />
                      <UButton
                        v-if="canCancelRequestItem(item)"
                        color="error"
                        variant="soft"
                        icon="i-lucide-ban"
                        class="rounded-full"
                        size="xs"
                        aria-label="Cancelar solicitud"
                        title="Cancelar solicitud"
                        @click.stop="openStateChange(item, ESTADO_REABASTECIMIENTO.CANCELADO)"
                      />
                    </div>
                  </td>
                </tr>

                <tr v-if="!visibleRequests.length">
                  <td colspan="9" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No hay resultados para el filtro actual
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Mostrando</span>
            <span class="font-semibold text-gray-950 dark:text-white">
              {{ requestShowingStart }}
            </span>
            <span>a</span>
            <span class="font-semibold text-gray-950 dark:text-white">
              {{ requestShowingEnd }}
            </span>
            <span>de</span>
            <span class="font-semibold text-gray-950 dark:text-white">{{ requestPagination.total }}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600 dark:text-gray-400">Por pagina</span>
            <USelectMenu
              v-model="requestPerPage"
              :items="perPageOptions"
              value-key="value"
              label-key="label"
              class="w-24"
            />
            <UPagination
              v-model:page="requestPage"
              :page-count="requestPerPage"
              :total="requestPagination.total"
              :sibling-count="1"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Pagina {{ requestPage }} de {{ requestPageCount }}
            </span>
          </div>
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="createModalOpen"
      class="w-[calc(100vw-1rem)] max-w-[1560px]"
      :ui="{
        content: 'h-[94vh] overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        wrapper: 'w-full items-center justify-center',
        body: 'h-[calc(94vh-72px)] overflow-y-auto overflow-x-hidden p-0',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div>
           
            <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
              Solicitud de Reabastecimiento
            </h2>
          </div>

         
        </div>
      </template>

      <template #body>
        <div class="flex h-full flex-col bg-white p-4 dark:bg-gray-950">
          <div class="grid h-[calc(94vh-144px)] min-h-0 flex-1 gap-4 md:grid-cols-2">
            <UCard class="min-w-0 h-full overflow-hidden border-gray-200/70 bg-white/90 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/90" :ui="{ body: 'flex h-full min-h-0 flex-col p-0' }">
              <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      Productos en Almacen
                    </p>
                    <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                      Inventario disponible
                    </h3>
                  </div>

                  <UIcon name="i-lucide-warehouse" class="h-5 w-5 text-[#2d5fc0]" />
                </div>

                <div class="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <UInput
                    v-model="catalogSearch"
                    icon="i-lucide-search"
                    placeholder="Buscar por codigo o producto..."
                    class="w-full lg:max-w-sm"
                  />
                </div>
              </div>

              <div class="mt-3 h-[calc(94vh-310px)] min-h-[300px] overflow-y-auto overflow-x-hidden pr-1">
                <table class="min-w-full border-separate border-spacing-0">
                  <thead class="bg-[#2d5fc0] text-white">
                    <tr>
                      <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Producto</th>
                      <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Producto</th>
                      <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Stock</th>
                      <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Accion</th>
                    </tr>
                  </thead>

                  <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                    <tr v-if="catalogLoading">
                      <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Cargando inventario disponible...
                      </td>
                    </tr>

                    <tr v-else-if="catalogError">
                      <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div class="space-y-2">
                          <p>{{ catalogError }}</p>
                          <UButton color="primary" variant="soft" size="xs" @click="loadCatalog">
                            Reintentar
                          </UButton>
                        </div>
                      </td>
                    </tr>

                    <template v-else>
                      <tr
                        v-for="item in visibleCatalog"
                        :key="item.idProducto"
                        class="transition-colors odd:bg-[#fbfbff] even:bg-white hover:bg-[#eef4ff] dark:odd:bg-gray-900/50 dark:even:bg-gray-950 dark:hover:bg-gray-900/70"
                      >
                        <td class="px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {{ item.code }}
                        </td>
                        <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                          {{ item.name }}
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <span :class="['inline-flex min-w-14 justify-center rounded-md px-3 py-1 text-xs font-bold', stockTone(item.stock)]">
                            {{ item.stock }}
                          </span>
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <UButton
                            color="primary"
                            variant="soft"
                            size="xs"
                            icon="i-lucide-plus"
                            class="rounded-full bg-[#2d5fc0]/10 text-[#2d5fc0] hover:bg-[#2d5fc0]/15"
                            @click="addToRequest(item)"
                          >
                            Agregar
                          </UButton>
                        </td>
                      </tr>

                      <tr v-if="!visibleCatalog.length">
                        <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No hay resultados en inventario disponible.
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </UCard>

            <UCard class="min-w-0 h-full border-gray-200/70 bg-white/90 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/90" :ui="{ body: 'flex h-full min-h-0 flex-col p-0' }">
              <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Solicitud de Productos
                </p>
                <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                  Detalle del pedido
                </h3>
              </div>

              <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                <div class="space-y-2 shrink-0">
                  <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <input
                      v-model="showJustification"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-[#2d5fc0] focus:ring-[#2d5fc0]"
                    >
                    Agregar justificacion
                  </label>
                  <UTextarea
                    v-if="showJustification"
                    v-model="requestJustification"
                    :rows="2"
                    placeholder="Explica por que se requiere el reabastecimiento..."
                    class="w-full"
                  />
                </div>

                <div class="min-h-[150px] flex-1 overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <table class="min-w-full border-separate border-spacing-0">
                    <thead class="bg-[#f4f1ff] text-[#49558f] dark:bg-[#101b31] dark:text-[#d1ddfb]">
                      <tr>
                        <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">ID</th>
                        <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Descripcion</th>
                        <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Stock</th>
                        <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Cant.</th>
                        <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Quitar</th>
                      </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                      <tr v-for="item in requestLines" :key="item.id" class="transition-colors hover:bg-[#f8f7ff] dark:hover:bg-gray-900/60">
                        <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">{{ item.id }}</td>
                        <td class="px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">{{ item.description }}</td>
                        <td class="px-4 py-2.5 text-center">
                          <span :class="['inline-flex min-w-14 justify-center rounded-md px-3 py-1 text-xs font-bold', stockTone(item.stock)]">
                            {{ item.stock }}
                          </span>
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <UInput v-model="item.quantity" type="number" min="1" class="mx-auto w-20" />
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <UButton
                            color="error"
                            size="xs"
                            icon="i-lucide-x"
                            class="rounded-md"
                            @click="removeRequestLine(item.id)"
                          />
                        </td>
                      </tr>

                      <tr v-if="!requestLines.length">
                        <td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Agrega productos para completar el detalle del pedido.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60 shrink-0">
                  <div class="mb-4 flex items-center gap-2">
                    <UIcon name="i-lucide-paperclip" class="h-4 w-4 text-[#2d5fc0]" />
                    <h4 class="text-sm font-semibold text-gray-950 dark:text-white">
                      Adjuntar Comentarios / Archivos
                    </h4>
                  </div>

                  <div class="max-h-[150px] sm:max-h-[180px] md:max-h-[220px] space-y-4 overflow-y-auto pr-1">
                    <div
                      v-for="row in attachmentRows"
                      :key="row.id"
                      class="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div class="absolute right-4 top-4">
                        <UButton
                          color="error"
                          variant="soft"
                          icon="i-lucide-trash-2"
                          class="rounded-full"
                          aria-label="Eliminar adjunto"
                          title="Eliminar adjunto"
                          @click="removeAttachmentRow(row.id)"
                        />
                      </div>

                      <div class="pr-12 space-y-4">
                        <div class="space-y-2">
                          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción</label>
                          <UTextarea
                            v-model="row.description"
                            :rows="4"
                            placeholder="Escribe el comentario o detalle del adjunto..."
                            class="w-full"
                          />
                        </div>

                        <div class="flex items-center gap-3">
                          <div class="space-y-2">
                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Archivo</label>
                            <div class="space-y-2">
                              <input
                                :id="`attachment-file-${row.id}`"
                                type="file"
                                class="sr-only"
                                @change="onAttachmentFileChange(row.id, $event)"
                              />
                              <label
                                :for="`attachment-file-${row.id}`"
                                class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#2d5fc0] bg-[#2d5fc0] text-white shadow-sm transition hover:bg-[#244ea4]"
                                aria-label="Subir archivo"
                                title="Subir archivo"
                              >
                                <UIcon name="i-lucide-upload" class="h-4 w-4" />
                              </label>
                            </div>
                          </div>

                          <p v-if="row.file" class="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-gray-400">
                            {{ row.file.name }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4">
                    <UButton
                      color="primary"
                      variant="solid"
                      icon="i-lucide-plus"
                      class="bg-[#ff2f64] px-5 font-semibold text-white shadow-none hover:bg-[#ea2558]"
                      :disabled="!canAddAttachmentRow"
                      @click="addAttachmentRow"
                    >
                      Agregar Fila de Adjunto
                    </UButton>
                  </div>
                </div>

                <UButton
                  color="primary"
                  class="w-full justify-center bg-[#2d5fc0] py-3 font-semibold text-white shadow-[0_12px_26px_rgba(45,95,192,0.18)] hover:bg-[#244ea4] shrink-0"
                  :loading="requestSubmitting"
                  :disabled="requestSubmitting"
                  @click="processRequest"
                >
                  Procesar Pedido
                </UButton>
              </div>
            </UCard>
          </div>

          <div class="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
            <UButton color="neutral" variant="soft" @click="createModalOpen = false">
              Cerrar
            </UButton>
            <UButton
              color="primary"
              class="bg-[#6f5ce8] font-semibold text-white shadow-[0_10px_24px_rgba(111,92,232,0.16)] hover:bg-[#5c48df]"
              :loading="requestSubmitting"
              :disabled="requestSubmitting"
              @click="processRequest"
            >
              Guardar solicitud
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="detailModalOpen"
      class="w-screen max-w-none"
      @close="closeRequestDetail"
      :ui="{
        content: 'h-screen max-h-screen overflow-hidden rounded-none ring-0',
        header: 'p-0',
        body: 'h-[calc(100vh-62px)] overflow-y-auto overflow-x-hidden bg-[#f2f5fa] p-0',
        wrapper: 'items-stretch justify-stretch p-0',
      }"
      :close="{ color: 'neutral', variant: 'soft', class: 'rounded-md bg-white text-[#1e355f] hover:bg-[#eef4ff]' }"
    >
      <template #title>
        <div class="flex min-h-[62px] w-full items-center justify-between gap-3 bg-[#1e355f] px-5 py-3 text-white shadow-[0_10px_26px_rgba(15,23,42,0.16)]">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#c7d2fe]">
              Detalle de solicitud
            </p>
            <h2 class="mt-1 text-lg font-bold text-white">
              {{ selectedRequestSummary?.codigo || 'Sin solicitud seleccionada' }}
            </h2>
          </div>

          <div v-if="selectedRequestSummary" class="flex flex-wrap items-center justify-end gap-2 pr-10">
            <UButton
              v-if="canCancelSelectedRequest"
              color="error"
              variant="solid"
              size="sm"
              icon="i-lucide-ban"
              class="font-semibold"
              @click="openStateChangeForSelected(ESTADO_REABASTECIMIENTO.CANCELADO)"
            >
              Cancelar
            </UButton>
            <UButton
              v-if="canResubmitSelectedRequest"
              color="primary"
              variant="solid"
              size="sm"
              icon="i-lucide-send"
              class="bg-[#57bf24] font-semibold text-white hover:bg-[#49a61d]"
              @click="openStateChangeForSelected(ESTADO_REABASTECIMIENTO.PENDIENTE)"
            >
              Reenviar
            </UButton>
            <UBadge
              :class="['rounded-full px-3 py-1', requestStateTone(selectedRequestSummary.estado_inventario.descripcion, selectedRequestSummary.estado_inventario.id_estado)]"
            >
              {{ selectedRequestSummary.estado_inventario.descripcion }}
            </UBadge>
          </div>
        </div>
      </template>

      <template #body>
        <div v-if="selectedRequestSummary" class="space-y-5 bg-[#f2f5fa] p-4 dark:bg-gray-950">
          


          <template v-if="requestDetailLoading">
            <div class="grid gap-5 lg:grid-cols-2 animate-pulse">
              <div class="space-y-5">
                <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div class="mx-auto h-5 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                  <div class="mt-5 space-y-3">
                    <div class="h-10 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                    <div class="h-10 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                    <div class="h-10 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                    <div class="h-10 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>

                <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div class="mx-auto h-5 w-44 rounded bg-gray-100 dark:bg-gray-800" />
                  <div class="mt-5 space-y-3">
                    <div class="h-6 rounded bg-gray-100 dark:bg-gray-800" />
                    <div class="h-6 rounded bg-gray-100 dark:bg-gray-800" />
                    <div class="h-6 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
                    <div class="h-11 rounded-md bg-gray-100 dark:bg-gray-800" />
                    <div class="h-11 rounded-md bg-gray-100 dark:bg-gray-800" />
                    <div class="h-11 rounded-md bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div class="mx-auto h-5 w-56 rounded bg-gray-100 dark:bg-gray-800" />
                <div class="mt-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div class="h-10 bg-gray-100 dark:bg-gray-800" />
                  <div class="space-y-2 p-4">
                    <div class="h-8 rounded bg-gray-100 dark:bg-gray-800" />
                    <div class="h-8 rounded bg-gray-100 dark:bg-gray-800" />
                    <div class="h-8 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
                <div class="mt-4 space-y-3">
                  <div class="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                  <div class="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                  <div class="h-11 rounded-md bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="grid gap-5 lg:grid-cols-[minmax(0,1.28fr)_minmax(360px,0.72fr)]">
              <div class="space-y-5">
                <section class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-file-text" class="h-4 w-4 text-[#2d5fc0]" />
                      <div>
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Detalle de solicitud
                        </p>
                        <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                          Información general
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4 p-5">
                    <div v-if="detailStateBanner" :class="['rounded-2xl px-4 py-3 text-sm font-medium', detailStateBanner.tone]">
                      {{ detailStateBanner.title }}
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2">
                      <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
                        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                          Solicitante
                        </p>
                        <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">
                          {{ selectedRequestSummary?.solicitante || '-' }}
                        </p>
                      </div>

                      <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
                        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                          Área
                        </p>
                        <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">
                          {{ selectedRequestSummary?.area || '-' }}
                        </p>
                      </div>

                      <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
                        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                          Fecha
                        </p>
                        <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">
                          {{ selectedRequestSummary?.fecha_creacion || '-' }}
                        </p>
                      </div>

                      <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
                        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                          Estado
                        </p>
                        <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">
                          {{ selectedRequestSummary?.estado_inventario?.descripcion || '-' }}
                        </p>
                      </div>
                    </div>

                    <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
                      <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                        Justificación
                      </p>
                      <p class="mt-2 text-sm text-gray-700 dark:text-gray-200">
                        {{ requestDetailData?.solicitud?.justificacion || selectedRequestSummary?.justificacion || '-' }}
                      </p>
                    </div>

                    <div>
                      <div class="mb-3 flex items-center gap-2">
                        <UIcon name="i-lucide-package" class="h-4 w-4 text-[#2d5fc0]" />
                        <h4 class="text-sm font-bold text-gray-950 dark:text-white">
                          Productos solicitados
                        </h4>
                      </div>

                      <div v-if="requestDetailLoading" class="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-gray-400">
                        Cargando detalle de la solicitud...
                      </div>

                      <div v-else-if="requestDetailError" class="space-y-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>{{ requestDetailError }}</p>
                        <UButton color="primary" variant="soft" size="xs" @click="retryRequestDetail">
                          Reintentar
                        </UButton>
                      </div>

                      <div v-else class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                        <table class="min-w-full border-separate border-spacing-0">
                          <thead class="bg-[#f4f1ff] text-[#49558f] dark:bg-[#101b31] dark:text-[#d1ddfb]">
                            <tr>
                              <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Id Detalle</th>
                              <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Descripción</th>
                              <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Cantidad</th>
                              <th v-if="!detailActionsLocked" class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Opciones</th>
                            </tr>
                          </thead>

                          <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                            <tr
                              v-for="detalle in detailProductRows"
                              :key="detalle.id_detalle_reb"
                              class="transition-colors hover:bg-[#f8f7ff] dark:hover:bg-gray-900/60"
                            >
                              <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                                {{ detalle.id_detalle_reb }}
                              </td>
                              <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                                {{ detalle.descripcion }}
                              </td>
                              <td class="px-4 py-2.5 text-center">
                                <UInput
                                  v-model="detalle.cantidad_solicitada"
                                  type="number"
                                  min="1"
                                  class="mx-auto w-24"
                                  :disabled="detailActionsLocked || !isDetailProductRowEditing(detalle.id_detalle_reb)"
                                />
                              </td>
                              <td v-if="!detailActionsLocked" class="px-4 py-2.5 text-center">
                                <div class="flex items-center justify-center gap-2">
                                  <UButton
                                    v-if="!isDetailProductRowEditing(detalle.id_detalle_reb)"
                                    color="primary"
                                    variant="soft"
                                    icon="i-lucide-pencil"
                                    class="rounded-md bg-[#eef4ff] text-[#2d5fc0] hover:bg-[#dfe9ff]"
                                    aria-label="Editar producto"
                                    title="Editar producto"
                                    @click="startEditDetailProductRow(detalle)"
                                  />
                                  <template v-else>
                                    <UButton
                                      color="primary"
                                      variant="soft"
                                      icon="i-lucide-check"
                                      class="rounded-md bg-[#e6f8dd] text-[#2f8f1f] hover:bg-[#d6f2ca]"
                                      aria-label="Confirmar cambio"
                                      title="Confirmar cambio"
                                      @click="promptConfirmEditDetailProductRow(detalle)"
                                    />
                                    <UButton
                                      color="neutral"
                                      variant="soft"
                                      icon="i-lucide-x"
                                      class="rounded-md"
                                      aria-label="Cancelar edición"
                                      title="Cancelar edición"
                                      @click="cancelEditDetailProductRow(detalle)"
                                    />
                                  </template>
                                  <UButton
                                    color="error"
                                    variant="soft"
                                    icon="i-lucide-trash-2"
                                    class="rounded-md"
                                    aria-label="Eliminar producto"
                                    title="Eliminar producto"
                                    @click="promptRemoveDetailProductRow(detalle)"
                                  />
                                </div>
                              </td>
                            </tr>

                            <tr v-if="!detailProductRows.length">
                              <td :colspan="detailActionsLocked ? 3 : 4" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                No hay detalles para esta solicitud.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div
                        v-if="detailActionsLocked"
                        class="mt-3 rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                      >
                        El detalle solo se puede editar cuando la solicitud está observada.
                      </div>

                      <div v-else-if="!requestDetailLoading && !requestDetailError" class="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_100px_180px]">
                        <USelectMenu
                          v-model="detailProductSelected"
                          :items="detailProductOptions"
                          value-key="value"
                          label-key="label"
                          :loading="catalogLoading"
                          :disabled="catalogLoading || catalogError !== null"
                          placeholder="Selecciona un producto"
                          class="w-full"
                        />
                        <UInput v-model="detailProductQuantity" type="number" min="1" class="w-full" />
                        <UButton
                          color="primary"
                          class="justify-center bg-[#57bf24] font-semibold text-white shadow-none hover:bg-[#49a61d]"
                          icon="i-lucide-plus"
                          @click="addDetailProductRow"
                        >
                          Agregar Producto
                        </UButton>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-paperclip" class="h-4 w-4 text-[#2d5fc0]" />
                      <div>
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Comentarios y adjuntos iniciales
                        </p>
                        <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                          Historial de comentarios
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4 p-4">
                    <div v-if="detailFilesLoading" class="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-gray-400">
                      Cargando comentarios y adjuntos...
                    </div>

                    <div v-else-if="detailFilesError" class="space-y-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      <p>{{ detailFilesError }}</p>
                      <UButton color="primary" variant="soft" size="xs" @click="() => loadRequestFiles()">
                        Reintentar
                      </UButton>
                    </div>

                    <div v-else-if="detailFilesItems.length" class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                      <table class="min-w-full border-separate border-spacing-0">
                        <thead class="bg-[#f4f1ff] text-[#49558f] dark:bg-[#101b31] dark:text-[#d1ddfb]">
                          <tr>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Usuario</th>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Comentario</th>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Adjunto</th>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha</th>
                            <th v-if="!detailFilesLocked" class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Quitar</th>
                          </tr>
                        </thead>

                        <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                          <tr
                            v-for="item in detailFilesItems"
                            :key="item.id_log_reb"
                            class="transition-colors hover:bg-[#f8f7ff] dark:hover:bg-gray-900/60"
                          >
                            <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                              {{ item.staff?.full_name || item.staff?.username || '-' }}
                            </td>
                            <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                              {{ item.comentario || '-' }}
                            </td>
                            <td class="px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">
                              <a
                                v-if="item.archivo_url"
                                :href="item.archivo_url"
                                target="_blank"
                                rel="noreferrer"
                                class="inline-flex items-center gap-1 rounded-full border border-[#b7c7f1] px-2 py-1 text-xs font-semibold text-[#2d5fc0] hover:bg-[#eef4ff]"
                              >
                                <UIcon name="i-lucide-paperclip" class="h-3.5 w-3.5" />
                                {{ item.archivo_nombre_original || 'Ver archivo' }}
                              </a>
                              <span v-else class="text-gray-500 dark:text-gray-400">
                                {{ item.archivo_nombre_original || '-' }}
                              </span>
                            </td>
                            <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                              {{ item.fecha_creacion }}
                            </td>
                            <td v-if="!detailFilesLocked" class="px-4 py-2.5 text-center">
                              <UButton
                                color="error"
                                variant="soft"
                                icon="i-lucide-trash-2"
                                size="xs"
                                class="rounded-md"
                                aria-label="Eliminar archivo"
                                title="Eliminar archivo"
                                @click="promptRemoveDetailFile(item)"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div
                      v-else
                      class="rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                    >
                      No hay comentarios iniciales para esta solicitud.
                    </div>

                    <div
                      v-if="!detailFilesLocked"
                      class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60"
                    >
                      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
                        <div class="space-y-2">
                          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Comentario
                          </label>
                          <UInput
                            v-model="detailFilesUploadComment"
                            placeholder="Escribe un comentario..."
                            class="w-full"
                          />
                        </div>

                        <div class="space-y-2">
                          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Archivo
                          </label>
                          <input
                            ref="detailFilesUploadFileInput"
                            type="file"
                            class="block w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2d5fc0] hover:file:cursor-pointer hover:file:underline dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                            @change="onDetailFilesUploadFileChange"
                          >
                        </div>

                        <UButton
                          color="primary"
                          class="justify-center bg-[#57bf24] font-semibold text-white shadow-none hover:bg-[#49a61d]"
                          :loading="detailFilesUploadSubmitting"
                          :disabled="detailFilesUploadSubmitting || !canRegisterDetailFile"
                          icon="i-lucide-upload"
                          @click="confirmDetailFilesUpload"
                        >
                          Adjuntar
                        </UButton>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div class="space-y-5">
                <section class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-history" class="h-4 w-4 text-[#2d5fc0]" />
                      <div>
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Seguimiento
                        </p>
                        <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                          Historial y comentarios
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4 p-4">
                    <div
                      v-if="detailTrackingLocked"
                      class="rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                    >
                      El seguimiento se puede registrar en solicitudes pendientes u observadas.
                    </div>

                    <div v-if="detailTrackingLoading" class="rounded-2xl border border-gray-200 bg-[#fafbff] px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950/60 dark:text-gray-400">
                      Cargando seguimiento...
                    </div>

                    <div v-else-if="detailTrackingError" class="space-y-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                      <p class="font-semibold">
                        No se pudo cargar el seguimiento.
                      </p>
                      <p>{{ detailTrackingError }}</p>
                      <UButton color="primary" variant="soft" size="sm" @click="loadDetailTrackingHistory()">
                        Reintentar
                      </UButton>
                    </div>

                    <template v-else>
                      <div v-if="detailTrackingHistory.length" class="space-y-3">
                        <div
                          v-for="item in detailTrackingHistory"
                          :key="item.id_flujo_reb"
                          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                        >
                       
                          <div class="flex items-start justify-between gap-4">
                            <div class="space-y-2">
                              <div class="flex flex-wrap items-center gap-2">
                                <p class="text-sm font-semibold text-gray-950 dark:text-white">
                                  {{ item.responsable || item.staff?.full_name || item.staff?.username || '-' }}
                                </p>
                                <span :class="['rounded-full px-3 py-1 text-xs font-semibold', requestStateTone(item.comentario || item.comentarios || '', item.id_estado)]">
                                  <!-- {{ item.comentario || item.comentarios || 'Seguimiento' }} -->
                                    {{item.estado_descripcion }}
                                </span>
                              </div>

                              <p class="text-sm text-gray-700 dark:text-gray-200">
                                {{ item.comentarios || item.comentario || '-' }}
                              </p>

                              <div v-if="item.archivo_url || item.archivo || item.archivo_nombre_original" class="pt-1">
                                <a
                                  v-if="item.archivo_url"
                                  :href="item.archivo_url"
                                  target="_blank"
                                  rel="noreferrer"
                                  class="inline-flex items-center gap-1 rounded-full border border-[#c3c9ff] px-2.5 py-1 text-xs font-semibold text-[#6f5ce8] hover:bg-[#f3f1ff]"
                                >
                                  <UIcon name="i-lucide-paperclip" class="h-3.5 w-3.5" />
                                  {{ item.archivo_nombre_original || 'Ver archivo' }}
                                </a>
                                <span v-else class="text-xs text-gray-500 dark:text-gray-400">
                                  {{ item.archivo_nombre_original || item.archivo || '-' }}
                                </span>
                              </div>
                            </div>

                            <div class="text-right text-xs text-gray-500 dark:text-gray-400">
                              
                              {{  formatLocalDate(item.fecha_creacion || item.fecha_actualizacion || '-') }}
                            </div>
                          </div>

                          
                        </div>
                      </div>

                      <div
                        v-else
                        class="rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                      >
                        Aun no hay historial registrado para esta solicitud.
                      </div>

                    </template>

                   
                  </div>
                </section>

                <section v-if="detailActionMeta" class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                  <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-badge-alert" class="h-4 w-4 text-[#2d5fc0]" />
                      <div>
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          {{ detailActionMeta.title }}
                        </p>
                        <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                          Acción del solicitante
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4 p-4">
                    <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 text-sm dark:border-gray-800 dark:bg-gray-950/60">
                      <div class="flex items-center justify-between gap-4">
                        <span class="font-semibold text-gray-500 dark:text-gray-400">Acción</span>
                        <UButton
                          :color="detailActionMeta.tone"
                          variant="soft"
                          size="xs"
                          :icon="detailActionMeta.icon"
                          :class="detailActionMeta.buttonClass"
                          disabled
                        >
                          {{ detailActionMeta.label }}
                        </UButton>
                      </div>
                      <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {{ detailActionMeta.hint }}
                      </p>
                    </div>

                    <div class="space-y-2">
                      <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Comentario
                      </label>
                      <UTextarea
                        v-model="stateChangeComment"
                        :rows="4"
                        placeholder="Escribe el comentario del cambio..."
                        class="w-full"
                      />
                    </div>

                    <div class="space-y-2">
                      <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Archivo
                      </label>
                      <input
                        ref="stateChangeFileInput"
                        type="file"
                        class="block w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2d5fc0] hover:file:cursor-pointer hover:file:underline dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                        @change="onStateChangeFileChange"
                      >
                      <p v-if="stateChangeFile" class="text-xs text-gray-500 dark:text-gray-400">
                        Seleccionado: {{ stateChangeFile.name }}
                      </p>
                    </div>

                    <UButton
                      color="primary"
                      class="w-full justify-center bg-[#2d5fc0] font-semibold text-white shadow-none hover:bg-[#244ea4]"
                      :loading="stateChangeSubmitting"
                      :disabled="stateChangeSubmitting || !stateChangeComment.trim()"
                      @click="submitStateChange"
                    >
                      {{ detailActionMeta.submitLabel }}
                    </UButton>
                  </div>
                </section>

                <section v-else class="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                  Sin acciones disponibles.
                </section>
              </div>
            </div>
          </template>

          <div v-if="false" class="grid gap-5 lg:grid-cols-2">
            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Detalle de productos
                </p>
                <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                  Articulos solicitados
                </h3>
              </div>

              <div class="p-5">
                <div v-if="requestDetailLoading" class="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-gray-400">
                  Cargando detalle de la solicitud...
                </div>

                <div v-else-if="requestDetailError" class="space-y-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>{{ requestDetailError }}</p>
                  <UButton color="primary" variant="soft" size="xs" @click="retryRequestDetail">
                    Reintentar
                  </UButton>
                </div>

                <div v-else class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <table class="min-w-full border-separate border-spacing-0">
                    <thead class="bg-[#f4f1ff] text-[#49558f] dark:bg-[#101b31] dark:text-[#d1ddfb]">
                      <tr>
                        <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Codigo</th>
                        <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Descripcion</th>
                        <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Cant.</th>
                        <th class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Stock</th>
                      </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                      <tr
                        v-for="detalle in requestDetailData?.detalles || []"
                        :key="detalle.id_detalle_reb"
                        class="transition-colors hover:bg-[#f8f7ff] dark:hover:bg-gray-900/60"
                      >
                        <td class="px-4 py-2.5 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                          {{ detalle.codigo }}
                        </td>
                        <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                          {{ detalle.descripcion }}
                        </td>
                        <td class="px-4 py-2.5 text-center text-sm text-gray-700 dark:text-gray-200">
                          {{ detalle.cantidad_solicitada }}
                        </td>
                        <td class="px-4 py-2.5 text-center">
                          <span :class="['inline-flex min-w-14 justify-center rounded-md px-3 py-1 text-xs font-bold', stockTone(detalle.stock)]">
                            {{ detalle.stock }}
                          </span>
                        </td>
                      </tr>

                      <tr v-if="!(requestDetailData?.detalles?.length)">
                        <td colspan="4" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No hay detalles para esta solicitud.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="stateChangeModalOpen"
      class="w-[calc(100vw-1rem)] max-w-lg"
      @close="resetStateChange"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="border-b border-gray-200 bg-[#1e355f] px-6 py-4 text-white dark:border-gray-800">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#c7d2fe]">
            Cambio de estado
          </p>
          <h2 class="mt-1 text-lg font-bold text-white">
            {{ stateChangeActionLabel || 'Actualizar solicitud' }}
          </h2>
        </div>
      </template>

      <template #body>
        <div class="space-y-4 bg-white p-6 dark:bg-gray-950">
          <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 text-sm dark:border-gray-800 dark:bg-gray-950/60">
            <div class="flex items-center justify-between gap-4">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Solicitud</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ stateChangeRequest?.codigo || '-' }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between gap-4">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Accion</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ stateChangeActionLabel || '-' }}
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Comentario
            </label>
            <UTextarea
              v-model="stateChangeComment"
              :rows="4"
              placeholder="Escribe el comentario del cambio..."
              class="w-full"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Archivo
            </label>
            <input
              ref="stateChangeFileInput"
              type="file"
              class="block w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2d5fc0] hover:file:cursor-pointer hover:file:underline dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              @change="onStateChangeFileChange"
            >
            <p v-if="stateChangeFile" class="text-xs text-gray-500 dark:text-gray-400">
              Seleccionado: {{ stateChangeFile.name }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <UButton color="neutral" variant="soft" @click="resetStateChange">
              Cerrar
            </UButton>
            <UButton
              color="primary"
              class="bg-[#2d5fc0] font-semibold text-white shadow-none hover:bg-[#244ea4]"
              :loading="stateChangeSubmitting"
              :disabled="stateChangeSubmitting || !stateChangeComment.trim()"
              @click="submitStateChange"
            >
              Guardar estado
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="detailProductConfirmOpen"
      class="w-[calc(100vw-1rem)] max-w-md"
      @close="cancelAddDetailProductRow"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Confirmacion
          </p>
          <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
            Agregar producto al pedido
          </h2>
        </div>
      </template>

      <template #body>
        <div class="space-y-4 bg-white p-6 dark:bg-gray-950">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Confirma el producto y la cantidad antes de registrarlo en la solicitud.
          </p>

          <div class="space-y-3 rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Codigo</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductPending?.code || '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Producto</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductPending?.name || '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Cantidad</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductQuantity }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Stock disponible</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductPending?.stock ?? 0 }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <UButton color="neutral" variant="soft" @click="cancelAddDetailProductRow">
              Cancelar
            </UButton>
            <UButton
              color="primary"
              class="bg-[#57bf24] font-semibold text-white shadow-none hover:bg-[#49a61d]"
              :loading="detailProductCreateSubmitting"
              :disabled="!detailProductPending || detailProductCreateSubmitting"
              @click="confirmAddDetailProductRow"
            >
              Si, agregar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="detailProductEditConfirmOpen"
      class="w-[calc(100vw-1rem)] max-w-md"
      @close="cancelConfirmEditDetailProductRow"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Confirmacion
          </p>
          <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
            Confirmar cambio de cantidad
          </h2>
        </div>
      </template>

      <template #body>
        <div class="space-y-4 bg-white p-6 dark:bg-gray-950">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Revisa la cantidad actualizada antes de guardarla.
          </p>

          <div class="space-y-3 rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Codigo</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductEditTarget?.codigo || '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Descripcion</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductEditTarget?.descripcion || '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Cantidad nueva</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductEditTarget?.cantidad_solicitada ?? '-' }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <UButton color="neutral" variant="soft" @click="cancelConfirmEditDetailProductRow">
              Cancelar
            </UButton>
            <UButton
              color="primary"
              class="bg-[#2d5fc0] font-semibold text-white shadow-none hover:bg-[#244ea4]"
              :loading="detailProductEditSubmitting"
              :disabled="!detailProductEditTarget || detailProductEditSubmitting"
              @click="confirmEditDetailProductRow"
            >
              Si, confirmar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="detailProductDeleteConfirmOpen"
      class="w-[calc(100vw-1rem)] max-w-md"
      @close="cancelRemoveDetailProductRow"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Confirmacion
          </p>
          <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
            Eliminar detalle de reabastecimiento
          </h2>
        </div>
      </template>

      <template #body>
        <div class="space-y-4 bg-white p-6 dark:bg-gray-950">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Esta accion eliminara el detalle seleccionado de la solicitud.
          </p>

          <div class="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/40 dark:bg-red-950/20">
            <div class="flex items-center justify-between gap-4">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Codigo</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductDeleteTarget?.codigo || '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Descripcion</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductDeleteTarget?.descripcion || '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Cantidad</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailProductDeleteTarget?.cantidad_solicitada ?? '-' }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <UButton color="neutral" variant="soft" @click="cancelRemoveDetailProductRow">
              Cancelar
            </UButton>
            <UButton
              color="error"
              class="bg-[#e53946] font-semibold text-white shadow-none hover:bg-[#cb2d3a]"
              :loading="detailProductDeleteSubmitting"
              :disabled="!detailProductDeleteTarget || detailProductDeleteSubmitting"
              @click="confirmRemoveDetailProductRow"
            >
              Si, eliminar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="detailFilesUploadOpen"
      class="w-[calc(100vw-1rem)] max-w-lg"
      @close="resetDetailFilesUploadState"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Historial y Archivos
          </p>
          <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
            Adjuntar archivo
          </h2>
        </div>
      </template>

      <template #body>
        <div class="space-y-4 bg-white p-6 dark:bg-gray-950">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Registra un comentario, un archivo o ambos para este historial de archivos.
          </p>

          <div class="space-y-3 rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Archivo
              </label>
              <input
                ref="detailFilesUploadFileInput"
                type="file"
                class="block w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2d5fc0] hover:file:cursor-pointer hover:file:underline dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                @change="onDetailFilesUploadFileChange"
              >
              <p v-if="detailFilesUploadFile" class="text-xs text-gray-500 dark:text-gray-400">
                Seleccionado: {{ detailFilesUploadFile.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Puedes guardar solo el comentario, solo el archivo o ambos.
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Comentario
              </label>
              <UTextarea
                v-model="detailFilesUploadComment"
                :rows="3"
                placeholder="Escribe un comentario..."
                class="w-full"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <UButton color="neutral" variant="soft" @click="resetDetailFilesUploadState">
              Cancelar
            </UButton>
            <UButton
              color="primary"
              class="bg-[#57bf24] font-semibold text-white shadow-none hover:bg-[#49a61d]"
              :loading="detailFilesUploadSubmitting"
              :disabled="detailFilesUploadSubmitting || !canRegisterDetailFile"
              @click="confirmDetailFilesUpload"
            >
              Guardar registro
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="detailFilesDeleteConfirmOpen"
      class="w-[calc(100vw-1rem)] max-w-md"
      @close="cancelRemoveDetailFile"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Confirmacion
          </p>
          <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
            Eliminar archivo adjunto
          </h2>
        </div>
      </template>

      <template #body>
        <div class="space-y-4 bg-white p-6 dark:bg-gray-950">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Esta accion eliminara el archivo seleccionado de la solicitud.
          </p>

          <div class="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/40 dark:bg-red-950/20">
            <div class="flex items-center justify-between gap-4">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Archivo</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailFilesDeleteTarget?.archivo_nombre_original || '-' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="font-semibold text-gray-500 dark:text-gray-400">Comentario</span>
              <span class="font-semibold text-gray-950 dark:text-white">
                {{ detailFilesDeleteTarget?.comentario || '-' }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-1">
            <UButton color="neutral" variant="soft" @click="cancelRemoveDetailFile">
              Cancelar
            </UButton>
            <UButton
              color="error"
              class="bg-[#e53946] font-semibold text-white shadow-none hover:bg-[#cb2d3a]"
              :loading="detailFilesDeleteSubmitting"
              :disabled="!detailFilesDeleteTarget || detailFilesDeleteSubmitting"
              @click="confirmRemoveDetailFile"
            >
              Si, eliminar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

