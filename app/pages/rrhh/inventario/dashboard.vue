<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Dashboard de inventario',
})

type DashboardTab = 'actual' | 'tecnico' | 'predicciones'
type YesNo = 'SI' | 'NO'
type StockCoverageState = 'Reposicion urgente' | 'Reposicion sugerida' | 'Stock saludable' | 'Sin consumo / sin stock'

type DashboardProductRow = {
  idProducto: number
  codigo: string
  producto: string
  categoria: string
  tipo: string
  stock: number
  c15: number
  c1: number
  c2: number
  c3: number
  activo: YesNo
}

type DashboardProductViewRow = DashboardProductRow & {
  q1: number
  q2: number
  q3: number
  q4: number
  pedir: YesNo
  pedFinal: number
  coberturaDias: number | null
  estadoCobertura: StockCoverageState
}

type TechnicianConsumptionRow = {
  idSolicitud: number
  idTecnico: number
  tecnico: string
  fechaConsumo: string
  idProducto: number
  producto: string
  categoria: string
  cantidad: number
}

type ApiResponse<T> = {
  success: boolean
  data: T | null
  message?: string
}

type DashboardApiProductRow = {
  id_producto?: number | string | null
  codigo_producto?: string | null
  descripcion_producto?: string | null
  categoria?: string | null
  tipo?: string | null
  stock_actual?: number | string | null
  consumo_15_dias?: number | string | null
  consumo_1_mes?: number | string | null
  consumo_2_meses?: number | string | null
  consumo_3_meses?: number | string | null
  es_frecuente?: number | string | boolean | null
}

type DashboardConsumptionPayload = {
  id_area_filtro: number
  fecha_desde: string
  fecha_hasta: string
  rows: DashboardApiProductRow[]
}

type TechnicianApiConsumptionRow = {
  id_solicitud?: number | string | null
  id_tecnico?: number | string | null
  tecnico?: string | null
  fecha_consumo?: string | null
  id_producto?: number | string | null
  descripcion_producto?: string | null
  categoria?: string | null
  cantidad_consumida?: number | string | null
}

type TechnicianConsumptionPayload = {
  id_area_filtro: number
  fecha_desde: string
  fecha_hasta: string
  rows: TechnicianApiConsumptionRow[]
}

const toast = useToast()
const colorMode = useColorMode()
const config = useRuntimeConfig()
const authToken = useCookie<string | null>('auth_token', { sameSite: 'lax' })

const mainTabs = [
  { label: 'Vista actual', value: 'actual', icon: 'i-lucide-layout-dashboard' },
  { label: 'Consumo por tecnico', value: 'tecnico', icon: 'i-lucide-user-round-check' },
  { label: 'Predicciones', value: 'predicciones', icon: 'i-lucide-trending-up' },
] satisfies Array<{ label: string, value: DashboardTab, icon: string }>

const todayInput = formatDateInput(new Date())
const activeTab = shallowRef<DashboardTab>('actual')
const fechaHasta = shallowRef(todayInput)
const fechaDesdeConsumo = shallowRef(addDays(todayInput, -90))
const search = shallowRef('')
const categoryFilter = shallowRef('ALL')
const activeFilter = shallowRef<'ALL' | YesNo>('ALL')
const requestFilter = shallowRef<'ALL' | YesNo>('ALL')
const onlyWithConsumption = shallowRef(false)
const selectedProductIds = ref<number[]>([])
const orderQuantities = reactive<Record<number, number>>({})

const tecnicoFilter = shallowRef<number | 'ALL'>('ALL')
const tecnicoProductFilter = shallowRef<number | 'ALL'>('ALL')
const tecnicoCategoryFilter = shallowRef('ALL')
const tecnicoFechaDesde = shallowRef(addDays(todayInput, -90))
const tecnicoFechaHasta = shallowRef(todayInput)

const predFechaDesde = shallowRef(todayInput)
const predFechaHasta = shallowRef(addDays(todayInput, 29))

const dashboardLoading = shallowRef(false)
const dashboardError = shallowRef<string | null>(null)
const technicianLoading = shallowRef(false)
const technicianError = shallowRef<string | null>(null)
const dashboardRows = ref<DashboardProductRow[]>([])
const technicianRows = ref<TechnicianConsumptionRow[]>([])

const loadDashboardConsumption = async () => {
  dashboardLoading.value = true
  dashboardError.value = null

  try {
    const response = await $fetch<ApiResponse<DashboardConsumptionPayload>>(`${config.public.apiBaseUrl}/api/inventario/dashboard/consumo`, {
      method: 'GET',
      headers: apiHeaders(),
      query: {
        fecha_hasta: fechaHasta.value,
      },
    })

    if (!response.success || !response.data || !Array.isArray(response.data.rows)) {
      throw new Error(response.message || 'Respuesta invalida del endpoint de consumo.')
    }

    dashboardRows.value = response.data.rows.map(mapDashboardApiRow)
    fechaDesdeConsumo.value = response.data.fecha_desde || addDays(fechaHasta.value, -90)
  } catch (error) {
    dashboardError.value = apiErrorMessage(error, 'No se pudo cargar el consumo de inventario.')
  } finally {
    dashboardLoading.value = false
  }
}

const loadTechnicianConsumption = async () => {
  technicianLoading.value = true
  technicianError.value = null

  try {
    const response = await $fetch<ApiResponse<TechnicianConsumptionPayload>>(`${config.public.apiBaseUrl}/api/inventario/dashboard/consumo-tecnico`, {
      method: 'GET',
      headers: apiHeaders(),
      query: {
        fecha_desde: tecnicoFechaDesde.value,
        fecha_hasta: tecnicoFechaHasta.value,
      },
    })

    if (!response.success || !response.data || !Array.isArray(response.data.rows)) {
      throw new Error(response.message || 'Respuesta invalida del endpoint de consumo por tecnico.')
    }

    technicianRows.value = response.data.rows.map(mapTechnicianApiRow)
  } catch (error) {
    technicianError.value = apiErrorMessage(error, 'No se pudo cargar el consumo por tecnico.')
  } finally {
    technicianLoading.value = false
  }
}

