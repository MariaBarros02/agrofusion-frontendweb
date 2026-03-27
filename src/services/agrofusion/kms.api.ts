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

export const kmsApi = {
  listKeys: (projectId: string, statusFilter?: string) =>
    auditAgrofusionAxios.get("/kms/keys", {
      params: { project_id: projectId, ...(statusFilter ? { status_filter: statusFilter } : {}) },
    }),

  createKey: (body: CreateKeyPayload) =>
    auditAgrofusionAxios.post("/kms/keys", body),

  createCertificate: (body: CreateCertificatePayload) =>
    auditAgrofusionAxios.post("/kms/certificates", body),

  createSignature: (body: CreateSignaturePayload) =>
    auditAgrofusionAxios.post("/kms/signatures", body),

  verifySignature: (body: VerifySignaturePayload) =>
    auditAgrofusionAxios.post("/kms/signatures/verify", body),

  rotateKey: (keyId: string, body: RotateKeyPayload) =>
    auditAgrofusionAxios.post(`/kms/keys/${keyId}/rotate`, body),

  getKeyRotations: (keyId: string) =>
    auditAgrofusionAxios.get(`/kms/keys/${keyId}/rotations`),
};
