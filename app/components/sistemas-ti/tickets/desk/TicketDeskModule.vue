
<script setup lang="ts">
import { computed, ref } from 'vue'

type Role = 'user' | 'technician' | 'admin'

type DeskHistory = {
  icon: string
  title: string
  meta: string
  tone: string
}

const role = ref<Role>('technician')

const metrics = [
  { label: 'Tickets abiertos', value: '128', icon: 'i-lucide-clock-3', tone: 'bg-blue-500/10 text-blue-600' },
  { label: 'SLA violado', value: '14', icon: 'i-lucide-triangle-alert', tone: 'bg-red-500/10 text-red-600' },
  { label: 'Tiempo medio de resolucion', value: '3h 24m', icon: 'i-lucide-timer', tone: 'bg-amber-500/10 text-amber-600' },
  { label: 'Escalados', value: '9', icon: 'i-lucide-arrow-up-right', tone: 'bg-violet-500/10 text-violet-600' },
]

const tickets = [
  { id: 'TK-1023', title: 'Solicitud de equipo para nuevo colaborador', requester: 'Maria Rojas', area: 'Operations', category: 'Hardware', priority: 'Critica', slaHours: 4.5, status: 'Nuevo', tech: 'Luis Torres', created: '2026-02-06 09:41' },
  { id: 'TK-1018', title: 'Acceso VPN para supervisor de almacen', requester: 'Carlos Pineda', area: 'Warehouse', category: 'Red', priority: 'Alta', slaHours: 2.1, status: 'En progreso', tech: 'Rosa Medina', created: '2026-02-06 08:15' },
  { id: 'TK-1012', title: 'Pantalla azul en laptop de Finanzas', requester: 'Ana Ruiz', area: 'Management', category: 'Software', priority: 'Media', slaHours: 0, status: 'Escalado', tech: 'Marco Rivas', created: '2026-02-05 17:02' },
]

const userTickets = ref([
  { id: 'TK-2001', title: 'Acceso a CRM', status: 'En Progreso', priority: 'Media', created: '2026-02-06', tech: 'Rosa Medina' },
  { id: 'TK-2002', title: 'Laptop lenta', status: 'Resuelto', priority: 'Alta', created: '2026-02-05', tech: 'Luis Torres' },
])

const histories = ref<DeskHistory[]>([
  { icon: 'i-lucide-history', title: 'Ticket creado', meta: '2026-02-06 09:41 · Maria Rojas', tone: 'bg-blue-500/10 text-blue-600' },
  { icon: 'i-lucide-user-cog', title: 'Tecnico asignado', meta: '2026-02-06 09:52 · Luis Torres', tone: 'bg-violet-500/10 text-violet-600' },
  { icon: 'i-lucide-user', title: 'Comentario del usuario', meta: '2026-02-06 10:01 · Se adjunta evidencia del incidente', tone: 'bg-slate-500/10 text-slate-600' },
  { icon: 'i-lucide-wrench', title: 'Comentario del tecnico', meta: '2026-02-06 10:05 · Se inicia diagnostico', tone: 'bg-amber-500/10 text-amber-600' },
])

const assets = [
  { name: 'Laptop Dell XPS', type: 'Laptop', serial: 'DLX-3920', status: 'Active' },
  { name: 'Monitor Samsung 24"', type: 'Monitor', serial: 'SM-24-991', status: 'Active' },
  { name: 'Corporate Phone iPhone', type: 'Phone', serial: 'IP-14-002', status: 'Active' },
]

const kbItems = [
  { title: 'VPN Access - Standard Steps', type: 'Known Error' },
  { title: 'Laptop Provisioning Checklist', type: 'Quick Fix' },
  { title: 'Asset Assignment Best Practices', type: 'Documentation' },
]

const openCreateTicket = ref(false)
const openAssignAsset = ref(false)
const openAssignSelf = ref(false)
const openHoldUser = ref(false)
const openHoldProvider = ref(false)
const openReassign = ref(false)
const openEscalate = ref(false)
const openResolve = ref(false)
const openClose = ref(false)
const openUserConfirm = ref(false)
const openLinkAsset = ref(false)

const currentStatus = ref('Abierto')
const currentPriority = ref('Critica')
const currentDepartment = ref('Operations')
const currentRequester = ref('Maria Rojas')
const currentSlaTotalHours = ref(8)
const currentSlaRemainingHours = ref(4.5)
const slaExpired = ref(false)
const userConfirmed = ref(false)

