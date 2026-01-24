import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

export default function About() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.2 })
  const [titleRef, isTitleVisible] = useScrollReveal({ threshold: 0.2, delay: 100 })
  const [logoRef, isLogoVisible] = useScrollReveal({ threshold: 0.2, delay: 200 })
  const [textRef, isTextVisible] = useScrollReveal({ threshold: 0.2, delay: 300 })
  const { language } = useLanguage()

  return (
    <section id="about" ref={sectionRef} className="py-12 md:py-20 px-4 sm:px-6 text-center bg-brand-bg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-5 md:mb-6 hidden md:block">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-amber-700/90 bg-linear-to-r from-amber-50/80 to-amber-100/40 rounded-full border border-amber-200/40">
            Our Story
          </span>
        </div>
        <h2 
          ref={titleRef}
          className={`text-[clamp(1.75rem,5vw,3.5rem)] font-bold mb-5 md:mb-7 text-stone-900 tracking-tight transition-all duration-700 ease-out ${
            isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {getTranslation(language, 'about.title')}
        </h2>
        <img 
          ref={logoRef}
          src="/logo.png" 
          alt="Pure Peel Co. Logo" 
          className={`w-36 md:w-44 h-auto mx-auto my-6 md:my-8 block opacity-95 transition-all duration-700 ease-out hover:scale-[1.03] hover:opacity-100 ${
            isLogoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />
        <p 
          ref={textRef}
          className={`max-w-3xl mx-auto text-stone-600 text-sm md:text-base leading-relaxed font-normal transition-all duration-700 ease-out px-4 tracking-wide mb-6 ${
            isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {getTranslation(language, 'about.description')}
        </p>
        
        {/* Business Information */}
        <div 
          className={`max-w-2xl mx-auto mt-8 px-4 transition-all duration-700 ease-out ${
            isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="bg-stone-50 rounded-lg p-6 border border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">
              {language === 'fr' ? 'Informations sur l\'entreprise' : 'Business Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-700">
              <div>
                <p className="font-semibold text-stone-900 mb-1">
                  {language === 'fr' ? 'Nom de l\'entreprise' : 'Business Name'}
                </p>
                <p>Pure Peel Co.</p>
              </div>
              <div>
                <p className="font-semibold text-stone-900 mb-1">
                  {language === 'fr' ? 'Localisation' : 'Location'}
                </p>
                <p>Ontario, Canada</p>
              </div>
              <div>
                <p className="font-semibold text-stone-900 mb-1">
                  {language === 'fr' ? 'Email' : 'Email'}
                </p>
                <p>
                  <a href="mailto:info@purepeelco.com" className="text-amber-600 hover:text-amber-700">
                    info@purepeelco.com
                  </a>
                </p>
              </div>
              <div>
                <p className="font-semibold text-stone-900 mb-1">
                  {language === 'fr' ? 'Réseaux sociaux' : 'Social Media'}
                </p>
                <p>
                  <a 
                    href="https://www.instagram.com/purepeelco/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700"
                  >
                    @purepeelco
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

