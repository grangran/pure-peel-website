import { useState, useEffect, useRef, useCallback } from "react"
import { useCart } from "../context/CartContext"
import { useLanguage } from "../context/LanguageContext"
import { useCurrency } from "../context/CurrencyContext"
import { getTranslation, translateVariantLabel } from "../utils/translations"

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
const IMAGE_REGISTRY = {
  orange: {
    bag: "/images/orange-product.png",
    box: "/images/orange-box.jpg",
    gallery: [
      "/images/orange-flat.jpg",
      "/images/orange-decor.jpg",
    ],
  },
  "pink-orange": {
    bag: "/images/pink-orange-product.png",
    box: "/images/pink-orange-box.jpg",
    gallery: [
      "/images/pink-orange-flat.jpg",
      "/images/drinks.png",
    ],
  },
  lime: {
    bag: "/images/lime-product.png",
    box: "/images/lime-box.jpg",
    gallery: [
      "/images/lime-flat.jpg",
      "/images/doublemule.jpg",
    ],
  },
  lemon: {
    bag: "/images/lemon-product.png",
    box: "/images/lemon-box.jpg",
    gallery: [
      "/images/lemon-flat.jpg",
      "/images/tea4.jpg",
    ],
  },
  apple: {
    bag: "/images/apple-product.JPEG",
    box: "/images/apple-box.jpg",
    gallery: [
      "/images/apple-flat.jpg",
    ],
  },
  pineapple: {
    bag: "/images/pineapple-product.JPEG",
    box: "/images/pineapple-product.JPEG",
    gallery: [
      "/images/pineapple-flat-product.jpg",
    ],
  },
}

function resolveImages(productId, variantId, variantImageFallback = null) {
  const cfg = IMAGE_REGISTRY[productId]
  if (!cfg) return variantImageFallback ? [variantImageFallback] : []
  const hero    = variantId?.includes("clearbox") ? cfg.box : cfg.bag
  const gallery = (cfg.gallery || []).filter(Boolean)
  if (hero) return [hero, ...gallery]
  return [...gallery, variantImageFallback].filter(Boolean)
}

const CARD_IMAGES = {
  orange:        "/images/orange-product-card.jpg",
  "pink-orange": "/images/pink-orange-product-card.jpg",
  lime:          "/images/lime-product-card.jpg",
  lemon:         "/images/lemon-product-card.jpg",
  apple:         "/images/apple-product-card.jpg",
  pineapple:     "/images/pineapple-flat.jpg",
}

