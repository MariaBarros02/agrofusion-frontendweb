export type AccountingConsultResponse = {
  metadata: AccountingMetadata;
  summary: AccountingSummary;
  invoices: AccountingInvoice[];
  transactions: AccountingTransaction[];
};

export type AccountingMetadata = {
  ExchangeId: string;
  GeneratedAt: string;
  StandardVersion: string;
  RequestedPeriod: {
    From: string;
    To: string;
  };
  SourceSystem: {
    SystemId: string;
    SystemName: string;
    SystemNIT: string;
    Environment: string;
  };
  GeneratedBy: string;
};

export type AccountingSummary = {
  TotalDocuments: number;
  TotalInvoices: number;
  TotalTransactions: number;
  TotalGrossAmount: number;
  TotalNet: number;
  Currency: string;
};

export type AccountingInvoice = {
  Header: AccountingInvoiceHeader;
  ThirdParty: AccountingThirdParty;
  Totals: AccountingInvoiceTotals;
  Lines: AccountingInvoiceLine[];
};

export type AccountingInvoiceHeader = {
  DocumentId: string;
  Prefix: string;
  Serial: string;
  Type: {
    Code: string;
    Name: string;
  };
  IssueDate: string;
  DueDate: string;
  Status: string;
  UpdatedAt: string;
};

export type AccountingThirdParty = {
  NIT: string;
  Name: string;
  Address: string | null;
  City: string | null;
  Country: string | null;
  Email: string | null;
};

export type AccountingInvoiceTotals = {
  Subtotal: number;
  TotalVAT: number;
  TotalWithholdings: number;
  TotalDiscounts: number;
  TotalPayment: number;
  OutstandingBalance: number;
};

export type AccountingInvoiceLine = {
  Code: string;
  Name: string;
  Description: string;
  LineType: string;
  accounting_account: string[];
  Quantity: number;
  UnitPrice: number;
  Value: number;
  Taxes: unknown[];
};

export type AccountingTransaction = {
  DocumentId: string;
  Date: string;
  RelatedInvoiceId: string;
  ThirdParty: AccountingThirdParty;
  Amount: number;
  Currency: string;
  Status: string;
  Notes: string;
  UpdatedAt: string;
  Type: {
    Code: string;
    Name: string;
  };
  PaymentMethod: {
    Code: string;
  };
};