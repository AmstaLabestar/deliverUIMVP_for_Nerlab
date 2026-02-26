import { useContext, useMemo } from "react";
import {
  WalletActionsContext,
  WalletStateContext,
} from "@/src/modules/portefeuille/store/WalletProvider";

export const useWalletState = () => {
  const context = useContext(WalletStateContext);

  if (!context) {
    throw new Error("useWalletState must be used inside WalletProvider");
  }

  return context;
};

export const useWalletActions = () => {
  const context = useContext(WalletActionsContext);

  if (!context) {
    throw new Error("useWalletActions must be used inside WalletProvider");
  }

  return context;
};

export const useWallet = () => {
  const state = useWalletState();
  const actions = useWalletActions();

  return useMemo(
    () => ({
      state: state.state,
      isLoading: state.isLoading,
      recharge: actions.recharge,
      settleCompletedCourse: actions.settleCompletedCourse,
    }),
    [actions, state],
  );
};
