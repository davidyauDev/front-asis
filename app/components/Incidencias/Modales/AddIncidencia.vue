<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { apiFetch } from "~/services/api";

type FormIncidencia = {
  fecha: string;
  descripcion: string;
  minutos: number | undefined;
  duracionSegundos?: number | undefined;
  tipo: string | undefined;
  motivo: string;
};

const toast = useToast();

const open = defineModel<boolean>("isOpen");
const props = defineProps<{ usuarioNombre?: string; empleadoId?: number | null }>();

const emit = defineEmits<{
  (e: "submit", data: FormIncidencia): void;
}>();

const form = ref<FormIncidencia>({
  fecha: "",
  descripcion: "",
  minutos: undefined,
  duracionSegundos: undefined,
  tipo: undefined,
  motivo: "",
});

const motivoTouched = shallowRef(false);
const motivoError = computed(() => {
  if (!motivoTouched.value) return null;
  return form.value.motivo.trim() ? null : "El motivo es obligatorio";
});

const duracionHoras = shallowRef<string>("");
const duracionMinutos = shallowRef<string>("");
const duracionSegundos = shallowRef<string>("");

const tardanza = shallowRef<number | null>(null);
const tardanzaLoading = shallowRef(false);
const tardanzaError = shallowRef<string | null>(null);

const tardanzaLabel = computed(() => {
  if (tardanza.value == null) return null;
  return formatDurationLabel(tardanza.value);
});

const tiposIncidencia = ref([
  { label: "Descanso Medico", value: "DESCANSO_MEDICO" },
  { label: "Falta", value: "FALTA" },
  { label: "Trabajo en Campo", value: "TRABAJO_EN_CAMPO" },
  { label: "Llegada Tarde", value: "LLEGADA_TARDE" },
  { label: "Salida Temprano", value: "SALIDA_TEMPRANO" },
  { label: "Otras", value: "OTRAS" },
]);

const tiposSinMinutos = readonly(["DESCANSO_MEDICO", "FALTA", "TRABAJO_EN_CAMPO"]);

const requiereMinutos = computed(
  () => !!form.value.tipo && !tiposSinMinutos.includes(form.value.tipo)
);

const calendarDate = computed<CalendarDate | undefined>({
  get: () => {
    if (!form.value.fecha) return undefined;
    const [y, m, d] = form.value.fecha.split("-").map(Number);
    if (!y || !m || !d) return undefined;
    return new CalendarDate(y, m, d);
  },
  set: (value) => {
    if (!value) {
      form.value.fecha = "";
      return;
    }
    const mm = String(value.month).padStart(2, "0");
    const dd = String(value.day).padStart(2, "0");
    form.value.fecha = `${value.year}-${mm}-${dd}`;
  },
});

watch(open, (isOpen) => {
  if (!isOpen) resetForm();
});

function parseNonNegativeInt(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.trunc(n));
}

function formatDurationLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.trunc(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const clock = h > 0
    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const parts = [];
  if (h > 0) parts.push(`${h} h`);
  if (m > 0) parts.push(`${m} min`);
  if (s > 0 || parts.length === 0) parts.push(`${s} s`);

  return `${parts.join(" ")} (${clock})`;
}

watch(
  () => form.value.duracionSegundos,
  (totalSeconds) => {
    if (!totalSeconds || totalSeconds < 1) {
      duracionHoras.value = "";
      duracionMinutos.value = "";
      duracionSegundos.value = "";
      return;
    }

    const safeTotal = Math.max(0, Math.trunc(totalSeconds));
    duracionHoras.value = String(Math.floor(safeTotal / 3600));
    duracionMinutos.value = String(Math.floor((safeTotal % 3600) / 60));
    duracionSegundos.value = String(safeTotal % 60);
  },
  { immediate: true }
);

