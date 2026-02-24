import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CUSTOM_SOUND_FILE = "delivery-alert.wav";

const initialize = async () => {
  await Notifications.requestPermissionsAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("course-events", {
      name: "Événements courses",
      importance: Notifications.AndroidImportance.HIGH,
      sound: CUSTOM_SOUND_FILE,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
};

const notifyPackageAccepted = async (courseSummary: string, soundEnabled: boolean) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Nouvelle course colis acceptée",
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
