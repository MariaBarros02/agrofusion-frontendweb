import type { ExternalOrchestrationError } from "../shared/orchestration.dto";

export interface ExternalProjectRole {
    id: number;
    name: string;
    description?: string;
}

export interface ExternalProjectRolesResponse {
    results: Record<string, { roles: ExternalProjectRole[] }>;
    errors: ExternalOrchestrationError[];
}
