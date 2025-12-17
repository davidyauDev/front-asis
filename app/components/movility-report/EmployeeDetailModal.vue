<script setup lang="ts">
import { computed } from 'vue'
import {
  Calendar,
  MapPin,
  Building2,
  Wallet,
  User,
  FileText,
  TrendingUp
} from 'lucide-vue-next'

/* =========================
   PROPS / EMITS
========================= */
const props = defineProps<{
  employee: any | null
  stats: any | null
  isOpen: boolean
  month: number
  year: number
}>()

const emit = defineEmits(['close'])

/* =========================
   CONSTANTES
========================= */
const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

const DAYS_SHORT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

const STATUS_CONFIG: Record<string, any> = {
  '1': { label: 'Presente', color: 'bg-present', bg: 'bg-present/20', text: 'text-present' },
  'V': { label: 'Vacaciones', color: 'bg-vacation', bg: 'bg-vacation/20', text: 'text-vacation' },
  'DM': { label: 'Descanso Médico', color: 'bg-medical', bg: 'bg-medical/20', text: 'text-medical' },
  'D': { label: 'Domingo', color: 'bg-sunday', bg: 'bg-sunday/20', text: 'text-sunday' },
  '': { label: 'Sin registro', color: 'bg-muted', bg: 'bg-muted/20', text: 'text-muted-foreground' }
}

/* =========================
   COMPUTED
========================= */
const daysInMonth = computed(() =>
  new Date(props.year, props.month + 1, 0).getDate()
)

const attendancePercentage = computed(() => {
  if (!props.stats) return 0
  return Math.round((props.stats.total / daysInMonth.value) * 100)
})

const calendarDays = computed(() => {
  if (!props.employee) return []

  const firstDay = new Date(props.year, props.month, 1).getDay()
  const days: any[] = []

  // Vacíos
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null })
  }

  for (let d = 1; d <= daysInMonth.value; d++) {
    const dow = new Date(props.year, props.month, d).getDay()
    const isSunday = dow === 0
    const status = isSunday ? 'D' : props.employee.attendance[d - 1] || ''
    days.push({ day: d, status, isSunday })
  }

  return days
})
</script>
<template>
  <UModal
    :model-value="isOpen"
    @update:model-value="emit('close')"
    :ui="{ width: 'max-w-6xl w-[95vw]' }"
  >
    <div v-if="employee && stats" class="bg-card rounded-xl overflow-hidden">

      <!-- HEADER -->
      <div class="px-6 py-4 border-b bg-secondary/30 flex gap-4 items-center">
        <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <User class="w-7 h-7 text-primary" />
        </div>

        <div class="flex-1">
          <h2 class="text-xl font-bold">
            {{ employee.apellidos }}, {{ employee.nombres }}
          </h2>

          <div class="flex gap-2 mt-1 flex-wrap text-xs">
            <UBadge>{{ employee.cargo }}</UBadge>
            <span>DNI: {{ employee.dni }}</span>
            <UBadge variant="outline">
              {{ MONTHS[month] }} {{ year }}
            </UBadge>
          </div>
        </div>

        <div class="hidden md:flex gap-3">
          <div class="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded">
            <Calendar class="w-4 h-4 text-primary" />
            {{ employee.fechaIngreso }}
          </div>
          <div class="flex items-center gap-2 bg-vacation/10 px-3 py-1 rounded">
            <MapPin class="w-4 h-4 text-vacation" />
            {{ employee.provincia }}
          </div>
          <div class="flex items-center gap-2 bg-sunday/10 px-3 py-1 rounded">
            <Building2 class="w-4 h-4 text-sunday" />
            {{ employee.empresa }}
          </div>
          <div class="flex items-center gap-2 bg-present/10 px-3 py-1 rounded">
            <Wallet class="w-4 h-4 text-present" />
            S/ {{ employee.movilidad }}
          </div>
        </div>
      </div>

      <!-- BODY -->
      <div class="p-6 flex gap-6">

        <!-- CALENDARIO -->
        <div class="flex-1">
          <h3 class="text-xs font-semibold mb-3">Calendario de Asistencia</h3>

          <div class="p-4 rounded-xl bg-secondary/30 border">
            <div class="grid grid-cols-7 gap-1.5 mb-2">
              <div
                v-for="(d,i) in DAYS_SHORT"
                :key="d"
                class="text-xs text-center font-semibold py-1.5 rounded"
                :class="i===0 ? 'bg-sunday/10 text-sunday' : 'bg-secondary/50'"
              >
                {{ d }}
              </div>
            </div>

            <div class="grid grid-cols-7 gap-1.5">
              <UTooltip
                v-for="(item,i) in calendarDays"
                :key="i"
                :text="item.day ? STATUS_CONFIG[item.status]?.label : ''"
              >
                <div
                  v-if="item.day"
                  class="aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer"
                  :class="STATUS_CONFIG[item.status]?.bg"
                >
                  <span class="font-bold text-sm">
                    {{ item.day }}
                  </span>
                  <div
                    v-if="item.status && item.status!=='D'"
                    class="w-2 h-2 rounded-full mt-0.5"
                    :class="STATUS_CONFIG[item.status]?.color"
                  />
                </div>

                <div v-else class="aspect-square" />
              </UTooltip>
            </div>

            <div class="flex justify-center gap-4 mt-4 text-xs">
              <div class="flex items-center gap-1"><span class="w-3 h-3 bg-present rounded-full" /> Presente</div>
              <div class="flex items-center gap-1"><span class="w-3 h-3 bg-vacation rounded-full" /> Vacaciones</div>
              <div class="flex items-center gap-1"><span class="w-3 h-3 bg-medical rounded-full" /> Médico</div>
              <div class="flex items-center gap-1"><span class="w-3 h-3 bg-sunday rounded-full" /> Domingo</div>
            </div>
          </div>
        </div>

        <!-- RESUMEN -->
        <div class="w-72 flex flex-col gap-3">

          <div class="p-4 rounded-xl bg-primary/5 border">
            <div class="flex justify-between mb-2">
              <span>Asistencia</span>
              <strong>{{ stats.total }}/{{ daysInMonth }}</strong>
            </div>
            <UProgress :value="attendancePercentage" />
            <p class="text-center text-xs mt-1">{{ attendancePercentage }}%</p>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="p-3 bg-present/10 rounded">
              <strong class="text-present">{{ stats.total }}</strong>
              <div class="text-[10px]">Trabajados</div>
            </div>
            <div class="p-3 bg-vacation/10 rounded">
              <strong class="text-vacation">{{ stats.vacaciones }}</strong>
              <div class="text-[10px]">Vacaciones</div>
            </div>
            <div class="p-3 bg-medical/10 rounded">
              <strong class="text-medical">{{ stats.dm }}</strong>
              <div class="text-[10px]">DM</div>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-present/10 border">
            <div class="flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-present" />
              <span class="text-xs">Monto a Depositar</span>
            </div>
            <p class="text-3xl font-bold text-present">
              S/ {{ stats.montoAprox }}
            </p>

            <UBadge
              v-if="stats.vacMayor23>0"
              class="mt-2 bg-sunday/20 text-sunday border-0"
            >
              +S/ {{ stats.vacMayor23 }} bono Vac &gt;23
            </UBadge>
          </div>

          <div
            v-if="employee.comentario"
            class="p-3 bg-vacation/10 rounded border"
          >
            <div class="flex gap-2">
              <FileText class="w-4 h-4 text-vacation mt-0.5" />
              <div>
                <div class="text-[10px]">Comentario</div>
                <div class="text-xs">{{ employee.comentario }}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </UModal>
</template>
