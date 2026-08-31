import { useEffect, useMemo, useState } from "react";
import { getCourse } from "./api";
import { CompletionScreen } from "./components/CompletionScreen";
import { IntroductionScreen } from "./components/IntroductionScreen";
import { ProgressHeader } from "./components/ProgressHeader";
import { ResetDialog } from "./components/ResetDialog";
import { VoucherWorkspace } from "./components/VoucherWorkspace";
import type { PublicCourse, StudentProgress } from "./domain/types";
import { emptyProgress, ProgressRepository } from "./repositories/progressRepository";

const repository = new ProgressRepository();

export default function App() {
  const [course, setCourse] = useState<PublicCourse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [progress, setProgress] = useState<StudentProgress>(() => repository.load());
  const [currentVoucherId, setCurrentVoucherId] = useState(() => repository.load().highestUnlockedVoucherId);
  const [showCompletion, setShowCompletion] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);

  useEffect(() => {
    getCourse().then(setCourse).catch(() => setLoadError("Kursusdata kunne ikke indlæses. Genstart programmet og prøv igen."));
  }, []);

  function updateProgress(updater: (current: StudentProgress) => StudentProgress) {
    setProgress((current) => {
      const next = updater(current);
      repository.save(next);
      return next;
    });
  }

  function recordAttempt(correct: boolean, hintShown: boolean) {
    updateProgress((current) => {
      const key = String(currentVoucherId);
      const completed = new Set(current.completedVoucherIds);
      if (correct) completed.add(currentVoucherId);
      return {
        ...current,
        completedVoucherIds: Array.from(completed).sort((a, b) => a - b),
        highestUnlockedVoucherId: correct ? Math.max(current.highestUnlockedVoucherId, Math.min(15, currentVoucherId + 1)) : current.highestUnlockedVoucherId,
        attemptsByVoucher: {...current.attemptsByVoucher, [key]: (current.attemptsByVoucher[key] ?? 0) + 1},
        hintsUsed: current.hintsUsed + (hintShown ? 1 : 0),
        totalAttempts: current.totalAttempts + 1,
      };
    });
  }

  function recordHint() {
    updateProgress((current) => ({...current, hintsUsed: current.hintsUsed + 1}));
  }

  function navigate(voucherId: number) {
    const allowed = voucherId <= progress.highestUnlockedVoucherId || progress.completedVoucherIds.includes(voucherId);
    if (!allowed) return;
    setShowCompletion(false);
    setShowIntroduction(false);
    setCurrentVoucherId(voucherId);
    window.scrollTo({top: 0, behavior: "smooth"});
  }

  function next() {
    if (currentVoucherId === 15) {
      setShowCompletion(true);
      window.scrollTo({top: 0, behavior: "smooth"});
      return;
    }
    navigate(currentVoucherId + 1);
  }

  function resetAll() {
    repository.reset();
    const fresh = emptyProgress();
    setProgress(fresh);
    setCurrentVoucherId(1);
    setShowCompletion(false);
    setShowIntroduction(true);
    setResetOpen(false);
  }

  const voucher = useMemo(() => course?.vouchers.find((item) => item.id === currentVoucherId), [course, currentVoucherId]);

  if (loadError) return <main id="main-content" className="state-message"><h1>Programmet kunne ikke starte</h1><p>{loadError}</p></main>;
  if (!course || !voucher) return <main id="main-content" className="state-message"><h1>Henter bogføringsforløbet …</h1></main>;

  if (showIntroduction) {
    return (
      <div className="app-shell introduction-shell">
        <IntroductionScreen onStart={() => { setCurrentVoucherId(1); setShowIntroduction(false); }} />
        <footer className="app-footer app-footer--introduction"><p>Fremdriften gemmes kun lokalt på denne computer.</p></footer>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {!showCompletion && (
        <ProgressHeader
          currentVoucherId={currentVoucherId}
          completedVoucherIds={progress.completedVoucherIds}
          highestUnlockedVoucherId={progress.highestUnlockedVoucherId}
          onNavigate={navigate}
        />
      )}
      {showCompletion ? (
        <CompletionScreen course={course} progress={progress} onRevisit={navigate} />
      ) : (
        <VoucherWorkspace
          key={currentVoucherId}
          voucher={voucher}
          alreadyCompleted={progress.completedVoucherIds.includes(currentVoucherId)}
          previousAttempts={progress.attemptsByVoucher[String(currentVoucherId)] ?? 0}
          onAttempt={recordAttempt}
          onHintUsed={recordHint}
          onNext={next}
        />
      )}
      <footer className="app-footer">
        <p>Fremdriften gemmes kun lokalt på denne computer.</p>
        <button type="button" className="text-button" onClick={() => setResetOpen(true)}>Nulstil hele forløbet</button>
      </footer>
      <ResetDialog open={resetOpen} onCancel={() => setResetOpen(false)} onConfirm={resetAll} />
    </div>
  );
}
