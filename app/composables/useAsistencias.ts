import type { 
  AsistenciaRecord, 
  AsistenciaCreateRequest, 
  AsistenciaFilters, 
 
  AsistenciaStats,
  TipoEvento,
  TipoRegistro,
  MetodoConexion,
  AttendanceRecord,

  AttendancesResponse,
  
  
} from '~/types'

  const asistencias = ref<AsistenciaRecord[]>([])
  const total = ref(0)
  
// 🏢 Composable para gestionar asistencias (Nueva API)
export const useAsistencias = () => {
  // 📊 Estados reactivos

  const loading = ref(false)
  const error = ref<string | null>(null)
  // const total = ref(0)
  const currentPage = ref(1)
  const perPage = ref(15)
  const stats = ref<AsistenciaStats>({
    total_registros: 0,
    check_ins_hoy: 0,
    check_outs_hoy: 0,
    usuarios_activos: 0,
    sincronizados: 0,
    pendientes: 0
  })

  // 🔍 Estado de filtros
  const filters = ref<AsistenciaFilters>({})

  // 🎯 Opciones para los selects
  const tiposEvento: { label: string; value: TipoEvento; icon: string }[] = [
    { label: 'Inicio de jornada laboral', value: 'Inicio de jornada laboral', icon: 'i-lucide-clock-9' },
    { label: 'Fin de jornada laboral', value: 'Fin de jornada laboral', icon: 'i-lucide-clock-5' }
  ]

  const tiposRegistro: { label: string; value: TipoRegistro; icon: string; color: string }[] = [
    { label: 'Entrada', value: 'check_in', icon: 'i-lucide-log-in', color: 'text-green-600' },
    { label: 'Salida', value: 'check_out', icon: 'i-lucide-log-out', color: 'text-red-600' }
  ]

  const metodosConexion: { label: string; value: MetodoConexion; icon: string; color: string }[] = [
    { label: 'Datos móviles', value: 'MOVIL', icon: 'i-lucide-smartphone', color: 'text-green-600' },
    { label: 'WiFi', value: 'WIFI', icon: 'i-lucide-wifi', color: 'text-blue-600' },
    { label: 'Sin conexión', value: 'SIN_CONEXION', icon: 'i-lucide-wifi-off', color: 'text-red-600' }
  ]

  // ⚡ Función para transformar datos de la nueva API a formato compatible (OPTIMIZADA)
  const transformApiRecord = (data: { data: AttendanceRecord }): AsistenciaRecord => {
    const record = data.data ?? data;
    return {
      ...record,
      tipo_registro: record.type,
      usuario: record.user,
      latitud: record.latitude || 0,
      longitud: record.longitude || 0,
      usuario_id: record.user.id,
      bateria: record.battery_percentage || 100,
      dispositivo: record.device_model || 'Dispositivo desconocido',
      metodo: (record.network_type === 'WiFi' ? 'WIFI' : 'MOVIL') as MetodoConexion,
      sincronizado: 1 as 0 | 1,
      tipo_evento: (record.type === 'check_in' ? 'Inicio de jornada laboral' : 'Fin de jornada laboral') as TipoEvento,
      uuid: record.client_id || crypto.randomUUID(),
      timestamp: record.timestamp
    }
  }

  

  const fetchAsistencias = async (page: number = 1, filters?: AsistenciaFilters) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.value.toString()
      })
      if (filters) {
        if (filters.usuario_id) params.append('user_id', filters.usuario_id.toString())
        if (filters.start_date) params.append('start_date', filters.start_date)
        if (filters.end_date) params.append('end_date', filters.end_date)
        if (filters.type) params.append('type', filters.type)
        if (filters.search) params.append('search', filters.search)
        if (filters.sort_by) params.append('sort_by', filters.sort_by)
        if (filters.sort_order) params.append('sort_order', filters.sort_order)
        if (filters.month) params.append('month', filters.month.toString())
        if (filters.year) params.append('year', filters.year.toString())
      }

      // Obtener token de localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      const config = useRuntimeConfig()
      const apiBaseUrl = config.public.apiBaseUrl 

      const url = `${apiBaseUrl}/api/attendances?${params}`

      const response = await $fetch<AttendancesResponse>(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

   
      // Transformar y actualizar los datos locales
      asistencias.value = response.data.map(transformApiRecord)
      total.value = response.meta.total
      currentPage.value = response.meta.current_page

      return response
    } catch (err: any) {
      console.error('Error al cargar asistencias:', err)
      error.value = err.message || 'Error al cargar las asistencias'
      throw err
    } finally {
      loading.value = false
    }
  }

  

  const createAsistencia = async (data: AsistenciaCreateRequest) => {
    loading.value = true
    error.value = null

    try {
      // Obtener token de localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      // Transformar datos al formato de la nueva API
      const apiData = {
        user_id: data.user_id?.value || data.usuario_id?.value,
        timestamp: Date.now().toString(),
        latitude: data.latitude || data.latitud,
        longitude: data.longitude || data.longitud,
        notes: data.notes || data.descripcion || '',
        device_model: data.device_model || data.dispositivo || 'Unknown Device',
        battery_percentage: data.battery_percentage || data.bateria || 100,
        signal_strength: 4,
        network_type: data.metodo === 'WIFI' ? 'WiFi' : '4G',
        is_internet_available: true,
        type: data.type || data.tipo_registro,
        emp_code: data.emp_code || '',
        client_id: crypto.randomUUID(),
        address: data.address || ''
      }

     
      const config = useRuntimeConfig();
      const apiBaseUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000';

      const response = await $fetch<AttendanceRecord>(`${apiBaseUrl}/api/attendances`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: apiData
      })

      // Transformar y actualizar la lista local
      const transformedRecord = transformApiRecord(response)
   
      asistencias.value = [transformedRecord, ...asistencias.value]
      total.value++

    
      
      return transformedRecord
    } catch (err: any) {
      console.error('Error al crear asistencia:', err)
      error.value = err.message || 'Error al crear la asistencia'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAsistencia = async (id: number, data: Partial<AsistenciaCreateRequest>) => {
    loading.value = true
    error.value = null


    try {
      // Obtener token de localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      // const apiData = {
      //   notes: data.notes || data.descripcion,
      //   device_model: data.device_model || data.dispositivo,
      //   battery_percentage: data.battery_percentage || data.bateria
      // }

      const apiData = {
        user_id: data.user_id?.value || data.usuario_id.value,
        timestamp: Date.now().toString(),
        latitude: data.latitude || data.latitud,
        longitude: data.longitude || data.longitud,
        notes: data.notes || data.descripcion || '',
        device_model: data.device_model || data.dispositivo || 'Unknown Device',
        battery_percentage: data.battery_percentage || data.bateria || 100,
        signal_strength: 4,
        network_type: data.metodo === 'WIFI' ? 'WiFi' : '4G',
        is_internet_available: true,
        type: data.type || data.tipo_registro,
        emp_code: data.emp_code || '',
        client_id: crypto.randomUUID(),
        address: data.address || ''
      }

      const config = useRuntimeConfig();
      const apiBaseUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000';

      const response = await $fetch<AttendanceRecord>(`${apiBaseUrl}/api/attendances/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: apiData
      })

      // Actualizar en la lista local
      const transformedRecord = transformApiRecord(response)
      const index = asistencias.value.findIndex(a => a.id === id)
      if (index !== -1) {
        asistencias.value[index] = transformedRecord
      }

      return transformedRecord
    } catch (err: any) {
      console.error('Error al actualizar asistencia:', err)
      error.value = err.message || 'Error al actualizar la asistencia'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAsistencia = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      // Obtener token de localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      const config = useRuntimeConfig();
      const apiBaseUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000';

      await $fetch(`${apiBaseUrl}/api/attendances/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      // Remover de la lista local
      asistencias.value = asistencias.value.filter(a => a.id !== id)
      total.value--

      return true
    } catch (err: any) {
      console.error('Error al eliminar asistencia:', err)
      error.value = err.message || 'Error al eliminar la asistencia'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      // Solo usar stats locales para evitar 404
      return generateLocalStats()
    } catch (err: any) {
      console.error('Error al calcular stats:', err)
      return generateLocalStats()
    }
  }

  // Función auxiliar para generar stats localmente (OPTIMIZADA)
  const generateLocalStats = () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const todayRecords = asistencias.value.filter(a => {
        // Manejo seguro de fechas
        const recordDate = a.created_at?.split('T')[0] || a.timestamp?.split('T')[0] || ''
        return recordDate === today
      })
      
      const newStats = {
        total_registros: total.value || asistencias.value.length,
        check_ins_hoy: todayRecords.filter(a => a.tipo_registro === 'check_in').length,
        check_outs_hoy: todayRecords.filter(a => a.tipo_registro === 'check_out').length,
        usuarios_activos: new Set(todayRecords.map(a => a.usuario_id).filter(id => id)).size,
        sincronizados: asistencias.value.length,
        pendientes: 0
      }
      
      stats.value = newStats
      return newStats
    } catch (error) {
      console.warn('Error calculando stats locales:', error)
      const fallbackStats = {
        total_registros: 0,
        check_ins_hoy: 0,
        check_outs_hoy: 0,
        usuarios_activos: 0,
        sincronizados: 0,
        pendientes: 0
      }
      stats.value = fallbackStats
      return fallbackStats
    }
  }

  // 🛠️ Utilidades
  const formatFecha = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimestamp = (timestamp: number | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGoogleMapsUrl = (latitud: number, longitud: number) => {
    return `https://www.google.com/maps?q=${latitud},${longitud}`
  }

  const getTipoEventoIcon = (tipo: TipoEvento) => {
    const config = tiposEvento.find(t => t.value === tipo)
    return config?.icon || 'i-lucide-clock'
  }

  const getTipoRegistroIcon = (tipo: TipoRegistro) => {
    const config = tiposRegistro.find(t => t.value === tipo)
    return config?.icon || 'i-lucide-clock'
  }

  const getTipoRegistroColor = (tipo: TipoRegistro) => {
    const config = tiposRegistro.find(t => t.value === tipo)
    return config?.color || 'text-gray-600'
  }

  const getMetodoConexionConfig = (metodo?: MetodoConexion) => {
    return metodosConexion.find(m => m.value === metodo) || {
      label: 'Desconocido',
      value: 'SIN_CONEXION' as MetodoConexion,
      icon: 'i-lucide-help-circle',
      color: 'text-gray-500'
    }
  }

  const getSincronizadoStatus = (sincronizado: 0 | 1) => {
    return sincronizado === 1 
      ? { label: 'Sincronizado', color: 'text-green-600', icon: 'i-lucide-check-circle' }
      : { label: 'Pendiente', color: 'text-yellow-600', icon: 'i-lucide-clock' }
  }

  const getBateriaColor = (bateria?: number) => {
    if (!bateria) return 'text-gray-500'
    if (bateria >= 60) return 'text-green-600'
    if (bateria >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBateriaIcon = (bateria?: number) => {
    if (!bateria) return 'i-lucide-battery-warning'
    if (bateria >= 75) return 'i-lucide-battery'
    if (bateria >= 50) return 'i-lucide-battery-medium'
    if (bateria >= 25) return 'i-lucide-battery-low'
    return 'i-lucide-battery-warning'
  }

  const getDeviceIcon = (device?: string) => {
    if (!device) return 'i-lucide-smartphone'
    const deviceLower = device.toLowerCase()
    if (deviceLower.includes('iphone') || deviceLower.includes('ios')) {
      return 'i-lucide-smartphone'
    }
    if (deviceLower.includes('android')) {
      return 'i-lucide-smartphone'
    }
    return 'i-lucide-tablet'
  }

  const getSignalIcon = (strength?: number) => {
    if (!strength) return 'i-lucide-signal-low'
    if (strength >= 4) return 'i-lucide-signal'
    if (strength >= 2) return 'i-lucide-signal-medium'
    return 'i-lucide-signal-low'
  }

  const getSignalColor = (strength?: number) => {
    if (!strength) return 'text-red-500'
    if (strength >= 4) return 'text-green-500'
    if (strength >= 2) return 'text-yellow-500'
    return 'text-red-500'
  }

  // 🔄 Auto-refetch cuando cambian los filtros (SÚPER OPTIMIZADO)
  const applyFilters = async (newFilters: AsistenciaFilters) => {
    filters.value = newFilters
    currentPage.value = 1
    
    // Solo cargar datos principales - stats se actualizan automáticamente
    await fetchAsistencias(1, newFilters)
  }

  const clearFilters = async () => {
    filters.value = {}
    currentPage.value = 1
    
    // Solo cargar datos principales - stats se actualizan automáticamente
    await fetchAsistencias(1, {})
  }

  const refreshData = async () => {
    // Solo refrescar datos principales - stats se actualizan automáticamente
    await fetchAsistencias(currentPage.value, filters.value)
  }

  // 📍 Función para obtener ubicación actual
  const getCurrentLocation = (): Promise<{latitud: number, longitud: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error('Error al obtener ubicación: ' + error.message))
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    })
  }

  // 🔋 Función para obtener nivel de batería (si está disponible)
  const getBatteryLevel = async (): Promise<number> => {
    try {
      // @ts-ignore - Battery API experimental
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery()
        return Math.round(battery.level * 100)
      }
    } catch (error) {
      console.warn('No se pudo obtener el nivel de batería:', error)
    }
    return 100 // Default
  }

  return {
    // Estados
    asistencias: readonly(asistencias),
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    currentPage: readonly(currentPage),
    perPage: readonly(perPage),
    stats: readonly(stats),
    filters: readonly(filters),

    // Opciones
    tiposEvento,
    tiposRegistro,
    metodosConexion,

    // Funciones de API
    fetchAsistencias,
    createAsistencia,
    updateAsistencia,
    deleteAsistencia,
    fetchStats,

    // Utilidades
    formatFecha,
    formatTimestamp,
    getGoogleMapsUrl,
    getTipoEventoIcon,
    getTipoRegistroIcon,
    getTipoRegistroColor,
    getMetodoConexionConfig,
    getSincronizadoStatus,
    getBateriaColor,
    getBateriaIcon,
    getDeviceIcon,
    getSignalIcon,
    getSignalColor,

    // Filtros
    applyFilters,
    clearFilters,
    refreshData,

    // Dispositivo
    getCurrentLocation,
    getBatteryLevel
  }
}