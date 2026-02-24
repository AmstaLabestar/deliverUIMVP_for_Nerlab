import React, { createContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "@/src/core/storage/storageKeys";
import { storageRepository } from "@/src/core/storage/storageRepository";
import { walletService } from "@/src/modules/portefeuille/services/walletService";
import {
  CourseSettlementInput,
  WalletContextValue,
  WalletState,
} from "@/src/modules/portefeuille/types/walletTypes";

const defaultWalletState: WalletState = {
  balance: 0,
  transactions: [],
};

export const WalletContext = createContext<WalletContextValue | undefined>(
  undefined,
);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<WalletState>(defaultWalletState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const storedState = await storageRepository.getItem<WalletState>(
          STORAGE_KEYS.walletState,
        );

        if (storedState) {
          setState(storedState);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void restore();
  }, []);

  const persistState = async (nextState: WalletState) => {
    setState(nextState);
    await storageRepository.setItem(STORAGE_KEYS.walletState, nextState);
  };

  const recharge = async (amount: number) => {
    const transaction = walletService.createRechargeTransaction(amount);
    const nextState = walletService.appendTransaction(state, transaction);
    await persistState(nextState);
  };

  const settleCompletedCourse = async (input: CourseSettlementInput) => {
    const credit = walletService.createCourseCreditTransaction(
      input.courseAmount,
      input.courseId,
    );
    const stateWithCredit = walletService.appendTransaction(state, credit);

    const debit = walletService.createCourseDebitTransaction(
      input.commissionAmount,
      input.courseId,
    );
    const nextState = walletService.appendTransaction(stateWithCredit, debit);

    await persistState(nextState);
  };

  const value = useMemo<WalletContextValue>(
    () => ({
      state,
      isLoading,
      recharge,
      settleCompletedCourse,
    }),
    [isLoading, state],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
