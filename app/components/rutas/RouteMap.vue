<template>
  <div class="map-wrapper">
    <LMap ref="mapRef" :zoom="5.5" :center="mapCenter" :use-global-leaflet="false">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LMarker v-for="r in routesToDraw" :key="`marker-${r.id}`" :lat-lng="r.lastPoint">
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
const defaultMapCenter: [number, number] = [-9.19, -75.0152];
const mapCenter = ref<[number, number]>(defaultMapCenter);
const mapRef = ref()


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
  () => [props.targetCenter?.toString(), props.route?.id].toString(),
  () => {
    const newCenter = props.targetCenter;
    if (mapRef.value) {
      if (newCenter && mapRef.value) {
        mapRef.value.leafletObject.flyTo(newCenter, 14, { duration: 1.2 });
      }
      else {
        const defaultZoom = 5.5;
        const defaultCenter: [number, number] = [-9.19, -75.0152];
        mapRef.value.leafletObject.setView(defaultCenter, defaultZoom, { animate: true, duration: 1.2 });
        mapCenter.value = defaultCenter;
      }
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
