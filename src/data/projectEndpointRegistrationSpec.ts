/**
 * Especificación de endpoints que un proyecto externo debe exponer para integrarse con AgroFusion.
 * Textos de nombre y descripción según requerimiento funcional.
 */
/** Fila de la tabla “cuerpo de respuesta” en el registro de endpoint. */
export type ResponseBodyFieldSpec = {
  /** Columna “Nombre”. */
  displayName: string;
  /** Si true, “Tipo” es select string | number; si false, solo string. */
  typeSelectable: boolean;
};

export type ProjectEndpointRegistrationItem = {
  title: string;
  description: string;
  /** Ruta relativa a la URL API del proyecto (campo api_url_base). */
  pathSuffix: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  /** true = requiere token (p. ej. Bearer obtenido con autenticación de servicio). */
  requiresAuth: boolean;
  /**
   * Si está definido, el campo URL inicia vacío y el placeholder se toma de
   * `project.create.<clave>` en i18n (en lugar de prefijar api_url_base + pathSuffix).
   */
  urlEmptyWithPlaceholderKey?: string;
  /** Si existe, se muestra la tabla bajo URL / método / autenticación. */
  responseBodyFields?: ResponseBodyFieldSpec[];
};

export type AgroFusionAuthEndpointItem = {
  title: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  requiresAuth: boolean;
  /** Ruta relativa a la URL base de auth de AgroFusion. */
  agroFusionPath: string;
};

export const PROJECT_EXTERNAL_ENDPOINT_SPECS: ProjectEndpointRegistrationItem[] = [
  {
    title: "Consultar roles",
    description:
      "El endpoint permite obtener la lista de roles disponibles en el sistema, los cuales se utilizan para asignar permisos y niveles de acceso a los usuarios. Los resultados deben devolverse dentro de un objeto con la propiedad data que contenga un arreglo de roles.",
    pathSuffix: "/roles/",
    method: "GET",
    requiresAuth: false,
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderRolesPath",
    responseBodyFields: [
      { displayName: "Rol Id", typeSelectable: true },
      { displayName: "Nombre del rol", typeSelectable: false },
    ],
  },
  {
    title: "Consultar tipos de documentos",
    description:
      "El endpoint permite obtener la lista de tipos de documento disponibles en el sistema, los cuales se utilizan al momento de registrar o actualizar usuarios. Los resultados deben devolverse dentro de un objeto con la propiedad data que contenga un arreglo de tipos de documentos.",
    pathSuffix: "/users/type-documents",
    method: "GET",
    requiresAuth: false,
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderTypeDocumentsPath",
    responseBodyFields: [
      { displayName: "Tipo de documento Id", typeSelectable: true },
      { displayName: "Nombre del tipo de documento", typeSelectable: false },
    ],
  },
  {
    title: "Buscar usuario por correo electrónico",
    description:
      "El endpoint permite consultar la información de un usuario en el sistema utilizando su correo electrónico.",
    pathSuffix: "/users/get-user-by-email/{email}",
    method: "GET",
    requiresAuth: true,
  },
  {
    title: "Crear usuario",
    description:
      "El endpoint permite a un administrador crear un nuevo usuario en el sistema. Al crear el usuario, el sistema genera un token de activación para que el usuario pueda activar su cuenta.",
    pathSuffix: "/users/admin/create-agrofusion",
    method: "POST",
    requiresAuth: true,
  },
  {
    title: "Activar cuenta",
    description:
      "El endpoint permite activar la cuenta de un usuario en el sistema mediante un token de activación.",
    pathSuffix: "/users/activate-account/{token_activacion}",
    method: "GET",
    requiresAuth: false,
  },
  {
    title: "Autenticación para servicio externo",
    description:
      "Permite hacer peticiones a endpoints protegidos desde un servicio externo mediante credenciales del cliente y el correo del usuario, devuelve un token de acceso. Este endpoint no debe estar protegido.",
    pathSuffix: "/auth/service-token",
    method: "POST",
    requiresAuth: false,
  },
  {
    title: "Cambiar el estado de un usuario",
    description:
      "El endpoint permite modificar el estado de un usuario en el sistema, por ejemplo para activar o desactivar su acceso.",
    pathSuffix: "/users/change-user-status/",
    method: "POST",
    requiresAuth: true,
  },
  {
    title: "Editar usuario",
    description:
      "El endpoint permite a un administrador actualizar la información de un usuario existente en el sistema.",
    pathSuffix: "/users/admin/edit/{id_usuario}",
    method: "PUT",
    requiresAuth: true,
  },
];

export const AGROFUSION_SSO_ENDPOINT_SPEC: AgroFusionAuthEndpointItem = {
  title: "SSO Login (No necesario usuarios)",
  description:
    "El endpoint permite que un usuario con cuenta activa inicie sesión mediante AgroFusion.",
  method: "POST",
  requiresAuth: false,
  agroFusionPath: "/auth/login",
};

export function joinProjectApiUrl(base: string, pathSuffix: string): string {
  const trimmed = base.trim();
  const placeholder = "{api_url_base}";
  const root = trimmed || placeholder;
  const noTrailing = root.replace(/\/+$/, "");
  const path = pathSuffix.startsWith("/") ? pathSuffix : `/${pathSuffix}`;
  return `${noTrailing}${path}`;
}

export function joinAgroFusionAuthUrl(authBase: string | undefined, path: string): string {
  const root = (authBase ?? "").trim() || "{VITE_API_AUTH_AF_URL}";
  const noTrailing = root.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${noTrailing}${p}`;
}
