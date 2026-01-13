<template>
  <DataState
    :loading="dailyTakenAttendaces.loading"
    :error="dailyTakenAttendaces.isError"
    error-message="No se pudo cargar los reportes de hoy"
    @retry="getDailyTakenAttendances"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 mb-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
    >
      <UInput
        icon="i-lucide-search"
        v-model="dailyTakenAttendaces.globalFilter"
        class="w-full sm:max-w-sm"
        placeholder="Buscar por nombre, apellido o DNI..."
      />

      <UButton
        variant="outline"
        color="gray"
        size="sm"
        @click="exportarExcel"
        :loading="exportando"
        :disabled="exportando"
        class="whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <UIcon name="i-lucide-download" class="w-4 h-4 mr-2" />
        {{ exportando ? 'Exportando...' : 'Exportar' }}
      </UButton>

    </div>

    <div class="overflow-x-auto">
      <UTable
        ref="table"
        :data="dailyListAttendaces"
        :columns="columns"
        :loading="dailyTakenAttendaces.loading"
        empty="No se encontraron reportes de hoy"
        :ui="{
          base: 'w-full',
          wrapper: 'max-h-[calc(100vh-400px)] overflow-y-auto relative',
          thead: 'sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800',
          th: `
            px-4 py-3 text-left text-xs font-medium
            text-gray-500 dark:text-gray-400
            tracking-tight
          `,
          td: `
            px-4 py-3 text-sm
            text-gray-900 dark:text-gray-100
            border-b border-gray-100 dark:border-gray-900
          `,
          tbody: `
            [&>tr]:transition-colors
            [&>tr:hover]:bg-gray-50
            dark:[&>tr:hover]:bg-gray-900/50
          `,
        }"
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
  :ui="{ width: 'sm:max-w-lg' }"
>
  <template #body>
    <div class="space-y-6">

      <!-- Contexto -->
      <div class="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
        <div class="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-semibold">
          <UIcon name="i-lucide-alert-circle" class="w-5 h-5" />
          Se detectó una tardanza
        </div>
        <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
          Registra el motivo para justificar esta incidencia.
        </p>
      </div>

      <!-- Datos clave -->
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3">
          <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha</p>
          <p class="font-semibold text-gray-900 dark:text-gray-100">
            {{ incidenciaForm.fecha }}
          </p>
        </div>

        <div class="rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20 p-3">
          <p class="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">Tiempo de tardanza</p>
          <p class="font-semibold text-orange-900 dark:text-orange-100">
            {{ incidenciaForm.minutosTardanza }} minutos
          </p>
        </div>
      </div>

      <UFormGroup
  label="Motivo de la incidencia"
  description="Describe brevemente la causa de la tardanza"
  required
>
  <UTextarea
    v-model="incidenciaForm.motivo"
    placeholder="Ej. tráfico intenso, transporte público, clima, etc."
    :rows="4"
    autofocus
    class="w-full"
  />
</UFormGroup>


    </div>
  </template>

  <template #footer>
    <div class="flex justify-end items-center gap-3">
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
        <UIcon name="i-lucide-save" class="w-4 h-4 mr-1.5" />
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
import { apiFetch } from '@/services/api'

const config = useRuntimeConfig()
const store = useAttendanceReportStore();
const { getDailyTakenAttendances } = store;
const { attendance } = storeToRefs(store);
const toast = useToast()


const dailyTakenAttendaces = computed(() => attendance.value.taken.daily);

