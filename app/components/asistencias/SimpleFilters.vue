<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Filtro por rango de fechas -->
        <UFormGroup label="Fecha de inicio">
          <UInput
            v-model="filters.start_date"
            type="date"
            placeholder="YYYY-MM-DD"
            size="sm"
          />
        </UFormGroup>

        <UFormGroup label="Fecha de fin">
          <UInput
            v-model="filters.end_date"
            type="date"
            placeholder="YYYY-MM-DD"
            size="sm"
          />
        </UFormGroup>

        <!-- Filtro por tipo de registro -->
        <UFormGroup label="Tipo de registro">
          <USelectMenu
            v-model="filters.type"
            :options="typeOptions"
            placeholder="Seleccionar tipo"
            size="sm"
            clearable
          />
        </UFormGroup>
      </div>

      <div class="mt-4 flex justify-end gap-3">
        <UButton type="reset" variant="outline" @click="onReset">
          Limpiar
        </UButton>
        <UButton type="submit" color="primary">
          Aplicar
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const filters = ref({
  start_date: '',
  end_date: '',
  type: ''
});

const typeOptions = [
  { label: 'Entrada', value: 'check_in' },
  { label: 'Salida', value: 'check_out' }
];

const onSubmit = () => {
  console.log('Filtros aplicados:', filters.value);
};

const onReset = () => {
  filters.value = {
    start_date: '',
    end_date: '',
    type: ''
  };
};
</script>

<style scoped>
/* Estilos adicionales para el componente */
</style>