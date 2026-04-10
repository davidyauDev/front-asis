<template>
  <DataState
    :loading="dataLoading"
    :error="dataError"
    error-message="No se pudo cargar los reportes de hoy"
    @retry="retryFetch"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="flex flex-1 items-center gap-2">
        <UInput
          icon="i-lucide-search"
          v-model="dailyTakenAttendaces.globalFilter"
          class="w-full sm:max-w-md"
          size="md"
          :disabled="overrideBlocked"
          :placeholder="overrideBlocked ? 'Selecciona usuarios para ver resultados...' : 'Buscar por nombre, apellido o DNI...'"
        />

        <UButton
          v-if="!overrideBlocked && dailyTakenAttendaces.globalFilter"
          type="button"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="sm"
          square
          class="shrink-0"
          @click="dailyTakenAttendaces.globalFilter = ''"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          color="neutral"
          variant="outline"
          size="md"
          :icon="filtersVisible ? 'i-lucide-panel-top-close' : 'i-lucide-panel-top-open'"
          class="min-w-[170px] justify-center whitespace-nowrap border-[#cfdcf7] bg-white text-[#30508f] font-semibold shadow-sm transition-all hover:bg-[#eef4ff] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
          @click="emit('toggle-filters')"
        >
          {{ filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros' }}
        </UButton>

        <UTooltip :text="canExport ? 'Descargar reporte en Excel' : 'No hay datos para exportar'">
          <UButton
            color="neutral"
            variant="solid"
            size="md"
            @click="exportarExcel"
            :loading="exportando"
            :disabled="exportando || !canExport"
            class="min-w-[190px] justify-center whitespace-nowrap border-transparent !bg-[#2d5fc0] !text-white font-semibold shadow-sm transition-all hover:!bg-[#244ea4] active:!bg-[#1d428d] disabled:shadow-none"
          >
            <template #leading>
              <UIcon name="i-lucide-file-spreadsheet" class="w-4 h-4" />
            </template>
            <span class="hidden sm:inline">
              {{ exportando ? 'Descargando...' : 'Descargar reporte' }}
            </span>
            <span class="sm:hidden">
              {{ exportando ? 'Descargando...' : 'Excel' }}
            </span>
          </UButton>
        </UTooltip>
      </div>

    </div>

    <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
      <UTable
        ref="table"
        :data="dailyListAttendaces"
        :columns="columns"
        :meta="{ class: { tr: rowClass } }"
        :loading="dataLoading"
        :ui="{
          base: 'min-w-full table-fixed border-separate border-spacing-0',
          root: 'relative max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-hidden',
          thead: 'sticky top-0 z-10 bg-[#2d5fc0] text-white border-b border-[#244ea4]',
          th: 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white',
          td: 'px-4 py-4 text-sm text-gray-900 dark:text-gray-100 align-top',
          tr: 'transition-colors hover:bg-[#f7f9ff] dark:hover:bg-gray-900/60',
          tbody: 'divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-950',
        }"
        :empty="emptyText"
      />
    </div>

    <div
      class="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
    >
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ dailyListAttendaces.length }}</span> registros
      </p>
    </div>
  </DataState>
  <UModal
    v-model:open="isIncidenciaOpen"
    :title="modalTitle"
    :transition="true"
  >
    <template #body>
      <div class="space-y-5">
        <div class="rounded-xl border border-amber-200 bg-amber-50/90 p-4 dark:border-amber-900 dark:bg-amber-950/25">
          <div class="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-100">
            <UIcon name="i-lucide-alert-circle" class="h-5 w-5" />
            <span v-if="!isPreIncidencia">Se detecto una tardanza</span>
            <span v-else>Aun no marco ingreso</span>
          </div>
          <p class="mt-1 text-sm text-amber-700 dark:text-amber-300">
            <span v-if="!isPreIncidencia">Registra el motivo para justificar esta incidencia.</span>
            <span v-else>Registra un recordatorio sin minutos. Se completara al aprobar.</span>
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              Fecha
            </p>
            <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ incidenciaForm.fecha }}
            </p>
          </div>

          <div
            v-if="!isPreIncidencia"
            class="rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950/25"
          >
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
              Tiempo de tardanza
            </p>
            <p class="mt-1 text-sm font-semibold text-orange-900 dark:text-orange-100">
              {{ tardanzaLabel }}
            </p>
          </div>
        </div>

        <UFormGroup
          label="Motivo de la incidencia"
          description="Describe brevemente el motivo"
          required
        >
          <UTextarea
            v-model="incidenciaForm.motivo"
            placeholder="Ej. trafico intenso, transporte publico, clima, etc."
            :rows="4"
            autofocus
            class="w-full"
          />
        </UFormGroup>

        <div class="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Imagen opcional</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG o WEBP. Maximo 5 MB.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                type="button"
                color="neutral"
                variant="outline"
                size="sm"
                icon="i-lucide-upload"
                @click="imagenInput?.click()"
              >
                {{ incidenciaForm.imagenFile || incidenciaForm.imagenUrl ? 'Cambiar imagen' : 'Subir imagen' }}
              </UButton>

              <UButton
                v-if="incidenciaForm.imagenFile"
                type="button"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-x"
                @click="clearImagenSeleccionada"
              >
                Quitar archivo
              </UButton>
            </div>
          </div>

          <input
            ref="imagenInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            class="hidden"
            @change="onImagenChange"
          />

          <p v-if="imagenError" class="text-sm font-medium text-red-600 dark:text-red-400">
            {{ imagenError }}
          </p>

          <div
            v-if="selectedImageUrl"
            class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
          >
            <img
              :src="selectedImageUrl"
              alt="Vista previa de la imagen de incidencia"
              class="h-48 w-full object-cover"
            />
          </div>

          <div
            v-if="incidenciaForm.imagenUrl && !incidenciaForm.imagenFile"
            class="flex items-start justify-between gap-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          >
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Imagen actual</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Puedes marcarla para eliminarla antes de guardar.
              </p>
            </div>

            <UCheckbox
              v-model="incidenciaForm.eliminarImagen"
              label="Eliminar imagen"
              :disabled="savingIncidencia"
            />
          </div>

          <div
            v-if="incidenciaForm.imagenFile"
            class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-100"
          >
            Nueva imagen lista para guardar.
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <UButton
          variant="outline"
          color="gray"
          size="sm"
          @click="isIncidenciaOpen = false"
        >
          Cancelar
        </UButton>

        <UButton
          variant="solid"
          color="gray"
          size="sm"
          :loading="savingIncidencia"
          :disabled="!incidenciaForm.motivo || savingIncidencia"
          @click="guardarIncidencia"
        >
          <UIcon name="i-lucide-save" class="mr-1.5 h-4 w-4" />
          {{ savingIncidencia ? 'Guardando…' : 'Guardar' }}
        </UButton>
      </div>
    </template>
  </UModal>

