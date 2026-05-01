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

// Shared card style
const card = {
  background: "#fff",
  borderRadius: "14px",
  border: `1px solid ${S.border}`,
  padding: "32px",
  marginBottom: "16px",
}

// Shared section heading
function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: S.sans, fontSize: "0.58rem", fontWeight: 500,
      letterSpacing: "0.22em", textTransform: "uppercase",
      color: "rgba(200,90,8,0.6)", marginBottom: "8px",
    }}>{children}</p>
  )
}

function SectionTitle({ children, size = "large" }) {
  return (
    <h2 style={{
      fontFamily: S.serif,
      fontSize: size === "large" ? "clamp(1.6rem,3vw,2.2rem)" : "1.2rem",
      fontWeight: 300, fontStyle: "italic", color: S.dark,
      marginBottom: "20px", letterSpacing: "-0.01em",
    }}>{children}</h2>
  )
}

function SubTitle({ children }) {
  return (
    <h3 style={{
      fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 500,
      letterSpacing: "0.14em", textTransform: "uppercase",
      color: S.textMid, marginBottom: "14px",
    }}>{children}</h3>
  )
}

function BodyText({ children, style = {} }) {
  return (
    <p style={{
      fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300,
      color: S.textMid, lineHeight: 1.8, marginBottom: "12px",
      ...style,
    }}>{children}</p>
  )
}

function Divider() {
  return <div style={{ height: "1px", background: S.border, margin: "28px 0" }} />
}

function InfoBox({ children, accent = S.border }) {
  return (
    <div style={{
      background: S.creamDark, borderRadius: "10px",
      border: `1px solid ${accent}`,
      padding: "20px 22px", marginBottom: "16px",
    }}>{children}</div>
  )
}

function BulletList({ items, icon = "•" }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ fontFamily: S.sans, fontSize: "0.7rem", color: S.orange, marginTop: "1px", flexShrink: 0 }}>{icon}</span>
          <span style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7 }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ShippingMethodCard({ icon, name, description, time, priceNote, highlight = false }) {
  return (
    <div style={{
      padding: "16px 20px", borderRadius: "10px",
      border: highlight ? `1.5px solid rgba(200,90,8,0.4)` : `1px solid ${S.border}`,
      background: highlight ? "rgba(200,90,8,0.03)" : "#fff",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px",
      marginBottom: "8px",
      transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
          background: highlight ? "rgba(200,90,8,0.1)" : S.creamDark,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontFamily: S.sans, fontSize: "0.82rem", fontWeight: 400, color: S.dark, marginBottom: "3px" }}>{name}</p>
          <p style={{ fontFamily: S.sans, fontSize: "0.7rem", fontWeight: 300, color: S.textLight, lineHeight: 1.6 }}>{description}</p>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 400, color: S.dark, marginBottom: "2px" }}>{time}</p>
        <p style={{ fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 300, color: S.textLight }}>{priceNote}</p>
      </div>
    </div>
  )
}

