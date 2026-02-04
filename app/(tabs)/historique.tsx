import React, { useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BorderRadius,
  COLORS,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";
import { MOCK_HISTORY } from "../../data/courses";
import { Course } from "../../types/course";

type HistoryItemProps = {
  course: Course;
  onPress: (course: Course) => void;
};

const HistoryItem = ({ course, onPress }: HistoryItemProps) => {
  const getDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "colis":
        return "📦";
      case "nourriture":
        return "🍔";
      case "documents":
        return "📄";
      default:
        return "🎁";
    }
  };

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPress(course)}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.itemEmoji}>
          {getTypeEmoji(course.typeLivraison)}
        </Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>
            {course.quartierDepart} → {course.quartierArrivee}
          </Text>
          <Text style={styles.itemSubtitle}>
            {getDate(course.dateCreation)} • {course.distance} km
          </Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemMontant}>
          {course.montant.toLocaleString()} F
        </Text>
        <Text style={styles.itemStatus}>✓ Complétée</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HistoryScreen() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Grouper par date avec typage explicite pour SectionList
  const groupedCourses = MOCK_HISTORY.reduce(
    (acc, course) => {
      const date = new Date(course.dateCreation);
      const dateKey = date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });

      const sectionIndex = acc.findIndex((s) => s.title === dateKey);
      if (sectionIndex === -1) {
        acc.push({ title: dateKey, data: [course] });
      } else {
        acc[sectionIndex].data.push(course);
      }
      return acc;
    },
    [] as Array<{ title: string; data: Course[] }>,
  );

  const totalGains = MOCK_HISTORY.reduce(
    (sum, course) => sum + course.montant,
    0,
  );

  return (
    <View style={styles.container}>
      {/* Résumé */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Gagné</Text>
          <Text style={styles.summaryValue}>
            {totalGains.toLocaleString()} F
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Courses</Text>
          <Text style={styles.summaryValue}>{MOCK_HISTORY.length}</Text>
        </View>
      </View>

      {/* Historique */}
      <SectionList
        sections={groupedCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItem course={item} onPress={() => setSelectedCourse(item)} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune course complétée</Text>
          </View>
        }
      />

      {/* Détails du course sélectionné */}
      {selectedCourse && (
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedCourse(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.detailsTitle}>Détails de la Course</Text>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Départ</Text>
              <Text style={styles.detailsValue}>
                {selectedCourse.quartierDepart}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Arrivée</Text>
              <Text style={styles.detailsValue}>
                {selectedCourse.quartierArrivee}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Distance</Text>
              <Text style={styles.detailsValue}>
                {selectedCourse.distance} km
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Montant Gagné</Text>
              <Text style={[styles.detailsValue, { color: COLORS.success }]}>
                {selectedCourse.montant.toLocaleString()} F
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Client</Text>
              <Text style={styles.detailsValue}>
                {selectedCourse.infosClient.nom}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Téléphone</Text>
              <Text style={styles.detailsValue}>
                {selectedCourse.infosClient.telephone}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  summary: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    ...Typography.caption,
    color: COLORS.gray,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    ...Typography.h3,
    color: COLORS.success,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sectionHeader: {
    backgroundColor: COLORS.bgSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.label,
    color: COLORS.darkGray,
    textTransform: "capitalize",
  },
  item: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.small,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "500",
  },
  itemSubtitle: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemMontant: {
    ...Typography.label,
    color: COLORS.success,
  },
  itemStatus: {
    ...Typography.caption,
    color: COLORS.success,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...Typography.body,
    color: COLORS.gray,
  },
  detailsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.darkGray,
  },
  detailsTitle: {
    ...Typography.h3,
    color: COLORS.black,
    marginBottom: Spacing.lg,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailsLabel: {
    ...Typography.label,
    color: COLORS.gray,
  },
  detailsValue: {
    ...Typography.body,
    color: COLORS.black,
    fontWeight: "500",
  },
});
