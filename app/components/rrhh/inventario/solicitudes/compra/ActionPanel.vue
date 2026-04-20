<script setup lang="ts">
import type { PurchaseWorkflowRecord } from '~/types/rrhh/solicitudes-compra'

type FileKind = 'image' | 'pdf'

const record = defineModel<PurchaseWorkflowRecord>({ required: true })

const props = defineProps<{
  busy: boolean
  nextAction: string
  totals: { amount: number; reimbursed: number; exceeded: number }
  formatMoney: (amount: number) => string
  formatDate: (value?: string | null) => string
  formatTime: (value?: string | null) => string
  onApproveByRrhh: () => void
  onRejectByRrhh: () => void
  onValidateByGerencia: () => void
  onRegisterInvoiceFromTechnician: () => void
  onValidateInvoice: () => void
  onRequestInvoiceCorrection: () => void
  onMarkAsPaid: () => void
  onReopenRejectedRequest: () => void
  onInvoiceFileSelected: (event: Event) => void
  onVoucherFileSelected: (event: Event) => void
  onPreviewFile: (fileUrl: string, fileName: string, fileKind: FileKind) => void
}>()

const canRejectByRrhh = computed(() => !!record.value.rejectionReason.trim() && !props.busy)
const canApproveByRrhh = computed(() => !props.busy)

const canValidateByGerencia = computed(() => !props.busy)

const canRegisterInvoice = computed(() => {
  const amount = Number(record.value.invoiceAmount ?? 0)
  return !!record.value.invoiceFileUrl && Number.isFinite(amount) && amount > 0 && !props.busy
})

const canValidateInvoice = computed(() => record.value.invoiceValidated && !props.busy)

const canMarkAsPaid = computed(() => !props.busy)
</script>

