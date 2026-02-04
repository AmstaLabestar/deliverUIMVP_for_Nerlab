import React from "react";
import {
  ScrollView,
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
import { useAuth } from "../../context/AuthContext";

export default function WalletScreen() {
  const { user } = useAuth();

  // État de chargement ou utilisateur non trouvé
  if (!user || !user.livreur) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          Chargement des données du portefeuille...
        </Text>
      </View>
    );
  }

  const { livreur } = user;

  // Sécurisation des données avec conversion explicite (cast any temporaire)
  // car ton type User actuel ne contient pas encore ces champs financiers
  const soldeDisponible = (livreur as any).soldeDisponible || 0;
  const totalGagnes = (livreur as any).totalGagnes || 0;
  const totalCourses = livreur.totalCoursesCompletees || 0;
  const coursesPayees = livreur.coursesPayees || 0;
  const dateInscription =
    (livreur as any).dateInscription || new Date().toISOString();

  // Calculs de progression
  const tauxRemplissageActuel = (totalCourses / 100) * 100;
  const moyenneParCourse =
    coursesPayees > 0 ? Math.round(totalGagnes / coursesPayees) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Solde disponible - Card principale */}
      <View style={styles.soldeCard}>
        <Text style={styles.soldeLabel}>Solde Disponible</Text>
        <Text style={styles.soldeAmount}>
          {soldeDisponible.toLocaleString()} F
        </Text>
        <View style={styles.soldeActions}>
          <TouchableOpacity style={styles.soldeActionButton}>
            <Text style={styles.soldeActionText}>💸 Retrait</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.soldeActionButton}>
            <Text style={styles.soldeActionText}>📊 Historique</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPIs Gains */}
      <View style={styles.kpisContainer}>
        <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
          <Text style={styles.kpiLabel}>Total Gagné</Text>
          <Text style={styles.kpiValue}>{totalGagnes.toLocaleString()} F</Text>
          <Text style={styles.kpiSubtext}>Cumul</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardSecondary]}>
          <Text style={styles.kpiLabel}>Payées</Text>
          <Text style={styles.kpiValue}>{coursesPayees}</Text>
          <Text style={styles.kpiSubtext}>Courses</Text>
        </View>

        <View style={[styles.kpiCard, styles.kpiCardTertiary]}>
          <Text style={styles.kpiLabel}>Moyenne</Text>
          <Text style={styles.kpiValue}>
            {moyenneParCourse.toLocaleString()} F
          </Text>
          <Text style={styles.kpiSubtext}>/ course</Text>
        </View>
      </View>

      {/* Progression */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📈 Objectifs</Text>
        </View>

        <View style={styles.progressItem}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressText}>Courses (Objectif 100)</Text>
            <Text style={styles.progressValue}>{totalCourses}/100</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(tauxRemplissageActuel, 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Détails */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}> Informations</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Taux de réussite</Text>
          <Text style={styles.detailValue}>
            {totalCourses > 0
              ? Math.round((coursesPayees / totalCourses) * 100)
              : 0}{" "}
            %
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Membre depuis</Text>
          <Text style={styles.detailValue}>
            {new Date(dateInscription).toLocaleDateString("fr-FR")}
          </Text>
        </View>
      </View>

      {/* Méthodes de paiement */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💳 Paiement</Text>
        </View>

        <TouchableOpacity style={styles.paymentMethod}>
          <Text style={styles.paymentIcon}>📱</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>Orange Money / Wave</Text>
            <Text style={styles.paymentDetails}>+226 {user.telephone}</Text>
          </View>
          <Text style={styles.paymentStatus}>✓</Text>
        </TouchableOpacity>
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
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    ...Typography.body,
    color: COLORS.gray,
  },
  soldeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.large,
  },
  soldeLabel: {
    ...Typography.bodySmall,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: Spacing.sm,
  },
  soldeAmount: {
    ...Typography.h1,
    color: COLORS.white,
    marginBottom: Spacing.lg,
  },
  soldeActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  soldeActionButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  soldeActionText: {
    ...Typography.label,
    color: COLORS.white,
  },
  kpisContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  kpiCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.small,
  },
  kpiCardPrimary: { backgroundColor: "#FFF3E0" },
  kpiCardSecondary: { backgroundColor: "#E8F5E9" },
  kpiCardTertiary: { backgroundColor: "#E3F2FD" },
  kpiLabel: {
    ...Typography.caption,
    color: COLORS.darkGray,
    marginBottom: Spacing.xs,
  },
  kpiValue: {
    ...Typography.h3,
    color: COLORS.primary,
  },
  kpiSubtext: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sectionTitle: {
    ...Typography.h3,
    color: COLORS.black,
  },
  progressItem: {
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressText: {
    ...Typography.bodySmall,
    color: COLORS.darkGray,
  },
  progressValue: {
    ...Typography.bodySmall,
    color: COLORS.primary,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: COLORS.darkGray,
  },
  detailValue: {
    ...Typography.bodySmall,
    color: COLORS.primary,
    fontWeight: "600",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BorderRadius.md,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "500",
  },
  paymentDetails: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  paymentStatus: {
    ...Typography.body,
    color: COLORS.success,
  },
});
