import { logger } from "@/src/core/logger/logger";
import { useNetworkStatus } from "@/src/infrastructure/network/useNetworkStatus";
import { offlineQueueStorage } from "@/src/infrastructure/offline/offlineQueueStorage";
import {
  EnqueueOfflineMutationInput,
  OfflineSyncResult,
} from "@/src/infrastructure/offline/offlineQueueTypes";
import { offlineSyncService } from "@/src/infrastructure/offline/offlineSyncService";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

  const queuedCountRef = useRef(queuedCount);
  queuedCountRef.current = queuedCount;

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
        remaining: queuedCountRef.current,
        syncedAt: new Date().toISOString(),
      };
      setLastSyncAt(fallbackResult.syncedAt);
      setLastSyncResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const enqueueMutation = useCallback(async (input: EnqueueOfflineMutationInput) => {
    await offlineQueueStorage.enqueue(input);
  }, []);

  useEffect(() => {
    const wasOffline = previousOfflineRef.current;
    previousOfflineRef.current = isOffline;

    if (isOffline) {
      return;
    }

    if (wasOffline) {
      void flushQueue();
    }
  }, [flushQueue, isOffline]);

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