<template>
  <div class="space-y-3">
    <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60 sm:p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Accion requerida
          </p>
          <p class="text-base font-bold text-gray-950 dark:text-white">
            {{ props.nextAction }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Esta seccion es la principal: registra tu decision y avanza el flujo.
          </p>
        </div>
        <span class="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 dark:bg-gray-900/60 dark:text-gray-300 dark:ring-gray-800">
          <UIcon name="i-lucide-shield-check" class="h-4 w-4" />
          Checklist
        </span>
      </div>
    </div>

    <div
      v-if="record.status === 'pendiente'"
      class="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/15 sm:p-5"
    >
      <p class="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
        1. Revision RRHH
      </p>

      <div class="mt-4 space-y-4">
        <UFormGroup label="Comentario (interno)">
          <UTextarea
            v-model="record.rrhhComment"
            :rows="4"
            placeholder="Justifica tu decision o deja el contexto para auditoria..."
          />
        </UFormGroup>

        <UFormGroup label="Motivo de rechazo (obligatorio si rechazas)">
          <UTextarea
            v-model="record.rejectionReason"
            :rows="4"
            placeholder="Ej: Aun tienes botas vigentes. Indica el motivo exacto y accion sugerida."
          />
        </UFormGroup>

        <div class="flex flex-wrap justify-end gap-2">
          <UButton
            color="error"
            variant="outline"
            :loading="props.busy"
            :disabled="!canRejectByRrhh"
            @click="props.onRejectByRrhh"
          >
            Rechazar
          </UButton>
          <UButton
            color="success"
            :loading="props.busy"
            :disabled="!canApproveByRrhh"
            @click="props.onApproveByRrhh"
          >
            Aprobar
          </UButton>
        </div>
      </div>
    </div>

    <div
      v-else-if="record.status === 'pendiente_gerencia'"
      class="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/15 sm:p-5"
    >
      <p class="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
        2. Validacion gerencia
      </p>

      <div class="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Enviar correo automatico al validar</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Se usa plantilla para comunicar requisitos y tope de reembolso.</p>
          </div>
          <USwitch v-model="record.sendEmail" />
        </div>

        <div v-if="record.sendEmail" class="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <div class="grid gap-2 sm:grid-cols-3">
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900/60">
              <span>Solicitante</span>
              <USwitch v-model="record.emailToRequester" />
            </div>
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900/60">
              <span>Copia RRHH</span>
              <USwitch v-model="record.emailCopyRrhh" />
            </div>
            <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900/60">
              <span>Copia Compras</span>
              <USwitch v-model="record.emailCopyCompras" />
            </div>
          </div>

          <UFormGroup label="Plantilla de correo">
            <UTextarea v-model="record.emailTemplate" :rows="9" />
          </UFormGroup>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <UButton
          color="success"
          :loading="props.busy"
          :disabled="!canValidateByGerencia"
          @click="props.onValidateByGerencia"
        >
          Validado por gerencia
        </UButton>
      </div>
    </div>

    <div
      v-else-if="record.status === 'aprobado_esperando_compra'"
      class="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/15 sm:p-5"
    >
      <p class="text-sm font-semibold text-blue-900 dark:text-blue-200">
        3. En manos del trabajador
      </p>
      <p class="mt-1 text-xs text-blue-800 dark:text-blue-300">
        Simula el envio del tecnico: boleta/factura + monto total.
      </p>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Comprobante</p>
          <input
            type="file"
            accept=".pdf,image/*"
            class="mt-3 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#eef4ff] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#2d5fc0] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
            :disabled="props.busy"
            @change="props.onInvoiceFileSelected"
          >
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {{ record.invoiceFileName || 'Sin archivo cargado' }}
          </p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
          <UFormGroup label="Monto total de compra (S/)">
            <UInput
              v-model.number="record.invoiceAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 150.00"
              :disabled="props.busy"
            />
          </UFormGroup>
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Reembolso maximo: S/ {{ props.formatMoney(props.totals.reimbursed) }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <UButton
          color="primary"
          :loading="props.busy"
          :disabled="!canRegisterInvoice"
          @click="props.onRegisterInvoiceFromTechnician"
        >
          Registrar comprobante subido
        </UButton>
      </div>
    </div>

    <div
      v-else-if="record.status === 'comprado_por_revisar'"
      class="rounded-2xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900/50 dark:bg-orange-950/15 sm:p-5"
    >
      <p class="text-sm font-semibold text-orange-900 dark:text-orange-200">
        3. Validacion de comprobante
      </p>

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Factura / boleta</p>
          <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
            {{ record.invoiceFileName || 'Sin archivo cargado' }}
          </p>
          <UButton
            v-if="record.invoiceFileUrl && record.invoiceFileKind"
            class="mt-3"
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-eye"
            :disabled="props.busy"
            @click="props.onPreviewFile(record.invoiceFileUrl, record.invoiceFileName || 'Comprobante', record.invoiceFileKind)"
          >
            Ver archivo
          </UButton>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-950/60">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Calculo automatico</p>
          <div class="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
            <p>Gasto total: <span class="font-semibold">S/ {{ props.formatMoney(props.totals.amount) }}</span></p>
            <p>Reembolso maximo: <span class="font-semibold">S/ {{ props.formatMoney(props.totals.reimbursed) }}</span></p>
            <p>Excedente trabajador: <span class="font-semibold">S/ {{ props.formatMoney(props.totals.exceeded) }}</span></p>
          </div>

          <div class="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/60">
            <span class="text-xs text-gray-600 dark:text-gray-300">Factura valida (botas dielectricas + puntera)</span>
            <USwitch v-model="record.invoiceValidated" :disabled="props.busy" />
          </div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          :disabled="props.busy"
          @click="props.onRequestInvoiceCorrection"
        >
          Solicitar correccion
        </UButton>
        <UButton
          color="success"
          :loading="props.busy"
          :disabled="!canValidateInvoice"
          @click="props.onValidateInvoice"
        >
          Validar factura
        </UButton>
      </div>
    </div>

    <div
      v-else-if="record.status === 'listo_para_reembolso'"
      class="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/15 sm:p-5"
    >
      <p class="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
        4. Cierre de caja
      </p>
      <p class="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
        Reembolsar: <span class="font-semibold">S/ {{ props.formatMoney(props.totals.reimbursed) }}</span>
      </p>

      <div class="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950/60">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Voucher de pago (opcional)</p>
        <input
          type="file"
          accept=".pdf,image/*"
          class="mt-3 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#eef4ff] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#2d5fc0] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
          :disabled="props.busy"
          @change="props.onVoucherFileSelected"
        >
        <div class="mt-2 flex items-center justify-between gap-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ record.voucherFileName || 'Sin voucher cargado' }}
          </p>
          <UButton
            v-if="record.voucherFileUrl && record.voucherFileKind"
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-eye"
            :disabled="props.busy"
            @click="props.onPreviewFile(record.voucherFileUrl, record.voucherFileName || 'Voucher', record.voucherFileKind)"
          >
            Ver voucher
          </UButton>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <UButton
          color="success"
          :loading="props.busy"
          :disabled="!canMarkAsPaid"
          @click="props.onMarkAsPaid"
        >
          Marcar como pagado
        </UButton>
      </div>
    </div>

    <div v-else-if="record.status === 'finalizado'" class="rounded-2xl border border-emerald-700 bg-emerald-900 p-4 text-emerald-50 sm:p-5">
      <p class="text-sm font-semibold">Proceso finalizado</p>
      <p class="mt-2 text-xs opacity-90">
        Pago registrado el {{ props.formatDate(record.paidAt) }} {{ props.formatTime(record.paidAt) }}.
      </p>
      <p class="mt-1 text-xs opacity-90">
        Flujo completo: RRHH -> Gerencia -> Factura -> Reembolso.
      </p>
    </div>

    <div
      v-else-if="record.status === 'rechazado'"
      class="rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/15 sm:p-5"
    >
      <p class="text-sm font-semibold text-red-800 dark:text-red-300">Solicitud rechazada</p>
      <p class="mt-2 text-xs text-red-700 dark:text-red-300">
        Motivo: {{ record.rejectionReason || 'Sin motivo registrado.' }}
      </p>
      <div class="mt-4 flex justify-end">
        <UButton color="neutral" variant="outline" :disabled="props.busy" @click="props.onReopenRejectedRequest">
          Reabrir solicitud
        </UButton>
      </div>
    </div>

    <p class="text-xs text-gray-500 dark:text-gray-400">
      Maqueta frontend funcional: los cambios de estado, correo, calculos y archivos se guardan en memoria local.
    </p>
  </div>
</template>

