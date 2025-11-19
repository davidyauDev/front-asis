<template>
  <div class="map-wrapper">
    <LMap ref="mapRef" :zoom="5.5" :center="mapCenter" :use-global-leaflet="false">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <!-- Dibujar líneas -->
      <LPolyline
        v-for="r in routesToDraw"
        :key="`line-${r.id}`"
        :lat-lngs="r.pointsLatLng"
        :color="r.color"
        :weight="selectedRoute ? 6 : 4"
        :opacity="selectedRoute ? 1 : 0.75"
      />

      <!-- Dibujar markers -->
      <LMarker
        v-for="r in routesToDraw"
        :key="`marker-${r.id}`"
        :lat-lng="r.lastPoint"
      >
        <LIcon :icon-anchor="[12, 24]">
          <svg width="28" height="28" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" :fill="r.color"></circle>
            <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">
              {{ selectedRoute ? 'S' : 'U' }}
            </text>
          </svg>
        </LIcon>

        <LPopup>
          <strong>{{ r.user.name }}</strong><br />
          <small>{{ formatTime(r.end_time) }}</small>
        </LPopup>
      </LMarker>
    </LMap>
  </div>
</template>
<script setup lang="ts">
import type { Route } from '~/types'

const props = defineProps<{
  route?: Route | null
  allRoutes?: Route[]
}>()

const mapRef = ref()

const mapCenter = [-9.19, -75.0152]

const convertPoints = (route: Route) =>
  route.points
    .map(p => p && [p.latitude, p.longitude] as [number, number])
    .filter(Boolean)

const routesToDraw = computed(() => {
  const list = props.route ? [props.route] : (props.allRoutes || [])

  return list.map(r => {
    const pointsLatLng = convertPoints(r)
    const lastPoint = pointsLatLng.at(-1) || mapCenter

    return {
      ...r,
      pointsLatLng,
      lastPoint
    }
  })
})

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  })
</script>
<style scoped>
.map-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}
@import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
</style>
