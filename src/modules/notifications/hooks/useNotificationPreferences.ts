import { useContext, useMemo } from "react";
import {
  NotificationPreferencesActionsContext,
  NotificationPreferencesStateContext,
} from "@/src/modules/notifications/store/NotificationPreferencesProvider";

export const useNotificationPreferencesState = () => {
  const context = useContext(NotificationPreferencesStateContext);

  if (!context) {
    throw new Error(
      "useNotificationPreferencesState must be used inside NotificationPreferencesProvider",
    );
  }

  return context;
};

export const useNotificationPreferencesActions = () => {
  const context = useContext(NotificationPreferencesActionsContext);

  if (!context) {
    throw new Error(
      "useNotificationPreferencesActions must be used inside NotificationPreferencesProvider",
    );
  }

  return context;
};

export const useNotificationPreferences = () => {
  const state = useNotificationPreferencesState();
  const actions = useNotificationPreferencesActions();

  return useMemo(
    () => ({
      preferences: state.preferences,
      isLoading: state.isLoading,
      setSoundEnabled: actions.setSoundEnabled,
      notifyPackageAccepted: actions.notifyPackageAccepted,
    }),
    [actions, state],
  );
};
