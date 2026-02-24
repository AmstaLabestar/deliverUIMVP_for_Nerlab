import * as Network from "expo-network";
import { NetworkStatus } from "@/src/infrastructure/network/networkStatusTypes";

const mapStateToStatus = (state: Network.NetworkState): NetworkStatus => {
  const isConnected = Boolean(state.isConnected);
  const isInternetReachable = state.isInternetReachable ?? isConnected;

  return {
    isConnected,
    isInternetReachable,
    isOffline: !(isConnected && isInternetReachable),
    type: state.type ?? Network.NetworkStateType.UNKNOWN,
    updatedAt: new Date().toISOString(),
  };
};

export const networkStatusService = {
  async getCurrentStatus(): Promise<NetworkStatus> {
    const state = await Network.getNetworkStateAsync();
    return mapStateToStatus(state);
  },

  subscribe(listener: (status: NetworkStatus) => void): () => void {
    const subscription = Network.addNetworkStateListener((state) => {
      listener(mapStateToStatus(state));
    });

    return () => {
      subscription.remove();
    };
  },
};