</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { parse } from "date-fns";
import DataState from "~/components/common/DataState.vue";
import { useAttendanceReportStore } from "~/store/useAttendanceReportStore";
import type { TakenAttendaceParams } from "~/composables/useAttendanceReport";

const props = defineProps<{
  paramsOverride?: TakenAttendaceParams | null
  filtersVisible?: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle-filters'): void
}>()

const config = useRuntimeConfig()
const store = useAttendanceReportStore();
const { getDailyTakenAttendances } = store;
const { attendance } = storeToRefs(store);
const toast = useToast()


const dailyTakenAttendaces = computed(() => attendance.value.taken.daily);
const overrideBlocked = computed(() => props.paramsOverride === null)

const requestParams = computed(() => {
  if (props.paramsOverride === null) return null
  return props.paramsOverride ?? dailyTakenAttendaces.value.params
})

const dataLoading = computed(() => (overrideBlocked.value ? false : dailyTakenAttendaces.value.loading))
const dataError = computed(() => (overrideBlocked.value ? false : dailyTakenAttendaces.value.isError))
const emptyText = computed(() =>
  overrideBlocked.value ? 'Selecciona usuarios para ver resultados' : 'No se encontraron reportes de hoy'
)

const retryFetch = () => {
  if (!requestParams.value) return
  return getDailyTakenAttendances(requestParams.value)
}

