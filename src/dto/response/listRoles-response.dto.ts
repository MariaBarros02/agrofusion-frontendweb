/**
 * Respuesta paginada del listado de permisos.
 * 
 * Representa el resultado de una consulta con paginación realizada
 * al endpoint de permisos. Incluye los registros de la página actual
 * y la metadata necesaria para construir controles de paginación
 * en el frontend.
 * 
 * @interface PaginatedRolesResponse
 */

import type { PermissionBasicResponse } from "./listPermissions-response.dto";

export interface PaginatedRolesResponse{

    /**
     * Lista de usuarios correspondientes a la página solicitada.
     */
    items: ListRolesResponse[];
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
 * @interface ListRolesResponse
 */

export interface ListRolesResponse{
    role_id: string;
    code:string;
    name: string;
    state: string;
    count_users: number;
    description?: string;
    permissions?: PermissionBasicResponse[]
}