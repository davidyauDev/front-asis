import type { Route, RouteFilters, RouteStats, GPSPoint, StopPoint, AttendanceUser, MapConfig } from '~/types'

// 🎨 Colores para diferenciar rutas de usuarios
const ROUTE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#14B8A6',
  '#8B5CF6', '#F43F5E', '#0EA5E9', '#EAB308', '#22C55E'
]

// 👥 Usuarios técnicos distribuidos por todo el Perú
const mockUsers: AttendanceUser[] = [
  // Lima (5 técnicos)
  { id: 1, name: 'Carlos Méndez', email: 'carlos.mendez@company.com', emp_code: 'LIM-001' },
  { id: 2, name: 'Ana García', email: 'ana.garcia@company.com', emp_code: 'LIM-002' },
  { id: 3, name: 'Roberto Silva', email: 'roberto.silva@company.com', emp_code: 'LIM-003' },
  { id: 4, name: 'Sofia Campos', email: 'sofia.campos@company.com', emp_code: 'LIM-004' },
  { id: 5, name: 'Diego Rojas', email: 'diego.rojas@company.com', emp_code: 'LIM-005' },
  
  // Arequipa (4 técnicos)
  { id: 6, name: 'María López', email: 'maria.lopez@company.com', emp_code: 'AQP-001' },
  { id: 7, name: 'Luis Ramírez', email: 'luis.ramirez@company.com', emp_code: 'AQP-002' },
  { id: 8, name: 'Elena Quispe', email: 'elena.quispe@company.com', emp_code: 'AQP-003' },
  { id: 9, name: 'Marco Pinto', email: 'marco.pinto@company.com', emp_code: 'AQP-004' },
  
  // Cusco (3 técnicos)
  { id: 10, name: 'Patricia Torres', email: 'patricia.torres@company.com', emp_code: 'CUS-001' },
  { id: 11, name: 'Jorge Vargas', email: 'jorge.vargas@company.com', emp_code: 'CUS-002' },
  { id: 12, name: 'Rosa Huamán', email: 'rosa.huaman@company.com', emp_code: 'CUS-003' },
  
  // Trujillo (4 técnicos)
  { id: 13, name: 'Sandra Flores', email: 'sandra.flores@company.com', emp_code: 'TRU-001' },
  { id: 14, name: 'Miguel Ruiz', email: 'miguel.ruiz@company.com', emp_code: 'TRU-002' },
  { id: 15, name: 'Javier Cortez', email: 'javier.cortez@company.com', emp_code: 'TRU-003' },
  { id: 16, name: 'Lucía Vásquez', email: 'lucia.vasquez@company.com', emp_code: 'TRU-004' },
  
  // Piura (3 técnicos)
  { id: 17, name: 'Carmen Soto', email: 'carmen.soto@company.com', emp_code: 'PIU-001' },
  { id: 18, name: 'Alberto Chávez', email: 'alberto.chavez@company.com', emp_code: 'PIU-002' },
  { id: 19, name: 'Gabriela León', email: 'gabriela.leon@company.com', emp_code: 'PIU-003' },
  
  // Chiclayo (3 técnicos)
  { id: 20, name: 'Ricardo Castillo', email: 'ricardo.castillo@company.com', emp_code: 'CHI-001' },
  { id: 21, name: 'Mónica Díaz', email: 'monica.diaz@company.com', emp_code: 'CHI-002' },
  { id: 22, name: 'Pedro Salas', email: 'pedro.salas@company.com', emp_code: 'CHI-003' },
  
  // Iquitos (2 técnicos)
  { id: 23, name: 'Diana Vega', email: 'diana.vega@company.com', emp_code: 'IQT-001' },
  { id: 24, name: 'Carlos Pinedo', email: 'carlos.pinedo@company.com', emp_code: 'IQT-002' },
  
  // Huancayo (3 técnicos)
  { id: 25, name: 'Fernando Herrera', email: 'fernando.herrera@company.com', emp_code: 'HYO-001' },
  { id: 26, name: 'Julia Ramos', email: 'julia.ramos@company.com', emp_code: 'HYO-002' },
  { id: 27, name: 'Raúl Mendoza', email: 'raul.mendoza@company.com', emp_code: 'HYO-003' },
  
  // Tacna (2 técnicos)
  { id: 28, name: 'Valeria Morales', email: 'valeria.morales@company.com', emp_code: 'TAC-001' },
  { id: 29, name: 'Oscar Fuentes', email: 'oscar.fuentes@company.com', emp_code: 'TAC-002' },
  
  // Puno (3 técnicos)
  { id: 30, name: 'Andrés Paredes', email: 'andres.paredes@company.com', emp_code: 'PUN-001' },
  { id: 31, name: 'Claudia Mamani', email: 'claudia.mamani@company.com', emp_code: 'PUN-002' },
  { id: 32, name: 'Victor Apaza', email: 'victor.apaza@company.com', emp_code: 'PUN-003' }
]

