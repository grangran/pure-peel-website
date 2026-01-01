import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

export default function TermsOfService() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })
  const { language } = useLanguage()

  return (
    <section 
      ref={sectionRef} 
      className={`py-12 px-5 bg-gray-50 min-h-screen transition-all duration-800 ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.title')}</h1>
          <p className="text-gray-600">{getTranslation(language, 'terms.lastUpdated')} {new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.introduction.title')}</h2>
            <p className="text-gray-700 leading-relaxed">
              {getTranslation(language, 'terms.introduction.text')}
            </p>
          </div>

          {/* Acceptance of Terms */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.acceptance.title')}</h2>
            <p className="text-gray-700 leading-relaxed">
              {getTranslation(language, 'terms.acceptance.text')}
            </p>
          </div>

          {/* Products and Pricing */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.products.title')}</h2>
            <p className="text-gray-700 mb-3">{getTranslation(language, 'terms.products.text')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{getTranslation(language, 'terms.products.pricing')}</li>
              <li>{getTranslation(language, 'terms.products.availability')}</li>
              <li>{getTranslation(language, 'terms.products.descriptions')}</li>
            </ul>
          </div>

          {/* Orders and Payment */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.orders.title')}</h2>
            <p className="text-gray-700 mb-3">{getTranslation(language, 'terms.orders.text')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{getTranslation(language, 'terms.orders.acceptance')}</li>
              <li>{getTranslation(language, 'terms.orders.payment')}</li>
              <li>{getTranslation(language, 'terms.orders.confirmation')}</li>
              <li>{getTranslation(language, 'terms.orders.cancellation')}</li>
            </ul>
          </div>

          {/* Taxes and HST */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.taxes.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">{getTranslation(language, 'terms.taxes.text')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{getTranslation(language, 'terms.taxes.zeroRated')}</li>
              <li>{getTranslation(language, 'terms.taxes.shippingTax')}</li>
              <li>{getTranslation(language, 'terms.taxes.compliance')}</li>
            </ul>
          </div>

          {/* Shipping and Delivery */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.shipping.title')}</h2>
            <p className="text-gray-700 mb-3">{getTranslation(language, 'terms.shipping.text')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{getTranslation(language, 'terms.shipping.rates')}</li>
              <li>{getTranslation(language, 'terms.shipping.timing')}</li>
              <li>{getTranslation(language, 'terms.shipping.risk')}</li>
              <li>{getTranslation(language, 'terms.shipping.delays')}</li>
            </ul>
          </div>

          {/* Returns and Refunds */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.returns.title')}</h2>
            <p className="text-gray-700 mb-3">{getTranslation(language, 'terms.returns.text')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{getTranslation(language, 'terms.returns.noReturns')}</li>
              <li>{getTranslation(language, 'terms.returns.qualityGuarantee')}</li>
              <li>{getTranslation(language, 'terms.returns.replacement')}</li>
              <li>{getTranslation(language, 'terms.returns.refunds')}</li>
              <li>{getTranslation(language, 'terms.returns.contact')}</li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.intellectualProperty.title')}</h2>
            <p className="text-gray-700 leading-relaxed">
              {getTranslation(language, 'terms.intellectualProperty.text')}
            </p>
          </div>

          {/* Limitation of Liability */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.liability.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {getTranslation(language, 'terms.liability.text')}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {getTranslation(language, 'terms.liability.limitation')}
            </p>
          </div>

          {/* Governing Law */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.governingLaw.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {getTranslation(language, 'terms.governingLaw.text')}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {getTranslation(language, 'terms.governingLaw.consumerProtection')}
            </p>
          </div>

          {/* Changes to Terms */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.changes.title')}</h2>
            <p className="text-gray-700 leading-relaxed">
              {getTranslation(language, 'terms.changes.text')}
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTranslation(language, 'terms.contact.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              {getTranslation(language, 'terms.contact.text')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700"><strong>{getTranslation(language, 'terms.contact.email')}</strong> purepeel11@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

