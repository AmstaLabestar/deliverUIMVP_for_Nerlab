import React from "react";
import { QueryProvider } from "@/src/app/providers/QueryProvider";
import { CoursesProvider } from "@/src/modules/courses/store/CoursesProvider";
import { NotificationPreferencesProvider } from "@/src/modules/notifications/store/NotificationPreferencesProvider";
import { WalletProvider } from "@/src/modules/portefeuille/store/WalletProvider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <NotificationPreferencesProvider>
        <WalletProvider>
          <CoursesProvider>{children}</CoursesProvider>
        </WalletProvider>
      </NotificationPreferencesProvider>
    </QueryProvider>
  );
};
