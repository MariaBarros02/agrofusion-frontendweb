/**
 * Payload utilizado para crear un nuevo usuario en el sistema.
 * 
 * Este modelo es enviado normalmente por un administrador o proceso
 * de registro controlado.
 * 
 * @interface CreateUserRequest
 */
export interface createUserRequest {

    /**
     * Nombre completo del usuario.
     */
    name: string;

    /**
     * Correo electrónico del usuario.
     * 
     * Debe ser único dentro del sistema.
     */
    email: string;

    /**
     * Contraseña inicial del usuario.
     * 
     * Debe cumplir la política de contraseñas del sistema.
     */
    password: string;

    /**
     * Confirmación de la contraseña.
     * 
     * Debe coincidir con `password`.
     */
    confirm_password: string;

    /**
     * Número de identificación del usuario.
     * 
     * Puede ser cédula, pasaporte u otro identificador único.
     */
    identity_number: string;

    
    /**
     * Número de identificación del rol asignado.
     * 
     */
    role_id: string;


    /**
     * Tokens externos asociados al usuario.
     * 
     * Usado para integraciones con sistemas externos, autenticación SSO,
     * o provisión automática de accesos.
     * 
     * La clave representa el sistema externo y el valor el token asignado.
     * 
     * @example
     * {
     *   "crm": "token_abc123",
     *   "erp": "token_xyz456"
     * }
     */
    tokens: {
        [key: string]: string;
    };
}
