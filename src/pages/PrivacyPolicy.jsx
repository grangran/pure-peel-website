import { useScrollReveal } from "../hooks/useScrollReveal"
import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

const S = {
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'Jost', sans-serif",
  dark:      "#0f0a04",
  cream:     "#faf7f2",
  creamDark: "#f2ece0",
  orange:    "#c85a08",
  border:    "rgba(15,10,4,0.08)",
  textMid:   "rgba(15,10,4,0.5)",
  textLight: "rgba(15,10,4,0.35)",
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: S.sans, fontSize: "0.65rem", fontWeight: 500,
      letterSpacing: "0.18em", textTransform: "uppercase",
      color: S.textMid, marginBottom: "12px", marginTop: "32px",
    }}>{children}</h2>
  )
}

function Body({ children, style = {} }) {
  return (
    <p style={{
      fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300,
      color: S.textMid, lineHeight: 1.85, marginBottom: "12px",
      ...style,
    }}>{children}</p>
  )
}

function BulletList({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ color: S.orange, fontFamily: S.sans, fontSize: "0.7rem", marginTop: "2px", flexShrink: 0 }}>—</span>
          <span style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, lineHeight: 1.75 }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function InfoBox({ children }) {
  return (
    <div style={{
      background: S.creamDark, borderRadius: "10px",
      border: `1px solid ${S.border}`,
      padding: "18px 22px", marginBottom: "12px",
    }}>{children}</div>
  )
}

function Divider() {
  return <div style={{ height: "1px", background: S.border, margin: "24px 0" }} />
}

function ExtLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: S.orange, fontWeight: 300, textDecoration: "none" }}
      onMouseEnter={e => e.target.style.textDecoration = "underline"}
      onMouseLeave={e => e.target.style.textDecoration = "none"}
    >{children}</a>
  )
}

function IntLink({ href, children }) {
  return (
    <a href={href}
      style={{ color: S.orange, fontWeight: 300, textDecoration: "none" }}
      onMouseEnter={e => e.target.style.textDecoration = "underline"}
      onMouseLeave={e => e.target.style.textDecoration = "none"}
    >{children}</a>
  )
}

