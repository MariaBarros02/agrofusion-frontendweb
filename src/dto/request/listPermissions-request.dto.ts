/**
 * Parámetros de consulta para listar permisos con paginación y filtros.
 * 
 * Esta estructura se envía al backend para obtener un listado paginado
 * de permisos, permitiendo aplicar filtros opcionales por texto de búsqueda y
 * estado.
 * 
 * @interface listPermissionsRequest
 */
export interface listPermissionsRequest {

    /**
     * Índice de la página a consultar (empieza en 1).
     * 
     * Determina qué página del resultado paginado se debe retornar.
     * 
     * @example 1
     */
    page_index: number;  

    /**
     * Cantidad de registros por página.
     * 
     * Controla el tamaño del resultado paginado.
     * 
     * @example 10
     */
    page_size: number;

    /**
     * Texto de búsqueda opcional.
     * 
     * Permite filtrar usuarios por coincidencias parciales
     * en campos como nombre o correo electrónico.
     * 
     * @example "juan"
     */
    search?: string;

    /**
     * Código de estado del usuario.
     * 
     * Filtra usuarios según su estado dentro del sistema
     * (por ejemplo: ACTIVE, INACTIVE, BLOCKED).
     * 
     * @example "ACTIVE"
     */
    state?: string; 

}