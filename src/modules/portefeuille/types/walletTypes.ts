export type WalletTransactionType = "credit" | "debit";

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  label: string;
  createdAt: string;
  courseId?: string;
}

export interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
}

export interface CourseSettlementInput {
  courseId: string;
  courseAmount: number;
  commissionAmount: number;
}

export interface WalletStateContextValue {
  state: WalletState;
  isLoading: boolean;
}

export interface WalletActionsContextValue {
  recharge: (amount: number) => Promise<void>;
  settleCompletedCourse: (input: CourseSettlementInput) => Promise<void>;
}

export interface WalletContextValue
  extends WalletStateContextValue,
    WalletActionsContextValue {}
