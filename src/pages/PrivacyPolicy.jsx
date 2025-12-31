import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

export default function PrivacyPolicy() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })
  const { language } = useLanguage()

  return (
    <section 
      ref={sectionRef} 
      className={`py-8 md:py-12 px-4 sm:px-5 bg-gray-50 min-h-screen transition-all duration-800 ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.title')}</h1>
          <p className="text-sm md:text-base text-gray-600">{getTranslation(language, 'privacy.lastUpdated')} {new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
          {/* Introduction */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.introduction.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {getTranslation(language, 'privacy.introduction.text')}
            </p>
          </div>

          {/* Information We Collect */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.informationWeCollect.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">{getTranslation(language, 'privacy.informationWeCollect.text')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4">
              <li><strong>{getTranslation(language, 'privacy.informationWeCollect.placeOrder')}</strong></li>
              <li><strong>{getTranslation(language, 'privacy.informationWeCollect.makePayment')}</strong></li>
              <li><strong>{getTranslation(language, 'privacy.informationWeCollect.contactUs')}</strong></li>
              <li><strong>{getTranslation(language, 'privacy.informationWeCollect.trackOrder')}</strong></li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              {getTranslation(language, 'privacy.informationWeCollect.automatic')}
            </p>
          </div>

          {/* How We Use Your Information */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.howWeUse.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">{getTranslation(language, 'privacy.howWeUse.text')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4">
              {getTranslation(language, 'privacy.howWeUse.items').map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Third-Party Services */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.thirdPartyServices.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">{getTranslation(language, 'privacy.thirdPartyServices.text')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4">
              <li><strong>{getTranslation(language, 'privacy.thirdPartyServices.stripe')}</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">stripe.com/privacy</a></li>
              <li><strong>{getTranslation(language, 'privacy.thirdPartyServices.canadaPost')}</strong> <a href="https://www.canadapost.ca/cpc/en/privacypolicy.page" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">canadapost.ca</a></li>
              <li><strong>{getTranslation(language, 'privacy.thirdPartyServices.resend')}</strong> <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">resend.com</a></li>
            </ul>
          </div>

          {/* Cookies and Tracking */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.cookiesAndTracking.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'privacy.cookiesAndTracking.text1')}
            </p>
            <p className="text-sm md:text-base text-gray-700 mb-3">{getTranslation(language, 'privacy.cookiesAndTracking.text2')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4">
              <li><strong>{getTranslation(language, 'privacy.cookiesAndTracking.essential')}</strong></li>
              <li><strong>{getTranslation(language, 'privacy.cookiesAndTracking.analytics')}</strong></li>
              <li><strong>{getTranslation(language, 'privacy.cookiesAndTracking.preference')}</strong></li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              {getTranslation(language, 'privacy.cookiesAndTracking.text3')}
            </p>
          </div>

          {/* Data Retention */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.dataRetention.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'privacy.dataRetention.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4">
              <li><strong>{getTranslation(language, 'privacy.dataRetention.orderInfo')}</strong></li>
              <li><strong>{getTranslation(language, 'privacy.dataRetention.customerContact')}</strong></li>
              <li><strong>{getTranslation(language, 'privacy.dataRetention.marketing')}</strong></li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              {getTranslation(language, 'privacy.dataRetention.text2')}
            </p>
          </div>

          {/* Children's Privacy */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.childrensPrivacy.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {getTranslation(language, 'privacy.childrensPrivacy.text')}
            </p>
          </div>

          {/* Canadian Privacy Laws */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.canadianPrivacyLaws.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'privacy.canadianPrivacyLaws.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4">
              <li>{getTranslation(language, 'privacy.canadianPrivacyLaws.right1')}</li>
              <li>{getTranslation(language, 'privacy.canadianPrivacyLaws.right2')}</li>
              <li>{getTranslation(language, 'privacy.canadianPrivacyLaws.right3')}</li>
              <li>{getTranslation(language, 'privacy.canadianPrivacyLaws.right4')}</li>
              <li>{getTranslation(language, 'privacy.canadianPrivacyLaws.right5')}</li>
            </ul>
          </div>

          {/* Marketing Communications */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.marketingCommunications.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'privacy.marketingCommunications.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4">
              <li>{getTranslation(language, 'privacy.marketingCommunications.item1')}</li>
              <li>{getTranslation(language, 'privacy.marketingCommunications.item2')} <a href="mailto:privacy@purepeelco.com" className="text-amber-600 hover:text-amber-700">privacy@purepeelco.com</a></li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              {getTranslation(language, 'privacy.marketingCommunications.text2')}
            </p>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.dataSecurity.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {getTranslation(language, 'privacy.dataSecurity.text')}
            </p>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.yourRights.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">{getTranslation(language, 'privacy.yourRights.text1')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700 ml-2 md:ml-4">
              <li>{getTranslation(language, 'privacy.yourRights.right1')}</li>
              <li>{getTranslation(language, 'privacy.yourRights.right2')}</li>
              <li>{getTranslation(language, 'privacy.yourRights.right3')}</li>
              <li>{getTranslation(language, 'privacy.yourRights.right4')}</li>
              <li>{getTranslation(language, 'privacy.yourRights.right5')}</li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              {getTranslation(language, 'privacy.yourRights.text2')}
            </p>
          </div>

          {/* Changes to Privacy Policy */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.changesToPolicy.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {getTranslation(language, 'privacy.changesToPolicy.text')}
            </p>
          </div>

          {/* Data Storage and Location */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.dataStorage.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {getTranslation(language, 'privacy.dataStorage.text')}
            </p>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-4 md:pt-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'privacy.contact.title')}</h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">{getTranslation(language, 'privacy.contact.text')}</p>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
              <p className="text-sm md:text-base text-gray-700">
                <strong>{getTranslation(language, 'privacy.contact.privacyEmail')}</strong> <a href="mailto:privacy@purepeelco.com" className="text-amber-600 hover:text-amber-700">privacy@purepeelco.com</a>
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <strong>{getTranslation(language, 'privacy.contact.generalEmail')}</strong> <a href="mailto:info@purepeelco.com" className="text-amber-600 hover:text-amber-700">info@purepeelco.com</a>
              </p>
              <p className="text-sm md:text-base text-gray-700">
                <strong>{getTranslation(language, 'privacy.contact.address')}</strong> Pure Peel Co., Canada
              </p>
              <p className="text-xs md:text-sm text-gray-700 mt-3">
                <strong>{getTranslation(language, 'privacy.contact.responseTime')}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

