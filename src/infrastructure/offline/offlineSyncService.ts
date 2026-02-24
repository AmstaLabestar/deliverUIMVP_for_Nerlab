import { logger } from "@/src/core/logger/logger";
import { networkStatusService } from "@/src/infrastructure/network/networkStatusService";
import { offlineQueueStorage } from "@/src/infrastructure/offline/offlineQueueStorage";
import {
  OfflineMutationAction,
  OfflineMutationPayload,
  OfflineQueueItem,
  OfflineSyncResult,
} from "@/src/infrastructure/offline/offlineQueueTypes";

type OfflineActionHandler = (
  payload: OfflineMutationPayload,
  item: OfflineQueueItem,
) => Promise<void>;

const defaultNoopHandler: OfflineActionHandler = async () => {
  return;
};

const actionHandlers: Record<OfflineMutationAction, OfflineActionHandler> = {
  "courses.accept": defaultNoopHandler,
  "courses.reject": defaultNoopHandler,
  "courses.start": defaultNoopHandler,
  "courses.complete": defaultNoopHandler,
  "pressing.accept": defaultNoopHandler,
};

let syncPromise: Promise<OfflineSyncResult> | null = null;

const buildResult = (
  processed: number,
  failed: number,
  remaining: number,
): OfflineSyncResult => ({
  processed,
  failed,
  remaining,
  syncedAt: new Date().toISOString(),
});

const flushQueueInternal = async (): Promise<OfflineSyncResult> => {
  const networkStatus = await networkStatusService.getCurrentStatus();
  const queue = await offlineQueueStorage.getQueue();

  if (networkStatus.isOffline || queue.length === 0) {
    return buildResult(0, 0, queue.length);
  }

  let processed = 0;
  let failed = 0;
  const nextQueue: OfflineQueueItem[] = [];

  for (const item of queue) {
    if (item.status === "failed") {
      nextQueue.push(item);
      continue;
    }

    const handler = actionHandlers[item.action] ?? defaultNoopHandler;

    try {
      await handler(item.payload, item);
      logger.info("offline_sync_action_replayed", {
        action: item.action,
        itemId: item.id,
      });
      processed += 1;
    } catch (error) {
      failed += 1;
      const attempts = item.attempts + 1;
      const exhausted = attempts >= item.maxAttempts;

      logger.warn("offline_sync_item_failed", { action: item.action, attempts }, error);

      nextQueue.push({
        ...item,
        attempts,
        status: exhausted ? "failed" : "pending",
        updatedAt: new Date().toISOString(),
      });
    }
  }

  await offlineQueueStorage.replaceQueue(nextQueue);
  return buildResult(processed, failed, nextQueue.length);
};

const flushQueue = async (): Promise<OfflineSyncResult> => {
  if (!syncPromise) {
    syncPromise = flushQueueInternal().finally(() => {
      syncPromise = null;
    });
  }

  return syncPromise;
};

const registerHandler = (
  action: OfflineMutationAction,
  handler: OfflineActionHandler,
): void => {
  actionHandlers[action] = handler;
};

export const offlineSyncService = {
  registerHandler,
  flushQueue,
};
