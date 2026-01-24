/**
 * Objeto de transferencia de datos para el inicio de sesión primario.
 */
export interface LoginDto {
    /** Correo electrónico institucional del usuario */
    email: string;

    /** Contraseña cifrada en tránsito */
    password: string;
}
/**
 * Objeto para la verificación de segundo factor (MFA).
 */
export interface MfaDto {
    /** Correo del usuario que intenta verificar el código */
    email: string;
    /** Código numérico (OTP) enviado al correo o dispositivo */
    otp_code: string;
}