const dailyListAttendaces = computed<TakenAttendace[]>(() => {
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

const token = useCookie<string | null>('auth_token')

const exportando = ref(false)

const exportarExcel = async () => {
  if (exportando.value) return;
  
  exportando.value = true;
  
  toast.add({
    id: 'exportando',
    title: 'Preparando exportación',
    description: 'Generando archivo Excel...',
    icon: 'i-lucide-loader-2',
    timeout: 0,
  })

  try {
    if (!token.value) {
      throw new Error('Token no disponible')
    }
    const response = await fetch(
      `${config.public.apiBaseUrl}/api/reporte-asistencia/marcacion`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
          'Accept':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: JSON.stringify({ export: 'excel' })
      }
    )

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`)
    }

    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'detalle_marcacion.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)

    toast.remove('exportando')
    toast.add({
      title: 'Descarga completa',
      description: 'El archivo se descargó correctamente',
      icon: 'i-lucide-check-circle',
      color: 'green',
      timeout: 3000,
    })

  } catch (error) {
    console.error('Error exportando Excel:', error)
    toast.remove('exportando')
    toast.add({
      title: 'Error al exportar',
      description: 'No se pudo generar el archivo Excel',
      icon: 'i-lucide-alert-circle',
      color: 'red',
      timeout: 5000,
    })
  } finally {
    exportando.value = false
  }
}



const modalTitle = computed(() => {
  if (!selectedRow.value) return "Incidencia";

  return `Incidencia – ${selectedRow.value.Apellidos} ${selectedRow.value.Nombres}`;
});

const table = useTemplateRef("table");
const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");
const UTooltip = resolveComponent("UTooltip");
const savingIncidencia = ref(false)

const isIncidenciaOpen = ref(false);
const incidenciaForm = reactive({
  fecha: "",
  minutosTardanza: 0,
  motivo: "",
});

const selectedRow = ref<TakenAttendace | null>(null);

const openIncidenciaModal = (row: TakenAttendace) => {
  selectedRow.value = row;

  incidenciaForm.fecha = new Date().toISOString().slice(0, 10);

  incidenciaForm.minutosTardanza = row.Tardanza
    ? calcularTardanza(row.Ingreso, row.Horario)
    : 0;

  incidenciaForm.motivo = "";

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

  return Math.floor((ingresoDate.getTime() - horarioDate.getTime()) / 60000);
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
  savingIncidencia.value = true;

  const payload = {
    ID_Marcacion: selectedRow.value.ID_Marcacion,
    creado_por: user.value.id,
    usuario_id: selectedRow.value.Empleado_id,
    fecha: incidenciaForm.fecha,
    minutos: incidenciaForm.minutosTardanza,
    tipo : 'LLEGADA_TARDE',
    motivo: incidenciaForm.motivo,
  };

  try {
    await apiFetch('/api/incidencias', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    toast.add({
      title: 'Incidencia registrada',
      description: 'La incidencia se ha registrado correctamente',
      color: 'success',
    });

    // Actualizar la fila localmente para reflejar el cambio
    if (selectedRow.value) {
      selectedRow.value.Tiene_Incidencia = true;
    }

    isIncidenciaOpen.value = false;
  } catch (error) {
    console.error('Error al guardar incidencia:', error);

    toast.add({
      title: 'Error',
      description: 'No se pudo registrar la incidencia',
      color: 'red',
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
    label,
    icon: isSorted
      ? isSorted === "asc"
        ? "i-lucide-arrow-up-narrow-wide"
        : "i-lucide-arrow-down-wide-narrow"
      : "i-lucide-arrow-up-down",
    class: "-mx-2.5",
    onClick: () => column.toggleSorting(isSorted === "asc"),
  });
};

const columns: TableColumn<TakenAttendace>[] = [
  {
    accessorKey: "DNI",
    header: ({ column }) => sortColumButton(column, "DNI"),
    cell: ({ row }) =>
      h("span", { class: "font-mono text-sm" }, row.getValue("DNI")),
  },
  {
    accessorKey: "Apellidos",
    header: ({ column }) => sortColumButton(column, "Empleado"),
    cell: ({ row }) => {
      const nombres = row.original.Nombres || "";
      const apellidos = row.original.Apellidos || "";
      
      const primerNombre = nombres.split(" ")[0] || "";
      const primerApellido = apellidos.split(" ")[0] || "";
      
      return h(
        "span",
        { class: "font-medium text-gray-900 dark:text-gray-100 text-sm" },
        `${primerNombre} ${primerApellido}`.trim()
      );
    },
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
    cell: ({ row }) =>
      row.getValue("Horario") 
        ? h("span", { class: "font-mono text-sm" }, row.getValue("Horario"))
        : h("span", { class: "text-sm text-gray-400 dark:text-gray-500" }, "Sin horario"),
  },
  {
    accessorKey: "Ingreso",
    header: ({ column }) => sortColumButton(column, "Ingreso"),
    cell: ({ row }) => {
      const ingreso = row.getValue("Ingreso") as string | null;
      const horario = row.getValue("Horario") as string | null;

      if (!ingreso) {
        return h("span", { class: "text-sm text-gray-400 dark:text-gray-500" }, "Sin ingreso");
      }

      if (!horario) {
        return h("span", { class: "font-mono text-sm" }, ingreso);
      }

      const isLate =
        parse(ingreso, "HH:mm:ss", new Date()) >
        parse(horario, "HH:mm:ss", new Date());

      return h(
        "div",
        {
          class: "inline-flex items-center gap-1.5",
        },
        [
          h(UIcon, {
            name: isLate ? "i-lucide-alert-circle" : "i-lucide-check-circle",
            class: isLate 
              ? "w-4 h-4 text-red-500 dark:text-red-400" 
              : "w-4 h-4 text-green-600 dark:text-green-500",
          }),
          h("span", { 
            class: isLate 
              ? "font-mono text-sm text-red-600 dark:text-red-400" 
              : "font-mono text-sm text-green-600 dark:text-green-500" 
          }, ingreso),
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
      const hasTardanza = Boolean(row.original.Tardanza)
      const tieneIncidencia = Boolean(row.original.Tiene_Incidencia)

      const wrapper = (content: any) =>
        h(
          'div',
          { class: 'flex justify-start items-center' },
          content
        )

      // Si no hay tardanza
      if (!hasTardanza) {
        return wrapper(
          h(
            'span',
            { class: 'inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400' },
            [
              h(UIcon, { name: 'i-lucide-check-circle', class: 'w-4 h-4' }),
              'Sin incidencia'
            ]
          )
        )
      }

      // Si ya tiene incidencia registrada
      if (tieneIncidencia) {
        return wrapper(
          h(
            'span',
            { class: 'inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400' },
            [
              h(UIcon, { name: 'i-lucide-check-circle-2', class: 'w-4 h-4' }),
              'Incidencia registrada'
            ]
          )
        )
      }

      // Si hay tardanza y no tiene incidencia, mostrar botón
      return wrapper(
        h(
          UButton,
          {
            size: 'xs',
            variant: 'outline',
            color: 'gray',
            class: 'hover:bg-gray-50 dark:hover:bg-gray-800',
            onClick: () => openIncidenciaModal(row.original)
          },
          () => [
            h(UIcon, { name: 'i-lucide-file-text', class: 'w-3.5 h-3.5 mr-1.5' }),
            'Registrar'
          ]
        )
      )
    }
  }
];
</script>
