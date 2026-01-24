import axios from 'axios';
import { applyAuthInterceptor } from '../axios.config';
import { env } from '../../config/env';

/**
 * Instancia base de Axios para los servicios del ecosistema Disriego.
 * Configura la URL base desde las variables de entorno y gestiona 
 * automáticamente los tokens de autenticación.
 */
export const authAxios = axios.create({
    baseURL: env.VITE_API_DISRIEGO_URL,
});

/**
 * Aplicación de interceptores globales.
 * Se encarga de inyectar los headers de autorización en cada petición.
 */
applyAuthInterceptor(authAxios);

