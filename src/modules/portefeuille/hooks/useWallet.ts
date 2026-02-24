import { useContext } from "react";
import { WalletContext } from "@/src/modules/portefeuille/store/WalletProvider";

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }

  return context;
};
