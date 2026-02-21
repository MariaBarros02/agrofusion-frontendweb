/**
 * Representa un usuario proveniente de un sistema externo.
 * 
 * Este modelo se usa comúnmente en procesos de sincronización,
 * federación de identidades o registro desde plataformas externas.
 * 
 * @interface ExternalUser
 */
export interface ExternalUser {

    /**
     * Nombre del usuario.
     */
    name: string;

    /**
     * Primer apellido del usuario.
     */
    first_last_name: string;

    /**
     * Segundo apellido del usuario.
     * 
     * Puede ser undefined si el usuario no lo posee.
     */
    second_last_name: string | undefined;

    /**
     * Identificador del tipo de documento.
     * 
     * Referencia a un catálogo del sistema.
     */
    type_document_id: number;

    /**
     * Número del documento de identidad.
     */
    document_number: string;

    /**
     * Fecha de expedición del documento de identidad.
     */
    date_issuance_document: Date;

    /**
     * Fecha de nacimiento del usuario.
     * 
     * Puede ser null si no está disponible.
     */
    birthday: Date | null;

    /**
     * Identificador del género del usuario.
     * 
     * Referencia a un catálogo del sistema.
     */
    gender_id: number;

    /**
     * Lista de roles asignados al usuario.
     * 
     * Cada valor representa el ID de un rol del sistema.
     */
    roles: number[];

    /**
     * Correo electrónico del usuario.
     */
    email: string;

    /**
     * Contraseña del usuario en el sistema destino.
     * 
     * Puede ser temporal o generada automáticamente en procesos de sincronización.
     */
    password: string;
}