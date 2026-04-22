<script setup lang="ts">
import {
  getSolicitudProductosRrhh,
  type SolicitudProductoRrhhItem,
} from '~/services/rrhh/solicitudes'
import type { PurchaseWorkflowRecord, PurchaseWorkflowStatus } from '~/types/rrhh/solicitudes-compra'
import PurchaseActionPanel from '~/components/rrhh/inventario/solicitudes/compra/ActionPanel.vue'
import PurchaseProgressStepper from '~/components/rrhh/inventario/solicitudes/compra/ProgressStepper.vue'
import PurchaseRequestSummary from '~/components/rrhh/inventario/solicitudes/compra/RequestSummary.vue'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Solicitudes Compra',
})

type PurchaseQuickFilter =
  | 'all'
  | 'pendiente'
  | 'aprobado_esperando_compra'
  | 'comprado_por_revisar'
  | 'finalizado'

const purchaseLoading = ref(false)
const purchaseError = ref<string | null>(null)
const purchaseRequests = ref<SolicitudProductoRrhhItem[]>([])
const purchaseStaffId = ref('')
const purchaseProductId = ref('')
const purchaseQuickFilter = ref<PurchaseQuickFilter>('all')
const purchaseWorkflowMap = reactive<Record<number, PurchaseWorkflowRecord>>({})
const reimbursementCap = 130

const purchaseActionOpen = ref(false)
const purchaseActionItem = ref<SolicitudProductoRrhhItem | null>(null)
const purchaseActionBusy = shallowRef(false)

const purchaseImagePreviewOpen = ref(false)
const purchaseImagePreviewSrc = ref<string | null>(null)
const purchaseImagePreviewAlt = ref('Imagen del producto')

const purchaseFilePreviewOpen = ref(false)
const purchaseFilePreviewSrc = ref<string | null>(null)
const purchaseFilePreviewName = ref('Archivo')
const purchaseFilePreviewKind = ref<'image' | 'pdf'>('image')

const toast = useToast()

const runPurchaseAction = async (fn: () => void) => {
  if (purchaseActionBusy.value) return
  purchaseActionBusy.value = true
  try {
    await nextTick()
    fn()
  } finally {
    purchaseActionBusy.value = false
  }
}

