import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppErrorBoundary } from "@/src/bootstrap/providers/AppErrorBoundary";
import { AppProviders } from "@/src/bootstrap/providers/AppProviders";
import { NetworkStatusProvider } from "@/src/infrastructure/network/NetworkStatusProvider";
import { OfflineSyncProvider } from "@/src/infrastructure/offline/OfflineSyncProvider";
import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import { AuthProvider } from "@/src/modules/auth/store/AuthProvider";
import { OfflineBanner } from "@/src/shared/components/OfflineBanner";
import { ToastViewport } from "@/src/shared/components/ToastViewport";
import { COLORS } from "@/src/shared/theme";

const stackScreenOptions = { headerShown: false };
const pressingScreenOptions = {
  headerShown: true,
  title: "Pressing",
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
};

const RootNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="index" />
      </Stack>
    );
  }

  return (
    <AppProviders>
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pressing" options={pressingScreenOptions} />
      </Stack>
    </AppProviders>
  );
};

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <NetworkStatusProvider>
        <OfflineSyncProvider>
          <AuthProvider>
            <View style={styles.appContainer}>
              <OfflineBanner />
              <RootNavigator />
              <ToastViewport />
            </View>
          </AuthProvider>
        </OfflineSyncProvider>
      </NetworkStatusProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
});