const dailyListAttendaces = computed<TakenAttendace[]>(() => {
  if (overrideBlocked.value) return []
  let list = dailyTakenAttendaces.value.list;

  if (dailyTakenAttendaces.value.globalFilter) {
    const search = dailyTakenAttendaces.value.globalFilter.toLowerCase().trim();

    list = list.filter((a) => {
      const nombres = (a.Nombres || "").toLowerCase();
      const apellidos = (a.Apellidos || "").toLowerCase();
      const dni = (a.DNI || "").toString().toLowerCase();

      return (
        nombres.includes(search) ||
        apellidos.includes(search) ||
        dni.includes(search)
      );
    });
  }

  return list;
});

const canExport = computed(() => dailyListAttendaces.value.length > 0)

type TakenAttendaceRow = TakenAttendace & {
  Tiene_Incidencia?: boolean;
  es_recordatorio?: boolean;
  Es_Recordatorio?: boolean;
  esRecordatorio?: boolean;
};

const getEsRecordatorio = (row: any) => {
  const original = row?.original as TakenAttendaceRow | undefined;
  if (!original) return false;
  return Boolean(
    original.es_recordatorio ??
      original.Es_Recordatorio ??
      original.esRecordatorio
  );
};

const isPreIncidenciaRow = (row: any) => getEsRecordatorio(row);

const isLateAttendance = (original: TakenAttendaceRow) => {
  const tardanzaMinutes = Number(original.Tardanza ?? 0)
  if (tardanzaMinutes > 0) return true

  const ingreso = original.Ingreso
  const horario = original.Horario
  if (!ingreso || !horario) return false

  return parse(ingreso, "HH:mm:ss", new Date()) > parse(horario, "HH:mm:ss", new Date())
}

const rowClass = (row: any) => {
  const original = row?.original as TakenAttendaceRow | undefined
  if (!original) {
    return "hover:bg-gray-50 dark:hover:bg-gray-900/50"
  }

  if (isPreIncidenciaRow(row)) {
    return "bg-amber-50/60 dark:bg-amber-950/25 hover:bg-amber-50/80 dark:hover:bg-amber-950/35"
  }

  if (!original.Ingreso) {
    return "bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100/60 dark:hover:bg-slate-900/40"
  }

  if (isLateAttendance(original)) {
    return "bg-red-50/60 dark:bg-red-950/20 hover:bg-red-50/80 dark:hover:bg-red-950/30"
  }

  return "hover:bg-gray-50 dark:hover:bg-gray-900/50"
}

const token = useCookie<string | null>('auth_token')

const exportando = ref(false)

const pad2 = (n: number) => String(n).padStart(2, '0')

