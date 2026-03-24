<template>
  <UModal
    v-model:open="open"
    :ui="{
      title: 'py-5 px-6',
      content: 'max-w-5xl',
    }"
  >
    <template #title>
      <div class="flex items-start gap-4">
        <UAvatar
          size="lg"
          :alt="fullName || 'Usuario'"
          :ui="{
            root: 'bg-emerald-600 text-white',
            fallback: 'text-white font-semibold'
          }"
        />
        <div class="flex-1">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ employeeData?.employee.last_name }}, {{ employeeData?.employee.first_name }}
          </h4>
          <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              DNI: {{ employeeData?.employee.dni }}
            </span>
            <span v-if="employeeData?.employee.department_name" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {{ employeeData?.employee.department_name }}
            </span>
            <span v-if="employeeData?.employee.position_name" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              {{ employeeData?.employee.position_name }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #body>
      <div class="p-6 space-y-5">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="card in summaryCards"
            :key="card.key"
            class="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1"
            :class="card.barClass"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {{ card.label }}
                </div>
                <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight" :class="card.valueClass">
                  {{ card.value }}
                </div>
              </div>
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :class="card.iconWrapClass">
                <span :class="[card.icon, 'text-[18px]']" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden w-full"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800"
          >
            <div class="flex items-center gap-2">
              <UButton
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-lucide-chevron-left"
                aria-label="Mes anterior"
                @click="previousMonth"
              />
              <div class="px-1">
                <h2 class="text-lg font-semibold leading-tight text-gray-900 dark:text-gray-100">
                  {{ calendarHeading }}
                </h2>
                <div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Mes calendario · máximo 30 días · {{ periodLabel }}
                </div>
              </div>
              <UButton
                size="sm"
                color="neutral"
                variant="ghost"
                icon="i-lucide-chevron-right"
                aria-label="Mes siguiente"
                @click="nextMonth"
              />
            </div>
            <UButton
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-lucide-calendar"
              @click="goToToday"
            >
              Hoy
            </UButton>
          </div>

          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-950/60">
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <div
                v-for="item in legendItems"
                :key="item.code"
                class="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2.5 py-1 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
              >
                <span
                  class="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full font-mono text-[10px] font-semibold"
                  :class="getCalendarFillClass(item.code)"
                >
                  {{ item.code }}
                </span>
                <span class="text-gray-600 dark:text-gray-300">
                  {{ item.label }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
            <div>
              <div class="mb-2 flex items-baseline justify-between">
                <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ monthNames[currentMonth] }}
                </div>
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {{ currentYear }}
                </div>
              </div>
              <div class="grid grid-cols-7 gap-2 pb-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <div v-for="day in weekDays" :key="day" class="text-center">
                  {{ day }}
                </div>
              </div>
              <div class="grid grid-cols-7 gap-2">
            <div
              v-for="day in calendarDays"
              :key="day.date.getTime()"
              class="flex items-center justify-center"
              :class="{
                'opacity-0 pointer-events-none': !day.isCurrentMonth,
                'cursor-pointer': day.isCurrentMonth && !isDateDisabledForPeriod(day.date),
                'cursor-not-allowed opacity-40': day.isCurrentMonth && isDateDisabledForPeriod(day.date),
              }"
              @click="day.isCurrentMonth && !isDateDisabledForPeriod(day.date) && selectDate(day.date)"
            >
              <div class="flex items-center justify-center">
                <div
                  class="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold tabular-nums transition-colors"
                  :class="[
                    day.isCurrentMonth && isInPeriod(day.date) && day.hasRecord ? getCalendarFillClass(day.code) : '',
                    day.isCurrentMonth && isInPeriod(day.date) && !day.hasRecord ? 'text-gray-900 dark:text-gray-100' : '',
                    day.isCurrentMonth && !isInPeriod(day.date) ? 'text-gray-400 dark:text-gray-600' : '',
                    day.isCurrentMonth && isInPeriod(day.date) && !day.hasRecord && !day.isSelected
                      ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      : '',
                    day.isSelected
                      ? 'ring-2 ring-emerald-500/60 ring-offset-2 ring-offset-white dark:ring-offset-gray-950'
                      : (day.isToday && isInPeriod(day.date) ? 'ring-2 ring-emerald-500/40' : ''),
                  ]"
                >
                  {{ day.dayNumber }}
                </div>
                <div
                  v-if="day.events.length > 0"
                  class="hidden"
                >
                  <div class="flex -space-x-1">
                    <div
                      v-for="(evento, index) in day.events.slice(0, 3)"
                      :key="index"
                      class="w-1.5 h-1.5 rounded-full border border-white dark:border-gray-950"
                      :class="getCategoriaColor(evento.categoria)"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded"
                  >
                    {{ day.events.length }}
                  </span>
                </div>
              </div>
              <div class="hidden space-y-1">
                <div
                  v-for="evento in day.events.slice(0, 2)"
                  :key="evento.id"
                  class="text-xs p-1.5 rounded cursor-pointer transition-colors border-l-2"
                  :class="
                    getCategoriaColor(evento.categoria) +
                    ' bg-opacity-10 hover:bg-opacity-20 text-gray-800 dark:text-gray-200'
                  "
                  :style="{
                    borderLeftColor: getCategoriaColorHex(evento.categoria),
                  }"
                  :title="evento.nombre + ' - ' + evento.descripcion"
                >
                  <div class="flex items-start gap-2 min-w-0">
                    <span
                      class="mt-0.5 inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold border shrink-0"
                      :class="getCodeBadgeClass(evento.code)"
                    >
                      {{ evento.code }}
                    </span>
                    <div class="min-w-0">
                      <div class="font-medium truncate">{{ evento.nombre }}</div>
                      <div class="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                        {{ evento.descripcion }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="day.events.length > 2"
                  class="text-xs text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer p-1 rounded bg-gray-100 dark:bg-gray-800"
                >
                  <span class="i-lucide-plus mr-1"></span
                  >{{ day.events.length - 2 }} más eventos
                </div>
              </div>
            </div>
              </div>
            </div>

            <div>
              <div class="mb-2 flex items-baseline justify-between">
                <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ monthNames[rightMonth] }}
                </div>
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {{ rightYear }}
                </div>
              </div>
              <div class="grid grid-cols-7 gap-2 pb-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <div v-for="day in weekDays" :key="'m2-' + day" class="text-center">
                  {{ day }}
                </div>
              </div>
              <div class="grid grid-cols-7 gap-2">
                <div
                  v-for="day in calendarDaysRight"
                  :key="'m2-' + day.date.getTime()"
                  class="flex items-center justify-center"
                  :class="{
                    'opacity-0 pointer-events-none': !day.isCurrentMonth,
                    'cursor-pointer': day.isCurrentMonth && !isDateDisabledForPeriod(day.date),
                    'cursor-not-allowed opacity-40': day.isCurrentMonth && isDateDisabledForPeriod(day.date),
                  }"
                  @click="day.isCurrentMonth && !isDateDisabledForPeriod(day.date) && selectDate(day.date)"
                >
                  <div class="flex items-center justify-center">
                    <div
                      class="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold tabular-nums transition-colors"
                      :class="[
                        day.isCurrentMonth && isInPeriod(day.date) && day.hasRecord ? getCalendarFillClass(day.code) : '',
                        day.isCurrentMonth && isInPeriod(day.date) && !day.hasRecord ? 'text-gray-900 dark:text-gray-100' : '',
                        day.isCurrentMonth && !isInPeriod(day.date) ? 'text-gray-400 dark:text-gray-600' : '',
                        day.isCurrentMonth && isInPeriod(day.date) && !day.hasRecord && !day.isSelected
                          ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          : '',
                        day.isSelected
                          ? 'ring-2 ring-emerald-500/60 ring-offset-2 ring-offset-white dark:ring-offset-gray-950'
                          : (day.isToday && isInPeriod(day.date) ? 'ring-2 ring-emerald-500/40' : ''),
                      ]"
                    >
                      {{ day.dayNumber }}
                    </div>
                    <div
                      v-if="day.events.length > 0"
                      class="hidden"
                    >
                      <div class="flex -space-x-1">
                        <div
                          v-for="(evento, index) in day.events.slice(0, 3)"
                          :key="'m2-dot-' + index"
                          class="w-1.5 h-1.5 rounded-full border border-white dark:border-gray-950"
                          :class="getCategoriaColor(evento.categoria)"
                        ></div>
                      </div>
                      <span
                        class="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded"
                      >
                        {{ day.events.length }}
                      </span>
                    </div>
                  </div>
                  <div class="hidden space-y-1">
                    <div
                      v-for="evento in day.events.slice(0, 2)"
                      :key="'m2-ev-' + evento.id"
                      class="text-xs p-1.5 rounded cursor-pointer transition-colors border-l-2"
                      :class="
                        getCategoriaColor(evento.categoria) +
                        ' bg-opacity-10 hover:bg-opacity-20 text-gray-800 dark:text-gray-200'
                      "
                      :style="{
                        borderLeftColor: getCategoriaColorHex(evento.categoria),
                      }"
                      :title="evento.nombre + ' - ' + evento.descripcion"
                    >
                      <div class="flex items-start gap-2 min-w-0">
                        <span
                          class="mt-0.5 inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold border shrink-0"
                          :class="getCodeBadgeClass(evento.code)"
                        >
                          {{ evento.code }}
                        </span>
                        <div class="min-w-0">
                          <div class="font-medium truncate">{{ evento.nombre }}</div>
                          <div class="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                            {{ evento.descripcion }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="day.events.length > 2"
                      class="text-xs text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer p-1 rounded bg-gray-100 dark:bg-gray-800"
                    >
                      <span class="i-lucide-plus mr-1"></span
                      >{{ day.events.length - 2 }} m&aacute;s eventos
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { employeeConceptOptions } from "~/interfaces/movility-report";