const pushHistory = (title: string, meta: string, tone: string, icon: string) => {
  histories.value.unshift({ title, meta, tone, icon })
}

const handleCreateTicket = () => {
  currentStatus.value = 'Abierto'
  currentPriority.value = 'Media'
  currentSlaTotalHours.value = 8
  currentSlaRemainingHours.value = 8
  slaExpired.value = false
  pushHistory('Ticket creado', 'Ahora · Sistema', 'bg-blue-500/10 text-blue-600', 'i-lucide-history')
  openCreateTicket.value = false
}

const handleStartWork = () => {
  currentStatus.value = 'En progreso'
  pushHistory('Estado cambiado a En progreso', 'Ahora · Tecnico', 'bg-amber-500/10 text-amber-600', 'i-lucide-wrench')
}

const handleAssignAsset = () => {
  if (currentStatus.value === 'Abierto') currentStatus.value = 'Asignado'
  pushHistory('Equipo asignado', 'Ahora · Dell Latitude 5520', 'bg-emerald-500/10 text-emerald-600', 'i-lucide-hard-drive')
  openAssignAsset.value = false
}

const handleAssignSelf = () => {
  currentStatus.value = 'En progreso'
  pushHistory('Tecnico asignado', 'Ahora · Luis Torres', 'bg-violet-500/10 text-violet-600', 'i-lucide-user-cog')
  openAssignSelf.value = false
}

const handleHoldUser = () => {
  currentStatus.value = 'Esperando Usuario'
  pushHistory('Esperando usuario', 'Ahora · Se solicito informacion', 'bg-amber-500/10 text-amber-600', 'i-lucide-triangle-alert')
  openHoldUser.value = false
}

const handleHoldProvider = () => {
  currentStatus.value = 'Esperando Proveedor'
  pushHistory('Esperando proveedor', 'Ahora · Proveedor externo', 'bg-amber-500/10 text-amber-600', 'i-lucide-triangle-alert')
  openHoldProvider.value = false
}

const handleReassign = () => {
  pushHistory('Tecnico reasignado', 'Ahora · Nuevo tecnico asignado', 'bg-violet-500/10 text-violet-600', 'i-lucide-user-cog')
  openReassign.value = false
}

const handleLinkAsset = () => {
  pushHistory('Activo vinculado', 'Ahora · Laptop/PC vinculada', 'bg-emerald-500/10 text-emerald-600', 'i-lucide-hard-drive')
  openLinkAsset.value = false
}

const handleUserReply = () => {
  if (currentStatus.value === 'Esperando Usuario') currentStatus.value = 'En progreso'
  pushHistory('Comentario del usuario', 'Ahora · Respuesta del usuario', 'bg-slate-500/10 text-slate-600', 'i-lucide-user')
}

const handleUserConfirmClose = () => {
  userConfirmed.value = true
  currentStatus.value = 'Cerrado'
  pushHistory('Ticket cerrado por usuario', 'Ahora · Confirmacion de usuario', 'bg-slate-500/10 text-slate-600', 'i-lucide-badge-check')
  openUserConfirm.value = false
}

const handleUserReopen = () => {
  currentStatus.value = 'En progreso'
  pushHistory('Ticket reabierto', 'Ahora · Usuario no confirmo', 'bg-amber-500/10 text-amber-600', 'i-lucide-triangle-alert')
  openUserConfirm.value = false
}

const handleEscalate = () => {
  currentStatus.value = 'Escalado'
  pushHistory('Ticket escalado', 'Ahora · Supervisor', 'bg-violet-500/10 text-violet-600', 'i-lucide-shield-alert')
  openEscalate.value = false
}

const handleResolve = () => {
  currentStatus.value = 'Resuelto'
  pushHistory('Ticket resuelto', 'Ahora · Tecnico', 'bg-emerald-500/10 text-emerald-600', 'i-lucide-check-circle')
  openResolve.value = false
}

const handleClose = () => {
  currentStatus.value = 'Cerrado'
  pushHistory('Ticket cerrado', 'Ahora · Sistema', 'bg-slate-500/10 text-slate-600', 'i-lucide-badge-check')
  openClose.value = false
}

const slaProgress = computed(() => {
  const total = currentSlaTotalHours.value || 1
  const remaining = currentSlaRemainingHours.value
  const used = Math.max(0, total - remaining)
  return Math.min(100, Math.round((used / total) * 100))
})

