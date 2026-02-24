import React, { createContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "@/src/core/storage/storageKeys";
import { storageRepository } from "@/src/core/storage/storageRepository";
import { notificationService } from "@/src/modules/notifications/services/notificationService";
import {
  NotificationContextValue,
  NotificationPreferences,
} from "@/src/modules/notifications/types/notificationTypes";

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

        const storedPreferences =
          await storageRepository.getItem<NotificationPreferences>(
            STORAGE_KEYS.notificationPreferences,
          );

        if (storedPreferences) {
          setPreferences(storedPreferences);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const setSoundEnabled = async (value: boolean) => {
    const next = { ...preferences, soundEnabled: value };
    setPreferences(next);
    await storageRepository.setItem(STORAGE_KEYS.notificationPreferences, next);
  };

  const notifyPackageAccepted = async (courseSummary: string) => {
    await notificationService.notifyPackageAccepted(
      courseSummary,
      preferences.soundEnabled,
    );
  };

  const value = useMemo<NotificationContextValue>(
    () => ({
      preferences,
      isLoading,
      setSoundEnabled,
      notifyPackageAccepted,
    }),
    [isLoading, preferences],
  );

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
};
