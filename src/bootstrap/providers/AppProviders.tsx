import { QueryProvider } from "@/src/bootstrap/providers/QueryProvider";
import { CoursesProvider } from "@/src/modules/courses/store/CoursesProvider";
import { NotificationPreferencesProvider } from "@/src/modules/notifications/store/NotificationPreferencesProvider";
import { WalletProvider } from "@/src/modules/portefeuille/store/WalletProvider";
import React from "react";

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

export default AppProviders;
