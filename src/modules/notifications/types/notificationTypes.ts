export interface NotificationPreferences {
  soundEnabled: boolean;
}

export interface NotificationContextValue {
  preferences: NotificationPreferences;
  isLoading: boolean;
  setSoundEnabled: (value: boolean) => Promise<void>;
  notifyPackageAccepted: (courseSummary: string) => Promise<void>;
}
