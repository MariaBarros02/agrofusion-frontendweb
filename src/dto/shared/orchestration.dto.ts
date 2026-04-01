/**
 * Error devuelto por el backend cuando falla la orquestación
 * hacia un proyecto externo (SIGMA, DISRIEGO, etc.).
 */
export interface ExternalOrchestrationError {
    instance_code: string;
    project_name: string;
    request_code: string;
    error_code: string;
    message: string;
    http_status: number;
}
