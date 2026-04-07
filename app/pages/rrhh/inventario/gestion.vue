<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'RRHH - Gestion de inventario',
})

type InventoryItem = {
  id: number
  code: string
  description: string
  brand: string
  models: string
  category: string
  type: 'PAR' | 'UNIDAD'
  stock: number
  area: string
}

type ProductOption = {
  label: string
  value: string
  code: string
  category: string
  type: InventoryItem['type']
  area: string
}

const toast = useToast()
const search = ref('')
const createModalOpen = ref(false)
const currentTab = ref('inventario')

const tabItems = [
  {
    label: 'Inventario RRHH',
    value: 'inventario',
  },
]

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

const inventoryItems = ref<InventoryItem[]>([
  { id: 1, code: 'E01', description: 'Guante de Seguridad', brand: '', models: '', category: 'EPP', type: 'PAR', stock: 4, area: 'RR.HH.' },
  { id: 2, code: 'E02', description: 'Tapon de seguridad', brand: '', models: '', category: 'EPP', type: 'PAR', stock: 3, area: 'RR.HH.' },
  { id: 3, code: 'E03', description: 'Lente de Seguridad', brand: '', models: '', category: 'EPP', type: 'UNIDAD', stock: 1, area: 'RR.HH.' },
  { id: 4, code: 'E04', description: 'Respirador de Media Cara 3M', brand: '', models: '', category: 'EPP', type: 'UNIDAD', stock: 3, area: 'RR.HH.' },
  { id: 5, code: 'E05', description: 'Filtro para Particulas 2091', brand: '', models: '', category: 'EPP', type: 'UNIDAD', stock: 0, area: 'RR.HH.' },
  { id: 6, code: 'E06', description: 'Botas de seguridad TALLA 39', brand: '', models: '', category: 'EPP', type: 'PAR', stock: 1, area: 'RR.HH.' },
  { id: 7, code: 'E07', description: 'Bloqueador solar', brand: '', models: '', category: 'EPP', type: 'UNIDAD', stock: 9, area: 'RR.HH.' },
  { id: 8, code: 'E08', description: 'Mascarilla KN95', brand: '', models: '', category: 'EPP', type: 'UNIDAD', stock: 10, area: 'RR.HH.' },
  { id: 9, code: 'E09', description: 'Casco de Seguridad', brand: '', models: '', category: 'EPP', type: 'UNIDAD', stock: 1, area: 'RR.HH.' },
  { id: 10, code: 'E10', description: 'Chaleco reflectivo TALLA XL', brand: '', models: '', category: 'EPP', type: 'UNIDAD', stock: 1, area: 'RR.HH.' },
  { id: 11, code: 'E11', description: 'Cubrepies Quirurgicos', brand: '', models: '', category: 'EPP', type: 'PAR', stock: 11, area: 'RR.HH.' },
  { id: 12, code: 'E12', description: 'Gorro quirurgico', brand: '', models: '', category: 'EPP', type: 'UNIDAD', stock: 50, area: 'RR.HH.' },
  { id: 13, code: 'E13', description: 'Mochila sobre ruedas Stanley FMST514196', brand: '', models: '', category: 'ARTICULOS DE LIMPIEZA', type: 'UNIDAD', stock: 0, area: 'RR.HH.' },
])

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return inventoryItems.value
  }

  return inventoryItems.value.filter((item) => {
    const haystack = [
      item.code,
      item.description,
      item.brand,
      item.models,
      item.category,
      item.type,
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

  inventoryItems.value.unshift({
    id: Math.max(...inventoryItems.value.map(item => item.id), 0) + 1,
    code: product.code,
    description: product.label,
    brand: '',
    models: '',
    category: product.category,
    type: product.type,
    stock,
    area: locationDetail,
  })

  toast.add({
    title: 'Inventario agregado',
    description: 'El nuevo registro se guardo correctamente.',
    color: 'success',
  })

  createModalOpen.value = false
  resetForm()
}

watch(createModalOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

const rowClass = (item: InventoryItem) => {
  if (item.stock <= 3) {
    return 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50/80 dark:hover:bg-rose-950/30'
  }

  if (item.stock <= 10) {
    return 'bg-amber-50/50 dark:bg-amber-950/15 hover:bg-amber-50/80 dark:hover:bg-amber-950/25'
  }

  return 'bg-white dark:bg-gray-950 hover:bg-slate-50/80 dark:hover:bg-gray-900/60'
}

const stockTone = (stock: number) => {
  if (stock <= 3) {
    return 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/25 dark:text-red-200 dark:ring-red-900/40'
  }

  if (stock <= 10) {
    return 'bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-yellow-950/25 dark:text-yellow-200 dark:ring-yellow-900/40'
  }

  return 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/25 dark:text-violet-200 dark:ring-violet-900/40'
}

const stockIcon = (stock: number) => {
  if (stock <= 3) return 'i-lucide-circle-alert'
  if (stock <= 10) return 'i-lucide-triangle-alert'
  return 'i-lucide-arrow-up'
}
</script>

<template>
  <div class="space-y-0">
    <div class="-mb-px ">
      <div class="inventory-tabs">
        <AppTabs
          v-model="currentTab"
          ariaLabel="Inventario"
          size="sm"
          :items="tabItems"
          list-class="w-fit"
        />
      </div>
    </div>

    <UCard class="overflow-hidden border-gray-200/70 bg-white/85 shadow-sm dark:border-gray-800/70 dark:bg-gray-950/85" :ui="{ body: 'p-0' }">
      <div class="grid gap-3 border-b border-gray-200 pl-0 pr-4 py-3 dark:border-gray-800 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
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
            class="min-w-[200px] justify-center whitespace-nowrap border border-[#2d5fc0] bg-gradient-to-r from-[#2d5fc0] to-[#4f76d9] px-5 font-semibold text-white shadow-[0_10px_24px_rgba(45,95,192,0.18)] transition-all hover:from-[#244ea4] hover:to-[#4068d0] active:from-[#1d428d] active:to-[#355bc0] disabled:shadow-none"
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
            class="min-w-[220px] justify-center whitespace-nowrap rounded-lg bg-gradient-to-r from-[#4f76d9] to-[#2d5fc0] px-5 font-semibold shadow-[0_10px_24px_rgba(45,95,192,0.18)] transition-all hover:from-[#4068d0] hover:to-[#244ea4] active:from-[#355bc0] active:to-[#1d428d]"
            @click="createModalOpen = true"
          >
            Nuevo registro de inventario
          </UButton>
        </div>
      </div>

      <div class="overflow-x-auto overflow-y-auto max-h-[68vh]">
        <table class="min-w-full table-fixed border-separate border-spacing-0">
          <thead class="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-[#2d5fc0] to-[#4f76d9] text-white dark:border-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/95">Codigo</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/95">Descripcion</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/95">Marca</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/95">Modelos</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/95">Categoria</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/95">Tipo</th>
              <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white/95">Stock</th>
              <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/95">Area</th>
              <th class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white/95">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              :class="['transition-colors', rowClass(item)]"
            >
              <td class="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{{ item.code }}</td>
              <td class="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">{{ item.description }}</td>
              <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{{ item.brand || '-' }}</td>
              <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{{ item.models || '-' }}</td>
              <td class="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">{{ item.category }}</td>
              <td class="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">{{ item.type }}</td>
              <td class="px-4 py-4 text-center">
                <span :class="['inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1', stockTone(item.stock)]">
                  <UIcon :name="stockIcon(item.stock)" class="h-4 w-4" />
                  {{ item.stock }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">{{ item.area }}</td>
              <td class="px-4 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <UButton
                    color="primary"
                    variant="soft"
                    icon="i-lucide-map-pinned"
                    class="rounded-full"
                    size="sm"
                    aria-label="Tracking"
                    title="Tracking"
                  />

                  <UButton color="warning" variant="soft" icon="i-lucide-pencil" class="rounded-full" size="sm" aria-label="Editar" title="Editar" />
                </div>
              </td>
            </tr>

            <tr v-if="!filteredItems.length">
              <td colspan="9" class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay resultados para el filtro actual
              </td>
            </tr>
          </tbody>
        </table>
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

<style scoped>
.inventory-tabs :deep([role='tablist']) {
  border-bottom-color: #2d5fc0;
}

.inventory-tabs :deep([role='tab']) {
  min-width: 170px;
}

.inventory-tabs :deep([role='tab'][aria-selected='true']) {
  background: linear-gradient(90deg, #2d5fc0 0%, #4f76d9 100%);
  border-color: #2d5fc0;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(45, 95, 192, 0.18);
}

.inventory-tabs :deep([role='tab'][aria-selected='false']) {
  background: #eff5ff;
  border-color: #cddcf8;
  color: #4b6ca8;
}

.inventory-tabs :deep([role='tab'][aria-selected='false']:hover) {
  background: #e3edff;
  color: #32589e;
}

.inventory-tabs :deep([role='tab'] + [role='tab']) {
  margin-left: -1px;
}
</style>