const parseDate = (value?: string | null) => {
  if (!value) return null
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value?: string | null) => {
  const date = parseDate(value)
  if (!date) return '--'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const formatTime = (value?: string | null) => {
  const date = parseDate(value)
  if (!date) return '--'
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '--'
  return value
}

const getUbicacionLabel = (item?: SolicitudProductoRrhhItem | null) => {
  if (!item) return '--'
  const ubicacion = item.solicitud?.ubicacion
  const normalized = (ubicacion ?? '').trim()
  return normalized || '--'
}

const extractErrorMessage = (cause: unknown) => {
  if (cause && typeof cause === 'object') {
    const candidate = cause as { message?: unknown; data?: { message?: unknown } }
    if (typeof candidate.data?.message === 'string') return candidate.data.message
    if (typeof candidate.message === 'string') return candidate.message
  }
  return 'No se pudo consultar las solicitudes de compra'
}

const getProductImageUrl = (item: SolicitudProductoRrhhItem) => {
  const imageUrl = item.detalle?.url_imagen || item.url_imagen || item.producto?.url_imagen
  if (!imageUrl) return null
  const normalized = imageUrl.trim()
  return normalized || null
}

const getPurchaseFullName = (item: SolicitudProductoRrhhItem) => {
  const fullName = item.staff?.full_name?.trim()
  if (fullName) return fullName
  const fallback = [item.staff?.firstname, item.staff?.lastname].filter(Boolean).join(' ').trim()
  return fallback || '--'
}

const getPurchaseNameLines = (item: SolicitudProductoRrhhItem) => {
  const fullName = getPurchaseFullName(item)
  if (fullName === '--') return ['--', '']

  const parts = fullName.split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return [parts[0] ?? '--', '']

  const pivot = Math.ceil(parts.length / 2)
  return [parts.slice(0, pivot).join(' '), parts.slice(pivot).join(' ')]
}

const workflowStatusMeta: Record<PurchaseWorkflowStatus, { label: string; badgeClass: string; summary: string }> = {
  pendiente: {
    label: 'Nueva solicitud',
    badgeClass: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    summary: 'Pendiente de revision inicial por RRHH.',
  },
  pendiente_gerencia: {
    label: 'Pendiente gerencia',
    badgeClass: 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200',
    summary: 'RRHH aprobo; falta validacion final de gerencia.',
  },
  aprobado_esperando_compra: {
    label: 'Esperando compra',
    badgeClass: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
    summary: 'El trabajador debe comprar y subir su factura.',
  },
  comprado_por_revisar: {
    label: 'Factura por revisar',
    badgeClass: 'bg-orange-100 text-orange-800 ring-1 ring-orange-200',
    summary: 'Factura cargada. Requiere validacion urgente.',
  },
  listo_para_reembolso: {
    label: 'Listo para reembolso',
    badgeClass: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    summary: 'Factura validada, pendiente de pago.',
  },
  finalizado: {
    label: 'Finalizado',
    badgeClass: 'bg-emerald-900 text-emerald-50 ring-1 ring-emerald-700',
    summary: 'Reembolso pagado y proceso cerrado.',
  },
  rechazado: {
    label: 'Rechazado',
    badgeClass: 'bg-red-100 text-red-800 ring-1 ring-red-200',
    summary: 'Solicitud rechazada por RRHH.',
  },
}

const workflowOrder: PurchaseWorkflowStatus[] = [
  'pendiente',
  'pendiente_gerencia',
  'aprobado_esperando_compra',
  'comprado_por_revisar',
  'listo_para_reembolso',
  'finalizado',
]

const workflowSteps = [
  { key: 'rrhh', label: 'Revision RRHH' },
  { key: 'gerencia', label: 'Validacion gerencia' },
  { key: 'factura', label: 'Validacion factura' },
  { key: 'pago', label: 'Cierre de caja' },
] as const

const workflowProgressByStatus: Record<PurchaseWorkflowStatus, number> = {
  pendiente: 10,
  pendiente_gerencia: 30,
  aprobado_esperando_compra: 55,
  comprado_por_revisar: 75,
  listo_para_reembolso: 90,
  finalizado: 100,
  rechazado: 0,
}

const workflowNextActionByStatus: Record<PurchaseWorkflowStatus, string> = {
  pendiente: 'Revisar y decidir (aprobar/rechazar)',
  pendiente_gerencia: 'Validar con gerencia y disparar correo',
  aprobado_esperando_compra: 'Esperar factura del tecnico',
  comprado_por_revisar: 'Revisar comprobante y validar monto',
  listo_para_reembolso: 'Registrar pago y cerrar flujo',
  finalizado: 'Sin accion pendiente',
  rechazado: 'Sin accion (o reabrir solicitud)',
}

const buildApprovalEmailTemplate = (requesterName: string) => `Hola ${requesterName} buenas tardes,
Con respecto a tus botas de seguridad fueron aprobados, favor de tener en cuenta lo siguiente:

- Deben ser botas dielectricas y con puntera de seguridad (solicitar ficha tecnica a la tienda)
- El monto subvencionado es de S/130.00, el cual sera reembolsado con la factura de compra respectiva
- Si el monto de compra es mayor al indicado, el excedente debera ser subvencionado por el trabajador, de igual manera presentando la factura de compra.

Cualquier consulta adicional favor de comentarme.`

const getFileKind = (fileName: string, mimeType: string) => {
  const lowerName = fileName.toLowerCase()
  const lowerType = mimeType.toLowerCase()
  if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) return 'pdf'
  return 'image'
}

const revokeBlobUrl = (url?: string | null) => {
  if (!url || !url.startsWith('blob:') || !import.meta.client) return
  URL.revokeObjectURL(url)
}

const createWorkflowRecord = (item: SolicitudProductoRrhhItem): PurchaseWorkflowRecord => ({
  status: 'pendiente',
  rrhhComment: '',
  rejectionReason: '',
  sendEmail: true,
  emailToRequester: true,
  emailCopyRrhh: false,
  emailCopyCompras: false,
  emailTemplate: buildApprovalEmailTemplate(getPurchaseFullName(item)),
  emailSentAt: null,
  invoiceAmount: null,
  invoiceFileName: null,
  invoiceFileUrl: null,
  invoiceFileKind: null,
  invoiceUploadedAt: null,
  invoiceValidated: false,
  voucherFileName: null,
  voucherFileUrl: null,
  voucherFileKind: null,
  paidAt: null,
})

const ensurePurchaseWorkflowRecord = (item: SolicitudProductoRrhhItem): PurchaseWorkflowRecord => {
  const existing = purchaseWorkflowMap[item.id]
  if (existing) return existing

  const created = createWorkflowRecord(item)
  purchaseWorkflowMap[item.id] = created
  return created
}

const purchaseFilteredRequests = computed(() => {
  if (purchaseQuickFilter.value === 'all') return purchaseRequests.value
  return purchaseRequests.value.filter((item) => ensurePurchaseWorkflowRecord(item).status === purchaseQuickFilter.value)
})

