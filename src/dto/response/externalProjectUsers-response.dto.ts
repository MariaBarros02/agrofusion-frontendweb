import type { ExternalOrchestrationError } from "../shared/orchestration.dto";

export interface ExternalProjectUsersResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: Record<string, any>;
    errors: ExternalOrchestrationError[];
}
