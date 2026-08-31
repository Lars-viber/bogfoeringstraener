type Props = {onStart: () => void};

export function IntroductionScreen({onStart}: Props) {
  return (
    <main id="main-content" className="introduction">
      <div className="introduction__heading">
        <p className="eyebrow">Før du begynder</p>
        <h1>Velkommen til Bogføringstræner</h1>
        <p>
          I opgaven arbejder du med en momsregistreret virksomhed, der sælger varer.
          Virksomhedens almindelige køb og salg er derfor som udgangspunkt momspligtige,
          medmindre der står noget andet i bilaget.
        </p>
      </div>
      <div className="introduction__grid" aria-label="Fire ting, du skal vide">
        <article>
          <span className="introduction__number">01</span>
          <h2>Moms ved salg</h2>
          <p>Momsen på et salg kaldes <strong>udgående moms</strong> eller <strong>salgsmoms</strong>.</p>
        </article>
        <article>
          <span className="introduction__number">02</span>
          <h2>Moms ved køb</h2>
          <p>Momsen på et køb kaldes <strong>indgående moms</strong> eller <strong>købsmoms</strong>.</p>
        </article>
        <article>
          <span className="introduction__number">03</span>
          <h2>Debet</h2>
          <p><strong>Debet er altid venstre side</strong> af T-kontoen.</p>
        </article>
        <article>
          <span className="introduction__number">04</span>
          <h2>Kredit</h2>
          <p><strong>Kredit er altid højre side</strong> af T-kontoen.</p>
        </article>
      </div>
      <div className="introduction__note">
        <p>Du får momsbeløbet oplyst som hjælp. Din opgave er at placere de rigtige beløb på de rigtige sider af T-kontiene.</p>
      </div>
      <button type="button" className="button button--primary introduction__start" onClick={onStart}>Start med bilag 1</button>
    </main>
  );
}
