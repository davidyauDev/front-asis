<template>
  
  <div class="map-wrapper">
    <!-- {{routesToDraw.map(r => r.lastPoint)}} -->
    <LMap ref="mapRef" :zoom="9" :center="mapCenter" 
      style="height: 100%; width: 100%;">
    >
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <LMarker v-for="r in routesToDraw" :key="`marker-${r.id}`" :lat-lng="r.lastPoint"
        :ref="el =>markerRefs[r.id] = el"
      >
       <LPopup
       
     >
  
    
    <div class="font-semibold text-gray-800  text-sm">
      {{ r.user.name }}
      <UBadge size="xs" :color="getAttendanceOp(r.type).color" variant="subtle" class="ml-2">
        {{ getAttendanceOp(r.type).label }}
      </UBadge>
    </div>

    <div class="mt-1 text-[11px] text-gray-500 ">
      Código: <span class="font-medium">{{ r.user.emp_code }}</span>
    </div>

    <div class="text-[11px] text-gray-500 ">
      Fecha: <span class="font-medium">{{ r.date }}</span>
    </div>

    <div class="text-[11px] text-gray-500 ">
      Dirección:
      <span class="font-medium">{{ r.address || 'N/A' }}</span>
    </div>

    <!-- Imagen -->
    <div v-if="r.image" class="mt-3">
      <img
        :src="r.image"
        alt="Foto de la ruta"
        class="w-full h-24 object-cover rounded-md border border-gray-300 dark:border-gray-700"
      />
    </div>


</LPopup>

        
      </LMarker>

    </LMap>
  </div>
</template>
<script setup lang="ts">
import type { Route } from '~/types'
import {getAttendanceOp} from '~/enums/attendance'

const props = defineProps<{
  route?: Route | null
  allRoutes?: Route[]
  targetCenter?: [number, number] | null
}>()

const defaultMapCenter: [number, number] = [-9.19, -75.0152];
const mapCenter = ref<[number, number]>(defaultMapCenter);
const mapRef = ref()
const markerRefs = reactive({})


const convertPoints = (route: Route) =>
  route.points
    .map(p => p && [p.latitude, p.longitude] as [number, number])
    .filter(Boolean)


    
const routesToDraw = computed(() => {
  const list = (props.allRoutes || [])



  return list.map(r => {
    const pointsLatLng = convertPoints(r)
    const lastPoint = jitterPoint([r.latitude, r.longitude])

    return {
      ...r,
      pointsLatLng,
      lastPoint
    }
  })
})

function jitterPoint([lat, lng]: [number, number]): [number, number] {
  const offset = 0.00008; // ~8 metros
  return [
    lat + (Math.random() * offset - offset / 2),
    lng + (Math.random() * offset - offset / 2)
  ];
}

// function onMapReady() {
//   const map = mapRef.value.leafletObject
//   map.flyTo([-12.10639808112252, -76.99208811516337], 15)
// }

watch(
  () => props.route,
  (route) => {
    if (!route || !mapRef.value) return;

    const map = mapRef.value.leafletObject;

    const newCenter: [number, number] = [route.latitude, route.longitude];

    map.flyTo(newCenter, 18, {
      duration: 1.5,
    });

    // Abrir popup del marker correspondiente
    setTimeout(() => {
      const marker = markerRefs[route.id]?.leafletObject;
      
      if (marker) {
        marker.openPopup();
      } else {
        console.warn("Popup marker not found for ID:", route.id);
      }
    }, 300);
  },
  { immediate: true }
);


watch(
  () => props.targetCenter,
  (newCenter) => {
    console.log("Target center changed:", newCenter);
    if (newCenter && mapRef.value) {
      const map = mapRef.value.leafletObject;
      map.setView(newCenter,5, {
        animate: true,
        duration: 1.0,
      });
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

/* @import "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; */
</style>
