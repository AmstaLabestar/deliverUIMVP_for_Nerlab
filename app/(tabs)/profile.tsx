import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
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

export default function ProfileScreen() {
  // Ajout d'un cast "any" ou correction selon votre interface AuthContextType
  const { user, signOut } = useAuth() as any;
  const [isOnline, setIsOnline] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Erreur: Utilisateur non trouvé</Text>
      </View>
    );
  }

  const { livreur } = user;

  const getVehiculeEmoji = (type: string) => {
    return type === "moto" ? "🏍️" : "🚗";
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnecter", onPress: signOut, style: "destructive" },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* En-tête du profil */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
          <View
            style={[styles.statusIndicator, isOnline && styles.statusOnline]}
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{livreur.nom}</Text>
          <Text style={styles.profilePhone}>📞 +226 {user.telephone}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>
              ⭐ {livreur.niveauEtoile.toFixed(1)}
            </Text>
            <Text style={styles.ratingText}>Excellent</Text>
          </View>
        </View>
      </View>

      {/* Statut en ligne */}
      <View style={styles.statusCard}>
        <View style={styles.statusContent}>
          <Text style={styles.statusLabel}>Disponible pour les courses</Text>
          <Text style={styles.statusSubtext}>
            {isOnline ? "🟢 En ligne" : "⚫ Hors ligne"}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={setIsOnline}
          // Correction : Utilisation de COLORS
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={isOnline ? COLORS.primary : COLORS.gray}
        />
      </View>

      {/* ... Reste du JSX avec COLORS au lieu de Colors ... */}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}> Déconnexion</Text>
      </TouchableOpacity>
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
  profileHeader: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.small,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.lg,
  },
  avatar: {
    fontSize: 56,
    width: 60,
    height: 60,
    textAlign: "center",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  statusOnline: {
    backgroundColor: COLORS.success,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
    color: COLORS.black,
    marginBottom: Spacing.xs,
  },
  profilePhone: {
    ...Typography.caption,
    color: COLORS.gray,
    marginBottom: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ratingStars: {
    ...Typography.label,
    color: COLORS.warning,
  },
  ratingText: {
    ...Typography.caption,
    color: COLORS.success,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.small,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    ...Typography.label,
    color: COLORS.black,
    marginBottom: Spacing.xs,
  },
  statusSubtext: {
    ...Typography.caption,
    color: COLORS.gray,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
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
  },
  editButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  editButtonText: {
    ...Typography.label,
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BorderRadius.md,
  },
  statValue: {
    ...Typography.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingLabel: {
    ...Typography.bodySmall,
    color: COLORS.black,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  settingSubtext: {
    ...Typography.caption,
    color: COLORS.gray,
  },
  settingMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingMenuText: {
    ...Typography.bodySmall,
    color: COLORS.black,
  },
  settingMenuArrow: {
    ...Typography.body,
    color: COLORS.gray,
  },
  versionText: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  logoutButtonText: {
    ...Typography.label,
    color: COLORS.white,
    fontSize: 16,
  },
});
