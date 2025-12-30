import { useScrollReveal } from "../hooks/useScrollReveal"

export default function About() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.2 })
  const [titleRef, isTitleVisible] = useScrollReveal({ threshold: 0.2, delay: 100 })
  const [logoRef, isLogoVisible] = useScrollReveal({ threshold: 0.2, delay: 200 })
  const [textRef, isTextVisible] = useScrollReveal({ threshold: 0.2, delay: 300 })

  return (
    <section id="about" ref={sectionRef} className="py-20 px-5 text-center bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 
          ref={titleRef}
          className={`text-[clamp(1.75rem,4vw,2.5rem)] font-semibold mb-5 text-gray-900 tracking-tight transition-all duration-800 ${
            isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          About
        </h2>
        <img 
          ref={logoRef}
          src="/logo.png" 
          alt="Pure Peel Co. Logo" 
          className={`w-40 h-auto mx-auto my-8 block opacity-95 transition-all duration-800 hover:scale-105 hover:opacity-100 ${
            isLogoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        />
        <p 
          ref={textRef}
          className={`max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed font-normal transition-all duration-800 ${
            isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          We create small-batch dehydrated citrus slices that preserve bold color,
          aroma, and flavor. Perfect for cocktails, tea, charcuterie boards, and gifts —
          proudly made in Canada.
        </p>
      </div>
    </section>
  )
}

