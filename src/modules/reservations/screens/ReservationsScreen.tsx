import * as Linking from "expo-linking";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActiveCourseCard } from "@/src/modules/courses/components/ActiveCourseCard";
import { useCourses } from "@/src/modules/courses/hooks/useCourses";
import { Course } from "@/src/modules/courses/types/courseTypes";
import { useReservations } from "@/src/modules/reservations/hooks/useReservations";
import { BorderRadius, COLORS, Shadows, Spacing, Typography } from "@/src/shared/theme";
import { formatDate, formatMoney } from "@/src/shared/utils/formatters";

export const ReservationsScreen = () => {
  const {
    activeCourse,
    history,
    loadMoreHistory,
    hasNextHistoryPage,
    isFetchingMoreHistory,
  } = useCourses();
  const { startActiveCourse, completeActiveCourse } = useReservations();

  const handleCallClient = async () => {
    if (!activeCourse) {
      return;
    }

    await Linking.openURL(`tel:${activeCourse.infosClient.telephone}`);
  };

  const handleComplete = async () => {
    const completed = await completeActiveCourse();

    if (completed) {
      Alert.alert(
        "Course terminee",
        `Transactions wallet mises a jour (${formatMoney(completed.montant)}).`,
      );
    }
  };

  const header = (
    <View>
      <Text style={styles.sectionTitle}>Course active</Text>
      {activeCourse ? (
        <ActiveCourseCard
          course={activeCourse}
          onStart={() => {
            void startActiveCourse();
          }}
          onComplete={() => {
            void handleComplete();
          }}
          onCallClient={() => {
            void handleCallClient();
          }}
        />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aucune course active</Text>
          <Text style={styles.emptyText}>
            Accepte une course depuis l'accueil ou une offre pressing.
          </Text>
        </View>
      )}
      <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Historique</Text>
    </View>
  );

  const renderHistoryItem = ({ item }: ListRenderItemInfo<Course>) => {
    return (
      <View style={styles.historyCard}>
        <Text style={styles.historyRoute}>
          {item.quartierDepart}
          {" -> "}
          {item.quartierArrivee}
        </Text>
        <Text style={styles.historyMeta}>
          {formatDate(item.dateTerminaison ?? item.dateCreation)} - {formatMoney(item.montant)}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={renderHistoryItem}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aucun historique</Text>
          <Text style={styles.emptyText}>Les courses terminees apparaitront ici.</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingMoreHistory ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : null
      }
      onEndReached={() => {
        if (!hasNextHistoryPage) {
          return;
        }

        void loadMoreHistory();
      }}
      onEndReachedThreshold={0.35}
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
