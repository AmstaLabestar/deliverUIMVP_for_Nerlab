import { AppIcon } from "@/src/shared/components/AppIcon";
import { BorderRadius, COLORS, Shadows, Spacing, Typography } from "@/src/shared/theme";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CODE_LENGTH = 6;

type PressingDeliveryCodeSheetProps = {
  visible: boolean;
  code: string;
  isSubmitting: boolean;
  hasError: boolean;
  onCodeChange: (code: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

type OtpCellProps = {
  value: string;
  isActive: boolean;
  hasError: boolean;
};

const OtpCell = React.memo(({ value, isActive, hasError }: OtpCellProps) => {
  return (
    <View
      style={[
        styles.otpCell,
        isActive && styles.otpCellActive,
        hasError && styles.otpCellError,
      ]}
    >
      <Text style={styles.otpCellText}>{value || " "}</Text>
    </View>
  );
});

const PressingDeliveryCodeSheetComponent = ({
  visible,
  code,
  isSubmitting,
  hasError,
  onCodeChange,
  onConfirm,
  onClose,
}: PressingDeliveryCodeSheetProps) => {
  const inputRef = useRef<TextInput>(null);
  const shakeTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => {
      clearTimeout(focusTimeout);
    };
  }, [visible]);

  useEffect(() => {
    if (!hasError) {
      return;
    }

    shakeTranslateX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeTranslateX, {
        toValue: -8,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeTranslateX, {
        toValue: 8,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeTranslateX, {
        toValue: -6,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeTranslateX, {
        toValue: 6,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeTranslateX, {
        toValue: 0,
        duration: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hasError, shakeTranslateX]);

  const digits = useMemo(() => {
    return Array.from({ length: CODE_LENGTH }, (_, index) => code[index] ?? "");
  }, [code]);

  const handleChangeText = useCallback(
    (nextValue: string) => {
      const sanitized = nextValue.replace(/\D/g, "").slice(0, CODE_LENGTH);
      onCodeChange(sanitized);
    },
    [onCodeChange],
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleBackdropPress = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const ignorePress = useCallback(() => {
    return;
  }, []);

  const otpCells = useMemo(() => {
    const nextCells: React.ReactNode[] = [];

    for (let index = 0; index < CODE_LENGTH; index += 1) {
      nextCells.push(
        <OtpCell
          key={`code_cell_${index}`}
          value={digits[index]}
          isActive={index === code.length && code.length < CODE_LENGTH}
          hasError={hasError}
        />,
      );
    }

    return nextCells;
  }, [code.length, digits, hasError]);

  const canSubmit = code.length === CODE_LENGTH && !isSubmitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Pressable onPress={ignorePress} style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <AppIcon name="shield-check-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Code client requis</Text>
              <Text style={styles.subtitle}>
                Saisis le code de confirmation donne par le client.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.otpTouchArea}
            onPress={focusInput}
            disabled={isSubmitting}
          >
            <Animated.View
              style={[styles.otpRow, { transform: [{ translateX: shakeTranslateX }] }]}
            >
              {otpCells}
            </Animated.View>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={handleChangeText}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              editable={!isSubmitting}
              autoCorrect={false}
              autoComplete="off"
              textContentType="oneTimeCode"
              importantForAutofill="no"
              selectionColor={COLORS.primary}
            />
          </TouchableOpacity>

          {hasError ? (
            <Text style={styles.errorText}>Code invalide. Verifie puis reessaie.</Text>
          ) : (
            <Text style={styles.hintText}>Code a 6 chiffres</Text>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, isSubmitting && styles.secondaryButtonDisabled]}
              onPress={handleBackdropPress}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
              onPress={onConfirm}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Verifier</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export const PressingDeliveryCodeSheet = React.memo(PressingDeliveryCodeSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.36)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    ...Shadows.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.bgSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: COLORS.black,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: COLORS.gray,
    marginTop: 2,
  },
  otpTouchArea: {
    marginTop: Spacing.lg,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpCell: {
    width: 46,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  otpCellActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  otpCellError: {
    borderColor: COLORS.danger,
  },
  otpCellText: {
    ...Typography.h3,
    color: COLORS.black,
    fontWeight: "700",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0.01,
    width: 1,
    height: 1,
  },
  hintText: {
    ...Typography.caption,
    color: COLORS.gray,
    marginTop: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: COLORS.danger,
    marginTop: Spacing.sm,
  },
  actionsRow: {
    marginTop: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgSecondary,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  secondaryButtonDisabled: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    ...Typography.label,
    color: COLORS.darkGray,
  },
  primaryButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: COLORS.primary,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.62,
  },
  primaryButtonText: {
    ...Typography.label,
    color: COLORS.white,
  },
});
