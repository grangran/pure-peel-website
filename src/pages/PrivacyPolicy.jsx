import { useScrollReveal } from "../hooks/useScrollReveal"

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Pure Peel Co. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases. Please read this privacy policy carefully.
            </p>
          </div>

          {/* Information We Collect */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-3">We collect information that you provide directly to us when you:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Place an order:</strong> Name, email address, phone number, shipping address, billing address</li>
              <li><strong>Make a payment:</strong> Payment information is processed securely through Stripe (we do not store your full payment details)</li>
              <li><strong>Contact us:</strong> Name, email address, and any message content</li>
              <li><strong>Track your order:</strong> Order number and email address for order lookup</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We also automatically collect certain information when you visit our website, such as your IP address, browser type, device information, and pages you visit.
            </p>
          </div>

          {/* How We Use Your Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Process and fulfill your orders</li>
              <li>Send you order confirmations and shipping notifications</li>
              <li>Communicate with you about your orders, products, and services</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          {/* Third-Party Services */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 mb-3">We use the following third-party services that may collect or process your information:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Stripe:</strong> Payment processing. Stripe handles all payment information securely. See Stripe's privacy policy at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">stripe.com/privacy</a></li>
              <li><strong>Canada Post:</strong> Shipping services. We share your shipping address with Canada Post to fulfill orders. See Canada Post's privacy policy at <a href="https://www.canadapost.ca/cpc/en/privacypolicy.page" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">canadapost.ca</a></li>
              <li><strong>Resend:</strong> Email delivery service. We use Resend to send order confirmations and notifications. See Resend's privacy policy at <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">resend.com</a></li>
            </ul>
          </div>

          {/* Cookies and Tracking */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 mb-3">
              We may use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small data files stored on your device that help us remember your preferences and improve site functionality.
            </p>
            <p className="text-gray-700 mb-3">Types of cookies we use:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., shopping cart, authentication)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can control cookies through your browser settings, though disabling cookies may affect website functionality. Most browsers allow you to refuse cookies or alert you when cookies are being sent.
            </p>
          </div>

          {/* Data Retention */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 mb-3">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Order Information:</strong> Retained for 7 years for tax and accounting purposes</li>
              <li><strong>Customer Contact Information:</strong> Retained while you have an active account or as needed to provide services</li>
              <li><strong>Marketing Communications:</strong> Retained until you opt-out or request deletion</li>
            </ul>
            <p className="text-gray-700 mt-4">
              When we no longer need your personal information, we will securely delete or anonymize it in accordance with our data retention policies.
            </p>
          </div>

          {/* Children's Privacy */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to delete that information.
            </p>
          </div>

          {/* Canadian Privacy Laws */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Canadian Privacy Laws</h2>
            <p className="text-gray-700 mb-3">
              As a Canadian business, we comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation. Under PIPEDA, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Know why we collect, use, or disclose your personal information</li>
              <li>Expect us to collect, use, or disclose your personal information reasonably and appropriately</li>
              <li>Access your personal information held by us</li>
              <li>Challenge the accuracy and completeness of your information</li>
              <li>Have your information amended if it is inaccurate or incomplete</li>
            </ul>
          </div>

          {/* Marketing Communications */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketing Communications</h2>
            <p className="text-gray-700 mb-3">
              If you have provided your email address, we may send you promotional emails about our products, special offers, and updates. You can opt-out of these communications at any time by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Clicking the "unsubscribe" link in any marketing email</li>
              <li>Contacting us directly at <a href="mailto:privacy@purepeelco.com" className="text-amber-600 hover:text-amber-700">privacy@purepeelco.com</a></li>
            </ul>
            <p className="text-gray-700 mt-4">
              Please note that even if you opt-out of marketing communications, we may still send you transactional emails related to your orders, such as order confirmations and shipping notifications.
            </p>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal information (subject to legal obligations)</li>
              <li>Opt-out of marketing communications (you can unsubscribe from emails at any time)</li>
              <li>File a complaint with relevant data protection authorities</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </div>

          {/* Changes to Privacy Policy */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </div>

          {/* Data Storage and Location */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Storage and Location</h2>
            <p className="text-gray-700 leading-relaxed">
              Your personal information is stored on secure servers located in Canada. We take appropriate measures to ensure that your data is protected and handled in accordance with Canadian privacy laws. Some third-party services we use (such as Stripe and Resend) may process data in other jurisdictions, but they are required to maintain appropriate security measures and comply with applicable privacy laws.
            </p>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-3">If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:</p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <strong>Privacy Email:</strong> <a href="mailto:privacy@purepeelco.com" className="text-amber-600 hover:text-amber-700">privacy@purepeelco.com</a>
              </p>
              <p className="text-gray-700">
                <strong>General Email:</strong> <a href="mailto:info@purepeelco.com" className="text-amber-600 hover:text-amber-700">info@purepeelco.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> Pure Peel Co., Canada
              </p>
              <p className="text-gray-700 text-sm mt-3">
                <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 30 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