export default function ShippingReturns() {
  const [sectionRef] = useScrollReveal({ threshold: 0.1 })
  const { language } = useLanguage()

  const BoxIcon = ({ svg }) => (
    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: S.creamDark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {svg}
    </div>
  )

  return (
    <section
      key={`shipping-returns-${language}`}
      ref={sectionRef}
      style={{ background: S.cream, minHeight: "100vh", padding: "80px 20px 96px" }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
            <span style={{ fontFamily: S.sans, fontSize: "0.58rem", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(200,90,8,0.6)" }}>Pure Peel Co.</span>
            <div style={{ height: "1px", width: "20px", background: "rgba(200,90,8,0.4)" }} />
          </div>
          <h1 style={{ fontFamily: S.serif, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, fontStyle: "italic", color: S.dark, letterSpacing: "-0.01em", marginBottom: "12px" }}>
            {getTranslation(language, 'shipping.title')}
          </h1>
          <p style={{ fontFamily: S.sans, fontSize: "0.8rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" }}>
            {getTranslation(language, 'shipping.subtitle')}
          </p>
        </div>

        {/* ── SHIPPING INFORMATION ── */}
        <div style={card}>
          <SectionLabel>Shipping</SectionLabel>
          <SectionTitle>{getTranslation(language, 'shipping.shippingInfo.title')}</SectionTitle>

          {/* Canada */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "1.4rem" }}>🇨🇦</span>
            <SubTitle>{getTranslation(language, 'shipping.shippingInfo.regions.canadaTitle')}</SubTitle>
          </div>
          <BodyText>{getTranslation(language, 'shipping.shippingInfo.regions.canadaIntro')}</BodyText>

          <ShippingMethodCard
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.orange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>}
            name={getTranslation(language, 'shipping.shippingInfo.methods.canadaTracked.name')}
            description={getTranslation(language, 'shipping.shippingInfo.methods.canadaTracked.description')}
            time={getTranslation(language, 'shipping.shippingInfo.methods.canadaTracked.time')}
            priceNote={getTranslation(language, 'shipping.shippingInfo.methods.priceNote')}
            highlight
          />

          <BodyText style={{ marginTop: "12px", fontSize: "0.72rem", fontStyle: "italic" }}>
            {getTranslation(language, 'shipping.shippingInfo.fulfillmentNote')}
          </BodyText>

          <Divider />

          {/* USA shipping section hidden — Canada only for now
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "1.4rem" }}>🇺🇸</span>
            <SubTitle>{getTranslation(language, 'shipping.shippingInfo.regions.usTitle')}</SubTitle>
          </div>
          <BodyText>{getTranslation(language, 'shipping.shippingInfo.regions.usIntro')}</BodyText>

          <ShippingMethodCard
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.orange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>}
            name={getTranslation(language, 'shipping.shippingInfo.methods.usTracked.name')}
            description={getTranslation(language, 'shipping.shippingInfo.methods.usTracked.description')}
            time={getTranslation(language, 'shipping.shippingInfo.methods.usTracked.time')}
            priceNote={getTranslation(language, 'shipping.shippingInfo.methods.priceNote')}
            highlight
          />
          <BodyText style={{ marginTop: "12px", fontSize: "0.72rem", fontStyle: "italic" }}>
            {getTranslation(language, 'shipping.shippingInfo.fulfillmentNote')}
          </BodyText>

          <Divider />
          */}

          {/* Shipping Times */}
          <SubTitle>{getTranslation(language, 'shipping.shippingTimes.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.shippingTimes.text1')}</BodyText>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 500, color: S.dark, marginBottom: "10px" }}>
              {getTranslation(language, 'shipping.shippingTimes.processingSchedule')}
            </p>
            <BulletList items={[
              getTranslation(language, 'shipping.shippingTimes.schedule1'),
              getTranslation(language, 'shipping.shippingTimes.schedule2'),
              getTranslation(language, 'shipping.shippingTimes.schedule3'),
            ]} />
          </InfoBox>
          <BodyText>{getTranslation(language, 'shipping.shippingTimes.text2')}</BodyText>
          <BodyText><strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'shipping.shippingTimes.note')}</strong></BodyText>

          <Divider />

          {/* Shipping Costs */}
          <SubTitle>{getTranslation(language, 'shipping.shippingCosts.title')}</SubTitle>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 500, color: S.dark, marginBottom: "10px" }}>
              {getTranslation(language, 'shipping.shippingCosts.howTitle')}
            </p>
            <BulletList items={[
              getTranslation(language, 'shipping.shippingCosts.bullet1'),
              getTranslation(language, 'shipping.shippingCosts.bullet2'),
              getTranslation(language, 'shipping.shippingCosts.bullet3'),
              getTranslation(language, 'shipping.shippingCosts.bullet4'),
            ]} />
          </InfoBox>
          <BodyText>{getTranslation(language, 'shipping.shippingCosts.text1')}</BodyText>

          <Divider />

          {/* Order Tracking */}
          <SubTitle>{getTranslation(language, 'shipping.orderTracking.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.orderTracking.text1')}</BodyText>
          <InfoBox>
            <BulletList items={[
              getTranslation(language, 'shipping.orderTracking.item1'),
              getTranslation(language, 'shipping.orderTracking.item2'),
              getTranslation(language, 'shipping.orderTracking.item3'),
            ]} />
          </InfoBox>
          <BodyText>{getTranslation(language, 'shipping.orderTracking.text2')}</BodyText>

          <Divider />

          {/* Damaged or Lost */}
          <SubTitle>{getTranslation(language, 'shipping.damagedOrLost.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.damagedOrLost.text1')}</BodyText>
          <InfoBox accent="rgba(200,90,8,0.15)">
            <BulletList items={[
              getTranslation(language, 'shipping.damagedOrLost.damagedItems'),
              getTranslation(language, 'shipping.damagedOrLost.lostPackages'),
              getTranslation(language, 'shipping.damagedOrLost.incorrectItems'),
            ]} />
          </InfoBox>

          <Divider />

          {/* International */}
          <SubTitle>{getTranslation(language, 'shipping.internationalShipping.title')}</SubTitle>
          <BodyText>
            {getTranslation(language, 'shipping.internationalShipping.text1')}{' '}
            <a href="mailto:orders@purepeelco.com" style={{ color: S.orange, fontWeight: 400 }}>orders@purepeelco.com</a>.
          </BodyText>
          <BodyText>{getTranslation(language, 'shipping.internationalShipping.text2')}</BodyText>
        </div>

        {/* ── RETURNS & RESOLUTION ── */}
        <div style={card}>
          <SectionLabel>Returns & Resolution</SectionLabel>
          <SectionTitle>{getTranslation(language, 'shipping.returns.title')}</SectionTitle>

          {/* No Returns Policy */}
          <SubTitle>{getTranslation(language, 'shipping.returns.policy.title')}</SubTitle>
          <InfoBox accent="rgba(200,90,8,0.18)">
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 500, color: S.dark, marginBottom: "6px" }}>
              {getTranslation(language, 'shipping.returns.policy.noReturns')}
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7 }}>
              {getTranslation(language, 'shipping.returns.policy.noReturnsText')}
            </p>
          </InfoBox>
          <BodyText>{getTranslation(language, 'shipping.returns.policy.commitment')}</BodyText>

          <Divider />

          {/* How We Resolve */}
          <SubTitle>{getTranslation(language, 'shipping.returns.howWeResolve.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.returns.howWeResolve.text1')}</BodyText>
          <InfoBox>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                <>{getTranslation(language, 'shipping.returns.howWeResolve.step1')} <a href="mailto:orders@purepeelco.com" style={{ color: S.orange, fontWeight: 400 }}>orders@purepeelco.com</a> {getTranslation(language, 'shipping.returns.howWeResolve.step1Text')}</>,
                getTranslation(language, 'shipping.returns.howWeResolve.step2'),
                getTranslation(language, 'shipping.returns.howWeResolve.step3'),
                getTranslation(language, 'shipping.returns.howWeResolve.step4'),
              ].map((step, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <span style={{
                    flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%",
                    background: S.orange, color: "#fff",
                    fontFamily: S.sans, fontSize: "0.62rem", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: "1px",
                  }}>{i + 1}</span>
                  <span style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7 }}>{step}</span>
                </li>
              ))}
            </ol>
          </InfoBox>

          <Divider />

          {/* Issues We Resolve */}
          <SubTitle>{getTranslation(language, 'shipping.returns.issuesWeResolve.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.returns.issuesWeResolve.text1')}</BodyText>
          <InfoBox>
            <BulletList items={[
              getTranslation(language, 'shipping.returns.issuesWeResolve.damagedPackaging'),
              getTranslation(language, 'shipping.returns.issuesWeResolve.qualityIssues'),
              getTranslation(language, 'shipping.returns.issuesWeResolve.incorrectItems'),
              getTranslation(language, 'shipping.returns.issuesWeResolve.missingItems'),
              getTranslation(language, 'shipping.returns.issuesWeResolve.shippingDamage'),
            ]} />
          </InfoBox>

          <Divider />

          {/* Replacement Process */}
          <SubTitle>{getTranslation(language, 'shipping.returns.replacementProcess.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.returns.replacementProcess.text1')}</BodyText>
          <BulletList items={[
            getTranslation(language, 'shipping.returns.replacementProcess.item1'),
            getTranslation(language, 'shipping.returns.replacementProcess.item2'),
            getTranslation(language, 'shipping.returns.replacementProcess.item3'),
            getTranslation(language, 'shipping.returns.replacementProcess.item4'),
          ]} />
          <BodyText style={{ marginTop: "12px" }}>
            <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'shipping.returns.replacementProcess.note')}</strong>
          </BodyText>

          <Divider />

          {/* Satisfaction Guarantee */}
          <SubTitle>{getTranslation(language, 'shipping.returns.commitment.title')}</SubTitle>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 500, color: S.dark, marginBottom: "6px" }}>
              {getTranslation(language, 'shipping.returns.commitment.guarantee')}
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.75rem", fontWeight: 300, color: S.textMid, lineHeight: 1.7 }}>
              {getTranslation(language, 'shipping.returns.commitment.text')}
            </p>
          </InfoBox>

          <Divider />

          {/* Need Help */}
          <SubTitle>{getTranslation(language, 'shipping.returns.needHelp.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.returns.needHelp.text1')}</BodyText>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 400, color: S.dark, marginBottom: "4px" }}>
              {getTranslation(language, 'shipping.returns.needHelp.email')}{' '}
              <a href="mailto:orders@purepeelco.com" style={{ color: S.orange, fontWeight: 300 }}>orders@purepeelco.com</a>
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textLight, lineHeight: 1.6 }}>
              {getTranslation(language, 'shipping.returns.needHelp.text2')}
            </p>
          </InfoBox>
        </div>

        {/* ── ADDITIONAL INFORMATION ── */}
        <div style={card}>
          <SectionLabel>Additional Information</SectionLabel>
          <SectionTitle>{getTranslation(language, 'shipping.additionalInfo.title')}</SectionTitle>

          <SubTitle>{getTranslation(language, 'shipping.additionalInfo.businessHours.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.additionalInfo.businessHours.text1')}</BodyText>
          <InfoBox>
            <p style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 400, color: S.dark, marginBottom: "4px" }}>
              <strong style={{ fontWeight: 500 }}>{getTranslation(language, 'shipping.additionalInfo.businessHours.mondaySunday')}</strong>{' '}
              {getTranslation(language, 'shipping.additionalInfo.businessHours.hours')}
            </p>
            <p style={{ fontFamily: S.sans, fontSize: "0.72rem", fontWeight: 300, color: S.textLight }}>
              {getTranslation(language, 'shipping.additionalInfo.businessHours.responseTime')}
            </p>
          </InfoBox>

          <Divider />

          <SubTitle>{getTranslation(language, 'shipping.additionalInfo.packaging.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.additionalInfo.packaging.text1')}</BodyText>
          <BulletList items={[
            getTranslation(language, 'shipping.additionalInfo.packaging.item1'),
            getTranslation(language, 'shipping.additionalInfo.packaging.item2'),
            getTranslation(language, 'shipping.additionalInfo.packaging.item3'),
          ]} />

          <Divider />

          <SubTitle>{getTranslation(language, 'shipping.additionalInfo.specialOrders.title')}</SubTitle>
          <BodyText>{getTranslation(language, 'shipping.additionalInfo.specialOrders.text1')}</BodyText>
          <BulletList items={[
            getTranslation(language, 'shipping.additionalInfo.specialOrders.item1'),
            getTranslation(language, 'shipping.additionalInfo.specialOrders.item2'),
            getTranslation(language, 'shipping.additionalInfo.specialOrders.item3'),
          ]} />
          <BodyText style={{ marginTop: "12px" }}>
            {getTranslation(language, 'shipping.additionalInfo.specialOrders.text2')}{' '}
            <a href="/contact?inquiryType=bulk" style={{ color: S.orange, fontWeight: 400 }}>orders@purepeelco.com</a>{' '}
            {getTranslation(language, 'shipping.additionalInfo.specialOrders.text3')}
          </BodyText>
        </div>

        {/* ── CONTACT ── */}
        <div style={card}>
          <SectionLabel>Contact</SectionLabel>
          <SectionTitle>{getTranslation(language, 'shipping.contact.title')}</SectionTitle>
          <BodyText>{getTranslation(language, 'shipping.contact.text1')}</BodyText>

          <InfoBox>
            {[
              { label: getTranslation(language, 'shipping.contact.shippingInquiries'), email: "shipping@purepeelco.com", type: "shipping" },
              { label: getTranslation(language, 'shipping.contact.productIssues'),     email: "orders@purepeelco.com", type: "support" },
              { label: getTranslation(language, 'shipping.contact.generalInquiries'), email: "info@purepeelco.com",   type: "general" },
              { label: getTranslation(language, 'shipping.contact.bulkOrders'),       email: "orders@purepeelco.com", type: "bulk" },
            ].map((item, i) => (
              <p key={i} style={{ fontFamily: S.sans, fontSize: "0.78rem", fontWeight: 300, color: S.textMid, marginBottom: "8px", lineHeight: 1.6 }}>
                <strong style={{ fontWeight: 500, color: S.dark }}>{item.label}</strong>{' '}
                <a href={`mailto:${item.email}`} style={{ color: S.orange, fontWeight: 300 }}>{item.email}</a>
              </p>
            ))}
            <p style={{ fontFamily: S.sans, fontSize: "0.7rem", fontWeight: 300, color: S.textLight, marginTop: "12px" }}>
              <strong style={{ fontWeight: 500, color: S.dark }}>{getTranslation(language, 'shipping.contact.responseTime')}</strong>
            </p>
          </InfoBox>
        </div>

        

      </div>
    </section>
  )
}