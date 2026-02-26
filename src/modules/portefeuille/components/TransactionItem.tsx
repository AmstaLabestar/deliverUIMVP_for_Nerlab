import { WalletTransaction } from "@/src/modules/portefeuille/types/walletTypes";
import {
  BorderRadius,
  COLORS,
  Shadows,
  Spacing,
  Typography,
} from "@/src/shared/theme";
import { formatDate, formatMoney } from "@/src/shared/utils/formatters";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type TransactionItemProps = {
  transaction: WalletTransaction;
};

const TransactionItemComponent = ({ transaction }: TransactionItemProps) => {
  const isCredit = transaction.type === "credit";

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.label}>{transaction.label}</Text>
        <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
      </View>
      <Text style={[styles.amount, isCredit ? styles.creditAmount : styles.debitAmount]}>
        {isCredit ? "+" : "-"} {formatMoney(transaction.amount)}
      </Text>
    </View>
  );
};

export const TransactionItem = React.memo(TransactionItemComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.small,
  },
  left: {
    flex: 1,
  },
  label: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "600",
  },
  date: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  amount: {
    ...Typography.label,
  },
  creditAmount: {
    color: COLORS.success,
  },
  debitAmount: {
    color: COLORS.danger,
  },
});