const purchaseQuickFilterItems = computed(() => {
  const countByStatus = {
    pendiente: 0,
    aprobado_esperando_compra: 0,
    comprado_por_revisar: 0,
    finalizado: 0,
  }

  for (const item of purchaseRequests.value) {
    const status = ensurePurchaseWorkflowRecord(item).status
    if (status in countByStatus) {
      countByStatus[status as keyof typeof countByStatus] += 1
    }
  }

  return [
    {
      value: 'all' as const,
      label: 'Todas',
      description: 'Vista completa',
      icon: 'i-lucide-layout-list',
      badgeClass: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
      count: purchaseRequests.value.length,
    },
    {
      value: 'pendiente' as const,
      label: 'Nuevas solicitudes',
      description: 'Pendiente RRHH',
      icon: 'i-lucide-bell-ring',
      badgeClass: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
      count: countByStatus.pendiente,
    },
    {
      value: 'aprobado_esperando_compra' as const,
      label: 'En manos del trabajador',
      description: 'Esperando compra',
      icon: 'i-lucide-user-check',
      badgeClass: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
      count: countByStatus.aprobado_esperando_compra,
    },
    {
      value: 'comprado_por_revisar' as const,
      label: 'Revisar facturas',
      description: 'Urgente',
      icon: 'i-lucide-triangle-alert',
      badgeClass: 'bg-orange-100 text-orange-800 ring-1 ring-orange-200',
      count: countByStatus.comprado_por_revisar,
    },
    {
      value: 'finalizado' as const,
      label: 'Historico / Cerrados',
      description: 'Pagados',
      icon: 'i-lucide-archive',
      badgeClass: 'bg-emerald-900 text-emerald-50 ring-1 ring-emerald-700',
      count: countByStatus.finalizado,
    },
  ]
})

const purchaseDashboardStats = computed(() => {
  let total = 0
  let urgent = 0
  let waitingWorker = 0
  let closed = 0

  for (const item of purchaseRequests.value) {
    total += 1
    const status = ensurePurchaseWorkflowRecord(item).status
    if (status === 'comprado_por_revisar') urgent += 1
    if (status === 'aprobado_esperando_compra') waitingWorker += 1
    if (status === 'finalizado') closed += 1
  }

  return { total, urgent, waitingWorker, closed }
})

const purchaseActionRecord = computed(() => {
  if (!purchaseActionItem.value) return null
  return ensurePurchaseWorkflowRecord(purchaseActionItem.value)
})

const purchaseActionTotals = computed(() => {
  const amount = Number(purchaseActionRecord.value?.invoiceAmount ?? 0)
  const validAmount = Number.isFinite(amount) && amount > 0 ? amount : 0
  const reimbursed = Math.min(validAmount, reimbursementCap)
  const exceeded = Math.max(validAmount - reimbursementCap, 0)
  return { amount: validAmount, reimbursed, exceeded }
})

const purchaseActionProgress = computed(() => {
  if (!purchaseActionRecord.value) return 0
  return workflowProgressByStatus[purchaseActionRecord.value.status] ?? 0
})

const purchaseActionStepperModel = computed(() => {
  const status = purchaseActionRecord.value?.status ?? 'pendiente'
  const steps = workflowSteps.map((step) => ({
    key: step.key,
    label: step.label,
    state: getStepState(status, step.key),
  }))

  const currentIndex = Math.max(0, steps.findIndex((step) => step.state === 'current'))
  const currentLabel = steps[currentIndex]?.label ?? workflowSteps[0].label
  return {
    stepIndex: currentIndex + 1,
    stepCount: steps.length,
    currentLabel,
    steps,
  }
})

const purchaseActionSummaryModel = computed(() => {
  const item = purchaseActionItem.value
  const record = purchaseActionRecord.value

  const productName = item ? String(displayValue(item.producto?.descripcion)) : '--'
  const productCode = item ? String(displayValue(item.producto?.codigo_producto)) : '--'
  const requesterName = item ? getPurchaseFullName(item) : '--'
  const locationLabel = getUbicacionLabel(item)

  const registeredAt = item?.solicitud?.fecha_registro
  const registeredAtLabel = registeredAt
    ? `${formatDate(registeredAt)} ${formatTime(registeredAt)}`
    : '--'

  return {
    id: item?.id ?? 0,
    productName,
    productCode,
    requesterName,
    locationLabel,
    statusLabel: record ? workflowStatusMeta[record.status].label : '--',
    statusBadgeClass: record ? workflowStatusMeta[record.status].badgeClass : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    nextAction: record ? getCurrentActionHint(record.status) : '--',
    progressPercent: purchaseActionProgress.value,
    quantityLabel: item ? String(displayValue(item.detalle?.cantidad_solicitada)) : '--',
    registeredAtLabel,
    observationLabel: item ? String(displayValue(item.detalle?.observacion_atencion)) : '--',
  }
})

