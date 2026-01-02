<script setup lang="ts">
type FormIncidencia = {
  fecha: string;
  descripcion: string;
  minutos: number | undefined;
  tipo: string | undefined;
  motivo: string;
};

const open = defineModel<boolean>("isOpen");

const emit = defineEmits<{
  (e: "submit", data: FormIncidencia): void;
}>();

const form = ref<FormIncidencia>({
  fecha: "",
  descripcion: "",
  minutos: undefined,
  tipo: undefined,
  motivo: "",
});

const tiposIncidencia = ref([
  { label: "Descanso Médico", value: "DESCANSO_MEDICO" },
  { label: "Falta", value: "FALTA" },
  { label: "Trabajo en Campo", value: "TRABAJO_EN_CAMPO" },
  { label: "Llegada Tarde", value: "LLEGADA_TARDE" },
  { label: "Salida Temprano", value: "SALIDA_TEMPRANO" },
  { label: "Otras", value: "OTRAS" },
]);

const tiposSinMinutos = readonly([
  "DESCANSO_MEDICO",
  "FALTA",
  "TRABAJO_EN_CAMPO",
]);

const requiereMinutos = computed(
  () => !!form.value.tipo && !tiposSinMinutos.includes(form.value.tipo)
);

watch(open, (isOpen) => {
  if (!isOpen) resetForm();
});

function guardarIncidencia() {
  emit("submit", { ...form.value });
  open.value = false;
}

function resetForm() {
  form.value = {
    fecha: "",
    descripcion: "",
    minutos: undefined,
    tipo: undefined,
    motivo: "",
  };
}
</script>


<template>
  <UModal
    v-model:open="open"
    :close="{ color: 'primary', variant: 'outline', class: 'rounded-full' }"
  >
    <template #body>
      <div class="space-y-4 text-sm">
        <div>
          <label class="block font-medium mb-1">Fecha</label>
          <UInput type="date" v-model="form.fecha" />
        </div>

        <div>
          <label class="block font-medium mb-1">Tipo de incidencia</label>
          <USelect
            v-model="form.tipo"
            :items="tiposIncidencia"
            placeholder="Seleccionar tipo"
          />
        </div>

        <div v-if="requiereMinutos">
          <label class="block font-medium mb-1">Minutos</label>
          <UInput type="number" min="1" v-model.number="form.minutos" />
        </div>

        <div v-else-if="form.tipo" class="text-xs text-gray-500 italic">
          Este tipo de incidencia no requiere minutos.
        </div>

        <div>
          <label class="block font-medium mb-1">Motivo</label>
          <UTextarea v-model="form.motivo" :rows="3" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="primary" @click="guardarIncidencia"> Guardar </UButton>
      </div>
    </template>
  </UModal>
</template>
