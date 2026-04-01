<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import {
  employeeConceptOptions,
  type EmployeeConceptPayload,
  type MovilityReport,
} from "~/interfaces/movility-report";

const open = defineModel<boolean>("isOpen");

const props = defineProps<{
  employee: MovilityReport | null;
  defaultStart?: string;
  defaultEnd?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", payload: EmployeeConceptPayload): void;
}>();

const form = reactive({
  employee_id: null as number | null,
  emp_code: "",
  concept_id: null as number | null,
  start_date: "",
  end_date: "",
  comment: "",
});

const isLoading = computed(() => props.loading ?? false);

const employeeLabel = computed(() => {
  const emp = props.employee?.employee;
  if (!emp) return "Sin empleado seleccionado";
  return `${emp.last_name}, ${emp.first_name}`;
});

const setDefaults = () => {
  form.employee_id = props.employee?.employee?.id ?? null;
  form.emp_code =
    props.employee?.employee?.emp_code ?? props.employee?.employee?.dni ?? "";
  form.concept_id = null;
  form.start_date = props.defaultStart ?? "";
  form.end_date = props.defaultEnd ?? "";
  form.comment = "";
};

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) setDefaults();
  }
);

watch(
  () => [props.employee, props.defaultStart, props.defaultEnd],
  () => {
    if (open.value) setDefaults();
  }
);

const dateRangeInvalid = computed(() => {
  if (!form.start_date || !form.end_date) return false;
  return form.end_date < form.start_date;
});

const canSubmit = computed(() => {
  return Boolean(
    form.employee_id &&
      form.emp_code &&
      form.concept_id &&
      form.start_date &&
      form.end_date &&
      !dateRangeInvalid.value
  );
});

const close = () => {
  if (isLoading.value) return;
  open.value = false;
};

const submit = () => {
  if (!canSubmit.value || isLoading.value || !form.employee_id) return;

  emit("submit", {
    employee_id: form.employee_id,
    emp_code: form.emp_code.trim(),
    concept_id: form.concept_id ?? 0,
    start_date: form.start_date,
    end_date: form.end_date,
    comment: form.comment.trim() ? form.comment.trim() : null,
  });
};
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ title: 'py-5 px-6', content: 'max-w-2xl' }"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4ff] text-[#2d5fc0]"
        >
          <span class="i-lucide-plus"></span>
        </div>
        <div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-50">
            Registrar concepto
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Asigna un concepto al periodo seleccionado
          </p>
        </div>
      </div>
    </template>
    <template #body>
      <form class="relative p-6 space-y-5" @submit.prevent="submit">
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm"
        >
          <div class="h-8 w-8 rounded-full border-2 border-[#2d5fc0] border-t-transparent animate-spin"></div>
          <p class="mt-3 text-xs font-medium text-gray-600 dark:text-gray-400">
            Registrando concepto...
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Empleado
            </label>
            <input
              :value="employeeLabel"
              disabled
              class="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Codigo / DNI
            </label>
            <input
              v-model="form.emp_code"
              disabled
              class="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Desde
            </label>
            <input
              v-model="form.start_date"
              type="date"
              :max="form.end_date || undefined"
              class="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Hasta
            </label>
            <input
              v-model="form.end_date"
              type="date"
              :min="form.start_date || undefined"
              class="mt-1 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
            />
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2"
          >
            Concepto
          </label>
          <div class="grid gap-2">
            <label
              v-for="opt in employeeConceptOptions"
              :key="opt.id"
              class="flex items-start gap-3 rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 hover:bg-[#eef4ff] dark:hover:bg-[#13203a] cursor-pointer"
              :class="{ 'opacity-60 pointer-events-none': isLoading }"
            >
              <input
                v-model.number="form.concept_id"
                type="radio"
                :value="opt.id"
                :disabled="isLoading"
                class="mt-1 h-4 w-4"
              />
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {{ opt.label }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ opt.description }}
                </div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label
            class="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1"
          >
            Comentario (opcional)
          </label>
          <textarea
            v-model="form.comment"
            rows="3"
            :disabled="isLoading"
            class="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
            placeholder="Agregar observaciones..."
          ></textarea>
        </div>

        <p v-if="dateRangeInvalid" class="text-xs text-red-600">
          La fecha fin debe ser mayor o igual a la fecha inicio.
        </p>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="close"
            :disabled="isLoading"
            class="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="!canSubmit || isLoading"
            class="rounded-md bg-[#2d5fc0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#244fa4] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Registrar
          </button>
        </div>
      </form>
    </template>
  </UModal>
</template>

<style scoped></style>
