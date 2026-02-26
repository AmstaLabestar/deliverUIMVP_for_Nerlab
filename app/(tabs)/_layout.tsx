import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/src/shared/components/AppIcon";
import { COLORS, Spacing } from "@/src/shared/theme";

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <AppIcon name="home-variant-outline" size={size} color={color} />
);

const ReservationsIcon = ({ color, size }: { color: string; size: number }) => (
  <AppIcon name="clipboard-list-outline" size={size} color={color} />
);

const WalletIcon = ({ color, size }: { color: string; size: number }) => (
  <AppIcon name="wallet-outline" size={size} color={color} />
);

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <AppIcon name="account-circle-outline" size={size} color={color} />
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const extraBottomSpacing = Platform.OS === "android" ? Spacing.md : Spacing.sm;
  const tabBarBottomPadding = Math.max(bottomInset, Spacing.sm) + extraBottomSpacing;
  const tabBarHeight = (Platform.OS === "ios" ? 64 : 68) + tabBarBottomPadding;

  const screenOptions = useMemo(
    () => ({
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: COLORS.white,
      headerTitleStyle: {
        fontWeight: "700" as const,
        fontSize: 18,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.darkGray,
      tabBarStyle: {
        backgroundColor: COLORS.bgPrimary,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        paddingTop: Spacing.sm,
        height: tabBarHeight,
        paddingBottom: tabBarBottomPadding,
        paddingHorizontal: Spacing.sm,
      },
      tabBarItemStyle: styles.tabBarItem,
      tabBarLabelStyle: styles.tabBarLabel,
    }),
    [tabBarBottomPadding, tabBarHeight],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          headerTitle: "Accueil",
          tabBarLabel: "Accueil",
          tabBarIcon: HomeIcon,
        }}
      />

      <Tabs.Screen
        name="reservations"
        options={{
          title: "Reservations",
          headerTitle: "Reservations",
          tabBarLabel: "Reservations",
          tabBarIcon: ReservationsIcon,
        }}
      />

      <Tabs.Screen
        name="portefeuille"
        options={{
          title: "Portefeuille",
          headerTitle: "Portefeuille",
          tabBarLabel: "Portefeuille",
          tabBarIcon: WalletIcon,
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          headerTitle: "Profil",
          tabBarLabel: "Profil",
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    paddingVertical: Spacing.xs,
  },
  tabBarLabel: {
    fontSize: 11,
    marginTop: Platform.OS === "ios" ? Spacing.xs : Spacing.sm,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
});
