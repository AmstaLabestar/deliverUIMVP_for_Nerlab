export const FLASH_LIST_THRESHOLD = 500;

export const LIST_PRESETS = {
  home: {
    estimatedItemSize: 280,
    initialNumToRender: 4,
    maxToRenderPerBatch: 4,
    windowSize: 10,
    updateCellsBatchingPeriod: 50,
  },
  reservations: {
    estimatedItemSize: 92,
    initialNumToRender: 8,
    maxToRenderPerBatch: 8,
    windowSize: 10,
    updateCellsBatchingPeriod: 50,
  },
  wallet: {
    estimatedItemSize: 84,
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    windowSize: 11,
    updateCellsBatchingPeriod: 40,
  },
  pressing: {
    estimatedItemSize: 220,
    initialNumToRender: 6,
    maxToRenderPerBatch: 6,
    windowSize: 9,
    updateCellsBatchingPeriod: 40,
  },
} as const;
