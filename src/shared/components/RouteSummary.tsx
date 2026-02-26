import { AppIcon } from "@/src/shared/components/AppIcon";
import { COLORS, Spacing, Typography } from "@/src/shared/theme";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

type RouteSummaryVariant = "stacked" | "inline";

type RouteSummaryProps = {
  from: string;
  to: string;
  variant?: RouteSummaryVariant;
  fromLabel?: string;
  toLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const RouteSummaryComponent = ({
  from,
  to,
  variant = "stacked",
  fromLabel = "Depart",
  toLabel = "Arrivee",
  style,
}: RouteSummaryProps) => {
  if (variant === "inline") {
    return (
      <View
        style={[styles.inlineContainer, style]}
        accessibilityLabel={`Trajet de ${from} vers ${to}`}
      >
        <View style={styles.inlinePoint}>
          <View style={[styles.dot, styles.dotStart]} />
          <Text style={styles.inlineText} numberOfLines={1} ellipsizeMode="tail">
            {from}
          </Text>
        </View>
        <AppIcon name="chevron-right" size={16} color={COLORS.gray} />
        <View style={styles.inlinePoint}>
          <View style={[styles.dot, styles.dotEnd]} />
          <Text style={styles.inlineText} numberOfLines={1} ellipsizeMode="tail">
            {to}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.stackedContainer, style]} accessibilityLabel={`Trajet de ${from} vers ${to}`}>
      <View style={styles.stackedRow}>
        <View style={[styles.dot, styles.dotStart]} />
        <View style={styles.stackedTextContainer}>
          <Text style={styles.stackedLabel}>{fromLabel}</Text>
          <Text style={styles.stackedValue} numberOfLines={1} ellipsizeMode="tail">
            {from}
          </Text>
        </View>
      </View>

      <View style={styles.connector} />

      <View style={styles.stackedRow}>
        <View style={[styles.dot, styles.dotEnd]} />
        <View style={styles.stackedTextContainer}>
          <Text style={styles.stackedLabel}>{toLabel}</Text>
          <Text style={styles.stackedValue} numberOfLines={1} ellipsizeMode="tail">
            {to}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const RouteSummary = React.memo(RouteSummaryComponent);

const styles = StyleSheet.create({
  stackedContainer: {
    marginTop: Spacing.xs,
  },
  stackedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stackedTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  stackedLabel: {
    ...Typography.caption,
    color: COLORS.gray,
  },
  stackedValue: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "600",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotStart: {
    backgroundColor: COLORS.info,
  },
  dotEnd: {
    backgroundColor: COLORS.success,
  },
  connector: {
    width: 2,
    height: 16,
    marginLeft: 4,
    marginVertical: 3,
    backgroundColor: COLORS.border,
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minWidth: 0,
  },
  inlinePoint: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  inlineText: {
    ...Typography.bodySmall,
    color: COLORS.black,
    flexShrink: 1,
    minWidth: 0,
  },
});
