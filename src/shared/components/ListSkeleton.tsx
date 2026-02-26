import { SkeletonBlock } from "@/src/shared/components/SkeletonBlock";
import { BorderRadius, Spacing } from "@/src/shared/theme";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type ListSkeletonProps = {
  itemCount?: number;
  itemHeight: number;
};

const ListSkeletonComponent = ({ itemCount = 4, itemHeight }: ListSkeletonProps) => {
  const items = useMemo(
    () => Array.from({ length: itemCount }, (_, index) => `sk_item_${index}`),
    [itemCount],
  );

  return (
    <View style={styles.container}>
      {items.map((itemId) => (
        <SkeletonBlock
          key={itemId}
          height={itemHeight}
          borderRadius={BorderRadius.lg}
          style={styles.item}
        />
      ))}
    </View>
  );
};

export const ListSkeleton = React.memo(ListSkeletonComponent);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  item: {
    marginBottom: Spacing.md,
  },
});
