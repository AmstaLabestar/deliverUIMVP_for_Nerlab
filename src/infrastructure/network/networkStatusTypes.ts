import { NetworkStateType } from "expo-network";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  isOffline: boolean;
  type: NetworkStateType;
  updatedAt: string;
}
