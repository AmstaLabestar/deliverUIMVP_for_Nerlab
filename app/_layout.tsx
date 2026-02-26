import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppErrorBoundary } from "@/src/bootstrap/providers/AppErrorBoundary";
import { AppProviders } from "@/src/bootstrap/providers/AppProviders";
import { NetworkStatusProvider } from "@/src/infrastructure/network/NetworkStatusProvider";
import { OfflineSyncProvider } from "@/src/infrastructure/offline/OfflineSyncProvider";
import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import { AuthProvider } from "@/src/modules/auth/store/AuthProvider";
import { OfflineBanner } from "@/src/shared/components/OfflineBanner";
import { COLORS } from "@/src/shared/theme";

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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    );
  }

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="pressing"
          options={{
            headerShown: true,
            title: "Pressing",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />
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
