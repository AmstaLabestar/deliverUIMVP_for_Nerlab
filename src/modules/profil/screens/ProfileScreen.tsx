import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import { useNotificationPreferences } from "@/src/modules/notifications/hooks/useNotificationPreferences";
import {
  BorderRadius,
  COLORS,
  Shadows,
  Spacing,
  Typography,
} from "@/src/shared/theme";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const trackColors = { false: COLORS.border, true: COLORS.primaryLight };

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { preferences, setSoundEnabled } = useNotificationPreferences();
  const [isOnline, setIsOnline] = useState(true);

  const handleLogout = useCallback(() => {
    Alert.alert("Deconnexion", "Confirmer la deconnexion ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Deconnecter",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  }, [signOut]);

  const handleSoundToggle = useCallback(
    (value: boolean) => {
      void setSoundEnabled(value);
    },
    [setSoundEnabled],
  );

  if (!user) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Utilisateur non trouve.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user.livreur.nom}</Text>
        <Text style={styles.meta}>+226 {user.telephone}</Text>
        <Text style={styles.meta}>Note {user.livreur.niveauEtoile.toFixed(1)}</Text>
        <Text style={styles.meta}>Vehicule {user.livreur.typeVehicule}</Text>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Disponible pour les courses</Text>
            <Text style={styles.settingHint}>{isOnline ? "En ligne" : "Hors ligne"}</Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={trackColors}
            thumbColor={isOnline ? COLORS.primary : COLORS.gray}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Notification sonore colis</Text>
            <Text style={styles.settingHint}>
              Active le son a l'acceptation d'une course colis.
            </Text>
          </View>
          <Switch
            value={preferences.soundEnabled}
            onValueChange={handleSoundToggle}
            trackColor={trackColors}
            thumbColor={preferences.soundEnabled ? COLORS.primary : COLORS.gray}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Deconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  content: {
    padding: Spacing.md,
  },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bgSecondary,
  },
  fallbackText: {
    ...Typography.body,
    color: COLORS.gray,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  name: {
    ...Typography.h3,
    color: COLORS.black,
    marginBottom: Spacing.sm,
  },
  meta: {
    ...Typography.bodySmall,
    color: COLORS.darkGray,
    marginTop: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.small,
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
    ...Typography.label,
    color: COLORS.black,
  },
  settingHint: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.xs,
    maxWidth: 220,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  logoutButtonText: {
    ...Typography.label,
    color: COLORS.white,
  },
});
