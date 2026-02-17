import { auditApi } from "./api/audit.api";
/**
 * Define la estructura de datos para el registro de errores en proyectos externos (PE).
 * Se utiliza para auditar fallos de sincronización, errores de red o excepciones de lógica.
 */
export type RegisterErrorPEPayload = {
  /** El flujo donde ocurre el error (ej: "RESET_PASSWORD_ORCHESTRATION") */
  context: string;
  /** El identificador del proyecto externo (ej: "SIGMA", "DISRIEGO") */
  project: string;
  /** Descripción legible del error para el equipo de desarrollo */
  message: string;
  /** Nivel de importancia (ej: "CRITICAL", "WARNING", "INFO") */
  severity: string;
  /** Un fragmento del objeto o respuesta que causó el fallo para depuración */
  payload_excerpt: object;
  /** Código de error técnico devuelto por el servidor o el catch */
  error_code: string;
  /** Nombre del componente o servicio de frontend donde se disparó el log */
  component: string;
};

/**
 * Servicio para enviar una lista de errores al sistema de auditoría central de AgroFusion.
 * * @param errors - Array de objetos que cumplen con la interfaz RegisterErrorPEPayload.
 * @returns Promesa con la respuesta del servidor (data).
 */
export const registerErrorPEService = async (
  errors: RegisterErrorPEPayload[]
) => {
  console.log("ERROR: ", errors);
  // Realiza la petición a través de la instancia configurada de API
  const { data } = await auditApi.registerErrorPE(errors);
  return data;
};