const open = defineModel<boolean>("isOpen");

interface EmployeeData {
  employee: {
    id: number
    dni: string
    first_name: string
    last_name: string
    position_name: string
    department_name: string
  }
  summary: {
    total_days: number
    vacation_days: number
    medical_leave_days: number
    no_mark_days: number
    days_with_mobility: number
    mobility_amount_per_day: number
    total_mobility_to_pay: number
  }
  [key: string]: any 
}

const props = defineProps<{
  employeeData: EmployeeData | null
  periodRange?: {
    start: Date
    end: Date
  } | null
}>()

type CalendarEvent = {
  id: string | number
  code: string
  nombre: string
  descripcion: string
  fecha: string
  categoria: string
}

const eventos = ref<CalendarEvent[]>([]);

const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(new Date());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());
const fullName = computed(() => {
  const first = props.employeeData?.employee.first_name ?? "";
  const last = props.employeeData?.employee.last_name ?? "";
  return `${first} ${last}`.trim();
});
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

const rightDate = computed(() => new Date(currentYear.value, currentMonth.value + 1, 1));
const rightMonth = computed(() => rightDate.value.getMonth());
const rightYear = computed(() => rightDate.value.getFullYear());

const formatDMY = (date: Date) =>
  new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);

const getMonthDateLimit = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getMonthlyRangeMax30 = (anchor: Date) => ({
  start: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
  end: new Date(anchor.getFullYear(), anchor.getMonth(), Math.min(30, getMonthDateLimit(anchor))),
});

