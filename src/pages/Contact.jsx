import ContactForm from "../components/Contact"
import SEO from "../components/SEO"
import Nav from "../components/Nav"
import Footer from "../components/Footer"
import { seoData } from "../utils/seoData"

export default function Contact() {
  const currentSEO = seoData.contact || seoData.default

  return (
    <>
      <SEO {...currentSEO} />
      <Nav />
      <div className="min-h-[calc(100vh-72px)]">
        <ContactForm />
      </div>
      <Footer />
    </>
  )
}

