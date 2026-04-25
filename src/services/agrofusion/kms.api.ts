import { auditAgrofusionAxios } from "./api/axios";

/** Payload POST /kms/certificates */
export type CreateCertificatePayload = {
  key_id: string;
  certificate_pem: string;
  serial_number: string;
  subject: string;
  issuer: string;
  valid_from: string;
  valid_to: string;
};

/** Payload POST /kms/signatures/verify */
export type VerifySignaturePayload = {
  document_hash: string;
  digital_signature: string;
  signature_id?: string | null;
  key_id?: string | null;
  hash_algorithm?: string;
};

/** Payload POST /kms/keys */
export type CreateKeyPayload = {
  key_alias: string;
  algorithm: string;
  key_purpose: string;
  valid_to?: string | null;
};

/** Payload POST /kms/signatures */
export type CreateSignaturePayload = {
  document_hash: string;
  key_id: string;
  hash_algorithm: string;
  signature_format?: string;
  include_timestamp?: boolean;
  document_id?: string | null;
  document_type?: string | null;
  signer_user_id?: string | null;
  signing_reason?: string | null;
  project_id?: string | null;
};

/** Payload POST /kms/keys/{key_id}/rotate */
export type RotateKeyPayload = {
  rotation_reason: "scheduled" | "compromised" | "manual" | "policy";
  grace_period_days?: number;
};

/** Payload POST /kms/keys/{key_id}/revoke y /kms/certificates/{id}/revoke (RF-INT-20) */
export type RevokePayload = {
  reason: "compromised" | "manual" | "policy";
  note?: string | null;
};

/** Respuesta de POST /kms/{keys|certificates}/{id}/revoke (RF-INT-20) */
export type RevokeResponse = {
  resource_type: "key" | "certificate";
  resource_id: string;
  status: string;
  revoked_at: string;
  reason: "compromised" | "manual" | "policy";
  audit_id?: string | null;
  cascaded_certificate_id?: string | null;
  message: string;
};

/** Item de consulta paginada de firmas (RF-INT-19) */
export type SignatureQueryItem = {
  signature_id: string;
  validation_status: "valid" | "invalid" | "expired" | "revoked" | "unknown";
  signature_format: string;
  expires_at: string | null;
  document_type: string | null;
  signer_user_id: string | null;
  signer_name: string | null;
  signed_at: string;
  document_id: string | null;
};

/** Respuesta paginada de /kms/signatures/query (RF-INT-19) */
export type SignatureQueryResponse = {
  items: SignatureQueryItem[];
  total_count: number;
  limit: number;
  offset: number;
};

/** Detalle funcional de una firma (RF-INT-19), sin digital_signature ni cert content */
export type SignatureQueryDetail = SignatureQueryItem & {
  document_hash: string | null;
  hash_algorithm: string | null;
  signing_reason: string | null;
  key_id: string | null;
  certificate_id: string | null;
};

/** Evento de auditoría KMS (RF-INT-19) */
export type KmsAuditEventItem = {
  audit_id: string;
  action_code: string;
  actor_id: string | null;
  actor_name: string | null;
  created_at: string;
  outcome: string | null;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
};

/** Filtros de /kms/signatures/query (RF-INT-19) */
export type QuerySignaturesFilters = {
  date_from?: string;
  date_to?: string;
  signer_user_id?: string;
  document_type?: string;
  validation_status?: "valid" | "invalid" | "expired" | "revoked";
  offset?: number;
};

export type SignatureListItem = {
  signature_id: string;
  key_id: string;
  document_hash: string;
  hash_algorithm: string;
  digital_signature: string;
  signed_at: string;
  signer_user_id?: string | null;
  document_id?: string | null;
  document_type?: string | null;
  signature_format?: string | null;
};

/** Respuesta de POST /kms/signatures/{id}/validate-presentable (RF-INT-18) */
export type SignatureValidationFriendly = {
  estado: string;
  resultado_general: string;
  firmante: string | null;
  firmante_email: string | null;
  fecha_firma: string | null;
  identificador_documento: string | null;
  tipo_documento: string | null;
  razon_firma: string | null;
  validation_id: string;
  signature_id: string | null;
  datos_tecnicos: {
    hash_documento: string | null;
    algoritmo_hash: string | null;
    formato_firma: string | null;
    certificate_id: string | null;
    certificate_serial: string | null;
    certificate_fingerprint: string | null;
    algoritmo_firma: string | null;
  };
};