// 🗺️ Función auxiliar para generar puntos GPS realistas
function generateGPSPoints(
  startLat: number,
  startLng: number,
  numPoints: number,
  startTime: Date,
  withStops: boolean = true
): GPSPoint[] {
  const points: GPSPoint[] = []
  let currentLat = startLat
  let currentLng = startLng
  let currentTime = new Date(startTime)

  for (let i = 0; i < numPoints; i++) {
    // Simular movimiento (pequeñas variaciones)
    if (i > 0) {
      currentLat += (Math.random() - 0.5) * 0.005
      currentLng += (Math.random() - 0.5) * 0.005
      
      // Avanzar tiempo (entre 1-3 minutos por punto normalmente)
      let minutesAdvance = Math.random() * 2 + 1
      
      // Simular paradas ocasionales
      if (withStops && Math.random() > 0.85) {
        minutesAdvance = Math.random() * 20 + 5 // Parada de 5-25 minutos
      }
      
      currentTime = new Date(currentTime.getTime() + minutesAdvance * 60000)
    }

    points.push({
      id: `point-${i}`,
      latitude: currentLat,
      longitude: currentLng,
      timestamp: currentTime.toISOString(),
      accuracy: Math.random() * 10 + 5,
      speed: Math.random() * 50 + 20, // 20-70 km/h
      altitude: 500 + Math.random() * 100,
      heading: Math.random() * 360
    })
  }

  return points
}

// 🛑 Detectar puntos de parada (donde el usuario estuvo quieto más de X minutos)
function detectStops(points: GPSPoint[], minDuration: number = 5): StopPoint[] {
  const stops: StopPoint[] = []
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    
    if (!current || !next) continue
    
    // Calcular tiempo entre puntos
    const timeDiff = (new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime()) / 60000 // minutos
    
    // Calcular distancia entre puntos (fórmula Haversine simplificada)
    const distance = Math.sqrt(
      Math.pow(next.latitude - current.latitude, 2) + 
      Math.pow(next.longitude - current.longitude, 2)
    ) * 111 // Aproximación en km
    
    // Si estuvo más de minDuration minutos y se movió menos de 0.1 km
    if (timeDiff >= minDuration && distance < 0.1) {
      stops.push({
        id: current.id,
        latitude: current.latitude,
        longitude: current.longitude,
        timestamp: current.timestamp,
        accuracy: current.accuracy,
        speed: current.speed,
        altitude: current.altitude,
        heading: current.heading,
        duration: Math.round(timeDiff),
        address: `Ubicación ${stops.length + 1}`,
        notes: `Parada de ${Math.round(timeDiff)} minutos`
      })
    }
  }
  
  return stops
}

