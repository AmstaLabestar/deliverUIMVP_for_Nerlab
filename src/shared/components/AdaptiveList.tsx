import React from "react";
import { FlatList, FlatListProps } from "react-native";

type FlashListComponent<T> = React.ComponentType<
  FlatListProps<T> & {
    estimatedItemSize?: number;
  }
>;

let cachedFlashList: FlashListComponent<unknown> | null | undefined;
let hasWarnedMissingFlashList = false;

const resolveFlashList = <T,>(): FlashListComponent<T> | null => {
  if (typeof cachedFlashList !== "undefined") {
    return cachedFlashList as FlashListComponent<T> | null;
  }

  try {
    const flashListModule = require("@shopify/flash-list") as {
      FlashList?: FlashListComponent<unknown>;
    };
    cachedFlashList = flashListModule.FlashList ?? null;
  } catch {
    cachedFlashList = null;
  }

  return cachedFlashList as FlashListComponent<T> | null;
};

export type AdaptiveListProps<T> = FlatListProps<T> & {
  flashListThreshold?: number;
  estimatedItemSize?: number;
};

export const AdaptiveList = <T,>({
  data,
  flashListThreshold = 500,
  estimatedItemSize = 100,
  ...rest
}: AdaptiveListProps<T>) => {
  const FlashList = resolveFlashList<T>();
  const listLength = Array.isArray(data) ? data.length : 0;
  const normalizedData = (data ?? []) as readonly T[];
  const shouldUseFlashList = Boolean(FlashList && listLength > flashListThreshold);

  if (__DEV__ && listLength > flashListThreshold && !FlashList && !hasWarnedMissingFlashList) {
    hasWarnedMissingFlashList = true;
    console.warn(
      "[AdaptiveList] FlashList unavailable. Install '@shopify/flash-list' to enable high-volume list optimization.",
    );
  }

  if (shouldUseFlashList && FlashList) {
    return (
      <FlashList
        {...rest}
        data={normalizedData}
        estimatedItemSize={estimatedItemSize}
      />
    );
  }

  return <FlatList {...rest} data={data} />;
};