const loadDashboardData = async () => {
  await Promise.all([
    loadDashboardConsumption(),
    loadTechnicianConsumption(),
  ])
}

const categoryItems = computed(() => [
  { label: 'Todas las categorias', value: 'ALL' },
  ...Array.from(new Set(dashboardRows.value.map(row => row.categoria)))
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
    .map(category => ({ label: category, value: category })),
])

const yesNoItems = [
  { label: 'Todos', value: 'ALL' },
  { label: 'SI', value: 'SI' },
  { label: 'NO', value: 'NO' },
]

const tableRows = computed<DashboardProductViewRow[]>(() => (
  dashboardRows.value.map((row) => {
    const q1 = round(row.c3 / 6, 1)
    const q2 = round(row.c2 / 4, 1)
    const q3 = round(row.c1 / 2, 1)
    const q4 = round(row.c15, 1)
    const pedFinal = Math.max(Math.ceil(q3 - row.stock), 0)
    const coberturaDias = row.c3 > 0 ? row.stock / (row.c3 / 90) : null

    return {
      ...row,
      q1,
      q2,
      q3,
      q4,
      pedir: pedFinal > 0 ? 'SI' : 'NO',
      pedFinal,
      coberturaDias,
      estadoCobertura: coverageState(row.stock, row.c3, coberturaDias),
    }
  })
))

const filteredTableRows = computed(() => {
  const query = normalize(search.value)

  return tableRows.value.filter((row) => {
    const haystack = normalize([
      row.codigo,
      row.producto,
      row.categoria,
      row.tipo,
      row.activo,
      row.pedir,
    ].join(' '))

    if (query && !haystack.includes(query)) return false
    if (categoryFilter.value !== 'ALL' && row.categoria !== categoryFilter.value) return false
    if (activeFilter.value !== 'ALL' && row.activo !== activeFilter.value) return false
    if (requestFilter.value !== 'ALL' && row.pedir !== requestFilter.value) return false
    if (onlyWithConsumption.value && row.c3 <= 0) return false

    return true
  })
})

const periodoLabels = ['15 dias', '1 mes', '2 meses', '3 meses']
const periodoValues = computed(() => [
  sum(filteredTableRows.value, 'c15'),
  sum(filteredTableRows.value, 'c1'),
  sum(filteredTableRows.value, 'c2'),
  sum(filteredTableRows.value, 'c3'),
])

const dashboardSummary = computed(() => {
  const rows = filteredTableRows.value
  const stockTotal = sum(rows, 'stock')
  const consumo3 = sum(rows, 'c3')
  const promedioDiario = consumo3 > 0 ? consumo3 / 90 : 0

  return {
    totalProductos: rows.length,
    stockTotal,
    consumo15: sum(rows, 'c15'),
    consumo1: sum(rows, 'c1'),
    consumo2: sum(rows, 'c2'),
    consumo3,
    productosConMovimiento: rows.filter(row => row.c3 > 0).length,
    productosSinStock: rows.filter(row => row.stock <= 0).length,
    coberturaGlobal: promedioDiario > 0 ? stockTotal / promedioDiario : null,
    pedidoSugeridoTotal: rows.reduce((total, row) => total + row.pedFinal, 0),
  }
})

const kpis = computed(() => [
  { label: 'Productos', value: formatInt(dashboardSummary.value.totalProductos), sub: 'Catalogo filtrado', icon: 'i-lucide-boxes', tone: 'text-[#2d5fc0] bg-[#eef4ff] ring-[#cbdcff]' },
  { label: 'Stock total', value: formatInt(dashboardSummary.value.stockTotal), sub: 'Unidades disponibles', icon: 'i-lucide-package-check', tone: 'text-[#1f8a4c] bg-[#e9f8ef] ring-[#bfe9cf]' },
  { label: 'Consumo 15 dias', value: formatInt(dashboardSummary.value.consumo15), sub: 'Unidades entregadas', icon: 'i-lucide-calendar-days', tone: 'text-[#9a5a00] bg-[#fff6db] ring-[#f5d77f]' },
  { label: 'Consumo 1 mes', value: formatInt(dashboardSummary.value.consumo1), sub: 'Unidades entregadas', icon: 'i-lucide-activity', tone: 'text-[#2d5fc0] bg-[#eef4ff] ring-[#cbdcff]' },
  { label: 'Consumo 2 meses', value: formatInt(dashboardSummary.value.consumo2), sub: 'Unidades entregadas', icon: 'i-lucide-chart-column', tone: 'text-[#0f766e] bg-[#e6f7f5] ring-[#b9e7e1]' },
  { label: 'Consumo 3 meses', value: formatInt(dashboardSummary.value.consumo3), sub: 'Unidades entregadas', icon: 'i-lucide-trending-up', tone: 'text-[#b42318] bg-[#fff0ee] ring-[#ffc9c2]' },
  { label: 'Con movimiento', value: formatInt(dashboardSummary.value.productosConMovimiento), sub: `${formatInt(dashboardSummary.value.productosSinStock)} productos sin stock`, icon: 'i-lucide-refresh-cw', tone: 'text-[#5f3dc4] bg-[#f1edff] ring-[#d4c8ff]' },
  { label: 'Cobertura global', value: formatDays(dashboardSummary.value.coberturaGlobal), sub: 'Stock / promedio diario 3M', icon: 'i-lucide-shield-check', tone: 'text-[#1f8a4c] bg-[#e9f8ef] ring-[#bfe9cf]' },
])

const categoriesAgg = computed(() => {
  const map = new Map<string, number>()

  for (const row of filteredTableRows.value) {
    map.set(row.categoria, (map.get(row.categoria) ?? 0) + row.c3)
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }))
})

const coverageAgg = computed(() => {
  const base: Record<StockCoverageState, number> = {
    'Reposicion urgente': 0,
    'Reposicion sugerida': 0,
    'Stock saludable': 0,
    'Sin consumo / sin stock': 0,
  }

  for (const row of filteredTableRows.value) {
    base[row.estadoCobertura] += 1
  }

  return Object.entries(base).map(([label, value]) => ({ label, value }))
})

const topConsumption = computed(() => (
  [...filteredTableRows.value]
    .filter(row => row.c3 > 0)
    .sort((a, b) => b.c3 - a.c3)
    .slice(0, 8)
))

