import Constants from "expo-constants";
import { Platform } from "react-native";
import { logger } from "@/src/core/logger/logger";

const CUSTOM_SOUND_FILE = "delivery-alert.wav";

type NotificationsModule = typeof import("expo-notifications");

const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let initializePromise: Promise<void> | null = null;

const loadNotificationsModule = async (): Promise<NotificationsModule | null> => {
  if (isExpoGo) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications").catch((error) => {
      logger.warn("notifications_module_load_failed", undefined, error);
      return null;
    });
  }

  return notificationsModulePromise;
};

const initialize = async () => {
  if (!initializePromise) {
    initializePromise = (async () => {
      const Notifications = await loadNotificationsModule();
      if (!Notifications) {
        return;
      }

      await Notifications.requestPermissionsAsync();

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("course-events", {
          name: "Evenements courses",
          importance: Notifications.AndroidImportance.HIGH,
          sound: CUSTOM_SOUND_FILE,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    })();
  }

  await initializePromise;
};

const notifyPackageAccepted = async (
  courseSummary: string,
  soundEnabled: boolean,
) => {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Nouvelle course colis acceptee",
      body: courseSummary,
      sound: soundEnabled ? CUSTOM_SOUND_FILE : undefined,
      data: { type: "package_accepted" },
    },
    trigger: null,
  });
};

export const notificationService = {
  initialize,
  notifyPackageAccepted,
};
