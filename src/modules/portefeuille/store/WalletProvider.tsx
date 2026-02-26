import { logger } from "@/src/core/logger/logger";
import { STORAGE_KEYS } from "@/src/core/storage/storageKeys";
import { storageRepository } from "@/src/core/storage/storageRepository";
import { walletService } from "@/src/modules/portefeuille/services/walletService";
import {
  CourseSettlementInput,
  WalletActionsContextValue,
  WalletState,
  WalletStateContextValue,
} from "@/src/modules/portefeuille/types/walletTypes";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { z } from "zod";

const walletTransactionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["credit", "debit"]),
  amount: z.number(),
  label: z.string(),
  createdAt: z.string(),
  courseId: z.string().optional(),
});

const walletStateSchema = z.object({
  balance: z.number(),
  transactions: z.array(walletTransactionSchema),
});

const defaultWalletState: WalletState = {
  balance: 0,
  transactions: [],
};

export const WalletStateContext = createContext<
  WalletStateContextValue | undefined
>(undefined);

export const WalletActionsContext = createContext<
  WalletActionsContextValue | undefined
>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<WalletState>(defaultWalletState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restore = async () => {
      try {
        const raw = await storageRepository.getItem<unknown>(
          STORAGE_KEYS.walletState,
        );

        if (!isMounted || !raw) {
          return;
        }

        const parsed = walletStateSchema.safeParse(raw);
        if (parsed.success) {
          setState(parsed.data);
        } else {
          logger.warn("wallet_storage_invalid", { issues: parsed.error.issues });
          await storageRepository.removeItem(STORAGE_KEYS.walletState);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void restore();

    return () => {
      isMounted = false;
    };
  }, []);

  const recharge = useCallback(async (amount: number) => {
    setState((prev) => {
      const transaction = walletService.createRechargeTransaction(amount);
      const nextState = walletService.appendTransaction(prev, transaction);
      void storageRepository.setItem(STORAGE_KEYS.walletState, nextState);
      return nextState;
    });
  }, []);

  const settleCompletedCourse = useCallback(async (input: CourseSettlementInput) => {
    setState((prev) => {
      const credit = walletService.createCourseCreditTransaction(
        input.courseAmount,
        input.courseId,
      );
      const stateWithCredit = walletService.appendTransaction(prev, credit);

      const debit = walletService.createCourseDebitTransaction(
        input.commissionAmount,
        input.courseId,
      );
      const nextState = walletService.appendTransaction(stateWithCredit, debit);
      void storageRepository.setItem(STORAGE_KEYS.walletState, nextState);
      return nextState;
    });
  }, []);

  const stateValue = useMemo<WalletStateContextValue>(
    () => ({
      state,
      isLoading,
    }),
    [isLoading, state],
  );

  const actionsValue = useMemo<WalletActionsContextValue>(
    () => ({
      recharge,
      settleCompletedCourse,
    }),
    [recharge, settleCompletedCourse],
  );

  return (
    <WalletStateContext.Provider value={stateValue}>
      <WalletActionsContext.Provider value={actionsValue}>
        {children}
      </WalletActionsContext.Provider>
    </WalletStateContext.Provider>
  );
};
