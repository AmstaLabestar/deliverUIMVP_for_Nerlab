import { STORAGE_KEYS } from "@/src/core/storage/storageKeys";
import { storageRepository } from "@/src/core/storage/storageRepository";
import {
  EnqueueOfflineMutationInput,
  OfflineQueueItem,
} from "@/src/infrastructure/offline/offlineQueueTypes";
import { buildId } from "@/src/shared/utils/id";

type QueueListener = (queue: OfflineQueueItem[]) => void;

const listeners = new Set<QueueListener>();
let queueCache: OfflineQueueItem[] | null = null;
let hydrationPromise: Promise<OfflineQueueItem[]> | null = null;

const cloneQueue = (queue: OfflineQueueItem[]): OfflineQueueItem[] => {
  return queue.map((item) => ({ ...item, payload: { ...item.payload } }));
};

const notify = (queue: OfflineQueueItem[]): void => {
  const payload = cloneQueue(queue);
  listeners.forEach((listener) => {
    listener(payload);
  });
};

const hydrateQueue = async (): Promise<OfflineQueueItem[]> => {
  const storedQueue =
    (await storageRepository.getItem<OfflineQueueItem[]>(STORAGE_KEYS.offlineQueue)) ?? [];
  queueCache = cloneQueue(storedQueue);
  return cloneQueue(storedQueue);
};

const getQueue = async (): Promise<OfflineQueueItem[]> => {
  if (queueCache) {
    return cloneQueue(queueCache);
  }

  if (!hydrationPromise) {
    hydrationPromise = hydrateQueue().finally(() => {
      hydrationPromise = null;
    });
  }

  return hydrationPromise;
};

const replaceQueue = async (nextQueue: OfflineQueueItem[]): Promise<void> => {
  queueCache = cloneQueue(nextQueue);
  await storageRepository.setItem(STORAGE_KEYS.offlineQueue, queueCache);
  notify(queueCache);
};

const enqueue = async (input: EnqueueOfflineMutationInput): Promise<OfflineQueueItem> => {
  const queue = await getQueue();
  const now = new Date().toISOString();

  const item: OfflineQueueItem = {
    id: buildId("offline_mutation"),
    action: input.action,
    payload: { ...input.payload },
    status: "pending",
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 3,
    conflictStrategy: input.conflictStrategy ?? "server_wins",
    createdAt: now,
    updatedAt: now,
  };

  await replaceQueue([...queue, item]);
  return item;
};

const subscribe = (listener: QueueListener): (() => void) => {
  let isActive = true;
  listeners.add(listener);

  void getQueue().then((queue) => {
    if (!isActive || !listeners.has(listener)) {
      return;
    }

    listener(queue);
  });

  return () => {
    isActive = false;
    listeners.delete(listener);
  };
};

export const offlineQueueStorage = {
  getQueue,
  replaceQueue,
  enqueue,
  subscribe,
};
