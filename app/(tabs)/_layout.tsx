// import { Tabs } from "expo-router";
// import { StyleSheet, Text, TouchableOpacity } from "react-native";
// import { COLORS, Spacing } from "../../constants/theme";
// import { useAuth } from "../../context/AuthContext";

// const styles = StyleSheet.create({
//   tabBarLabel: {
//     fontSize: 11,
//     marginTop: Spacing.xs,
//     fontWeight: "500",
//   },
// });

// export default function TabsLayout() {
//   const { signOut } = useAuth();

//   const handleLogout = async () => {
//     await signOut();
//   };

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: COLORS.primary,
//         tabBarInactiveTintColor: COLORS.darkGray,
//         tabBarStyle: {
//           backgroundColor: COLORS.bgPrimary,
//           borderTopColor: COLORS.border,
//           borderTopWidth: 1,
//           paddingTop: Spacing.xs,
//           paddingBottom: Spacing.xs,
//           height: 65,
//         },
//         tabBarLabelStyle: styles.tabBarLabel,
//         headerStyle: {
//           backgroundColor: COLORS.primary,
//         },
//         headerTintColor: COLORS.white,
//         headerTitleStyle: {
//           fontWeight: "700",
//           fontSize: 18,
//         },
//         headerRight: () => (
//           <TouchableOpacity
//             onPress={handleLogout}
//             style={{ marginRight: Spacing.md }}
//           >
//             <Text style={{ color: COLORS.white, fontSize: 18 }}>🚪</Text>
//           </TouchableOpacity>
//         ),
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Accueil",
//           headerTitle: "Courses disponibles",
//           tabBarLabel: "Accueil",
//           tabBarIcon: ({ focused }) => (
//             <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>🏠</Text>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="historyScreen"
//         options={{
//           title: "Historique",
//           headerTitle: "Historique",
//           tabBarLabel: "Historique",
//           tabBarIcon: ({ focused }) => (
//             <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>📜</Text>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="walletScreen"
//         options={{
//           title: "Gains",
//           headerTitle: "Mes gains",
//           tabBarLabel: "Gains",
//           tabBarIcon: ({ focused }) => (
//             <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>💰</Text>
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="ProfilLivreurScreen"
//         options={{
//           title: "profile",
//           headerTitle: "Mon profil",
//           tabBarLabel: "Profil",
//           tabBarIcon: ({ focused }) => (
//             <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>👤</Text>
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 1. Import important
import { COLORS, Spacing } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function TabsLayout() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets(); // 2. Récupère l'espace du bas

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: COLORS.bgPrimary,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: Spacing.xs,
          // 3. On ajuste la hauteur et le padding dynamiquement
          height: Platform.OS === "ios" ? 65 + insets.bottom : 70,
          paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm,
        },
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: Spacing.md }}
          >
            <Text style={{ color: COLORS.white, fontSize: 18 }}>🚪</Text>
          </TouchableOpacity>
        ),
      }}
    >
      {/* ... Tes écrans restent les mêmes ... */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          headerTitle: "Courses disponibles",
          tabBarLabel: "Accueil",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>🏠</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="historique"
        options={{
          title: "Historique",
          headerTitle: "Historique",
          tabBarLabel: "Historique",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>📜</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="Portefeuille"
        options={{
          title: "Gains",
          headerTitle: "Mes gains",
          tabBarLabel: "Gains",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>💰</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: "profile",
          headerTitle: "Mon profil",
          tabBarLabel: "Profil",
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 11,
    marginTop: Platform.OS === "ios" ? 0 : Spacing.xs, // Évite de trop espacer sur iOS
    fontWeight: "500",
    marginBottom: 5, // Petit espace sous le texte
  },
});
