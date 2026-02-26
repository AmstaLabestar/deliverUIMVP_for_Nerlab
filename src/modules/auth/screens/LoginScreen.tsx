import { toErrorMessage } from "@/src/core/errors/toErrorMessage";
import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import { toastService } from "@/src/shared/services/toastService";
import { BorderRadius, COLORS, Spacing, Typography } from "@/src/shared/theme";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const LoginScreen = () => {
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleLogin = useCallback(async () => {
    if (!telephone.trim() || !password.trim()) {
      toastService.warning("Champs incomplets", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      await signIn({ telephone: telephone.trim(), password: password.trim() });
    } catch (error) {
      toastService.error("Erreur de connexion", toErrorMessage(error));
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [password, signIn, telephone]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>DLV</Text>
          <Text style={styles.appName}>OGA Livreur</Text>
          <Text style={styles.tagline}>Gagnez en livrant</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numero de telephone</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
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

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    fontSize: 48,
    marginBottom: Spacing.md,
    color: COLORS.primary,
    fontWeight: "700",
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
});
