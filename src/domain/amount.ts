export type ParsedAmount = { ok: true; ore: number } | { ok: false; message: string };

export function parseDanishAmount(input: string): ParsedAmount {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/(?:kr\.?|kroner)/g, "")
    .replace(/\s/g, "");

  if (cleaned === "") return {ok: true, ore: 0};
  if (!/^[0-9.,]+$/.test(cleaned)) return {ok: false, message: "Brug kun tal, punktum og komma i beløbet."};

  let normalized = cleaned;
  if (cleaned.includes(",")) {
    if ((cleaned.match(/,/g) ?? []).length > 1) return {ok: false, message: "Beløbet indeholder for mange kommaer."};
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    const looksLikeThousands = parts.length > 1 && parts.slice(1).every((part) => part.length === 3);
    normalized = looksLikeThousands ? parts.join("") : cleaned;
  }

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return {ok: false, message: "Skriv højst to decimaler, fx 12500,50."};
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return {ok: false, message: "Beløbet skal være nul eller positivt."};
  const ore = Math.round(value * 100);
  if (!Number.isSafeInteger(ore)) return {ok: false, message: "Beløbet er for stort."};
  return {ok: true, ore};
}

export function formatDanishCurrency(ore: number): string {
  return new Intl.NumberFormat("da-DK", {style: "currency", currency: "DKK", minimumFractionDigits: 2})
    .format(ore / 100)
    .replace(/\u00a0/g, " ");
}
