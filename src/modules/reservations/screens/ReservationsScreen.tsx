import * as Linking from "expo-linking";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActiveCourseCard } from "@/src/modules/courses/components/ActiveCourseCard";
import {
  useCoursesActions,
  useCoursesData,
  useCoursesStatus,
} from "@/src/modules/courses/hooks/useCourses";
import { Course } from "@/src/modules/courses/types/courseTypes";
import { useReservations } from "@/src/modules/reservations/hooks/useReservations";
import {
  BorderRadius,
  COLORS,
  Shadows,
  Spacing,
  Typography,
} from "@/src/shared/theme";
import { AdaptiveList } from "@/src/shared/components/AdaptiveList";
import { FLASH_LIST_THRESHOLD, LIST_PRESETS } from "@/src/shared/performance/listPresets";
import { formatDate, formatMoney } from "@/src/shared/utils/formatters";

export const ReservationsScreen = () => {
  const { activeCourse, history, hasNextHistoryPage } = useCoursesData();
  const { isFetchingMoreHistory } = useCoursesStatus();
  const { loadMoreHistory } = useCoursesActions();
  const { startActiveCourse, completeActiveCourse } = useReservations();

  const handleCallClient = useCallback(async () => {
    if (!activeCourse) {
      return;
    }

    await Linking.openURL(`tel:${activeCourse.infosClient.telephone}`);
  }, [activeCourse]);

  const handleComplete = useCallback(async () => {
    const completed = await completeActiveCourse();

    if (completed) {
      Alert.alert(
        "Course terminee",
        `Transactions wallet mises a jour (${formatMoney(completed.montant)}).`,
      );
    }
  }, [completeActiveCourse]);

  const handleStart = useCallback(() => {
    void startActiveCourse();
  }, [startActiveCourse]);

  const handleCallClientPress = useCallback(() => {
    void handleCallClient();
  }, [handleCallClient]);

  const handleCompletePress = useCallback(() => {
    void handleComplete();
  }, [handleComplete]);

  const handleEndReached = useCallback(() => {
    if (!hasNextHistoryPage || isFetchingMoreHistory) {
      return;
    }

    void loadMoreHistory();
  }, [hasNextHistoryPage, isFetchingMoreHistory, loadMoreHistory]);

  const renderHistoryItem = useCallback(({ item }: ListRenderItemInfo<Course>) => {
    return (
      <View style={styles.historyCard}>
        <Text style={styles.historyRoute}>
          {item.quartierDepart}
          {" -> "}
          {item.quartierArrivee}
        </Text>
        <Text style={styles.historyMeta}>
          {formatDate(item.dateTerminaison ?? item.dateCreation)} -{" "}
          {formatMoney(item.montant)}
        </Text>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Course) => item.id, []);

  const listHeader = useMemo(
    () => (
      <View>
        <Text style={styles.sectionTitle}>Course active</Text>
        {activeCourse ? (
          <ActiveCourseCard
            course={activeCourse}
            onStart={handleStart}
            onComplete={handleCompletePress}
            onCallClient={handleCallClientPress}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucune course active</Text>
            <Text style={styles.emptyText}>
              Accepte une course depuis l'accueil ou une offre pressing.
            </Text>
          </View>
        )}
        <Text style={styles.historyTitle}>Historique</Text>
      </View>
    ),
    [activeCourse, handleCallClientPress, handleCompletePress, handleStart],
  );

  const listEmpty = useMemo(
    () => (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Aucun historique</Text>
        <Text style={styles.emptyText}>Les courses terminees apparaitront ici.</Text>
      </View>
    ),
    [],
  );

  const listFooter = useMemo(
    () =>
      isFetchingMoreHistory ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : null,
    [isFetchingMoreHistory],
  );

  return (
    <AdaptiveList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={history}
      keyExtractor={keyExtractor}
      renderItem={renderHistoryItem}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.35}
      flashListThreshold={FLASH_LIST_THRESHOLD}
      estimatedItemSize={LIST_PRESETS.reservations.estimatedItemSize}
      initialNumToRender={LIST_PRESETS.reservations.initialNumToRender}
      maxToRenderPerBatch={LIST_PRESETS.reservations.maxToRenderPerBatch}
      windowSize={LIST_PRESETS.reservations.windowSize}
      removeClippedSubviews
      updateCellsBatchingPeriod={LIST_PRESETS.reservations.updateCellsBatchingPeriod}
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
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: COLORS.black,
    marginBottom: Spacing.md,
  },
  historyTitle: {
    ...Typography.h3,
    color: COLORS.black,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  emptyTitle: {
    ...Typography.label,
    color: COLORS.black,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  historyRoute: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "600",
  },
  historyMeta: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  footerLoader: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});
