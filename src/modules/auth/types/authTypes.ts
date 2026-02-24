export type VehicleType = "moto" | "voiture" | "fourgonnette" | "tricycle";

export interface DriverProfile {
  id: string;
  nom: string;
  telephone: string;
  niveauEtoile: number;
  typeVehicule: VehicleType;
  totalCoursesCompletees: number;
  coursesPayees: number;
}

export interface AuthUser {
  id: string;
  telephone: string;
  livreur: DriverProfile;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthSession {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface LoginCredentials {
  telephone: string;
  password: string;
}

export interface AuthContextValue {
  userToken: string | null;
  sessionExpiresAt: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}
