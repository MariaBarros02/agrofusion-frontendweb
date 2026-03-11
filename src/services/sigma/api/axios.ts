import axios from 'axios';
import { env } from '../../../config/env';

/**
 * Instancia de Axios configurada para el microservicio SIGMA.
 * Gestiona las peticiones relacionadas con el núcleo del sistema Sigma.
 */
export const authAxios = axios.create({
    /** @type {string} URL base obtenida de las variables de entorno para Sigma */
    baseURL: env.VITE_API_SIGMA_URL,
    /** @type {number} Tiempo máximo de espera (10 segundos) antes de abortar la petición */
    timeout: 10000,
});