function resolveCardImage(productId) {
  return CARD_IMAGES[productId] ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT METADATA
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT_META = {
  orange: {
    collection: "Citrus Collection",
    hook: "Sweet, zesty & aromatic — the perfect cocktail garnish and culinary accent.",
    tags: ["Sweet", "Zesty", "Aromatic", "Warm"],
    useCases: ["Cocktails & Spirits", "Hot & Iced Tea", "Charcuterie Boards"],
    accordions: [
      { title: "About This Product", body: "Our dehydrated orange slices are slow-dried to preserve their bold colour, natural oils, and full citrus flavour. Ideal for Old Fashioneds and mimosas, beautiful in hot tea, and a natural addition to any charcuterie board." },
      { title: "Ingredients & Contents", body: "100% Dehydrated Orange. Nothing else.\n\nNo preservatives. No added sugars. No artificial anything." },
      { title: "Storage & Shelf Life", body: "Store in a cool, dry place away from direct sunlight. Once opened, reseal or transfer to an airtight container. Shelf life up to 12 months unopened." },
    ],
    fr: {
      collection: "Collection d'agrumes",
      hook: "Doux, zeste et aromatic - la garniture parfaite pour vos cocktails et pour sublimer vos plats.",
      tags: ["Doux", "Zeste", "Aromatique", "Chaud"],
      useCases: ["Cocktails et spiritueux", "The chaud et glace", "Plateaux de charcuterie"],
      accordions: [
        { title: "A propos de ce produit", body: "Nos tranches d'orange dehydratees sont sechees lentement pour preserver leur couleur intense, leurs huiles naturelles et toute la saveur des agrumes. Ideal pour les Old Fashioneds et les mimosas, parfaites dans le the chaud, et une addition naturelle a tout plateau de charcuterie." },
        { title: "Ingredients et composition", body: "100% Orange dehydratee. Rien d'autre.\n\nSans conservateurs. Sans sucres ajoutes. Sans rien d'artificiel." },
        { title: "Conservation et duree de vie", body: "Conservez dans un endroit frais et sec, a l'abri de la lumiere directe du soleil. Une fois ouvert, refermez ou transferez dans un contenant hermetique. Duree de conservation jusqu'a 12 mois non ouvert." },
      ],
    },
  },
  "pink-orange": {
    collection: "Citrus Collection",
    hook: "Floral, vibrant, and uniquely beautiful — a showstopper in any glass or on any board.",
    tags: ["Floral", "Vibrant", "Delicate", "Striking"],
    useCases: ["Spritzes & Sangria", "Premium Presentations", "Spa & Wellness"],
    accordions: [
      { title: "About This Product", body: "Pink orange is the most visually arresting slice in our collection. Slow-dried to preserve its deep rose hue and delicate flavour — stunning in Aperol spritzes, rosé sangrias, and premium spa water." },
      { title: "Ingredients & Contents", body: "100% Dehydrated Pink Orange. Nothing else.\n\nNo preservatives. No added sugars. No artificial anything." },
      { title: "Storage & Shelf Life", body: "Store in a cool, dry place away from direct sunlight. Once opened, reseal or transfer to an airtight container. Shelf life up to 12 months unopened." },
    ],
    fr: {
      collection: "Collection d'agrumes",
      hook: "Floral, vibrant et singulier - une piece maitresse dans n'importe quel verre ou sur n'importe quel plateau.",
      tags: ["Floral", "Vibrant", "Delicat", "Saisissant"],
      useCases: ["Spritz et sangria", "Presentations premium", "Spa et bien-etre"],
      accordions: [
        { title: "A propos de ce produit", body: "Orange rose est la tranche la plus captivante visuellement de notre collection. Dehydratee lentement pour preserver sa teinte rose profond et sa saveur delicate." },
        { title: "Ingredients et composition", body: "100% Orange rose dehydratee. Rien d'autre.\n\nSans conservateurs. Sans sucres ajoutes. Sans rien d'artificiel." },
        { title: "Conservation et duree de vie", body: "Conservez dans un endroit frais et sec, a l'abri de la lumiere directe du soleil. Une fois ouvert, refermez ou transferez dans un contenant hermetique. Duree de conservation jusqu'a 12 mois non ouvert." },
      ],
    },
  },
  lime: {
    collection: "Citrus Collection",
    hook: "Bright, crisp & bold — essential for any serious cocktail setup.",
    tags: ["Bright", "Tart", "Crisp", "Bold"],
    useCases: ["Margaritas & Mojitos", "Gin & Tonics", "Sparkling Water"],
    accordions: [
      { title: "About This Product", body: "Slow-dried to lock in lime's sharp citrus character. The backbone of margaritas, mojitos, and gin & tonics — now always prepped and always perfect." },
      { title: "Ingredients & Contents", body: "100% Dehydrated Lime. Nothing else.\n\nNo preservatives. No added sugars. No artificial anything." },
      { title: "Storage & Shelf Life", body: "Store in a cool, dry place away from direct sunlight. Once opened, reseal or transfer to an airtight container. Shelf life up to 12 months unopened." },
    ],
    fr: {
      collection: "Collection d'agrumes",
      hook: "Vif, croquant et audacieux - essentiel pour toute preparation de cocktail serieuse.",
      tags: ["Vif", "Acidule", "Croquant", "Audacieux"],
      useCases: ["Margaritas et mojitos", "Gin et toniques", "Eau petillante"],
      accordions: [
        { title: "A propos de ce produit", body: "Dehydratee lentement pour conserver le caractere acidule et net du citron vert. Le coeur des margaritas, mojitos et gin & toniques." },
        { title: "Ingredients et composition", body: "100% Citron vert dehydrate. Rien d'autre.\n\nSans conservateurs. Sans sucres ajoutes. Sans rien d'artificiel." },
        { title: "Conservation et duree de vie", body: "Conservez dans un endroit frais et sec, a l'abri de la lumiere directe du soleil. Duree de conservation jusqu'a 12 mois non ouvert." },
      ],
    },
  },
  lemon: {
    collection: "Citrus Collection",
    hook: "Tart, sunny & versatile — the most classic citrus garnish, perfected.",
    tags: ["Tart", "Sunny", "Clean", "Classic"],
    useCases: ["Whisky Sours", "Iced Tea", "Cheese Boards"],
    accordions: [
      { title: "About This Product", body: "The most universally loved slice in the collection. Slow-dried to preserve lemon's bright acidity — essential for whisky sours, iced tea, and any charcuterie board." },
      { title: "Ingredients & Contents", body: "100% Dehydrated Lemon. Nothing else.\n\nNo preservatives. No added sugars. No artificial anything." },
      { title: "Storage & Shelf Life", body: "Store in a cool, dry place away from direct sunlight. Once opened, reseal or transfer to an airtight container. Shelf life up to 12 months unopened." },
    ],
    fr: {
      collection: "Collection d'agrumes",
      hook: "Acidule, ensoleille et polyvalent - la garniture d'agrumes classique, perfectionnee.",
      tags: ["Acidule", "Ensoleille", "Propre", "Classique"],
      useCases: ["Whisky sours", "The glace", "Plateaux de fromages"],
      accordions: [
        { title: "A propos de ce produit", body: "La tranche la plus universellement appreciee de la collection. Dehydratee lentement pour preserver l'acidite lumineuse du citron." },
        { title: "Ingredients et composition", body: "100% Citron dehydrate. Rien d'autre.\n\nSans conservateurs. Sans sucres ajoutes. Sans rien d'artificiel." },
        { title: "Conservation et duree de vie", body: "Conservez dans un endroit frais et sec, a l'abri de la lumiere directe du soleil. Duree de conservation jusqu'a 12 mois non ouvert." },
      ],
    },
  },
  apple: {
    collection: "Fruit Collection",
    hook: "Warm, autumnal & unexpected — the slice that surprises everyone.",
    tags: ["Warm", "Subtle", "Autumnal", "Unique"],
    useCases: ["Mulled Cider", "Spiced Whisky", "Autumn Boards"],
    accordions: [
      { title: "About This Product", body: "The rarest slice in the collection. Slow-dried to preserve apple's gentle sweetness — stunning in mulled cider, spiced whisky, herbal tea, and autumnal cheese boards." },
      { title: "Ingredients & Contents", body: "100% Dehydrated Apple. Nothing else.\n\nNo preservatives. No added sugars. No artificial anything." },
      { title: "Storage & Shelf Life", body: "Store in a cool, dry place away from direct sunlight. Once opened, reseal or transfer to an airtight container. Shelf life up to 12 months unopened." },
    ],
    fr: {
      collection: "Collection de fruits",
      hook: "Chaleureux, automnal et inattendu - la tranche qui surprend tout le monde.",
      tags: ["Chaleureux", "Subtil", "Automnal", "Unique"],
      useCases: ["Cidre chaud", "Whisky epice", "Plateaux d'automne"],
      accordions: [
        { title: "A propos de ce produit", body: "La tranche la plus rare de la collection. Dehydratee lentement pour preserver la douceur delicate de la pomme." },
        { title: "Ingredients et composition", body: "100% Pomme dehydratee. Rien d'autre.\n\nSans conservateurs. Sans sucres ajoutes. Sans rien d'artificiel." },
        { title: "Conservation et duree de vie", body: "Conservez dans un endroit frais et sec, a l'abri de la lumiere directe du soleil. Duree de conservation jusqu'a 12 mois non ouvert." },
      ],
    },
  },
  pineapple: {
    collection: "Fruit Collection",
    hook: "Tropical, bright & unforgettable — sunshine in every slice.",
    tags: ["Tropical", "Bright", "Sweet-Tart", "Bold"],
    useCases: ["Tiki & Rum Cocktails", "Sparkling Drinks", "Dessert Boards"],
    accordions: [
      { title: "About This Product", body: "Slow-dried to concentrate pineapple's golden sweetness and tangy edge — stunning in mai tais and piña colada, lovely with soft cheese and prosciutto, and addictive straight from the bag." },
      { title: "Ingredients & Contents", body: "100% Dehydrated Pineapple. Nothing else.\n\nNo preservatives. No added sugars. No artificial anything." },
      { title: "Storage & Shelf Life", body: "Store in a cool, dry place away from direct sunlight. Once opened, reseal or transfer to an airtight container. Shelf life up to 12 months unopened." },
    ],
    fr: {
      collection: "Collection de fruits",
      hook: "Tropical, lumineux et inoubliable — un rayon de soleil dans chaque tranche.",
      tags: ["Tropical", "Lumineux", "Doux-acidule", "Audacieux"],
      useCases: ["Cocktails tiki et rhum", "Boissons petillantes", "Plateaux dessert"],
      accordions: [
        { title: "A propos de ce produit", body: "Dehydratee lentement pour concentrer la douceur doree et la pointe acidulee de l'ananas — superbe dans les cocktails tiki, mai tai et piña colada, delicieux avec fromages et charcuteries, irresistible en collation." },
        { title: "Ingredients et composition", body: "100% Ananas dehydrate. Rien d'autre.\n\nSans conservateurs. Sans sucres ajoutes. Sans rien d'artificiel." },
        { title: "Conservation et duree de vie", body: "Conservez dans un endroit frais et sec, a l'abri de la lumiere directe du soleil. Duree de conservation jusqu'a 12 mois non ouvert." },
      ],
    },
  },
}

const RELATED = {
  orange:        ["pink-orange", "lime", "lemon"],
  "pink-orange": ["orange", "lemon", "lime"],
  lime:          ["lemon", "orange", "pink-orange"],
  lemon:         ["orange", "lime", "pink-orange"],
  apple:         ["pineapple", "orange", "lemon"],
  pineapple:     ["apple", "orange", "lime"],
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  serif:     "'Cormorant Garamond', Georgia, serif",
  sans:      "'Jost', sans-serif",
  dark:      "#0f0a04",
  cream:     "#faf7f2",
  creamMid:  "#f4ede0",
  creamDark: "#ede4d4",
  gold:      "#e8c84a",
  orange:    "#c85a08",
  orangeDim: "rgba(200,90,8,0.6)",
  textMid:   "rgba(15,10,4,0.5)",
  textLight: "rgba(15,10,4,0.32)",
  border:    "rgba(15,10,4,0.07)",
  borderMid: "rgba(15,10,4,0.12)",
}

// ─────────────────────────────────────────────────────────────────────────────
// WARM PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────
function WarmPlaceholder({ compact = false }) {
  const { language } = useLanguage()
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#f6f3ee", gap: compact ? "5px" : "14px",
      position: "relative", overflow: "hidden",
    }}>
      {!compact && [100, 170, 240].map((r, i) => (
        <div key={i} style={{
          position: "absolute", width: r, height: r, borderRadius: "50%",
          border: `1px solid rgba(200,90,8,${0.06 - i * 0.015})`,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />
      ))}
      <div style={{
        width: compact ? "20px" : "48px", height: compact ? "20px" : "48px",
        borderRadius: "50%", border: `1px solid rgba(200,90,8,${compact ? 0.2 : 0.25})`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1,
      }}>
        <svg width={compact ? 9 : 20} height={compact ? 9 : 20} viewBox="0 0 24 24" fill="none"
          stroke={`rgba(200,90,8,${compact ? 0.35 : 0.4})`} strokeWidth="1.3" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M5.5 5.5 Q12 9 18.5 5.5" />
          <path d="M5.5 18.5 Q12 15 18.5 18.5" />
        </svg>
      </div>
      {!compact && (
        <span style={{ fontFamily: C.sans, fontSize: "0.54rem", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(200,90,8,0.3)", zIndex: 1 }}>
          {getTranslation(language, "productPage.photoComingSoon")}
        </span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART IMAGE
// ─────────────────────────────────────────────────────────────────────────────
function SmartImage({ src, alt, objectFit = "contain", style = {}, compact = false }) {
  const [errored, setErrored] = useState(false)
  useEffect(() => setErrored(false), [src])
  if (!src || errored) return <WarmPlaceholder compact={compact} />
  return (
    <img src={src} alt={alt} loading="eager" decoding="async"
      style={{ width: "100%", height: "100%", objectFit, objectPosition: "center", display: "block", ...style }}
      onError={() => setErrored(true)}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY PANEL
//
// DESKTOP: sticky left column, vertical thumbnail strip on the left side
// MOBILE:  full-width square image, horizontal scrollable thumbnails below
// ─────────────────────────────────────────────────────────────────────────────
function GalleryPanel({ images, activeIndex, onSelect, onNav, productName, collection, isFading, isMobile }) {
  const multi     = images.length > 1
  const safeIndex = images.length ? Math.min(activeIndex, images.length - 1) : 0

  // ── MOBILE ───────────────────────────────────────────────────────────────
  // Shopify-style: full-bleed square image, pill dots, horizontal thumbnails
  if (isMobile) {
    return (
      <div style={{ width: "100%", background: C.cream }}>

        {/* Full-bleed square image — no padding, edge to edge */}
        <div style={{ width: "100%", aspectRatio: "1 / 1", position: "relative", overflow: "hidden", background: C.cream }}>
          <div style={{ position: "absolute", inset: 0, opacity: isFading ? 0 : 1, transition: "opacity 0.22s ease" }}>
            <SmartImage src={images[safeIndex]} alt={productName} objectFit="cover" />
          </div>

          {/* Minimal dot indicators — no background container */}
          {multi && (
            <div style={{
              position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)",
              zIndex: 3, display: "flex", gap: "5px", alignItems: "center",
            }}>
              {images.map((_, i) => (
                <div key={i} onClick={() => onSelect(i)} style={{
                  width: i === safeIndex ? "16px" : "5px",
                  height: "5px", borderRadius: "100px",
                  background: i === safeIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
                  transition: "width 0.25s ease, background 0.18s",
                  cursor: "pointer", flexShrink: 0,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Horizontal thumbnail strip — only shown with 2+ images */}
        {multi && (
          <div style={{
            display: "flex", gap: "6px", overflowX: "auto",
            padding: "10px 16px 0", scrollbarWidth: "none",
          }}>
            {images.map((src, i) => (
              <button key={i} onClick={() => onSelect(i)} style={{
                width: "56px", height: "56px", flexShrink: 0,
                borderRadius: "6px", overflow: "hidden", padding: 0, cursor: "pointer",
                border: i === safeIndex
                  ? `2px solid ${C.orange}`
                  : "2px solid transparent",
                background: C.cream,
                transition: "border-color 0.18s",
              }}>
                <SmartImage src={src} alt={`${productName} ${i + 1}`} objectFit="cover" compact />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "sticky", top: "72px",
      height: "calc(100vh - 72px)",
      display: "flex", flexDirection: "column",
      padding: "28px 14px 28px 40px", gap: "12px",
    }}>

      {/* Collection eyebrow */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "14px", height: "1px", background: C.orangeDim }} />
        <span style={{ fontFamily: C.sans, fontSize: "0.54rem", fontWeight: 400, letterSpacing: "0.2em", textTransform: "uppercase", color: C.orangeDim }}>
          {collection}
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "12px", minHeight: 0 }}>

        {/* Vertical thumbnail strip */}
        {multi && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "58px", flexShrink: 0, overflowY: "auto", scrollbarWidth: "none" }}>
            {images.map((src, i) => (
              <button key={i} onClick={() => onSelect(i)} style={{
                width: "58px", height: "58px", flexShrink: 0, borderRadius: "8px",
                overflow: "hidden", padding: 0, cursor: "pointer",
                border: i === safeIndex ? "1.5px solid rgba(200,90,8,0.5)" : `1.5px solid ${C.borderMid}`,
                background: C.cream, opacity: i === safeIndex ? 1 : 0.65,
                transition: "border-color 0.2s, opacity 0.2s, transform 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1.06)" }}
                onMouseLeave={e => { e.currentTarget.style.opacity = i === safeIndex ? "1" : "0.65"; e.currentTarget.style.transform = "scale(1)" }}
              >
                <SmartImage src={src} alt={`${productName} ${i + 1}`} objectFit="cover" compact />
              </button>
            ))}
          </div>
        )}

        {/* Main pane */}
        <div style={{
          flex: 1, borderRadius: "16px", overflow: "hidden", position: "relative",
          background: C.cream, boxShadow: "0 2px 20px rgba(15,10,4,0.07)",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: isFading ? 0 : 1, transition: "opacity 0.25s ease" }}>
            <SmartImage src={images[safeIndex]} alt={productName} objectFit="cover" />
          </div>

          {multi && ["prev", "next"].map(dir => (
            <button key={dir} onClick={() => onNav(dir)} style={{
              position: "absolute", top: "50%",
              [dir === "prev" ? "left" : "right"]: "12px",
              transform: "translateY(-50%)", zIndex: 3,
              width: "36px", height: "36px", borderRadius: "50%",
              border: "1px solid rgba(15,10,4,0.1)",
              background: "rgba(250,247,242,0.92)",
              boxShadow: "0 2px 10px rgba(15,10,4,0.08)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,10,4,0.12)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(250,247,242,0.92)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(15,10,4,0.08)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="rgba(15,10,4,0.55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={dir === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
          ))}

          {multi && (
            <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", gap: "6px", alignItems: "center" }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => onSelect(i)} style={{
                  width: i === safeIndex ? "18px" : "6px", height: "6px",
                  borderRadius: "100px", border: "none", padding: 0, cursor: "pointer",
                  background: i === safeIndex ? "rgba(200,90,8,0.55)" : "rgba(15,10,4,0.18)",
                  transition: "width 0.28s ease, background 0.2s",
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT SELECTOR
// ─────────────────────────────────────────────────────────────────────────────
function VariantSelector({ variants, selectedId, onChange, language }) {
  const selected = variants.find(v => v.id === selectedId)
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "13px", gap: "8px" }}>
        <span style={{ fontFamily: C.sans, fontSize: "0.57rem", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textMid }}>
          {getTranslation(language, "productPage.selectSize")}
        </span>
        {selected && (
          <span style={{ fontFamily: C.sans, fontSize: "0.6rem", fontWeight: 300, color: C.textLight, textAlign: "right" }}>
            {translateVariantLabel(language, selected.label).split("—")[0].trim()} {getTranslation(language, "productPage.selected")}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {variants.map(v => {
          const isSel     = v.id === selectedId
          const label     = translateVariantLabel(language, v.label)
          const [size, count] = label.split("—").map(s => s.trim())
          const isBox     = v.id?.includes("clearbox")
          const isPopular = v.label?.toLowerCase().includes("small")
          const priceStr  = v.price % 1 === 0 ? `$${v.price}` : `$${v.price.toFixed(2)}`

          return (
            <button key={v.id} onClick={() => onChange(v)} style={{
              padding: "13px 14px 12px", borderRadius: "10px",
              border: isSel ? "1.5px solid rgba(200,90,8,0.55)" : `1.5px solid ${C.border}`,
              background: isSel ? "rgba(200,90,8,0.04)" : "#fff",
              cursor: "pointer", textAlign: "left", position: "relative",
              transition: "border-color 0.2s, transform 0.15s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = "rgba(200,90,8,0.28)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(15,10,4,0.05)" } }}
              onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none" } }}
            >
              {isSel && (
                <div style={{ position: "absolute", top: "10px", right: "10px", width: "16px", height: "16px", borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px", paddingRight: isSel ? "22px" : "0" }}>
                <span style={{ fontFamily: C.sans, fontSize: "0.76rem", fontWeight: isSel ? 500 : 400, color: C.dark }}>{size}</span>
                <span style={{ fontFamily: C.sans, fontSize: "0.76rem", fontWeight: isSel ? 500 : 400, color: isSel ? C.dark : C.textMid }}>{priceStr}</span>
              </div>
              {count && <div style={{ fontFamily: C.sans, fontSize: "0.58rem", fontWeight: 300, color: C.textLight, marginBottom: (isPopular || isBox) ? "6px" : "0" }}>{count}</div>}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {isPopular && <span style={{ fontFamily: C.sans, fontSize: "0.46rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.orange, whiteSpace: "nowrap" }}>{getTranslation(language, "productPage.mostPopular")}</span>}
                {isBox     && <span style={{ fontFamily: C.sans, fontSize: "0.46rem", fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textLight, whiteSpace: "nowrap" }}>{getTranslation(language, "productPage.giftReady")}</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCORDION
// ─────────────────────────────────────────────────────────────────────────────
function Accordion({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div style={{ borderTop: `1px solid ${C.border}` }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{
            width: "100%", padding: "16px 0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontFamily: C.sans, fontSize: "0.66rem", fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMid }}>
              {item.title}
            </span>
            <span style={{
              width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
              border: `1px solid ${open === i ? "transparent" : C.borderMid}`,
              background: open === i ? C.dark : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s",
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                style={{ stroke: open === i ? "#fff" : C.textMid, transition: "transform 0.25s", transform: open === i ? "rotate(45deg)" : "none" }}>
                <path d="M12 4.5v15m7.5-7.5h-15" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </button>
          <div style={{ maxHeight: open === i ? "400px" : "0", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
            <p style={{ fontFamily: C.sans, fontSize: "0.75rem", fontWeight: 300, color: C.textMid, lineHeight: 1.9, padding: "0 0 18px", whiteSpace: "pre-line" }}>
              {item.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATED CARD
// Mobile: stacks cleanly, price row on its own line, no wrapping
// ─────────────────────────────────────────────────────────────────────────────
function RelatedCard({ productId, allProducts, language }) {
  const product = allProducts?.[productId]
  if (!product) return null
  const rawMeta   = PRODUCT_META[productId] || {}
  const meta      = language === "fr" ? (rawMeta.fr || rawMeta) : rawMeta
  const imgSrc    = resolveCardImage(productId)
  const fromPrice = Math.min(...product.variants.map(v => v.price))
  const priceStr  = fromPrice % 1 === 0 ? `$${fromPrice}` : `$${fromPrice.toFixed(2)}`

  return (
    <a href={`/${productId}`} style={{
      background: "#fff", borderRadius: "12px", overflow: "hidden",
      border: `1px solid ${C.border}`, textDecoration: "none",
      display: "flex", flexDirection: "column",
      transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(15,10,4,0.08)"; e.currentTarget.style.borderColor = "rgba(176,125,48,0.2)" }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border }}
    >
      {/* Image */}
      <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", flexShrink: 0 }}>
        <SmartImage src={imgSrc} alt={product.name} objectFit="cover" />
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontFamily: C.serif, fontSize: "1.05rem", fontStyle: "italic", fontWeight: 400, color: C.dark, marginBottom: "4px" }}>
          {product.name}
        </div>
        {meta.hook && (
          <div style={{ fontFamily: C.sans, fontSize: "0.63rem", fontWeight: 300, color: C.textLight, lineHeight: 1.55, marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {meta.hook}
          </div>
        )}
        {/* Price + CTA — each on own line to prevent mobile wrapping */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontFamily: C.sans, fontSize: "0.78rem", fontWeight: 400, color: C.dark }}>
            {getTranslation(language, "productPage.from")} {priceStr} CAD
          </span>
          <span style={{ fontFamily: C.sans, fontSize: "0.57rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.orange, display: "flex", alignItems: "center", gap: "3px" }}>
            {getTranslation(language, "productPage.view")}
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductPage({ product, allProducts = {} }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [imageIndex, setImageIndex]           = useState(0)
  const [isFading, setIsFading]               = useState(false)
  const [quantity, setQuantity]               = useState(1)
  const [addingToCart, setAddingToCart]       = useState(false)
  const [addedToCart, setAddedToCart]         = useState(false)
  const [isVisible, setIsVisible]             = useState(false)
  const [isMobile, setIsMobile]               = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  )

  const { addToCart }             = useCart()
  const { language }              = useLanguage()
  const { currency, formatPrice } = useCurrency()

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const rawMeta    = PRODUCT_META[product.id] || {}
  const meta       = language === "fr" ? (rawMeta.fr || rawMeta) : rawMeta
  const relatedIds = (RELATED[product.id] || []).filter(id => allProducts[id])

  const rawImages = resolveImages(product.id, selectedVariant.id, selectedVariant?.image ?? null)
  const images    = rawImages.length > 0 ? rawImages : (selectedVariant?.image ? [selectedVariant.image] : [null])

  useEffect(() => {
    setIsVisible(false)
    const t = setTimeout(() => setIsVisible(true), 55)
    return () => clearTimeout(t)
  }, [product.id])

  useEffect(() => {
    setSelectedVariant(product.variants[0])
    setImageIndex(0)
    setQuantity(1)
    setAddingToCart(false)
    setAddedToCart(false)
  }, [product.id])

  useEffect(() => { setImageIndex(0) }, [selectedVariant.id])

  const handleVariantChange = useCallback((variant) => {
    if (variant.id === selectedVariant.id) return
    setIsFading(true)
    setTimeout(() => { setSelectedVariant(variant); setImageIndex(0); setIsFading(false) }, 180)
  }, [selectedVariant.id])

  const handleImageSelect = useCallback((i) => {
    if (i === imageIndex) return
    setIsFading(true)
    setTimeout(() => { setImageIndex(i); setIsFading(false) }, 150)
  }, [imageIndex])

  const handleImageNav = useCallback((dir) => {
    setIsFading(true)
    setTimeout(() => {
      setImageIndex(prev => dir === "next"
        ? (prev + 1) % images.length
        : (prev - 1 + images.length) % images.length
      )
      setIsFading(false)
    }, 150)
  }, [images.length])

  const touchX = useRef(0)
  const onTouchStart = e => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = e => {
    const dx = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 44) handleImageNav(dx > 0 ? "next" : "prev")
  }

  const handleAddToCart = () => {
    setAddingToCart(true)
    const name = product.id ? getTranslation(language, `products.${product.id}.name`) : product.name
    addToCart({ id: selectedVariant.id, name, variant: selectedVariant.option, price: selectedVariant.price, image: images[0], description: product.description, quantity, productId: product.id })
    setTimeout(() => { setAddingToCart(false); setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2200) }, 500)
  }

  const productName = product.id ? getTranslation(language, `products.${product.id}.name`) : product.name

  return (
    <div style={{ background: C.cream, minHeight: "calc(100vh - 72px)" }}>

      {/* ── LAYOUT: single column on mobile, 55/45 grid on desktop ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "55% 45%",
          maxWidth: "1440px", margin: "0 auto",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "none" : "translateY(14px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >

        {/* GALLERY */}
        <GalleryPanel
          images={images}
          activeIndex={imageIndex}
          onSelect={handleImageSelect}
          onNav={handleImageNav}
          productName={productName}
          collection={meta.collection || rawMeta.collection || "Pure Peel Co."}
          isFading={isFading}
          isMobile={isMobile}
        />

        {/* INFO PANEL */}
        <div style={{
          padding: isMobile ? "20px 16px 100px" : "44px 48px 80px 32px",
          display: "flex", flexDirection: "column",
          overflowY: isMobile ? "visible" : "auto",
          maxHeight: isMobile ? "none" : "calc(100vh - 72px)",
          scrollbarWidth: "none",
        }}>

          {/* Desktop eyebrow only */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "14px", height: "1px", background: C.orangeDim }} />
              <span style={{ fontFamily: C.sans, fontSize: "0.54rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: C.orangeDim }}>
                {getTranslation(language, "productPage.brand")}
              </span>
            </div>
          )}

          {/* Mobile: collection label above name */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <div style={{ width: "10px", height: "1px", background: C.orangeDim }} />
              <span style={{ fontFamily: C.sans, fontSize: "0.5rem", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: C.orangeDim }}>
                {meta.collection || rawMeta.collection || "Pure Peel Co."}
              </span>
            </div>
          )}

          {/* Name + price on same row for mobile (Shopify convention) */}
          {isMobile ? (
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
              <h1 style={{ fontFamily: C.serif, fontSize: "clamp(2.2rem,8vw,2.8rem)", fontWeight: 300, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.02em", color: C.dark, margin: 0, flex: 1 }}>
                {productName}
              </h1>
              <div style={{ textAlign: "right", flexShrink: 0, paddingTop: "4px" }}>
                <div style={{ fontFamily: C.serif, fontSize: "1.6rem", fontWeight: 400, letterSpacing: "-0.02em", color: C.dark, lineHeight: 1 }}>
                  {formatPrice(selectedVariant.price)}
                </div>
                <div style={{ fontFamily: C.sans, fontSize: "0.55rem", fontWeight: 300, letterSpacing: "0.08em", color: C.textLight, textTransform: "uppercase", marginTop: "2px" }}>
                  {currency}
                </div>
              </div>
            </div>
          ) : (
            <h1 style={{ fontFamily: C.serif, fontSize: "clamp(2.8rem,4vw,4.2rem)", fontWeight: 300, fontStyle: "italic", lineHeight: 0.95, letterSpacing: "-0.025em", color: C.dark, margin: "0 0 13px" }}>
              {productName}
            </h1>
          )}

          {/* Hook */}
          {meta.hook && (
            <p style={{ fontFamily: C.serif, fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: 300, color: C.textMid, lineHeight: 1.55, margin: isMobile ? "6px 0 14px" : "0 0 18px" }}>
              {meta.hook}
            </p>
          )}

          {/* Flavour tags */}
          {meta.tags?.length > 0 && (
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: isMobile ? "10px" : "14px" }}>
              {meta.tags.map(tag => (
                <span key={tag} style={{ padding: "3px 10px", borderRadius: "100px", border: "1px solid rgba(200,90,8,0.18)", fontFamily: C.sans, fontSize: "0.54rem", fontWeight: 300, letterSpacing: "0.08em", textTransform: "uppercase", color: C.orange, background: "rgba(200,90,8,0.03)" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Use cases */}
          {meta.useCases?.length > 0 && (
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: isMobile ? "18px" : "22px" }}>
              {meta.useCases.map((u, i) => (
                <span key={i} style={{ padding: "3px 10px", borderRadius: "4px", background: C.creamMid, fontFamily: C.sans, fontSize: "0.54rem", fontWeight: 300, letterSpacing: "0.04em", color: C.textMid }}>
                  {u}
                </span>
              ))}
            </div>
          )}

          <div style={{ height: "1px", background: C.border, marginBottom: isMobile ? "18px" : "22px" }} />

          {/* Desktop price (mobile price shown in header row above) */}
          {!isMobile && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontFamily: C.serif, fontSize: "2.3rem", fontWeight: 400, letterSpacing: "-0.02em", color: C.dark }}>
                  {formatPrice(selectedVariant.price)}
                </span>
                <span style={{ fontFamily: C.sans, fontSize: "0.63rem", fontWeight: 300, letterSpacing: "0.1em", color: C.textLight, textTransform: "uppercase" }}>
                  {currency}
                </span>
              </div>
              <p style={{ fontFamily: C.sans, fontSize: "0.63rem", fontWeight: 300, color: C.textLight, marginTop: "4px" }}>
                {getTranslation(language, "productPage.shippingInfo")}
              </p>
            </div>
          )}

          {/* Mobile shipping note */}
          {isMobile && (
            <p style={{ fontFamily: C.sans, fontSize: "0.6rem", fontWeight: 300, color: C.textLight, margin: "-10px 0 18px" }}>
              {getTranslation(language, "productPage.shippingInfo")}
            </p>
          )}

          {/* Variant selector */}
          <div style={{ marginBottom: "22px" }}>
            <VariantSelector variants={product.variants} selectedId={selectedVariant.id} onChange={handleVariantChange} language={language} />
          </div>

          {/* Desktop: quantity + ATC inline */}
          {!isMobile && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "stretch" }}>
              <div style={{ display: "inline-flex", alignItems: "center", border: `1.5px solid ${C.border}`, borderRadius: "10px", overflow: "hidden", background: "#fff", flexShrink: 0 }}>
                {[{ label: "−", delta: -1 }, null, { label: "+", delta: 1 }].map((item, i) =>
                  item === null ? (
                    <span key="n" style={{ width: "40px", textAlign: "center", fontFamily: C.sans, fontSize: "0.88rem", fontWeight: 400, color: C.dark }}>{quantity}</span>
                  ) : (
                    <button key={item.label}
                      onClick={() => setQuantity(p => Math.max(1, p + item.delta))}
                      disabled={item.delta === -1 && quantity <= 1}
                      style={{ width: "36px", height: "48px", border: "none", background: "transparent", fontSize: "1rem", color: (item.delta === -1 && quantity <= 1) ? C.textLight : C.textMid, cursor: (item.delta === -1 && quantity <= 1) ? "not-allowed" : "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => { if (!(item.delta === -1 && quantity <= 1)) e.currentTarget.style.background = "rgba(15,10,4,0.04)" }}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
              <button onClick={handleAddToCart} disabled={addingToCart} style={{
                flex: 1, padding: "0 18px", borderRadius: "10px", border: "none",
                background: addedToCart ? `linear-gradient(135deg, ${C.dark} 0%, #1e1408 100%)` : "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
                fontFamily: C.sans, fontSize: "0.7rem", fontWeight: 500,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: addedToCart ? C.gold : C.dark,
                cursor: addingToCart ? "not-allowed" : "pointer",
                boxShadow: addedToCart ? "none" : "0 5px 20px rgba(232,200,74,0.22)",
                transition: "all 0.4s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
                onMouseEnter={e => { if (!addingToCart && !addedToCart) e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none" }}
              >
                {addingToCart ? (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "ppSpin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>{getTranslation(language, "productPage.adding")}</>
                ) : addedToCart ? (
                  <><svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-6.5" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>{getTranslation(language, "productPage.addedToCart")}</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272" /></svg>{getTranslation(language, "productPage.addToCart")}</>
                )}
              </button>
            </div>
          )}

          {/* Accordions */}
          {meta.accordions?.length > 0 && <Accordion items={meta.accordions} />}

        </div>
      </div>

      {/* ── MOBILE STICKY ADD TO CART BAR ── */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: C.cream,
          borderTop: `1px solid ${C.border}`,
          padding: "10px 16px 20px",
          display: "flex", gap: "10px", alignItems: "center",
          boxShadow: "0 -4px 24px rgba(15,10,4,0.08)",
        }}>
          {/* Qty stepper */}
          <div style={{ display: "inline-flex", alignItems: "center", border: `1.5px solid ${C.border}`, borderRadius: "10px", overflow: "hidden", background: "#fff", flexShrink: 0 }}>
            {[{ label: "−", delta: -1 }, null, { label: "+", delta: 1 }].map((item) =>
              item === null ? (
                <span key="n" style={{ width: "36px", textAlign: "center", fontFamily: C.sans, fontSize: "0.88rem", fontWeight: 400, color: C.dark }}>{quantity}</span>
              ) : (
                <button key={item.label}
                  onClick={() => setQuantity(p => Math.max(1, p + item.delta))}
                  disabled={item.delta === -1 && quantity <= 1}
                  style={{ width: "36px", height: "44px", border: "none", background: "transparent", fontSize: "1rem", color: (item.delta === -1 && quantity <= 1) ? C.textLight : C.textMid, cursor: (item.delta === -1 && quantity <= 1) ? "not-allowed" : "pointer" }}
                >
                  {item.label}
                </button>
              )
            )}
          </div>

          {/* Add to cart — full width */}
          <button onClick={handleAddToCart} disabled={addingToCart} style={{
            flex: 1, height: "44px", borderRadius: "10px", border: "none",
            background: addedToCart
              ? `linear-gradient(135deg, ${C.dark} 0%, #1e1408 100%)`
              : "linear-gradient(135deg,#f5e6a3 0%,#e8c84a 55%,#d4a832 100%)",
            fontFamily: C.sans, fontSize: "0.68rem", fontWeight: 500,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: addedToCart ? C.gold : C.dark,
            cursor: addingToCart ? "not-allowed" : "pointer",
            boxShadow: addedToCart ? "none" : "0 4px 16px rgba(232,200,74,0.25)",
            transition: "all 0.35s ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
          }}>
            {addingToCart ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "ppSpin 0.7s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>{getTranslation(language, "productPage.adding")}</>
            ) : addedToCart ? (
              <><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-6.5" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>{getTranslation(language, "productPage.addedToCart")}</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272" /></svg>{getTranslation(language, "productPage.addToCart")}</>
            )}
          </button>
        </div>
      )}

      {/* ── RELATED PRODUCTS ── */}
      {relatedIds.length > 0 && (
        <section style={{ background: C.creamDark, padding: isMobile ? "40px 16px 52px" : "56px 48px 64px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "14px", height: "1px", background: "rgba(200,90,8,0.35)" }} />
              <span style={{ fontFamily: C.sans, fontSize: "0.53rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(200,90,8,0.55)" }}>
                {getTranslation(language, "productPage.youMayAlsoLike")}
              </span>
            </div>
            <h2 style={{ fontFamily: C.serif, fontStyle: "italic", fontWeight: 300, fontSize: "clamp(1.6rem,2.8vw,2.2rem)", letterSpacing: "-0.015em", color: C.dark, margin: "0 0 24px" }}>
              {getTranslation(language, "productPage.moreFromOurCollection")}
            </h2>
            {/* Mobile: horizontal scroll showing ~2.2 cards. Desktop: 3-col grid */}
            {isMobile ? (
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "2px", marginRight: "-16px", paddingRight: "16px" }}>
                {relatedIds.map(id => (
                  <div key={id} style={{ minWidth: "calc(50% - 5px)", maxWidth: "calc(50% - 5px)", flexShrink: 0 }}>
                    <RelatedCard productId={id} allProducts={allProducts} language={language} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "18px" }}>
                {relatedIds.map(id => (
                  <RelatedCard key={id} productId={id} allProducts={allProducts} language={language} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <style>{`
        @keyframes ppSpin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { display: none }
      `}</style>
    </div>
  )
}