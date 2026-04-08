<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Gestion de inventario',
})

type InventoryItem = {
  idProducto: number | string
  codigo: string
  descripcion: string
  categoria: string
  tipo: string
  stock: number
  estado: string
  area: string
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

type ProductOption = {
  label: string
  value: string
  code: string
  category: string
  type: InventoryItem['tipo']
  area: string
}

const toast = useToast()
const config = useRuntimeConfig()
const authToken = useCookie<string | null>('auth_token', { sameSite: 'lax' })
const search = shallowRef('')
const createModalOpen = shallowRef(false)
const inventoryItems = ref<InventoryItem[]>([])
const inventoryLoading = shallowRef(false)
const inventoryError = shallowRef<string | null>(null)

const productOptions: ProductOption[] = [
  { label: 'Guante de Seguridad', value: 'e01', code: 'E01', category: 'EPP', type: 'PAR', area: 'RR.HH.' },
  { label: 'Tapon de seguridad', value: 'e02', code: 'E02', category: 'EPP', type: 'PAR', area: 'RR.HH.' },
  { label: 'Lente de Seguridad', value: 'e03', code: 'E03', category: 'EPP', type: 'UNIDAD', area: 'RR.HH.' },
  { label: 'Respirador de Media Cara 3M', value: 'e04', code: 'E04', category: 'EPP', type: 'UNIDAD', area: 'RR.HH.' },
  { label: 'CECH_ECO_530 - PULIDOR / DREMELL', value: 'ec530', code: 'CECH_ECO_530', category: 'HERRAMIENTAS', type: 'UNIDAD', area: 'ALMACEN RR.HH.' },
  { label: 'CECH_ECO_529 - CARGADOR MARCA TOTAL', value: 'ec529', code: 'CECH_ECO_529', category: 'HERRAMIENTAS', type: 'UNIDAD', area: 'ALMACEN RR.HH.' },
  { label: 'CECH_ECO_528 - BATERIA MARCA TOTAL', value: 'ec528', code: 'CECH_ECO_528', category: 'HERRAMIENTAS', type: 'UNIDAD', area: 'ALMACEN RR.HH.' },
  { label: 'Mascarilla KN95', value: 'e08', code: 'E08', category: 'EPP', type: 'UNIDAD', area: 'RR.HH.' },
]

const form = reactive({
  product: '',
  stockInitial: '',
  locationDetail: '',
})

const selectedProduct = computed(() => {
  return productOptions.find(product => product.value === form.product) ?? null
})

const productSelectItems = computed(() =>
  productOptions.map(({ label, value }) => ({ label, value }))
)

const loadInventory = async () => {
  inventoryLoading.value = true
  inventoryError.value = null

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

    inventoryItems.value = response.data.map(item => ({
      idProducto: item.id_producto,
      codigo: item.codigo,
      descripcion: item.descripcion,
      categoria: item.categoria,
      tipo: item.tipo,
      stock: Number(item.stock) || 0,
      estado: item.estado,
      area: item.area,
    }))
  } catch (error: any) {
    console.error('Error cargando inventario:', error)
    inventoryItems.value = []
    inventoryError.value = error?.data?.message || error?.message || 'No se pudo consultar el inventario.'
  } finally {
    inventoryLoading.value = false
  }
}

onMounted(() => {
  void loadInventory()
})

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return inventoryItems.value
  }

  return inventoryItems.value.filter((item) => {
    const haystack = [
      item.codigo,
      item.descripcion,
      item.categoria,
      item.tipo,
      item.estado,
      item.area,
      String(item.stock),
    ].join(' ').toLowerCase()

    return haystack.includes(query)
  })
})

const exportExcel = () => {
  toast.add({
    title: 'Exportacion',
    description: 'La exportacion a Excel se puede conectar luego al backend.',
  })
}

const resetForm = () => {
  form.product = ''
  form.stockInitial = ''
  form.locationDetail = ''
}

const submitCreate = () => {
  const product = selectedProduct.value
  const stock = Number(form.stockInitial)
  const locationDetail = form.locationDetail.trim()

  if (!product) {
    toast.add({
      title: 'Producto requerido',
      description: 'Selecciona un producto antes de guardar.',
      color: 'error',
    })
    return
  }

  if (!Number.isFinite(stock) || stock < 0) {
    toast.add({
      title: 'Stock invalido',
      description: 'Ingresa un stock inicial valido.',
      color: 'error',
    })
    return
  }

  if (!locationDetail) {
    toast.add({
      title: 'Ubicacion requerida',
      description: 'Agrega el detalle de ubicacion antes de guardar.',
      color: 'error',
    })
    return
  }

  toast.add({
    title: 'Endpoint pendiente',
    description: 'La lista ya consume /api/inventario. El alta sigue pendiente de conexion.',
    color: 'warning',
  })

  createModalOpen.value = false
  resetForm()
}