// 📊 Calcular estadísticas de la ruta
function calculateRouteStats(points: GPSPoint[]): {
  totalDistance: number
  totalDuration: number
  avgSpeed: number
  maxSpeed: number
} {
  if (points.length < 2) {
    return { totalDistance: 0, totalDuration: 0, avgSpeed: 0, maxSpeed: 0 }
  }

  let totalDistance = 0
  let maxSpeed = 0

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    
    if (!p1 || !p2) continue
    
    // Distancia (fórmula Haversine simplificada)
    const dist = Math.sqrt(
      Math.pow(p2.latitude - p1.latitude, 2) + 
      Math.pow(p2.longitude - p1.longitude, 2)
    ) * 111
    
    totalDistance += dist
    
    if (p1.speed && p1.speed > maxSpeed) {
      maxSpeed = p1.speed
    }
  }

  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  
  if (!firstPoint || !lastPoint) {
    return { totalDistance: 0, totalDuration: 0, avgSpeed: 0, maxSpeed: 0 }
  }

  const startTime = new Date(firstPoint.timestamp).getTime()
  const endTime = new Date(lastPoint.timestamp).getTime()
  const totalDuration = (endTime - startTime) / 60000 // minutos

  const avgSpeed = totalDuration > 0 ? (totalDistance / (totalDuration / 60)) : 0

  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalDuration: Math.round(totalDuration),
    avgSpeed: Math.round(avgSpeed * 100) / 100,
    maxSpeed: Math.round(maxSpeed * 100) / 100
  }
}

