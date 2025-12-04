<template>
  <UModal v-model:open="open" title="Vista previa del mapa">
    <template #content>
      <div class="p-4 h-screen">
        <h2 class="text-lg font-bold mb-3">Ubicación</h2>

        <LMap v-if="latLng" :zoom="20" :center="latLng">
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LMarker :lat-lng="latLng" />
        </LMap>

        <p v-else class="text-red-500 text-sm">
          No se pudo obtener la ubicación.
        </p>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true });

const { mapUrl } = defineProps<{ mapUrl: string }>();

const latLng = computed(() => {
  if (!mapUrl) return null;

  const q = new URL(mapUrl).searchParams.get("q");
  if (!q) return null;

  const [lat, lng] = q.split(",").map(Number);

  return (isNaN(lat) || isNaN(lng)) ? null : [lat, lng];
});
</script>
