<template>
  <div class="map-wrapper">
    <LMap ref="mapRef" :zoom="5.5" :center="mapCenter" :use-global-leaflet="false">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LMarker
        v-for="r in routesToDraw"
        :key="`marker-${r.id}`"
        :lat-lng="r.lastPoint"
      >
        <LPopup>
          <strong>{{ r.user.name }}</strong><br />
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
   targetCenter?: [number, number] | null
}>()

const mapRef = ref()

const mapCenter: [number, number] = [-9.19, -75.0152];

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

watch(
  () => props.targetCenter,
  (newCenter) => {
    if (newCenter && mapRef.value) {
      mapRef.value.leafletObject.flyTo(newCenter, 14, { duration: 1.2 });
    }
  }
);


</script>
<style scoped>
.map-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}
@import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
</style>