// 🗺️ Datos ficticios de rutas para 3 usuarios
function generateMockRoutes(): Route[] {
  const routes: Route[] = []
  const today = new Date()
  
  // Ruta 1: Carlos Méndez - Recorrido urbano largo
  const route1Points = generateGPSPoints(
    -12.0464, // Lima, Perú
    -77.0428,
    45,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0)
  )
  const route1Stats = calculateRouteStats(route1Points)
  const firstPoint1 = route1Points[0]
  const lastPoint1 = route1Points[route1Points.length - 1]
  
  if (firstPoint1 && lastPoint1 && mockUsers[0]) {
    routes.push({
      id: 'route-1',
      user_id: 1,
      user: mockUsers[0],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint1.timestamp,
      end_time: lastPoint1.timestamp,
      points: route1Points,
      stops: detectStops(route1Points, 5),
      total_distance: route1Stats.totalDistance,
      total_duration: route1Stats.totalDuration,
      average_speed: route1Stats.avgSpeed,
      max_speed: route1Stats.maxSpeed,
      color: ROUTE_COLORS[0]
    })
  }

  // Ruta 2: Ana García - Recorrido con múltiples paradas
  const route2Points = generateGPSPoints(
    -12.0700,
    -77.0200,
    38,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30)
  )
  const route2Stats = calculateRouteStats(route2Points)
  const firstPoint2 = route2Points[0]
  const lastPoint2 = route2Points[route2Points.length - 1]
  
  if (firstPoint2 && lastPoint2 && mockUsers[1]) {
    routes.push({
      id: 'route-2',
      user_id: 2,
      user: mockUsers[1],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint2.timestamp,
      end_time: lastPoint2.timestamp,
      points: route2Points,
      stops: detectStops(route2Points, 10),
      total_distance: route2Stats.totalDistance,
      total_duration: route2Stats.totalDuration,
      average_speed: route2Stats.avgSpeed,
      max_speed: route2Stats.maxSpeed,
      color: ROUTE_COLORS[1]
    })
  }

  // Ruta 3: Roberto Silva - Recorrido corto
  const route3Points = generateGPSPoints(
    -12.0900,
    -77.0100,
    25,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 15),
    false
  )
  const route3Stats = calculateRouteStats(route3Points)
  const firstPoint3 = route3Points[0]
  const lastPoint3 = route3Points[route3Points.length - 1]
  
  if (firstPoint3 && lastPoint3 && mockUsers[2]) {
    routes.push({
      id: 'route-3',
      user_id: 3,
      user: mockUsers[2],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint3.timestamp,
      end_time: lastPoint3.timestamp,
      points: route3Points,
      stops: detectStops(route3Points, 15),
      total_distance: route3Stats.totalDistance,
      total_duration: route3Stats.totalDuration,
      average_speed: route3Stats.avgSpeed,
      max_speed: route3Stats.maxSpeed,
      color: ROUTE_COLORS[2]
    })
  }

  // Ruta 4: Carlos Méndez - Día anterior
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const route4Points = generateGPSPoints(
    -12.0500,
    -77.0500,
    50,
    new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 30)
  )
  const route4Stats = calculateRouteStats(route4Points)
  const firstPoint4 = route4Points[0]
  const lastPoint4 = route4Points[route4Points.length - 1]
  
  if (firstPoint4 && lastPoint4 && mockUsers[0]) {
    routes.push({
      id: 'route-4',
      user_id: 1,
      user: mockUsers[0],
      date: yesterday.toISOString().split('T')[0] || '',
      start_time: firstPoint4.timestamp,
      end_time: lastPoint4.timestamp,
      points: route4Points,
      stops: detectStops(route4Points, 5),
      total_distance: route4Stats.totalDistance,
      total_duration: route4Stats.totalDuration,
      average_speed: route4Stats.avgSpeed,
      max_speed: route4Stats.maxSpeed,
      color: ROUTE_COLORS[0]
    })
  }

  // Ruta 5: Ana García - Hace 2 días
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const route5Points = generateGPSPoints(
    -12.0600,
    -77.0300,
    42,
    new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 9, 0)
  )
  const route5Stats = calculateRouteStats(route5Points)
  const firstPoint5 = route5Points[0]
  const lastPoint5 = route5Points[route5Points.length - 1]
  
  if (firstPoint5 && lastPoint5 && mockUsers[1]) {
    routes.push({
      id: 'route-5',
      user_id: 2,
      user: mockUsers[1],
      date: twoDaysAgo.toISOString().split('T')[0] || '',
      start_time: firstPoint5.timestamp,
      end_time: lastPoint5.timestamp,
      points: route5Points,
      stops: detectStops(route5Points, 10),
      total_distance: route5Stats.totalDistance,
      total_duration: route5Stats.totalDuration,
      average_speed: route5Stats.avgSpeed,
      max_speed: route5Stats.maxSpeed,
      color: ROUTE_COLORS[1]
    })
  }

  // Ruta 6: María López - Hoy
  const route6Points = generateGPSPoints(
    -12.0400,
    -77.0600,
    35,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0)
  )
  const route6Stats = calculateRouteStats(route6Points)
  const firstPoint6 = route6Points[0]
  const lastPoint6 = route6Points[route6Points.length - 1]
  
  if (firstPoint6 && lastPoint6 && mockUsers[3]) {
    routes.push({
      id: 'route-6',
      user_id: 4,
      user: mockUsers[3],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint6.timestamp,
      end_time: lastPoint6.timestamp,
      points: route6Points,
      stops: detectStops(route6Points, 8),
      total_distance: route6Stats.totalDistance,
      total_duration: route6Stats.totalDuration,
      average_speed: route6Stats.avgSpeed,
      max_speed: route6Stats.maxSpeed,
      color: ROUTE_COLORS[3]
    })
  }

  // Ruta 7: Luis Ramírez - Hoy
  const route7Points = generateGPSPoints(
    -12.1000,
    -77.0450,
    40,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 45)
  )
  const route7Stats = calculateRouteStats(route7Points)
  const firstPoint7 = route7Points[0]
  const lastPoint7 = route7Points[route7Points.length - 1]
  
  if (firstPoint7 && lastPoint7 && mockUsers[4]) {
    routes.push({
      id: 'route-7',
      user_id: 5,
      user: mockUsers[4],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint7.timestamp,
      end_time: lastPoint7.timestamp,
      points: route7Points,
      stops: detectStops(route7Points, 12),
      total_distance: route7Stats.totalDistance,
      total_duration: route7Stats.totalDuration,
      average_speed: route7Stats.avgSpeed,
      max_speed: route7Stats.maxSpeed,
      color: ROUTE_COLORS[4]
    })
  }

  // Ruta 8: Patricia Torres - Hoy
  const route8Points = generateGPSPoints(
    -12.0350,
    -77.0550,
    30,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15)
  )
  const route8Stats = calculateRouteStats(route8Points)
  const firstPoint8 = route8Points[0]
  const lastPoint8 = route8Points[route8Points.length - 1]
  
  if (firstPoint8 && lastPoint8 && mockUsers[5]) {
    routes.push({
      id: 'route-8',
      user_id: 6,
      user: mockUsers[5],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint8.timestamp,
      end_time: lastPoint8.timestamp,
      points: route8Points,
      stops: detectStops(route8Points, 6),
      total_distance: route8Stats.totalDistance,
      total_duration: route8Stats.totalDuration,
      average_speed: route8Stats.avgSpeed,
      max_speed: route8Stats.maxSpeed,
      color: ROUTE_COLORS[5]
    })
  }

  // Ruta 9: Jorge Vargas - Hoy
  const route9Points = generateGPSPoints(
    -12.0800,
    -77.0250,
    48,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30)
  )
  const route9Stats = calculateRouteStats(route9Points)
  const firstPoint9 = route9Points[0]
  const lastPoint9 = route9Points[route9Points.length - 1]
  
  if (firstPoint9 && lastPoint9 && mockUsers[6]) {
    routes.push({
      id: 'route-9',
      user_id: 7,
      user: mockUsers[6],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint9.timestamp,
      end_time: lastPoint9.timestamp,
      points: route9Points,
      stops: detectStops(route9Points, 14),
      total_distance: route9Stats.totalDistance,
      total_duration: route9Stats.totalDuration,
      average_speed: route9Stats.avgSpeed,
      max_speed: route9Stats.maxSpeed,
      color: ROUTE_COLORS[6]
    })
  }

  // Ruta 10: Sandra Flores - Trujillo
  const route10Points = generateGPSPoints(
    -8.1116,
    -79.0288,
    35,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0)
  )
  const route10Stats = calculateRouteStats(route10Points)
  const firstPoint10 = route10Points[0]
  const lastPoint10 = route10Points[route10Points.length - 1]
  
  if (firstPoint10 && lastPoint10 && mockUsers[7]) {
    routes.push({
      id: 'route-10',
      user_id: 8,
      user: mockUsers[7],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint10.timestamp,
      end_time: lastPoint10.timestamp,
      points: route10Points,
      stops: detectStops(route10Points, 7),
      total_distance: route10Stats.totalDistance,
      total_duration: route10Stats.totalDuration,
      average_speed: route10Stats.avgSpeed,
      max_speed: route10Stats.maxSpeed,
      color: ROUTE_COLORS[7]
    })
  }

  // Ruta 11: Miguel Ángel Ruiz - Trujillo
  const route11Points = generateGPSPoints(
    -8.1000,
    -79.0400,
    40,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30)
  )
  const route11Stats = calculateRouteStats(route11Points)
  const firstPoint11 = route11Points[0]
  const lastPoint11 = route11Points[route11Points.length - 1]
  
  if (firstPoint11 && lastPoint11 && mockUsers[8]) {
    routes.push({
      id: 'route-11',
      user_id: 9,
      user: mockUsers[8],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint11.timestamp,
      end_time: lastPoint11.timestamp,
      points: route11Points,
      stops: detectStops(route11Points, 9),
      total_distance: route11Stats.totalDistance,
      total_duration: route11Stats.totalDuration,
      average_speed: route11Stats.avgSpeed,
      max_speed: route11Stats.maxSpeed,
      color: ROUTE_COLORS[8]
    })
  }

  // Ruta 12: Carmen Soto - Piura
  const route12Points = generateGPSPoints(
    -5.1945,
    -80.6328,
    32,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 45)
  )
  const route12Stats = calculateRouteStats(route12Points)
  const firstPoint12 = route12Points[0]
  const lastPoint12 = route12Points[route12Points.length - 1]
  
  if (firstPoint12 && lastPoint12 && mockUsers[9]) {
    routes.push({
      id: 'route-12',
      user_id: 10,
      user: mockUsers[9],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint12.timestamp,
      end_time: lastPoint12.timestamp,
      points: route12Points,
      stops: detectStops(route12Points, 6),
      total_distance: route12Stats.totalDistance,
      total_duration: route12Stats.totalDuration,
      average_speed: route12Stats.avgSpeed,
      max_speed: route12Stats.maxSpeed,
      color: ROUTE_COLORS[9]
    })
  }

  // Ruta 13: Ricardo Castillo - Chiclayo
  const route13Points = generateGPSPoints(
    -6.7714,
    -79.8411,
    38,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15)
  )
  const route13Stats = calculateRouteStats(route13Points)
  const firstPoint13 = route13Points[0]
  const lastPoint13 = route13Points[route13Points.length - 1]
  
  if (firstPoint13 && lastPoint13 && mockUsers[10]) {
    routes.push({
      id: 'route-13',
      user_id: 11,
      user: mockUsers[10],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint13.timestamp,
      end_time: lastPoint13.timestamp,
      points: route13Points,
      stops: detectStops(route13Points, 8),
      total_distance: route13Stats.totalDistance,
      total_duration: route13Stats.totalDuration,
      average_speed: route13Stats.avgSpeed,
      max_speed: route13Stats.maxSpeed,
      color: ROUTE_COLORS[10]
    })
  }

  // Ruta 14: Diana Vega - Iquitos
  const route14Points = generateGPSPoints(
    -3.7437,
    -73.2516,
    30,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)
  )
  const route14Stats = calculateRouteStats(route14Points)
  const firstPoint14 = route14Points[0]
  const lastPoint14 = route14Points[route14Points.length - 1]
  
  if (firstPoint14 && lastPoint14 && mockUsers[11]) {
    routes.push({
      id: 'route-14',
      user_id: 12,
      user: mockUsers[11],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint14.timestamp,
      end_time: lastPoint14.timestamp,
      points: route14Points,
      stops: detectStops(route14Points, 5),
      total_distance: route14Stats.totalDistance,
      total_duration: route14Stats.totalDuration,
      average_speed: route14Stats.avgSpeed,
      max_speed: route14Stats.maxSpeed,
      color: ROUTE_COLORS[11]
    })
  }

  // Ruta 15: Fernando Herrera - Huancayo
  const route15Points = generateGPSPoints(
    -12.0685,
    -75.2107,
    36,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30)
  )
  const route15Stats = calculateRouteStats(route15Points)
  const firstPoint15 = route15Points[0]
  const lastPoint15 = route15Points[route15Points.length - 1]
  
  if (firstPoint15 && lastPoint15 && mockUsers[12]) {
    routes.push({
      id: 'route-15',
      user_id: 13,
      user: mockUsers[12],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint15.timestamp,
      end_time: lastPoint15.timestamp,
      points: route15Points,
      stops: detectStops(route15Points, 7),
      total_distance: route15Stats.totalDistance,
      total_duration: route15Stats.totalDuration,
      average_speed: route15Stats.avgSpeed,
      max_speed: route15Stats.maxSpeed,
      color: ROUTE_COLORS[12]
    })
  }

  // Ruta 16: Valeria Morales - Tacna
  const route16Points = generateGPSPoints(
    -18.0148,
    -70.2533,
    34,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0)
  )
  const route16Stats = calculateRouteStats(route16Points)
  const firstPoint16 = route16Points[0]
  const lastPoint16 = route16Points[route16Points.length - 1]
  
  if (firstPoint16 && lastPoint16 && mockUsers[13]) {
    routes.push({
      id: 'route-16',
      user_id: 14,
      user: mockUsers[13],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint16.timestamp,
      end_time: lastPoint16.timestamp,
      points: route16Points,
      stops: detectStops(route16Points, 6),
      total_distance: route16Stats.totalDistance,
      total_duration: route16Stats.totalDuration,
      average_speed: route16Stats.avgSpeed,
      max_speed: route16Stats.maxSpeed,
      color: ROUTE_COLORS[13]
    })
  }

  // Ruta 17: Andrés Paredes - Puno
  const route17Points = generateGPSPoints(
    -15.8402,
    -70.0219,
    37,
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0)
  )
  const route17Stats = calculateRouteStats(route17Points)
  const firstPoint17 = route17Points[0]
  const lastPoint17 = route17Points[route17Points.length - 1]
  
  if (firstPoint17 && lastPoint17 && mockUsers[14]) {
    routes.push({
      id: 'route-17',
      user_id: 15,
      user: mockUsers[14],
      date: today.toISOString().split('T')[0] || '',
      start_time: firstPoint17.timestamp,
      end_time: lastPoint17.timestamp,
      points: route17Points,
      stops: detectStops(route17Points, 8),
      total_distance: route17Stats.totalDistance,
      total_duration: route17Stats.totalDuration,
      average_speed: route17Stats.avgSpeed,
      max_speed: route17Stats.maxSpeed,
      color: ROUTE_COLORS[14]
    })
  }

  return routes
}

