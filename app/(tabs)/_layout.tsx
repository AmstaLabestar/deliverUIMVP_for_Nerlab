import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, Spacing } from "@/src/shared/theme";

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="home-outline" size={size} color={color} />
);

const ReservationsIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="calendar-outline" size={size} color={color} />
);

const WalletIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="wallet-outline" size={size} color={color} />
);

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="person-outline" size={size} color={color} />
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

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
        paddingTop: Spacing.xs,
        height: Platform.OS === "ios" ? 65 + insets.bottom : 70,
        paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm,
      },
      tabBarLabelStyle: styles.tabBarLabel,
    }),
    [insets.bottom],
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
  tabBarLabel: {
    fontSize: 11,
    marginTop: Platform.OS === "ios" ? 0 : Spacing.xs,
    fontWeight: "500",
    marginBottom: 5,
  },
});