const purchaseActionRecordProxy = computed<PurchaseWorkflowRecord>({
  get: () => {
    if (purchaseActionItem.value) return ensurePurchaseWorkflowRecord(purchaseActionItem.value)
    return {
      status: 'pendiente',
      rrhhComment: '',
      rejectionReason: '',
      sendEmail: true,
      emailToRequester: true,
      emailCopyRrhh: false,
      emailCopyCompras: false,
      emailTemplate: '',
      emailSentAt: null,
      invoiceAmount: null,
      invoiceFileName: null,
      invoiceFileUrl: null,
      invoiceFileKind: null,
      invoiceUploadedAt: null,
      invoiceValidated: false,
      voucherFileName: null,
      voucherFileUrl: null,
      voucherFileKind: null,
      paidAt: null,
    }
  },
  set: (value) => {
    if (!purchaseActionItem.value) return
    purchaseWorkflowMap[purchaseActionItem.value.id] = value
  },
})

const getWorkflowStatusMeta = (item: SolicitudProductoRrhhItem) => workflowStatusMeta[ensurePurchaseWorkflowRecord(item).status]
const getWorkflowProgress = (item: SolicitudProductoRrhhItem) => workflowProgressByStatus[ensurePurchaseWorkflowRecord(item).status] ?? 0
const getWorkflowNextAction = (item: SolicitudProductoRrhhItem) => workflowNextActionByStatus[ensurePurchaseWorkflowRecord(item).status] ?? 'Sin accion'
const getCurrentActionHint = (status: PurchaseWorkflowStatus) => workflowNextActionByStatus[status] ?? 'Sin accion'

const getStepState = (status: PurchaseWorkflowStatus, step: 'rrhh' | 'gerencia' | 'factura' | 'pago') => {
  if (status === 'rechazado') return step === 'rrhh' ? 'current' : 'upcoming'

  const index = workflowOrder.indexOf(status)
  if (step === 'rrhh') {
    if (status === 'pendiente') return 'current'
    return 'done'
  }
  if (step === 'gerencia') {
    if (index <= 0) return 'upcoming'
    if (status === 'pendiente_gerencia') return 'current'
    return 'done'
  }
  if (step === 'factura') {
    if (index <= 1) return 'upcoming'
    if (status === 'aprobado_esperando_compra' || status === 'comprado_por_revisar') return 'current'
    return index >= 4 ? 'done' : 'upcoming'
  }
  if (index <= 3) return 'upcoming'
  if (status === 'listo_para_reembolso') return 'current'
  return status === 'finalizado' ? 'done' : 'upcoming'
}

const openPurchaseActionModal = (item: SolicitudProductoRrhhItem) => {
  purchaseActionItem.value = item
  ensurePurchaseWorkflowRecord(item)
  purchaseActionOpen.value = true
}

const closePurchaseActionModal = () => {
  purchaseActionOpen.value = false
  purchaseActionItem.value = null
}

const approveByRrhh = () => {
  if (!purchaseActionRecord.value) return
  purchaseActionRecord.value.status = 'pendiente_gerencia'
  purchaseActionRecord.value.rejectionReason = ''
  toast.add({ title: 'Aprobado por RRHH', color: 'success' })
}

const rejectByRrhh = () => {
  if (!purchaseActionRecord.value) return
  if (!purchaseActionRecord.value.rejectionReason.trim()) {
    toast.add({ title: 'Motivo requerido', description: 'Debes registrar el motivo del rechazo.', color: 'error' })
    return
  }
  purchaseActionRecord.value.status = 'rechazado'
  toast.add({ title: 'Solicitud rechazada', color: 'error' })
}

const validateByGerencia = () => {
  if (!purchaseActionRecord.value) return
  purchaseActionRecord.value.status = 'aprobado_esperando_compra'
  purchaseActionRecord.value.emailSentAt = purchaseActionRecord.value.sendEmail ? new Date().toISOString() : null
  toast.add({ title: 'Validado por gerencia', color: 'success' })
}

const onInvoiceFileSelected = (event: Event) => {
  if (!purchaseActionRecord.value || !import.meta.client) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  revokeBlobUrl(purchaseActionRecord.value.invoiceFileUrl)
  purchaseActionRecord.value.invoiceFileUrl = URL.createObjectURL(file)
  purchaseActionRecord.value.invoiceFileName = file.name
  purchaseActionRecord.value.invoiceFileKind = getFileKind(file.name, file.type)
}

