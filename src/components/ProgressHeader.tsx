type Props = {
  currentVoucherId: number;
  completedVoucherIds: number[];
  highestUnlockedVoucherId: number;
  onNavigate: (voucherId: number) => void;
};

export function ProgressHeader({currentVoucherId, completedVoucherIds, highestUnlockedVoucherId, onNavigate}: Props) {
  const completed = new Set(completedVoucherIds);
  return (
    <header className="progress-header">
      <div className="progress-header__topline">
        <div>
          <p className="eyebrow">Dit guidede forløb</p>
          <h1>Bogføringstræner</h1>
        </div>
        <strong aria-live="polite">Bilag {currentVoucherId} af 15</strong>
      </div>
      <div className="progress-track" role="progressbar" aria-label="Gennemførte bilag" aria-valuemin={0} aria-valuemax={15} aria-valuenow={completed.size}>
        <span style={{width: `${(completed.size / 15) * 100}%`}} />
      </div>
      <nav aria-label="Bilagsnavigation">
        <ol className="voucher-nav">
          {Array.from({length: 15}, (_, index) => index + 1).map((id) => {
            const unlocked = id <= highestUnlockedVoucherId || completed.has(id);
            const label = completed.has(id) ? `Bilag ${id}, gennemført` : id === currentVoucherId ? `Bilag ${id}, aktuelt` : `Bilag ${id}`;
            return (
              <li key={id}>
                <button
                  type="button"
                  className={completed.has(id) ? "is-complete" : ""}
                  aria-current={id === currentVoucherId ? "step" : undefined}
                  aria-label={label}
                  disabled={!unlocked}
                  onClick={() => onNavigate(id)}
                >
                  {completed.has(id) ? "✓" : id}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
