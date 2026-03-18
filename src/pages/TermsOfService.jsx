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

export default function TermsOfService() {
  const [sectionRef] = useScrollReveal({ threshold: 0.1 })
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
            {getTranslation(language, 'terms.title')}
          </h1>
          <p style={{ fontFamily: S.sans, fontSize: "0.68rem", fontWeight: 300, color: S.textLight }}>
            {getTranslation(language, 'terms.lastUpdated')}{' '}
            {new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content card */}
        <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${S.border}`, padding: "40px 40px 48px" }}>

          {/* Introduction */}
          <SectionTitle>{getTranslation(language, 'terms.introduction.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.introduction.text')}</Body>

          <Divider />

          {/* Acceptance */}
          <SectionTitle>{getTranslation(language, 'terms.acceptance.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.acceptance.text')}</Body>

          <Divider />

          {/* Products and Pricing */}
          <SectionTitle>{getTranslation(language, 'terms.products.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.products.text')}</Body>
          <BulletList items={[
            getTranslation(language, 'terms.products.pricing'),
            getTranslation(language, 'terms.products.availability'),
            getTranslation(language, 'terms.products.descriptions'),
          ]} />

          <Divider />

          {/* Orders and Payment */}
          <SectionTitle>{getTranslation(language, 'terms.orders.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.orders.text')}</Body>
          <BulletList items={[
            getTranslation(language, 'terms.orders.acceptance'),
            getTranslation(language, 'terms.orders.payment'),
            getTranslation(language, 'terms.orders.confirmation'),
            getTranslation(language, 'terms.orders.cancellation'),
          ]} />

          <Divider />

          {/* Taxes */}
          <SectionTitle>{getTranslation(language, 'terms.taxes.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.taxes.text')}</Body>
          <BulletList items={[
            getTranslation(language, 'terms.taxes.zeroRated'),
            getTranslation(language, 'terms.taxes.shippingTax'),
            getTranslation(language, 'terms.taxes.compliance'),
          ]} />

          <Divider />

          {/* Shipping */}
          <SectionTitle>{getTranslation(language, 'terms.shipping.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.shipping.text')}</Body>
          <BulletList items={[
            getTranslation(language, 'terms.shipping.rates'),
            getTranslation(language, 'terms.shipping.timing'),
            getTranslation(language, 'terms.shipping.risk'),
            getTranslation(language, 'terms.shipping.delays'),
          ]} />

          <Divider />

          {/* Returns */}
          <SectionTitle>{getTranslation(language, 'terms.returns.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.returns.text')}</Body>
          <BulletList items={[
            getTranslation(language, 'terms.returns.noReturns'),
            getTranslation(language, 'terms.returns.qualityGuarantee'),
            getTranslation(language, 'terms.returns.replacement'),
            getTranslation(language, 'terms.returns.refunds'),
            getTranslation(language, 'terms.returns.contact'),
          ]} />

          <Divider />

          {/* Intellectual Property */}
          <SectionTitle>{getTranslation(language, 'terms.intellectualProperty.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.intellectualProperty.text')}</Body>

          <Divider />

          {/* Limitation of Liability */}
          <SectionTitle>{getTranslation(language, 'terms.liability.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.liability.text')}</Body>
          <Body>{getTranslation(language, 'terms.liability.limitation')}</Body>
          <Body>{getTranslation(language, 'terms.liability.foodProducts')}</Body>
          <Body>{getTranslation(language, 'terms.liability.noWarranty')}</Body>

          <Divider />

          {/* Force Majeure */}
          <SectionTitle>{getTranslation(language, 'terms.forceMajeure.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.forceMajeure.text')}</Body>

          <Divider />

          {/* Website Use */}
          <SectionTitle>{getTranslation(language, 'terms.websiteUse.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.websiteUse.text')}</Body>
          <BulletList items={getTranslation(language, 'terms.websiteUse.restrictions')} />

          <Divider />

          {/* Product Images */}
          <SectionTitle>{getTranslation(language, 'terms.productImages.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.productImages.text')}</Body>

          <Divider />

          {/* Age Restriction */}
          <SectionTitle>{getTranslation(language, 'terms.ageRestriction.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.ageRestriction.text')}</Body>

          <Divider />

          {/* Dispute Resolution */}
          <SectionTitle>{getTranslation(language, 'terms.disputeResolution.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.disputeResolution.text')}</Body>

          <Divider />

          {/* Governing Law */}
          <SectionTitle>{getTranslation(language, 'terms.governingLaw.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.governingLaw.text')}</Body>
          <Body>{getTranslation(language, 'terms.governingLaw.consumerProtection')}</Body>

          <Divider />

          {/* Changes to Terms */}
          <SectionTitle>{getTranslation(language, 'terms.changes.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.changes.text')}</Body>

          <Divider />

          {/* Contact */}
          <SectionTitle>{getTranslation(language, 'terms.contact.title')}</SectionTitle>
          <Body>{getTranslation(language, 'terms.contact.text')}</Body>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'terms.contact.email')}</strong>{' '}
              <a href="mailto:hello@purepeelco.com"
                style={{ color: S.orange, fontWeight: 300, textDecoration: "none" }}
                onMouseEnter={e => e.target.style.textDecoration = "underline"}
                onMouseLeave={e => e.target.style.textDecoration = "none"}
              >info@purepeelco.com</a>
            </p>
          </InfoBox>

        </div>

        
      </div>
    </section>
  )
}
