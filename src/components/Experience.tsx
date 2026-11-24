
export default function Experience() {
  return (
    <>
      <section id="about" className="bg-charcoal py-28 text-ivory md:py-40">
        <div className="section-container grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-7 text-champagne">
              The Last Promise Philosophy
            </p>
            <h2 className="text-6xl leading-[0.95] md:text-8xl">
              Not Just Events.
              <br />
              <span className="italic text-champagne">
                Emotions, Beautifully Told.
              </span>
            </h2>
          </div>
          <div className="max-w-lg lg:ml-auto">
            <p className="text-lg leading-9 text-white/75">
              We believe every occasion holds a story
              worth celebrating. A story of people,
              connections, traditions and unforgettable
              moments.
            </p>
            <p className="mt-7 text-sm leading-8 text-white/60">
              Last Promise Events brings together
              thoughtful planning, contemporary
              creativity and the richness of Indian
              celebrations to create experiences
              that feel truly personal.
            </p>
            <a
              href="#contact"
              className="mt-9 inline-block border-b border-champagne pb-2 text-xs uppercase tracking-widest text-champagne"
            >
              Create Something Beautiful With Us
            </a>
          </div>
        </div>
      </section>

      <section id="experience" className="relative min-h-[560px] bg-charcoal text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/experience.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="section-container relative flex min-h-[560px] flex-col items-center justify-center py-24 text-center">
          <p className="eyebrow mb-6 text-champagne">
            Made To Be Remembered
          </p>
          <h2 className="max-w-4xl text-6xl leading-none md:text-8xl">
            Moments Fade.
            <br />
            <span className="italic">Memories Remain.</span>
          </h2>
        </div>
      </section>
    </>
  );
}
