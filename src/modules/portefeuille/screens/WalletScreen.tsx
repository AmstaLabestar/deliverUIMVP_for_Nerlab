import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TransactionItem } from "@/src/modules/portefeuille/components/TransactionItem";
import { useWallet } from "@/src/modules/portefeuille/hooks/useWallet";
import { BorderRadius, COLORS, Shadows, Spacing, Typography } from "@/src/shared/theme";
import { formatMoney } from "@/src/shared/utils/formatters";

const quickRechargeAmounts = [2000, 5000, 10000];

export const WalletScreen = () => {
  const { state, recharge } = useWallet();

  const totalCredits = state.transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalDebits = state.transactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Solde actuel</Text>
        <Text style={styles.balanceValue}>{formatMoney(state.balance)}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recharger depuis le tableau de bord</Text>
        <View style={styles.rechargeRow}>
          {quickRechargeAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.rechargeButton}
              onPress={() => {
                void recharge(amount);
              }}
            >
              <Text style={styles.rechargeText}>+ {formatMoney(amount)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.kpisRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Crédits</Text>
          <Text style={[styles.kpiValue, { color: COLORS.success }]}>
            {formatMoney(totalCredits)}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Débits</Text>
          <Text style={[styles.kpiValue, { color: COLORS.danger }]}>
            {formatMoney(totalDebits)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Historique des transactions</Text>
        {state.transactions.length === 0 ? (
          <Text style={styles.emptyText}>Aucune transaction pour le moment.</Text>
        ) : (
          state.transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  balanceLabel: {
    ...Typography.bodySmall,
    color: COLORS.white,
    opacity: 0.95,
  },
  balanceValue: {
    ...Typography.h1,
    color: COLORS.white,
    marginTop: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  sectionTitle: {
    ...Typography.h3,
    color: COLORS.black,
    marginBottom: Spacing.md,
  },
  rechargeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  rechargeButton: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rechargeText: {
    ...Typography.label,
    color: COLORS.primary,
  },
  kpisRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  kpiLabel: {
    ...Typography.caption,
    color: COLORS.gray,
    marginBottom: Spacing.xs,
  },
  kpiValue: {
    ...Typography.h3,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: COLORS.gray,
  },
});