export const kmsApi = {
  listKeys: (params?: { projectId?: string; statusFilter?: string }) =>
    auditAgrofusionAxios.get("/kms/keys", {
      params: {
        ...(params?.projectId ? { project_id: params.projectId } : {}),
        ...(params?.statusFilter ? { status_filter: params.statusFilter } : {}),
      },
    }),

  listSignatures: (params?: { projectId?: string; limit?: number; offset?: number }) =>
    auditAgrofusionAxios.get<{ signatures: SignatureListItem[]; total: number }>("/kms/signatures", {
      params: {
        ...(params?.projectId ? { project_id: params.projectId } : {}),
        ...(params?.limit != null ? { limit: params.limit } : {}),
        ...(params?.offset != null ? { offset: params.offset } : {}),
      },
    }),

  getSignature: (signatureId: string) =>
    auditAgrofusionAxios.get<SignatureListItem>(`/kms/signatures/${signatureId}`),

  createKey: (body: CreateKeyPayload) =>
    auditAgrofusionAxios.post("/kms/keys", body),

  createCertificate: (body: CreateCertificatePayload) =>
    auditAgrofusionAxios.post("/kms/certificates", body),

  createSignature: (body: CreateSignaturePayload) =>
    auditAgrofusionAxios.post("/kms/signatures", body),

  verifySignature: (body: VerifySignaturePayload) =>
    auditAgrofusionAxios.post("/kms/signatures/verify", body),

  validateSignaturePresentable: (signatureId: string) =>
    auditAgrofusionAxios.post<SignatureValidationFriendly>(
      `/kms/signatures/${signatureId}/validate-presentable`,
    ),

  rotateKey: (keyId: string, body: RotateKeyPayload) =>
    auditAgrofusionAxios.post(`/kms/keys/${keyId}/rotate`, body),

  getKeyRotations: (keyId: string) =>
    auditAgrofusionAxios.get(`/kms/keys/${keyId}/rotations`),

  getCertificateByKeyId: (keyId: string) =>
    auditAgrofusionAxios.get<{
      certificate_id: string;
      key_id: string;
      status: string;
      serial_number?: string;
      subject?: string;
      issuer?: string;
      valid_from?: string;
      valid_to?: string;
      fingerprint?: string;
    }>(`/kms/certificates/key/${keyId}`),

  revokeKey: (keyId: string, body: RevokePayload) =>
    auditAgrofusionAxios.post<RevokeResponse>(`/kms/keys/${keyId}/revoke`, body),

  revokeCertificate: (certificateId: string, body: RevokePayload) =>
    auditAgrofusionAxios.post<RevokeResponse>(
      `/kms/certificates/${certificateId}/revoke`,
      body,
    ),

  querySignatures: (filters: QuerySignaturesFilters) =>
    auditAgrofusionAxios.get<SignatureQueryResponse>("/kms/signatures/query", {
      params: {
        ...(filters.date_from ? { date_from: filters.date_from } : {}),
        ...(filters.date_to ? { date_to: filters.date_to } : {}),
        ...(filters.signer_user_id ? { signer_user_id: filters.signer_user_id } : {}),
        ...(filters.document_type ? { document_type: filters.document_type } : {}),
        ...(filters.validation_status
          ? { validation_status: filters.validation_status }
          : {}),
        ...(filters.offset != null ? { offset: filters.offset } : {}),
      },
    }),

  getSignatureQueryDetail: (signatureId: string) =>
    auditAgrofusionAxios.get<SignatureQueryDetail>(
      `/kms/signatures/${signatureId}/detail`,
    ),

  getSignatureAuditTrail: (signatureId: string) =>
    auditAgrofusionAxios.get<{
      events: KmsAuditEventItem[];
      total_count: number;
    }>(`/kms/signatures/${signatureId}/audit-trail`),
};
