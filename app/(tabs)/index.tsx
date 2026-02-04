import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
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
import { MOCK_COURSES } from "../../data/courses";
import { Course } from "../../types/course";

/**
 * HomeScreen - Affiche les courses disponibles
 * Permet au livreur de voir et accepter/refuser des courses
 */

type CourseCardProps = {
  course: Course;
  onAccept: (course: Course) => void;
  onReject: (course: Course) => void;
};

const CourseCard = ({ course, onAccept, onReject }: CourseCardProps) => {
  const getTypeLivraisonEmoji = (type: string) => {
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

  const getTypeLivraisonLabel = (type: string) => {
    switch (type) {
      case "colis":
        return "Colis";
      case "nourriture":
        return "Nourriture";
      case "documents":
        return "Documents";
      default:
        return "Autre";
    }
  };

  return (
    <View style={styles.card}>
      {/* En-tête avec type de livraison */}
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeEmoji}>
            {getTypeLivraisonEmoji(course.typeLivraison)}
          </Text>
          <Text style={styles.typeLabel}>
            {getTypeLivraisonLabel(course.typeLivraison)}
          </Text>
        </View>
        <View style={styles.montantContainer}>
          <Text style={styles.montantLabel}>Gain</Text>
          <Text style={styles.montant}>
            {course.montant.toLocaleString()} F
          </Text>
        </View>
      </View>

      {/* Trajet */}
      <View style={styles.trajet}>
        <View style={styles.trajepPoint}>
          <Text style={styles.trajepDot}>●</Text>
          <Text style={styles.trajepText}>{course.quartierDepart}</Text>
        </View>
        <View style={styles.trajepLine} />
        <View style={styles.trajepPoint}>
          <Text style={styles.trajepDot}>●</Text>
          <Text style={styles.trajepText}>{course.quartierArrivee}</Text>
        </View>
      </View>

      {/* Distance */}
      <View style={styles.distance}>
        <Text style={styles.distanceIcon}></Text>
        <Text style={styles.distanceText}>{course.distance} km</Text>
        <Text style={styles.paiementBadge}>
          {course.typePaiement === "deja_paye"
            ? "✓ Déjà payé"
            : "💳 À la livraison"}
        </Text>
      </View>

      {/* Infos client (condensées) */}
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{course.infosClient.nom}</Text>
        <Text style={styles.clientPhone}>
          📞 {course.infosClient.telephone}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.refuseButton]}
          onPress={() => onReject(course)}
        >
          <Text style={styles.actionButtonText}> Refuser</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => onAccept(course)}
        >
          <Text style={[styles.actionButtonText, { color: COLORS.white }]}>
            Accepter
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [refreshing, setRefreshing] = useState(false);

  const handleAcceptCourse = (course: Course) => {
    Alert.alert(
      "✅ Course Acceptée",
      `Vous avez accepté la course de ${course.montant} F`,
      [
        {
          text: "Voir le détail",
          onPress: () => {
            // Navigation vers ActiveCourseScreen
            console.log("Navigation vers course active:", course.id);
          },
        },
        { text: "OK" },
      ],
    );
    // Simuler la suppression de la liste
    setCourses(courses.filter((c) => c.id !== course.id));
  };

  const handleRejectCourse = (course: Course) => {
    Alert.alert(
      "❌ Course Refusée",
      "Cette course a été retirée de votre liste",
      [{ text: "OK" }],
    );
    setCourses(courses.filter((c) => c.id !== course.id));
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simuler un refresh
    setTimeout(() => {
      setCourses(MOCK_COURSES);
      setRefreshing(false);
    }, 1000);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}></Text>
      <Text style={styles.emptyTitle}>Aucune course disponible</Text>
      <Text style={styles.emptyMessage}>Revenez dans quelques minutes !</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Statistiques rapides */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Disponibles</Text>
          <Text style={styles.statValue}>{courses.length}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Montant Total</Text>
          <Text style={styles.statValue}>
            {courses.reduce((sum, c) => sum + c.montant, 0).toLocaleString()} F
          </Text>
        </View>
      </View>

      {/* Liste des courses */}
      <FlatList
        data={courses}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onAccept={handleAcceptCourse}
            onReject={handleRejectCourse}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

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
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    ...Shadows.medium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeLabel: {
    ...Typography.label,
    color: COLORS.black,
  },
  montantContainer: {
    alignItems: "flex-end",
  },
  montantLabel: {
    ...Typography.caption,
    color: COLORS.gray,
  },
  montant: {
    ...Typography.h3,
    color: COLORS.success,
  },
  trajet: {
    marginBottom: Spacing.md,
  },
  trajepPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  trajepDot: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  trajepLine: {
    height: 16,
    width: 2,
    backgroundColor: COLORS.primary,
    marginLeft: 5,
    marginBottom: Spacing.xs,
  },
  trajepText: {
    ...Typography.body,
    color: COLORS.black,
    fontWeight: "500",
  },
  distance: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BorderRadius.md,
  },
  distanceIcon: {
    fontSize: 14,
  },
  distanceText: {
    ...Typography.bodySmall,
    color: COLORS.darkGray,
    fontWeight: "500",
    flex: 1,
  },
  paiementBadge: {
    ...Typography.caption,
    color: COLORS.success,
    fontWeight: "600",
  },
  clientInfo: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clientName: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "500",
  },
  clientPhone: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  refuseButton: {
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    ...Typography.label,
    color: COLORS.danger,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: COLORS.black,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    ...Typography.body,
    color: COLORS.gray,
    textAlign: "center",
  },
});
