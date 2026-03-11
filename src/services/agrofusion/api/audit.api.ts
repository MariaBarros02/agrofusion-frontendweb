import { auditAgrofusionAxios } from "./axios";
import type { RegisterErrorPEPayload } from "../audit.service";
/**
 * Servicio encargado del registro de logs y auditoría del sistema.
 */
export const auditApi = {
    /**
     * Registra múltiples errores de proyectos externos en el sistema de auditoría.
     * @param {RegisterErrorPEPayload[]} data - Arreglo de objetos con detalles de errores a persistir.
     * @returns {Promise<any>} Confirmación del registro.
     */
    registerErrorPE: (data:RegisterErrorPEPayload[]) => auditAgrofusionAxios.post("audit/register-errors-EP", data),
}
