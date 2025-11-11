<template>
  <div v-if="selectedUsers.length > 0" class="mb-4">
    <UAlert
      color="primary"
      variant="soft"
      :title="`${selectedUsers.length} usuario${selectedUsers.length > 1 ? 's' : ''} seleccionado${selectedUsers.length > 1 ? 's' : ''}`"
      icon="i-lucide-check-square"
    >
      <template #description>
        <div class="flex items-center gap-2 mt-2">
          <UButton 
            size="sm" 
            variant="outline" 
            icon="i-lucide-mail"
            @click="$emit('sendEmail')"
          >
            Enviar email
          </UButton>
          <UButton 
            size="sm" 
            variant="outline" 
            icon="i-lucide-user-x" 
            color="error"
            @click="$emit('deactivateUsers')"
          >
            Desactivar
          </UButton>
          <UButton 
            size="sm" 
            variant="ghost" 
            icon="i-lucide-x"
            @click="$emit('clearSelection')"
          >
            Cancelar
          </UButton>
        </div>
      </template>
    </UAlert>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedUsers: number[]
}

interface Emits {
  (e: 'sendEmail'): void
  (e: 'deactivateUsers'): void
  (e: 'clearSelection'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>