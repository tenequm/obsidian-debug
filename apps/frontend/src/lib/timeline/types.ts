/**
 * Timeline Types
 * Client-safe types for transaction execution timeline visualization
 * NO server imports allowed - used by client components
 */

export interface TimelineStep {
  id: string;
  index: number;
  program: string;
  programName: string;
  status: "success" | "failed";
  computeUnits: number;
  errorMessage?: string;
  narrative?: string; // Added in Phase 3
}

export interface TransactionTimeline {
  signature: string;
  steps: TimelineStep[];
  totalCompute: number;
  failedAtStep?: number;
}
