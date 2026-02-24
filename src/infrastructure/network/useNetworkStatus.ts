import { useContext } from "react";
import { NetworkStatusContext } from "@/src/infrastructure/network/NetworkStatusProvider";

export const useNetworkStatus = () => {
  const context = useContext(NetworkStatusContext);

  if (!context) {
    throw new Error("useNetworkStatus must be used inside NetworkStatusProvider");
  }

  return context;
};
