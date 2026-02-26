import { logger } from "@/src/core/logger/logger";
import { STORAGE_KEYS } from "@/src/core/storage/storageKeys";
import { storageRepository } from "@/src/core/storage/storageRepository";
import { notificationService } from "@/src/modules/notifications/services/notificationService";
import {
  NotificationContextValue,
  NotificationPreferences,
} from "@/src/modules/notifications/types/notificationTypes";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";

const notificationPreferencesSchema = z.object({
  soundEnabled: z.boolean(),
});

const defaultPreferences: NotificationPreferences = {
  soundEnabled: true,
};

export const NotificationPreferencesContext = createContext<
  NotificationContextValue | undefined
>(undefined);

export const NotificationPreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await notificationService.initialize();

        const raw = await storageRepository.getItem<unknown>(
          STORAGE_KEYS.notificationPreferences,
        );

        if (raw) {
          const parsed = notificationPreferencesSchema.safeParse(raw);
          if (parsed.success) {
            setPreferences(parsed.data);
          } else {
            logger.warn("notification_preferences_storage_invalid", {
              issues: parsed.error.issues,
            });
            await storageRepository.removeItem(STORAGE_KEYS.notificationPreferences);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const setSoundEnabled = useCallback(async (value: boolean) => {
    setPreferences((prev) => {
      const next = { ...prev, soundEnabled: value };
      void storageRepository.setItem(STORAGE_KEYS.notificationPreferences, next);
      return next;
    });
  }, []);

  const notifyPackageAccepted = useCallback(async (courseSummary: string) => {
    const currentPrefs = preferences;
    await notificationService.notifyPackageAccepted(
      courseSummary,
      currentPrefs.soundEnabled,
    );
  }, [preferences]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      preferences,
      isLoading,
      setSoundEnabled,
      notifyPackageAccepted,
    }),
    [isLoading, preferences, setSoundEnabled, notifyPackageAccepted],
  );

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
};
