import type { StudentProgress } from "../domain/types";

const STORAGE_KEY = "bogfoeringstraener.progress.v1";

export const emptyProgress = (): StudentProgress => ({
  schemaVersion: 1,
  completedVoucherIds: [],
  highestUnlockedVoucherId: 1,
  attemptsByVoucher: {},
  hintsUsed: 0,
  totalAttempts: 0,
});

export class ProgressRepository {
  constructor(private readonly storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = window.localStorage) {}

  load(): StudentProgress {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return emptyProgress();
      const parsed = JSON.parse(raw) as Partial<StudentProgress>;
      if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.completedVoucherIds)) return emptyProgress();
      return {
        schemaVersion: 1,
        completedVoucherIds: parsed.completedVoucherIds.filter((id) => Number.isInteger(id) && id >= 1 && id <= 15),
        highestUnlockedVoucherId: Math.min(15, Math.max(1, Number(parsed.highestUnlockedVoucherId) || 1)),
        attemptsByVoucher: parsed.attemptsByVoucher ?? {},
        hintsUsed: Math.max(0, Number(parsed.hintsUsed) || 0),
        totalAttempts: Math.max(0, Number(parsed.totalAttempts) || 0),
      };
    } catch {
      return emptyProgress();
    }
  }

  save(progress: StudentProgress): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  reset(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}
