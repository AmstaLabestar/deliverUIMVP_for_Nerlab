import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNetworkStatus } from "@/src/infrastructure/network/useNetworkStatus";
import { useOfflineSync } from "@/src/infrastructure/offline/useOfflineSync";
import { BorderRadius, COLORS, Spacing, Typography } from "@/src/shared/theme";

export const OfflineBanner = () => {
  const { isOffline } = useNetworkStatus();
  const { queuedCount, isSyncing } = useOfflineSync();

  if (!isOffline && queuedCount === 0) {
    return null;
  }

  const message = isOffline
    ? `Mode hors ligne. ${queuedCount} action(s) en attente.`
    : isSyncing
      ? `Synchronisation en cours... ${queuedCount} restant(es).`
      : `${queuedCount} action(s) en attente de synchronisation.`;

  const backgroundColor = isOffline ? COLORS.warning : COLORS.info;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 50,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  text: {
    ...Typography.caption,
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "600",
  },
});
