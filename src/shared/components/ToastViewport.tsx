import { AppIcon, AppIconName } from "@/src/shared/components/AppIcon";
import { registerToastHandler, ToastPayload, ToastType } from "@/src/shared/services/toastService";
import { BorderRadius, COLORS, Shadows, Spacing, Typography } from "@/src/shared/theme";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

const ENTER_DURATION_MS = 180;
const EXIT_DURATION_MS = 140;
const DEFAULT_DURATION_MS = 2600;

type InternalToast = Required<Pick<ToastPayload, "title">> &
  Omit<ToastPayload, "title"> & {
    type: ToastType;
    position: "top" | "bottom";
    durationMs: number;
  };

type ToastVisualConfig = {
  backgroundColor: string;
  iconColor: string;
  iconName: AppIconName;
};

const TOAST_VISUALS: Record<ToastType, ToastVisualConfig> = {
  success: {
    backgroundColor: "#0F9D58",
    iconColor: COLORS.white,
    iconName: "check-circle",
  },
  error: {
    backgroundColor: "#D93025",
    iconColor: COLORS.white,
    iconName: "alert-circle",
  },
  warning: {
    backgroundColor: "#F9A825",
    iconColor: COLORS.white,
    iconName: "alert",
  },
  info: {
    backgroundColor: "#1E88E5",
    iconColor: COLORS.white,
    iconName: "information",
  },
};

const normalizeToast = (payload: ToastPayload): InternalToast => ({
  title: payload.title,
  message: payload.message,
  type: payload.type ?? "info",
  position: payload.position ?? "top",
  durationMs: payload.durationMs ?? DEFAULT_DURATION_MS,
});

export const ToastViewport = () => {
  const [currentToast, setCurrentToast] = useState<InternalToast | null>(null);
  const queueRef = useRef<InternalToast[]>([]);
  const isAnimatingRef = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const runNextToast = useCallback(() => {
    if (isAnimatingRef.current || queueRef.current.length === 0) {
      return;
    }

    const next = queueRef.current.shift();
    if (!next) {
      return;
    }

    isAnimatingRef.current = true;
    translateY.setValue(next.position === "top" ? -16 : 16);
    opacity.setValue(0);
    setCurrentToast(next);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        isAnimatingRef.current = false;
        return;
      }

      hideTimeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: EXIT_DURATION_MS,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: next.position === "top" ? -12 : 12,
            duration: EXIT_DURATION_MS,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentToast(null);
          isAnimatingRef.current = false;
          runNextToast();
        });
      }, next.durationMs);
    });
  }, [opacity, translateY]);

  const enqueueToast = useCallback(
    (payload: ToastPayload) => {
      queueRef.current.push(normalizeToast(payload));
      runNextToast();
    },
    [runNextToast],
  );

  useEffect(() => {
    const unregister = registerToastHandler(enqueueToast);

    return () => {
      unregister();
      clearHideTimeout();
      queueRef.current = [];
    };
  }, [clearHideTimeout, enqueueToast]);

  const visual = useMemo(() => {
    if (!currentToast) {
      return null;
    }

    return TOAST_VISUALS[currentToast.type];
  }, [currentToast]);

  const positionStyle = useMemo(() => {
    if (!currentToast) {
      return styles.topPosition;
    }

    return currentToast.position === "top" ? styles.topPosition : styles.bottomPosition;
  }, [currentToast]);

  if (!currentToast || !visual) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.viewport}>
      <Animated.View
        style={[
          styles.toastContainer,
          positionStyle,
          {
            backgroundColor: visual.backgroundColor,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <AppIcon name={visual.iconName} size={18} color={visual.iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentToast.title}</Text>
          {currentToast.message ? <Text style={styles.message}>{currentToast.message}</Text> : null}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 300,
    elevation: 300,
    pointerEvents: "box-none",
  },
  toastContainer: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.medium,
  },
  topPosition: {
    top: Spacing.lg,
  },
  bottomPosition: {
    bottom: Spacing.lg,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.label,
    color: COLORS.white,
  },
  message: {
    ...Typography.caption,
    color: COLORS.white,
    marginTop: 2,
    opacity: 0.95,
  },
});
