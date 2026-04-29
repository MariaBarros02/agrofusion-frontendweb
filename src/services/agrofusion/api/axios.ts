import axios from 'axios';
import { applyAuthInterceptor } from '../../../api/axios.config';
import { env } from '../../../config/env';


/**
 * Instancia de Axios dedicada a los servicios de autenticación de Agrofusion.
 * Incluye interceptores para manejo de tokens.
 */
export const authAgrofusionAxios = axios.create({
    baseURL: env.VITE_API_AUTH_AF_URL,
});

/**
 * Instancia de Axios dedicada a los servicios de auditoría y logs.
 * Configurada para interactuar con el microservicio de auditoría.
 */
export const auditAgrofusionAxios = axios.create({
    baseURL: env.VITE_API_AUDIT_AF_URL,
});

// Aplicación de interceptores de seguridad
applyAuthInterceptor(authAgrofusionAxios);
applyAuthInterceptor(auditAgrofusionAxios);

export const intAgrofusionAxios = axios.create({
    baseURL: env.VITE_API_INT_AF_URL,
});

applyAuthInterceptor(intAgrofusionAxios);

