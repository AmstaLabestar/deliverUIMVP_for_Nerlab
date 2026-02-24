export type OfflineConflictStrategy = "server_wins" | "client_wins";

export type OfflineMutationAction =
  | "courses.accept"
  | "courses.reject"
  | "courses.start"
  | "courses.complete"
  | "pressing.accept";

export type OfflineQueueStatus = "pending" | "failed";

export type OfflineMutationPayload = Record<string, string | number | boolean | null>;

export interface OfflineQueueItem {
  id: string;
  action: OfflineMutationAction;
  payload: OfflineMutationPayload;
  status: OfflineQueueStatus;
  attempts: number;
  maxAttempts: number;
  conflictStrategy: OfflineConflictStrategy;
  createdAt: string;
  updatedAt: string;
}

export interface EnqueueOfflineMutationInput {
  action: OfflineMutationAction;
  payload: OfflineMutationPayload;
  maxAttempts?: number;
  conflictStrategy?: OfflineConflictStrategy;
}

export interface OfflineSyncResult {
  processed: number;
  failed: number;
  remaining: number;
  syncedAt: string;
}
