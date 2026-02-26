import { toErrorMessage } from "@/src/core/errors/toErrorMessage";
import { CourseOfferCard } from "@/src/modules/courses/components/CourseOfferCard";
import {
  useCoursesActions,
  useCoursesData,
  useCoursesStatus,
} from "@/src/modules/courses/hooks/useCourses";
import { Course } from "@/src/modules/courses/types/courseTypes";
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
import { Href, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ITEM_HEIGHT = LIST_PRESETS.home.estimatedItemSize;

export const HomeScreen = () => {
  const router = useRouter();
  const { availableCourses } = useCoursesData();
  const { isLoading, isFetchingMoreAvailable } = useCoursesStatus();
  const {
    refreshCourses,
    loadMoreAvailableCourses,
    acceptCourse,
    rejectCourse,
  } = useCoursesActions();

  const totalAmount = useMemo(
    () => availableCourses.reduce((sum, course) => sum + course.montant, 0),
    [availableCourses],
  );

  const handleAccept = useCallback(
    async (courseId: string) => {
      try {
        const accepted = await acceptCourse(courseId);
        Alert.alert(
          "Course acceptee",
          `Course ${accepted.quartierDepart} -> ${accepted.quartierArrivee} assignee.`,
          [
            {
              text: "Voir reservation",
              onPress: () => {
                router.push("/reservations" as Href);
              },
            },
            { text: "Rester ici" },
          ],
        );
      } catch (error) {
        Alert.alert("Erreur", toErrorMessage(error));
      }
    },
    [acceptCourse, router],
  );

  const handleReject = useCallback(
    async (courseId: string) => {
      try {
        await rejectCourse(courseId);
      } catch (error) {
        Alert.alert("Erreur", toErrorMessage(error));
      }
    },
    [rejectCourse],
  );

  const handleEndReached = useCallback(() => {
    void loadMoreAvailableCourses();
  }, [loadMoreAvailableCourses]);

  const handleRefresh = useCallback(() => {
    void refreshCourses();
  }, [refreshCourses]);

  const handleOpenPressing = useCallback(() => {
    router.push("/pressing" as Href);
  }, [router]);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Course> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const footerComponent = useMemo(
    () =>
      isFetchingMoreAvailable ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : null,
    [isFetchingMoreAvailable],
  );

  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Aucune course disponible</Text>
        <Text style={styles.emptyText}>
          Actualise pour verifier les nouvelles offres.
        </Text>
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Course>) => (
      <CourseOfferCard
        course={item}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    ),
    [handleAccept, handleReject],
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Disponibles</Text>
          <Text style={styles.statValue}>{availableCourses.length}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Montant total</Text>
          <Text style={styles.statValue}>{formatMoney(totalAmount)}</Text>
        </View>
      </View>

      <View style={styles.pressingBanner}>
        <View>
          <Text style={styles.pressingTitle}>Offres Pressing</Text>
          <Text style={styles.pressingSubtitle}>
            Nouveaux trajets vers pressing
          </Text>
        </View>
        <TouchableOpacity style={styles.pressingButton} onPress={handleOpenPressing}>
          <Text style={styles.pressingButtonText}>Voir</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <AdaptiveList
          data={availableCourses}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.35}
          flashListThreshold={FLASH_LIST_THRESHOLD}
          estimatedItemSize={LIST_PRESETS.home.estimatedItemSize}
          getItemLayout={getItemLayout}
          initialNumToRender={LIST_PRESETS.home.initialNumToRender}
          removeClippedSubviews
          windowSize={LIST_PRESETS.home.windowSize}
          maxToRenderPerBatch={LIST_PRESETS.home.maxToRenderPerBatch}
          updateCellsBatchingPeriod={LIST_PRESETS.home.updateCellsBatchingPeriod}
          ListFooterComponent={footerComponent}
          ListEmptyComponent={emptyComponent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  statsBar: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    ...Typography.caption,
    color: COLORS.gray,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.h3,
    color: COLORS.primary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  pressingBanner: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.small,
  },
  pressingTitle: {
    ...Typography.label,
    color: COLORS.black,
  },
  pressingSubtitle: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  pressingButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  pressingButtonText: {
    ...Typography.label,
    color: COLORS.white,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyTitle: {
    ...Typography.h3,
    color: COLORS.black,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: COLORS.gray,
    marginTop: Spacing.sm,
  },
  footerLoader: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
});
