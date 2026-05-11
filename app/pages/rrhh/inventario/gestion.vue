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

const toast = useToast()
const config = useRuntimeConfig()
const authToken = useCookie<string | null>('auth_token', { sameSite: 'lax' })
const search = shallowRef('')
const inventoryItems = ref<InventoryItem[]>([])
const inventoryLoading = shallowRef(false)
const inventoryError = shallowRef<string | null>(null)

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
                
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
              <tr v-if="inventoryLoading">
                <td colspan="6" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Cargando inventario...
                </td>
              </tr>

              <tr v-else-if="inventoryError">
                <td colspan="6" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
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
                 
                </tr>

                <tr v-if="!filteredItems.length">
                  <td colspan="6" class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
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
</template>