watch(createModalOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

const stockTone = (estado: string) => {
  const normalizedState = estado.trim().toUpperCase()

  if (normalizedState === 'SIN STOCK') {
    return 'bg-[#e53946] text-white ring-1 ring-[#f6b7bc]'
  }

  if (normalizedState === 'BAJO') {
    return 'bg-[#f2cb21] text-[#6a4b00] ring-1 ring-[#f7e08a]'
  }

  return 'bg-[#2d5fc0] text-white ring-1 ring-[#b8c9ef]'
}

const stockLabel = (estado: string) => {
  const normalizedState = estado.trim().toUpperCase()

  if (normalizedState === 'SIN STOCK') return 'Critico'
  if (normalizedState === 'BAJO') return 'Bajo'
  return 'Suficiente'
}

const stockMeaning = (estado: string) => {
  const normalizedState = estado.trim().toUpperCase()

  if (normalizedState === 'SIN STOCK') return 'Stock critico: requiere reposicion urgente.'
  if (normalizedState === 'BAJO') return 'Stock bajo: revisar reposicion pronto.'
  return 'Stock suficiente: sin alerta inmediata.'
}

const inventoryActionItems = (item: InventoryItem) => [
  {
    label: 'Ver detalle',
    icon: 'i-lucide-eye',
    onSelect: () => toast.add({
      title: 'Detalle disponible',
      description: `Se abriria el detalle de ${item.codigo}.`,
    }),
  },
  {
    label: 'Historial',
    icon: 'i-lucide-history',
    onSelect: () => toast.add({
      title: 'Historial disponible',
      description: `Se abriria el historial de ${item.codigo}.`,
    }),
  },
  {
    label: 'Ajustar stock',
    icon: 'i-lucide-rotate-ccw',
    onSelect: () => toast.add({
      title: 'Ajuste disponible',
      description: `Se preparo el ajuste de stock para ${item.codigo}.`,
    }),
  },
  {
    label: 'Editar',
    icon: 'i-lucide-edit',
    onSelect: () => onEdit(item.codigo),
  },
]

const onTracking = (codigo: string) => {
  toast.add({
    title: 'Historial',
    description: `Se preparo el historial para ${codigo}.`,
  })
}

const onEdit = (codigo: string) => {
  toast.add({
    title: 'Edicion',
    description: `Se preparo la edicion para ${codigo}.`,
  })
}
</script>

<template>
  <div class="space-y-0">
    <UCard class="overflow-hidden border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85" :ui="{ body: 'p-0' }">
      <div class="space-y-5">
        <div class="space-y-1">
          <h1 class="text-xl font-bold text-gray-950 dark:text-white">
            Gestion de inventario
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Control de stock, registro de items y seguimiento de activos.
          </p>
        </div>

        <div class="grid gap-3 border-b border-gray-200 pb-4 dark:border-gray-800 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div class="flex min-w-0 items-center">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              class="w-full"
              size="md"
              placeholder="Buscar por codigo, descripcion o categoria..."
            />
          </div>

          <div class="flex flex-wrap items-center gap-2 xl:justify-end">
            <UButton
              variant="solid"
              size="md"
              class="min-w-[200px] justify-center whitespace-nowrap border border-[#2d5fc0] bg-[#2d5fc0] px-5 font-semibold text-white shadow-[0_10px_24px_rgba(45,95,192,0.18)] transition-all hover:bg-[#244ea4] active:bg-[#1d428d] disabled:shadow-none"
              @click="exportExcel"
            >
              <template #leading>
                <UIcon name="i-lucide-file-spreadsheet" class="h-4 w-4" />
              </template>
              <span class="tracking-wide">Descargar Excel</span>
            </UButton>

            <UButton
              color="primary"
              icon="i-lucide-plus"
              class="min-w-[220px] justify-center whitespace-nowrap rounded-lg bg-[#2d5fc0] px-5 font-semibold text-white shadow-[0_10px_24px_rgba(45,95,192,0.18)] transition-all hover:bg-[#244ea4] active:bg-[#1d428d]"
              @click="createModalOpen = true"
            >
              Agregar
            </UButton>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <div class="overflow-x-auto overflow-y-auto max-h-[68vh]">
          <table class="min-w-full border-separate border-spacing-0">
            <thead class="sticky top-0 z-10 bg-[#2d5fc0] text-white">
              <tr>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Codigo</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Descripcion</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Categoria</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Tipo</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Stock</th>
                <th class="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Area</th>
                <th class="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr v-if="inventoryLoading">
                <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Cargando inventario...
                </td>
              </tr>

              <tr v-else-if="inventoryError">
                <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div class="space-y-2">
                    <p>{{ inventoryError }}</p>
                    <UButton color="primary" variant="soft" size="xs" @click="loadInventory">
                      Reintentar
                    </UButton>
                  </div>
                </td>
              </tr>

              <template v-else>
                <tr
                  v-for="item in filteredItems"
                  :key="item.idProducto"
                  class="transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60"
                >
                  <td class="px-5 py-3 text-sm font-semibold text-[#2d5fc0] dark:text-[#9cb7f5]">
                    {{ item.codigo }}
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ item.descripcion }}
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ item.categoria }}
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ item.tipo }}
                  </td>
                  <td class="px-5 py-3 text-center">
                    <UTooltip :text="stockMeaning(item.estado)">
                      <span :class="['inline-flex min-w-24 items-center justify-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold', stockTone(item.estado)]">
                        <span class="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                        {{ stockLabel(item.estado) }} | {{ item.stock }}
                      </span>
                    </UTooltip>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ item.area }}
                  </td>
                  <td class="px-5 py-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <UTooltip text="Ver historial">
                        <UButton
                          color="primary"
                          variant="soft"
                          icon="i-lucide-history"
                          class="rounded-full bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#cbdcff] hover:bg-[#dfe9ff]"
                          size="xs"
                          aria-label="Historial"
                          title="Historial"
                          @click="onTracking(item.codigo)"
                        />
                      </UTooltip>

                      <UTooltip text="Mas acciones">
                        <UDropdownMenu :items="inventoryActionItems(item)" :content="{ align: 'end' }">
                          <UButton
                            color="warning"
                            variant="soft"
                            icon="i-lucide-ellipsis-vertical"
                            class="rounded-full bg-[#fff4d6] text-[#a16207] ring-1 ring-[#f7d27a] hover:bg-[#ffecb2]"
                            size="xs"
                            aria-label="Acciones"
                            title="Acciones"
                          />
                        </UDropdownMenu>
                      </UTooltip>
                    </div>
                  </td>
                </tr>

                <tr v-if="!filteredItems.length">
                  <td colspan="7" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No hay resultados para el filtro actual
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <div class="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ filteredItems.length }}</span> registros
        </p>
      </div>
    </UCard>
  </div>

  <UModal
    v-model:open="createModalOpen"
    class="w-full max-w-2xl"
    :ui="{
      header: 'relative flex items-stretch p-0 min-h-0',
      wrapper: 'flex-1 min-w-0 w-full',
      title: 'w-full p-0',
      body: 'p-0',
    }"
    :close="{ color: 'neutral', variant: 'ghost', class: 'rounded-full' }"
  >
    <template #title>
      <div class="flex w-full items-center gap-3 px-6 py-4 text-gray-900 dark:text-gray-100">
        <div class="flex items-center gap-3">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2d5fc0] ring-1 ring-[#c9d9ff] dark:bg-[#13203a] dark:text-[#9cb7f5] dark:ring-[#29406f]">
            <UIcon name="i-lucide-circle-plus" class="h-5 w-5" />
          </span>
          <div class="leading-tight">
            <p class="text-sm font-semibold tracking-wide">Registrar Inventario</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Alta de producto, stock y ubicacion</p>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="bg-white px-5 py-5 dark:bg-gray-950">
        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
            <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Producto</label>
            <USelectMenu
              v-model="form.product"
              :items="productSelectItems"
              value-key="value"
              label-key="label"
              placeholder="Escoger Producto"
              class="w-full"
            />
          </div>

          <div class="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
            <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Stock Inicial</label>
            <UInput
              v-model="form.stockInitial"
              type="number"
              min="0"
              placeholder="0"
              class="w-full"
            />
          </div>

          <div class="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)] md:items-center">
            <label class="text-sm font-semibold text-gray-600 dark:text-gray-300">Detalle de Ubicacion</label>
            <UInput
              v-model="form.locationDetail"
              placeholder="Ej: Almacen RR.HH. / Estante A-02"
              class="w-full"
            />
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
          <UButton color="neutral" variant="soft" class="px-5" @click="createModalOpen = false">
            Cerrar
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-save"
            class="bg-gradient-to-r from-[#2d5fc0] to-[#7b5cc8] px-5 font-semibold shadow-[0_10px_24px_rgba(45,95,192,0.18)] hover:from-[#244ea4] hover:to-[#674bb8]"
            @click="submitCreate"
          >
            Registrar Inventario
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
