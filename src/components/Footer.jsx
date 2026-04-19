import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"
import OptimizedImage from "./OptimizedImage"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [footerRef, isFooterVisible] = useScrollReveal({ threshold: 0.05 })
  const { language } = useLanguage()


  return (
    <footer 
      ref={footerRef}
      className={`relative transition-all duration-700 ease-out ${
        isFooterVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style ={{ background: "#0f0a04"}}
    > 
    {/*Top golf line*/}
    <div 
    className="absolute top-0 left-0 right-0"
    style={{
      height: "1px",
      background: "linear-gradient(to right, transparent, rgba(232,200,74,0.3),transparent)"
    }}
    />

  <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-8">

      {/*Main footer grid*/}
      <div className="grid grid-cols-2  lg:grid-cols-6 gap-10 lg:gap-12 mb-14">

        {/*Brand column*/}
        <div>
        <div className="mb-5">
            <img 
            src="/images/logo.png"
            alt="Pure Peel Co."
            className="w-[100px] h-auto"
            width="100"
            height="102"
            sizes="100px"
            loading="lazy"
            />
          </div>
          <p className="mb-2"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(232,200,74,0.5)"
          }}
          > 
          {language === 'fr' ? 'Fabriqué au Canada' : 'Made in Canada'}
            </p>
            <p 
            style={{ 
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 300,
              lineHeight: "1.75",
              color: "rgba(250,247,242,0.3)",
              maxWidth: "180px"
            }} 
            > 
            {language === 'fr'
              ? "Tranches d'agrumes déshydratées de qualité pour les cocktails, le thé et une présentation soignée."
              : 'Premium dehydrated citrus slices for cocktails, tea, and elevated presentation.'
            }
            </p>
             </div>

             {/*Citrus Collection*/}
             <div> 
              <h4
              className="mb-5"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(250,247,242,0.9)"
              }}
              >
                {getTranslation(language, 'footer.citrusCollection')}
                </h4>
                <nav className="flex flex-col gap-3">
                  {[
                    { href: "/orange", label: getTranslation(language, 'products.orange.name') },
                    { href: "/pink-orange", label: getTranslation(language, 'products.pinkOrange.name') },
                    { href: "/lime", label: getTranslation(language, 'products.lime.name') },
                    { href: "/lemon", label: getTranslation(language, 'products.lemon.name') },
                  ].map(link => ( 
                    <a 
                    key={link.href}
                    href={link.href}
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 300,
                      color: "rgba(250,247,242,0.4)",
                      textDecoration: "none",
                      transition: "color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.color = "rgba(232,200,74,0.8)"}
                    onMouseLeave={(e) => e.target.style.color = "rgba(250,247,242,0.4)"}
                    >
                      {link.label}
                    </a>
                  ))}
                  </nav>
             </div>

             {/*Fruit Collection*/}
             <div> 
              <h4
              className="mb-5"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(250,247,242,0.9)"
              }}
               >
                {getTranslation(language, 'footer.fruitCollection')}
                </h4>
                <nav className="flex flex-col gap-3">
                  {[
                    { href: "/apple", label: getTranslation(language, 'products.apple.name') },
                    { href: "/pineapple", label: getTranslation(language, 'products.pineapple.name') },
                  ].map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.78rem",
                        fontWeight: 300,
                        color: "rgba(250,247,242,0.4)",
                        textDecoration: "none",
                        transition: "color 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.color = "rgba(232,200,74,0.8)"}
                      onMouseLeave={(e) => e.target.style.color = "rgba(250,247,242,0.4)"}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
             </div>

             {/*Support Column*/}
             <div> 
              <h4 
              className="mb-5"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(250,247,242,0.9)"
              }}
              > 
              {getTranslation(language, 'footer.support')}
              </h4>
              <nav className="flex flex-col gap-3">
                {[
                  { href: "/faq", label: getTranslation(language, 'footer.faq') },
                  { href: "/contact", label: getTranslation(language, 'footer.contact') },
                  { href: "/order-tracking", label: getTranslation(language, 'footer.trackOrder') },
                  { href: "/shipping-returns", label: getTranslation(language, 'footer.shippingReturns') },
                ].map(link => ( 
                  <a 
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 300,
                    color: "rgba(250,247,242,0.4)",
                    textDecoration: "none",
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "rgba(232,200,74,0.8)"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(250,247,242,0.4)"}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
             </div>

             {/*Legal Column*/}
             <div> 
              <h4 
              className="mb-5"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(250,247,242,0.9)"
              }} 
              > 
              {getTranslation(language, 'footer.legal')}
              </h4>
              <nav className="flex flex-col gap-3">
                {[
                  { href: "/privacy", label: getTranslation(language, 'footer.privacyPolicy') },
                  { href: "/terms", label: getTranslation(language, 'footer.termsOfService') },
                ].map(link => ( 
                  <a 
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 300,
                    color: "rgba(250,247,242,0.4)",
                    textDecoration: "none",
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "rgba(232,200,74,0.8)"}
                  onMouseLeave={(e) => e.target.style.color = "rgba(250,247,242,0.4)"}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
             </div>

             {/*Social Column*/}
             <div> 
              <h4 
              className="mb-5"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.58rem",
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(250,247,242,0.9)"
              }}
              > 
              {getTranslation(language, 'footer.followUs')}
              </h4>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/purepeelco/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 mb-3"
                style={{ textDecoration: "none" }}
              >
                <div 
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid rgba(250,247,242,0.1)",
                    background: "rgba(250,247,242,0.04)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = "1px solid rgba(232,200,74,0.3)"
                    e.currentTarget.style.background = "rgba(232,200,74,0.06)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = "1px solid rgba(250,247,242,0.1)"
                    e.currentTarget.style.background = "rgba(250,247,242,0.04)"
                  }}
                >
                  <svg
                    width="15" height="15"
                    viewBox="0 0 24 24"
                    fill="rgba(250,247,242,0.5)"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 300,
                    color: "rgba(250,247,242,0.4)",
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={e => e.target.style.color = "rgba(232,200,74,0.8)"}
                  onMouseLeave={e => e.target.style.color = "rgba(250,247,242,0.4)"}
                >
                  @purepeelco
                </span>
              </a>

              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@purepeelco"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3"
                style={{ textDecoration: "none" }}
              >
                <div 
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid rgba(250,247,242,0.1)",
                    background: "rgba(250,247,242,0.04)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = "1px solid rgba(232,200,74,0.3)"
                    e.currentTarget.style.background = "rgba(232,200,74,0.06)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = "1px solid rgba(250,247,242,0.1)"
                    e.currentTarget.style.background = "rgba(250,247,242,0.04)"
                  }}
                >
                  <svg
                    width="15" height="15"
                    viewBox="0 0 24 24"
                    fill="rgba(250,247,242,0.5)"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16.5 3.5c.5 1.4 1.7 2.5 3.1 2.9v3.1c-1.3-.1-2.5-.5-3.6-1.2v5.9c0 3.7-2.6 5.3-5.1 5.3-2.6 0-5.1-1.7-5.1-4.9 0-3.1 2.4-4.7 4.9-4.7.4 0 .8 0 1.1.1v3.1c-.3-.2-.6-.3-1-.3-1.1 0-2 0.8-2 1.9 0 1.2.9 1.9 2 1.9 1.1 0 2-.7 2-2.1V3.5h3.7z"/>
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 300,
                    color: "rgba(250,247,242,0.4)",
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={e => e.target.style.color = "rgba(232,200,74,0.8)"}
                  onMouseLeave={e => e.target.style.color = "rgba(250,247,242,0.4)"}
                >
                  @purepeelco
                </span>
              </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(250,247,242,0.06)" }}
        >
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.65rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              color: "rgba(250,247,242,0.2)"
            }}
          >
            © {currentYear} Pure Peel Co. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  )
}
               