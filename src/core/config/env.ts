import Constants from "expo-constants";

export type AppEnvironment = "development" | "staging" | "production";
export type LogLevel = "debug" | "info" | "warn" | "error";

type AppExtraConfig = {
  appEnv?: string;
  apiBaseUrl?: string;
  enableMockAuthFallback?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtraConfig;

const normalizeEnvironment = (value?: string): AppEnvironment | null => {
  if (value === "development" || value === "staging" || value === "production") {
    return value;
  }

  return null;
};

const resolveEnvironment = (): AppEnvironment => {
  const fromPublicEnv = normalizeEnvironment(process.env.EXPO_PUBLIC_APP_ENV);
  if (fromPublicEnv) {
    return fromPublicEnv;
  }

  const fromExpoExtra = normalizeEnvironment(extra.appEnv);
  if (fromExpoExtra) {
    return fromExpoExtra;
  }

  return __DEV__ ? "development" : "production";
};

const resolveApiBaseUrl = (): string => {
  const fromPublicEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const fromExpoExtra = extra.apiBaseUrl?.trim();
  const baseUrl = fromPublicEnv || fromExpoExtra || "http://192.168.1.108:3000/api";

  return baseUrl.replace(/\/+$/, "");
};

const resolveEnableMockAuthFallback = (environment: AppEnvironment): boolean => {
  if (environment === "production") {
    return false;
  }

  const fromPublicEnv = process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH_FALLBACK;
  if (fromPublicEnv === "true") {
    return true;
  }

  if (fromPublicEnv === "false") {
    return false;
  }

  if (typeof extra.enableMockAuthFallback === "boolean") {
    return extra.enableMockAuthFallback;
  }

  return __DEV__;
};

const environment = resolveEnvironment();

export const APP_CONFIG = {
  environment,
  apiBaseUrl: resolveApiBaseUrl(),
  auth: {
    accessTokenTtlSeconds: 15 * 60,
    enableMockAuthFallback: resolveEnableMockAuthFallback(environment),
  },
  logging: {
    level: (environment === "production" ? "info" : "debug") as LogLevel,
  },
} as const;

export const isProductionEnvironment = APP_CONFIG.environment === "production";
