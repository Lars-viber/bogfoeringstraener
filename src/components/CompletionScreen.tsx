import type { PublicCourse, StudentProgress } from "../domain/types";

type Props = {course: PublicCourse; progress: StudentProgress; onRevisit: (id: number) => void};

export function CompletionScreen({course, progress, onRevisit}: Props) {
  const attempts = course.vouchers.map((voucher) => ({id: voucher.id, count: progress.attemptsByVoucher[String(voucher.id)] ?? 0}));
  const highest = Math.max(...attempts.map((item) => item.count));
  const hardest = attempts.filter((item) => item.count === highest && highest > 0).map((item) => `bilag ${item.id}`).join(", ");
  const learningAreas = Array.from(new Set(course.vouchers.flatMap((voucher) => voucher.learningAreas)));
  return (
    <main id="main-content" className="completion">
      <p className="eyebrow">Forløbet er gennemført</p>
      <h1>15 af 15 bilag gennemført</h1>
      <p className="completion__lead">Du har arbejdet hele vejen fra momspligtige køb og salg til ompostering af vareforbrug – og hver postering har skullet balancere.</p>
      <div className="summary-grid">
        <article><strong>{progress.totalAttempts}</strong><span>kontrolforsøg i alt</span></article>
        <article><strong>{progress.hintsUsed}</strong><span>faglige hints brugt</span></article>
        <article><strong>{hardest || "–"}</strong><span>flest forsøg</span></article>
      </div>
      <section className="learning-summary">
        <h2>Faglige områder, du har trænet</h2>
        <ul>{learningAreas.map((area) => <li key={area}>{area}</li>)}</ul>
      </section>
      <p>Du kan genbesøge et gennemført bilag. Det åbner med tomme T-konti, mens din gennemførte status bevares.</p>
      <button type="button" className="button button--primary" onClick={() => onRevisit(1)}>Prøv bilag 1 igen</button>
    </main>
  );
}
