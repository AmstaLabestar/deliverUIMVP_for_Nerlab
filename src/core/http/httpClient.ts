import { APP_CONFIG } from "@/src/core/config/env";
import { AppError } from "@/src/core/errors/AppError";
import { logger } from "@/src/core/logger/logger";
import { parseWithSchema } from "@/src/core/validation/parseWithSchema";
import {
  refreshTokenRequestSchema,
  RefreshTokenResponse,
  refreshTokenResponseSchema,
} from "@/src/modules/auth/schemas/authSchemas";
import { authSessionRepository } from "@/src/modules/auth/services/authSessionRepository";
import { AuthTokens } from "@/src/modules/auth/types/authTypes";
import { resolveTokenTtlSeconds } from "@/src/modules/auth/utils/resolveTokenTtl";
import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from "axios";

type RequestOptions = {
  token?: string;
  headers?: Record<string, string>;
  skipAuthHeader?: boolean;
  skipAuthRefresh?: boolean;
  signal?: AbortSignal;
  retryCount?: number;
};

type ApiErrorPayload = {
  message?: string;
};

type AuthAwareRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuthHeader?: boolean;
  skipAuthRefresh?: boolean;
};

const API_TIMEOUT_MS = 15_000;
const BASE_RETRY_DELAY_MS = 600;
const MAX_RETRY_DELAY_MS = 5_000;

const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const parseApiErrorMessage = (error: AxiosError<ApiErrorPayload>): string => {
  const payload = error.response?.data;
  if (payload && typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message.trim();
  }

  if (typeof error.response?.status === "number") {
    return `Erreur API (${error.response.status})`;
  }

  return "Impossible de contacter le serveur.";
};

const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    if (error.code === "ERR_CANCELED") {
      return new AppError("network_error", "Requete annulee.", error);
    }

    const status = error.response?.status;
    const message = parseApiErrorMessage(error);

    if (status === 401) {
      return new AppError("unauthorized", message, error);
    }

    if (status === 400 || status === 422) {
      return new AppError("validation_error", message, error);
    }

    return new AppError("network_error", message, error);
  }

  return new AppError("unknown_error", "Une erreur inattendue est survenue.", error);
};

const buildRefreshedTokens = (
  payload: RefreshTokenResponse,
  currentRefreshToken: string,
): AuthTokens => {
  const accessToken = payload.accessToken ?? payload.token;

  if (!accessToken) {
    throw new AppError("validation_error", "Refresh invalide: access token manquant.");
  }

  const expiresAt =
    payload.expiresAt ??
    new Date(Date.now() + resolveTokenTtlSeconds(payload) * 1000).toISOString();

  return {
    accessToken,
    refreshToken: payload.refreshToken ?? currentRefreshToken,
    expiresAt,
  };
};

const toAxiosHeaders = (headers: unknown): AxiosHeaders => {
  return AxiosHeaders.from((headers ?? {}) as Record<string, string>);
};

const isTransientNetworkError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (error.code === "ERR_CANCELED") {
    return false;
  }

  if (!error.response) {
    return true;
  }

  const status = error.response.status;
  return status >= 500 && status < 600;
};

const waitFor = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const resolveRetryDelay = (attempt: number): number => {
  const delay = BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempt - 1);
  return Math.min(delay, MAX_RETRY_DELAY_MS);
};

const runWithRetry = async <T>(
  operation: () => Promise<T>,
  retryCount: number,
): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      if (attempt > retryCount || !isTransientNetworkError(error)) {
        throw error;
      }

      logger.warn("http_retry_attempt", {
        attempt,
        retryCount,
      });

      await waitFor(resolveRetryDelay(attempt));
    }
  }
};

let refreshRequestPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const session = await authSessionRepository.getSession();
  if (!session) {
    throw new AppError("unauthorized", "Session introuvable.");
  }

  const requestBody = parseWithSchema(
    refreshTokenRequestSchema,
    { refreshToken: session.tokens.refreshToken },
    "Payload refresh invalide",
  );

  try {
    const response = await refreshClient.post<unknown>("/auth/refresh", requestBody);
    const payload = parseWithSchema(
      refreshTokenResponseSchema,
      response.data,
      "Reponse refresh invalide",
    );
    const nextTokens = buildRefreshedTokens(payload, session.tokens.refreshToken);
    const updatedSession = await authSessionRepository.updateTokens(nextTokens);

    if (!updatedSession) {
      throw new AppError("unauthorized", "Session introuvable apres refresh.");
    }

    logger.info("auth_refresh_succeeded");
    return nextTokens.accessToken;
  } catch (error) {
    logger.warn("auth_refresh_failed", undefined, error);
    await authSessionRepository.invalidateSession("refresh_failed");
    throw new AppError("unauthorized", "Session expiree. Veuillez vous reconnecter.", error);
  }
};

const runRefreshWithLock = async (): Promise<string> => {
  if (!refreshRequestPromise) {
    refreshRequestPromise = refreshAccessToken().finally(() => {
      refreshRequestPromise = null;
    });
  }

  return refreshRequestPromise;
};

apiClient.interceptors.request.use(async (config) => {
  const requestConfig = config as AuthAwareRequestConfig;

  if (requestConfig.skipAuthHeader) {
    return config;
  }

  const hasAuthorizationHeader =
    Boolean((config.headers as Record<string, unknown> | undefined)?.Authorization) ||
    Boolean((config.headers as Record<string, unknown> | undefined)?.authorization);

  if (hasAuthorizationHeader) {
    return config;
  }

  const session = await authSessionRepository.getSession();
  if (!session?.tokens.accessToken) {
    return config;
  }

  const headers = toAxiosHeaders(config.headers);
  headers.set("Authorization", `Bearer ${session.tokens.accessToken}`);
  config.headers = headers;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const requestConfig = (error.config ?? {}) as AuthAwareRequestConfig;
    const status = error.response?.status;

    if (status === 401 && !requestConfig._retry && !requestConfig.skipAuthRefresh) {
      requestConfig._retry = true;

      const refreshedAccessToken = await runRefreshWithLock();
      const headers = toAxiosHeaders(requestConfig.headers);
      headers.set("Authorization", `Bearer ${refreshedAccessToken}`);
      requestConfig.headers = headers;

      return apiClient(requestConfig);
    }

    throw toAppError(error);
  },
);

const buildRequestConfig = (options?: RequestOptions): AuthAwareRequestConfig => {
  const headers: Record<string, string> = {
    ...(options?.headers ?? {}),
  };

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return {
    headers,
    signal: options?.signal,
    skipAuthHeader: options?.skipAuthHeader,
    skipAuthRefresh: options?.skipAuthRefresh,
  };
};

const resolveRetryCount = (method: "get" | "post", options?: RequestOptions): number => {
  if (typeof options?.retryCount === "number") {
    return Math.max(0, options.retryCount);
  }

  if (method === "get") {
    return 2;
  }

  return 0;
};

export const httpClient = {
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    try {
      const retryCount = resolveRetryCount("get", options);
      const response = await runWithRetry(
        () => apiClient.get<T>(url, buildRequestConfig(options)),
        retryCount,
      );
      return response.data;
    } catch (error) {
      throw toAppError(error);
    }
  },

  async post<TResponse, TBody>(
    url: string,
    body: TBody,
    options?: RequestOptions,
  ): Promise<TResponse> {
    try {
      const retryCount = resolveRetryCount("post", options);
      const response = await runWithRetry(
        () => apiClient.post<TResponse>(url, body, buildRequestConfig(options)),
        retryCount,
      );
      return response.data;
    } catch (error) {
      throw toAppError(error);
    }
  },
};
