<template>

    <UModal v-model:open="open" title="Vista previa del mapa">
        <template #content>

            <div class="p-4">
                <h2 class="text-lg font-bold mb-3">Ubicación</h2>

                <!-- <iframe :src="mapUrl" width="100%" height="450" style="border:0;" allowfullscreen loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe> -->

                <LMap :zoom="9" style="height: 100%; width: 100%;">
                    >
                    <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <LMarker :lat-lng="[latLng[0], latLng[1]]">



                    </LMarker>

                </LMap>

            </div>
        </template>
    </UModal>

</template>

<script setup lang="ts">


const open = defineModel < boolean > ('open', {
    required: true
});

const { mapUrl } = defineProps({
    mapUrl: String,

});

const latLng = computed(() => {
    if (!mapUrl) return;
    const params = new URL(mapUrl).searchParams.get("q") as string;
    const [lat, lng] = params?.split(",");
    return [+lat!, +lng!]
})


</script>
