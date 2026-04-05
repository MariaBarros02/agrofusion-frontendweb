/**
 * Módulo de acceso rápido para crear proyecto externo (RF-GES-14).
 */
export interface CreateModuleRequest {
  ext_id?: string;
  name: string;
  base_url: string;
  module_icon: string;
  description: string;
}

export type VariableType = "string" | "number" | "array" | "datetime";

export type ResponseBodyFieldSpec = {
  displayName: string;
  allowedTypes: VariableType[];
  disabled?: boolean;
  placeholderKey?: string;
};

export type ProjectEndpointRegistrationItem = {
  title: string;
  description: string;
  pathSuffix: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  requiresAuth: boolean;
  urlEmptyWithPlaceholderKey?: string;
  requestParamFields?: ResponseBodyFieldSpec[];
  requestBodyFields?: ResponseBodyFieldSpec[];
  responseBodyFields?: ResponseBodyFieldSpec[];
};

export interface EndpointFieldMapping {
  key: string;
  variable_type: string;
}

export interface EndpointFormValues {
  url: string;
  method: string;
  auth_with: boolean;
  request_params: EndpointFieldMapping[];
  request_body: EndpointFieldMapping[];
  response_body: EndpointFieldMapping[];
}

/**
 * Request para registrar un nuevo proyecto externo (RF-GES-14).
 */
export interface CreateProjectRequest {
  instance_code: string;
  project_name: string;
  project_url: string;
  description: string;
  is_active: boolean;
  project_image: string;
  project_image_mime_type: string;
  api_url_base: string;
  users_api_path: string;
  modules: CreateModuleRequest[];
  endpoints: EndpointFormValues[];
}

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
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderSearchUserPath",
    requestParamFields: [
      { displayName: "endpointParamSearchUserEmail", allowedTypes: ["string"], disabled: true, placeholderKey: "endpointParamSearchUserEmailPlaceholder" },
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
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderCreateUserPath",
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
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderActivateAccountPath",
    requestParamFields: [
      { displayName: "endpointParamActivateToken", allowedTypes: ["string"], disabled: true, placeholderKey: "endpointParamActivateTokenPlaceholder" },
    ],
  },
  {
    title: "endpointTitleServiceAuth",
    description: "endpointDescServiceAuth",
    pathSuffix: "/auth/service-token",
    method: "POST",
    requiresAuth: false,
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderServiceAuthPath",
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
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderChangeStatusPath",
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
    urlEmptyWithPlaceholderKey: "endpointUrlPlaceholderEditUserPath",
    requestParamFields: [
      { displayName: "endpointParamEditUserId", allowedTypes: ["string"], disabled: true, placeholderKey: "endpointParamEditUserIdPlaceholder" },
    ],
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
