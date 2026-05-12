// ============================================================
// RF-INT-XX - Tipos para la respuesta de actualización contable
// ============================================================

export type AccountingUpdateAccountingResponse = {
  success: boolean | null;
  exchangeId: string | null;
  batchId: number | null;
  status: string | null;
};

// ── Metadata del AgroFusionExchangeUpdate ────────────────────

export type AgroFusionUpdateSourceSystem = {
  SystemId: string;
  SystemName: string;
  SystemNIT: string;
  Environment: string;
};

export type AgroFusionUpdateMetadata = {
  ExchangeId: string;
  OriginalExchangeId: string;
  GeneratedAt: string;
  StandardVersion: string;
  UpdateType: string;
  RequestedPeriod: {
    From: string;
    To: string;
  };
  DetectionMethod: string;
  DetectedAt: string;
  SourceSystem: AgroFusionUpdateSourceSystem;
  GeneratedBy: string;
};

// ── DiffSummary ───────────────────────────────────────────────

export type AgroFusionUpdateDiffSummary = {
  TotalChanges: number;
  NewDocuments: number;
  ModifiedDocuments: number;
  CancelledDocuments: number;
  NoChangeDocuments: number;
  NetAmountDelta: number;
  Currency: string;
};

// ── ChangeMetadata (facturas y transacciones) ─────────────────

export type AgroFusionChangeMetadata = {
  ChangeType: "CREATED" | "MODIFIED" | "DELETED";
  Reason: string;
  DetectedFields: string[];
  PreviousSnapshot: Record<string, unknown> | null;
};

// ── Invoice change ────────────────────────────────────────────

export type AgroFusionInvoiceChange = {
  changeType: "CREATED" | "MODIFIED" | "DELETED";
  ChangeMetadata: AgroFusionChangeMetadata;
  Header: {
    DocumentId: string | null;
    Prefix: string | null;
    Serial: string | null;
    Type: {
      Code: string;
      Name: string;
    } | null;
    IssueDate: string | null;
    DueDate: string | null;
    Status: string | null;
  };
  ThirdParty: {
    NIT: string | null;
    Name: string | null;
  };
  Totals: {
    TotalPayment: number | null;
    OutstandingBalance: number | null;
  };
};

// ── Transaction change ────────────────────────────────────────

export type AgroFusionTransactionChange = {
  changeType: "CREATED" | "MODIFIED" | "DELETED";
  ChangeMetadata: AgroFusionChangeMetadata;
  DocumentId: string | null;
  Type: {
    Code: string;
    Name: string;
  } | null;
  Date: string | null;
  RelatedInvoiceId: string | null;
  ThirdParty: {
    NIT: string | null;
    Name: string | null;
  };
  Amount: number | null;
  Currency: string | null;
  Status: string | null;
};

// ── Payload completo enviado a contabilidad ───────────────────

export type AgroFusionExchangeUpdate = {
  AgroFusionExchangeUpdate: {
    version: string;
    Metadata: AgroFusionUpdateMetadata;
    DiffSummary: AgroFusionUpdateDiffSummary;
    Changes: {
      Invoices: AgroFusionInvoiceChange[];
      Transactions: AgroFusionTransactionChange[];
    };
    ExpectedAcknowledgment: {
      AckFormat: string;
      ExpectedWithinMinutes: number;
      RequiredFields: string[];
    };
  };
};

// ── Respuesta principal del endpoint ─────────────────────────

export type AccountingUpdateResponse = {
  success: boolean;
  message_code: string;
  transfer_id: string;
  new_exchange_id: string;
  accounting_response: AccountingUpdateAccountingResponse | null;
  sent_payload: AgroFusionExchangeUpdate | null;
};