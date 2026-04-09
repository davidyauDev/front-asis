<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Solicitar Reabastecimiento',
})

const toast = useToast()
const config = useRuntimeConfig()
const authToken = useCookie<string | null>('auth_token', { sameSite: 'lax' })

type ReabastecimientoTab = 'pendientes' | 'procesando' | 'cerrados'

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
  id_log_reb: number
  id_solicitud_reb: number
  id_area_responsable?: number | null
  id_usuario_asignado?: number | null
  id_usuario_comenta?: number | null
  id_estado?: number | null
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
  pendientes: { label: 'PENDIENTES', count: 0 },
  procesando: { label: 'PROCESANDO', count: 0 },
  cerrados: { label: 'CERRADOS', count: 0 },
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

/* const requests = ref<any[]>([
  {
    id: 'CECH_REA_0000006',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'justificacion prueba',
    createdAt: '2025-11-24 11:15:23',
  },
  {
    id: 'CECH_REA_0000007',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'prueba',
    createdAt: '2025-11-24 11:16:03',
  },
  {
    id: 'CECH_REA_0000008',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'solicitud de prueba',
    createdAt: '2025-11-24 11:17:51',
  },
  {
    id: 'CECH_REA_0000009',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: '',
    createdAt: '2025-11-24 11:23:22',
  },
  {
    id: 'CECH_REA_0000010',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'justificacion de prueba',
    createdAt: '2025-11-24 11:29:06',
  },
  {
    id: 'CECH_REA_0000013',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'sdads',
    createdAt: '2025-11-24 11:34:25',
  },
  {
    id: 'CECH_REA_0000014',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'prueba',
    createdAt: '2025-11-24 11:36:49',
  },
  {
    id: 'CECH_REA_0000015',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'prueba',
    createdAt: '2025-11-24 11:38:53',
  },
  {
    id: 'CECH_REA_0000016',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'justificacion prueba',
    createdAt: '2025-11-24 11:46:16',
  },
  {
    id: 'CECH_REA_0000018',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'justificacion prueba',
    createdAt: '2025-11-24 11:51:51',
  },
  {
    id: 'CECH_REA_0000019',
    requester: 'Johana Cecilia Camacho Caceda',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Reposicion de EPP para ingreso a planta',
    createdAt: '2025-11-24 12:03:18',
  },
  {
    id: 'CECH_REA_0000020',
    requester: 'Joel Ronald Colque Fuentes',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Solicitud en revision por compras',
    createdAt: '2025-11-24 12:10:42',
  },
  {
    id: 'CECH_REA_0000021',
    requester: 'Karen Aytlen Orozco Guerrero',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Aprobado para entrega parcial',
    createdAt: '2025-11-24 12:18:09',
  },
  {
    id: 'CECH_REA_0000022',
    requester: 'Joana Melissa Ortiz Reyes',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Reposicion de stock por campaña interna',
    createdAt: '2025-11-24 12:24:55',
  },
  {
    id: 'CECH_REA_0000023',
    requester: 'Marjorie Alexandra Osorio la Rosa',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Se valida disponibilidad en almacén',
    createdAt: '2025-11-24 12:31:16',
  },
  {
    id: 'CECH_REA_0000024',
    requester: 'Axel Fabian Panduro Acosta',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Solicitud finalizada sin observaciones',
    createdAt: '2025-11-24 12:39:40',
  },
  {
    id: 'CECH_REA_0000025',
    requester: 'Julian Arturo Romero Sosa',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Pedido urgente por reposicion de stock',
    createdAt: '2025-11-24 12:45:12',
  },
  {
    id: 'CECH_REA_0000026',
    requester: 'Luis Alberto Camacho Caceda',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'En revision por disponibilidad de almacén',
    createdAt: '2025-11-24 12:53:26',
  },
  {
    id: 'CECH_REA_0000027',
    requester: 'Emma Soledad Julian Iturbe',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Aprobado y derivado a entrega',
    createdAt: '2025-11-24 13:01:44',
  },
  {
    id: 'CECH_REA_0000028',
    requester: 'Marjorie Alexandra Osorio la Rosa',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Solicitud adicional por cambio de turno',
    createdAt: '2025-11-24 13:08:09',
  },
  {
    id: 'CECH_REA_0000029',
    requester: 'Rosa Elena Huamani Paredes',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Reposicion de implementos por cierre mensual',
    createdAt: '2025-11-24 13:12:31',
  },
  {
    id: 'CECH_REA_0000030',
    requester: 'Daniel Alberto Velez Rojas',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Aprobado para entrega de almacén',
    createdAt: '2025-11-24 13:19:05',
  },
  {
    id: 'CECH_REA_0000031',
    requester: 'Fiorella Milagros Torres Prado',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Pedido de EPP para nuevo ingreso',
    createdAt: '2025-11-24 13:24:48',
  },
  {
    id: 'CECH_REA_0000032',
    requester: 'Kevin Joel Salazar Luna',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Pedido en revisión por compras',
    createdAt: '2025-11-24 13:29:12',
  },
  {
    id: 'CECH_REA_0000033',
    requester: 'Milagros Andrea Cueva Torres',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Solicitud cerrada y entregada',
    createdAt: '2025-11-24 13:35:40',
  },
  {
    id: 'CECH_REA_0000034',
    requester: 'Renzo Martin Diaz Salas',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Reposicion por stock minimo',
    createdAt: '2025-11-24 13:41:07',
  },
  {
    id: 'CECH_REA_0000035',
    requester: 'Jazmin Alejandra Romero Leon',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Validación de inventario en curso',
    createdAt: '2025-11-24 13:46:22',
  },
  {
    id: 'CECH_REA_0000036',
    requester: 'Luis Fernando Montes Velarde',
    area: 'RR.HH.',
    status: 'closed',
    justification: 'Aprobado y enviado a despacho',
    createdAt: '2025-11-24 13:52:58',
  },
  {
    id: 'CECH_REA_0000037',
    requester: 'Camila Sofia Pinedo Vargas',
    area: 'RR.HH.',
    status: 'pending',
    justification: 'Pedido programado para mañana',
    createdAt: '2025-11-24 13:58:14',
  },
  {
    id: 'CECH_REA_0000038',
    requester: 'Oscar Jesus Medina Castillo',
    area: 'RR.HH.',
    status: 'processing',
    justification: 'Pendiente de autorización final',
    createdAt: '2025-11-24 14:03:41',
  },
]) */

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