const stockVsConsumptionTop = computed(() => (
  [...filteredTableRows.value]
    .sort((a, b) => b.c3 - a.c3)
    .slice(0, 10)
))

const selectedRows = computed(() => (
  filteredTableRows.value.filter(row => selectedProductIds.value.includes(row.idProducto))
))

const suggestedRows = computed(() => (
  filteredTableRows.value.filter(row => row.pedFinal > 0)
))

const tecnicoItems = computed(() => [
  { label: 'Todos los tecnicos', value: 'ALL' },
  ...Array.from(new Map(technicianRows.value.map(row => [row.idTecnico, row.tecnico])).entries())
    .sort((a, b) => a[1].localeCompare(b[1], 'es', { sensitivity: 'base' }))
    .map(([id, name]) => ({ label: name, value: id })),
])

const tecnicoProductItems = computed(() => [
  { label: 'Todos los productos', value: 'ALL' },
  ...Array.from(new Map(technicianRows.value.map(row => [row.idProducto, row.producto])).entries())
    .sort((a, b) => a[1].localeCompare(b[1], 'es', { sensitivity: 'base' }))
    .map(([id, product]) => ({ label: product, value: id })),
])

const tecnicoCategoryItems = computed(() => [
  { label: 'Todas las categorias', value: 'ALL' },
  ...Array.from(new Set(technicianRows.value.map(row => row.categoria)))
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
    .map(category => ({ label: category, value: category })),
])

const filteredTechnicianRows = computed(() => (
  technicianRows.value.filter((row) => {
    if (tecnicoFilter.value !== 'ALL' && row.idTecnico !== Number(tecnicoFilter.value)) return false
    if (tecnicoProductFilter.value !== 'ALL' && row.idProducto !== Number(tecnicoProductFilter.value)) return false
    if (tecnicoCategoryFilter.value !== 'ALL' && row.categoria !== tecnicoCategoryFilter.value) return false
    if (tecnicoFechaDesde.value && row.fechaConsumo < tecnicoFechaDesde.value) return false
    if (tecnicoFechaHasta.value && row.fechaConsumo > tecnicoFechaHasta.value) return false

    return true
  })
))

const technicianSummary = computed(() => {
  const solicitudes = new Set<number>()
  const productos = new Set<number>()
  const totalUnidades = filteredTechnicianRows.value.reduce((total, row) => {
    solicitudes.add(row.idSolicitud)
    productos.add(row.idProducto)
    return total + row.cantidad
  }, 0)

  return {
    solicitudes: solicitudes.size,
    detalles: filteredTechnicianRows.value.length,
    unidades: totalUnidades,
    productos: productos.size,
  }
})

const technicianRequestRows = computed(() => {
  const map = new Map<number, {
    idSolicitud: number
    tecnico: string
    producto: string
    fechaUltimo: string
    lineas: number
    productos: Set<number>
    unidades: number
  }>()

  for (const row of filteredTechnicianRows.value) {
    const current = map.get(row.idSolicitud) ?? {
      idSolicitud: row.idSolicitud,
      tecnico: row.tecnico,
      producto: '',
      fechaUltimo: row.fechaConsumo,
      lineas: 0,
      productos: new Set<number>(),
      unidades: 0,
    }

    current.lineas += 1
    current.productos.add(row.idProducto)
    current.unidades += row.cantidad
    current.producto = current.producto || row.producto
    current.fechaUltimo = row.fechaConsumo > current.fechaUltimo ? row.fechaConsumo : current.fechaUltimo
    map.set(row.idSolicitud, current)
  }

  return Array.from(map.values())
    .map(row => ({
      ...row,
      productosCount: row.productos.size,
      productoResumen: row.productos.size > 1 ? `${row.producto} +${row.productos.size - 1}` : row.producto,
    }))
    .sort((a, b) => b.unidades - a.unidades)
})

const technicianByDate = computed(() => {
  const map = new Map<string, number>()

  for (const row of filteredTechnicianRows.value) {
    map.set(row.fechaConsumo, (map.get(row.fechaConsumo) ?? 0) + row.cantidad)
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label: formatShortDate(label), value }))
})

const technicianByCategory = computed(() => aggregateTechnician('categoria').slice(0, 8))
const technicianByProduct = computed(() => aggregateTechnician('producto').slice(0, 10))

const predictionDays = computed(() => Math.max(diffDaysInclusive(predFechaDesde.value, predFechaHasta.value), 1))

const predictionRows = computed(() => (
  filteredTableRows.value.map((row) => {
    const previousMonth = Math.max(row.c2 - row.c1, 0)
    const thirdMonth = Math.max(row.c3 - row.c2, 0)
    const monthlyExpected = (row.c1 * 0.6) + (previousMonth * 0.3) + (thirdMonth * 0.1)
    const expected = monthlyExpected * (predictionDays.value / 30)
    const suggested = Math.max(Math.ceil(expected - row.stock), 0)
    const daily = monthlyExpected / 30
    const coverage = daily > 0 ? row.stock / daily : null

    return {
      ...row,
      expected,
      suggested,
      risk: predictionRisk(coverage, expected),
    }
  })
))

const predictionSummary = computed(() => {
  const totalStock = sum(predictionRows.value, 'stock')
  const expected = predictionRows.value.reduce((total, row) => total + row.expected, 0)
  const suggested = predictionRows.value.reduce((total, row) => total + row.suggested, 0)
  const daily = expected > 0 ? expected / predictionDays.value : 0

  return {
    days: predictionDays.value,
    totalStock,
    expected,
    suggested,
    coverage: daily > 0 ? totalStock / daily : null,
  }
})

const predictionRiskAgg = computed(() => {
  const base = {
    'Quiebre <= 15 dias': 0,
    'Riesgo 16-30 dias': 0,
    'Estable > 30 dias': 0,
    'Sin consumo estimado': 0,
  }

  for (const row of predictionRows.value) {
    base[row.risk] += 1
  }

  return Object.entries(base).map(([label, value]) => ({ label, value }))
})

const topPredictionRows = computed(() => (
  [...predictionRows.value]
    .sort((a, b) => b.suggested - a.suggested)
    .slice(0, 10)
))

