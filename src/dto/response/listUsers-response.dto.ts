/**
 * Respuesta paginada del listado de usuarios.
 * 
 * Representa el resultado de una consulta con paginación realizada
 * al endpoint de usuarios. Incluye los registros de la página actual
 * y la metadata necesaria para construir controles de paginación
 * en el frontend.
 * 
 * @interface PaginatedUsersResponse
 */
export interface PaginatedUsersResponse {

    /**
     * Lista de usuarios correspondientes a la página solicitada.
     */
    items: ListUserResponse[];

    /**
     * Número total de registros disponibles en la consulta
     * (sin aplicar paginación).
     */
    total: number;

    /**
     * Número de la página actual (base 1).
     */
    page: number;

    /**
     * Cantidad de registros por página.
     */
    size: number;

    /**
     * Número total de páginas disponibles según el total de registros
     * y el tamaño de página solicitado.
     */
    total_pages: number;
}


/**
 * Representa la información resumida de un usuario dentro de un listado.
 * 
 * Este modelo se usa típicamente en tablas, grids o vistas paginadas
 * donde no se requiere el detalle completo del usuario.
 * 
 * @interface ListUserResponse
 */
export interface ListUserResponse {

    /**
     * Identificador único del usuario.
     */
    user_id: string;

    /**
     * Nombre completo del usuario.
     */
    name: string;

    /**
     * Estado actual del usuario en el sistema.
     * 
     * Ejemplos: ACTIVE, INACTIVE, BLOCKED, DELETED.
     */
    state: string;

    /**
     * Dirección de correo electrónico del usuario.
     */
    email: string;

    /**
     * Rol o perfil del usuario dentro del sistema.
     * 
     * Ejemplos: ADMIN, USER, MANAGER.
     */
    rol: string;
    /**
     * Rol o perfil del usuario dentro del sistema.
     * 
     * Id
     */
    role_id:string;

    /**
     * Fecha y hora de creación del usuario en formato ISO 8601.
     * 
     * @example "2025-01-15T14:32:10Z"
     */
    created_at: string;

        /**
     * Número de identidad del usuario
     * 
     * 
     */
    identity_number? : string;


    mfa_active?: boolean;
}