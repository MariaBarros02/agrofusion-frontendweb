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
  project_id: string;
  key_alias: string;
  algorithm: string;
  key_purpose: string;
  valid_to?: string | null;
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

  verifySignature: (body: VerifySignaturePayload) =>
    auditAgrofusionAxios.post("/kms/signatures/verify", body),
};