const baseChartOptions = computed<Partial<ApexOptions>>(() => ({
  chart: {
    toolbar: { show: false },
    background: 'transparent',
    fontFamily: 'inherit',
  },
  theme: {
    mode: colorMode.value === 'dark' ? 'dark' : 'light',
  },
  grid: {
    borderColor: colorMode.value === 'dark' ? '#1f2937' : '#e5e7eb',
    strokeDashArray: 4,
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    theme: colorMode.value === 'dark' ? 'dark' : 'light',
  },
}))

const periodChartSeries = computed(() => [{
  name: 'Unidades',
  data: periodoValues.value,
}])

const periodChartOptions = computed<ApexOptions>(() => ({
  ...baseChartOptions.value,
  chart: { ...baseChartOptions.value.chart, type: 'bar' },
  colors: ['#2d5fc0'],
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: '42%',
    },
  },
  xaxis: {
    categories: periodoLabels,
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
  yaxis: {
    min: 0,
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
}))

const categoryChartSeries = computed(() => categoriesAgg.value.map(item => item.value))
const categoryChartOptions = computed<ApexOptions>(() => donutOptions(
  categoriesAgg.value.map(item => item.label),
  ['#2d5fc0', '#0f8b8d', '#f2cb21', '#e53946', '#67c51f', '#7c3aed', '#f97316', '#64748b'],
))

const coverageChartSeries = computed(() => coverageAgg.value.map(item => item.value))
const coverageChartOptions = computed<ApexOptions>(() => donutOptions(
  coverageAgg.value.map(item => item.label),
  ['#e53946', '#f2cb21', '#67c51f', '#94a3b8'],
))

const stockVsConsumptionSeries = computed(() => [
  { name: 'Stock', data: stockVsConsumptionTop.value.map(row => row.stock) },
  { name: 'Consumo 3M', data: stockVsConsumptionTop.value.map(row => row.c3) },
])

const stockVsConsumptionOptions = computed<ApexOptions>(() => ({
  ...baseChartOptions.value,
  chart: { ...baseChartOptions.value.chart, type: 'bar' },
  colors: ['#0f8b8d', '#2d5fc0'],
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 5,
      barHeight: '64%',
    },
  },
  xaxis: {
    categories: stockVsConsumptionTop.value.map(row => truncate(row.producto, 30)),
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
  yaxis: {
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
  legend: {
    position: 'bottom',
  },
}))

const technicianDateSeries = computed(() => [{
  name: 'Unidades',
  data: technicianByDate.value.map(item => item.value),
}])

