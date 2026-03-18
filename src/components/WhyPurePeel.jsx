import { useEffect, useRef } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"

const pillarsEN = [
  {
    num: "01",
    title: "Always Ready",
    desc: "No slicing, no prep, no cleanup. Pull a slice straight from the bag and it's done - shelf-stable for 12+ months so it's there whenever the moment calls for it."
  },
  {
    num: "02",
    title: "Nothing Goes to Waste",
    desc: "Fresh citrus spoils in days. Our slices last over a year without preservatives - you use what you need, when you need it, and nothing ends up in the bin."
  },
  {
    num: "03",
    title: "Looks Better Too",
    desc: "Dehydration concentrates the colour and clarifies the flesh - the result is a slice that's more visually striking than fresh, every single time."
  }
]

const pillarsFR = [
  {
    num: "01",
    title: "Toujours prêt",
    desc: "Sans trancher, sans preparation, sans nettoyage. Sortez une tranche tout droit du sachet et c'est pret - stable sur etagere pendant 12+ mois, pour etre la quand le moment appelle."
  },
  {
    num: "02",
    title: "Rien ne se perd",
    desc: "Les agrumes frais se gatent en quelques jours. Nos tranches durent plus d'un an sans conservateurs - vous utilisez ce dont vous avez besoin, quand vous en avez besoin, et rien ne finit a la poubelle."
  },
  {
    num: "03",
    title: "C'est aussi plus beau",
    desc: "La deshydratation concentre la couleur et clarifie la chair - le resultat : une tranche plus visuellement marquante que fraiche, a chaque fois."
  }
]

export default function WhyPurePeel() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.15 })
  const imgRef = useRef(null)
  const { language } = useLanguage()

  const pillars = language === "fr" ? pillarsFR : pillarsEN
  const copy = language === "fr"
    ? {
        eyebrow: "Pourquoi Pure Peel ?",
        headlineLine1: "La garniture la plus intelligente.",
        headlineLine2: "Sans compromis.",
        imageAlt: "Pure Peel Co. - agrumes artisanaux"
      }
    : {
        eyebrow: "Why Pure Peel?",
        headlineLine1: "The smarter garnish.",
        headlineLine2: "No compromise.",
        imageAlt: "Pure Peel Co. - handcrafted citrus"
      }

  useEffect(() => {
    const onScroll = () => {
      if (!imgRef.current) return
      const wrap = imgRef.current.closest('.why-img-wrap')
      if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2
      imgRef.current.style.transform = `translateY(${centerOffset * 0.08}px) scale(1.08)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden"
      style={{ background: '#1a1208' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: '580px' }}>

        {/* Left — Photo */}
        <div
          className={`why-img-wrap relative overflow-hidden transition-all duration-1000 ease-out ${
            isSectionVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ minHeight: '400px' }}
        >
          <img
            ref={imgRef}
            src="/images/drinks1.jpg"
            alt={copy.imageAlt}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ willChange: 'transform' }}
          />

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(15,10,4,0.55) 0%, rgba(15,10,4,0.2) 100%)' }}
          />

         
        </div>

        {/* Right — Content */}
        <div
          className={`flex flex-col justify-center px-8 py-12 md:px-14 md:py-16 transition-all duration-700 ease-out ${
            isSectionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8" style={{ background: 'rgba(232,200,74,0.3)' }} />
            <span
              className="uppercase"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '0.6rem',
                letterSpacing: '0.28em',
                color: 'rgba(232,200,74,0.65)'
              }}
            >
              {copy.eyebrow}
              </span>
          <div className="h-px w-8" style={{ background: 'rgba(232,200,74,0.25)' }} />
        </div>


          {/* Headline */}
          <h2
            className="text-white italic font-light leading-[1.08] mb-12"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2rem, 3vw, 3.2rem)',
              fontWeight: 300
            }}
          >
            {copy.headlineLine1}<br />{copy.headlineLine2}
          </h2>

          {/* Pillars */}
          <div className="flex flex-col">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.num}
                className={`flex items-start gap-5 py-6 transition-all duration-700 ease-out ${
                  isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  ...(i === pillars.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}),
                  transitionDelay: `${300 + i * 120}ms`
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '0.72rem',
                    color: 'rgba(232,200,74,0.45)',
                    letterSpacing: '0.1em',
                    paddingTop: '4px',
                    flexShrink: 0
                  }}
                >
                  {pillar.num}
                </span>
                <div>
                  <h4
                    className="text-white italic mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '1.25rem',
                      fontWeight: 300,
                      lineHeight: 1.2
                    }}
                  >
                    {pillar.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '0.82rem',
                      lineHeight: 1.75,
                      color: 'rgba(255,255,255,0.58)',
                      fontWeight: 300
                    }}
                  >
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}