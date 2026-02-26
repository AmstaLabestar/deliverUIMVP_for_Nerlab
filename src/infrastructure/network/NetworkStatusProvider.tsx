import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
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

const isSameStatus = (left: NetworkStatus, right: NetworkStatus): boolean => {
  return (
    left.isConnected === right.isConnected &&
    left.isInternetReachable === right.isInternetReachable &&
    left.isOffline === right.isOffline &&
    left.type === right.type
  );
};

export const NetworkStatusContext = createContext<NetworkStatusContextValue | undefined>(
  undefined,
);

export const NetworkStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<NetworkStatus>(defaultStatus);

  const refresh = useCallback(async () => {
    try {
      const nextStatus = await networkStatusService.getCurrentStatus();
      setStatus((previous) => (isSameStatus(previous, nextStatus) ? previous : nextStatus));
    } catch (error) {
      logger.warn("network_status_refresh_failed", undefined, error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void refresh();

    const unsubscribe = networkStatusService.subscribe((nextStatus) => {
      if (!isMounted) {
        return;
      }

      setStatus((previous) => (isSameStatus(previous, nextStatus) ? previous : nextStatus));
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [refresh]);

  const value = useMemo<NetworkStatusContextValue>(
    () => ({
      ...status,
      refresh,
    }),
    [refresh, status],
  );

  return <NetworkStatusContext.Provider value={value}>{children}</NetworkStatusContext.Provider>;
};
