/* eslint-disable @typescript-eslint/no-explicit-any */
import { authApi } from "./api/auth.api";
import type { ResetTokenMap } from "../orchestrator/authOrchestrator.service";
import type { createUserRequest } from "../../dto/request/createUser-request.dto";
import type { AccountActivateRequest } from "../../dto/request/accountActivate-request.dto";


/**
 * Obtiene la lista de proyectos externos vinculados al usuario actual.
 * @returns {Promise<string[]>} Lista de códigos de proyectos (ej: ['SIGMA', 'DISRIEGO']).
 */
export const getExternalProjects = async () => {
  const {data} = await authApi.getExternalProjects();
  return data
}


/**
 * Inicia el proceso de autenticación estándar.
 * @param email Correo electrónico del usuario.
 * @param password Contraseña.
 * @returns Datos del usuario o respuesta de desafío MFA si está activo.
 */
export const loginService = async (
  email: string,
  password: string
) => {
  const { data } = await authApi.login({ email, password });
  return data;
};

/**
 * Genera una sesión mediante Single Sign-On (SSO) para un proyecto específico.
 * @param project_code Identificador del proyecto destino.
 */
export const ssoLoginService = async (
  project_code: string
) => {
  const { data } = await authApi.ssoLogin({project_code});
  return data;
};
/**
 * Finaliza la sesión del usuario en el servidor.
 */
export const logoutService = async () => {
  const {data} = await authApi.logout();
  return data;

}

/**
 * Verifica el código de un solo uso (OTP) enviado al usuario.
 * @param email Correo del usuario intentando acceder.
 * @param otp_code Código de 6 dígitos.
 */
export const verifyMfaService = async (
  email: string,
  otp_code: string
) => {
  const { data } = await authApi.verifyMfa({ email, otp_code });
  return data;
}
/**
 * Solicita el enlace de recuperación de contraseña.
 * Envía el mapa de tokens recolectados de otros servicios para sincronizar el proceso.
 * @param email Correo del solicitante.
 * @param tokens Mapa de tokens de proyectos externos (ResetTokenMap).
 */
export const reqResetPasswordService = async (
  email: string,
  tokens: ResetTokenMap
) => {
  const { data } = await authApi.reqResetPassword({ email, tokens });
  return data;
}
/**
 * Establece la nueva contraseña utilizando el token de validación.
 * @param token Token recibido por correo.
 * @param newPassword Nueva contraseña elegida.
 * @param confirmPassword Confirmación de la contraseña.
 */
export const resetPasswordService = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  const { data } = await authApi.resetPassword({ token, newPassword, confirmPassword });
  return data;
}

/**
 * Consultar si existe un usuario por su correo electrónico o numero de identificación.
 * @param email Correo electrónico del usuario.
 * @param numIdent Número de identificación.
 * @returns Datos del usuario o respuesta si el usuario no existe.
 */

export const userExistsService = async (
  email: string,
  numIdent: string
): Promise<boolean> => {
  try {
  const { data } = await authApi.userExists({ email, numDoc: numIdent });
  

    // Si responde OK → existe
    return Boolean(data);
  } catch (error: any) {
    // 404 = no existe → seguimos
    if (error.response?.status === 404) {
      return false;
    }

    // cualquier otro error sí es real
    throw error;
  }
};

/**
 * Crear usuario.
 * @param user Datos del usuario a crear.
 */
export const createUserService = async (
  user: createUserRequest
) => {
  const { data } = await authApi.createUser(user);
  return data;
} 

/*
 *Activar cuenta y cambiar contraseña anterior
 *
 */
export const accountActivateService = async (
  payload: AccountActivateRequest
)=>{
  const {data} = await authApi.accountActivation(payload);
  return data;
}