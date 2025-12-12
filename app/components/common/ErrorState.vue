<script setup lang="ts">
const props = defineProps({
    message: {
        type: String,
        default: "Ocurrió un error inesperado."
    },
    showRetry: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(["retry"]);
</script>

<template>
    <div class="w-full flex  items-center text-center py-10">
        <Icon name="lucide:alert-triangle" class="text-red-500" size="50" />

        <h2 class="text-xl font-semibold mt-4 text-red-600">
            {{ message }}
        </h2>

        <slot name="description" />

        <div v-if="showRetry" class="mt-5">
            <UButton color="error" variant="solid"
            
            @click="emit('retry')">
                Reintentar
            </UButton>
        </div>
    </div>
</template>

<style scoped></style>
