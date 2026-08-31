import { beforeEach, describe, expect, it } from "vitest";
import { emptyProgress, ProgressRepository } from "../src/repositories/progressRepository";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe("lokal elevtilstand", () => {
  beforeEach(() => window.localStorage.clear());

  it("starter altid med bilag 1", () => {
    const repository = new ProgressRepository(memoryStorage());
    expect(repository.load()).toEqual(emptyProgress());
  });

  it("gemmer og genindlæser én lokal tilstand", () => {
    const storage = memoryStorage();
    const repository = new ProgressRepository(storage);
    const progress = {...emptyProgress(), completedVoucherIds: [1], highestUnlockedVoucherId: 2, totalAttempts: 2};
    repository.save(progress);
    expect(repository.load()).toEqual(progress);
  });

  it("nulstiller hele forløbet", () => {
    const storage = memoryStorage();
    const repository = new ProgressRepository(storage);
    repository.save({...emptyProgress(), completedVoucherIds: [1]});
    repository.reset();
    expect(repository.load()).toEqual(emptyProgress());
  });

  it("bruger browserens localStorage som standard og overlever en ny repository-instans", () => {
    const progress = {...emptyProgress(), completedVoucherIds: [1, 2], highestUnlockedVoucherId: 3, hintsUsed: 1};
    new ProgressRepository().save(progress);
    expect(new ProgressRepository().load()).toEqual(progress);
    new ProgressRepository().reset();
    expect(window.localStorage.getItem("bogfoeringstraener.progress.v1")).toBeNull();
  });
});
