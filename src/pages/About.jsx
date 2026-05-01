import { useEffect, useRef, useState } from "react"
import { useLanguage } from "../context/LanguageContext"

// ── Scroll reveal hook ──────────────────────────────────────────────
function useScrollReveal({ threshold = 0.15 } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ── Growing line component ──────────────────────────────────────────
function GrowLine({ visible, delay = 0, color = "rgba(232,200,74,0.4)", width = "32px" }) {
  return (
    <div
      style={{
        height: "1px",
        width: visible ? width : "0px",
        background: color,
        transition: `width 0.8s ease ${delay}ms`
      }}
    />
  )
}

// ── Eyebrow ─────────────────────────────────────────────────────────
function Eyebrow({ children, visible, delay = 0, light = false }) {
  return (
    <div
      className={`flex items-center gap-3 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <GrowLine visible={visible} delay={delay + 100} color={light ? "rgba(232,200,74,0.25)" : "rgba(232,200,74,0.4)"} />
      <span
        className="uppercase"
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.58rem",
          letterSpacing: "0.28em",
          color: light ? "rgba(232,200,74,0.55)" : "rgba(200,90,8,0.7)"
        }}
      >
        {children}
      </span>
      <GrowLine visible={visible} delay={delay + 100} color={light ? "rgba(232,200,74,0.25)" : "rgba(232,200,74,0.4)"} />
    </div>
  )
}

// ── Stats ───────────────────────────────────────────────────────────
const statsEN = [
  { value: "10+", label: "Hours per batch" },
  { value: "6",   label: "Varieties" },
  { value: "100%", label: "Real fruit" },
  { value: "0",   label: "Preservatives" },
]

const statsFR = [
  { value: "10+", label: "Heures par lot" },
  { value: "5",   label: "Varietes d'agrumes" },
  { value: "100%", label: "Vrai fruit" },
  { value: "0",   label: "Conservateurs" },
]

// ── Process steps ───────────────────────────────────────────────────
const processStepsEN = [
  {
    step: "01",
    title: "Sourced Fresh",
    body: "We hand-select the best-looking citrus we can find — prioritising vibrant colour, firm texture, and natural aroma before anything else gets started.",
    image: "/images/fresh-limes2.jpg",
    imageAlt: "Freshly sliced limes ready for dehydration"
  },
  {
    step: "02",
    title: "Sliced Evenly",
    body: "Each piece of citrus is run through a slicer by hand, back and forth, to achieve perfectly even slices. Consistency here is everything — it determines how the slice dehydrates and how it looks on the finished garnish.",
    image: "/images/slices.jpg",
    imageAlt: "Even citrus slices in preparation"
  },
  {
    step: "03",
    title: "Slowly Dehydrated",
    body: "Slices go into the dehydrator for 10+ hours at high heat. The slow process is what preserves the colour, locks in the aroma, and produces that clean, translucent finish.",
    image: "/images/citrus-dehydrator.jpg",
    imageAlt: "Citrus slices in the dehydrator"
  },
  {
    step: "04",
    title: "Carefully Packaged",
    body: "Finished slices are packed into kraft window bags and clear boxes — designed to protect the product and present it beautifully from the moment it arrives.",
    image: "/images/multipackaging.jpg",
    imageAlt: "Pure Peel Co. packaging"
  }
]

// ── Values ──────────────────────────────────────────────────────────
const valuesEN = [
  {
    number: "01",
    title: "Thoughtful Presentation",
    body: "The smallest details make the biggest difference. Every slice is prepared with the understanding that presentation isn't an afterthought — it's the point."
  },
  {
    number: "02",
    title: "Radical Simplicity",
    body: "People shouldn't have to spend time sourcing, slicing, and cleaning up just to garnish a drink. Pure Peel exists to make effortless presentation accessible to everyone."
  },
  {
    number: "03",
    title: "Real Ingredients",
    body: "Our slices are made from real citrus — carefully sourced, hand-selected, and slowly dehydrated to preserve the natural colour, aroma, and character of the fruit."
  }
]

const processStepsFR = [
  {
    step: "01",
    title: "Approvisionne frais",
    body: "Nous selectionnons a la main les meilleurs agrumes que nous pouvons trouver - en priorite la couleur vibrante, la texture ferme et le parfum naturel avant de commencer quoi que ce soit.",
    image: "/images/fresh-limes2.jpg",
    imageAlt: "Tranches fraiches de limes pretes a etre deshydratees"
  },
  {
    step: "02",
    title: "Decoupe homogene",
    body: "Chaque morceau d'agrumes est passe dans une trancheuse manuelle, d'avant en arriere, pour obtenir des tranches parfaitement uniformes. Ici, la regularite est essentielle - elle determine comment la tranche se deshydrate et comment elle apparait dans le produit fini.",
    image: "/images/slices.jpg",
    imageAlt: "Tranches d'agrumes uniformes en preparation"
  },
  {
    step: "03",
    title: "Deshydrate lentement",
    body: "Les tranches entrent dans le deshydrateur pendant 10+ heures a haute chaleur. Le procede lent preserve la couleur, fixe l'arome et cree cette finition claire et translucide.",
    image: "/images/citrus-dehydrator.jpg",
    imageAlt: "Tranches d'agrumes dans le deshydrateur"
  },
  {
    step: "04",
    title: "Emballe avec soin",
    body: "Les tranches finies sont rangees dans des sachets en papier kraft avec fenetre et des boites transparentes - concus pour proteger le produit et le presenter magnifiquement des son arrivee.",
    image: "/images/multipackaging.jpg",
    imageAlt: "Emballage Pure Peel Co."
  }
]

const valuesFR = [
  {
    number: "01",
    title: "Presentation reflechie",
    body: "Les plus petits details font la plus grande difference. Chaque tranche est preparee en gardant a l'esprit que la presentation n'est pas un detail apres coup - c'est l'essentiel."
  },
  {
    number: "02",
    title: "Simplicite radicale",
    body: "Les gens ne devraient pas devoir consacrer du temps a chercher, trancher et nettoyer juste pour garnir une boisson. Pure Peel existe pour rendre une presentation sans effort accessible a tous."
  },
  {
    number: "03",
    title: "Vrais ingredients",
    body: "Nos tranches sont faites a partir de vrais agrumes - selectionnes avec soin, choisis a la main et deshydrates lentement pour preserver la couleur naturelle, l'arome et le caractere du fruit."
  }
]

// ── Main component ──────────────────────────────────────────────────
export default function About() {
  const [heroRef, heroVisible]       = useScrollReveal({ threshold: 0.1 })
  const [statsRef, statsVisible]     = useScrollReveal({ threshold: 0.2 })
  const [missionRef, missionVisible] = useScrollReveal({ threshold: 0.15 })
  const [processRef, processVisible] = useScrollReveal({ threshold: 0.1 })
  const [valuesRef, valuesVisible]   = useScrollReveal({ threshold: 0.15 })
  const [ctaRef, ctaVisible]         = useScrollReveal({ threshold: 0.2 })
  const { language }                  = useLanguage()

  const stats = language === "fr" ? statsFR : statsEN
  const processSteps = language === "fr" ? processStepsFR : processStepsEN
  const values = language === "fr" ? valuesFR : valuesEN

  return (
    <main>

      {/* ── Hero ── */}
      <section
  ref={heroRef}
  className="w-full px-6"
  style={{
    background: "#faf7f2",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  }}
>
        <div className="max-w-3xl mx-auto text-center">
          <div className={`mb-8 flex justify-center transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Eyebrow visible={heroVisible} delay={0}>
              {language === "fr" ? "Notre histoire" : "Our Story"}
            </Eyebrow>
          </div>

          <h1
            className={`italic font-light leading-tight mb-8 transition-all duration-700 ease-out ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.6rem, 5vw, 4rem)",
              fontWeight: 300,
              color: "#0f0a04",
              transitionDelay: "150ms"
            }}
          >
            {language === "fr"
              ? <>La touche finale,<br />simplement.</>
              : <>The finishing touch,<br />made simple.</>
            }
          </h1>

          <div
            className="mx-auto mb-10"
            style={{
              width: heroVisible ? "40px" : "0px",
              height: "1px",
              background: "linear-gradient(to right, transparent, #e8c84a, transparent)",
              transition: "width 0.8s ease 300ms"
            }}
          />

          <p
            className={`transition-all duration-700 ease-out ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 300,
              lineHeight: 1.9,
              color: "rgba(15,10,4,0.55)",
              maxWidth: "580px",
              margin: "0 auto",
              transitionDelay: "300ms"
            }}
          >
            {language === "fr"
              ? "Pure Peel est ne d'une simple observation - les agrumes frais prennent trop de temps a preparer, se degradent vite, et, soyons honnetes, ne sont pas toujours aussi beaux. Nous voulions une facon de preserver la couleur, l'arome et le caractere du fruit, tout en le rendant accessible sans effort pour toute occasion."
              : "Pure Peel started with a simple observation — fresh citrus takes too long to prep, spoils quickly, and honestly doesn't always look its best. We wanted a way to preserve the colour, aroma, and character of the fruit while making it effortlessly accessible for any occasion."
            }
          </p>
        </div>
      </section>

   

      {/* ── Mission ── */}
      <section
        ref={missionRef}
        className="w-full py-28 px-6 overflow-hidden"
        style={{ background: "#0f0a04" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <div>
              <div className={`mb-7 transition-all duration-700 ease-out ${missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <Eyebrow visible={missionVisible} delay={0} light>
                  {language === "fr" ? "Pourquoi nous existons" : "Why We Exist"}
                </Eyebrow>
              </div>
              <h2
                className={`italic font-light leading-tight transition-all duration-700 ease-out ${
                  missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                  fontWeight: 300,
                  color: "#faf7f2",
                  transitionDelay: "150ms"
                }}
              >
                {language === "fr"
                  ? "Parce que les meilleurs moments meritent les bons details."
                  : "Because the best moments deserve the right details."
                }
              </h2>
            </div>

            <div
              className={`flex flex-col gap-6 lg:pt-16 transition-all duration-700 ease-out ${
                missionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "250ms" }}
            >
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.9, color: "rgba(250,247,242,0.5)" }}>
                {language === "fr"
                  ? "Que ce soit un cocktail partage entre amis, un plateau de charcuterie soigneusement compose, ou une table prete pour se reunir - la touche finale assemble tout."
                  : "Whether it's a cocktail shared with friends, a carefully styled charcuterie board, or a table set for a gathering — the final touch is what brings everything together."
                }
              </p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.9, color: "rgba(250,247,242,0.5)" }}>
                {language === "fr"
                  ? "Pure Peel a ete cree pour les personnes qui aiment l'art de la presentation - des hôtes a la maison et amateurs de cocktails aux barmen et createurs. Car les meilleurs rassemblements ne sont pas une question de perfection. Ils reposent sur les details qui rendent le moment vraiment special."
                  : "Pure Peel was created for people who love the art of presentation — from home hosts and cocktail enthusiasts to bartenders and creators. Because the best gatherings aren't about perfection. They're about the details that make the moment feel special."
                }
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section
        ref={statsRef}
        className="w-full py-16 px-6"
        style={{ background: "#1a1208", borderTop: "1px solid rgba(232,200,74,0.08)", borderBottom: "1px solid rgba(232,200,74,0.08)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
                statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span
                className="italic"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  fontWeight: 300,
                  color: "#e8c84a",
                  lineHeight: 1
                }}
              >
                {stat.value}
              </span>
              <div
                className="my-3"
                style={{
                  width: statsVisible ? "24px" : "0px",
                  height: "1px",
                  background: "rgba(232,200,74,0.3)",
                  transition: `width 0.6s ease ${i * 100 + 300}ms`
                }}
              />
              <span
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(250,247,242,0.35)"
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Process ── */}
      <section
        ref={processRef}
        className="w-full py-28 px-6"
        style={{ background: "#faf7f2" }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-700 ease-out ${processVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex justify-center mb-7">
              <Eyebrow visible={processVisible} delay={0}>
                {language === "fr" ? "Comment c'est fait" : "How It's Made"}
              </Eyebrow>
            </div>
            <h2
              className="italic font-light leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 300,
                color: "#0f0a04"
              }}
            >
              {language === "fr"
                ? "Process lent. Mains attentives."
                : "Slow process. Careful hands."
              }
            </h2>
          </div>

          {/* Alternating steps */}
          <div className="flex flex-col gap-24">
            {processSteps.map((step, i) => {
              const imageLeft = i % 2 === 0
              return (
                <div
                  key={step.step}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ease-out ${
                    processVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${imageLeft ? "lg:order-1" : "lg:order-2"}`}
                    style={{ borderRadius: "4px", aspectRatio: "4/3", boxShadow: "0 16px 48px rgba(15,10,4,0.1)" }}
                  >
                    <img
                      src={step.image}
                      alt={step.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      style={{ objectPosition: "center center" }}
                    />
                    {/* Subtle warm overlay */}
                    <div className="absolute inset-0" style={{ background: "rgba(15,10,4,0.04)" }} />
                  </div>

                  {/* Text */}
                  <div className={`flex flex-col justify-center ${imageLeft ? "lg:order-2" : "lg:order-1"}`}>
                    <div className="flex items-center gap-4 mb-5">
                      <span
                        className="italic"
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: "0.9rem",
                          color: "rgba(232,200,74,0.6)",
                          fontWeight: 300
                        }}
                      >
                        {step.step}
                      </span>
                      <div style={{ width: "24px", height: "1px", background: "rgba(232,200,74,0.4)" }} />
                    </div>

                    <h3
                      className="mb-4"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#0f0a04"
                      }}
                    >
                      {step.title}
                    </h3>

                    <div
                      className="mb-6"
                      style={{
                        width: "32px",
                        height: "1px",
                        background: "linear-gradient(to right, #e8c84a, transparent)"
                      }}
                    />

                    <p
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.88rem",
                        fontWeight: 300,
                        lineHeight: 1.9,
                        color: "rgba(15,10,4,0.55)",
                        maxWidth: "400px"
                      }}
                    >
                      {step.body}
                    </p>
                  </div>

                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── Values ── */}
      <section
        ref={valuesRef}
        className="w-full py-28 px-6"
        style={{ background: "#1a1208" }}
      >
        <div className="max-w-4xl mx-auto">

          <div className={`text-center mb-16 transition-all duration-700 ease-out ${valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="flex justify-center mb-7">
              <Eyebrow visible={valuesVisible} delay={0} light>
                {language === "fr" ? "Ce que nous defendons" : "What We Stand For"}
              </Eyebrow>
            </div>
            <h2
              className="italic font-light leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 300,
                color: "#faf7f2"
              }}
            >
              {language === "fr"
                ? "Bati sur trois convictions simples."
                : "Built on three simple beliefs."
              }
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {values.map((value, i) => (
              <div
                key={value.number}
                className={`transition-all duration-700 ease-out ${
                  valuesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div
                  className="mb-5"
                  style={{
                    width: valuesVisible ? "32px" : "0px",
                    height: "1px",
                    background: "linear-gradient(to right, #e8c84a, transparent)",
                    transition: `width 0.8s ease ${i * 120 + 200}ms`
                  }}
                />
                <span
                  className="block mb-3 italic"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "0.85rem",
                    color: "rgba(232,200,74,0.4)",
                    fontWeight: 300
                  }}
                >
                  {value.number}
                </span>
                <h3
                  className="mb-4"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#faf7f2"
                  }}
                >
                  {value.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 300,
                    lineHeight: 1.85,
                    color: "rgba(250,247,242,0.45)"
                  }}
                >
                  {value.body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section
        ref={ctaRef}
        className="w-full py-28 px-6"
        style={{ background: "#faf7f2" }}
      >
        <div
          className={`max-w-xl mx-auto text-center transition-all duration-700 ease-out ${
            ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2
            className="italic font-light leading-tight mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 300,
              color: "#0f0a04"
            }}
          >
            {language === "fr"
              ? "Pret(e) a elever votre prochaine occasion ?"
              : "Ready to elevate your next occasion?"
            }
          </h2>

          <p
            className="mb-10"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 300,
              lineHeight: 1.85,
              color: "rgba(15,10,4,0.5)"
            }}
          >
            {language === "fr"
              ? "Explorez toute la collection et trouvez l'agrumes ideal pour votre prochain cocktail, rassemblement, ou cadeau."
              : "Explore the full collection and find the right citrus for your next cocktail, gathering, or gift."
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                window.history.pushState({ page: "/" }, "", "/")
                window.dispatchEvent(new Event("hashchange"))
              }}
              className="px-8 py-3.5 transition-all duration-300 hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #f5e6a3 0%, #e8c84a 55%, #d4a832 100%)",
                borderRadius: "100px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.62rem",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#0f0a04",
                border: "none",
                cursor: "pointer"
              }}
            >
              {language === "fr" ? "Decouvrir la collection" : "Shop the Collection"}
            </button>

            
          </div>
        </div>
      </section>

    </main>
  )
}