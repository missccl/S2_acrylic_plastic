import { Simulator } from "@/components/Simulator";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top">
          Acrylic<span>Net</span>
        </a>
        <nav className="nav-links" aria-label="Page">
          <a href="#why">Why thickness</a>
          <a href="#simulator">Lab</a>
          <a href="#lesson">Lesson</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-label="Introduction">
          <div className="hero-visual" aria-hidden="true" />
          <div className="hero-copy">
            <p className="brand-mark">
              Acrylic<em>Net</em>
            </p>
            <h1>Design 3D nets with material thickness in mind</h1>
            <p>
              Paper folds flat. Acrylic does not. This lab shows how sheet
              thickness changes your cut sizes, joints, and final clear inside.
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href="#simulator">
                Open the lab
              </a>
              <a className="btn btn-ghost" href="#lesson">
                Lesson steps
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="why">
          <h2>Why paper nets mislead</h2>
          <p>
            In S2 acrylic plastic, students often draw nets the same way they
            did on card. Card is almost zero thickness. Workshop acrylic is
            usually 3 mm or 5 mm — and that changes everything when panels meet.
          </p>
          <div className="why-grid">
            <article className="why-block">
              <h3>Clear inside vs outer size</h3>
              <p>
                Walls sit on the base and take up space. If you want 80 mm clear
                inside with 3 mm acrylic, the base must be wider than 80 mm.
              </p>
            </article>
            <article className="why-block">
              <h3>Joints need the real thickness</h3>
              <p>
                Finger depth and slot width must match the sheet. A paper-style
                net never forces you to measure that — acrylic does.
              </p>
            </article>
          </div>
        </section>

        <Simulator />

        <section className="section" id="lesson">
          <h2>Suggested lesson flow</h2>
          <p>
            Use beside your acrylic plastic worksheet. Try each step in the lab
            before you finalise laser-ready dimensions.
          </p>
          <ol className="lesson-steps">
            <li>
              <strong>Start at 0 mm (paper)</strong>
              <p>
                Set your target clear inside. Explode the model. This is the net
                you already know from card.
              </p>
            </li>
            <li>
              <strong>Switch to 3 mm and “Ignore thickness”</strong>
              <p>
                Keep the same panel sizes. Watch the amber wireframe shrink —
                that is the space your product actually loses.
              </p>
            </li>
            <li>
              <strong>Flip to “Plan for thickness”</strong>
              <p>
                See the cut list grow so the clear inside matches your design
                intent. Copy those sizes onto your worksheet.
              </p>
            </li>
            <li>
              <strong>Check joints</strong>
              <p>
                If your product uses finger or slot joints, set finger depth /
                slot width equal to your sheet thickness before cutting.
              </p>
            </li>
          </ol>

          <div className="reflect">
            <h3>Reflect (write on your worksheet)</h3>
            <ol>
              <li>
                What happens to clear width when thickness doubles but cut sizes
                stay the same?
              </li>
              <li>
                For your product, which dimension matters more: outer footprint
                or clear inside? Why?
              </li>
              <li>
                Why is a paper mock-up still useful — and what must you recalculate
                before laser cutting acrylic?
              </li>
            </ol>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        AcrylicNet Lab · S2 acrylic plastic · Host on Vercel from GitHub
      </footer>
    </>
  );
}
