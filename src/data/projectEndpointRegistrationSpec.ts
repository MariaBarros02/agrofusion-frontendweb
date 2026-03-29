/**
 * Especificación de endpoints que un proyecto externo debe exponer para integrarse con AgroFusion.
 * Los campos title, description y displayName almacenan claves parciales de i18n
 * bajo el namespace "project.create" (se usan como t(`project.create.${key}`)).
 */

export type VariableType = "string" | "number" | "array" | "datetime";

/** Fila de la tabla "cuerpo de respuesta" en el registro de endpoint. */
export type ResponseBodyFieldSpec = {
  /** Clave i18n parcial (project.create.<key>) para la columna "Nombre". */
  displayName: string;
  /** Tipos de variable permitidos; si solo hay uno, el select queda fijo. */
  allowedTypes: VariableType[];
};

export type ProjectEndpointRegistrationItem = {
  /** Clave i18n parcial para el título del acordeón. */
  title: string;
  /** Clave i18n parcial para la descripción del endpoint. */
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
  /** Si existe, se muestra la tabla de parámetros de petición. */
  requestParamFields?: ResponseBodyFieldSpec[];
  /** Si existe, se muestra la tabla de cuerpo de petición. */
  requestBodyFields?: ResponseBodyFieldSpec[];
  /** Si existe, se muestra la tabla de modelo de respuesta. */
  responseBodyFields?: ResponseBodyFieldSpec[];
};

export const PROJECT_EXTERNAL_ENDPOINT_SPECS: ProjectEndpointRegistrationItem[] = [
  {
    title: "endpointTitleRoles",
    description: "endpointDescRoles",
    pathSuffix: "/roles/",
    method: "GET",
    requiresAuth: false,
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderRolesPath",
    responseBodyFields: [
      { displayName: "endpointFieldRoleId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldRoleName", allowedTypes: ["string"] },
    ],
  },
  {
    title: "endpointTitleTypeDocs",
    description: "endpointDescTypeDocs",
    pathSuffix: "/users/type-documents",
    method: "GET",
    requiresAuth: false,
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderTypeDocumentsPath",
    responseBodyFields: [
      { displayName: "endpointFieldTypeDocId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldTypeDocName", allowedTypes: ["string"] },
    ],
  },
  {
    title: "endpointTitleSearchUser",
    description: "endpointDescSearchUser",
    pathSuffix: "/users/get-user-by-email/{email}",
    method: "GET",
    requiresAuth: true,
    requestParamFields: [
      { displayName: "endpointParamSearchUserEmail", allowedTypes: ["string"] },
    ],
    responseBodyFields: [
      { displayName: "endpointFieldUserName", allowedTypes: ["string"] },
      { displayName: "endpointFieldUserRoles", allowedTypes: ["array", "string", "number"] },
      { displayName: "endpointFieldUserBirthday", allowedTypes: ["string", "datetime"] },
      { displayName: "endpointFieldUserGenderId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldUserFirstLastName", allowedTypes: ["string"] },
      { displayName: "endpointFieldUserSecondLastName", allowedTypes: ["string"] },
      { displayName: "endpointFieldUserTypeDocId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldUserDocNumber", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldUserDateIssuance", allowedTypes: ["string", "datetime"] },
    ],
  },
  {
    title: "endpointTitleCreateUser",
    description: "endpointDescCreateUser",
    pathSuffix: "/users/admin/create-agrofusion",
    method: "POST",
    requiresAuth: true,
    requestBodyFields: [
      { displayName: "endpointFieldCreateUserName", allowedTypes: ["string"] },
      { displayName: "endpointFieldCreateUserEmail", allowedTypes: ["string"] },
      { displayName: "endpointFieldCreateUserRoles", allowedTypes: ["array", "string", "number"] },
      { displayName: "endpointFieldCreateUserBirthday", allowedTypes: ["string", "datetime"] },
      { displayName: "endpointFieldCreateUserPassword", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldCreateUserGenderId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldCreateUserFirstLastName", allowedTypes: ["string"] },
      { displayName: "endpointFieldCreateUserSecondLastName", allowedTypes: ["string"] },
      { displayName: "endpointFieldCreateUserTypeDocId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldCreateUserDocNumber", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldCreateUserDateIssuance", allowedTypes: ["string", "datetime"] },
    ],
  },
  {
    title: "endpointTitleActivateAccount",
    description: "endpointDescActivateAccount",
    pathSuffix: "/users/activate-account/{token_activacion}",
    method: "GET",
    requiresAuth: false,
    requestParamFields: [
      { displayName: "endpointParamActivateToken", allowedTypes: ["string"] },
    ],
  },
  {
    title: "endpointTitleServiceAuth",
    description: "endpointDescServiceAuth",
    pathSuffix: "/auth/service-token",
    method: "POST",
    requiresAuth: false,
    responseBodyFields: [
      { displayName: "endpointFieldServiceAuthAccessToken", allowedTypes: ["string"] },
    ],
  },
  {
    title: "endpointTitleChangeStatus",
    description: "endpointDescChangeStatus",
    pathSuffix: "/users/change-user-status/",
    method: "POST",
    requiresAuth: true,
    requestBodyFields: [
      { displayName: "endpointFieldChangeStatusUserId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldChangeStatusNewStatus", allowedTypes: ["string", "number"] },
    ],
  },
  {
    title: "endpointTitleEditUser",
    description: "endpointDescEditUser",
    pathSuffix: "/users/admin/edit/{id_usuario}",
    method: "PUT",
    requiresAuth: true,
    requestBodyFields: [
      { displayName: "endpointFieldEditUserName", allowedTypes: ["string"] },
      { displayName: "endpointFieldEditUserRoles", allowedTypes: ["array", "string", "number"] },
      { displayName: "endpointFieldEditUserBirthday", allowedTypes: ["string", "datetime"] },
      { displayName: "endpointFieldEditUserGenderId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldEditUserFirstLastName", allowedTypes: ["string"] },
      { displayName: "endpointFieldEditUserSecondLastName", allowedTypes: ["string"] },
      { displayName: "endpointFieldEditUserTypeDocId", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldEditUserDocNumber", allowedTypes: ["string", "number"] },
      { displayName: "endpointFieldEditUserDateIssuance", allowedTypes: ["string", "datetime"] },
    ],
  },
];

export function joinProjectApiUrl(base: string, pathSuffix: string): string {
  const trimmed = base.trim();
  const placeholder = "{api_url_base}";
  const root = trimmed || placeholder;
  const noTrailing = root.replace(/\/+$/, "");
  const path = pathSuffix.startsWith("/") ? pathSuffix : `/${pathSuffix}`;
  return `${noTrailing}${path}`;
}

