// import { Stack } from "expo-router";
// import { useEffect } from "react";
// import { ActivityIndicator, View } from "react-native";
// import { COLORS } from "../constants/theme";
// import { AuthProvider, useAuth } from "../context/AuthContext";

// function RootNavigator() {
//   const { isLoading, userToken, restoreToken } = useAuth();

//   useEffect(() => {
//     restoreToken();
//   }, [restoreToken]);

//   if (isLoading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//           backgroundColor: COLORS.primary,
//         }}
//       >
//         <ActivityIndicator size="large" color={COLORS.white} />
//       </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {userToken ? (
//         // Si connecté : On affiche le groupe de navigation (tabs)
//         <Stack.Screen
//           name="(tabs)"
//           options={{ animation: "slide_from_right" }}
//         />
//       ) : (
//         // Si déconnecté : On affiche l'écran de login
//         <Stack.Screen name="index" options={{ animation: "fade" }} />
//       )}
//       <Stack.Screen name="modal" options={{ presentation: "modal" }} />
//     </Stack>
//   );
// }

// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <RootNavigator />
//     </AuthProvider>
//   );
// }

import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../constants/theme";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootNavigator() {
  const { isLoading, userToken, restoreToken } = useAuth();

  useEffect(() => {
    restoreToken();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.primary,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {userToken ? (
        // 🔐 Connecté → zone protégée
        <Stack.Screen
          name="(tabs)"
          options={{ animation: "slide_from_right" }}
        />
      ) : (
        // 🔓 Non connecté → login (index public)
        <Stack.Screen name="index" options={{ animation: "fade" }} />
      )}

      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
