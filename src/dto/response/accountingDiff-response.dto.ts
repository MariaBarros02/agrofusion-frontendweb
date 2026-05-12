
import type {
  AccountingMetadata,
  AccountingSummary,
  AccountingInvoice,
  AccountingTransaction,
} from "./accountingConsult-response.dto"; 

 
// ── Elemento de diff con indicación de cambio ───────────────────────────────
 
export type DiffChangeType = "created" | "modified" | "deleted";
 
export type InvoiceDiff = {
  change_type: DiffChangeType;
  /** Versión anterior de la factura. null si fue recién creada. */
  previous: AccountingInvoice | null;
  /** Versión actual de la factura. null si fue eliminada. */
  current: AccountingInvoice | null;
};
 
export type TransactionDiff = {
  change_type: DiffChangeType;
  /** Versión anterior de la transacción. null si fue recién creada. */
  previous: AccountingTransaction | null;
  /** Versión actual de la transacción. null si fue eliminada. */
  current: AccountingTransaction | null;
};
 
 
// ── Respuesta del endpoint de refresh/diff ──────────────────────────────────
 
export type CheckRefreshResponse = {
  /** true si existe al menos una diferencia entre el payload almacenado y la nueva consulta */
  has_changes: boolean;
 
  /** Metadata del payload original almacenado en BD */
  previous_metadata: AccountingMetadata;
  /** Metadata de la nueva consulta al endpoint externo */
  current_metadata: AccountingMetadata;
 
  /** Summary del payload original almacenado en BD */
  previous_summary: AccountingSummary;
  /** Summary de la nueva consulta al endpoint externo */
  current_summary: AccountingSummary;
 
  /**
   * Facturas que fueron creadas, modificadas o eliminadas.
   * Las facturas sin cambios NO se incluyen.
   */
  invoice_diffs: InvoiceDiff[];
 
  /**
   * Transacciones que fueron creadas, modificadas o eliminadas.
   * Las transacciones sin cambios NO se incluyen.
   */
  transaction_diffs: TransactionDiff[];
};