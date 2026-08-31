export type Account = { number: number; name: string };

export type Voucher = {
  id: number;
  date: string;
  text: string;
  amountOre: number;
  vatContext: string;
  accounts: Account[];
  learningAreas: string[];
};

export type PublicCourse = {
  version: number;
  title: string;
  introduction: string;
  vouchers: Voucher[];
};

export type SubmittedEntry = {
  accountNumber: number;
  side: "debit" | "credit";
  amountOre: number;
};

export type CheckRequest = {
  voucherId: number;
  entries: SubmittedEntry[];
  attempt: number;
  requestHelp?: boolean;
};

export type CheckResult = {
  correct: boolean;
  balanced: boolean;
  message: string;
  hint?: string;
  explanation?: string;
  canAskForHelp?: boolean;
};

export type StudentProgress = {
  schemaVersion: 1;
  completedVoucherIds: number[];
  highestUnlockedVoucherId: number;
  attemptsByVoucher: Record<string, number>;
  hintsUsed: number;
  totalAttempts: number;
};
