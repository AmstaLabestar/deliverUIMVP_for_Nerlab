import { TransactionItem } from "@/src/modules/portefeuille/components/TransactionItem";
import { useWallet } from "@/src/modules/portefeuille/hooks/useWallet";
import { WalletTransaction } from "@/src/modules/portefeuille/types/walletTypes";
import { ListSkeleton } from "@/src/shared/components/ListSkeleton";
import {
  BorderRadius,
  COLORS,
  Shadows,
  Spacing,
  Typography,
} from "@/src/shared/theme";
import { AdaptiveList } from "@/src/shared/components/AdaptiveList";
import { FLASH_LIST_THRESHOLD, LIST_PRESETS } from "@/src/shared/performance/listPresets";
import { formatMoney } from "@/src/shared/utils/formatters";
import React, { useCallback, useMemo } from "react";
import {
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const quickRechargeAmounts = [2000, 5000, 10000];

type QuickRechargeButtonProps = {
  amount: number;
  onRecharge: (amount: number) => void;
};

const QuickRechargeButton = React.memo(
  ({ amount, onRecharge }: QuickRechargeButtonProps) => {
    const handlePress = useCallback(() => {
      onRecharge(amount);
    }, [amount, onRecharge]);

    return (
      <TouchableOpacity style={styles.rechargeButton} onPress={handlePress}>
        <Text style={styles.rechargeText}>+ {formatMoney(amount)}</Text>
      </TouchableOpacity>
    );
  },
);

export const WalletScreen = () => {
  const { state, recharge, isLoading } = useWallet();

  const totalCredits = useMemo(
    () =>
      state.transactions
        .filter((transaction) => transaction.type === "credit")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [state.transactions],
  );

  const totalDebits = useMemo(
    () =>
      state.transactions
        .filter((transaction) => transaction.type === "debit")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [state.transactions],
  );

  const handleRecharge = useCallback(
    (amount: number) => {
      void recharge(amount);
    },
    [recharge],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WalletTransaction>) => (
      <TransactionItem transaction={item} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: WalletTransaction) => item.id, []);

  const listHeader = useMemo(
    () => (
      <View>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde actuel</Text>
          <Text style={styles.balanceValue}>{formatMoney(state.balance)}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recharger depuis le tableau de bord</Text>
          <View style={styles.rechargeRow}>
            {quickRechargeAmounts.map((amount) => (
              <QuickRechargeButton
                key={amount}
                amount={amount}
                onRecharge={handleRecharge}
              />
            ))}
          </View>
        </View>

        <View style={styles.kpisRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Credits</Text>
            <Text style={[styles.kpiValue, styles.creditText]}>
              {formatMoney(totalCredits)}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Debits</Text>
            <Text style={[styles.kpiValue, styles.debitText]}>
              {formatMoney(totalDebits)}
            </Text>
          </View>
        </View>

        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Historique des transactions</Text>
        </View>
      </View>
    ),
    [handleRecharge, state.balance, totalCredits, totalDebits],
  );

  const listEmpty = useMemo(
    () => <Text style={styles.emptyText}>Aucune transaction pour le moment.</Text>,
    [],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ListSkeleton itemCount={5} itemHeight={LIST_PRESETS.wallet.estimatedItemSize} />
        </View>
      </View>
    );
  }

  return (
    <AdaptiveList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={state.transactions}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      flashListThreshold={FLASH_LIST_THRESHOLD}
      estimatedItemSize={LIST_PRESETS.wallet.estimatedItemSize}
      initialNumToRender={LIST_PRESETS.wallet.initialNumToRender}
      maxToRenderPerBatch={LIST_PRESETS.wallet.maxToRenderPerBatch}
      windowSize={LIST_PRESETS.wallet.windowSize}
      removeClippedSubviews
      updateCellsBatchingPeriod={LIST_PRESETS.wallet.updateCellsBatchingPeriod}
    />
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
    paddingBottom: Spacing.lg,
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
  creditText: {
    color: COLORS.success,
  },
  debitText: {
    color: COLORS.danger,
  },
  transactionsHeader: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: COLORS.gray,
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
});
