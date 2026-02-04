import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import CustomButton from "../components/CustomButton";
import {
    BorderRadius,
    COLORS,
    Shadows,
    Spacing,
    Typography,
} from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { getActiveCourse } from "../data/courses";
import { Course } from "../types/course";

export default function ActiveCourseScreen() {
  // Correction : On récupère tout le contexte pour éviter l'erreur de type sur 'user'
  const auth = useAuth();
  const [course, setCourse] = useState<Course | null>(getActiveCourse());
  const [courseStatus, setCourseStatus] = useState<
    "en_attente" | "en_cours" | "terminee"
  >("en_attente");
  const [loading, setLoading] = useState(false);

  if (!course) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Aucune course en cours</Text>
          <Text style={styles.emptyMessage}>
            Acceptez une course pour la suivre ici
          </Text>
        </View>
      </View>
    );
  }

  const handleStartCourse = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCourseStatus("en_cours");
      Alert.alert("✅ Course démarrée", "La course est maintenant en cours");
    } catch (error) {
      Alert.alert("❌ Erreur", "Impossible de démarrer la course");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCourse = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCourseStatus("terminee");
      Alert.alert(
        "✅ Course complétée",
        `Vous avez gagné ${course.montant.toLocaleString()} F!`,
      );
      setTimeout(() => setCourse(null), 2000);
    } catch (error) {
      Alert.alert("❌ Erreur", "Impossible de compléter la course");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (courseStatus) {
      case "en_attente":
        return COLORS.warning;
      case "en_cours":
        return COLORS.info;
      case "terminee":
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  const getStatusLabel = () => {
    switch (courseStatus) {
      case "en_attente":
        return "En attente";
      case "en_cours":
        return "En cours";
      case "terminee":
        return "Terminée";
      default:
        return "Inconnu";
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* En-tête avec statut */}
      <View style={styles.statusCard}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>Statut de la course</Text>
          <Text style={styles.statusValue}>{getStatusLabel()}</Text>
        </View>
      </View>

      {/* Détails du trajet */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Trajet</Text>
        <View style={styles.trajet}>
          <View style={styles.trajepPoint}>
            <Text style={styles.trajepDot}>●</Text>
            <View style={styles.trajepContent}>
              <Text style={styles.trajepLabel}>Départ</Text>
              <Text style={styles.trajepValue}>{course.quartierDepart}</Text>
            </View>
          </View>

          <View style={styles.trajepLineContainer}>
            <View style={styles.trajepLine} />
            <Text style={styles.trajepDistance}>{course.distance} km</Text>
          </View>

          <View style={styles.trajepPoint}>
            <Text style={styles.trajepDot}>●</Text>
            <View style={styles.trajepContent}>
              <Text style={styles.trajepLabel}>Arrivée</Text>
              <Text style={styles.trajepValue}>{course.quartierArrivee}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Infos client */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Infos Client</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom</Text>
          <Text style={styles.infoValue}>{course.infosClient.nom}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Téléphone</Text>
          <Text style={styles.infoValue}>{course.infosClient.telephone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Adresse</Text>
          <Text style={styles.infoValue}>{course.infosClient.adresse}</Text>
        </View>
      </View>

      {/* Détails livraison */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📦 Détails Livraison</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type</Text>
          <Text style={styles.infoValue}>
            {course.typeLivraison === "colis"
              ? "📦 Colis"
              : course.typeLivraison === "nourriture"
                ? "🍔 Nourriture"
                : "📄 Documents"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Montant</Text>
          <Text style={[styles.infoValue, { color: COLORS.success }]}>
            {course.montant.toLocaleString()} F
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Paiement</Text>
          <Text style={styles.infoValue}>
            {course.typePaiement === "deja_paye"
              ? "✓ Déjà payé"
              : "💳 À la livraison"}
          </Text>
        </View>
      </View>

      {/* Boutons d'action corrigés (plus de chaînes nues) */}
      <View style={styles.actionsContainer}>
        {courseStatus === "en_attente" ? (
          <CustomButton
            title="▶️ Commencer la course"
            onPress={handleStartCourse}
            loading={loading}
            variant="primary"
          />
        ) : courseStatus === "en_cours" ? (
          <CustomButton
            title="✅ Terminer la course"
            onPress={handleCompleteCourse}
            loading={loading}
            variant="success"
          />
        ) : (
          <View style={styles.completedContainer}>
            <Text style={styles.completedEmoji}>🎉</Text>
            <Text style={styles.completedTitle}>Course Complétée!</Text>
            <Text style={styles.completedMessage}>
              Gains : {course.montant.toLocaleString()} F
            </Text>
          </View>
        )}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteIcon}>💡</Text>
        <Text style={styles.noteText}>
          Assurez-vous que le client reçoit bien le colis avant de confirmer.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.medium,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    ...Typography.caption,
    color: COLORS.gray,
    marginBottom: Spacing.xs,
  },
  statusValue: {
    ...Typography.h3,
    color: COLORS.black,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  cardTitle: {
    ...Typography.h3,
    color: COLORS.black,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  trajet: {
    gap: Spacing.md,
  },
  trajepPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  trajepDot: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  trajepContent: {
    flex: 1,
  },
  trajepLabel: {
    ...Typography.caption,
    color: COLORS.gray,
  },
  trajepValue: {
    ...Typography.body,
    color: COLORS.black,
    fontWeight: "600",
  },
  trajepLineContainer: {
    alignItems: "center",
    marginLeft: Spacing.md,
    width: 20,
  },
  trajepLine: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.primary,
  },
  trajepDistance: {
    ...Typography.caption,
    color: COLORS.primary,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    ...Typography.bodySmall,
    color: COLORS.gray,
  },
  infoValue: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  actionsContainer: {
    marginBottom: Spacing.lg,
  },
  completedContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    ...Shadows.small,
  },
  completedEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  completedTitle: {
    ...Typography.h2,
    color: COLORS.success,
  },
  completedMessage: {
    ...Typography.body,
    color: COLORS.black,
  },
  noteCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  noteIcon: {
    fontSize: 16,
  },
  noteText: {
    ...Typography.caption,
    color: COLORS.darkGray,
    flex: 1,
  },
});
