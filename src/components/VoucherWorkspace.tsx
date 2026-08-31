import { useMemo, useRef, useState } from "react";
import { checkAnswer } from "../api";
import { formatDanishCurrency, parseDanishAmount } from "../domain/amount";
import type { CheckResult, SubmittedEntry, Voucher } from "../domain/types";
import { TAccount, type AccountValues } from "./TAccount";

type Props = {
  voucher: Voucher;
  alreadyCompleted: boolean;
  previousAttempts: number;
  onAttempt: (correct: boolean, hintShown: boolean) => void;
  onHintUsed: () => void;
  onNext: () => void;
};

function emptyValues(voucher: Voucher): Record<number, AccountValues> {
  return Object.fromEntries(voucher.accounts.map((account) => [account.number, {debit: "", credit: ""}]));
}

export function VoucherWorkspace({voucher, alreadyCompleted, previousAttempts, onAttempt, onHintUsed, onNext}: Props) {
  const [values, setValues] = useState(() => emptyValues(voucher));
  const [result, setResult] = useState<CheckResult | null>(null);
  const [inputError, setInputError] = useState("");
  const [checking, setChecking] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const dateText = useMemo(() => new Intl.DateTimeFormat("da-DK", {day: "numeric", month: "long", year: "numeric"}).format(new Date(`${voucher.date}T12:00:00`)), [voucher.date]);

  function updateValue(accountNumber: number, side: "debit" | "credit", value: string) {
    setValues((current) => ({...current, [accountNumber]: {...current[accountNumber], [side]: value}}));
    setInputError("");
  }

  function formatOnBlur(accountNumber: number, side: "debit" | "credit") {
    const rawValue = values[accountNumber][side];
    const parsed = parseDanishAmount(rawValue);
    if (rawValue.trim() !== "" && parsed.ok) updateValue(accountNumber, side, formatDanishCurrency(parsed.ore));
  }

  function collectEntries(): SubmittedEntry[] | null {
    const entries: SubmittedEntry[] = [];
    const formattedValues = structuredClone(values);
    for (const account of voucher.accounts) {
      for (const side of ["debit", "credit"] as const) {
        const rawValue = values[account.number][side];
        const parsed = parseDanishAmount(rawValue);
        if (!parsed.ok) {
          setInputError(`${account.number} ${account.name}, ${side === "debit" ? "debet" : "kredit"}: ${parsed.message}`);
          return null;
        }
        if (rawValue.trim() !== "") formattedValues[account.number][side] = formatDanishCurrency(parsed.ore);
        if (parsed.ore > 0) entries.push({accountNumber: account.number, side, amountOre: parsed.ore});
      }
    }
    setValues(formattedValues);
    return entries;
  }

  async function submitAnswer() {
    const entries = collectEntries();
    if (!entries) return;
    setChecking(true);
    try {
      const nextResult = await checkAnswer({voucherId: voucher.id, entries, attempt: previousAttempts + 1});
      setResult(nextResult);
      onAttempt(nextResult.correct, Boolean(nextResult.hint));
      queueMicrotask(() => feedbackRef.current?.focus());
    } catch {
      setInputError("Programmet kunne ikke kontrollere svaret. Prøv igen.");
    } finally {
      setChecking(false);
    }
  }

  async function requestHelp() {
    setChecking(true);
    try {
      const help = await checkAnswer({voucherId: voucher.id, entries: [], attempt: Math.max(previousAttempts, 3), requestHelp: true});
      setResult(help);
      onHintUsed();
      queueMicrotask(() => feedbackRef.current?.focus());
    } finally {
      setChecking(false);
    }
  }

  function resetVoucher() {
    setValues(emptyValues(voucher));
    setResult(null);
    setInputError("");
    document.querySelector<HTMLInputElement>(".t-account input")?.focus();
  }

  const solvedNow = result?.correct === true;
  return (
    <main id="main-content" className="workspace">
      <section className="voucher-strip" aria-labelledby="voucher-title">
        <div className="voucher-strip__meta">
          <h2 id="voucher-title">Bilag {voucher.id} af 15 <span aria-hidden="true">·</span> <time dateTime={voucher.date}>{dateText}</time></h2>
          {alreadyCompleted && <span className="status-chip">Gennemført · repetition</span>}
        </div>
        <p className="voucher-text">{voucher.text}</p>
        <div className="voucher-facts">
          <p><strong>Bilagsbeløb:</strong> {formatDanishCurrency(voucher.amountOre)}</p>
          <p><strong>Momsoplysning:</strong> {voucher.vatContext}</p>
        </div>
      </section>

      <section aria-labelledby="accounts-title">
        <div className="section-heading">
          <h2 id="accounts-title">Bogfør på T-kontiene</h2>
          <p>Debet står altid til venstre. Kredit står altid til højre.</p>
        </div>
        <div className="account-grid">
          {voucher.accounts.map((account) => (
            <TAccount
              key={account.number}
              account={account}
              values={values[account.number]}
              disabled={solvedNow}
              onChange={(side, value) => updateValue(account.number, side, value)}
              onBlur={(side) => formatOnBlur(account.number, side)}
            />
          ))}
        </div>
      </section>

      {(inputError || result) && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className={`feedback ${result?.correct ? "feedback--success" : "feedback--learning"}`}
          role={result?.correct ? "status" : "alert"}
          aria-live="polite"
        >
          <h2>{result?.correct ? "Korrekt bogført" : "Prøv videre"}</h2>
          <p>{inputError || result?.message}</p>
          {result?.hint && <p className="hint"><strong>Hint:</strong> {result.hint}</p>}
          {result?.explanation && <p><strong>Hvorfor:</strong> {result.explanation}</p>}
        </div>
      )}

      <div className="actions" aria-label="Handlinger for bilaget">
        <button type="button" className="button button--primary" onClick={submitAnswer} disabled={checking || solvedNow}>
          {checking ? "Kontrollerer …" : "Kontrollér svar"}
        </button>
        <button type="button" className="button button--secondary" onClick={resetVoucher}>Nulstil bilag</button>
        {(result?.canAskForHelp || previousAttempts >= 3) && !solvedNow && (
          <button type="button" className="button button--quiet" onClick={requestHelp} disabled={checking}>Jeg sidder fast</button>
        )}
        <button type="button" className="button button--next" onClick={onNext} disabled={!alreadyCompleted && !solvedNow}>
          {voucher.id === 15 ? "Se afslutning" : "Næste bilag"}
        </button>
      </div>
    </main>
  );
}
