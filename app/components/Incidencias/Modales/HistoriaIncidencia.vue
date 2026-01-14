<script setup lang="ts">
import { ref } from 'vue';
import { apiFetch } from '~/services/api';

const open = defineModel<boolean>("isOpen");

const props = defineProps<{
  historialUser: any
}>();

const emit = defineEmits(['refetch']);

const toast = useToast();
const editandoId = ref<string | null>(null);
const valorEdicion = ref('');
const motivoEdicion = ref('');
const eliminandoId = ref<string | null>(null);

const iniciarEdicion = (fecha: string, dia: any) => {
  editandoId.value = fecha;
  valorEdicion.value = dia.valor;
  motivoEdicion.value = dia.motivo || '';
};

const cancelarEdicion = () => {
  editandoId.value = null;
  valorEdicion.value = '';
  motivoEdicion.value = '';
};

const guardarEdicion = async (fecha: string) => {
  try {
    await apiFetch(`/api/incidencias/${props.historialUser.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        fecha,
        tipo: valorEdicion.value,
        motivo: motivoEdicion.value
      })
    });

    toast.add({
      title: 'Incidencia actualizada',
      description: 'Los cambios se guardaron correctamente',
      color: 'success'
    });

    editandoId.value = null;
    emit('refetch');
  } catch (error) {
    console.error('Error al editar incidencia:', error);
    toast.add({
      title: 'Error',
      description: 'No se pudo actualizar la incidencia',
      color: 'error'
    });
  }
};

const confirmarEliminacion = (fecha: string) => {
  eliminandoId.value = fecha;
};

const eliminarIncidencia = async (fecha: string) => {
  try {
    await apiFetch(`/api/incidencias/${props.historialUser.id}/${fecha}`, {
      method: 'DELETE'
    });

    toast.add({
      title: 'Incidencia eliminada',
      description: 'El registro se eliminó correctamente',
      color: 'success'
    });

    eliminandoId.value = null;
    emit('refetch');
  } catch (error) {
    console.error('Error al eliminar incidencia:', error);
    toast.add({
      title: 'Error',
      description: 'No se pudo eliminar la incidencia',
      color: 'error'
    });
  }
};

</script>


<template>
  <UModal
    v-model:open="open"
    size="lg"
    :close="{ color: 'primary', variant: 'outline', class: 'rounded-full' }"
    class="max-w-2xl w-full"
  >
    <template #header>
      <div class="flex flex-col gap-1">
        <h3 class="text-lg font-semibold text-gray-900">Historial de Incidencias</h3>
        <p class="text-sm text-gray-500">{{ props.historialUser.nombre }} {{ props.historialUser.apellidos }}</p>
      </div>
    </template>

    <template #body>
      <div class="grid grid-cols-3 gap-3 pb-4 mb-4 border-b">
        <div class="space-y-1">
          <p class="text-xs text-gray-500">Bruto</p>
          <p class="text-sm font-mono font-medium text-gray-900">{{ props.historialUser.bruto_hhmm }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-xs text-gray-500">Incidencias</p>
          <p class="text-sm font-mono font-medium text-gray-900">{{ props.historialUser.incidencias_hhmm }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-xs text-gray-500">Neto</p>
          <p class="text-sm font-mono font-medium text-gray-900">{{ props.historialUser.neto_hhmm }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <div
          v-for="(dia, fecha) in props.historialUser.dias"
          :key="fecha"
          class="group relative"
        >
          <!-- Modo normal -->
          <div 
            v-if="editandoId !== fecha" 
            class="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ fecha }}</p>
              <p v-if="dia.motivo" class="text-xs text-gray-500 truncate">{{ dia.motivo }}</p>
            </div>
            
            <div class="flex items-center gap-2 ml-3">
              <span class="font-mono text-xs px-2 py-1 rounded border"
                :class="[
                  dia.valor === 'F' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                  dia.valor === 'DM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  dia.valor === 'V' ? 'bg-green-50 text-green-700 border-green-200' :
                  dia.valor === 'TC' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(dia.valor) ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                ]">
                {{ dia.valor }}
              </span>

              <div class="flex items-center gap-0.5">
                <UButton
                  size="xs"
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-pencil-square"
                  square
                  @click="iniciarEdicion(fecha, dia)"
                />
                
                <UButton
                  size="xs"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  square
                  @click="confirmarEliminacion(fecha)"
                />
              </div>
            </div>
          </div>

          <!-- Modo edición -->
          <div v-else class="px-3 py-3 rounded-md border-2 border-blue-200 bg-blue-50/50">
            <div class="space-y-2">
              <p class="text-xs font-medium text-gray-700">{{ fecha }}</p>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Tipo</label>
                  <UInput
                    v-model="valorEdicion"
                    size="sm"
                    placeholder="F, DM, V..."
                    class="font-mono text-xs"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Motivo</label>
                  <UInput
                    v-model="motivoEdicion"
                    size="sm"
                    placeholder="Descripción"
                    class="text-xs"
                  />
                </div>
              </div>

              <div class="flex items-center gap-1.5 pt-1">
                <UButton
                  size="xs"
                  color="primary"
                  @click="guardarEdicion(fecha)"
                >
                  Guardar
                </UButton>
                <UButton
                  size="xs"
                  color="gray"
                  variant="ghost"
                  @click="cancelarEdicion"
                >
                  Cancelar
                </UButton>
              </div>
            </div>
          </div>

          <!-- Confirmación de eliminación -->
          <div v-if="eliminandoId === fecha" class="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-md border-2 border-red-200">
            <div class="text-center px-4">
              <p class="text-sm font-medium text-gray-900 mb-2">¿Eliminar?</p>
              <div class="flex items-center gap-2 justify-center">
                <UButton
                  size="xs"
                  color="red"
                  @click="eliminarIncidencia(fecha)"
                >
                  Confirmar
                </UButton>
                <UButton
                  size="xs"
                  color="gray"
                  variant="ghost"
                  @click="eliminandoId = null"
                >
                  Cancelar
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
