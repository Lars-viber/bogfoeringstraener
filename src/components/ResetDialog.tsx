import { useEffect, useRef } from "react";

type Props = {open: boolean; onCancel: () => void; onConfirm: () => void};

export function ResetDialog({open, onCancel, onConfirm}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description">
        <p className="eyebrow">Ekstra bekræftelse</p>
        <h2 id="reset-title">Nulstil hele forløbet?</h2>
        <p id="reset-description">Alle gennemførte bilag, forsøg og brugte hints slettes lokalt. Handlingen kan ikke fortrydes.</p>
        <div className="button-row">
          <button ref={cancelRef} type="button" className="button button--secondary" onClick={onCancel}>Annuller</button>
          <button type="button" className="button button--danger" onClick={onConfirm}>Ja, nulstil hele forløbet</button>
        </div>
      </section>
    </div>
  );
}
