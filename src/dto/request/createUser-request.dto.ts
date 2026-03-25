/**
 * Datos de un proyecto externo específico para el usuario a crear.
 */
export interface ExternalProjectData {
    type_document_id: number | string;
    roles: number[];
}

/**
 * Payload utilizado para crear un nuevo usuario en el sistema.
 * El backend orquesta la creación en los proyectos externos (SIGMA, DISRIEGO)
 * usando los datos en `external_data`.
 *
 * @interface createUserRequest
 */
export interface createUserRequest {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
    identity_number: string;
    role_id: string;
    first_last_name?: string;
    second_last_name?: string;
    /** Fecha de nacimiento en formato yyyy-MM-dd */
    birthday?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gender_id?: any;
    /** Fecha de expedición del documento en formato yyyy-MM-dd */
    date_issuance_document?: string;
    /** Datos por proyecto externo, clave = instance_code (ej: "DISRIEGO", "SIGMA") */
    external_data?: Record<string, ExternalProjectData>;
}
