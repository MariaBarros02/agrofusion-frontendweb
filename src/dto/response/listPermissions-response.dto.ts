/**
 * Respuesta paginada del listado de permisos.
 * 
 * Representa el resultado de una consulta con paginación realizada
 * al endpoint de permisos. Incluye los registros de la página actual
 * y la metadata necesaria para construir controles de paginación
 * en el frontend.
 * 
 * @interface PaginatedPermissionsResponse
 */

export interface PaginatedPermissionsResponse{

    /**
     * Lista de usuarios correspondientes a la página solicitada.
     */
    items: ListPermissionsResponse[];
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
 * donde no se requiere el detalle completo del permiso.
 * 
 * @interface ListPermissionsResponse
 */

export interface ListPermissionsResponse{

        /**
     * Identificador único del permiso.
     */
    permission_id: string;
    /**
     * Codigo único del permiso.
     */
    code: string;
    /**
     * Nombre del permiso.
     */
    name: string;

    /**
     * Tipo del permiso.
     */
    type: string;
    /*Modulo asociado al permisos */
    module: string;
    /*Submodulo asociado al submodulo */
    submodule?: string ;
    /*Estadod el permiso */
    state: string; 
    description?: string;
    action?: string;

}

export interface PermissionBasicResponse {
    permission_id: string;
    permission_name: string;
}