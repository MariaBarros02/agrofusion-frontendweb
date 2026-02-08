import { authApiSigma } from "../../api/sigma/auth.api";

/**
 * Solicita un token de recuperación de contraseña específicamente para Sigma.
 * @param email Correo electrónico del usuario.
 * @returns {Promise<{token: string}>} El token generado por la instancia de Sigma.
 */
export const reqResetPasswordService = async (
  email: string
) => {
  const { data } = await authApiSigma.reqResetPassword({ email });
  return data;
}
/**
 * Aplica el cambio de contraseña en la base de datos de Sigma.
 * @param token Token de validación específico de Sigma.
 * @param newPassword Nueva contraseña.
 * @param confirmPassword Confirmación de seguridad.
 */
export const resetPasswordService = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  const { data } = await authApiSigma.resetPassword({ token, newPassword, confirmPassword });
  return data;
}

/**
 * Obtiene los roles del proyecto
 */
export const getRolesService = async () => {
  const response = await authApiSigma.getRoles();
  console.log(response);
  const roles = response.data.data;
  return roles;
}