const registerInvoiceFromTechnician = () => {
  if (!purchaseActionRecord.value) return
  if (!purchaseActionRecord.value.invoiceFileUrl || !purchaseActionRecord.value.invoiceAmount || purchaseActionRecord.value.invoiceAmount <= 0) {
    toast.add({
      title: 'Datos incompletos',
      description: 'Debes cargar factura y monto para simular el envio del tecnico.',
      color: 'warning',
    })
    return
  }
  purchaseActionRecord.value.status = 'comprado_por_revisar'
  purchaseActionRecord.value.invoiceUploadedAt = new Date().toISOString()
  toast.add({ title: 'Comprobante recibido', color: 'success' })
}

const validateInvoice = () => {
  if (!purchaseActionRecord.value) return
  if (!purchaseActionRecord.value.invoiceValidated) {
    toast.add({
      title: 'Validacion pendiente',
      description: 'Marca la verificacion de botas dielectricas y puntera de seguridad.',
      color: 'warning',
    })
    return
  }
  purchaseActionRecord.value.status = 'listo_para_reembolso'
  toast.add({ title: 'Factura validada', color: 'success' })
}

const requestInvoiceCorrection = () => {
  if (!purchaseActionRecord.value) return
  purchaseActionRecord.value.status = 'aprobado_esperando_compra'
  purchaseActionRecord.value.invoiceValidated = false
  toast.add({ title: 'Se solicito correccion al tecnico', color: 'info' })
}

const onVoucherFileSelected = (event: Event) => {
  if (!purchaseActionRecord.value || !import.meta.client) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  revokeBlobUrl(purchaseActionRecord.value.voucherFileUrl)
  purchaseActionRecord.value.voucherFileUrl = URL.createObjectURL(file)
  purchaseActionRecord.value.voucherFileName = file.name
  purchaseActionRecord.value.voucherFileKind = getFileKind(file.name, file.type)
}

const markAsPaid = () => {
  if (!purchaseActionRecord.value) return
  purchaseActionRecord.value.status = 'finalizado'
  purchaseActionRecord.value.paidAt = new Date().toISOString()
  toast.add({ title: 'Solicitud finalizada', color: 'success' })
}

const reopenRejectedRequest = () => {
  if (!purchaseActionRecord.value) return
  purchaseActionRecord.value.status = 'pendiente'
  purchaseActionRecord.value.rejectionReason = ''
  toast.add({ title: 'Solicitud reabierta', color: 'info' })
}

const handleApproveByRrhh = () => { void runPurchaseAction(approveByRrhh) }
const handleRejectByRrhh = () => { void runPurchaseAction(rejectByRrhh) }
const handleValidateByGerencia = () => { void runPurchaseAction(validateByGerencia) }
const handleRegisterInvoiceFromTechnician = () => { void runPurchaseAction(registerInvoiceFromTechnician) }
const handleValidateInvoice = () => { void runPurchaseAction(validateInvoice) }
const handleRequestInvoiceCorrection = () => { void runPurchaseAction(requestInvoiceCorrection) }
const handleMarkAsPaid = () => { void runPurchaseAction(markAsPaid) }
const handleReopenRejectedRequest = () => { void runPurchaseAction(reopenRejectedRequest) }

const openPurchaseImagePreview = (item: SolicitudProductoRrhhItem) => {
  const imageUrl = getProductImageUrl(item)
  if (!imageUrl) return
  purchaseImagePreviewSrc.value = imageUrl
  purchaseImagePreviewAlt.value = `Imagen de ${item.producto?.descripcion?.trim() || 'producto'}`
  purchaseImagePreviewOpen.value = true
}

const closePurchaseImagePreview = () => {
  purchaseImagePreviewOpen.value = false
  purchaseImagePreviewSrc.value = null
  purchaseImagePreviewAlt.value = 'Imagen del producto'
}

const openPurchaseFilePreview = (fileUrl: string, fileName: string, fileKind: 'image' | 'pdf') => {
  purchaseFilePreviewSrc.value = fileUrl
  purchaseFilePreviewName.value = fileName
  purchaseFilePreviewKind.value = fileKind
  purchaseFilePreviewOpen.value = true
}

const closePurchaseFilePreview = () => {
  purchaseFilePreviewOpen.value = false
  purchaseFilePreviewSrc.value = null
  purchaseFilePreviewName.value = 'Archivo'
  purchaseFilePreviewKind.value = 'image'
}

