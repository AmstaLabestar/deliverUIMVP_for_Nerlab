// import React, { createContext, useContext, useState } from "react";

// type User = {
//   telephone: string;
//   livreur: {
//     nom: string;
//     niveauEtoile: number;
//     typeVehicule: "moto" | "voiture";
//     totalCoursesCompletees: number;
//     coursesPayees: number;
//   };
// };

// type AuthContextType = {
//   userToken: string | null;
//   user: User | null;
//   isLoading: boolean;
//   restoreToken: () => Promise<void>;
//   signIn: (telephone: string, password: string) => Promise<void>;
//   signOut: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [userToken, setUserToken] = useState<string | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const restoreToken = async () => {
//     try {
//       // Simulation : vérifier si un token existe (dans une vraie app, ce serait AsyncStorage)
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       // Pour la démo, on ne restaure aucun token au démarrage
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Erreur lors de la restauration du token:", error);
//       setIsLoading(false);
//     }
//   };

//   const signIn = async (telephone: string, password: string) => {
//     // Simulation d'un appel réseau
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     if (
//       (telephone === "77123456" || telephone === "77654321") &&
//       password === "1234"
//     ) {
//       const newToken = "token_" + Date.now(); // Token unique
//       setUserToken(newToken);
//       setUser({
//         telephone,
//         livreur: {
//           nom: "Moussa Diop",
//           niveauEtoile: 4.8,
//           typeVehicule: "moto",
//           totalCoursesCompletees: 154,
//           coursesPayees: 148,
//         },
//       });
//       // Dans une vraie app : await AsyncStorage.setItem("userToken", newToken);
//     } else {
//       throw new Error("Numéro ou mot de passe incorrect");
//     }
//   };

//   const signOut = async () => {
//     setUserToken(null);
//     setUser(null);
//     // Dans une vraie app : await AsyncStorage.removeItem("userToken");
//   };

//   return (
//     <AuthContext.Provider
//       value={{ userToken, user, isLoading, restoreToken, signIn, signOut }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used inside AuthProvider");
//   return context;
// }

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const API_URL = "http://192.168.1.83:3000/api";

type User = {
  telephone: string;
  livreur: {
    nom: string;
    niveauEtoile: number;
    typeVehicule: "moto" | "voiture";
    totalCoursesCompletees: number;
    coursesPayees: number;
  };
};

type AuthContextType = {
  userToken: string | null;
  user: User | null;
  isLoading: boolean;
  restoreToken: () => Promise<void>;
  signIn: (telephone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔁 Restaurer la session au démarrage
  const restoreToken = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        setUserToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Erreur restoreToken:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreToken();
  }, []);

  // 🔐 LOGIN API
  const signIn = async (telephone: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telephone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Échec de connexion");
      }

      setUserToken(data.token);
      setUser(data.user);

      // 💾 Persistance
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
    } catch (error: any) {
      throw new Error(error.message || "Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 LOGOUT
  const signOut = async () => {
    setUserToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(["userToken", "user"]);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        user,
        isLoading,
        restoreToken,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