watch(
  () => [duracionHoras.value, duracionMinutos.value, duracionSegundos.value, requiereMinutos.value] as const,
  () => {
    if (!requiereMinutos.value) {
      form.value.duracionSegundos = undefined;
      form.value.minutos = undefined;
      return;
    }

    const horas = parseNonNegativeInt(duracionHoras.value) ?? 0;
    const minutos = parseNonNegativeInt(duracionMinutos.value) ?? 0;
    const segundos = parseNonNegativeInt(duracionSegundos.value) ?? 0;
    const total = horas * 3600 + minutos * 60 + segundos;

    form.value.duracionSegundos = total > 0 ? total : undefined;
    form.value.minutos = total > 0 ? Math.floor(total / 60) : undefined;
  }
);

function timeToSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":").map((p) => Number(p));
  if (parts.length < 2 || parts.length > 3) return null;
  if (parts.some((p) => !Number.isFinite(p))) return null;

  const [h, m, s = 0] = parts;
  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return null;
  return h * 3600 + m * 60 + s;
}

function resolveTardanzaSegundos(row: any): number | null {
  const exactSecondsCandidates = [
    row?.tardanza_segundos,
    row?.Tardanza_segundos,
    row?.tardanzaSegundos,
    row?.TardanzaSegundos,
  ];

  for (const candidate of exactSecondsCandidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return Math.max(0, Math.trunc(candidate));
    }
    if (candidate != null && candidate !== "" && Number.isFinite(Number(candidate))) {
      return Math.max(0, Math.trunc(Number(candidate)));
    }
  }

  const exactClockCandidates = [
    row?.tardanza_hhmmss,
    row?.Tardanza_hhmmss,
    row?.tardanzaHhmmss,
    row?.TardanzaHhmmss,
  ];

  for (const candidate of exactClockCandidates) {
    const seconds = timeToSeconds(candidate);
    if (seconds != null) return seconds;
  }

  const horarioSec = timeToSeconds(row?.Horario);
  const ingresoSec = timeToSeconds(row?.Ingreso);

  if (horarioSec != null && ingresoSec != null) {
    return Math.max(0, ingresoSec - horarioSec);
  }

  const raw = row?.Tardanza;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(0, Math.trunc(raw * 60));
  }
  if (raw != null && raw !== "" && Number.isFinite(Number(raw))) {
    return Math.max(0, Math.trunc(Number(raw) * 60));
  }

  return null;
}

async function cargarTardanza() {
  if (!props.empleadoId || !form.value.fecha) {
    tardanza.value = null;
    tardanzaError.value = null;
    return;
  }

  tardanzaLoading.value = true;
  tardanzaError.value = null;

  try {
    const res = await apiFetch("/api/reporte-asistencia/today", {
      method: "POST",
      body: JSON.stringify({
        empleado_ids: [props.empleadoId],
        fecha: form.value.fecha,
      }),
    });

    const list = Array.isArray(res) ? res : res?.data;
    const row =
      Array.isArray(list) && list.length
        ? list.find(
            (r: any) =>
              String(r?.Empleado_id) === String(props.empleadoId) &&
              String(r?.Fecha) === String(form.value.fecha)
          ) ?? list[0]
        : null;
    const value = resolveTardanzaSegundos(row);

    tardanza.value = value;

    const horasActual = duracionHoras.value.trim();
    const minutosActual = duracionMinutos.value.trim();
    const segundosActual = duracionSegundos.value.trim();
    const sinDuracion =
      (!horasActual || horasActual === "0") &&
      (!minutosActual || minutosActual === "0") &&
      (!segundosActual || segundosActual === "0");

    if (value != null && value > 0 && !form.value.duracionSegundos && sinDuracion) {
      const safeTotal = Math.max(0, Math.trunc(value));
      duracionHoras.value = String(Math.floor(safeTotal / 3600));
      duracionMinutos.value = String(Math.floor((safeTotal % 3600) / 60));
      duracionSegundos.value = String(safeTotal % 60);
    }
  } catch (e: any) {
    tardanza.value = null;
    tardanzaError.value = e?.message || "No se pudo obtener la tardanza.";
  } finally {
    tardanzaLoading.value = false;
  }
}

function usarTardanza() {
  if (!tardanza.value || tardanza.value < 1) return;
  form.value.duracionSegundos = tardanza.value;
  form.value.minutos = Math.floor(tardanza.value / 60);
}

