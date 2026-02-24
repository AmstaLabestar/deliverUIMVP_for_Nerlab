import { useContext } from "react";
import { OfflineSyncContext } from "@/src/infrastructure/offline/OfflineSyncProvider";

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);

  if (!context) {
    throw new Error("useOfflineSync must be used inside OfflineSyncProvider");
  }

  return context;
};
