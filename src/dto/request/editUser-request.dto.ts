import type { ExternalProjectData } from "./createUser-request.dto";

/**
 * Payload para actualizar un usuario (admin).
 * El backend orquesta la actualización en proyectos externos usando `external_data`.
 *
 * @interface EditUserRequest
 */
export interface EditUserRequest {
    /** Email actual del usuario (requerido para identificar en externos) */
    email: string;
    name?: string;
    first_last_name?: string;
    second_last_name?: string;
    /** Fecha de nacimiento en formato yyyy-MM-dd */
    birthday?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gender_id?: any;
    /** Fecha de expedición del documento en formato yyyy-MM-dd */
    date_issuance_document?: string;
    identity_number?: string;
    /** Rol AgroFusion (af_role_id) */
    role_id?: string;
    /** Datos por proyecto externo, clave = instance_code */
    external_data?: Record<string, ExternalProjectData>;
}

/**
 * Payload para actualizar el perfil propio del usuario autenticado.
 */
export interface EditProfileRequest {
    email: string;
    name?: string;
    first_last_name?: string;
    second_last_name?: string;
    birthday?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gender_id?: any;
    date_issuance_document?: string;
    identity_number?: string;
    external_data?: Record<string, ExternalProjectData>;
}

/**
 * Payload para cambiar el estado de un usuario (activo/inactivo).
 */
export interface ChangeUserStatusRequest {
    user_id: string;
    email: string;
    new_status: number;
}
