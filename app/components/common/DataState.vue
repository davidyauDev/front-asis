<script setup lang="ts">
const props = defineProps({
    loading: Boolean,
    error: Boolean,
    errorMessage: {
        type: String,
        default: "No se pudieron cargar los datos."
    },
    showRetry: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(["retry"]);
</script>

<template>
    <!-- LOADING -->
    <template v-if="loading">
        <!-- slot personalizado -->
        <slot name="loading">
            <!-- Fallback DEFAULT loading -->
            <div class="space-y-3 py-4">
                <USkeleton class="h-6 w-full" />
                <USkeleton class="h-6 w-3/4" />
                <USkeleton class="h-6 w-1/2" />
            </div>
        </slot>
    </template>

    <!-- ERROR -->
    <template v-else-if="error">
        <slot name="error">
            <!-- Fallback DEFAULT error -->
            <div class="w-full flex gap-4 justify-center items-center text-center">
                <Icon name="lucide:alert-triangle" class="text-red-500" size="20" />

                <h2 class="text-sm font-semibold  text-red-600">
                    {{ errorMessage }}
                </h2>

                <UButton v-if="showRetry"
                 :loading="loading"
                color="error" variant="link" icon="i-lucide-refresh-cw" class="cursor-pointer" @click="emit('retry')" />
            </div>

        </slot>
    </template>

    <!-- SUCCESS -->
    <template v-else>
      
        <slot />
    </template>
</template>
