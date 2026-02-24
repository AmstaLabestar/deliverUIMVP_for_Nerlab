import { buildId } from "@/src/shared/utils/id";
import {
  WalletState,
  WalletTransaction,
  WalletTransactionType,
} from "@/src/modules/portefeuille/types/walletTypes";

const buildTransaction = (input: {
  type: WalletTransactionType;
  amount: number;
  label: string;
  courseId?: string;
}): WalletTransaction => {
  return {
    id: buildId("txn"),
    type: input.type,
    amount: input.amount,
    label: input.label,
    createdAt: new Date().toISOString(),
    courseId: input.courseId,
  };
};

const appendTransaction = (
  currentState: WalletState,
  transaction: WalletTransaction,
): WalletState => {
  const nextBalance =
    transaction.type === "credit"
      ? currentState.balance + transaction.amount
      : currentState.balance - transaction.amount;

  return {
    balance: nextBalance,
    transactions: [transaction, ...currentState.transactions],
  };
};

export const walletService = {
  createRechargeTransaction: (amount: number) =>
    buildTransaction({
      type: "credit",
      amount,
      label: "Recharge du portefeuille",
    }),

  createCourseCreditTransaction: (amount: number, courseId: string) =>
    buildTransaction({
      type: "credit",
      amount,
      label: "Gain course livrée",
      courseId,
    }),

  createCourseDebitTransaction: (amount: number, courseId: string) =>
    buildTransaction({
      type: "debit",
      amount,
      label: "Débit automatique (commission course)",
      courseId,
    }),

  appendTransaction,
};