const tabItems = computed(() => [
  { label: requestTabsMeta.value.pendientes.label, value: 'pendientes', badge: requestTabsMeta.value.pendientes.count },
  { label: requestTabsMeta.value.procesando.label, value: 'procesando', badge: requestTabsMeta.value.procesando.count },
  { label: requestTabsMeta.value.cerrados.label, value: 'cerrados', badge: requestTabsMeta.value.cerrados.count },
])

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

const detailActionsLocked = computed(() => {
  return Number(selectedRequestSummary.value?.estado_inventario.id_estado) === 7
})
const canRegisterDetailTracking = computed(() => Boolean(detailTrackingComment.value.trim() || detailTrackingFile.value))
const canRegisterDetailFile = computed(() => Boolean(detailFilesUploadComment.value.trim() || detailFilesUploadFile.value))

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
  id_usuario_solicitante: number
  id_area_solicitante: number
  id_estado_general: number
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

const requestStateTone = (descripcion: string, idEstado?: number) => {
  const tone = descripcion?.toLowerCase?.() ?? ''

  if (idEstado === 1 || tone.includes('pendiente')) {
    return 'bg-[#f2cb21] text-[#6a4b00]'
  }

  if (tone.includes('proces') || tone.includes('revision')) {
    return 'bg-[#2d5fc0] text-white'
  }

  if (tone.includes('aprob')) {
    return 'bg-[#67c51f] text-white'
  }

  if (tone.includes('cerr') || tone.includes('final')) {
    return 'bg-[#5f6b7a] text-white'
  }

  if (tone.includes('rech') || tone.includes('anul')) {
    return 'bg-[#e53946] text-white'
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
}

const detailStateOptions = [
  'Aceptacion de Recepcion',
  'Pendiente de Revision',
  'Cerrado',
]

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
        id_usuario_solicitante: 179,
        id_area_solicitante: 11,
        id_estado_general: 1,
        justificacion,
        detalles,
      } satisfies CreateReabastecimientoPayload,
    })

    if (response.success === false) {
      throw new Error(response.message || 'No se pudo registrar la solicitud de reabastecimiento.')
    }

    toast.add({
      title: 'Solicitud registrada',
      description: `Se registró la solicitud ${response.data?.id_solicitud_reb ?? ''} con ${response.data?.detalles_registrados ?? detalles.length} detalle(s).`.trim(),
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
  if (detailActionsLocked.value) {
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
  if (detailActionsLocked.value) {
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
  if (detailActionsLocked.value) {
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
  if (detailActionsLocked.value) {
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
  if (detailActionsLocked.value) {
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
  if (detailActionsLocked.value) {
    return
  }

  if (!currentDetailRequestId.value) {
    return
  }

  const confirmation = window.confirm(`Eliminar el seguimiento ${item.id_flujo_reb}?`)
  if (!confirmation) {
    return
  }

  detailTrackingDeletingId.value = item.id_log_reb

  try {
    const response = await $fetch<{ success: boolean; data: null | { id_log_reb: number }; message: string }>(
      `${config.public.apiBaseUrl}/api/reabastecimiento/seguimiento/${item.id_log_reb}`,
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
  resetDetailFilesUploadState()
  cancelRemoveDetailFile()
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
            Seguimiento de solicitudes, aprobaciones y trazabilidad del pedido.
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
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Justificacion</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha de Creacion</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr v-if="requestLoading">
                <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Cargando solicitudes de reabastecimiento...
                </td>
              </tr>

              <tr v-else-if="requestError">
                <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
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
                        color="primary"
                        variant="soft"
                        icon="i-lucide-history"
                        class="rounded-full bg-[#eef4ff] text-[#2d5fc0] hover:bg-[#dfe9ff]"
                        size="xs"
                        aria-label="Historial"
                        title="Historial"
                        @click.stop="openRequestDetail(item)"
                      />
                    </div>
                  </td>
                </tr>

                <tr v-if="!visibleRequests.length">
                  <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
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

            <UCard class="min-w-0 h-full overflow-hidden border-gray-200/70 bg-white/90 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/90" :ui="{ body: 'flex h-full min-h-0 flex-col p-0' }">
              <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Solicitud de Productos
                </p>
                <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                  Detalle del pedido
                </h3>
              </div>

              <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
                <div class="space-y-2">
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

                <div class="h-[260px] overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
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

                <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60">
                  <div class="mb-4 flex items-center gap-2">
                    <UIcon name="i-lucide-paperclip" class="h-4 w-4 text-[#2d5fc0]" />
                    <h4 class="text-sm font-semibold text-gray-950 dark:text-white">
                      Adjuntar Comentarios / Archivos
                    </h4>
                  </div>

                  <div class="max-h-[280px] space-y-4 overflow-y-auto pr-1">
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
                  class="w-full justify-center bg-[#2d5fc0] py-3 font-semibold text-white shadow-[0_12px_26px_rgba(45,95,192,0.18)] hover:bg-[#244ea4]"
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
      class="w-[calc(100vw-1rem)] max-w-[1680px]"
      @close="closeRequestDetail"
      :ui="{
        content: 'h-[96vh] overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'h-[calc(96vh-72px)] overflow-y-auto overflow-x-hidden p-0',
        wrapper: 'items-center justify-center',
      }"
      :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
    >
      <template #title>
        <div class="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
              Detalle de solicitud
            </p>
            <h2 class="mt-1 text-lg font-bold text-gray-950 dark:text-white">
              {{ selectedRequestSummary?.codigo || 'Sin solicitud seleccionada' }}
            </h2>
          </div>

          <UBadge
            v-if="selectedRequestSummary"
            :class="['rounded-full px-3 py-1', requestStateTone(selectedRequestSummary.estado_inventario.descripcion, selectedRequestSummary.estado_inventario.id_estado)]"
          >
            {{ selectedRequestSummary.estado_inventario.descripcion }}
          </UBadge>
        </div>
      </template>

      <template #body>
        <div v-if="selectedRequestSummary" class="space-y-5 bg-white  dark:bg-gray-950">
          


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
          <div class="grid gap-5 lg:grid-cols-2">
            <div class="space-y-5">
              <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div class="border-b border-gray-200 px-5 py-4 text-center dark:border-gray-800">
                <h3 class="text-base font-bold text-gray-950 dark:text-white">
                  Lista de Pedido
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
                        <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Id Detalle</th>
                        <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Descripcion</th>
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
                  class="rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                >
                  Esta solicitud está cerrada. El detalle es de solo lectura.
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
              <div
                v-if="!requestDetailLoading && !requestDetailError"
                class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-paperclip" class="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Archivos adjuntos
                        </p>
                        <p class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                          Historial y Archivos
                        </p>
                      </div>
                    </div>

                    <UButton
                      v-if="!detailActionsLocked"
                      color="primary"
                      icon="i-lucide-paperclip"
                      class="w-fit bg-[#2d5fc0] font-semibold text-white shadow-[0_10px_24px_rgba(45,95,192,0.18)] hover:bg-[#244ea4]"
                      @click="openDetailFilesUpload"
                    >
                      Adjuntar archivo
                    </UButton>
                  </div>
                </div>

                <div class="space-y-4 p-4">
                  <div
                    v-if="detailActionsLocked"
                    class="rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                  >
                    Esta solicitud está cerrada. No se pueden agregar ni eliminar archivos.
                  </div>

                  <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <UInput
                      v-model="detailFilesSearch"
                      icon="i-lucide-search"
                      placeholder="Buscar por archivo, comentario o usuario..."
                      class="w-full lg:flex-1"
                      @keyup.enter="applyDetailFilesSearch"
                    />

                    <UButton color="primary" variant="soft" @click="applyDetailFilesSearch">
                      Buscar
                    </UButton>
                  </div>

                  <div v-if="detailFilesLoading" class="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-gray-400">
                    Cargando archivos adjuntos...
                  </div>

                  <div v-else-if="detailFilesError" class="space-y-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>{{ detailFilesError }}</p>
                    <UButton color="primary" variant="soft" size="xs" @click="() => loadRequestFiles()">
                      Reintentar
                    </UButton>
                  </div>

                  <div v-else class="space-y-4">
                    <div v-if="detailFilesItems.length" class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                      <table class="min-w-full border-separate border-spacing-0">
                        <thead class="bg-[#f4f1ff] text-[#49558f] dark:bg-[#101b31] dark:text-[#d1ddfb]">
                          <tr>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Archivo</th>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Comentario</th>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Usuario</th>
                            <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha</th>
                            <th v-if="!detailActionsLocked" class="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
                          </tr>
                        </thead>

                        <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                          <tr
                            v-for="item in detailFilesItems"
                            :key="item.id_log_reb"
                            class="transition-colors hover:bg-[#f8f7ff] dark:hover:bg-gray-900/60"
                          >
                            <td class="px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">
                              <a
                                :href="item.archivo_url"
                                target="_blank"
                                rel="noreferrer"
                                class="font-semibold text-[#2d5fc0] hover:underline"
                              >
                                {{ item.archivo_nombre_original }}
                              </a>
                            </td>
                            <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                              {{ item.comentario || '-' }}
                            </td>
                            <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                              {{ item.staff?.full_name || item.staff?.username || '-' }}
                            </td>
                            <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                              {{ item.fecha_creacion }}
                            </td>
                            <td v-if="!detailActionsLocked" class="px-4 py-2.5 text-center">
                              <a
                                :href="item.archivo_url"
                                target="_blank"
                                rel="noreferrer"
                                class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#eef4ff] text-[#2d5fc0] transition hover:bg-[#dfe9ff]"
                                aria-label="Abrir archivo"
                                title="Abrir archivo"
                              >
                                <UIcon name="i-lucide-external-link" class="h-4 w-4" />
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div
                      v-else
                      class="rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                    >
                      Aun no hay archivos adjuntos para esta solicitud.
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="!requestDetailLoading && !requestDetailError"
              class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <div class="border-b border-gray-200 px-5 py-4 text-center dark:border-gray-800">
                <h3 class="text-base font-bold text-gray-950 dark:text-white">
                  Seguimiento y Comentarios
                </h3>
              </div>

              <div class="space-y-4 p-4">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-history" class="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p class="text-base font-bold text-gray-950 dark:text-white">
                      Seguimiento y Comentarios
                    </p>
                  </div>

                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Registra comentarios o adjunta archivos sin cambiar el estado desde este formulario.
                  </p>
                </div>

                <div
                  v-if="detailActionsLocked"
                  class="rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                >
                  Esta solicitud está cerrada. El seguimiento es de solo lectura.
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
                  <div v-if="detailTrackingHistory.length" class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                    <table class="min-w-full border-separate border-spacing-0">
                      <thead class="bg-[#f4f1ff] text-[#49558f] dark:bg-[#101b31] dark:text-[#d1ddfb]">
                        <tr>
                          <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Id Flujo</th>
                          <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Responsable</th>
                          <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Comentarios</th>
                          <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Adjuntos</th>
                          <th class="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">Fecha</th>
                        </tr>
                      </thead>

                      <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
                        <tr
                          v-for="item in detailTrackingHistory"
                          :key="item.id_log_reb"
                          class="transition-colors hover:bg-[#f8f7ff] dark:hover:bg-gray-900/60"
                        >
                          <td class="px-4 py-2.5 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                            {{ item.id_flujo_reb }}
                          </td>
                          <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                            {{ item.responsable || item.staff?.full_name || item.staff?.username || '-' }}
                          </td>
                          <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                            {{ item.comentarios || item.comentario || '-' }}
                          </td>
                          <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                            <div class="flex items-center justify-between gap-3">
                              <a
                                v-if="item.archivo_url"
                                :href="item.archivo_url"
                                target="_blank"
                                rel="noreferrer"
                                class="inline-flex items-center gap-1 font-semibold text-[#2d5fc0] hover:underline"
                              >
                                <UIcon name="i-lucide-paperclip" class="h-3.5 w-3.5" />
                                {{ item.archivo_nombre_original || 'Archivo adjunto' }}
                              </a>
                              <span
                                v-else-if="item.archivo || item.archivo_nombre_original"
                                class="font-medium text-gray-700 dark:text-gray-200"
                              >
                                {{ item.archivo_nombre_original || item.archivo || 'Archivo adjunto' }}
                              </span>
                              <span v-else class="text-gray-500 dark:text-gray-400">-</span>

                              
                            </div>
                          </td>
                          <td class="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                            {{ item.fecha_creacion || item.fecha_actualizacion || '-' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div
                    v-else
                    class="rounded-2xl border border-dashed border-gray-300 bg-[#fafbff] px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950/60 dark:text-gray-400"
                  >
                    Aun no hay historial registrado para esta solicitud.
                  </div>

                </template>

                <div
                  v-if="!detailActionsLocked"
                  class="space-y-4 rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-950/60"
                >
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Comentario
                    </label>
                    <UTextarea
                      v-model="detailTrackingComment"
                      :rows="3"
                      placeholder="Escribe un comentario..."
                      class="w-full"
                    />
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Archivo
                    </label>
                    <input
                      ref="detailTrackingFileInput"
                      type="file"
                      class="block w-full rounded-md border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2d5fc0] hover:file:cursor-pointer hover:file:underline dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
                      @change="onDetailTrackingFileChange"
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      Debes agregar un comentario o un archivo para registrar el seguimiento.
                    </p>
                  </div>
                </div>

                <UButton
                  v-if="!detailActionsLocked"
                  color="primary"
                  class="w-full justify-center bg-[#6f5ce8] py-3 font-semibold text-white shadow-[0_10px_24px_rgba(111,92,232,0.16)] hover:bg-[#5c48df]"
                  :loading="detailTrackingSubmitting"
                  :disabled="detailTrackingSubmitting || !canRegisterDetailTracking"
                  @click="registerDetailTracking"
                >
                  Registrar Seguimiento
                </UButton>
              </div>
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