const calendarHeading = computed(() => {
  const leftLabel = monthNames[currentMonth.value];
  const rightLabel = monthNames[rightMonth.value];
  const leftY = currentYear.value;
  const rightY = rightYear.value;

  if (leftY === rightY) return `${leftLabel} - ${rightLabel} ${leftY}`;
  return `${leftLabel} ${leftY} - ${rightLabel} ${rightY}`;
});

const periodRange = computed(() => {
  if (props.periodRange) return props.periodRange;
  return getMonthlyRangeMax30(currentDate.value);
});

const periodLabel = computed(() => `${formatDMY(periodRange.value.start)} - ${formatDMY(periodRange.value.end)}`);

const summaryCards = computed(() => {
  const s = props.employeeData?.summary;

  return [
    {
      key: "total_days",
      label: "Total días",
      value: s?.total_days ?? 0,
      icon: "i-lucide-calendar-days",
      barClass: "before:bg-slate-900/10 dark:before:bg-white/10",
      valueClass: "text-gray-900 dark:text-gray-100",
      iconWrapClass: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-200",
    },
    {
      key: "vacation_days",
      label: "Vacaciones",
      value: s?.vacation_days ?? 0,
      icon: "i-lucide-sun",
      barClass: "before:bg-amber-500/60 dark:before:bg-amber-400/50",
      valueClass: "text-amber-800 dark:text-amber-200",
      iconWrapClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/25 dark:text-amber-200",
    },
    {
      key: "medical_leave_days",
      label: "Desc. médico",
      value: s?.medical_leave_days ?? 0,
      icon: "i-lucide-activity",
      barClass: "before:bg-sky-500/60 dark:before:bg-sky-400/50",
      valueClass: "text-sky-800 dark:text-sky-200",
      iconWrapClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/25 dark:text-sky-200",
    },
    {
      key: "no_mark_days",
      label: "No marcó",
      value: s?.no_mark_days ?? 0,
      icon: "i-lucide-alert-circle",
      barClass: "before:bg-rose-500/60 dark:before:bg-rose-400/50",
      valueClass: "text-rose-800 dark:text-rose-200",
      iconWrapClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/25 dark:text-rose-200",
    },
  ] as const;
});

