<script setup lang="ts">
import { linkTicketAsset, listDeskAssets, type SystemTicket } from '~/services/sistemas-ti/tickets'

const open = defineModel<boolean>('open', { default: false })
const ticket = defineModel<SystemTicket | null>('ticket', { default: null })

const emit = defineEmits<{
  (e: 'saved'): void
}>()

const loading = ref(false)
const selectedSerial = ref('')

const assetItems = computed(() => {
  return listDeskAssets().map(item => ({
    label: `${item.name} (${item.serial})`,
    value: item.serial,
  }))
})

const selectedAsset = computed(() => {
  return listDeskAssets().find(item => item.serial === selectedSerial.value)
})

const disabled = computed(() => {
  if (!ticket.value) {
    return true
  }

  if (loading.value) {
    return true
  }

  return !selectedSerial.value
})

const save = async () => {
  if (disabled.value || !selectedAsset.value || !ticket.value) {
    return
  }

  loading.value = true
  try {
    await linkTicketAsset(ticket.value.id, ticket.value.responsible || 'Tecnico TI', selectedAsset.value)
    emit('saved')
    open.value = false
    selectedSerial.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-gray-200/70 bg-white dark:border-gray-800/70 dark:bg-gray-950">
        <div class="border-b border-gray-200/70 px-5 py-4 dark:border-gray-800/70">
          <div class="flex items-start gap-3">
            <div class="rounded-lg bg-primary/10 p-2">
              <UIcon name="i-lucide-monitor-smartphone" class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Asignar Equipo
              </h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Registra el activo relacionado al ticket seleccionado.
              </p>
              <p v-if="ticket" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ ticket.code }} · {{ ticket.title }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3 px-5 py-5">
          <USelect v-model="selectedSerial" :items="assetItems" placeholder="Seleccionar activo" />
          <div
            v-if="selectedAsset"
            class="rounded-lg border border-gray-200/70 bg-gray-50/70 px-3 py-2 text-sm dark:border-gray-800/70 dark:bg-gray-900/40"
          >
            <p class="font-semibold text-gray-900 dark:text-gray-100">
              {{ selectedAsset.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ selectedAsset.type }} · {{ selectedAsset.serial }} · {{ selectedAsset.status }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t border-gray-200/70 px-5 py-4 sm:flex-row sm:justify-end dark:border-gray-800/70">
          <UButton color="neutral" variant="outline" :disabled="loading" class="w-full sm:w-auto" @click="open = false">
            Cancelar
          </UButton>
          <UButton color="primary" :loading="loading" :disabled="disabled" class="w-full sm:w-auto" @click="save">
            {{ loading ? 'Asignando...' : 'Asignar equipo' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
