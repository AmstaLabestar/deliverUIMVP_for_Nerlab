import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, COLORS, Spacing, Typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [telephone, setTelephone] = useState("77123456");
  const [password, setPassword] = useState("1234");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!telephone.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      await signIn(telephone, password);
      // ⛔ PAS DE NAVIGATION ICI
    } catch (error) {
      Alert.alert(
        "Erreur de connexion",
        (error as Error).message || "Erreur inconnue",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header avec logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>🚚</Text>
          <Text style={styles.appName}>OGA Livreur</Text>
          <Text style={styles.tagline}>Gagnez en livrant</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          {/* Champ Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de Téléphone</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.prefix}>+226</Text>
              <TextInput
                style={styles.input}
                placeholder="xx xx xx xx"
                placeholderTextColor={COLORS.gray}
                keyboardType="phone-pad"
                value={telephone}
                onChangeText={setTelephone}
                editable={!loading}
                maxLength={9}
              />
            </View>
          </View>

          {/* Champ Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de Passe</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Entrez votre mot de passe"
              placeholderTextColor={COLORS.gray}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Se Connecter</Text>
            )}
          </TouchableOpacity>

          {/* Lien inscription */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Pas encore inscrit ? </Text>
            <TouchableOpacity disabled={loading}>
              <Text style={styles.signupLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.bgPrimary,
    paddingHorizontal: Spacing.md,
    justifyContent: "space-between",
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  appName: {
    ...Typography.h1,
    color: COLORS.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.bodySmall,
    color: COLORS.gray,
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    color: COLORS.black,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: COLORS.bgSecondary,
  },
  prefix: {
    ...Typography.body,
    color: COLORS.darkGray,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: COLORS.black,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: COLORS.black,
    backgroundColor: COLORS.bgSecondary,
  },
  hint: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.sm,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...Typography.label,
    color: COLORS.white,
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  signupText: {
    ...Typography.body,
    color: COLORS.darkGray,
  },
  signupLink: {
    ...Typography.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
  demoInfo: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  demoTitle: {
    ...Typography.label,
    color: COLORS.black,
    marginBottom: Spacing.sm,
  },
  demoAccount: {
    marginBottom: Spacing.sm,
  },
  demoLabel: {
    ...Typography.caption,
    color: COLORS.darkGray,
  },
  demoValue: {
    ...Typography.caption,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
