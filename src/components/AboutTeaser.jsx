import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"

export default function AboutTeaser() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.15 })
  const { language } = useLanguage()

  const copy = language === "fr"
    ? {
        eyebrow: "À propos de Pure Peel Co.",
        headline: "Conçu pour ceux qui tiennent aux détails.",
        body1: "Nous avons créé Pure Peel parce que les agrumes frais sont beaux - mais pas toujours pratiques. Nos tranches d'agrumes déshydratées préservent la couleur, l'arôme et le caractère du fruit, pour une garniture durable, toujours prête quand l'occasion se présente.",
        body2: "Sans découpe. Sans gaspillage. Une présentation sans effort.",
        cta: "Notre histoire",
        imageAlt: "Pure Peel Co."
      }
    : {
        eyebrow: "About Pure Peel Co.",
        headline: "Made for the ones who care about the details.",
        body1: "We created Pure Peel because fresh citrus is beautiful - but not always practical. Our dehydrated citrus slices preserve the natural colour, aroma, and character of fresh fruit, giving you a long-lasting garnish that's always ready.",
        body2: "No slicing. No waste. Just effortless presentation.",
        cta: "Our Story",
        imageAlt: "Pure Peel Co."
      }

  return (
    <section
      id="about-teaser"
      ref={sectionRef}
      className="w-full py-32 px-6"
      style={{ background: '#faf7f2' }}
    >
      <div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
      >

        {/* Left — Text */}
        <div
          className={`transition-all duration-700 ease-out ${
            isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-6" style={{ background: 'rgba(232,200,74,0.5)' }} />
            <span
              className="uppercase"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                color: 'rgba(200,90,8,0.7)'
              }}
            >
              {copy.eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h2
            className="italic font-light leading-tight mb-7"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
              fontWeight: 300,
              color: '#0f0a04',
              maxWidth: '480px'
            }}
          >
            {copy.headline}
          </h2>

          {/* Gold divider */}
          <div
            className="mb-8"
            style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(to right, #e8c84a, transparent)'
            }}
          />

          {/* Body */}
          <p
            className="mb-5"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 300,
              lineHeight: 1.9,
              color: 'rgba(15,10,4,0.55)',
              maxWidth: '440px'
            }}
          >
            {copy.body1}
          </p>

          <p
            className="mb-12"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.05rem',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.7,
              color: 'rgba(15,10,4,0.4)',
              maxWidth: '380px'
            }}
          >
            {copy.body2}
          </p>

          {/* CTA */}
          <a
            href="/about"
            className="group inline-flex items-center gap-4 transition-all duration-300"
            style={{ textDecoration: 'none' }}

          >
            <span
              className="group-hover:border-amber-400"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#0f0a04',
                borderBottom: '1px solid rgba(15,10,4,0.15)',
                paddingBottom: '2px',
                transition: 'border-color 0.3s ease'
              }}
            >
                {copy.cta}
            </span>
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              style={{
                stroke: '#c85a08',
                transition: 'transform 0.3s ease'
              }}
              className="group-hover:translate-x-1"
              aria-hidden
            >
              <path d="M1 4h12M9 1l3 3-3 3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Right — Image */}
        <div
          className={`relative transition-all duration-1000 ease-out ${
            isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Main image */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: '4px',
              aspectRatio: '4/5',
              boxShadow: '0 24px 60px rgba(15,10,4,0.1)'
            }}
          >
            <img
              src="/images/about-teaser.PNG"
              alt={copy.imageAlt}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
            />
            {/* Subtle warm overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(200,90,8,0.04)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}