export default function PrivacyPolicy() {
  const [sectionRef] = useScrollReveal({ threshold: 0.05 })
  const { language }  = useLanguage()

  return (
    <section ref={sectionRef} style={{ background: S.cream, minHeight: "100vh", padding: "80px 20px 96px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
            <span style={{ fontFamily: S.sans, fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(200,90,8,0.6)" }}>Pure Peel Co.</span>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
          </div>
          <h1 style={{ fontFamily: S.serif, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, fontStyle: "italic", color: S.dark, letterSpacing: "-0.01em", marginBottom: "10px" }}>
            {getTranslation(language, 'privacy.title')}
          </h1>
          <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, color: S.textLight }}>
            {getTranslation(language, 'privacy.lastUpdated')}{' '}
            {new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content card */}
        <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${S.border}`, padding: "40px 40px 48px" }}>

          {/* Introduction */}
          <SectionTitle>{getTranslation(language, 'privacy.introduction.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.introduction.text')}</Body>

          <Divider />

          {/* Information We Collect */}
          <SectionTitle>{getTranslation(language, 'privacy.informationWeCollect.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.informationWeCollect.text')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.informationWeCollect.placeOrder'),
            getTranslation(language, 'privacy.informationWeCollect.makePayment'),
            getTranslation(language, 'privacy.informationWeCollect.contactUs'),
            getTranslation(language, 'privacy.informationWeCollect.trackOrder'),
          ]} />
          <Body>{getTranslation(language, 'privacy.informationWeCollect.automatic')}</Body>

          <Divider />

          {/* How We Use */}
          <SectionTitle>{getTranslation(language, 'privacy.howWeUse.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.howWeUse.text')}</Body>
          <BulletList items={getTranslation(language, 'privacy.howWeUse.items')} />

          <Divider />

          {/* Limiting Collection */}
          <SectionTitle>{getTranslation(language, 'privacy.limitingCollection.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.limitingCollection.text1')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.limitingCollection.item1'),
            getTranslation(language, 'privacy.limitingCollection.item2'),
            getTranslation(language, 'privacy.limitingCollection.item3'),
            getTranslation(language, 'privacy.limitingCollection.item4'),
          ]} />
          <Body>{getTranslation(language, 'privacy.limitingCollection.text2')}</Body>

          <Divider />

          {/* Consent */}
          <SectionTitle>{getTranslation(language, 'privacy.consent.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.consent.text1')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.consent.explicit'),
            getTranslation(language, 'privacy.consent.implied'),
            getTranslation(language, 'privacy.consent.withdrawal'),
          ]} />
          <Body>{getTranslation(language, 'privacy.consent.text2')}</Body>

          <Divider />

          {/* Third-Party Services */}
          <SectionTitle>{getTranslation(language, 'privacy.thirdPartyServices.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.thirdPartyServices.text')}</Body>
          <BulletList items={[
            <>{getTranslation(language, 'privacy.thirdPartyServices.stripe')} <ExtLink href="https://stripe.com/privacy">stripe.com/privacy</ExtLink></>,
            <>{getTranslation(language, 'privacy.thirdPartyServices.chitchats')} <ExtLink href="https://chitchats.com">chitchats.com</ExtLink></>,
            <>{getTranslation(language, 'privacy.thirdPartyServices.resend')} <ExtLink href="https://resend.com/legal/privacy-policy">resend.com</ExtLink></>,
          ]} />

          <Divider />

          {/* Cookies */}
          <SectionTitle>{getTranslation(language, 'privacy.cookiesAndTracking.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.cookiesAndTracking.text1')}</Body>
          <Body>{getTranslation(language, 'privacy.cookiesAndTracking.text2')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.cookiesAndTracking.essential'),
            getTranslation(language, 'privacy.cookiesAndTracking.analytics'),
            getTranslation(language, 'privacy.cookiesAndTracking.preference'),
          ]} />
          <Body>{getTranslation(language, 'privacy.cookiesAndTracking.text3')}</Body>

          <Divider />

          {/* Data Retention */}
          <SectionTitle>{getTranslation(language, 'privacy.dataRetention.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.dataRetention.text1')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.dataRetention.orderInfo'),
            getTranslation(language, 'privacy.dataRetention.customerContact'),
            getTranslation(language, 'privacy.dataRetention.marketing'),
          ]} />
          <Body>{getTranslation(language, 'privacy.dataRetention.text2')}</Body>

          <Divider />

          {/* Children's Privacy */}
          <SectionTitle>{getTranslation(language, 'privacy.childrensPrivacy.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.childrensPrivacy.text')}</Body>

          <Divider />

          {/* Canadian Privacy Laws */}
          <SectionTitle>{getTranslation(language, 'privacy.canadianPrivacyLaws.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.canadianPrivacyLaws.text1')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.canadianPrivacyLaws.right1'),
            getTranslation(language, 'privacy.canadianPrivacyLaws.right2'),
            getTranslation(language, 'privacy.canadianPrivacyLaws.right3'),
            getTranslation(language, 'privacy.canadianPrivacyLaws.right4'),
            getTranslation(language, 'privacy.canadianPrivacyLaws.right5'),
            getTranslation(language, 'privacy.canadianPrivacyLaws.right6'),
          ]} />
          <Body>{getTranslation(language, 'privacy.canadianPrivacyLaws.text2')}</Body>

          <Divider />

          {/* Privacy Officer */}
          <SectionTitle>{getTranslation(language, 'privacy.privacyOfficer.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.privacyOfficer.text1')}</Body>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, marginBottom: "6px" }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.privacyOfficer.email')}</strong>{' '}
              <IntLink href="/contact?inquiryType=general">privacy@purepeelco.com</IntLink>
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.privacyOfficer.address')}</strong>{' '}
              {getTranslation(language, 'privacy.privacyOfficer.addressText')}
            </p>
          </InfoBox>
          <Body>{getTranslation(language, 'privacy.privacyOfficer.text2')}</Body>

          <Divider />

          {/* Data Breach */}
          <SectionTitle>{getTranslation(language, 'privacy.dataBreach.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.dataBreach.text1')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.dataBreach.step1'),
            getTranslation(language, 'privacy.dataBreach.step2'),
            getTranslation(language, 'privacy.dataBreach.step3'),
          ]} />
          <Body>{getTranslation(language, 'privacy.dataBreach.text2')}</Body>

          <Divider />

          {/* Data Portability */}
          <SectionTitle>{getTranslation(language, 'privacy.dataPortability.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.dataPortability.text')}</Body>

          <Divider />

          {/* Automated Decision-Making */}
          <SectionTitle>{getTranslation(language, 'privacy.automatedDecisionMaking.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.automatedDecisionMaking.text')}</Body>

          <Divider />

          {/* Cross-Border Transfers */}
          <SectionTitle>{getTranslation(language, 'privacy.crossBorderTransfers.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.crossBorderTransfers.text')}</Body>

          <Divider />

          {/* US Privacy Rights */}
          <SectionTitle>{getTranslation(language, 'privacy.usPrivacyRights.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.usPrivacyRights.text')}</Body>
          <BulletList items={getTranslation(language, 'privacy.usPrivacyRights.rights')} />
          <Body>{getTranslation(language, 'privacy.usPrivacyRights.california')}</Body>
          <Body>{getTranslation(language, 'privacy.usPrivacyRights.text2')}</Body>

          <Divider />

          {/* Marketing Communications */}
          <SectionTitle>{getTranslation(language, 'privacy.marketingCommunications.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.marketingCommunications.text1')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.marketingCommunications.item1'),
            <>{getTranslation(language, 'privacy.marketingCommunications.item2')} <IntLink href="/contact?inquiryType=general">privacy@purepeelco.com</IntLink></>,
          ]} />
          <Body>{getTranslation(language, 'privacy.marketingCommunications.text2')}</Body>

          <Divider />

          {/* Data Security */}
          <SectionTitle>{getTranslation(language, 'privacy.dataSecurity.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.dataSecurity.text')}</Body>

          <Divider />

          {/* Your Rights */}
          <SectionTitle>{getTranslation(language, 'privacy.yourRights.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.yourRights.text1')}</Body>
          <BulletList items={[
            getTranslation(language, 'privacy.yourRights.right1'),
            getTranslation(language, 'privacy.yourRights.right2'),
            getTranslation(language, 'privacy.yourRights.right3'),
            getTranslation(language, 'privacy.yourRights.right4'),
            getTranslation(language, 'privacy.yourRights.right5'),
            getTranslation(language, 'privacy.yourRights.right6'),
          ]} />
          <Body>{getTranslation(language, 'privacy.yourRights.text2')}</Body>
          <Body>{getTranslation(language, 'privacy.yourRights.text3')}</Body>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, marginBottom: "6px" }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.yourRights.commissionerWebsite')}</strong>{' '}
              <ExtLink href="https://www.priv.gc.ca">www.priv.gc.ca</ExtLink>
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, marginBottom: "6px" }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.yourRights.commissionerPhone')}</strong>
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.yourRights.commissionerAddress')}</strong>
            </p>
          </InfoBox>

          <Divider />

          {/* Changes to Policy */}
          <SectionTitle>{getTranslation(language, 'privacy.changesToPolicy.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.changesToPolicy.text')}</Body>

          <Divider />

          {/* Data Storage */}
          <SectionTitle>{getTranslation(language, 'privacy.dataStorage.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.dataStorage.text')}</Body>

          <Divider />

          {/* Contact */}
          <SectionTitle>{getTranslation(language, 'privacy.contact.title')}</SectionTitle>
          <Body>{getTranslation(language, 'privacy.contact.text')}</Body>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, marginBottom: "6px" }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.contact.privacyEmail')}</strong>{' '}
              <IntLink href="/contact?inquiryType=general">privacy@purepeelco.com</IntLink>
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, marginBottom: "6px" }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.contact.generalEmail')}</strong>{' '}
              <IntLink href="/contact?inquiryType=general">info@purepeelco.com</IntLink>
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, marginBottom: "6px" }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.contact.address')}</strong>{' '}
              {getTranslation(language, 'privacy.contact.addressText')}
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.7rem", fontWeight: 300, color: S.textLight, marginTop: "10px" }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'privacy.contact.responseTime')}</strong>
            </p>
          </InfoBox>
          <Body>{getTranslation(language, 'privacy.contact.text2')}</Body>

        </div>

    

      </div>
    </section>
  )
}