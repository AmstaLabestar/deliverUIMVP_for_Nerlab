import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, Spacing } from "@/src/shared/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "700",
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          headerTitle: "Accueil",
          tabBarLabel: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reservations"
        options={{
          title: "Réservations",
          headerTitle: "Réservations",
          tabBarLabel: "Réservations",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="portefeuille"
        options={{
          title: "Portefeuille",
          headerTitle: "Portefeuille",
          tabBarLabel: "Portefeuille",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          headerTitle: "Profil",
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
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
