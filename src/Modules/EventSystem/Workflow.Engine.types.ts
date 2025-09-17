export interface WorkflowEngine {
  start(workflowId: string, payloadJson?: string | null, tz?: string | null): string;
  resume(instanceId: string): void;
}