const toMidnightTs = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const isInPeriod = (d: Date) => {
  const t = toMidnightTs(d);
  const start = toMidnightTs(periodRange.value.start);
  const end = toMidnightTs(periodRange.value.end);
  return t >= start && t <= end;
};
const isDateDisabledForPeriod = (d: Date) => !isInPeriod(d);

watch(
  () => props.periodRange,
  (range) => {
    if (!range) return

    currentDate.value = new Date(range.start.getFullYear(), range.start.getMonth(), 1)

    const today = new Date()
    const t = toMidnightTs(today)
    const start = toMidnightTs(range.start)
    const end = toMidnightTs(range.end)
    selectedDate.value = t >= start && t <= end ? today : new Date(range.start)
  },
  { immediate: true }
)

const normalizeCode = (raw: unknown) => {
  const code = String(raw ?? "").trim();
  return code === "0" ? "NM" : code;
};

const getCodeLabel = (raw: unknown) => {
  const code = normalizeCode(raw);
  if (code === "1") return "Asistencia";
  if (code === "X") return "Cese";
  const opt = employeeConceptOptions.find((o) => o.code === code);
  return opt?.label ?? code;
};

const getCodeBadgeClass = (raw: unknown) => {
  const code = normalizeCode(raw);

  if (code === "1")
    return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900";
  if (code === "V" || code === "VE")
    return "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900";
  if (code === "DM")
    return "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-900";
  if (code === "SR")
    return "bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-900";
  if (code === "NM")
    return "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900";
  if (code === "DE")
    return "bg-purple-50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-900";
  return "bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800";
};

const getCalendarColors = (raw: unknown) => {
  const code = normalizeCode(raw);
  if (code === "1") return { bg: "bg-emerald-600", text: "text-white" };
  if (code === "V") return { bg: "bg-amber-500", text: "text-white" };
  if (code === "VE") return { bg: "bg-amber-700", text: "text-white" };
  if (code === "DE") return { bg: "bg-purple-600", text: "text-white" };
  if (code === "DM") return { bg: "bg-sky-600", text: "text-white" };
  if (code === "SR") return { bg: "bg-blue-600", text: "text-white" };
  if (code === "NM") return { bg: "bg-rose-600", text: "text-white" };
  if (code === "LSGH") return { bg: "bg-slate-600", text: "text-white" };
  if (code === "LCGH") return { bg: "bg-teal-600", text: "text-white" };
  if (code === "X") return { bg: "bg-gray-600", text: "text-white" };
  return { bg: "bg-gray-600", text: "text-white" };
};

const getCalendarBgClass = (raw: unknown) => getCalendarColors(raw).bg;
const getCalendarFillClass = (raw: unknown) => {
  const { bg, text } = getCalendarColors(raw);
  return `${bg} ${text}`;
};

const legendItems = computed(() => {
  const codes: string[] = ["1", ...employeeConceptOptions.map((o) => o.code), "X"];
  const seen = new Set<string>();
  const out: { code: string; label: string }[] = [];
  for (const c of codes) {
    const code = normalizeCode(c);
    if (seen.has(code)) continue;
    seen.add(code);
    out.push({ code, label: getCodeLabel(code) });
  }
  return out;
});

const formatLocalYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const parseYMDToLocalDate = (ymd: string) => {
  const [ys, ms, ds] = ymd.split("-");
  return new Date(Number(ys), Number(ms) - 1, Number(ds));
};

const monthShortMap: Record<string, number> = {
  jan: 0,
  ene: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  ago: 7,
  sep: 8,
  set: 8,
  oct: 9,
  nov: 10,
  dec: 11,
  dic: 11,
};

