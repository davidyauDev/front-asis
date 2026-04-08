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
const requestJustification = shallowRef('')
const showJustification = shallowRef(false)
const attachmentRowSeed = shallowRef(1)
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
  requestDetailData.value = null
  requestDetailError.value = null
  requestDetailLoading.value = true
  detailModalOpen.value = true

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
  } catch (error: any) {
    console.error('Error cargando detalle de solicitud:', error)
    requestDetailError.value = error?.data?.message || error?.message || 'No se pudo consultar el detalle de la solicitud.'
  } finally {
    requestDetailLoading.value = false
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
  selectedRequestSummary.value = null
  requestDetailData.value = null
  requestDetailError.value = null
  requestDetailLoading.value = false
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

watch(createModalOpen, (isOpen) => {
  if (!isOpen) {
    resetRequestForm()
    return
  }

  void loadCatalog()
})

watch(detailModalOpen, (isOpen) => {
  if (!isOpen) {
    selectedRequestSummary.value = null
    requestDetailData.value = null
    requestDetailError.value = null
    requestDetailLoading.value = false
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
      class="max-w-6xl"
      :ui="{
        content: 'overflow-hidden rounded-2xl ring-1 ring-gray-200 dark:ring-gray-800',
        header: 'p-0',
        body: 'p-0',
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
        <div v-if="selectedRequestSummary" class="grid gap-5 bg-white p-5 dark:bg-gray-950 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div class="space-y-5">
            <div class="grid gap-3 md:grid-cols-4">
              <div class="rounded-2xl border border-gray-200 bg-[#eef4ff] p-4 dark:border-gray-800 dark:bg-[#13203a]">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7aa3] dark:text-[#9cb7f5]">Solicitante</p>
                <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">{{ selectedRequestSummary.solicitante }}</p>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-900">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7aa3] dark:text-[#9cb7f5]">Area</p>
                <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">{{ selectedRequestSummary.area }}</p>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-900">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7aa3] dark:text-[#9cb7f5]">Creacion</p>
                <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">{{ selectedRequestSummary.fecha_creacion }}</p>
              </div>
              <div class="rounded-2xl border border-gray-200 bg-[#fbfbff] p-4 dark:border-gray-800 dark:bg-gray-900">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7aa3] dark:text-[#9cb7f5]">Detalles</p>
                <p class="mt-2 text-sm font-semibold text-gray-950 dark:text-white">{{ selectedRequestSummary.detalles_count }}</p>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  Justificacion registrada
                </p>
                <h3 class="mt-1 text-base font-bold text-gray-950 dark:text-white">
                  Motivo de la solicitud
                </h3>
              </div>

              <div class="space-y-3 p-5">
                <div class="rounded-2xl border border-gray-200 bg-[#f9fbff] p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
                  {{ selectedRequestSummary.justificacion || 'Sin justificacion registrada.' }}
                </div>
              </div>
            </div>
          </div>

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
      </template>
    </UModal>
  </div>
</template>