// 🎯 Composable principal
export const useRutas = () => {
  const routes = ref<Route[]>(generateMockRoutes())
  const users = ref<AttendanceUser[]>(mockUsers)
  const selectedRoute = ref<Route | null>(null)
  const filters = ref<RouteFilters>({})
  const loading = ref(false)
  
  // Configuración inicial del mapa (Lima, Perú)
  const mapConfig = ref<MapConfig>({
    center: [-12.0464, -77.0428],
    zoom: 12,
    stopMinDuration: 5
  })

  // 🔍 Filtrar rutas
  const filteredRoutes = computed(() => {
    let result = routes.value

    if (filters.value.user_id) {
      result = result.filter(r => r.user_id === filters.value.user_id)
    }

    if (filters.value.start_date) {
      result = result.filter(r => r.date >= filters.value.start_date!)
    }

    if (filters.value.end_date) {
      result = result.filter(r => r.date <= filters.value.end_date!)
    }

    if (filters.value.min_distance) {
      result = result.filter(r => r.total_distance >= filters.value.min_distance!)
    }

    if (filters.value.max_distance) {
      result = result.filter(r => r.total_distance <= filters.value.max_distance!)
    }

    return result
  })

  // 📊 Calcular estadísticas generales
  const stats = computed<RouteStats>(() => {
    const filtered = filteredRoutes.value
    
    if (filtered.length === 0) {
      return {
        total_routes: 0,
        total_distance: 0,
        total_duration: 0,
        average_distance: 0,
        average_duration: 0
      }
    }

    const totalDistance = filtered.reduce((sum, r) => sum + r.total_distance, 0)
    const totalDuration = filtered.reduce((sum, r) => sum + r.total_duration, 0)

    // Usuario más activo
    const userRouteCounts = filtered.reduce((acc, r) => {
      acc[r.user_id] = (acc[r.user_id] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const mostActiveUserId = Object.entries(userRouteCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0]

    return {
      total_routes: filtered.length,
      total_distance: Math.round(totalDistance * 100) / 100,
      total_duration: Math.round(totalDuration),
      average_distance: Math.round((totalDistance / filtered.length) * 100) / 100,
      average_duration: Math.round(totalDuration / filtered.length),
      most_active_user: mostActiveUserId 
        ? users.value.find(u => u.id === Number(mostActiveUserId))
        : undefined
    }
  })

  // 🎯 Seleccionar una ruta específica
  const selectRoute = (routeId: string | null) => {
    if (!routeId) {
      selectedRoute.value = null
      return
    }
    selectedRoute.value = routes.value.find(r => r.id === routeId) || null
  }

  // 🔄 Actualizar filtros
  const updateFilters = (newFilters: Partial<RouteFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  // 🧹 Limpiar filtros
  const clearFilters = () => {
    filters.value = {}
    selectedRoute.value = null
  }

  // 📍 Obtener límites del mapa para todas las rutas visibles
  const getMapBounds = () => {
    const allPoints = filteredRoutes.value.flatMap(r => r.points)
    
    if (allPoints.length === 0) return null

    const lats = allPoints.map(p => p.latitude)
    const lngs = allPoints.map(p => p.longitude)

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    }
  }

  // 🎨 Generar color único para usuario
  const getUserColor = (userId: number) => {
    return ROUTE_COLORS[(userId - 1) % ROUTE_COLORS.length]
  }

  // 📅 Obtener rutas de un usuario específico
  const getUserRoutes = (userId: number) => {
    return routes.value.filter(r => r.user_id === userId)
  }

  // 🕒 Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // 📏 Formatear distancia
  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`
    }
    return `${km.toFixed(2)}km`
  }

  return {
    // Estado
    routes,
    users,
    selectedRoute,
    filters,
    loading,
    mapConfig,
    
    // Computadas
    filteredRoutes,
    stats,
    
    // Métodos
    selectRoute,
    updateFilters,
    clearFilters,
    getMapBounds,
    getUserColor,
    getUserRoutes,
    formatDuration,
    formatDistance
  }
}
