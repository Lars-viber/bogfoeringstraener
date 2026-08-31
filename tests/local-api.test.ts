import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkAnswer } from "../src/api";
import courseSolutions from "../shared/course-solutions.json";

function solution(voucherId: number) {
  return courseSolutions.solutions.find((item) => item.voucherId === voucherId)!;
}

beforeEach(() => {
  delete window.trainerApi;
});

describe("lokal browservalidering", () => {
  it.each(courseSolutions.solutions.map((item) => item.voucherId))("godkender korrekt svar til bilag %i uden netværkskald", async (voucherId) => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await checkAnswer({
      voucherId,
      entries: solution(voucherId).entries as any,
      attempt: 1,
    });
    expect(result).toMatchObject({correct: true, balanced: true});
    expect(result.explanation).toBe(solution(voucherId).explanation);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("giver de samme deterministiske hints som det eksisterende facit", async () => {
    const expected = solution(13);
    for (const attempt of [1, 2, 3]) {
      const result = await checkAnswer({
        voucherId: 13,
        entries: expected.entries.slice(1) as any,
        attempt,
      });
      expect(result).toMatchObject({correct: false, hint: expected.hints[attempt - 1]});
    }
  });

  it("giver det fagligt redigerede ekstra hint uden API", async () => {
    const expected = solution(14);
    const result = await checkAnswer({
      voucherId: 14,
      entries: [],
      attempt: 3,
      requestHelp: true,
    });
    expect(result).toMatchObject({
      correct: false,
      hint: expected.stuckHint,
      canAskForHelp: true,
    });
  });

  it("afviser et ukendt bilag lokalt", async () => {
    await expect(checkAnswer({voucherId: 99, entries: [], attempt: 1})).rejects.toThrow("Ukendt bilag");
  });
});