const slaStatusLabel = computed(() => {
  if (slaExpired.value || currentSlaRemainingHours.value <= 0) return 'Violado'
  if (currentSlaRemainingHours.value <= 2) return 'En riesgo'
  return 'Dentro del SLA'
})

const steps = ['Abierto', 'Asignado', 'En progreso', 'Escalado', 'Resuelto', 'Cerrado']
const currentStepIndex = computed(() => Math.max(0, steps.indexOf(currentStatus.value)))
const canClose = computed(() => currentStatus.value === 'Resuelto' && (userConfirmed.value || slaExpired.value))
</script>
<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-gray-500">Rol:</span>
        <UButton size="xs" :variant="role === 'user' ? 'solid' : 'outline'" @click="role = 'user'">Usuario final</UButton>
        <UButton size="xs" :variant="role === 'technician' ? 'solid' : 'outline'" @click="role = 'technician'">Tecnico TI</UButton>
        <UButton size="xs" :variant="role === 'admin' ? 'solid' : 'outline'" @click="role = 'admin'">Admin TI</UButton>
      </div>
    </UCard>

    <section v-if="role === 'user'" class="space-y-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">Portal de Mesa de Ayuda</p>
            <p class="text-xs text-gray-500">Crea y gestiona tus tickets</p>
          </div>
          <UButton icon="i-lucide-plus" @click="openCreateTicket = true">Crear Ticket</UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <p class="font-semibold">Mis Tickets</p>
        </template>
        <div class="space-y-2">
          <div v-for="ticket in userTickets" :key="ticket.id" class="rounded border p-3 text-sm">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-xs">{{ ticket.id }}</span>
              <UBadge variant="soft">{{ ticket.status }}</UBadge>
              <UBadge variant="soft">{{ ticket.priority }}</UBadge>
            </div>
            <p class="mt-1 font-semibold">{{ ticket.title }}</p>
            <p class="text-xs text-gray-500">{{ ticket.created }} · {{ ticket.tech }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <p class="font-semibold">Conversacion del ticket</p>
        </template>
        <div class="space-y-2 text-sm">
          <div class="rounded border p-2">Usuario: ¿Pueden ayudarme con el acceso al CRM?</div>
          <div class="rounded border p-2">Tecnico: Revisando permisos, por favor espere.</div>
          <div class="flex gap-2">
            <UInput placeholder="Escribe tu respuesta..." />
            <UButton @click="handleUserReply">Responder</UButton>
            <UButton variant="outline">Adjuntar</UButton>
          </div>
        </div>
      </UCard>
    </section>

    <section v-else class="space-y-4">
      <template v-if="role === 'technician'">
        <div class="grid gap-3 md:grid-cols-4">
          <UCard v-for="metric in metrics" :key="metric.label">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500">{{ metric.label }}</p>
                <p class="text-2xl font-semibold">{{ metric.value }}</p>
              </div>
              <div :class="['size-8 rounded flex items-center justify-center', metric.tone]">
                <UIcon :name="metric.icon" class="size-4" />
              </div>
            </div>
          </UCard>
        </div>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <p class="font-semibold">Dashboard de Tickets</p>
              <UButton class="ml-auto" icon="i-lucide-plus" @click="openCreateTicket = true">Crear ticket</UButton>
            </div>
          </template>
          <div class="space-y-2">
            <div v-for="ticket in tickets" :key="ticket.id" class="rounded border p-3 text-sm">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono text-xs">{{ ticket.id }}</span>
                <UBadge variant="soft">{{ ticket.priority }}</UBadge>
                <UBadge variant="soft">{{ ticket.status }}</UBadge>
              </div>
              <p class="mt-1 font-semibold">{{ ticket.title }}</p>
              <p class="text-xs text-gray-500">{{ ticket.requester }} · {{ ticket.area }} · SLA {{ ticket.slaHours }}h</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <UBadge variant="outline">TK-1023</UBadge>
                  <UBadge>{{ currentPriority }}</UBadge>
                  <UBadge variant="soft">{{ currentStatus }}</UBadge>
                  <UBadge variant="soft">{{ slaStatusLabel }}</UBadge>
                </div>
                <p class="mt-1 font-semibold">Solicitud de equipo para nuevo colaborador</p>
                <p class="text-xs text-gray-500">{{ currentRequester }} · {{ currentDepartment }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <UButton size="xs" @click="handleStartWork">Iniciar trabajo</UButton>
                <UButton size="xs" variant="outline" @click="openEscalate = true">Escalar</UButton>
                <UButton size="xs" variant="outline" @click="openResolve = true">Resolver</UButton>
                <UButton size="xs" variant="outline" :disabled="!canClose" @click="openClose = true">Cerrar</UButton>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <div class="grid grid-cols-6 gap-1 text-[11px]">
              <div v-for="(step, idx) in steps" :key="step" class="flex items-center gap-1">
                <div class="size-2 rounded-full" :class="idx <= currentStepIndex ? 'bg-primary' : 'bg-gray-300'" />
                <span>{{ step }}</span>
              </div>
            </div>

            <div class="grid gap-2 md:grid-cols-3">
              <div class="rounded border p-2 text-xs">SLA total: <span class="font-semibold">{{ currentSlaTotalHours }}h</span></div>
              <div class="rounded border p-2 text-xs">SLA restante: <span class="font-semibold">{{ currentSlaRemainingHours }}h</span></div>
              <div class="rounded border p-2 text-xs">Estado SLA: <span class="font-semibold">{{ slaStatusLabel }}</span></div>
            </div>

            <UProgress :value="slaProgress" />

            <div class="grid gap-3 lg:grid-cols-3">
              <div class="rounded border p-3">
                <p class="font-semibold text-sm">Acciones del tecnico</p>
                <div class="mt-2 grid gap-2">
                  <UButton size="xs" @click="openAssignSelf = true">Asignarme</UButton>
                  <UButton size="xs" @click="openAssignAsset = true">Asignar equipo</UButton>
                  <UButton size="xs" variant="outline" @click="openHoldUser = true">Esperando usuario</UButton>
                  <UButton size="xs" variant="outline" @click="openHoldProvider = true">Esperando proveedor</UButton>
                  <UButton size="xs" variant="outline" @click="openReassign = true">Reasignar tecnico</UButton>
                  <UButton size="xs" variant="outline" @click="openLinkAsset = true">Vincular activo</UButton>
                </div>
              </div>

              <div class="rounded border p-3 lg:col-span-2">
                <p class="font-semibold text-sm">Timeline / Historial</p>
                <div class="mt-2 max-h-60 space-y-2 overflow-y-auto">
                  <div v-for="entry in histories" :key="entry.title" class="flex gap-2 rounded border p-2">
                    <div :class="['size-7 rounded-full flex items-center justify-center', entry.tone]">
                      <UIcon :name="entry.icon" class="size-3" />
                    </div>
                    <div>
                      <p class="text-sm font-semibold">{{ entry.title }}</p>
                      <p class="text-xs text-gray-500">{{ entry.meta }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid gap-3 md:grid-cols-2">
              <UCard>
                <template #header><p class="font-semibold text-sm">Activos asignados</p></template>
                <div class="space-y-1 text-xs">
                  <div v-for="asset in assets" :key="asset.serial" class="rounded border p-2">
                    <p class="font-semibold">{{ asset.name }}</p>
                    <p class="text-gray-500">{{ asset.type }} · {{ asset.serial }} · {{ asset.status }}</p>
                  </div>
                </div>
              </UCard>
              <UCard>
                <template #header><p class="font-semibold text-sm">Base de conocimiento</p></template>
                <div class="space-y-2 text-xs">
                  <div v-for="item in kbItems" :key="item.title" class="rounded border p-2">
                    <p class="font-semibold">{{ item.title }}</p>
                    <p class="text-gray-500">{{ item.type }}</p>
                  </div>
                  <UButton size="xs" icon="i-lucide-book-open">Crear articulo</UButton>
                </div>
              </UCard>
            </div>

            <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <div class="rounded border p-2">
                <p class="text-xs font-semibold flex items-center gap-1"><UIcon name="i-lucide-bar-chart-3" class="size-3" /> SLA compliance</p>
                <UProgress class="mt-1" :value="86" />
              </div>
              <div class="rounded border p-2"><p class="text-xs font-semibold"><UIcon name="i-lucide-users" class="inline size-3" /> Escalations by Area</p><p class="text-xs text-gray-500 mt-1">Operations 3</p></div>
              <div class="rounded border p-2"><p class="text-xs font-semibold"><UIcon name="i-lucide-user" class="inline size-3" /> Technician workload</p><p class="text-xs text-gray-500 mt-1">Rosa 12</p></div>
              <div class="rounded border p-2"><p class="text-xs font-semibold"><UIcon name="i-lucide-briefcase" class="inline size-3" /> MTTR</p><p class="text-sm font-semibold mt-1">3h 24m</p></div>
              <div class="rounded border p-2"><p class="text-xs font-semibold"><UIcon name="i-lucide-building-2" class="inline size-3" /> Volumen por area</p><p class="text-xs text-gray-500 mt-1">Operations 48</p></div>
            </div>
          </div>
        </UCard>
      </template>

      <template v-else>
        <UCard>
          <template #header><p class="font-semibold">Panel Admin TI</p></template>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded border p-3 text-xs">Configuracion de SLA</div>
            <div class="rounded border p-3 text-xs">Categorias & Flujos</div>
            <div class="rounded border p-3 text-xs">Reportes</div>
            <div class="rounded border p-3 text-xs">Inventario & Activos</div>
          </div>
        </UCard>
      </template>
    </section>

    <UModal v-model:open="openCreateTicket">
      <template #content>
        <div class="mx-auto w-full sm:max-w-xl space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Crear nuevo ticket
            </h3>
          </div>
          <UInput placeholder="Titulo del ticket" />
          <UTextarea placeholder="Descripcion" :rows="3" />
          <USelectMenu :items="[{ label: 'Usuario solicitante', value: 'u' }]" placeholder="Usuario solicitante" />
          <USelectMenu :items="[{ label: 'Departamento', value: 'd' }]" placeholder="Departamento" />
          <USelectMenu :items="[{ label: 'Hardware', value: 'hardware' }, { label: 'Software', value: 'software' }, { label: 'Red', value: 'network' }, { label: 'Seguridad', value: 'security' }, { label: 'Otros', value: 'other' }]" placeholder="Categoria (Hardware, Software, Red, Seguridad, Otros)" />
          <USelectMenu :items="[{ label: 'Baja', value: 'low' }, { label: 'Media', value: 'medium' }, { label: 'Alta', value: 'high' }, { label: 'Critica', value: 'critical' }]" placeholder="Prioridad (Baja, Media, Alta, Critica)" />
          <div class="rounded-lg border p-2 text-xs text-muted-foreground">
            Clasificacion automatica: Incidente / Requerimiento de Servicio.
          </div>
          <div class="rounded-lg border p-2 text-xs text-muted-foreground">
            SLA asignado automaticamente segun prioridad.
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openCreateTicket = false">Cancelar</UButton>
            <UButton @click="handleCreateTicket">Crear ticket</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openAssignAsset">
      <template #content>
        <div class="mx-auto w-full sm:max-w-xl space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Asignar equipo
            </h3>
          </div>
          <USelectMenu :items="[{ label: 'Laptop Dell Latitude 5520', value: 'a' }, { label: 'Monitor Samsung 24 pulgadas', value: 'm' }, { label: 'Corporate Phone iPhone', value: 'p' }]" placeholder="Seleccionar activo IT (PC, Laptop, Monitor, etc.)" />
          <USelectMenu :items="[{ label: 'Laptop', value: 'laptop' }, { label: 'Monitor', value: 'monitor' }, { label: 'Telefono', value: 'phone' }, { label: 'Accesorio', value: 'accessory' }]" placeholder="Filtrar por tipo (Laptop, Monitor, Telefono, Accesorio)" />
          <USelectMenu :items="[{ label: 'Docking', value: 'dock' }, { label: 'Mouse', value: 'mouse' }, { label: 'Headset', value: 'headset' }]" placeholder="Seleccionar accesorios (hijos)" />
          <UInput placeholder="Fecha de asignacion" />
          <UTextarea placeholder="Observaciones / Entrega" :rows="3" />
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openAssignAsset = false">Cancelar</UButton>
            <UButton @click="handleAssignAsset">Asignar activo</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openEscalate">
      <template #content>
        <div class="mx-auto w-full sm:max-w-xl space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Escalar ticket
            </h3>
          </div>
          <USelectMenu :items="[{ label: 'Nivel 2', value: 'n2' }, { label: 'Nivel 3', value: 'n3' }, { label: 'Proveedor externo', value: 'provider' }]" placeholder="Escalar a (Nivel 2 / Nivel 3 / Proveedor externo)" />
          <UTextarea placeholder="Motivo de escalamiento" :rows="3" />
          <USelectMenu :items="[{ label: 'Systems & IT', value: 'it' }, { label: 'Infraestructura', value: 'infra' }, { label: 'Ciberseguridad', value: 'security' }]" placeholder="Nuevo grupo tecnico" />
          <label class="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox">
            Aumentar prioridad
          </label>
          <label class="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox">
            Notificar supervisor
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openEscalate = false">Cancelar</UButton>
            <UButton @click="handleEscalate">Escalar</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openResolve">
      <template #content>
        <div class="mx-auto w-full sm:max-w-xl space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Resolver ticket
            </h3>
          </div>
          <UTextarea placeholder="Solucion aplicada" :rows="3" />
          <USelectMenu :items="[{ label: 'Error de software', value: 'software' }, { label: 'Configuracion', value: 'config' }, { label: 'Infraestructura', value: 'infra' }]" placeholder="Categoria de causa raiz" />
          <USelectMenu :items="[{ label: 'Laptop Dell Latitude 5520', value: 'laptop' }, { label: 'Sin activos afectados', value: 'none' }]" placeholder="Resumen de activos afectados" />
          <UInput placeholder="Evidencia adjunta (URL o referencia)" />
          <label class="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox">
            Usuario debe confirmar
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openResolve = false">Cancelar</UButton>
            <UButton @click="handleResolve">Resolver ticket</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openClose">
      <template #content>
        <div class="mx-auto w-full sm:max-w-xl space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Cerrar ticket
            </h3>
          </div>
          <div class="rounded-lg border p-3 text-xs text-muted-foreground">
            Disponible solo si el ticket esta resuelto.
          </div>
          <UTextarea placeholder="Comentario final" :rows="3" />
          <label class="flex items-center gap-2 text-xs">
            <input v-model="userConfirmed" type="checkbox">
            Usuario confirmo la solucion
          </label>
          <label class="flex items-center gap-2 text-xs">
            <input v-model="slaExpired" type="checkbox">
            SLA expiro
          </label>
          <div class="rounded-lg border p-3 text-xs text-muted-foreground">
            Encuesta de satisfaccion (estrellas)
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openClose = false">Cancelar</UButton>
            <UButton :disabled="!canClose" @click="handleClose">Cerrar ticket</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openAssignSelf">
      <template #content>
        <div class="mx-auto w-full sm:max-w-md space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Asignarme ticket
            </h3>
          </div>
          <div class="text-xs text-muted-foreground">
            Confirmar asignacion al tecnico actual.
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openAssignSelf = false">Cancelar</UButton>
            <UButton @click="handleAssignSelf">Asignarme</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openHoldUser">
      <template #content>
        <div class="mx-auto w-full sm:max-w-xl space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Esperando usuario
            </h3>
          </div>
          <UTextarea placeholder="Mensaje requerido al usuario" :rows="3" />
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openHoldUser = false">Cancelar</UButton>
            <UButton @click="handleHoldUser">Enviar y pausar SLA</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openHoldProvider">
      <template #content>
        <div class="mx-auto w-full sm:max-w-xl space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Esperando proveedor
            </h3>
          </div>
          <UTextarea placeholder="Detalle para proveedor" :rows="3" />
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openHoldProvider = false">Cancelar</UButton>
            <UButton @click="handleHoldProvider">Enviar y pausar SLA</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openReassign">
      <template #content>
        <div class="mx-auto w-full sm:max-w-md space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Reasignar tecnico
            </h3>
          </div>
          <USelectMenu :items="[{ label: 'Luis Torres', value: 'l' }, { label: 'Rosa Medina', value: 'r' }]" placeholder="Seleccionar tecnico" />
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openReassign = false">Cancelar</UButton>
            <UButton @click="handleReassign">Reasignar</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openLinkAsset">
      <template #content>
        <div class="mx-auto w-full sm:max-w-xl space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              Vincular activo
            </h3>
          </div>
          <USelectMenu :items="[{ label: 'Laptop/PC inventario', value: 'pc' }]" placeholder="Seleccionar Laptop/PC del inventario" />
          <UInput placeholder="Serial" />
          <UTextarea placeholder="Observaciones" :rows="3" />
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="outline" @click="openLinkAsset = false">Cancelar</UButton>
            <UButton @click="handleLinkAsset">Vincular</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="openUserConfirm">
      <template #content>
        <div class="mx-auto w-full sm:max-w-md space-y-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">
              ¿Confirma que el problema fue solucionado?
            </h3>
          </div>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="handleUserReopen">No, reabrir</UButton>
            <UButton @click="handleUserConfirmClose">Si, cerrar ticket</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
