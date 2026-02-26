export interface NotificationPreferences {
  soundEnabled: boolean;
}

export interface NotificationStateContextValue {
  preferences: NotificationPreferences;
  isLoading: boolean;
}

export interface NotificationActionsContextValue {
  setSoundEnabled: (value: boolean) => Promise<void>;
  notifyPackageAccepted: (courseSummary: string) => Promise<void>;
}

export interface NotificationContextValue
  extends NotificationStateContextValue,
    NotificationActionsContextValue {}
