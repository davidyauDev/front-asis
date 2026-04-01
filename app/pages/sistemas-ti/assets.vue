<script setup lang="ts">
import { useAssets } from '~/composables/sistemas-ti/useAssets'
import type {
  CreateSystemAssetPayload,
  SystemAsset,
  SystemAssetStatus,
} from '~/services/sistemas-ti/assets'

definePageMeta({
  layout: 'sistemas-ti',
  middleware: 'auth',
})

useHead({
  title: 'Sistemas TI - Activos',
})

const toast = useToast()

const {
  assignAsset,
  changeStatus,
  createAsset,
  error,
  filteredAssets,
  getStatusColor,
  getStatusLabel,
  getTypeLabel,
  loading,
  refresh,
  resetFilters,
  search,
  stats,
  statusFilter,
  statusFilterItems,
  statusOptions,
  typeFilter,
  typeFilterItems,
  typeOptions,
} = useAssets()

const createModalOpen = ref(false)
const creating = ref(false)
const updatingAssetId = ref<number | null>(null)

const assigneeDrafts = reactive<Record<number, string>>({})
const statusDrafts = reactive<Record<number, SystemAssetStatus>>({})

const form = reactive<CreateSystemAssetPayload>({
  name: '',
  type: 'LAPTOP',
  brand: '',
  model: '',
  serial: '',
  location: '',
  purchaseDate: '',
  warrantyEndDate: '',
})

const canCreate = computed(() => {
  return [
    form.name,
    form.brand,
    form.model,
    form.serial,
    form.location,
    form.purchaseDate,
    form.warrantyEndDate,
  ].every(value => value.trim().length > 0)
})

const syncDrafts = (assets: SystemAsset[]) => {
  for (const asset of assets) {
    if (assigneeDrafts[asset.id] === undefined) {
      assigneeDrafts[asset.id] = asset.assignedTo ?? ''
    }

    statusDrafts[asset.id] = asset.status
  }
}

watch(filteredAssets, (value) => {
  syncDrafts(value)
}, { immediate: true })

const resetCreateForm = () => {
  form.name = ''
  form.type = 'LAPTOP'
  form.brand = ''
  form.model = ''
  form.serial = ''
  form.location = ''
  form.purchaseDate = ''
  form.warrantyEndDate = ''
}

const submitCreate = async () => {
  if (!canCreate.value || creating.value) {
    return
  }

  creating.value = true

  try {
    await createAsset({
      name: form.name,
      type: form.type,
      brand: form.brand,
      model: form.model,
      serial: form.serial,
      location: form.location,
      purchaseDate: form.purchaseDate,
      warrantyEndDate: form.warrantyEndDate,
    })

    toast.add({
      title: 'Activo creado',
      description: 'El activo se registro correctamente.',
      color: 'success',
    })

    createModalOpen.value = false
    resetCreateForm()
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo crear el activo.',
      color: 'error',
    })
  } finally {
    creating.value = false
  }
}

const saveAssignee = async (asset: SystemAsset) => {
  if (updatingAssetId.value !== null) {
    return
  }

  updatingAssetId.value = asset.id

  try {
    await assignAsset(asset.id, assigneeDrafts[asset.id] ?? null)
    toast.add({
      title: 'Asignacion actualizada',
      description: `${asset.code} actualizado.`,
      color: 'success',
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo actualizar la asignacion.',
      color: 'error',
    })
  } finally {
    updatingAssetId.value = null
  }
}

const saveStatus = async (asset: SystemAsset) => {
  if (updatingAssetId.value !== null) {
    return
  }

  updatingAssetId.value = asset.id

  try {
    await changeStatus(asset.id, statusDrafts[asset.id] ?? asset.status)
    toast.add({
      title: 'Estado actualizado',
      description: `${asset.code} actualizado.`,
      color: 'success',
    })
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'No se pudo actualizar el estado.',
      color: 'error',
    })
  } finally {
    updatingAssetId.value = null
  }
}

onMounted(async () => {
  await refresh()
})
</script>

