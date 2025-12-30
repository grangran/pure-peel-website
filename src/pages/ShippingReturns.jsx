import { useScrollReveal } from "../hooks/useScrollReveal"

export default function ShippingReturns() {
  const [sectionRef, isSectionVisible] = useScrollReveal({ threshold: 0.1 })

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping & Returns</h1>
          <p className="text-gray-600">Information about our shipping methods and return policy</p>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
          
          {/* Shipping Methods */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping Methods</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Regular Parcel</h4>
                  <span className="text-sm font-medium text-gray-600">5-7 business days</span>
                </div>
                <p className="text-gray-700 text-sm">Standard delivery within Canada with tracking</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Expedited Parcel</h4>
                  <span className="text-sm font-medium text-gray-600">3-5 business days</span>
                </div>
                <p className="text-gray-700 text-sm">Faster delivery with tracking and signature confirmation</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Xpresspost</h4>
                  <span className="text-sm font-medium text-gray-600">2-3 business days</span>
                </div>
                <p className="text-gray-700 text-sm">Express delivery with signature confirmation and priority handling</p>
              </div>
            </div>
          </div>

          {/* Shipping Times */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping Times</h3>
            <p className="text-gray-700 mb-3">
              Orders are typically processed within 1-2 business days (Monday-Friday, excluding holidays). Orders placed after 2:00 PM EST may be processed the next business day.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
              <p className="text-gray-900 font-semibold mb-1">Processing Schedule</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                <li>Orders placed Monday-Thursday before 2:00 PM EST: Processed within 24 hours</li>
                <li>Orders placed Friday-Sunday: Processed the following Monday</li>
                <li>Holiday orders: May experience additional processing delays</li>
              </ul>
            </div>
            <p className="text-gray-700 mb-3">
              Shipping times are calculated from the date your order ships, not from the date you place your order. You will receive a shipping confirmation email with a tracking number once your order has been shipped.
            </p>
            <p className="text-gray-700">
              <strong>Note:</strong> Shipping times may be longer during peak seasons (holidays, special promotions) or due to weather conditions, postal service delays, or remote locations. We will notify you via email if there are any significant delays.
            </p>
          </div>

          {/* Shipping Costs */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping Costs</h3>
            <p className="text-gray-700 mb-3">
              Shipping costs are calculated based on your location, package weight, and selected shipping method. Rates are displayed at checkout before you complete your purchase.
            </p>
            <p className="text-gray-700 text-sm">
              All orders require shipping fees. Rates start from approximately $10 CAD for Regular Parcel within Canada.
            </p>
          </div>

          {/* Order Tracking */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Tracking</h3>
            <p className="text-gray-700 mb-3">
              Once your order ships, you will receive an email with a tracking number. You can track your package using:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>The tracking link provided in your shipping confirmation email</li>
              <li>Canada Post's website: <a href="https://www.canadapost.ca/trackweb" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">canadapost.ca/trackweb</a></li>
              <li>Our order tracking page: <a href="/order-tracking" className="text-amber-600 hover:text-amber-700">Track Your Order</a></li>
            </ul>
            <p className="text-gray-700 mt-4">
              Tracking information is typically available within 24 hours of shipment. If you don't receive a tracking number within 3 business days, please contact us.
            </p>
          </div>

          {/* Damaged or Lost Packages */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Damaged or Lost Packages</h3>
            <p className="text-gray-700 mb-3">
              If your package arrives damaged or is lost in transit, please contact us immediately:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Damaged Items:</strong> Take photos of the damaged package and items, then contact us within 48 hours of delivery</li>
              <li><strong>Lost Packages:</strong> Contact us if your package hasn't arrived within 10 business days of the expected delivery date</li>
              <li><strong>Incorrect Items:</strong> Contact us immediately if you received the wrong items</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We will work with Canada Post to resolve the issue and will replace or refund your order as appropriate. We may require photos or additional information to process your claim.
            </p>
          </div>

          {/* International Shipping */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">International Shipping</h3>
            <p className="text-gray-700 mb-3">
              Currently, we only ship within Canada. If you're interested in international shipping, please contact us at <a href="mailto:shipping@purepeelco.com" className="text-amber-600 hover:text-amber-700">shipping@purepeelco.com</a>.
            </p>
            <p className="text-gray-700">
              We're working on expanding our shipping options. Sign up for our newsletter to be notified when international shipping becomes available.
            </p>
          </div>
        </div>

        {/* Issue Resolution & Product Replacement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Issue Resolution & Product Replacement</h2>
          
          {/* No Returns Policy */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Policy</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-gray-900 font-semibold mb-2">No Returns on Food Products</p>
              <p className="text-gray-700 text-sm">
                Due to health and safety regulations, we cannot accept returns on food products once they have been shipped. This policy ensures the safety and quality of our products for all customers.
              </p>
            </div>
            <p className="text-gray-700 mb-3">
              We are committed to your satisfaction. If you experience any issues with your order, we will work with you to resolve the problem and send a replacement product at no additional cost.
            </p>
          </div>

          {/* Issue Resolution Process */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">How We Resolve Issues</h3>
            <p className="text-gray-700 mb-4">
              If you encounter any problems with your order, please contact us immediately. We will investigate the issue and send you a replacement product right away.
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
              <li>
                <strong>Contact Us:</strong> Email us at <a href="mailto:support@purepeelco.com" className="text-amber-600 hover:text-amber-700">support@purepeelco.com</a> with your order number and a description of the issue
              </li>
              <li>
                <strong>We Investigate:</strong> Our team will review your concern and may request photos or additional information
              </li>
              <li>
                <strong>Replacement Sent:</strong> Once we confirm the issue, we'll immediately send you a replacement product at no charge
              </li>
              <li>
                <strong>You Keep the Original:</strong> Since we cannot accept returns, you may keep or dispose of the original product as needed
              </li>
            </ol>
          </div>

          {/* Common Issues We Resolve */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Issues We Resolve</h3>
            <p className="text-gray-700 mb-3">We will send a replacement product for the following situations:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Damaged Packaging:</strong> If your product arrives with damaged or compromised packaging</li>
              <li><strong>Quality Issues:</strong> If the product quality doesn't meet our standards</li>
              <li><strong>Incorrect Items:</strong> If you received the wrong product or variant</li>
              <li><strong>Missing Items:</strong> If items are missing from your order</li>
              <li><strong>Shipping Damage:</strong> If products are damaged during transit</li>
            </ul>
          </div>

          {/* Replacement Process */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Replacement Process</h3>
            <p className="text-gray-700 mb-3">
              When we send a replacement product:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Replacement products are shipped at no cost to you</li>
              <li>You will receive a new tracking number for your replacement order</li>
              <li>Replacements are processed within 1-2 business days</li>
              <li>You will receive email confirmation when your replacement ships</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Note:</strong> We may ask you to provide photos of the issue to help us improve our packaging and quality control processes.
            </p>
          </div>

          {/* Satisfaction Guarantee */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Commitment</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-gray-900 font-semibold mb-2">100% Satisfaction Guarantee</p>
              <p className="text-gray-700 text-sm">
                Your satisfaction is our priority. If you're not happy with your purchase for any reason, contact us and we will work with you to make it right. We stand behind the quality of our products and will ensure you receive exactly what you ordered in perfect condition.
              </p>
            </div>
          </div>

          {/* Contact for Issues */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-700 mb-3">
              If you have any concerns about your order, please don't hesitate to reach out:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> <a href="mailto:support@purepeelco.com" className="text-amber-600 hover:text-amber-700">support@purepeelco.com</a>
              </p>
              <p className="text-gray-700 text-sm">
                Include your order number and a description of the issue. We typically respond within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
          
          {/* Business Hours */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h3>
            <p className="text-gray-700 mb-3">
              Our customer service team is available to assist you:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM EST</p>
              <p className="text-gray-700 mt-2"><strong>Saturday - Sunday:</strong> Closed</p>
              <p className="text-gray-700 mt-2 text-sm">We respond to emails within 24-48 hours during business days.</p>
            </div>
          </div>

          {/* Packaging */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Packaging</h3>
            <p className="text-gray-700 mb-3">
              All orders are carefully packaged to ensure your products arrive in perfect condition:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Products are sealed in airtight packaging to maintain freshness</li>
              <li>Orders are shipped in sturdy boxes with protective padding</li>
              <li>Fragile items are marked and handled with extra care</li>
            </ul>
          </div>

          {/* Special Orders */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Special Orders & Bulk Purchases</h3>
            <p className="text-gray-700 mb-3">
              Need a large quantity for an event or business? We offer special pricing for bulk orders:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Bulk orders (10+ units) may qualify for discounted pricing</li>
              <li>Custom packaging options available for corporate gifts</li>
              <li>Extended processing times may apply for large orders</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Contact us at <a href="mailto:orders@purepeelco.com" className="text-amber-600 hover:text-amber-700">orders@purepeelco.com</a> to discuss your needs.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Shipping or Returns?</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about our shipping or return policies, please don't hesitate to contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-gray-700">
              <strong>Shipping Inquiries:</strong> <a href="mailto:shipping@purepeelco.com" className="text-amber-600 hover:text-amber-700">shipping@purepeelco.com</a>
            </p>
            <p className="text-gray-700">
              <strong>Product Issues & Support:</strong> <a href="mailto:support@purepeelco.com" className="text-amber-600 hover:text-amber-700">support@purepeelco.com</a>
            </p>
            <p className="text-gray-700">
              <strong>General Inquiries:</strong> <a href="mailto:info@purepeelco.com" className="text-amber-600 hover:text-amber-700">info@purepeelco.com</a>
            </p>
            <p className="text-gray-700">
              <strong>Bulk Orders:</strong> <a href="mailto:orders@purepeelco.com" className="text-amber-600 hover:text-amber-700">orders@purepeelco.com</a>
            </p>
            <p className="text-gray-700 mt-3 text-sm">
              <strong>Response Time:</strong> We typically respond within 24-48 hours during business days (Monday-Friday, 9 AM - 5 PM EST).
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