const formatYmdLocal = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const exportarExcel = async () => {
  if (exportando.value) return;
  if (!requestParams.value) return;
  
  exportando.value = true;
  
  toast.add({
    id: 'exportando',
    title: 'Preparando exportaciÃ³n',
    description: 'Generando archivo Excel...',
    icon: 'i-lucide-loader-2',
  })

  try {
    if (!token.value) {
      throw new Error('Token no disponible')
    }
    const response = await fetch(
      `${config.public.apiBaseUrl}/api/reporte-asistencia/today`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
          'Accept':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: JSON.stringify({
          ...(requestParams.value || {}),
          export: 'excel'
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`)
    }

    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = `ReporteDelDia_${formatYmdLocal(new Date())}.xlsx`
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => window.URL.revokeObjectURL(url), 500)

    toast.remove('exportando')
    toast.add({
      title: 'Descarga completa',
      description: `Descargado: ${fileName}`,
      icon: 'i-lucide-check-circle',
      color: 'success',
    })

  } catch (error) {
    console.error('Error exportando Excel:', error)
    toast.remove('exportando')
    toast.add({
      title: 'Error al exportar',
      description: 'No se pudo generar el archivo Excel',
      icon: 'i-lucide-alert-circle',
      color: 'error',
    })
  } finally {
    exportando.value = false
  }
}



const modalTitle = computed(() => {
  if (!selectedRow.value) return "Incidencia";

  return `Incidencia - ${selectedRow.value.Apellidos} ${selectedRow.value.Nombres}`;
});

const table = useTemplateRef("table");
const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");
const UTooltip = resolveComponent("UTooltip");
const savingIncidencia = ref(false)
const imagenInput = ref<HTMLInputElement | null>(null)
const imagenError = ref<string | null>(null)
const allowedImageTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])
const maxImageSizeBytes = 5 * 1024 * 1024

const isIncidenciaOpen = ref(false);
const incidenciaMode = ref<"tardanza" | "preincidencia">("tardanza");
const isPreIncidencia = computed(() => incidenciaMode.value === "preincidencia");
const incidenciaForm = reactive({
  fecha: "",
  duracionSegundos: 0,
  motivo: "",
  imagenFile: null as File | null,
  imagenPreviewUrl: "",
  imagenUrl: "",
  eliminarImagen: false,
});

const formatDuration = (totalSeconds: number) => {
  const safeTotal = Math.max(0, Math.trunc(totalSeconds))
  const hours = Math.floor(safeTotal / 3600)
  const minutes = Math.floor((safeTotal % 3600) / 60)
  const seconds = safeTotal % 60
  const clock = hours > 0
    ? `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
    : `${pad2(minutes)}:${pad2(seconds)}`

  const parts = []
  if (hours > 0) parts.push(`${hours} h`)
  if (minutes > 0) parts.push(`${minutes} min`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} s`)

  return `${parts.join(" ")} (${clock})`
}

const tardanzaLabel = computed(() => formatDuration(incidenciaForm.duracionSegundos))

const selectedImageUrl = computed(() =>
  incidenciaForm.imagenPreviewUrl || (!incidenciaForm.eliminarImagen ? incidenciaForm.imagenUrl : ''),
)

const selectedRow = ref<(TakenAttendace & {
  imagen_url?: string | null;
  imagenUrl?: string | null;
  Imagen_url?: string | null;
  imagen_path?: string | null;
  incidencia?: {
    imagen_url?: string | null;
    imagenUrl?: string | null;
    Imagen_url?: string | null;
    imagen_path?: string | null;
  } | null;
}) | null>(null);

const revokeImagePreview = () => {
  if (incidenciaForm.imagenPreviewUrl) {
    window.URL.revokeObjectURL(incidenciaForm.imagenPreviewUrl)
  }
  incidenciaForm.imagenPreviewUrl = ''
}

const resetImageState = () => {
  revokeImagePreview()
  incidenciaForm.imagenFile = null
  incidenciaForm.imagenUrl = ''
  incidenciaForm.eliminarImagen = false
  imagenError.value = null

  if (imagenInput.value) {
    imagenInput.value.value = ''
  }
}

const resolveIncidenciaImageUrl = (row: typeof selectedRow.value) => {
  const candidates = [
    row?.imagen_url,
    row?.imagenUrl,
    row?.Imagen_url,
    row?.imagen_path,
    row?.incidencia?.imagen_url,
    row?.incidencia?.imagenUrl,
    row?.incidencia?.Imagen_url,
    row?.incidencia?.imagen_path,
  ]

  return candidates.find((value) => Boolean(value)) || ''
}

const onImagenChange = (event: Event) => {
  imagenError.value = null

  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null

  if (!file) {
    return
  }

  if (!allowedImageTypes.has(file.type)) {
    imagenError.value = 'La imagen debe ser JPG, PNG o WEBP.'
    toast.add({
      title: 'Formato invalido',
      description: imagenError.value,
      color: 'error',
    })
    input.value = ''
    return
  }

  if (file.size > maxImageSizeBytes) {
    imagenError.value = 'La imagen no puede superar los 5 MB.'
    toast.add({
      title: 'Archivo muy grande',
      description: imagenError.value,
      color: 'error',
    })
    input.value = ''
    return
  }

  revokeImagePreview()
  incidenciaForm.imagenFile = file
  incidenciaForm.imagenPreviewUrl = window.URL.createObjectURL(file)
  incidenciaForm.eliminarImagen = false
}

const clearImagenSeleccionada = () => {
  revokeImagePreview()
  incidenciaForm.imagenFile = null
  imagenError.value = null

  if (imagenInput.value) {
    imagenInput.value.value = ''
  }
}

watch(isIncidenciaOpen, (isOpen) => {
  if (!isOpen) {
    resetImageState()
    incidenciaForm.fecha = ''
    incidenciaForm.duracionSegundos = 0
    incidenciaForm.motivo = ''
    selectedRow.value = null
  }
})

const openIncidenciaModal = (
  row: TakenAttendace,
  mode: "tardanza" | "preincidencia" = "tardanza"
) => {
  resetImageState()
  selectedRow.value = row;
  incidenciaMode.value = mode;

  incidenciaForm.fecha = new Date().toISOString().slice(0, 10);

  incidenciaForm.duracionSegundos =
    mode === "tardanza"
      ? calcularTardanza(row.Ingreso, row.Horario)
      : 0;

  incidenciaForm.motivo = "";
  incidenciaForm.imagenUrl = resolveIncidenciaImageUrl(row as typeof selectedRow.value);

  isIncidenciaOpen.value = true;
};

const calcularTardanza = (
  ingreso: string | null,
  horario: string | null
): number => {
  if (!ingreso || !horario) return 0;

  const ingresoDate = parse(ingreso, "HH:mm:ss", new Date());
  const horarioDate = parse(horario, "HH:mm:ss", new Date());

  if (ingresoDate <= horarioDate) return 0;

  return Math.floor((ingresoDate.getTime() - horarioDate.getTime()) / 1000);
};



const guardarIncidencia = async () => {
  if (!selectedRow.value) return;
  const user = useCookie<{ id: number } | null>('auth_user');
  if (!user.value) {
    toast.add({
      title: 'Error',
      description: 'Usuario no autenticado',
      color: 'error'
    });
    return;
  }

  if (!incidenciaForm.motivo.trim()) {
    toast.add({
      title: 'Motivo obligatorio',
      description: 'Ingresa el motivo para guardar la incidencia.',
      color: 'error',
    });
    return;
  }

  if (imagenError.value) {
    toast.add({
      title: 'Corrige la imagen',
      description: imagenError.value,
      color: 'error',
    });
    return;
  }

  savingIncidencia.value = true;

  const totalSeconds = Math.max(0, Math.trunc(incidenciaForm.duracionSegundos || 0))
  const minutos = totalSeconds > 0 ? Math.floor(totalSeconds / 60) : 0
  const segundos = totalSeconds > 0 ? totalSeconds % 60 : 0

  const formData = new FormData()
  formData.append('creado_por', String(user.value.id))
  formData.append('usuario_id', String(selectedRow.value.usuario_id ?? ''))
  formData.append('fecha', incidenciaForm.fecha)
  formData.append('tipo', 'LLEGADA_TARDE')
  formData.append('motivo', incidenciaForm.motivo.trim())

  formData.append('minutos', String(isPreIncidencia.value ? 0 : minutos))
  formData.append('segundos', String(isPreIncidencia.value ? 0 : segundos))
  formData.append(
    'duracion_segundos',
    String(isPreIncidencia.value ? 0 : totalSeconds),
  )
  formData.append('es_recordatorio', isPreIncidencia.value ? '1' : '0')

  if (incidenciaForm.imagenFile) {
    formData.append('imagen', incidenciaForm.imagenFile)
  }

  if (incidenciaForm.eliminarImagen) {
    formData.append('eliminar_imagen', '1')
  }

  try {
    const token = useCookie<string | null>('auth_token')
    const response = await fetch(`${config.public.apiBaseUrl}/api/incidencias/store`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
      body: formData,
    });

    const raw = await response.text()
    const data = raw ? (() => {
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    })() : null

    if (!response.ok) {
      throw new Error(
        (data && typeof data === 'object' && 'message' in data && String((data as any).message)) ||
          'No se pudo registrar la incidencia',
      )
    }

    toast.add({
      title: 'Incidencia registrada',
      description: 'La incidencia se ha registrado correctamente',
      color: 'success',
    });

    // Actualizar la fila localmente para reflejar el cambio
    if (selectedRow.value) {
      if (isPreIncidencia.value) {
        (selectedRow.value as TakenAttendaceRow).es_recordatorio = true;
      } else {
        selectedRow.value.Tiene_Incidencia = true;
        (selectedRow.value as TakenAttendaceRow).es_recordatorio = false;
      }
    }

    isIncidenciaOpen.value = false;
  } catch (error) {
    console.error('Error al guardar incidencia:', error);

    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'No se pudo registrar la incidencia',
      color: 'error',
    });
  } finally {
    savingIncidencia.value = false;
  }
};

const sortColumButton = (column: any, label: string) => {
  const isSorted = column.getIsSorted();
  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    size: "xs",
    label,
    icon: isSorted
      ? isSorted === "asc"
        ? "i-lucide-arrow-up-narrow-wide"
        : "i-lucide-arrow-down-wide-narrow"
      : "i-lucide-arrow-up-down",
    class:
      "-mx-2.5 text-[11px] font-semibold uppercase tracking-wider text-white hover:text-white",
    onClick: () => column.toggleSorting(isSorted === "asc"),
  });
};

const columns: TableColumn<TakenAttendace>[] = [
  {
    accessorKey: "Apellidos",
    header: ({ column }) => sortColumButton(column, "Empleado"),
    cell: ({ row }) => {
      const nombres = String(row.original.Nombres ?? "").trim();
      const apellidos = String(row.original.Apellidos ?? "").trim();

      return h(
        "div",
        { class: "flex flex-col leading-snug whitespace-normal min-w-[180px]" },
        [
          h(
            "span",
            { class: "text-sm font-semibold text-emerald-700 dark:text-emerald-300" },
            apellidos || "â€”"
          ),
          h(
            "span",
            { class: "text-sm text-gray-900 dark:text-gray-100" },
            nombres || "â€”"
          ),
        ]
      );
    },
  },
  {
    accessorKey: "DNI",
    header: ({ column }) => sortColumButton(column, "DNI"),
    cell: ({ row }) =>
      h(
        "span",
        { class: "font-mono text-sm font-semibold text-gray-800 dark:text-gray-100" },
        row.getValue("DNI")
      ),
  },
  {
    accessorKey: "Departamento",
    header: ({ column }) => sortColumButton(column, "Departamento"),
    cell: ({ row }) =>
      h(
        "span",
        { class: "text-sm text-gray-700 dark:text-gray-300" },
        row.getValue("Departamento")
      ),
  },
  {
    accessorKey: "Empresa",
    header: ({ column }) => sortColumButton(column, "Empresa"),
    cell: ({ row }) =>
      h(
        "span",
        { class: "text-sm text-gray-600 dark:text-gray-400" },
        row.getValue("Empresa")
      ),
  },
  {
    accessorKey: "Horario",
    header: ({ column }) => sortColumButton(column, "Horario"),
    cell: ({ row }) => {
      const horario = row.getValue("Horario") as string | null;

      if (!horario) {
        return h(
          "span",
          {
            class:
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold " +
              "bg-slate-50 text-slate-600 ring-1 ring-slate-200 " +
              "dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-700",
          },
          [
            h(UIcon, { name: "i-lucide-clock", class: "w-4 h-4" }),
            "Sin horario",
          ]
        );
      }

      return h(
        "span",
        {
          class:
            "inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold font-mono " +
            "bg-slate-50 text-slate-700 ring-1 ring-slate-200 " +
            "dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700",
        },
        horario
      );
    },
  },
  {
    accessorKey: "Ingreso",
    header: ({ column }) => sortColumButton(column, "Ingreso"),
    cell: ({ row }) => {
      const ingreso = row.getValue("Ingreso") as string | null;
      const horario = row.getValue("Horario") as string | null;

      if (!ingreso) {
        return h(
          "span",
          {
            class:
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold " +
              "bg-slate-50 text-slate-600 ring-1 ring-slate-200 " +
              "dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-700",
          },
          [
            h(UIcon, { name: "i-lucide-log-in", class: "w-4 h-4" }),
            "Sin ingreso",
          ]
        );
      }

      if (!horario) {
        return h(
          "span",
          {
            class:
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold font-mono " +
              "bg-slate-50 text-slate-700 ring-1 ring-slate-200 " +
              "dark:bg-slate-900/40 dark:text-slate-200 dark:ring-slate-700",
          },
          [
            h(UIcon, { name: "i-lucide-log-in", class: "w-4 h-4" }),
            ingreso,
          ]
        );
      }

      const isLate =
        parse(ingreso, "HH:mm:ss", new Date()) >
        parse(horario, "HH:mm:ss", new Date());

      return h(
        "span",
        {
          class:
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold font-mono ring-1 " +
            (isLate
              ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/25 dark:text-red-300 dark:ring-red-900/40"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-300 dark:ring-emerald-900/40"),
        },
        [
          h(UIcon, {
            name: isLate ? "i-lucide-alert-circle" : "i-lucide-check-circle",
            class: "w-4 h-4",
          }),
          ingreso,
        ]
      );
    },
  },
  {
    accessorKey: "Salida",
    header: ({ column }) => sortColumButton(column, "Salida"),
    cell: ({ row }) => {
      const salida = row.getValue("Salida") as string | null;

      if (!salida) {
        return h(
          "div",
          { class: "inline-flex items-center gap-1.5 text-gray-400 dark:text-gray-500" },
          [
            h(UIcon, { name: "i-lucide-clock", class: "w-4 h-4" }),
            h("span", { class: "text-sm" }, "Sin salida"),
          ]
        );
      }

      return h(
        "div",
        { class: "inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400" },
        [
          h(UIcon, { name: "i-lucide-log-out", class: "w-4 h-4" }),
          h("span", { class: "font-mono text-sm" }, salida)
        ]
      );
    },
  },
  {
    id: 'acciones',
    header: () =>
      h('span', { class: 'text-left w-full' }, 'Acciones'),

    cell: ({ row }) => {
      const hasIngreso = Boolean(row.original.Ingreso)
      const hasTardanza = isLateAttendance(row.original)
      const tieneIncidencia = Boolean(row.original.Tiene_Incidencia)
      const esRecordatorio = getEsRecordatorio(row)

      const wrapper = (content: any) =>
        h(
          'div',
          { class: 'flex justify-start items-center' },
          content
        )

      const statusPill = (text: string, color: any, icon: string) =>
        h(
          UBadge,
          {
            color,
            variant: 'subtle',
            class: 'inline-flex items-center gap-1.5 whitespace-nowrap'
          },
          () => [h(UIcon, { name: icon, class: 'w-4 h-4' }), text]
        )

      // Si ya tiene incidencia registrada
      if (tieneIncidencia) {
        return wrapper(
          statusPill('Incidencia registrada', 'primary', 'i-lucide-check-circle-2')
        )
      }

      // Si hay ingreso y tardanza, permitir registrar incidencia (como antes)
      if (hasIngreso && hasTardanza) {
        return wrapper(
          h(UButton, {
            size: 'xs',
            variant: 'soft',
            color: 'primary',
            icon: 'i-lucide-file-text',
            label: 'Justificar',
            class: 'whitespace-nowrap',
            onClick: () => openIncidenciaModal(row.original, 'tardanza'),
          })
        )
      }

      // Si no hay ingreso
      if (!hasIngreso) {
        if (esRecordatorio) {
          return wrapper(
            statusPill('Recordatorio registrado', 'neutral', 'i-lucide-bell')
          )
        }
        return wrapper(
          h(UButton, {
            size: 'xs',
            variant: 'outline',
            color: 'primary',
            icon: 'i-lucide-bell-plus',
            label: 'Recordatorio',
            class: 'whitespace-nowrap',
            onClick: () => openIncidenciaModal(row.original, 'preincidencia'),
          })
        )
      }

      // Si no hay tardanza
      return wrapper(
        statusPill('Sin incidencia', 'neutral', 'i-lucide-check-circle')
      )
    }
  }
];
</script>


