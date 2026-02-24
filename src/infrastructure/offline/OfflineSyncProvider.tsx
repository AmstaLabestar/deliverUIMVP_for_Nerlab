import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { logger } from "@/src/core/logger/logger";
import { useNetworkStatus } from "@/src/infrastructure/network/useNetworkStatus";
import { offlineQueueStorage } from "@/src/infrastructure/offline/offlineQueueStorage";
import { offlineSyncService } from "@/src/infrastructure/offline/offlineSyncService";
import {
  EnqueueOfflineMutationInput,
  OfflineSyncResult,
} from "@/src/infrastructure/offline/offlineQueueTypes";

type OfflineSyncContextValue = {
  queuedCount: number;
  isSyncing: boolean;
  lastSyncAt: string | null;
  lastSyncResult: OfflineSyncResult | null;
  enqueueMutation: (input: EnqueueOfflineMutationInput) => Promise<void>;
  flushQueue: () => Promise<OfflineSyncResult>;
};

export const OfflineSyncContext = createContext<OfflineSyncContextValue | undefined>(
  undefined,
);

export const OfflineSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { isOffline } = useNetworkStatus();
  const previousOfflineRef = useRef(isOffline);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<OfflineSyncResult | null>(null);

  useEffect(() => {
    const unsubscribe = offlineQueueStorage.subscribe((queue) => {
      setQueuedCount(queue.length);
    });

    return unsubscribe;
  }, []);

  const flushQueue = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await offlineSyncService.flushQueue();
      setLastSyncAt(result.syncedAt);
      setLastSyncResult(result);
      return result;
    } catch (error) {
      logger.warn("offline_sync_flush_failed", undefined, error);
      const fallbackResult: OfflineSyncResult = {
        processed: 0,
        failed: 0,
        remaining: queuedCount,
        syncedAt: new Date().toISOString(),
      };
      setLastSyncAt(fallbackResult.syncedAt);
      setLastSyncResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsSyncing(false);
    }
  }, [queuedCount]);

  const enqueueMutation = useCallback(async (input: EnqueueOfflineMutationInput) => {
    await offlineQueueStorage.enqueue(input);
  }, []);

  useEffect(() => {
    const wasOffline = previousOfflineRef.current;
    previousOfflineRef.current = isOffline;

    if (isOffline) {
      return;
    }

    if (wasOffline || queuedCount > 0) {
      void flushQueue();
    }
  }, [flushQueue, isOffline, queuedCount]);

  const value = useMemo<OfflineSyncContextValue>(
    () => ({
      queuedCount,
      isSyncing,
      lastSyncAt,
      lastSyncResult,
      enqueueMutation,
      flushQueue,
    }),
    [enqueueMutation, flushQueue, isSyncing, lastSyncAt, lastSyncResult, queuedCount],
  );

  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
};