const technicianDateOptions = computed<ApexOptions>(() => ({
  ...baseChartOptions.value,
  chart: { ...baseChartOptions.value.chart, type: 'area' },
  colors: ['#0f8b8d'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.28,
      opacityTo: 0.04,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    categories: technicianByDate.value.map(item => item.label),
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
  yaxis: {
    min: 0,
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
}))

const technicianCategorySeries = computed(() => [{
  name: 'Unidades',
  data: technicianByCategory.value.map(item => item.value),
}])

const technicianCategoryOptions = computed<ApexOptions>(() => ({
  ...baseChartOptions.value,
  chart: { ...baseChartOptions.value.chart, type: 'bar' },
  colors: ['#2d5fc0'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '48%',
    },
  },
  xaxis: {
    categories: technicianByCategory.value.map(item => item.label),
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
  yaxis: {
    min: 0,
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
}))

const technicianProductSeries = computed(() => [{
  name: 'Unidades',
  data: technicianByProduct.value.map(item => item.value),
}])

const technicianProductOptions = computed<ApexOptions>(() => ({
  ...baseChartOptions.value,
  chart: { ...baseChartOptions.value.chart, type: 'bar' },
  colors: ['#0f8b8d'],
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 5,
      barHeight: '62%',
    },
  },
  xaxis: {
    categories: technicianByProduct.value.map(item => truncate(item.label, 34)),
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
  yaxis: {
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
}))

const predictionSummarySeries = computed(() => [{
  name: 'Unidades',
  data: [
    round(predictionSummary.value.totalStock, 1),
    round(predictionSummary.value.expected, 1),
    round(predictionSummary.value.suggested, 1),
  ],
}])

const predictionSummaryOptions = computed<ApexOptions>(() => ({
  ...baseChartOptions.value,
  chart: { ...baseChartOptions.value.chart, type: 'bar' },
  colors: ['#2d5fc0'],
  plotOptions: {
    bar: {
      borderRadius: 8,
      distributed: true,
      columnWidth: '44%',
    },
  },
  xaxis: {
    categories: ['Stock disponible', 'Consumo esperado', 'Compra sugerida'],
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
  yaxis: {
    min: 0,
    labels: chartAxisLabelStyle(colorMode.value === 'dark'),
  },
  legend: {
    show: false,
  },
}))

const predictionRiskSeries = computed(() => predictionRiskAgg.value.map(item => item.value))
const predictionRiskOptions = computed<ApexOptions>(() => donutOptions(
  predictionRiskAgg.value.map(item => item.label),
  ['#e53946', '#f2cb21', '#67c51f', '#94a3b8'],
))

onMounted(() => {
  void loadDashboardData()
})

watch(fechaHasta, () => {
  selectedProductIds.value = []
  void loadDashboardConsumption()
})

watch([tecnicoFechaDesde, tecnicoFechaHasta], () => {
  void loadTechnicianConsumption()
})

watch(tableRows, (rows) => {
  for (const row of rows) {
    orderQuantities[row.idProducto] = Math.max(row.pedFinal, orderQuantities[row.idProducto] ?? row.pedFinal)
  }
}, { immediate: true })

watch(filteredTableRows, (rows) => {
  const visibleIds = new Set(rows.map(row => row.idProducto))
  selectedProductIds.value = selectedProductIds.value.filter(id => visibleIds.has(id))
})

const resetFilters = () => {
  search.value = ''
  categoryFilter.value = 'ALL'
  activeFilter.value = 'ALL'
  requestFilter.value = 'ALL'
  onlyWithConsumption.value = false
}

const resetTechnicianFilters = () => {
  tecnicoFilter.value = 'ALL'
  tecnicoProductFilter.value = 'ALL'
  tecnicoCategoryFilter.value = 'ALL'
  tecnicoFechaDesde.value = addDays(todayInput, -90)
  tecnicoFechaHasta.value = todayInput
}

const setPredictionNext30Days = () => {
  predFechaDesde.value = todayInput
  predFechaHasta.value = addDays(todayInput, 29)
}

const applyPrediction = () => {
  toast.add({
    title: 'Prediccion actualizada',
    description: `Rango evaluado: ${predictionSummary.value.days} dias.`,
    color: 'success',
  })
}

const toggleSelectedProduct = (id: number, checked: boolean) => {
  selectedProductIds.value = checked
    ? Array.from(new Set([...selectedProductIds.value, id]))
    : selectedProductIds.value.filter(item => item !== id)
}

const submitSuggested = () => {
  prepareReplenishment(suggestedRows.value)
}

const submitSelected = () => {
  prepareReplenishment(selectedRows.value)
}

const submitSingle = (row: DashboardProductViewRow) => {
  prepareReplenishment([row])
}

const prepareReplenishment = (rows: DashboardProductViewRow[]) => {
  const products = rows
    .map(row => ({
      id: row.idProducto,
      descripcion: row.producto,
      stock: row.stock,
      cantidad: Math.max(Number(orderQuantities[row.idProducto]) || row.pedFinal, 0),
    }))
    .filter(item => item.cantidad > 0)

  if (!products.length) {
    toast.add({
      title: 'Sin productos para solicitar',
      description: 'No hay cantidades mayores a cero con el filtro actual.',
      color: 'warning',
    })
    return
  }

  toast.add({
    title: 'Solicitud preparada',
    description: `${products.length} producto(s) listos para conectar con reabastecimiento.`,
    color: 'success',
  })
}

const exportCurrentTable = () => {
  const headers = ['Codigo', 'Producto', 'Categoria', 'Tipo', 'Stock', '3 meses', '2 meses', '1 mes', '15 dias', 'Activo', 'Pedir', 'Pedido final']
  const rows = filteredTableRows.value.map(row => [
    row.codigo,
    row.producto,
    row.categoria,
    row.tipo,
    row.stock,
    row.c3,
    row.c2,
    row.c1,
    row.c15,
    row.activo,
    row.pedir,
    row.pedFinal,
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `dashboard-inventario-${fechaHasta.value}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function aggregateTechnician(key: 'categoria' | 'producto') {
  const map = new Map<string, number>()

  for (const row of filteredTechnicianRows.value) {
    const label = row[key]
    map.set(label, (map.get(label) ?? 0) + row.cantidad)
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))
}

function coverageState(stock: number, consumo3m: number, coberturaDias: number | null): StockCoverageState {
  if (stock <= 0 && consumo3m > 0) return 'Reposicion urgente'
  if (consumo3m <= 0) return 'Sin consumo / sin stock'
  if (coberturaDias !== null && coberturaDias < 15) return 'Reposicion urgente'
  if (coberturaDias !== null && coberturaDias < 30) return 'Reposicion sugerida'
  return 'Stock saludable'
}

function predictionRisk(coverage: number | null, expected: number) {
  if (expected <= 0 || coverage === null) return 'Sin consumo estimado' as const
  if (coverage <= 15) return 'Quiebre <= 15 dias' as const
  if (coverage <= 30) return 'Riesgo 16-30 dias' as const
  return 'Estable > 30 dias' as const
}

function donutOptions(labels: string[], colors: string[]): ApexOptions {
  return {
    ...baseChartOptions.value,
    chart: { ...baseChartOptions.value.chart, type: 'donut' },
    labels,
    colors,
    stroke: {
      width: 0,
    },
    legend: {
      position: 'bottom',
      fontWeight: 600,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '64%',
        },
      },
    },
  }
}

function chartAxisLabelStyle(isDark: boolean) {
  return {
    style: {
      colors: isDark ? '#9ca3af' : '#64748b',
      fontSize: '12px',
      fontWeight: 600,
    },
  }
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`)
  date.setDate(date.getDate() + days)
  return formatDateInput(date)
}

function diffDaysInclusive(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 30
  }

  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
}

function formatShortDate(value: string) {
  const [, month, day] = value.split('-')
  return `${day}/${month}`
}

function formatDateDisplay(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function formatInt(value: number) {
  return Math.round(Number(value) || 0).toLocaleString('es-PE')
}

function formatDecimal(value: number) {
  return (Number(value) || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function formatDays(value: number | null) {
  return value === null ? 'N/A' : `${formatDecimal(value)} dias`
}

function round(value: number, precision = 0) {
  const multiplier = 10 ** precision
  return Math.round(value * multiplier) / multiplier
}

function sum<T extends Record<string, any>>(rows: T[], key: keyof T) {
  return rows.reduce((total, row) => total + (Number(row[key]) || 0), 0)
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length)}...` : value
}

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function apiHeaders() {
  return {
    Accept: 'application/json',
    ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
  }
}

function mapDashboardApiRow(row: DashboardApiProductRow): DashboardProductRow {
  const idProducto = parseApiInteger(row.id_producto)

  return {
    idProducto,
    codigo: apiText(row.codigo_producto),
    producto: apiText(row.descripcion_producto, `Producto #${idProducto || 'N/A'}`),
    categoria: apiText(row.categoria, 'SIN CATEGORIA'),
    tipo: apiText(row.tipo, '-'),
    stock: parseApiNumber(row.stock_actual),
    c15: parseApiNumber(row.consumo_15_dias),
    c1: parseApiNumber(row.consumo_1_mes),
    c2: parseApiNumber(row.consumo_2_meses),
    c3: parseApiNumber(row.consumo_3_meses),
    activo: toYesNo(row.es_frecuente),
  }
}

function mapTechnicianApiRow(row: TechnicianApiConsumptionRow): TechnicianConsumptionRow {
  const idSolicitud = parseApiInteger(row.id_solicitud)
  const idTecnico = parseApiInteger(row.id_tecnico)
  const idProducto = parseApiInteger(row.id_producto)

  return {
    idSolicitud,
    idTecnico,
    tecnico: apiText(row.tecnico, `Tecnico #${idTecnico || 'N/A'}`),
    fechaConsumo: apiText(row.fecha_consumo),
    idProducto,
    producto: apiText(row.descripcion_producto, `Producto #${idProducto || 'N/A'}`),
    categoria: apiText(row.categoria, 'SIN CATEGORIA'),
    cantidad: parseApiNumber(row.cantidad_consumida),
  }
}

function parseApiNumber(value: unknown) {
  const number = Number(String(value ?? '').replace(/,/g, '').trim())
  return Number.isFinite(number) ? number : 0
}

function parseApiInteger(value: unknown) {
  return Math.trunc(parseApiNumber(value))
}

function apiText(value: unknown, fallback = '') {
  const text = String(value ?? '').trim()
  return text || fallback
}

function toYesNo(value: unknown): YesNo {
  if (typeof value === 'boolean') return value ? 'SI' : 'NO'

  const normalized = String(value ?? '').trim().toUpperCase()
  return ['1', 'SI', 'S', 'TRUE', 'ACTIVO'].includes(normalized) ? 'SI' : 'NO'
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const dataMessage = (error as { data?: { message?: unknown } }).data?.message
    if (typeof dataMessage === 'string' && dataMessage.trim()) return dataMessage

    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }

  return fallback
}

function coverageTone(state: StockCoverageState) {
  if (state === 'Reposicion urgente') return 'bg-[#ffe8e6] text-[#b42318] ring-[#ffc9c2]'
  if (state === 'Reposicion sugerida') return 'bg-[#fff6db] text-[#9a5a00] ring-[#f5d77f]'
  if (state === 'Stock saludable') return 'bg-[#e9f8ef] text-[#1f8a4c] ring-[#bfe9cf]'
  return 'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
}
</script>

<template>
  <div class="space-y-5 p-1">
    <div class="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-gray-800/80 dark:bg-gray-950/90">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 rounded-full border border-[#cbdcff] bg-[#eef4ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#2d5fc0] dark:border-[#29426d] dark:bg-[#13203a] dark:text-[#c9d9ff]">
            <UIcon name="i-lucide-pie-chart" class="h-4 w-4" />
            Inventario
          </div>
          <div>
            <h1 class="text-2xl font-black text-gray-950 dark:text-white">
              Dashboard de Inventario
            </h1>
            <p class="mt-1 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
              Control de consumo, cobertura y sugerencias de reposicion con datos del backend.
            </p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-[minmax(170px,1fr)_auto_auto] sm:items-end">
          <div class="space-y-1">
            <label class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Fecha de corte</label>
            <UInput v-model="fechaHasta" type="date" :max="todayInput" />
          </div>
          <UButton icon="i-lucide-rotate-ccw" variant="soft" class="justify-center" @click="fechaHasta = todayInput">
            Hoy
          </UButton>
          <UButton icon="i-lucide-file-spreadsheet" class="justify-center bg-[#2d5fc0] text-white hover:bg-[#244ea4]" :disabled="dashboardLoading || !filteredTableRows.length" @click="exportCurrentTable">
            Exportar
          </UButton>
        </div>
      </div>

      <div class="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
        <UTabs
          v-model="activeTab"
          :items="mainTabs"
          :content="false"
          size="sm"
        />

        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
          Ventana de consumo: {{ formatDateDisplay(fechaDesdeConsumo) }} - {{ formatDateDisplay(fechaHasta) }}
        </p>
      </div>
    </div>

    <section v-if="activeTab === 'actual'" class="space-y-5">
      <div v-if="dashboardError" class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
        <span>{{ dashboardError }}</span>
        <UButton size="sm" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadDashboardConsumption">
          Reintentar
        </UButton>
      </div>

      <div v-if="dashboardLoading" class="flex items-center gap-2 rounded-xl border border-[#cbdcff] bg-[#eef4ff] p-3 text-sm font-semibold text-[#2d5fc0] dark:border-[#29426d] dark:bg-[#13203a] dark:text-[#c9d9ff]">
        <UIcon name="i-lucide-loader-circle" class="h-4 w-4 animate-spin" />
        Cargando consumo de inventario...
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="kpi in kpis"
          :key="kpi.label"
          class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                {{ kpi.label }}
              </p>
              <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">
                {{ kpi.value }}
              </p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ kpi.sub }}
              </p>
            </div>
            <span :class="['inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1', kpi.tone]">
              <UIcon :name="kpi.icon" class="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="text-base font-bold text-gray-950 dark:text-white">
                Consumo acumulado por periodo
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Valores recalculados con los filtros activos.
              </p>
            </div>
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Corte: {{ formatDateDisplay(fechaHasta) }}
            </span>
          </div>
          <ClientOnly>
            <apexchart type="bar" height="360" :options="periodChartOptions" :series="periodChartSeries" />
          </ClientOnly>
        </UCard>

        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <div class="mb-4">
            <h2 class="text-base font-bold text-gray-950 dark:text-white">
              Top consumo
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Productos con mayor salida acumulada en 3 meses.
            </p>
          </div>

          <div class="max-h-[360px] space-y-3 overflow-auto pr-1">
            <div v-if="!topConsumption.length" class="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No hay consumos registrados.
            </div>
            <div v-for="item in topConsumption" :key="item.idProducto" class="space-y-1.5">
              <div class="flex items-center justify-between gap-3 text-sm">
                <span class="truncate font-semibold text-gray-700 dark:text-gray-200">{{ item.producto }}</span>
                <span class="font-bold text-gray-950 dark:text-white">{{ formatInt(item.c3) }}</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  class="h-full rounded-full bg-[#2d5fc0]"
                  :style="{ width: `${Math.max((item.c3 / Math.max(topConsumption[0]?.c3 ?? 1, 1)) * 100, 4)}%` }"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">
            Consumo por categoria
          </h2>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Distribucion de salida acumulada.
          </p>
          <ClientOnly>
            <apexchart type="donut" height="300" :options="categoryChartOptions" :series="categoryChartSeries" />
          </ClientOnly>
        </UCard>

        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">
            Estado de cobertura
          </h2>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Stock actual contra consumo de 3 meses.
          </p>
          <ClientOnly>
            <apexchart type="donut" height="300" :options="coverageChartOptions" :series="coverageChartSeries" />
          </ClientOnly>
        </UCard>

        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">
            Top 10 stock vs consumo
          </h2>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Comparativo de productos con mayor movimiento.
          </p>
          <ClientOnly>
            <apexchart type="bar" height="300" :options="stockVsConsumptionOptions" :series="stockVsConsumptionSeries" />
          </ClientOnly>
        </UCard>
      </div>

      <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-0' }">
        <div class="space-y-4 border-b border-gray-200 p-4 dark:border-gray-800">
          <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 class="text-base font-bold text-gray-950 dark:text-white">
                Detalle por producto
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Consumo calculado en ventanas de 15 dias, 1 mes, 2 meses y 3 meses.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton icon="i-lucide-eraser" color="neutral" variant="soft" @click="resetFilters">
                Limpiar filtros
              </UButton>
              <UButton icon="i-lucide-shopping-cart" variant="soft" :disabled="!suggestedRows.length" @click="submitSuggested">
                Solicitar sugeridos
              </UButton>
              <UButton icon="i-lucide-list-checks" class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]" :disabled="!selectedRows.length" @click="submitSelected">
                Seleccionados ({{ selectedRows.length }})
              </UButton>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_220px_150px_150px_auto] xl:items-end">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Buscar codigo, producto o categoria..." />
            <USelect v-model="categoryFilter" :items="categoryItems" />
            <USelect v-model="activeFilter" :items="yesNoItems" />
            <USelect v-model="requestFilter" :items="yesNoItems" />
            <label class="flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 dark:border-gray-800 dark:text-gray-200">
              <input v-model="onlyWithConsumption" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-[#2d5fc0]">
              Solo con consumo 3M
            </label>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-[1480px] mx-auto border-separate border-spacing-0">
            <thead class="sticky top-0 z-10 bg-[#2d5fc0] text-white">
              <tr>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Codigo</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Producto</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Categoria</th>
                <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">Tipo</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Stock</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">3 meses</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">2 meses</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">1 mes</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">15 dias</th>
                <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">Activo</th>
                <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">Pedir</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Q1</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Q2</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Q3</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Q4</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Ped. final</th>
                <!-- <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">Accion</th> -->
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr v-for="row in filteredTableRows" :key="row.idProducto" class="hover:bg-[#f7f9ff] dark:hover:bg-gray-900/70">
                <td class="px-4 py-3 text-sm font-bold text-[#2d5fc0] dark:text-[#9cb7f5]">{{ row.codigo }}</td>
                <td class="max-w-[340px] px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">{{ row.producto }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ row.categoria }}</td>
                <td class="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{{ row.tipo }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-gray-800 dark:text-gray-100">{{ formatInt(row.stock) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{{ formatInt(row.c3) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{{ formatInt(row.c2) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{{ formatInt(row.c1) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{{ formatInt(row.c15) }}</td>
                <td class="px-4 py-3 text-center text-sm">
                  <span :class="['inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1', row.activo === 'SI' ? 'bg-[#e9f8ef] text-[#1f8a4c] ring-[#bfe9cf]' : 'bg-gray-100 text-gray-500 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700']">
                    {{ row.activo }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-sm">
                  <UTooltip :text="row.estadoCobertura">
                    <span :class="['inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1', coverageTone(row.estadoCobertura)]">
                      {{ row.pedir }}
                    </span>
                  </UTooltip>
                </td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{{ formatDecimal(row.q1) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{{ formatDecimal(row.q2) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{{ formatDecimal(row.q3) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{{ formatDecimal(row.q4) }}</td>
                <td class="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">{{ formatInt(row.pedFinal) }}</td>
                <!-- <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-[#2d5fc0]"
                      :disabled="row.pedFinal <= 0"
                      :checked="selectedProductIds.includes(row.idProducto)"
                      @change="toggleSelectedProduct(row.idProducto, ($event.target as HTMLInputElement).checked)"
                    >
                    <UInput
                      v-model.number="orderQuantities[row.idProducto]"
                      type="number"
                      min="0"
                      size="xs"
                      class="w-20"
                      :disabled="row.pedFinal <= 0"
                    />
                    <UButton
                      icon="i-lucide-cart"
                      size="xs"
                      class="bg-[#2d5fc0] text-white hover:bg-[#244ea4]"
                      :disabled="row.pedFinal <= 0"
                      @click="submitSingle(row)"
                    >
                      Solicitar
                    </UButton>
                  </div>
                </td> -->
              </tr>

              <tr v-if="!filteredTableRows.length">
                <td colspan="17" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  {{ dashboardLoading ? 'Cargando productos...' : 'No hay productos para los filtros actuales.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span class="font-semibold text-gray-900 dark:text-white">{{ filteredTableRows.length }}</span> registros visibles
        </div>
      </UCard>
    </section>

    <section v-else-if="activeTab === 'tecnico'" class="space-y-5">
      <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-4' }">
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_160px_160px_auto] xl:items-end">
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Tecnico</label>
            <USelect v-model="tecnicoFilter" :items="tecnicoItems" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Producto</label>
            <USelect v-model="tecnicoProductFilter" :items="tecnicoProductItems" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Categoria</label>
            <USelect v-model="tecnicoCategoryFilter" :items="tecnicoCategoryItems" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Desde</label>
            <UInput v-model="tecnicoFechaDesde" type="date" :max="tecnicoFechaHasta" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Hasta</label>
            <UInput v-model="tecnicoFechaHasta" type="date" :min="tecnicoFechaDesde" :max="todayInput" />
          </div>
          <UButton icon="i-lucide-eraser" color="neutral" variant="soft" @click="resetTechnicianFilters">
            Limpiar
          </UButton>
        </div>
      </UCard>

      <div v-if="technicianError" class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200 sm:flex-row sm:items-center sm:justify-between">
        <span>{{ technicianError }}</span>
        <UButton size="sm" color="error" variant="soft" icon="i-lucide-refresh-cw" @click="loadTechnicianConsumption">
          Reintentar
        </UButton>
      </div>

      <div v-if="technicianLoading" class="flex items-center gap-2 rounded-xl border border-[#cbdcff] bg-[#eef4ff] p-3 text-sm font-semibold text-[#2d5fc0] dark:border-[#29426d] dark:bg-[#13203a] dark:text-[#c9d9ff]">
        <UIcon name="i-lucide-loader-circle" class="h-4 w-4 animate-spin" />
        Cargando consumo por tecnico...
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Solicitudes</p>
          <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ formatInt(technicianSummary.solicitudes) }}</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Solicitudes en el rango</p>
        </div>
        <div class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Detalles</p>
          <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ formatInt(technicianSummary.detalles) }}</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Lineas de consumo</p>
        </div>
        <div class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Unidades</p>
          <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ formatInt(technicianSummary.unidades) }}</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Total consumido</p>
        </div>
        <div class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Productos</p>
          <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ formatInt(technicianSummary.productos) }}</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Productos distintos</p>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">Consumo por fecha</h2>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">Evolucion diaria de unidades consumidas.</p>
          <ClientOnly>
            <apexchart type="area" height="300" :options="technicianDateOptions" :series="technicianDateSeries" />
          </ClientOnly>
        </UCard>

        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">Consumo por categoria</h2>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">Top categorias del filtro seleccionado.</p>
          <ClientOnly>
            <apexchart type="bar" height="300" :options="technicianCategoryOptions" :series="technicianCategorySeries" />
          </ClientOnly>
        </UCard>
      </div>

      <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
        <h2 class="text-base font-bold text-gray-950 dark:text-white">Top productos consumidos</h2>
        <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">Productos con mayor salida en el rango seleccionado.</p>
        <ClientOnly>
          <apexchart type="bar" height="320" :options="technicianProductOptions" :series="technicianProductSeries" />
        </ClientOnly>
      </UCard>

      <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-0' }">
        <div class="border-b border-gray-200 p-4 dark:border-gray-800">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">Detalle de solicitudes del tecnico</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Resumen de solicitudes con cantidad total consumida.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full border-separate border-spacing-0">
            <thead class="bg-[#2d5fc0] text-white">
              <tr>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Solicitud</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Tecnico</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Producto</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Fecha ultimo consumo</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Lineas</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Productos</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Unidades</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr v-for="row in technicianRequestRows" :key="row.idSolicitud" class="hover:bg-[#f7f9ff] dark:hover:bg-gray-900/70">
                <td class="px-4 py-3 text-sm font-bold text-[#2d5fc0] dark:text-[#9cb7f5]">#{{ row.idSolicitud }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{{ row.tecnico }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{{ row.productoResumen }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{{ formatDateDisplay(row.fechaUltimo) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-200">{{ formatInt(row.lineas) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-200">{{ formatInt(row.productosCount) }}</td>
                <td class="px-4 py-3 text-right text-sm font-bold text-gray-950 dark:text-white">{{ formatInt(row.unidades) }}</td>
              </tr>
              <tr v-if="!technicianRequestRows.length">
                <td colspan="7" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  {{ technicianLoading ? 'Cargando solicitudes...' : 'Sin datos para el filtro actual.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </section>

    <section v-else class="space-y-5">
      <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-4' }">
        <div class="grid gap-3 md:grid-cols-[1fr_170px_170px_auto_auto] md:items-end">
          <div>
            <h2 class="text-base font-bold text-gray-950 dark:text-white">
              Predicciones claras
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Estima consumo esperado y riesgo de quiebre usando el consumo historico disponible.
            </p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Desde</label>
            <UInput v-model="predFechaDesde" type="date" :max="predFechaHasta" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Hasta</label>
            <UInput v-model="predFechaHasta" type="date" :min="predFechaDesde" />
          </div>
          <UButton icon="i-lucide-calculator" class="justify-center bg-[#2d5fc0] text-white hover:bg-[#244ea4]" @click="applyPrediction">
            Calcular
          </UButton>
          <UButton icon="i-lucide-calendar-clock" color="neutral" variant="soft" class="justify-center" @click="setPredictionNext30Days">
            Prox. 30 dias
          </UButton>
        </div>
      </UCard>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Rango proyectado</p>
          <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ predictionSummary.days }} dias</p>
        </div>
        <div class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Consumo esperado</p>
          <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ formatDecimal(predictionSummary.expected) }} und</p>
        </div>
        <div class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Cobertura proyectada</p>
          <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ formatDays(predictionSummary.coverage) }}</p>
        </div>
        <div class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Compra sugerida total</p>
          <p class="mt-2 text-2xl font-black text-gray-950 dark:text-white">{{ formatInt(predictionSummary.suggested) }} und</p>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">Stock vs consumo esperado</h2>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">Comparacion global para el rango elegido.</p>
          <ClientOnly>
            <apexchart type="bar" height="320" :options="predictionSummaryOptions" :series="predictionSummarySeries" />
          </ClientOnly>
        </UCard>

        <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-5' }">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">Riesgo proyectado</h2>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">Productos clasificados por riesgo de quiebre.</p>
          <ClientOnly>
            <apexchart type="donut" height="320" :options="predictionRiskOptions" :series="predictionRiskSeries" />
          </ClientOnly>
        </UCard>
      </div>

      <UCard class="border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950" :ui="{ body: 'p-0' }">
        <div class="border-b border-gray-200 p-4 dark:border-gray-800">
          <h2 class="text-base font-bold text-gray-950 dark:text-white">Top productos a reponer</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Productos con mayor compra sugerida segun el rango proyectado.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full border-separate border-spacing-0">
            <thead class="bg-[#2d5fc0] text-white">
              <tr>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Producto</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Stock</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Consumo esperado</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider">Compra sugerida</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr v-for="row in topPredictionRows" :key="row.idProducto" class="hover:bg-[#f7f9ff] dark:hover:bg-gray-900/70">
                <td class="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100">{{ row.producto }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-200">{{ formatDecimal(row.stock) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-200">{{ formatDecimal(row.expected) }}</td>
                <td class="px-4 py-3 text-right text-sm font-bold text-gray-950 dark:text-white">{{ formatInt(row.suggested) }}</td>
              </tr>
              <tr v-if="!topPredictionRows.length">
                <td colspan="4" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Sin datos disponibles.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </section>
  </div>
</template>
