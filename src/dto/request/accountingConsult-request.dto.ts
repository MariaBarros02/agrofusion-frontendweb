export type AccountingConsultRequest = {
  external_project_id: string;
  external_endpoint_id: string;
  sincePeriod: string;
  untilPeriod: string;
};