import { APP_CONFIG } from "@/src/core/config/env";
import { logger } from "@/src/core/logger/logger";
import { secureStorageRepository } from "@/src/core/storage/secureStorageRepository";
import { SECURE_STORAGE_KEYS } from "@/src/core/storage/secureStorageKeys";
import { STORAGE_KEYS } from "@/src/core/storage/storageKeys";
import { storageRepository } from "@/src/core/storage/storageRepository";
import { parseWithSchema } from "@/src/core/validation/parseWithSchema";
import { authSessionSchema } from "@/src/modules/auth/schemas/authSchemas";
import { AuthSession, AuthTokens, AuthUser } from "@/src/modules/auth/types/authTypes";

type LegacyAuthSession = {
  token: string;
  user: AuthUser;
};

type SessionInvalidationReason = "refresh_failed" | "session_expired";

type SessionInvalidationListener = (reason: SessionInvalidationReason) => void;

let cachedSession: AuthSession | null = null;
let isHydrated = false;
let hydrationPromise: Promise<void> | null = null;
const listeners = new Set<SessionInvalidationListener>();

const isLegacyAuthSession = (value: unknown): value is LegacyAuthSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LegacyAuthSession>;
  return typeof candidate.token === "string" && typeof candidate.user === "object";
};

const isSessionExpired = (session: AuthSession): boolean => {
  const expirationTimestamp = Date.parse(session.tokens.expiresAt);
  if (Number.isNaN(expirationTimestamp)) {
    return true;
  }

  return expirationTimestamp <= Date.now();
};

const mapLegacyToSession = (legacySession: LegacyAuthSession): AuthSession => {
  const now = Date.now();

  return {
    tokens: {
      accessToken: legacySession.token,
      refreshToken: legacySession.token,
      expiresAt: new Date(now + APP_CONFIG.auth.accessTokenTtlSeconds * 1000).toISOString(),
    },
    user: legacySession.user,
  };
};

const persistSession = async (session: AuthSession): Promise<void> => {
  cachedSession = session;
  isHydrated = true;

  await Promise.all([
    secureStorageRepository.setItem(SECURE_STORAGE_KEYS.authSession, session),
    storageRepository.removeItem(STORAGE_KEYS.authSession),
  ]);
};

const clearAuthSession = async (): Promise<void> => {
  cachedSession = null;
  isHydrated = true;

  await Promise.all([
    secureStorageRepository.removeItem(SECURE_STORAGE_KEYS.authSession),
    storageRepository.removeItem(STORAGE_KEYS.authSession),
  ]);
};

const ensureHydrated = async (): Promise<void> => {
  if (isHydrated) {
    return;
  }

  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      const secureSessionRaw = await secureStorageRepository.getItem<unknown>(
        SECURE_STORAGE_KEYS.authSession,
      );

      if (secureSessionRaw) {
        try {
          cachedSession = parseWithSchema(
            authSessionSchema,
            secureSessionRaw,
            "Session auth invalide en stockage securise",
          );
          isHydrated = true;
          return;
        } catch (error) {
          logger.warn("auth_secure_session_invalid_payload", undefined, error);
          await secureStorageRepository.removeItem(SECURE_STORAGE_KEYS.authSession);
        }
      }

      const legacySession = await storageRepository.getItem<LegacyAuthSession>(
        STORAGE_KEYS.authSession,
      );

      if (legacySession && isLegacyAuthSession(legacySession)) {
        const migratedSession = mapLegacyToSession(legacySession);
        await persistSession(migratedSession);
        logger.info("auth_legacy_session_migrated");
      } else {
        cachedSession = null;
      }

      await storageRepository.removeItem(STORAGE_KEYS.authSession);
      isHydrated = true;
    })().finally(() => {
      hydrationPromise = null;
    });
  }

  await hydrationPromise;
};

const emitInvalidation = (reason: SessionInvalidationReason): void => {
  listeners.forEach((listener) => {
    try {
      listener(reason);
    } catch (error) {
      logger.error("auth_invalidation_listener_failed", error);
    }
  });
};

const subscribeToSessionInvalidation = (
  listener: SessionInvalidationListener,
): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSession = async (): Promise<AuthSession | null> => {
  await ensureHydrated();
  return cachedSession;
};

const setSession = async (session: AuthSession): Promise<void> => {
  await persistSession(session);
};

const updateTokens = async (tokens: AuthTokens): Promise<AuthSession | null> => {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const nextSession: AuthSession = {
    ...session,
    tokens,
  };

  await setSession(nextSession);
  return nextSession;
};

const invalidateSession = async (reason: SessionInvalidationReason): Promise<void> => {
  await clearAuthSession();
  emitInvalidation(reason);
};

export const authSessionRepository = {
  isSessionExpired,
  subscribeToSessionInvalidation,
  getSession,
  setSession,
  clearAuthSession,
  updateTokens,
  invalidateSession,
};