watch(
  () => [props.empleadoId, form.value.fecha] as const,
  () => {
    cargarTardanza();
  }
);

function guardarIncidencia() {
  motivoTouched.value = true;
  const motivo = form.value.motivo.trim();
  if (!motivo) {
    toast.add({
      title: "Motivo obligatorio",
      description: "Ingresa el motivo para poder guardar la incidencia.",
      color: "error",
    });
    return;
  }

  form.value.motivo = motivo;
  emit("submit", { ...form.value });
  open.value = false;
}

function resetForm() {
  form.value = {
    fecha: "",
    descripcion: "",
    minutos: undefined,
    duracionSegundos: undefined,
    tipo: undefined,
    motivo: "",
  };
  motivoTouched.value = false;
  duracionHoras.value = "";
  duracionMinutos.value = "";
  duracionSegundos.value = "";
  tardanza.value = null;
  tardanzaLoading.value = false;
  tardanzaError.value = null;
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
        <!-- TÃTULO -->
        
        <!-- FORMULARIO -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1 text-gray-700">
              Fecha
            </label>
            <div class="flex gap-2 items-start">
              <UInput
                type="date"
                v-model="form.fecha"
                class="w-full"
                size="lg"
                :ui="{ rounded: 'rounded-lg' }"
              />

              <UPopover>
                <UButton
                  size="lg"
                  color="gray"
                  variant="outline"
                  icon="i-heroicons-calendar-days"
                  class="rounded-lg"
                  title="Abrir calendario"
                />
                <template #panel>
                  <div class="p-2">
                    <UCalendar v-model="calendarDate" locale="es" />
                  </div>
                </template>
              </UPopover>
            </div>

            <div
              v-if="form.fecha && props.empleadoId"
              class="mt-2 text-xs text-gray-600 flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-2">
                <span class="font-semibold">Tardanza:</span>
                <span v-if="tardanzaLoading" class="italic text-gray-500">
                  Consultando...
                </span>
                <span v-else-if="tardanzaError" class="text-red-600">
                  {{ tardanzaError }}
                </span>
                <span v-else class="font-mono">
                  {{ tardanzaLabel ?? "Sin datos" }}
                </span>
              </div>

              <UButton
                v-if="tardanza && tardanza > 0"
                size="xs"
                color="primary"
                variant="ghost"
                class="rounded-lg"
                @click="usarTardanza"
              >
                Usar
              </UButton>
            </div>
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

          <template v-if="requiereMinutos">
            <div>
              <label class="block font-semibold mb-1 text-gray-700">
                Horas
              </label>
              <UInput
                v-model="duracionHoras"
                type="number"
                min="0"
                placeholder="0"
                class="w-full"
                size="lg"
                :ui="{ rounded: 'rounded-lg' }"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1 text-gray-700">
                Minutos
              </label>
              <UInput
                v-model="duracionMinutos"
                type="number"
                min="0"
                max="59"
                placeholder="0"
                class="w-full"
                size="lg"
                :ui="{ rounded: 'rounded-lg' }"
              />
            </div>

            <div>
              <label class="block font-semibold mb-1 text-gray-700">
                Segundos
              </label>
              <UInput
                v-model="duracionSegundos"
                type="number"
                min="0"
                max="59"
                placeholder="0"
                class="w-full"
                size="lg"
                :ui="{ rounded: 'rounded-lg' }"
              />
            </div>
          </template>

          <div
            v-else-if="form.tipo"
            class="col-span-2 text-xs text-gray-500 italic flex items-center gap-1"
          >
            <span class="i-heroicons-information-circle text-base text-blue-400" />
            Este tipo de incidencia no requiere minutos.
          </div>

          <div class="col-span-2">
            <label class="block font-semibold mb-1 text-gray-700">
              Motivo <span class="text-red-500">*</span>
            </label>
            <UTextarea
              v-model="form.motivo"
              required
              :rows="3"
              class="w-full"
              :ui="{ rounded: 'rounded-lg' }"
              placeholder="Describe el motivo..."
              @blur="motivoTouched = true"
            />
            <p v-if="motivoError" class="mt-1 text-xs text-red-600">
              {{ motivoError }}
            </p>
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
