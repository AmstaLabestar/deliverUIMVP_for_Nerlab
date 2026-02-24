import React, { createContext, useEffect, useMemo, useState } from "react";
import * as Network from "expo-network";
import { logger } from "@/src/core/logger/logger";
import { networkStatusService } from "@/src/infrastructure/network/networkStatusService";
import { NetworkStatus } from "@/src/infrastructure/network/networkStatusTypes";

type NetworkStatusContextValue = NetworkStatus & {
  refresh: () => Promise<void>;
};

const defaultStatus: NetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
  isOffline: false,
  type: Network.NetworkStateType.UNKNOWN,
  updatedAt: new Date(0).toISOString(),
};

export const NetworkStatusContext = createContext<NetworkStatusContextValue | undefined>(
  undefined,
);

export const NetworkStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<NetworkStatus>(defaultStatus);

  const refresh = async () => {
    try {
      const nextStatus = await networkStatusService.getCurrentStatus();
      setStatus(nextStatus);
    } catch (error) {
      logger.warn("network_status_refresh_failed", undefined, error);
    }
  };

  useEffect(() => {
    void refresh();

    const unsubscribe = networkStatusService.subscribe((nextStatus) => {
      setStatus(nextStatus);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<NetworkStatusContextValue>(
    () => ({
      ...status,
      refresh,
    }),
    [status],
  );

  return <NetworkStatusContext.Provider value={value}>{children}</NetworkStatusContext.Provider>;
};
