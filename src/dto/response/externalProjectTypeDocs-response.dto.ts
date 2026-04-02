import type { ExternalOrchestrationError } from "../shared/orchestration.dto";

export interface ExternalProjectTypeDoc {
    id: number;
    name: string;
    code?: string;
}

export interface ExternalProjectTypeDocsResponse {
    results: Record<string, { types: ExternalProjectTypeDoc[] }>;
    errors: ExternalOrchestrationError[];
}
