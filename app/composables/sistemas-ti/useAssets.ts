import {
  assignSystemAsset,
  changeSystemAssetStatus,
  createSystemAsset,
  listSystemAssets,
  systemAssetStatusOptions,
  systemAssetTypeOptions,
  type CreateSystemAssetPayload,
  type SystemAsset,
  type SystemAssetStatus,
  type SystemAssetType,
} from '~/services/sistemas-ti/assets'

type AssetStatusFilter = SystemAssetStatus | 'ALL'
type AssetTypeFilter = SystemAssetType | 'ALL'

export function useAssets() {
  const assets = ref<SystemAsset[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const search = ref('')
  const statusFilter = ref<AssetStatusFilter>('ALL')
  const typeFilter = ref<AssetTypeFilter>('ALL')

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const filteredAssets = computed(() => {
    const query = normalize(search.value)

    return assets.value.filter((asset) => {
      if (statusFilter.value !== 'ALL' && asset.status !== statusFilter.value) {
        return false
      }

      if (typeFilter.value !== 'ALL' && asset.type !== typeFilter.value) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = normalize([
        asset.code,
        asset.name,
        asset.brand,
        asset.model,
        asset.serial,
        asset.assignedTo ?? '',
        asset.location,
      ].join(' '))

      return haystack.includes(query)
    })
  })

  const stats = computed(() => {
    const now = new Date()
    const in90Days = new Date(now)
    in90Days.setDate(in90Days.getDate() + 90)

    return {
      total: assets.value.length,
      available: assets.value.filter(asset => asset.status === 'AVAILABLE').length,
      assigned: assets.value.filter(asset => asset.status === 'ASSIGNED').length,
      maintenance: assets.value.filter(asset => asset.status === 'MAINTENANCE').length,
      warrantyExpiring: assets.value.filter((asset) => {
        const warranty = new Date(asset.warrantyEndDate)
        return warranty >= now && warranty <= in90Days
      }).length,
    }
  })

  const refresh = async () => {
    loading.value = true
    error.value = null

    try {
      assets.value = await listSystemAssets()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar los activos.'
    } finally {
      loading.value = false
    }
  }

  const createAsset = async (payload: CreateSystemAssetPayload) => {
    await createSystemAsset(payload)
    await refresh()
  }

  const changeStatus = async (assetId: number, status: SystemAssetStatus) => {
    await changeSystemAssetStatus(assetId, status)
    await refresh()
  }

  const assignAsset = async (assetId: number, assignedTo: string | null) => {
    await assignSystemAsset(assetId, assignedTo)
    await refresh()
  }

  const resetFilters = () => {
    search.value = ''
    statusFilter.value = 'ALL'
    typeFilter.value = 'ALL'
  }

  const statusLabelMap: Record<SystemAssetStatus, string> = {
    AVAILABLE: 'Disponible',
    ASSIGNED: 'Asignado',
    MAINTENANCE: 'Mantenimiento',
    RETIRED: 'Retirado',
  }

  const statusColorMap: Record<SystemAssetStatus, 'success' | 'primary' | 'warning' | 'neutral'> = {
    AVAILABLE: 'success',
    ASSIGNED: 'primary',
    MAINTENANCE: 'warning',
    RETIRED: 'neutral',
  }

  const typeLabelMap: Record<SystemAssetType, string> = {
    LAPTOP: 'Laptop',
    DESKTOP: 'Desktop',
    MONITOR: 'Monitor',
    PHONE: 'Telefono',
    ACCESSORY: 'Accesorio',
    LICENSE: 'Licencia',
  }

  const getStatusLabel = (status: SystemAssetStatus) => statusLabelMap[status]
  const getStatusColor = (status: SystemAssetStatus) => statusColorMap[status]
  const getTypeLabel = (type: SystemAssetType) => typeLabelMap[type]

  const statusFilterItems = computed(() => [
    { label: 'Todos los estados', value: 'ALL' },
    ...systemAssetStatusOptions,
  ])

  const typeFilterItems = computed(() => [
    { label: 'Todos los tipos', value: 'ALL' },
    ...systemAssetTypeOptions,
  ])

  return {
    assets,
    loading,
    error,
    search,
    statusFilter,
    typeFilter,
    filteredAssets,
    stats,
    refresh,
    createAsset,
    changeStatus,
    assignAsset,
    resetFilters,
    getStatusLabel,
    getStatusColor,
    getTypeLabel,
    statusFilterItems,
    typeFilterItems,
    statusOptions: systemAssetStatusOptions,
    typeOptions: systemAssetTypeOptions,
  }
}

