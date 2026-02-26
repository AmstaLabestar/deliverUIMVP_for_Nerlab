import { APP_CONFIG } from "@/src/core/config/env";
import { AppError } from "@/src/core/errors/AppError";
import { httpClient } from "@/src/core/http/httpClient";
import { logger } from "@/src/core/logger/logger";
import { parseWithSchema } from "@/src/core/validation/parseWithSchema";
import {
  LoginApiResponse,
  loginApiResponseSchema,
  loginCredentialsSchema,
} from "@/src/modules/auth/schemas/authSchemas";
import {
  AuthSession,
  AuthTokens,
  AuthUser,
  DriverProfile,
  LoginCredentials,
  VehicleType,
} from "@/src/modules/auth/types/authTypes";
import { resolveTokenTtlSeconds } from "@/src/modules/auth/utils/resolveTokenTtl";
import { buildId } from "@/src/shared/utils/id";

type BackendDriver = {
  id?: string;
  nom?: string;
  telephone?: string;
  niveauEtoile?: number;
  typeVehicule?: string;
  totalCoursesCompletees?: number;
  coursesPayees?: number;
};

type BackendUser = {
  id?: string;
  telephone?: string;
  livreur?: BackendDriver;
};

const fallbackAccounts: Record<
  string,
  {
    password: string;
    nom: string;
    typeVehicule: VehicleType;
  }
> = {
  "77123456": { password: "1234", nom: "Moussa Diop", typeVehicule: "moto" },
  "77654321": { password: "1234", nom: "Awa Kabore", typeVehicule: "voiture" },
};

const mapVehicleType = (value?: string): VehicleType => {
  if (
    value === "moto" ||
    value === "voiture" ||
    value === "fourgonnette" ||
    value === "tricycle"
  ) {
    return value;
  }

  return "moto";
};

const mapDriver = (userTelephone: string, driver?: BackendDriver): DriverProfile => {
  return {
    id: driver?.id ?? buildId("driver"),
    nom: driver?.nom ?? "Livreur OGA",
    telephone: driver?.telephone ?? userTelephone,
    niveauEtoile: driver?.niveauEtoile ?? 4.8,
    typeVehicule: mapVehicleType(driver?.typeVehicule),
    totalCoursesCompletees: driver?.totalCoursesCompletees ?? 0,
    coursesPayees: driver?.coursesPayees ?? 0,
  };
};

const mapAuthUser = (payload: BackendUser, fallbackTelephone: string): AuthUser => {
  const telephone = payload.telephone ?? fallbackTelephone;

  return {
    id: payload.id ?? buildId("user"),
    telephone,
    livreur: mapDriver(telephone, payload.livreur),
  };
};



const buildTokensFromPayload = (payload: LoginApiResponse): AuthTokens => {
  const accessToken = payload.accessToken ?? payload.token;
  if (!accessToken) {
    throw new AppError("validation_error", "Reponse auth invalide: access token manquant.");
  }

  const expiresAt =
    payload.expiresAt ??
    new Date(Date.now() + resolveTokenTtlSeconds(payload) * 1000).toISOString();
  const refreshToken = payload.refreshToken ?? accessToken;

  if (!payload.refreshToken) {
    logger.warn("auth_missing_refresh_token", {
      hint: "refreshToken absent in login response, using compatibility fallback",
    });
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
};

const signInWithFallback = async (
  credentials: LoginCredentials,
): Promise<AuthSession> => {
  const account = fallbackAccounts[credentials.telephone];

  if (!account || account.password !== credentials.password) {
    throw new AppError("unauthorized", "Numero ou mot de passe incorrect.");
  }

  const user: AuthUser = {
    id: buildId("user"),
    telephone: credentials.telephone,
    livreur: {
      id: buildId("driver"),
      nom: account.nom,
      telephone: credentials.telephone,
      niveauEtoile: 4.8,
      typeVehicule: account.typeVehicule,
      totalCoursesCompletees: 154,
      coursesPayees: 148,
    },
  };

  const now = Date.now();

  return {
    tokens: {
      accessToken: `mock_access_${now}`,
      refreshToken: `mock_refresh_${now}`,
      expiresAt: new Date(now + APP_CONFIG.auth.accessTokenTtlSeconds * 1000).toISOString(),
    },
    user,
  };
};

const signIn = async (rawCredentials: LoginCredentials): Promise<AuthSession> => {
  const credentials = parseWithSchema(
    loginCredentialsSchema,
    rawCredentials,
    "Credentials invalides",
  );

  try {
    const rawPayload = await httpClient.post<unknown, LoginCredentials>(
      "/auth/login",
      credentials,
      {
        skipAuthHeader: true,
        skipAuthRefresh: true,
      },
    );

    const payload = parseWithSchema(
      loginApiResponseSchema,
      rawPayload,
      "Reponse login invalide",
    );

    return {
      tokens: buildTokensFromPayload(payload),
      user: mapAuthUser(payload.user ?? {}, credentials.telephone),
    };
  } catch (error) {
    if (
      error instanceof AppError &&
      error.code === "network_error" &&
      APP_CONFIG.auth.enableMockAuthFallback
    ) {
      logger.warn("auth_network_error_using_fallback", {
        environment: APP_CONFIG.environment,
      });
      return signInWithFallback(credentials);
    }

    throw error;
  }
};

export const authService = {
  signIn,
};