const parseFlexibleKeyToDate = (key: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return parseYMDToLocalDate(key);
  }

  if (/^\d{1,2}-[A-Za-z]{3}$/.test(key)) {
    const [dayRaw, monRaw = ""] = key.split("-");
    const monthIndex = monthShortMap[monRaw.toLowerCase()];
    if (monthIndex == null) return null;
    const year = currentDate.value.getFullYear();
    return new Date(year, monthIndex, Number(dayRaw));
  }

  return null;
};

const buildCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  // Start weeks on Monday (L)
  const diff = (firstDay.getDay() + 6) % 7;
  startDate.setDate(startDate.getDate() - diff);
  const days = [];
  let currentDay = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    const currentDayYMD = formatLocalYMD(currentDay);
    const dayEvents = eventos.value.filter(
      (evento) =>
        formatLocalYMD(parseYMDToLocalDate(evento.fecha)) === currentDayYMD
    );
    const firstEvent = dayEvents[0];
    const dayCode = firstEvent ? normalizeCode(firstEvent.code) : null;
    const isToday = currentDay.toDateString() === new Date().toDateString();
    const isSelected =
      selectedDate.value &&
      selectedDate.value.toDateString() === currentDay.toDateString();
    days.push({
      date: new Date(currentDay),
      dayNumber: currentDay.getDate(),
      isCurrentMonth: currentDay.getMonth() === month,
      isToday,
      isSelected,
      events: dayEvents,
      hasRecord: dayEvents.length > 0,
      code: dayCode,
    });
    currentDay.setDate(currentDay.getDate() + 1);
  }
  return days;
};

const calendarDays = computed(() =>
  buildCalendarDays(currentYear.value, currentMonth.value)
);
const calendarDaysRight = computed(() =>
  buildCalendarDays(rightYear.value, rightMonth.value)
);

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};
const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};
const goToToday = () => {
  currentDate.value = new Date();
  selectedDate.value = new Date();
};
const selectDate = (date: Date) => {
  selectedDate.value = new Date(date);
};
const getCategoriaColor = (categoria: string) => {
  const colores: Record<string, string> = {
    feriado: "bg-red-500",
    celebracion: "bg-green-500",
    cumpleanos: "bg-yellow-500",
    aniversario: "bg-pink-500",
    especial: "bg-blue-500",
  };
  return colores[categoria] || "bg-gray-500";
};
const getCategoriaColorHex = (categoria: string) => {
  const colores: Record<string, string> = {
    feriado: "#ef4444",
    celebracion: "#22c55e",
    cumpleanos: "#eab308",
    aniversario: "#ec4899",
    especial: "#3b82f6",
  };
  return colores[categoria] || "#6b7280";
};

// Convertir los días del empleado en eventos del calendario
watch(() => props.employeeData, (newData) => {
  if (!newData) {
    eventos.value = []
    return
  }
  
  const newEventos: CalendarEvent[] = []
  let firstEventDate: Date | null = null
  
  // Iterar sobre todas las propiedades del objeto
  Object.keys(newData).forEach((key) => {
    const parsedDate = parseFlexibleKeyToDate(key)
    if (!parsedDate) return

    const dayData = newData[key]
    const code = normalizeCode(dayData?.code)
    let categoria = 'especial'
    let nombre = getCodeLabel(code)
    
    // Determinar la categoría según el código
    if (code === '1') {
      categoria = 'celebracion'
    } else if (code === 'V' || code === 'VE') {
      categoria = 'feriado'
    } else if (code === 'DM') {
      categoria = 'cumpleanos'
    } else if (code === 'NM') {
      categoria = 'aniversario'
    }
    
    if (!firstEventDate) {
      firstEventDate = parsedDate
    }
    
    newEventos.push({
      id: key,
      code,
      nombre: nombre,
      descripcion: dayData.mobility_counted ? 'Movilidad contada' : 'Sin movilidad',
      fecha: formatLocalYMD(parsedDate),
      categoria: categoria
    })
  })
  
  eventos.value = newEventos
  
  // Si hay eventos, navegar al mes del primer evento
  const firstEventDateValue = firstEventDate as Date | null

  if (firstEventDateValue && !props.periodRange) {
    currentDate.value = new Date(firstEventDateValue.getFullYear(), firstEventDateValue.getMonth(), 1)
  }
}, { immediate: true })
</script>

