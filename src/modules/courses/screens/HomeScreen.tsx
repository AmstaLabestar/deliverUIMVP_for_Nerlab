import { Href, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CourseOfferCard } from "@/src/modules/courses/components/CourseOfferCard";
import { useCourses } from "@/src/modules/courses/hooks/useCourses";
import { useReservations } from "@/src/modules/reservations/hooks/useReservations";
import { BorderRadius, COLORS, Shadows, Spacing, Typography } from "@/src/shared/theme";
import { formatMoney } from "@/src/shared/utils/formatters";

export const HomeScreen = () => {
  const router = useRouter();
  const {
    availableCourses,
    isLoading,
    refreshCourses,
    loadMoreAvailableCourses,
    isFetchingMoreAvailableCourses,
  } = useCourses();
  const { acceptCourse, rejectCourse } = useReservations();

  const totalAmount = availableCourses.reduce((sum, course) => sum + course.montant, 0);

  const handleAccept = async (courseId: string) => {
    const accepted = await acceptCourse(courseId);
    Alert.alert(
      "Course acceptée",
      `Course ${accepted.quartierDepart} → ${accepted.quartierArrivee} assignée.`,
      [
        {
          text: "Voir réservation",
          onPress: () => {
            router.push("/reservations" as Href);
          },
        },
        { text: "Rester ici" },
      ],
    );
  };

  const handleReject = async (courseId: string) => {
    await rejectCourse(courseId);
  };

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
          <Text style={styles.pressingSubtitle}>Nouveaux trajets vers pressing</Text>
        </View>
        <TouchableOpacity
          style={styles.pressingButton}
          onPress={() => router.push("/pressing" as Href)}
        >
          <Text style={styles.pressingButtonText}>Voir</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={availableCourses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <CourseOfferCard course={item} onAccept={handleAccept} onReject={handleReject} />
          )}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refreshCourses()} />}
          onEndReached={() => {
            void loadMoreAvailableCourses();
          }}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            isFetchingMoreAvailableCourses ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Aucune course disponible</Text>
              <Text style={styles.emptyText}>Actualise pour vérifier les nouvelles offres.</Text>
            </View>
          }
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
