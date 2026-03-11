/**
 * Representa un usuario del sistema
 */
export interface User {
  // Identificador
  user_id: string; // UUID

  // Credenciales
  email: string;
  name: string;
  password_hash: string;

  // Estado del usuario
  status_term_id: string; // UUID

  // MFA
  is_mfa_enabled: boolean;

  // Auditoría
  created_at: string; // ISO Date
  updated_at?: string | null;

  // Seguridad
  failed_attempts: number;
  locked_at?: string | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;

  deleted_at?: string | null;

  // Auditoría de cambios
  created_by?: string | null; // UUID
  updated_by?: string | null; // UUID

  // Verificación
  email_verified_at?: string | null;
  password_changed_at?: string;

  // Número de identidad
  identity_number: string;

  // Control de concurrencia
  row_version: number;
}
