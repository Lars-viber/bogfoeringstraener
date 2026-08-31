const validSide = new Set(["debit", "credit"]);

export function validateAnswer(solution, submittedEntries, attempt = 1) {
  const entries = Array.isArray(submittedEntries) ? submittedEntries : [];
  const expectedAccounts = new Set(solution.entries.map((entry) => entry.accountNumber));

  const normalized = entries.filter((entry) =>
    Number.isInteger(entry?.accountNumber) &&
    expectedAccounts.has(entry.accountNumber) &&
    validSide.has(entry.side) &&
    Number.isInteger(entry.amountOre) &&
    entry.amountOre > 0,
  );

  const debitOre = normalized
    .filter((entry) => entry.side === "debit")
    .reduce((sum, entry) => sum + entry.amountOre, 0);
  const creditOre = normalized
    .filter((entry) => entry.side === "credit")
    .reduce((sum, entry) => sum + entry.amountOre, 0);

  const expectedKeys = solution.entries
    .map(entryKey)
    .sort();
  const submittedKeys = normalized
    .map(entryKey)
    .sort();
  const exactMatch = expectedKeys.length === submittedKeys.length &&
    expectedKeys.every((key, index) => key === submittedKeys[index]);

  if (exactMatch && debitOre === creditOre) {
    return {
      correct: true,
      balanced: true,
      message: "Flot arbejde – bilaget er bogført korrekt.",
      explanation: solution.explanation,
    };
  }

  let message = "Det er ikke helt endnu. Se på bilaget og T-kontiene én gang til.";
  if (normalized.length === 0) {
    message = "Der mangler endnu beløb på T-kontiene. Udfyld posteringerne, før du kontrollerer igen.";
  } else if (debitOre !== creditOre) {
    message = "Debet og kredit balancerer ikke endnu. Kontrollér både beløb og placeringer.";
  } else if (normalized.length !== solution.entries.length) {
    message = "Balancen kan godt passe, men antallet af posteringer er ikke korrekt endnu.";
  } else {
    message = "Debet og kredit balancerer, men mindst én konto, side eller ét beløb skal undersøges igen.";
  }

  return {
    correct: false,
    balanced: debitOre === creditOre && normalized.length > 0,
    message,
    hint: solution.hints[Math.min(Math.max(attempt, 1), 3) - 1],
    canAskForHelp: attempt >= 3,
  };
}

export function getStuckHint(solution) {
  return solution.stuckHint;
}

export function validateCourseDataset(publicCourse, privateCourse) {
  const issues = [];
  const solutionsById = new Map(privateCourse.solutions.map((solution) => [solution.voucherId, solution]));
  let postingCount = 0;
  let debitOre = 0;
  let creditOre = 0;
  let outputVatOre = 0;
  let inputVatOre = 0;

  if (publicCourse.vouchers.length !== 15) issues.push("Det offentlige datasæt skal indeholde 15 bilag.");
  if (privateCourse.solutions.length !== 15) issues.push("Facitdatasættet skal indeholde 15 bilag.");

  for (const voucher of publicCourse.vouchers) {
    const solution = solutionsById.get(voucher.id);
    if (!solution) {
      issues.push(`Bilag ${voucher.id} mangler facit.`);
      continue;
    }
    const publicAccounts = new Map(voucher.accounts.map((account) => [account.number, account.name]));
    for (const entry of solution.entries) {
      if (!publicAccounts.has(entry.accountNumber)) issues.push(`Bilag ${voucher.id}: konto ${entry.accountNumber} mangler blandt T-kontiene.`);
      postingCount += 1;
      if (entry.side === "debit") debitOre += entry.amountOre;
      if (entry.side === "credit") creditOre += entry.amountOre;
      if (entry.accountNumber === 6902) outputVatOre += entry.amountOre;
      if (entry.accountNumber === 6903) inputVatOre += entry.amountOre;
    }
    const result = validateAnswer(solution, solution.entries, 1);
    if (!result.correct) issues.push(`Bilag ${voucher.id}: den indbyggede facitpostering består ikke validatoren.`);
  }

  const expected = privateCourse.sourceControlTotals;
  const actual = {postingCount, debitOre, creditOre, outputVatOre, inputVatOre, netVatReceivableOre: inputVatOre - outputVatOre};
  for (const key of Object.keys(expected)) {
    if (actual[key] !== expected[key]) issues.push(`Kontroltallet ${key} er ${actual[key]}, men kilden angiver ${expected[key]}.`);
  }
  if (debitOre !== creditOre) issues.push("Samlet debet og kredit balancerer ikke.");

  return {valid: issues.length === 0, issues, totals: actual};
}

function entryKey(entry) {
  return `${entry.accountNumber}:${entry.side}:${entry.amountOre}`;
}
