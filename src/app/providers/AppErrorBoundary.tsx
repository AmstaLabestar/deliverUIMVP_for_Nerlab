import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { logger } from "@/src/core/logger/logger";
import { COLORS, Spacing, Typography } from "@/src/shared/theme";

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  retryKey: number;
};

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    retryKey: 0,
  };

  public static getDerivedStateFromError(): Partial<AppErrorBoundaryState> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error("react_unhandled_error", error, {
      componentStack: errorInfo.componentStack ?? "unknown",
    });
  }

  private handleRetry = (): void => {
    this.setState((previous) => ({
      hasError: false,
      retryKey: previous.retryKey + 1,
    }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Une erreur est survenue.</Text>
          <Text style={styles.subtitle}>
            Relance l'ecran. Si le probleme persiste, reouvre l'application.
          </Text>
          <Pressable style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryLabel}>Reessayer</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    backgroundColor: COLORS.bgSecondary,
  },
  title: {
    ...Typography.h3,
    color: COLORS.black,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.bodySmall,
    color: COLORS.darkGray,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  retryLabel: {
    ...Typography.label,
    color: COLORS.white,
  },
});
