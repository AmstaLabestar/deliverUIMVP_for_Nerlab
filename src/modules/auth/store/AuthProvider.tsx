import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { logger } from "@/src/core/logger/logger";
import { STORAGE_KEYS } from "@/src/core/storage/storageKeys";
import { storageRepository } from "@/src/core/storage/storageRepository";
import { authService } from "@/src/modules/auth/services/authService";
import { authSessionRepository } from "@/src/modules/auth/services/authSessionRepository";
import {
  AuthContextValue,
  AuthSession,
  LoginCredentials,
} from "@/src/modules/auth/types/authTypes";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearUserScopedPersistence = useCallback(async () => {
    await Promise.all([
      authSessionRepository.clearAuthSession(),
      storageRepository.removeItems([
        STORAGE_KEYS.walletState,
        STORAGE_KEYS.notificationPreferences,
        STORAGE_KEYS.offlineQueue,
      ]),
    ]);
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const restoredSession = await authSessionRepository.getSession();

        if (!restoredSession) {
          setSession(null);
          return;
        }

        if (authSessionRepository.isSessionExpired(restoredSession)) {
          logger.info("auth_session_expired_during_restore");
          await clearUserScopedPersistence();
          setSession(null);
          return;
        }

        setSession(restoredSession);
      } catch (error) {
        logger.error("auth_restore_failed", error);
        await clearUserScopedPersistence();
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapAuth();
  }, [clearUserScopedPersistence]);

  useEffect(() => {
    const unsubscribe = authSessionRepository.subscribeToSessionInvalidation((reason) => {
      logger.warn("auth_session_invalidated", { reason });
      setSession(null);
      void clearUserScopedPersistence();
    });

    return unsubscribe;
  }, [clearUserScopedPersistence]);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const nextSession = await authService.signIn(credentials);
      setSession(nextSession);
      await authSessionRepository.setSession(nextSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setSession(null);
    await clearUserScopedPersistence();
  }, [clearUserScopedPersistence]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const expiresAtTimestamp = Date.parse(session.tokens.expiresAt);
    if (Number.isNaN(expiresAtTimestamp)) {
      void signOut();
      return;
    }

    const timeoutMs = expiresAtTimestamp - Date.now();
    if (timeoutMs <= 0) {
      void signOut();
      return;
    }

    const expirationTimeout = setTimeout(() => {
      void signOut();
    }, timeoutMs);

    return () => {
      clearTimeout(expirationTimeout);
    };
  }, [session, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      userToken: session?.tokens.accessToken ?? null,
      sessionExpiresAt: session?.tokens.expiresAt ?? null,
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: session ? !authSessionRepository.isSessionExpired(session) : false,
      signIn,
      signOut,
    }),
    [isLoading, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
