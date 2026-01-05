import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation } from "../utils/translations"

export default function ShippingReturns() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })
  const { language } = useLanguage()
  const { formatPrice, currency } = useCurrency()

  return (
    <section 
      ref={sectionRef} 
      className={`py-8 md:py-12 px-4 sm:px-5 bg-gray-50 min-h-screen transition-all duration-800 ${
        isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0 md:opacity-0 md:translate-y-8'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.title')}</h1>
          <p className="text-sm md:text-base text-gray-600">{getTranslation(language, 'shipping.subtitle')}</p>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{getTranslation(language, 'shipping.shippingInfo.title')}</h2>
          
          {/* Shipping to Canada */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇨🇦</span>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Canada-Wide Shipping</h3>
            </div>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              We ship to all provinces and territories across Canada.
            </p>
            <div className="space-y-3 md:space-y-4">
              <div className="border-2 border-gray-200 rounded-xl p-4 md:p-5 hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-1">{getTranslation(language, 'shipping.shippingInfo.methods.regular.name')}</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">{getTranslation(language, 'shipping.shippingInfo.methods.regular.description')}</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4">
                    <span className="text-sm md:text-base font-semibold text-gray-900 block">{getTranslation(language, 'shipping.shippingInfo.methods.regular.time')}</span>
                    <span className="text-xs text-gray-500">Starting at $12 CAD</span>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-gray-200 rounded-xl p-4 md:p-5 hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-1">{getTranslation(language, 'shipping.shippingInfo.methods.expedited.name')}</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">{getTranslation(language, 'shipping.shippingInfo.methods.expedited.description')}</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4">
                    <span className="text-sm md:text-base font-semibold text-gray-900 block">{getTranslation(language, 'shipping.shippingInfo.methods.expedited.time')}</span>
                    <span className="text-xs text-gray-500">Starting at $18 CAD</span>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-amber-200 bg-amber-50/30 rounded-xl p-4 md:p-5 hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-1">{getTranslation(language, 'shipping.shippingInfo.methods.xpresspost.name')}</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">{getTranslation(language, 'shipping.shippingInfo.methods.xpresspost.description')}</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4">
                    <span className="text-sm md:text-base font-semibold text-gray-900 block">{getTranslation(language, 'shipping.shippingInfo.methods.xpresspost.time')}</span>
                    <span className="text-xs text-gray-500">Starting at $22 CAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping to United States */}
          <div className="mb-5 md:mb-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇺🇸</span>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">United States-Wide Shipping</h3>
            </div>
            <p className="text-sm md:text-base text-gray-700 mb-4">
              We ship to all 50 states across America. Select 'United States' as your country during checkout to see available shipping options.
            </p>
            <div className="space-y-3 md:space-y-4">
              <div className="border-2 border-gray-200 rounded-xl p-4 md:p-5 hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-1">Tracked Packet - USA</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Standard delivery to US with tracking (4-7 business days)</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4">
                    <span className="text-sm md:text-base font-semibold text-gray-900 block">4-7 business days</span>
                    <span className="text-xs text-gray-500">Starting at {formatPrice(18)} {currency}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-gray-200 rounded-xl p-4 md:p-5 hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-1">Xpresspost - USA</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Faster delivery to US with tracking and insurance (2-3 business days)</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4">
                    <span className="text-sm md:text-base font-semibold text-gray-900 block">2-3 business days</span>
                    <span className="text-xs text-gray-500">Starting at {formatPrice(28)} {currency}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-amber-200 bg-amber-50/30 rounded-xl p-4 md:p-5 hover:border-amber-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-1">Priority Worldwide - USA</h4>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Express delivery to US with signature (1-2 business days)</p>
                  </div>
                  <div className="text-right sm:text-left sm:ml-4">
                    <span className="text-sm md:text-base font-semibold text-gray-900 block">1-2 business days</span>
                    <span className="text-xs text-gray-500">Starting at {formatPrice(45)} {currency}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 italic mt-4">
              Prices shown are in {currency}. Delivery times are estimates and may vary based on destination and customs processing. Packages are shipped via Canada Post and delivered by USPS within the United States.
            </p>
          </div>

          {/* Shipping Times */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.shippingTimes.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.shippingTimes.text1')}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-3">
              <p className="text-sm md:text-base text-gray-900 font-semibold mb-1">{getTranslation(language, 'shipping.shippingTimes.processingSchedule')}</p>
              <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-gray-700 ml-2 md:ml-4">
                <li>{getTranslation(language, 'shipping.shippingTimes.schedule1')}</li>
                <li>{getTranslation(language, 'shipping.shippingTimes.schedule2')}</li>
                <li>{getTranslation(language, 'shipping.shippingTimes.schedule3')}</li>
              </ul>
            </div>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.shippingTimes.text2')}
            </p>
            <p className="text-sm md:text-base text-gray-700">
              <strong>{getTranslation(language, 'shipping.shippingTimes.note')}</strong>
            </p>
          </div>

          {/* Shipping Costs */}
          <div className="mb-5 md:mb-6 pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.shippingCosts.title')}</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-5 mb-3">
              <p className="text-sm md:text-base text-gray-900 font-semibold mb-2">How Shipping Costs Work:</p>
              <ul className="list-disc list-inside space-y-1.5 text-xs md:text-sm text-gray-700 ml-2">
                <li>Shipping costs are calculated automatically at checkout based on your destination</li>
                <li>Rates vary by location, package weight, and selected shipping method</li>
                <li>Canada: Starting at {formatPrice(12)} {currency} for Regular Parcel</li>
                <li>United States: Starting at {formatPrice(18)} {currency} for Tracked Packet</li>
                <li>All prices shown are in {currency} - use the currency selector in the navigation to switch between CAD and USD</li>
              </ul>
            </div>
            <p className="text-sm md:text-base text-gray-700">
              {getTranslation(language, 'shipping.shippingCosts.text1')}
            </p>
          </div>

          {/* Order Tracking */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.orderTracking.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.orderTracking.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-gray-700 ml-2 md:ml-4">
              <li>{getTranslation(language, 'shipping.orderTracking.item1')}</li>
              <li>{getTranslation(language, 'shipping.orderTracking.item2')} <a href="https://www.canadapost.ca/trackweb" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">canadapost.ca/trackweb</a></li>
              <li>{getTranslation(language, 'shipping.orderTracking.item3')} <a href="/order-tracking" className="text-amber-600 hover:text-amber-700">{getTranslation(language, 'shipping.orderTracking.trackYourOrder')}</a></li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              {getTranslation(language, 'shipping.orderTracking.text2')}
            </p>
          </div>

          {/* Damaged or Lost Packages */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.damagedOrLost.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.damagedOrLost.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-gray-700 ml-2 md:ml-4">
              <li><strong>{getTranslation(language, 'shipping.damagedOrLost.damagedItems')}</strong></li>
              <li><strong>{getTranslation(language, 'shipping.damagedOrLost.lostPackages')}</strong></li>
              <li><strong>{getTranslation(language, 'shipping.damagedOrLost.incorrectItems')}</strong></li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              {getTranslation(language, 'shipping.damagedOrLost.text2')}
            </p>
          </div>


          {/* International Shipping */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.internationalShipping.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.internationalShipping.text1')} <a href="mailto:shipping@purepeelco.com" className="text-amber-600 hover:text-amber-700">shipping@purepeelco.com</a>.
            </p>
            <p className="text-sm md:text-base text-gray-700">
              {getTranslation(language, 'shipping.internationalShipping.text2')}
            </p>
          </div>
        </div>

        {/* Issue Resolution & Product Replacement */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{getTranslation(language, 'shipping.returns.title')}</h2>
          
          {/* No Returns Policy */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.policy.title')}</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
              <p className="text-sm md:text-base text-gray-900 font-semibold mb-2">{getTranslation(language, 'shipping.returns.policy.noReturns')}</p>
              <p className="text-xs md:text-sm text-gray-700">
                {getTranslation(language, 'shipping.returns.policy.noReturnsText')}
              </p>
            </div>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.returns.policy.commitment')}
            </p>
          </div>

          {/* Issue Resolution Process */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.howWeResolve.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
              {getTranslation(language, 'shipping.returns.howWeResolve.text1')}
            </p>
            <ol className="list-decimal list-inside space-y-2 md:space-y-3 text-xs md:text-sm text-gray-700 ml-2 md:ml-4">
              <li>
                <strong>{getTranslation(language, 'shipping.returns.howWeResolve.step1')}</strong> <a href="mailto:support@purepeelco.com" className="text-amber-600 hover:text-amber-700">support@purepeelco.com</a> {getTranslation(language, 'shipping.returns.howWeResolve.step1Text')}
              </li>
              <li>
                <strong>{getTranslation(language, 'shipping.returns.howWeResolve.step2')}</strong>
              </li>
              <li>
                <strong>{getTranslation(language, 'shipping.returns.howWeResolve.step3')}</strong>
              </li>
              <li>
                <strong>{getTranslation(language, 'shipping.returns.howWeResolve.step4')}</strong>
              </li>
            </ol>
          </div>

          {/* Common Issues We Resolve */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.issuesWeResolve.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">{getTranslation(language, 'shipping.returns.issuesWeResolve.text1')}</p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-gray-700 ml-2 md:ml-4">
              <li><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.damagedPackaging')}</strong></li>
              <li><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.qualityIssues')}</strong></li>
              <li><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.incorrectItems')}</strong></li>
              <li><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.missingItems')}</strong></li>
              <li><strong>{getTranslation(language, 'shipping.returns.issuesWeResolve.shippingDamage')}</strong></li>
            </ul>
          </div>

          {/* Replacement Process */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.replacementProcess.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.returns.replacementProcess.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-gray-700 ml-2 md:ml-4">
              <li>{getTranslation(language, 'shipping.returns.replacementProcess.item1')}</li>
              <li>{getTranslation(language, 'shipping.returns.replacementProcess.item2')}</li>
              <li>{getTranslation(language, 'shipping.returns.replacementProcess.item3')}</li>
              <li>{getTranslation(language, 'shipping.returns.replacementProcess.item4')}</li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              <strong>{getTranslation(language, 'shipping.returns.replacementProcess.note')}</strong>
            </p>
          </div>

          {/* Satisfaction Guarantee */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.commitment.title')}</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base text-gray-900 font-semibold mb-2">{getTranslation(language, 'shipping.returns.commitment.guarantee')}</p>
              <p className="text-xs md:text-sm text-gray-700">
                {getTranslation(language, 'shipping.returns.commitment.text')}
              </p>
            </div>
          </div>

          {/* Contact for Issues */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.returns.needHelp.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.returns.needHelp.text1')}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base text-gray-700 mb-2">
                <strong>{getTranslation(language, 'shipping.returns.needHelp.email')}</strong> <a href="mailto:support@purepeelco.com" className="text-amber-600 hover:text-amber-700">support@purepeelco.com</a>
              </p>
              <p className="text-xs md:text-sm text-gray-700">
                {getTranslation(language, 'shipping.returns.needHelp.text2')}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 mt-6 md:mt-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{getTranslation(language, 'shipping.additionalInfo.title')}</h2>
          
          {/* Business Hours */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.additionalInfo.businessHours.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.additionalInfo.businessHours.text1')}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base text-gray-700"><strong>{getTranslation(language, 'shipping.additionalInfo.businessHours.mondayFriday')}</strong> 9:00 AM - 5:00 PM EST</p>
              <p className="text-sm md:text-base text-gray-700 mt-2"><strong>{getTranslation(language, 'shipping.additionalInfo.businessHours.saturdaySunday')}</strong> {getTranslation(language, 'shipping.additionalInfo.businessHours.closed')}</p>
              <p className="text-xs md:text-sm text-gray-700 mt-2">{getTranslation(language, 'shipping.additionalInfo.businessHours.responseTime')}</p>
            </div>
          </div>

          {/* Packaging */}
          <div className="mb-5 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.additionalInfo.packaging.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.additionalInfo.packaging.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-gray-700 ml-2 md:ml-4">
              <li>{getTranslation(language, 'shipping.additionalInfo.packaging.item1')}</li>
              <li>{getTranslation(language, 'shipping.additionalInfo.packaging.item2')}</li>
              <li>{getTranslation(language, 'shipping.additionalInfo.packaging.item3')}</li>
            </ul>
          </div>

          {/* Special Orders */}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.additionalInfo.specialOrders.title')}</h3>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              {getTranslation(language, 'shipping.additionalInfo.specialOrders.text1')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs md:text-sm text-gray-700 ml-2 md:ml-4">
              <li>{getTranslation(language, 'shipping.additionalInfo.specialOrders.item1')}</li>
              <li>{getTranslation(language, 'shipping.additionalInfo.specialOrders.item2')}</li>
              <li>{getTranslation(language, 'shipping.additionalInfo.specialOrders.item3')}</li>
            </ul>
            <p className="text-sm md:text-base text-gray-700 mt-4">
              {getTranslation(language, 'shipping.additionalInfo.specialOrders.text2')} <a href="mailto:orders@purepeelco.com" className="text-amber-600 hover:text-amber-700">orders@purepeelco.com</a> {getTranslation(language, 'shipping.additionalInfo.specialOrders.text3')}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 mt-6 md:mt-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{getTranslation(language, 'shipping.contact.title')}</h2>
          <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">
            {getTranslation(language, 'shipping.contact.text1')}
          </p>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
            <p className="text-sm md:text-base text-gray-700">
              <strong>{getTranslation(language, 'shipping.contact.shippingInquiries')}</strong> <a href="mailto:shipping@purepeelco.com" className="text-amber-600 hover:text-amber-700">shipping@purepeelco.com</a>
            </p>
            <p className="text-sm md:text-base text-gray-700">
              <strong>{getTranslation(language, 'shipping.contact.productIssues')}</strong> <a href="mailto:support@purepeelco.com" className="text-amber-600 hover:text-amber-700">support@purepeelco.com</a>
            </p>
            <p className="text-sm md:text-base text-gray-700">
              <strong>{getTranslation(language, 'shipping.contact.generalInquiries')}</strong> <a href="mailto:info@purepeelco.com" className="text-amber-600 hover:text-amber-700">info@purepeelco.com</a>
            </p>
            <p className="text-sm md:text-base text-gray-700">
              <strong>{getTranslation(language, 'shipping.contact.bulkOrders')}</strong> <a href="mailto:orders@purepeelco.com" className="text-amber-600 hover:text-amber-700">orders@purepeelco.com</a>
            </p>
            <p className="text-xs md:text-sm text-gray-700 mt-3">
              <strong>{getTranslation(language, 'shipping.contact.responseTime')}</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

