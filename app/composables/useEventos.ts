interface EventoImagen {
  id: number;
  evento_id: number;
  url_imagen: string;
  descripcion: string;
  orden: number;
  autor: string;
  created_at: string;
  updated_at: string;
}

interface EventoAPI {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  created_at: string;
  updated_at: string;
  imagenes: EventoImagen[];
}

interface EventoCalendario {
  id: number;
  nombre: string;
  fecha: string;
  categoria: string;
  programado: boolean;
  descripcion: string;
  imagenes?: EventoImagen[];
  fecha_fin?: string;
  estado?: string;
}

export const useEventos = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl || 'http://127.0.0.1:8000'

  // 🔑 Obtener token de autenticación
  const getAuthToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  // 🌐 Obtener eventos por mes con autenticación
  const obtenerEventosPorMes = async (año: number, mes: number): Promise<EventoAPI[]> => {
    try {
      console.log(`🌐 Obteniendo eventos para ${año}/${mes}...`)
      
      const token = getAuthToken()
      if (!token) {
        console.error('🚫 No hay token de autenticación')
        throw new Error('No hay token de autenticación')
      }

      console.log(`🔗 URL: ${baseUrl}/api/eventos/mes/${año}/${mes}`)
      console.log(`🔑 Token: ${token.substring(0, 20)}...`)

      const data = await $fetch<EventoAPI[]>(`${baseUrl}/api/eventos/mes/${año}/${mes}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      console.log(`✅ Eventos obtenidos:`, data)
      return data || []
    } catch (error: any) {
      console.error('💥 Error al obtener eventos del mes:', error)
      
      // Verificar si es un error de autenticación
      if (error?.status === 401 || error?.statusCode === 401) {
        console.error('� Token inválido o expirado')
        throw new Error('Token de autenticación inválido o expirado')
      }
      
      // Fallback de prueba eliminado: siempre propagar error para manejo en UI
      
      // Re-lanzar el error para que lo maneje el componente
      throw error
    }
  }

  // � Utilidades de fecha sin zonas horarias (local)
  const parseYMDToLocalDate = (ymd: string) => {
    const [ys, ms, ds] = ymd.split('-') as [string, string, string]
    const y = Number(ys)
    const m = Number(ms)
    const d = Number(ds)
    const ySafe = isNaN(y) ? 1970 : y
    const mSafe = isNaN(m) ? 1 : m
    const dSafe = isNaN(d) ? 1 : d
    return new Date(ySafe, mSafe - 1, dSafe)
  }

  const formatLocalYMD = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // �🔄 Transformar eventos de la API al formato del calendario (sin desfase por TZ)
  const transformarEventosParaCalendario = (eventosAPI: EventoAPI[]): EventoCalendario[] => {
    const eventosTransformados: EventoCalendario[] = []
    
    eventosAPI.forEach(evento => {
      // Verificar que las fechas existan
      if (!evento.fecha_inicio || !evento.fecha_fin) {
        console.warn('⚠️ Evento sin fechas completas:', evento)
        return
      }
      
      const fechaInicio = parseYMDToLocalDate(evento.fecha_inicio.split('T')[0]!)
      const fechaFin = parseYMDToLocalDate(evento.fecha_fin.split('T')[0]!)
      
      // Verificar que las fechas sean válidas
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        console.warn('⚠️ Fechas inválidas en evento:', evento)
        return
      }
      
      // Crear un evento para cada día entre fecha_inicio y fecha_fin
      const fechaActual = new Date(fechaInicio)
      let contadorDias = 0
      
      while (fechaActual <= fechaFin && contadorDias < 366) { // Límite de seguridad para evitar loops infinitos
  const fechaStr = formatLocalYMD(fechaActual)
        
        // Determinar si es el primer día, último día, o día intermedio
        const esPrimerDia = fechaActual.getTime() === fechaInicio.getTime()
        const esUltimoDia = fechaActual.getTime() === fechaFin.getTime()
        const diasTotales = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
        
        let nombreEvento = evento.titulo
        
        // Si el evento dura más de un día, agregar indicador
        if (diasTotales > 1) {
          if (esPrimerDia) {
            nombreEvento = `🚀 ${evento.titulo} (inicio)`
          } else if (esUltimoDia) {
            nombreEvento = `🏁 ${evento.titulo} (fin)`
          } else {
            nombreEvento = `📅 ${evento.titulo} (día ${contadorDias + 1}/${diasTotales})`
          }
        }
        
        eventosTransformados.push({
          id: Number(`${evento.id}${contadorDias.toString().padStart(3, '0')}`), // ID único para cada día con padding
          nombre: nombreEvento,
          fecha: fechaStr,
          categoria: determinarCategoria(evento.titulo, evento.descripcion),
          programado: evento.estado === 'programado',
          descripcion: `${evento.descripcion}${diasTotales > 1 ? ` (Evento de ${diasTotales} días: ${evento.fecha_inicio.split('T')[0]} al ${evento.fecha_fin.split('T')[0]})` : ''}`,
          imagenes: evento.imagenes,
          fecha_fin: evento.fecha_fin,
          estado: evento.estado
        })
        
        // Avanzar al siguiente día
        fechaActual.setDate(fechaActual.getDate() + 1)
        contadorDias++
      }
    })
    
    console.log(`📅 Transformados ${eventosAPI.length} eventos del API en ${eventosTransformados.length} entradas de calendario`)
    
    return eventosTransformados
  }

  // 🏷️ Determinar categoría basada en el título y descripción
  const determinarCategoria = (titulo: string, descripcion: string): string => {
    const texto = (titulo + ' ' + descripcion).toLowerCase()
    
    if (texto.includes('feriado') || texto.includes('independencia') || texto.includes('nacional')) {
      return 'feriado'
    }
    if (texto.includes('cumpleaños') || texto.includes('cumpleanos') || texto.includes('birthday')) {
      return 'cumpleanos'
    }
    if (texto.includes('aniversario') || texto.includes('anniversary')) {
      return 'aniversario'
    }
    if (texto.includes('celebra') || texto.includes('festejo') || texto.includes('conmemora')) {
      return 'celebracion'
    }
    
    return 'especial'
  }

  // 📅 Obtener eventos para el calendario (combina API + locales)
  const obtenerEventosParaCalendario = async (año: number, mes: number) => {
    const eventosAPI = await obtenerEventosPorMes(año, mes)
    const eventosCalendario = transformarEventosParaCalendario(eventosAPI)
    
    // Aquí podrías combinar con eventos locales si es necesario
    const eventosLocales = obtenerEventosLocales()
    
    return [...eventosCalendario, ...eventosLocales]
  }

  // 💾 Obtener eventos guardados localmente
  const obtenerEventosLocales = (): EventoCalendario[] => {
    if (import.meta.client) {
      const saved = localStorage.getItem('eventos-personalizados')
      return saved ? JSON.parse(saved) : []
    }
    return []
  }

  // 💾 Guardar evento local
  const guardarEventoLocal = (evento: EventoCalendario) => {
    if (import.meta.client) {
      const eventos = obtenerEventosLocales()
      eventos.push(evento)
      localStorage.setItem('eventos-personalizados', JSON.stringify(eventos))
    }
  }

  // 🗑️ Eliminar evento local
  const eliminarEventoLocal = (id: number) => {
    if (import.meta.client) {
      const eventos = obtenerEventosLocales()
      const eventosFiltrados = eventos.filter(evento => evento.id !== id)
      localStorage.setItem('eventos-personalizados', JSON.stringify(eventosFiltrados))
    }
  }

  return {
    obtenerEventosPorMes,
    obtenerEventosParaCalendario,
    transformarEventosParaCalendario,
    determinarCategoria,
    obtenerEventosLocales,
    guardarEventoLocal,
    eliminarEventoLocal
  }
}

export type { EventoAPI, EventoCalendario, EventoImagen }