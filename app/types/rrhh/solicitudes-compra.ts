export type PurchaseWorkflowStatus =
  | 'pendiente'
  | 'pendiente_gerencia'
  | 'aprobado_esperando_compra'
  | 'comprado_por_revisar'
  | 'listo_para_reembolso'
  | 'finalizado'
  | 'rechazado'

export interface PurchaseWorkflowRecord {
  status: PurchaseWorkflowStatus
  rrhhComment: string
  rejectionReason: string
  sendEmail: boolean
  emailToRequester: boolean
  emailCopyRrhh: boolean
  emailCopyCompras: boolean
  emailTemplate: string
  emailSentAt: string | null
  invoiceAmount: number | null
  invoiceFileName: string | null
  invoiceFileUrl: string | null
  invoiceFileKind: 'image' | 'pdf' | null
  invoiceUploadedAt: string | null
  invoiceValidated: boolean
  voucherFileName: string | null
  voucherFileUrl: string | null
  voucherFileKind: 'image' | 'pdf' | null
  paidAt: string | null
}
