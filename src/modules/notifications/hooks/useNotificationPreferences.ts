import { useContext } from "react";
import { NotificationPreferencesContext } from "@/src/modules/notifications/store/NotificationPreferencesProvider";

export const useNotificationPreferences = () => {
  const context = useContext(NotificationPreferencesContext);

  if (!context) {
    throw new Error(
      "useNotificationPreferences must be used inside NotificationPreferencesProvider",
    );
  }

  return context;
};
