<script setup lang="ts">
type FormIncidencia = {
  fecha: string;
  descripcion: string;
  minutos: number | undefined;
  tipo: string | undefined;
  motivo: string;
};

const open = defineModel<boolean>("isOpen");
const props = defineProps<{ usuarioNombre?: string }>();

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
    class="max-w-lg w-full"
  >
    <!-- BODY -->
     <template #title>
       <h2 class="text-lg font-bold text-primary-700 flex items-center gap-2">
          <span class="i-heroicons-clipboard-document-list text-xl text-primary-500" />
                 {{ props.usuarioNombre }}

          <span
            v-if="props.usuarioNombre"
            class="font-semibold text-emerald-600"
          >
          
          </span>
        </h2>
     </template>
    <template #body>
      <div class="space-y-4 px-4 py-3 bg-white rounded-xl shadow-sm">
        <!-- TÍTULO -->
        
        <!-- FORMULARIO -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-gray-700">
              Fecha
            </label>
            <UInput
              type="date"
              v-model="form.fecha"
              class="w-full"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </div>

          <div>
            <label class="block font-semibold mb-1 text-gray-700">
              Tipo de incidencia
            </label>
            <USelect
              v-model="form.tipo"
              :items="tiposIncidencia"
              placeholder="Seleccionar tipo"
              class="w-full"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </div>

          <div v-if="requiereMinutos">
            <label class="block font-semibold mb-1 text-gray-700">
              Minutos
            </label>
            <UInput
              type="number"
              min="1"
              v-model.number="form.minutos"
              class="w-full"
              size="lg"
              :ui="{ rounded: 'rounded-lg' }"
            />
          </div>

          <div
            v-else-if="form.tipo"
            class="col-span-2 text-xs text-gray-500 italic flex items-center gap-1"
          >
            <span class="i-heroicons-information-circle text-base text-blue-400" />
            Este tipo de incidencia no requiere minutos.
          </div>

          <div class="col-span-2">
            <label class="block font-semibold mb-1 text-gray-700">
              Motivo
            </label>
            <UTextarea
              v-model="form.motivo"
              :rows="3"
              class="w-full"
              :ui="{ rounded: 'rounded-lg' }"
              placeholder="Describe el motivo..."
            />
          </div>
        </div>
      </div>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="flex justify-end gap-2 px-4 py-3">
        <UButton
          color="gray"
          variant="outline"
          @click="open = false"
          class="rounded-lg"
        >
          Cancelar
        </UButton>

        <UButton
          color="primary"
          @click="guardarIncidencia"
          class="rounded-lg font-semibold px-5 py-2"
        >
          Guardar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
