export interface TriggerEngine {
  tick(): void;
  runNow(jobId: string, times?: number): void;
}