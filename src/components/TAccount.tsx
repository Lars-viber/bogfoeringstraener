import type { Account } from "../domain/types";

export type AccountValues = {debit: string; credit: string};

type Props = {
  account: Account;
  values: AccountValues;
  disabled?: boolean;
  onChange: (side: "debit" | "credit", value: string) => void;
  onBlur: (side: "debit" | "credit") => void;
};

export function TAccount({account, values, disabled, onChange, onBlur}: Props) {
  const headingId = `account-${account.number}`;
  return (
    <section className="t-account" aria-labelledby={headingId}>
      <h3 id={headingId}><span>{account.number}</span> {account.name}</h3>
      <div className="t-account__columns">
        <label className="t-account__side t-account__side--debit">
          <span>Debet</span>
          <input
            aria-label={`${account.number} ${account.name}, debet`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00 kr."
            value={values.debit}
            disabled={disabled}
            onChange={(event) => onChange("debit", event.target.value)}
            onBlur={() => onBlur("debit")}
          />
        </label>
        <label className="t-account__side t-account__side--credit">
          <span>Kredit</span>
          <input
            aria-label={`${account.number} ${account.name}, kredit`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00 kr."
            value={values.credit}
            disabled={disabled}
            onChange={(event) => onChange("credit", event.target.value)}
            onBlur={() => onBlur("credit")}
          />
        </label>
      </div>
    </section>
  );
}
