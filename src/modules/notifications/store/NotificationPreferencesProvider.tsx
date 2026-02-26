import { logger } from "@/src/core/logger/logger";
import { STORAGE_KEYS } from "@/src/core/storage/storageKeys";
import { storageRepository } from "@/src/core/storage/storageRepository";
import { notificationService } from "@/src/modules/notifications/services/notificationService";
import {
  NotificationActionsContextValue,
  NotificationPreferences,
  NotificationStateContextValue,
} from "@/src/modules/notifications/types/notificationTypes";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";

const notificationPreferencesSchema = z.object({
  soundEnabled: z.boolean(),
});

const defaultPreferences: NotificationPreferences = {
  soundEnabled: true,
};

export const NotificationPreferencesStateContext = createContext<
  NotificationStateContextValue | undefined
>(undefined);

export const NotificationPreferencesActionsContext = createContext<
  NotificationActionsContextValue | undefined
>(undefined);

export const NotificationPreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const soundEnabledRef = useRef(defaultPreferences.soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = preferences.soundEnabled;
  }, [preferences.soundEnabled]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await notificationService.initialize();

        const raw = await storageRepository.getItem<unknown>(
          STORAGE_KEYS.notificationPreferences,
        );

        if (!isMounted || !raw) {
          return;
        }

        const parsed = notificationPreferencesSchema.safeParse(raw);
        if (parsed.success) {
          setPreferences(parsed.data);
          soundEnabledRef.current = parsed.data.soundEnabled;
        } else {
          logger.warn("notification_preferences_storage_invalid", {
            issues: parsed.error.issues,
          });
          await storageRepository.removeItem(STORAGE_KEYS.notificationPreferences);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const setSoundEnabled = useCallback(async (value: boolean) => {
    setPreferences((prev) => {
      if (prev.soundEnabled === value) {
        return prev;
      }

      const next = { ...prev, soundEnabled: value };
      soundEnabledRef.current = value;
      void storageRepository.setItem(STORAGE_KEYS.notificationPreferences, next);
      return next;
    });
  }, []);

  const notifyPackageAccepted = useCallback(async (courseSummary: string) => {
    await notificationService.notifyPackageAccepted(
      courseSummary,
      soundEnabledRef.current,
    );
  }, []);

  const stateValue = useMemo<NotificationStateContextValue>(
    () => ({
      preferences,
      isLoading,
    }),
    [isLoading, preferences],
  );

  const actionsValue = useMemo<NotificationActionsContextValue>(
    () => ({
      setSoundEnabled,
      notifyPackageAccepted,
    }),
    [notifyPackageAccepted, setSoundEnabled],
  );

  return (
    <NotificationPreferencesStateContext.Provider value={stateValue}>
      <NotificationPreferencesActionsContext.Provider value={actionsValue}>
        {children}
      </NotificationPreferencesActionsContext.Provider>
    </NotificationPreferencesStateContext.Provider>
  );
};
