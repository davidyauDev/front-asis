<template>
  <div style="height: 100%; width: 100%; position: relative">
    <LMap
      ref="mapRef"
      :zoom="5.5"
      :center="[-9.19, -75.0152]"
      :use-global-leaflet="false"
      style="height:100%;width:100%"
    >
      <!-- OpenStreetMap Tile Layer -->
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <!-- Mostrar ruta seleccionada -->
      <template v-if="route && route.points && route.points.length > 0">
        <LPolyline
          :lat-lngs="routePoints"
          :color="route.color || '#3B82F6'"
          :weight="6"
          :lineCap="'round'"
          :lineJoin="'round'"
        />
        
        <!-- Inicio -->
        <LMarker v-if="startPoint" :lat-lng="startPoint">
          <LIcon :icon-anchor="[16, 32]">
            <svg width="32" height="32" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#3B82F6"></circle>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">S</text>
            </svg>
          </LIcon>
          <LPopup>
            <div class="popup-content">
              <strong>Inicio</strong><br />
              {{ route.user.name }}<br />
              <small>{{ formatTime(route.start_time) }}</small>
            </div>
          </LPopup>
        </LMarker>

        <!-- Fin -->
        <LMarker v-if="endPoint" :lat-lng="endPoint">
          <LIcon :icon-anchor="[16, 32]">
            <svg width="32" height="32" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#3B82F6"></circle>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">E</text>
            </svg>
          </LIcon>
          <LPopup>
            <div class="popup-content">
              <strong>Fin</strong><br />
              {{ route.user.name }}<br />
              <small>{{ formatTime(route.end_time) }}</small>
            </div>
          </LPopup>
        </LMarker>

        <!-- Paradas -->
        <LMarker
          v-for="(stop, idx) in route.stops"
          :key="stop.id"
          :lat-lng="[stop.latitude, stop.longitude]"
        >
          <LIcon :icon-anchor="[10, 10]">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" fill="#F59E0B"></circle>
            </svg>
          </LIcon>
          <LPopup>
            <div class="popup-content">
              <strong>Parada {{ idx + 1 }}</strong><br />
              <small>{{ Math.round(stop.duration) }} min</small>
            </div>
          </LPopup>
        </LMarker>
      </template>

      <!-- Mostrar todas las rutas de los usuarios -->
      <template v-else-if="allRoutes && allRoutes.length > 0">
        <LPolyline
          v-for="r in allRoutes"
          :key="r.id"
          :lat-lngs="getRoutePoints(r)"
          :color="r.color || '#3B82F6'"
          :weight="4"
          :opacity="0.75"
          :lineCap="'round'"
          :lineJoin="'round'"
        />

        <LMarker
          v-for="r in allRoutes"
          :key="`marker-${r.id}`"
          :lat-lng="getLastPosition(r)"
        >
          <LIcon :icon-anchor="[14, 28]">
            <svg width="28" height="28" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#3B82F6"></circle>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">U</text>
            </svg>
          </LIcon>
          <LPopup>
            <div class="popup-content">
              <strong>{{ r.user.name }}</strong><br />
              Última ubicación: {{ formatTime(r.end_time) }}<br />
              Distancia: {{ r.total_distance.toFixed(1) }} km<br />
              Duración: {{ formatDuration(r.total_duration) }}<br />
              Paradas: {{ r.stops.length }}
            </div>
          </LPopup>
        </LMarker>
      </template>
    </LMap>

    <!-- Botón flotante para centrar el mapa -->
    <button class="center-map-btn" @click="centerMap">
      📍
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Route } from '~/types'

const props = defineProps<{ route?: Route | null; config?: any; allRoutes?: Route[] }>()
const mapRef = ref()

/* ==== LIMPIAR LOS PUNTOS CORRECTAMENTE (SOLUCIÓN 1) ==== */
const getRoutePoints = (route: Route) => {
  return (route.points || [])
    .filter(
      (p) =>
        p &&
        typeof p.latitude === "number" &&
        typeof p.longitude === "number"
    )
    .map((p) => [p.latitude, p.longitude] as [number, number])
}

/* ==== RUTA PRINCIPAL ==== */
const routePoints = computed(() =>
  props.route ? getRoutePoints(props.route) : []
)

/* ======= PUNTOS INICIO/FIN ======= */
const startPoint = computed(() => routePoints.value[0] || null)
const endPoint = computed(() => routePoints.value[routePoints.value.length - 1] || null)

/* ===== FUNCIONES DE FORMATO ===== */
const getLastPosition = (route: Route) => {
  const pts = getRoutePoints(route)
  return pts.length ? pts[pts.length - 1] : [0, 0]
}

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })

const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const peruBounds = [
  [-18.35, -81.35],
  [-0.03, -68.65],
]

/* ===== CENTRAR MAPA ===== */
const centerMap = () => {
  const map = mapRef.value?.leafletObject
  if (map) map.fitBounds(peruBounds)
}

onMounted(() => centerMap())
</script>

<style scoped>
@import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

.center-map-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  cursor: pointer;
}

.center-map-btn:hover {
  background: #2563eb;
}

.popup-content {
  font-size: 12px;
  color: #333;
  line-height: 1.3;
}
</style>