<template>
  <UDashboardPanel id="sistemas-ti-assets">
    <template #header>
      <AppDashboardHeader
        title="Matriz de Activos TI"
        mobile-title="Activos TI"
        subtitle="Inventario de hardware, software y accesorios"
        subtitle-icon="i-lucide-hard-drive"
        icon="i-lucide-boxes"
        :notification-count="stats.warrantyExpiring"
        notification-tooltip="Garantias por vencer en 90 dias"
      >
        <template #right>
          <UButton color="primary" icon="i-lucide-plus" @click="createModalOpen = true">
            Nuevo activo
          </UButton>
        </template>
      </AppDashboardHeader>
    </template>

    <template #body>
      <div class="space-y-5">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Total
            </p>
            <p class="mt-2 text-2xl font-black text-gray-900 dark:text-gray-100">{{ stats.total }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Disponibles
            </p>
            <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-300">{{ stats.available }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Asignados
            </p>
            <p class="mt-2 text-2xl font-black text-cyan-700 dark:text-cyan-300">{{ stats.assigned }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Mantenimiento
            </p>
            <p class="mt-2 text-2xl font-black text-amber-700 dark:text-amber-300">{{ stats.maintenance }}</p>
          </UCard>
          <UCard class="border-gray-200/70 dark:border-gray-800/70">
            <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Garantia por vencer
            </p>
            <p class="mt-2 text-2xl font-black text-rose-700 dark:text-rose-300">{{ stats.warrantyExpiring }}</p>
          </UCard>
        </div>

        <UCard class="border-gray-200/70 dark:border-gray-800/70">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_0.5fr_0.5fr_auto_auto]">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Buscar por codigo, nombre, marca, serie, responsable o ubicacion"
            />

            <USelect v-model="statusFilter" :items="statusFilterItems" placeholder="Estado" />
            <USelect v-model="typeFilter" :items="typeFilterItems" placeholder="Tipo" />

            <UButton
color="neutral"
variant="outline"
icon="i-lucide-eraser"
@click="resetFilters">
              Limpiar
            </UButton>

            <UButton
color="neutral"
variant="outline"
icon="i-lucide-refresh-cw"
:loading="loading"
@click="refresh">
              Actualizar
            </UButton>
          </div>
        </UCard>

        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-alert-triangle"
          title="No se pudieron cargar los activos"
          :description="error"
        />

        <div v-else-if="loading" class="space-y-3">
          <USkeleton class="h-32 rounded-xl" />
          <USkeleton class="h-32 rounded-xl" />
          <USkeleton class="h-32 rounded-xl" />
        </div>

        <div v-else-if="!filteredAssets.length">
          <UCard class="border-dashed border-gray-300/80 text-center dark:border-gray-700">
            <div class="space-y-2 p-2">
              <UIcon name="i-lucide-package-search" class="mx-auto h-8 w-8 text-gray-400" />
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
                No hay activos para los filtros aplicados
              </p>
            </div>
          </UCard>
        </div>

        <div v-else class="space-y-3">
          <UCard
            v-for="asset in filteredAssets"
            :key="asset.id"
            class="border-gray-200/70 dark:border-gray-800/70"
          >
            <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div class="space-y-2 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                    {{ asset.code }}
                  </p>
                  <UBadge color="neutral" variant="subtle" size="sm">
                    {{ getTypeLabel(asset.type) }}
                  </UBadge>
                  <UBadge :color="getStatusColor(asset.status)" variant="soft" size="sm">
                    {{ getStatusLabel(asset.status) }}
                  </UBadge>
                </div>

                <h3 class="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                  {{ asset.name }}
                </h3>

                <p class="text-sm text-gray-600 dark:text-gray-300">
                  {{ asset.brand }} {{ asset.model }} · Serie {{ asset.serial }}
                </p>

                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Ubicacion: {{ asset.location }} · Compra: {{ asset.purchaseDate }} · Garantia: {{ asset.warrantyEndDate }}
                </p>
              </div>

              <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                <div class="flex items-center gap-2">
                  <UInput
                    v-model="assigneeDrafts[asset.id]"
                    placeholder="Asignado a"
                    size="sm"
                  />
                  <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-user-check"
                    :loading="updatingAssetId === asset.id"
                    @click="saveAssignee(asset)"
                  >
                    Asignar
                  </UButton>
                </div>

                <div class="flex items-center gap-2">
                  <USelect
                    v-model="statusDrafts[asset.id]"
                    :items="statusOptions"
                    size="sm"
                  />
                  <UButton
                    size="sm"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-check"
                    :loading="updatingAssetId === asset.id"
                    @click="saveStatus(asset)"
                  >
                    Estado
                  </UButton>
                </div>

                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Ultima actualizacion: {{ new Date(asset.updatedAt).toLocaleString() }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="createModalOpen" title="Nuevo activo TI">
    <template #content>
      <div class="space-y-4 p-4">
        <div class="grid gap-3">
          <UFormGroup label="Nombre" required>
            <UInput v-model="form.name" placeholder="Ej: Laptop Lenovo ThinkPad E14" />
          </UFormGroup>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Tipo" required>
              <USelect v-model="form.type" :items="typeOptions" />
            </UFormGroup>
            <UFormGroup label="Ubicacion" required>
              <UInput v-model="form.location" placeholder="Ej: Sede Central / Almacen TI" />
            </UFormGroup>
          </div>

          <div class="grid gap-3 md:grid-cols-3">
            <UFormGroup label="Marca" required>
              <UInput v-model="form.brand" placeholder="Marca" />
            </UFormGroup>
            <UFormGroup label="Modelo" required>
              <UInput v-model="form.model" placeholder="Modelo" />
            </UFormGroup>
            <UFormGroup label="Serie" required>
              <UInput v-model="form.serial" placeholder="Numero de serie" />
            </UFormGroup>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <UFormGroup label="Fecha de compra" required>
              <UInput v-model="form.purchaseDate" type="date" />
            </UFormGroup>
            <UFormGroup label="Fin de garantia" required>
              <UInput v-model="form.warrantyEndDate" type="date" />
            </UFormGroup>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton
color="neutral"
variant="outline"
:disabled="creating"
@click="createModalOpen = false">
            Cancelar
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-save"
            :loading="creating"
            :disabled="!canCreate"
            @click="submitCreate"
          >
            Guardar activo
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
