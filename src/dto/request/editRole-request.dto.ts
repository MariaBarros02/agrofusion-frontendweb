import type { PermissionBasicResponse } from "../response/listPermissions-response.dto";

export interface EditRoleRequest {
    name: string;
    code: string;
    description: string;
    state:string;
    permissions: PermissionBasicResponse[];
}