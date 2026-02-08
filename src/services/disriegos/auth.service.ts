import { authApiDisriego } from "../../api/disriego/auth.api";

/**
 * Solicita un token de recuperación de contraseña específicamente para Disriego.
 * @param email Correo electrónico del usuario.
 * @returns {Promise<{token: string}>} El token generado por la instancia de Disriego.
 */
export const reqResetPasswordService = async (
  email: string
) => {
  const { data } = await authApiDisriego.reqResetPassword({ email });
  return data;
}
/**
 * Aplica el cambio de contraseña en la base de datos de Disriego.
 * @param token Token de validación específico de Disriego.
 * @param newPassword Nueva contraseña.
 * @param confirmPassword Confirmación de seguridad.
 */
export const resetPasswordService = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  const { data } = await authApiDisriego.resetPassword({ token, newPassword, confirmPassword });
  return data;
}

/**
 * Obtiene los roles del proyecto
 */
export const getRolesService = async () => {
  const response = await authApiDisriego.getRoles();
  const roles = response.data.data;
  return roles;
}