const parseNumberFilter = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const loadPurchaseRequests = async () => {
  purchaseLoading.value = true
  purchaseError.value = null

  try {
    const response = await getSolicitudProductosRrhh({
      staff_id: parseNumberFilter(purchaseStaffId.value),
      id_producto: parseNumberFilter(purchaseProductId.value),
    })
    purchaseRequests.value = response.data ?? []
    purchaseRequests.value.forEach((item) => {
      ensurePurchaseWorkflowRecord(item)
    })
  } catch (cause) {
    purchaseRequests.value = []
    purchaseError.value = extractErrorMessage(cause)
  } finally {
    purchaseLoading.value = false
  }
}

const refreshPurchaseRequests = () => {
  void loadPurchaseRequests()
}

const clearPurchaseFilters = () => {
  purchaseStaffId.value = ''
  purchaseProductId.value = ''
  void loadPurchaseRequests()
}

onBeforeUnmount(() => {
  for (const record of Object.values(purchaseWorkflowMap)) {
    revokeBlobUrl(record.invoiceFileUrl)
    revokeBlobUrl(record.voucherFileUrl)
  }
})

onMounted(() => {
  void loadPurchaseRequests()
})
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 px-5 md:flex-row md:items-center">
      <UInput v-model="purchaseStaffId" type="number" placeholder="Filtrar por staff_id" class="w-full md:w-64" />
      <UInput v-model="purchaseProductId" type="number" placeholder="Filtrar por id_producto" class="w-full md:w-64" />

      <div class="flex gap-2">
        <UButton color="primary" class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]" :loading="purchaseLoading" @click="refreshPurchaseRequests">
          Filtrar
        </UButton>
        <UButton color="neutral" variant="soft" @click="clearPurchaseFilters">
          Limpiar
        </UButton>
      </div>
    </div>

    <div class="mx-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Total</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ purchaseDashboardStats.total }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Solicitudes de compra en tablero</p>
      </div>
      <div class="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-900/40 dark:bg-orange-950/30">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-300">Urgente</p>
        <p class="mt-1 text-2xl font-bold text-orange-900 dark:text-orange-200">{{ purchaseDashboardStats.urgent }}</p>
        <p class="text-xs text-orange-700/80 dark:text-orange-300/80">Facturas por revisar</p>
      </div>
      <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/30">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Seguimiento</p>
        <p class="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-200">{{ purchaseDashboardStats.waitingWorker }}</p>
        <p class="text-xs text-blue-700/80 dark:text-blue-300/80">Esperando compra del trabajador</p>
      </div>
      <div class="rounded-2xl border border-emerald-800 bg-emerald-900 p-4 shadow-sm text-emerald-50">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">Cerrados</p>
        <p class="mt-1 text-2xl font-bold">{{ purchaseDashboardStats.closed }}</p>
        <p class="text-xs text-emerald-100/85">Reembolsos finalizados</p>
      </div>
    </div>

    <div class="mx-5 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/35">
      <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <button
          v-for="item in purchaseQuickFilterItems"
          :key="`quick-filter-${item.value}`"
          type="button"
          :class="[
            'group rounded-xl border px-3 py-2 text-left transition',
            purchaseQuickFilter === item.value
              ? 'border-[#2d5fc0] bg-[#eef4ff] ring-2 ring-[#2d5fc0]/20'
              : 'border-gray-200 bg-white hover:border-[#2d5fc0]/40 hover:bg-[#f7f9ff] dark:border-gray-700 dark:bg-gray-900/60',
            item.badgeClass,
          ]"
          @click="purchaseQuickFilter = item.value"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-xs font-semibold">
              <UIcon :name="item.icon" class="h-3.5 w-3.5" />
              <span>{{ item.label }}</span>
            </div>
            <span class="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-slate-700">{{ item.count }}</span>
          </div>
          <p class="mt-1 text-[11px] text-gray-600 dark:text-gray-300">{{ item.description }}</p>
        </button>
      </div>
      <p class="mt-3 text-xs text-gray-600 dark:text-gray-300">
        Vista rapida del flujo: amarillo (nuevas), azul (esperando compra), naranja (revisar facturas, urgente) y verde oscuro (cerrados).
      </p>
    </div>

    <div class="mx-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <div class="max-h-[68vh] overflow-x-auto overflow-y-auto">
        <table class="min-w-[1820px] border-separate border-spacing-0">
          <thead class="bg-[#2d5fc0] text-white">
            <tr>
              <th class="w-[70px] rounded-tl-2xl px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">ID</th>
              <th class="w-[130px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">CODIGO PRODUCTO</th>
              <th class="w-[170px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">PRODUCTO</th>
              <th class="w-[90px] px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">IMAGEN</th>
              <th class="w-[160px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">SOLICITANTE</th>
              <th class="w-[90px] px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">CANTIDAD</th>
              <th class="w-[220px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">ESTADO FLUJO</th>
              <th class="w-[230px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">PROGRESO / SIGUIENTE ACCION</th>
              <th class="w-[150px] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">OBSERVACION ATENCION</th>
              <th class="w-[110px] px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">FECHA REGISTRO</th>
              <th class="w-[130px] rounded-tr-2xl px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider">ACCIONES</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
            <tr v-if="purchaseLoading">
              <td colspan="11" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center justify-center gap-3">
                  <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-[#2d5fc0]" />
                  <span>Cargando productos de RRHH...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="purchaseError">
              <td colspan="11" class="px-3 py-8 text-center text-sm text-red-600 dark:text-red-400">
                <div class="space-y-3">
                  <p class="font-semibold">{{ purchaseError }}</p>
                  <UButton color="primary" variant="soft" class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]" :loading="purchaseLoading" @click="refreshPurchaseRequests">
                    Reintentar
                  </UButton>
                </div>
              </td>
            </tr>

            <tr
              v-for="item in purchaseFilteredRequests"
              v-else
              :key="`purchase-${item.id}`"
              class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
            >
              <td class="px-3 py-3 text-center text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                <p class="mx-auto max-w-[56px] truncate">{{ item.id }}</p>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                <p class="max-w-[118px] truncate">{{ displayValue(item.producto?.codigo_producto) }}</p>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                <p class="max-w-[150px] whitespace-normal break-words">{{ displayValue(item.producto?.descripcion) }}</p>
              </td>
              <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                <div v-if="getProductImageUrl(item)">
                  <button
                    type="button"
                    class="group relative block h-11 w-11 cursor-zoom-in overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-all hover:scale-[1.02] dark:border-gray-700 dark:bg-gray-900"
                    :aria-label="`Ver imagen de ${displayValue(item.producto?.descripcion)}`"
                    @click="openPurchaseImagePreview(item)"
                  >
                    <img
                      :src="getProductImageUrl(item) || ''"
                      :alt="`Imagen de ${displayValue(item.producto?.descripcion)}`"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    >
                    <span class="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex">
                      <UIcon name="i-lucide-zoom-in" class="h-4 w-4" />
                    </span>
                  </button>
                </div>
                <span v-else class="text-xs text-gray-500 dark:text-gray-400">Sin imagen</span>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                <div class="max-w-[150px] leading-5">
                  <p class="truncate">{{ getPurchaseNameLines(item)[0] }}</p>
                  <p v-if="getPurchaseNameLines(item)[1]" class="truncate text-gray-600 dark:text-gray-300">
                    {{ getPurchaseNameLines(item)[1] }}
                  </p>
                </div>
              </td>
              <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                <p class="mx-auto max-w-[70px] truncate">{{ displayValue(item.detalle?.cantidad_solicitada) }}</p>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                <div class="space-y-2">
                  <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', getWorkflowStatusMeta(item).badgeClass]">
                    {{ getWorkflowStatusMeta(item).label }}
                  </span>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ getWorkflowStatusMeta(item).summary }}
                  </p>
                </div>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                <div class="space-y-2 max-w-[220px]">
                  <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div class="h-full rounded-full bg-[#2d5fc0] transition-all" :style="{ width: `${getWorkflowProgress(item)}%` }" />
                  </div>
                  <p class="text-[11px] font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                    {{ getWorkflowProgress(item) }}%
                  </p>
                  <p class="text-[11px] text-gray-600 dark:text-gray-300">
                    {{ getWorkflowNextAction(item) }}
                  </p>
                </div>
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">
                <p class="max-w-[140px] whitespace-normal break-words">{{ displayValue(item.detalle?.observacion_atencion) }}</p>
              </td>
              <td class="px-3 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                <div class="mx-auto max-w-[140px] space-y-1">
                  <p class="truncate">{{ formatDate(item.solicitud?.fecha_registro) }}</p>
                  <span
                    v-if="getUbicacionLabel(item) !== '--'"
                    class="inline-flex items-center justify-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 ring-1 ring-teal-200 dark:bg-teal-950/25 dark:text-teal-200 dark:ring-teal-900/40"
                  >
                    <UIcon name="i-lucide-map-pin" class="h-3.5 w-3.5" />
                    <span class="max-w-[110px] truncate">{{ getUbicacionLabel(item) }}</span>
                  </span>
                </div>
              </td>
              <td class="px-3 py-3 text-center">
                <UButton
                  size="xs"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-workflow"
                  class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                  :aria-label="`Gestionar flujo del item ${item.id}`"
                  @click="openPurchaseActionModal(item)"
                >
                  Gestionar
                </UButton>
              </td>
            </tr>

            <tr v-if="!purchaseLoading && !purchaseError && !purchaseFilteredRequests.length">
              <td colspan="11" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay registros para mostrar con el filtro seleccionado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UModal v-model:open="purchaseImagePreviewOpen" title="Vista previa de imagen">
      <template #content>
        <div class="space-y-3 p-4 sm:p-5">
          <div class="flex min-h-[260px] max-h-[78vh] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
            <img
              v-if="purchaseImagePreviewSrc"
              :src="purchaseImagePreviewSrc"
              :alt="purchaseImagePreviewAlt"
              class="max-h-[74vh] w-auto max-w-full object-contain"
            >
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              No hay imagen para mostrar.
            </p>
          </div>

          <div class="flex justify-end">
            <UButton color="neutral" variant="outline" @click="closePurchaseImagePreview">
              Cerrar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="purchaseFilePreviewOpen" :title="purchaseFilePreviewName">
      <template #content>
        <div class="space-y-3 p-4 sm:p-5">
          <div class="flex min-h-[260px] max-h-[78vh] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
            <img
              v-if="purchaseFilePreviewSrc && purchaseFilePreviewKind === 'image'"
              :src="purchaseFilePreviewSrc"
              :alt="purchaseFilePreviewName"
              class="max-h-[74vh] w-auto max-w-full object-contain"
            >
            <iframe
              v-else-if="purchaseFilePreviewSrc"
              :src="purchaseFilePreviewSrc"
              class="h-[74vh] w-full"
              title="Vista previa PDF"
            />
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              No hay archivo para mostrar.
            </p>
          </div>

          <div class="flex justify-end">
            <UButton color="neutral" variant="outline" @click="closePurchaseFilePreview">
              Cerrar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="purchaseActionOpen" :ui="{ content: 'sm:max-w-6xl' }">
      <template #content>
        <div v-if="purchaseActionItem && purchaseActionRecord" class="space-y-4 p-5 sm:p-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-1">
              <p class="text-lg font-bold text-gray-950 dark:text-white">
                Solicitud #{{ purchaseActionItem.id }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ displayValue(purchaseActionItem.producto?.descripcion) }} · {{ getPurchaseFullName(purchaseActionItem) }}
              </p>
            </div>

            <span :class="['inline-flex rounded-md px-3 py-1 text-[11px] font-bold', workflowStatusMeta[purchaseActionRecord.status].badgeClass]">
              {{ workflowStatusMeta[purchaseActionRecord.status].label }}
            </span>
          </div>

          <PurchaseProgressStepper
            :stepIndex="purchaseActionStepperModel.stepIndex"
            :stepCount="purchaseActionStepperModel.stepCount"
            :currentLabel="purchaseActionStepperModel.currentLabel"
            :steps="purchaseActionStepperModel.steps"
          />

          <div class="grid gap-4 lg:grid-cols-2 lg:items-start">
            <PurchaseRequestSummary :summary="purchaseActionSummaryModel" />

            <PurchaseActionPanel
              v-model="purchaseActionRecordProxy"
              :busy="purchaseActionBusy"
              :nextAction="getCurrentActionHint(purchaseActionRecord.status)"
              :totals="purchaseActionTotals"
              :formatMoney="formatMoney"
              :formatDate="formatDate"
              :formatTime="formatTime"
              :onApproveByRrhh="handleApproveByRrhh"
              :onRejectByRrhh="handleRejectByRrhh"
              :onValidateByGerencia="handleValidateByGerencia"
              :onRegisterInvoiceFromTechnician="handleRegisterInvoiceFromTechnician"
              :onValidateInvoice="handleValidateInvoice"
              :onRequestInvoiceCorrection="handleRequestInvoiceCorrection"
              :onMarkAsPaid="handleMarkAsPaid"
              :onReopenRejectedRequest="handleReopenRejectedRequest"
              :onInvoiceFileSelected="onInvoiceFileSelected"
              :onVoucherFileSelected="onVoucherFileSelected"
              :onPreviewFile="openPurchaseFilePreview"
            />
          </div>

          <div class="flex justify-end">
            <UButton color="neutral" variant="outline" :disabled="purchaseActionBusy" @click="closePurchaseActionModal">
              Cerrar
            </UButton>
          </div>
        </div>
        <div v-else class="p-5">
          <p class="text-sm text-gray-500 dark:text-gray-400">Selecciona un item para gestionar el flujo.</p>
        </div>
      </template>
    </UModal>
  </div>
</template>
