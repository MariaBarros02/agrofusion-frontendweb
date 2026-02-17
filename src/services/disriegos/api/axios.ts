import axios from 'axios';
import { env } from '../../../config/env';

/**
 * Instancia base de Axios para los servicios del ecosistema Disriego.
 * Configura la URL base desde las variables de entorno y gestiona 
 * automáticamente los tokens de autenticación.
 */
export const authAxios = axios.create({
    /** @type {string} URL base obtenida de las variables de entorno para Sigma */
    baseURL: env.VITE_API_DISRIEGO_URL,
    /** @type {number} Tiempo máximo de espera (10 segundos) antes de abortar la petición */
    timeout: 10000,
});
