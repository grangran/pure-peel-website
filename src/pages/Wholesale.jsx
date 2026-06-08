import { useState } from 'react';

export default function Wholesale() {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    business: '',
    type: '',
    email: '',
    city: '',
    accountSize: '',
    volume: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Wire to Resend or your real backend endpoint
    console.log('Wholesale application:', formData);
    setSubmitted(true);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#faf7f2] text-[#1a1a1a] font-['Jost'] font-light text-[15px] leading-relaxed antialiased overflow-x-hidden">
      {/* Inline keyframes for marquee + hero fade-up. Tailwind doesn't ship horizontal-scroll. */}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .marquee-track { animation: marquee-scroll 50s linear infinite; }
        .fade-up-1 { animation: fade-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both; }
        .fade-up-2 { animation: fade-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.25s both; }
        .fade-up-3 { animation: fade-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.4s both; }
        .fade-up-4 { animation: fade-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.55s both; }
      `}</style>

      {/* ━━━━━━━━━━ HERO ━━━━━━━━━━ */}
      <section className="px-6 md:px-12 pt-16 md:pt-20 pb-24 md:pb-32 grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">
        <div>
          <div className="fade-up-1 flex gap-6 items-center mb-14 opacity-60">
            <span className="text-[11px] tracking-[0.18em] lowercase">wholesale</span>
            <span className="w-1 h-1 bg-[#c85a08] rounded-full" />
            <span className="text-[11px] tracking-[0.18em] lowercase">est. toronto</span>
            <span className="w-1 h-1 bg-[#c85a08] rounded-full" />
            <span className="text-[11px] tracking-[0.18em] lowercase">slow-dried</span>
          </div>

          <h1 className="fade-up-2 font-['Cormorant_Garamond'] font-light text-[52px] sm:text-[64px] md:text-[72px] lg:text-[88px] xl:text-[96px] leading-[0.95] tracking-tight mb-12">
            Built for
            <br />
            bartenders <span className="italic text-[#c85a08] font-light">&amp;</span>
            <br />
            <em className="italic font-normal">tastemakers.</em>
          </h1>

          <p className="fade-up-3 text-[17px] leading-[1.55] max-w-[460px] text-[#3a3530] mb-14">
            Slow-dried citrus and fruit, finished by hand in Toronto. Now available in bulk for the bars, restaurants, hotels and event teams who care about every detail on the rim.
          </p>

          <div className="fade-up-4 flex gap-5 items-center">
            <button
              onClick={() => scrollTo('apply')}
              className="bg-[#1a1a1a] text-[#faf7f2] border-none px-9 py-[18px] font-['Jost'] text-[12px] tracking-[0.22em] lowercase cursor-pointer hover:bg-[#c85a08] transition-all duration-300"
            >
              request a quote
            </button>
            <a
              href="#accounts"
              className="text-[12px] tracking-[0.2em] lowercase text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 cursor-pointer hover:text-[#c85a08] hover:border-[#c85a08] transition-all duration-300 no-underline"
            >
              view accounts →
            </a>
          </div>
        </div>

        {/* Hero image slot */}
        <div className="fade-up-3 relative aspect-[4/5] bg-[#f3ede3] overflow-hidden flex items-center justify-center">
          {/* TO USE A REAL IMAGE: replace this entire placeholder div with:
              <img src="/images/hero-product.jpg" alt="Pure Peel Co. slow-dried citrus" className="w-full h-full object-cover" /> */}
          <div className="w-[70%] h-[70%] border border-dashed border-[#d9d2c5] flex flex-col items-center justify-center gap-2 text-[#3a3530]">
            <span className="font-['Cormorant_Garamond'] italic text-[18px] opacity-50">product image</span>
            <span className="text-[10px] tracking-[0.2em] lowercase opacity-40">4 : 5 vertical · cream background</span>
          </div>
          <div
            className="absolute right-5 top-1/2 text-[10px] tracking-[0.4em] lowercase text-[#1a1a1a] opacity-50 whitespace-nowrap"
            style={{ transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'right center' }}
          >
            wholesale catalogue · 2026
          </div>
          <div className="absolute bottom-5 left-5 font-['Cormorant_Garamond'] italic text-[13px] text-[#1a1a1a] opacity-60">
            a small batch — Toronto, Canada
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ MARQUEE ━━━━━━━━━━ */}
      <div className="border-y border-[#d9d2c5] py-7 overflow-hidden bg-[#faf7f2]">
        <div className="marquee-track flex gap-20 whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-20 whitespace-nowrap">
              {['orange', 'pink orange', 'lemon', 'lime', 'apple', 'pineapple'].map((fruit, j) => (
                <span key={`${i}-${j}`} className="font-['Cormorant_Garamond'] italic text-[22px] text-[#1a1a1a] opacity-70 flex items-center gap-20">
                  {fruit}
                  <span className="text-[#c85a08] not-italic">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

 {/* ━━━━━━━━━━ PARTNERS ━━━━━━━━━━ */}
<section id="partners" className="px-6 md:px-12 py-24 md:py-36">
  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-12 mb-16 md:mb-24 items-start">
    <div className="font-['Cormorant_Garamond'] italic text-[14px] text-[#c85a08]">
      <div className="block w-10 h-px bg-[#c85a08] mb-3" />
      no. 01 / partners
    </div>
    <h2 className="font-['Cormorant_Garamond'] font-light text-[40px] md:text-[5vw] xl:text-[68px] leading-[1.02] tracking-tight max-w-[880px]">
      Made for the kind of places
      <br />
      <em className="italic">guests remember.</em>
    </h2>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#d9d2c5] border border-[#d9d2c5]">
    {[
      { num: 'i', title: <>Bars &amp;<br />cocktail<br />programs</>, body: 'Garnish-ready citrus that holds shape, colour and aroma — service after service.', imgAlt: 'slice on a cocktail rim', imgFile: 'partner-bars.jpg' },
      { num: 'ii', title: <>Restaurants<br />&amp; hotels</>, body: 'From breakfast trays to dessert plating — a consistent, photogenic finish.', imgAlt: 'slice on a plated dish', imgFile: 'partner-restaurants.jpg' },
      { num: 'iii', title: <>Mobile<br />bartenders</>, body: 'Travel-light garnish that survives the cooler and shows up on camera.', imgAlt: 'slice in hand', imgFile: 'partner-mobile.jpg' },
      { num: 'iv', title: <>Caterers<br />&amp; event teams</>, body: 'Consistent quality at scale — for one table, or one thousand.', imgAlt: 'slices arranged on tray', imgFile: 'partner-caterers.jpg' },
    ].map((p, i) => (
      <div key={i} className="bg-[#faf7f2] p-9 md:p-12 flex flex-col hover:bg-[#f3ede3] transition-colors duration-300 group">
        <div className="w-14 h-14 border border-[#1a1a1a] rounded-full flex items-center justify-center font-['Cormorant_Garamond'] italic text-[22px] group-hover:bg-[#1a1a1a] group-hover:text-[#faf7f2] transition-all duration-300 mb-12">
          {p.num}
        </div>
        <h3 className="font-['Cormorant_Garamond'] italic font-normal text-[32px] leading-[1.05] mb-4">
          {p.title}
        </h3>
        <p className="text-[13px] leading-[1.5] text-[#3a3530] mb-8">{p.body}</p>

        <div className="mt-auto aspect-[4/3] bg-[#f3ede3] overflow-hidden relative">
          <img
            src={`/images/${p.imgFile}`}
            alt={p.imgAlt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback — hidden once image loads */}
          <div className="absolute inset-0 hidden items-center justify-center">
            <div className="w-[55%] aspect-square border border-dashed border-[#d9d2c5] rounded-full flex items-center justify-center font-['Cormorant_Garamond'] italic text-[12px] text-[#3a3530]/50 text-center px-3 leading-tight">
              {p.imgAlt}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

      {/* ━━━━━━━━━━ ACCOUNTS ━━━━━━━━━━ */}
      <section id="accounts" className="bg-[#1a1a1a] text-[#faf7f2] px-6 md:px-12 py-24 md:py-36">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-12 mb-16 md:mb-24 items-start">
          <div className="font-['Cormorant_Garamond'] italic text-[14px] text-[#e8c84a]">
            <div className="block w-10 h-px bg-[#e8c84a] mb-3" />
            no. 02 / accounts
          </div>
          <h2 className="font-['Cormorant_Garamond'] font-light text-[40px] md:text-[5vw] xl:text-[68px] leading-[1.02] tracking-tight max-w-[880px] text-[#faf7f2]">
            Three accounts.
            <br />
            Built around <em className="italic">your volume.</em>
          </h2>
        </div>

        <p className="max-w-[640px] md:ml-[248px] -mt-8 md:-mt-16 mb-16 md:mb-20 text-[#faf7f2]/65 text-[16px] leading-[1.6]">
          Wholesale partners receive bulk pricing, custom portioning and priority on seasonal stock — quoted individually based on volume, frequency and customization. The structure below is a starting point. Tell us where you fit and we'll come back with numbers.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              tag: 'small account',
              title: <>The<br />Standing</>,
              volume: 'light · monthly · single venue',
              includes: [
                'Single-venue bars & smaller programs',
                'Mixed-citrus orders, our five standard fruits',
                'Monthly delivery across Canada',
                'Direct text line for reorders',
              ],
              imgLabel: 'small format',
              featured: false,
            },
            {
              tag: 'medium account',
              title: <>The<br />Reserve</>,
              volume: 'steady · weekly or bi-weekly · multi-program',
              includes: [
                'Multi-venue groups & busy cocktail programs',
                'Bulk-format pricing, custom portioning',
                'Standing weekly or bi-weekly schedule',
                'Net-30 terms after the third order',
                'Priority on new releases & seasonal stock',
              ],
              imgLabel: 'bulk format',
              featured: true,
            },
            {
              tag: 'large account',
              title: <>The<br />Private</>,
              volume: 'scaled · ongoing · branded',
              includes: [
                'Hotel groups, hospitality brands & large programs',
                'Private-label or co-branded packaging',
                'Custom citrus & fruit blends, designed with your team',
                'Dedicated production schedule & account lead',
                'Volume-based pricing tiers',
              ],
              imgLabel: 'private label',
              featured: false,
            },
          ].map((acc, i) => (
            <div
              key={i}
              className={`border flex flex-col overflow-hidden transition-all duration-300 hover:border-[#e8c84a] hover:bg-[#e8c84a]/[0.03] hover:-translate-y-1 ${
                acc.featured ? 'bg-[#e8c84a]/[0.04] border-[#e8c84a]/30' : 'border-[#faf7f2]/15'
              }`}
            >
              <div className={`aspect-[4/3] flex items-center justify-center border-b border-[#faf7f2]/15 relative overflow-hidden ${
                acc.featured ? 'bg-[#e8c84a]/[0.06]' : 'bg-[#faf7f2]/[0.04]'
              }`}>
                {/* TO USE A REAL IMAGE: replace this div with:
                    <img src="/images/account-XXX.jpg" alt="..." className="w-full h-full object-cover" /> */}
                <div className="w-[60%] aspect-square border border-dashed border-[#faf7f2]/25 rounded-full flex items-center justify-center font-['Cormorant_Garamond'] italic text-[14px] text-[#faf7f2]/40">
                  {acc.imgLabel}
                </div>
              </div>

              <div className="p-9 pb-12 flex-1 flex flex-col">
                <span className="font-['Cormorant_Garamond'] italic text-[14px] text-[#e8c84a] mb-2 flex items-center">
                  <span className="inline-block w-6 h-px bg-[#e8c84a] mr-3" />
                  {acc.tag}
                </span>
                <h4 className="font-['Cormorant_Garamond'] italic font-light text-[44px] leading-[1.05] mb-5">
                  {acc.title}
                </h4>
                <div className="text-[12px] tracking-[0.2em] lowercase text-[#faf7f2]/50 mb-6 pb-6 border-b border-[#faf7f2]/10">
                  {acc.volume}
                </div>
                <ul className="list-none mb-8 flex-1">
                  {acc.includes.map((item, j) => (
                    <li
                      key={j}
                      className={`text-[14px] leading-[1.55] text-[#faf7f2]/80 py-2.5 pl-7 relative ${
                        j < acc.includes.length - 1 ? 'border-b border-[#faf7f2]/[0.06]' : ''
                      }`}
                    >
                      <span className="absolute left-0 top-2 font-['Cormorant_Garamond'] italic text-[#e8c84a] text-[18px]">
                        +
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollTo('apply')}
                  className="bg-transparent text-[#faf7f2] border border-[#faf7f2]/30 px-7 py-4 font-['Jost'] text-[11px] tracking-[0.22em] lowercase cursor-pointer transition-all duration-300 mt-auto flex justify-between items-center hover:bg-[#e8c84a] hover:text-[#1a1a1a] hover:border-[#e8c84a] group"
                >
                  <span>request a quote</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* HOW PRICING WORKS */}
        <div className="mt-24 pt-20 border-t border-[#faf7f2]/[0.12] grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-12 items-start">
          <div className="font-['Cormorant_Garamond'] italic text-[14px] text-[#e8c84a]">
            <div className="block w-10 h-px bg-[#e8c84a] mb-3" />
            how pricing works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 md:gap-20 items-start">
            <div>
              <h3 className="font-['Cormorant_Garamond'] font-light italic text-[36px] leading-[1.1] text-[#faf7f2] mb-5 tracking-tight">
                Quoted by the slice,
                <br />
                built around your program.
              </h3>
              <p className="text-[15px] leading-[1.65] text-[#faf7f2]/70 max-w-[480px]">
                Per-slice pricing varies by fruit, cut style, monthly volume and order frequency. Standing accounts receive preferred pricing over one-time orders. We'll send a tasting selection alongside your quote so you can taste before you commit.
              </p>
            </div>
            <ul className="list-none flex flex-col">
              {[
                { num: 'i', name: 'Fruit selection', detail: 'orange, lemon, lime, apple' },
                { num: 'ii', name: 'Cut style', detail: 'wheels, half-moons, custom' },
                { num: 'iii', name: 'Monthly volume', detail: 'scales with quantity' },
                { num: 'iv', name: 'Order frequency', detail: 'standing vs one-time' },
              ].map((v, i, arr) => (
                <li
                  key={i}
                  className={`flex justify-between items-baseline py-4 gap-6 ${
                    i === 0 ? 'pt-0' : ''
                  } ${i < arr.length - 1 ? 'border-b border-[#faf7f2]/10' : ''}`}
                >
                  <span className="font-['Cormorant_Garamond'] italic text-[13px] text-[#e8c84a] min-w-[24px]">{v.num}</span>
                  <span className="font-['Cormorant_Garamond'] italic text-[22px] text-[#faf7f2] flex-1">{v.name}</span>
                  <span className="text-[12px] text-[#faf7f2]/50 text-right lowercase tracking-[0.04em] max-w-[180px]">{v.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* MOQ STRIP */}
        <div className="mt-14 px-7 md:px-10 py-7 md:py-8 border border-[#e8c84a]/30 bg-[#e8c84a]/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="text-[11px] tracking-[0.22em] lowercase text-[#e8c84a]">minimum order</div>
            <div className="font-['Cormorant_Garamond'] italic text-[32px] text-[#faf7f2] leading-none mt-2">500 slices</div>
          </div>
          <div className="text-[13px] text-[#faf7f2]/60 max-w-[320px] md:text-right">
            To open a wholesale account. Roughly two weeks of garnish for a single-venue cocktail program.
          </div>
        </div>

        {/* LEAD TIME STRIP */}
        <div className="mt-4 px-7 md:px-10 py-7 md:py-8 border border-[#faf7f2]/15 bg-[#faf7f2]/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="text-[11px] tracking-[0.22em] lowercase text-[#faf7f2]/55">lead time</div>
            <div className="font-['Cormorant_Garamond'] italic text-[32px] text-[#faf7f2] leading-none mt-2">5–10 business days</div>
          </div>
          <div className="text-[13px] text-[#faf7f2]/60 max-w-[320px] md:text-right">
            First orders ship within 5–10 business days. Standing accounts ship same-week.
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ PROCESS ━━━━━━━━━━ */}
      <section id="process" className="px-6 md:px-12 py-24 md:py-36">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-12 mb-16 md:mb-24 items-start">
          <div className="font-['Cormorant_Garamond'] italic text-[14px] text-[#c85a08]">
            <div className="block w-10 h-px bg-[#c85a08] mb-3" />
            no. 03 / process
          </div>
          <h2 className="font-['Cormorant_Garamond'] font-light text-[40px] md:text-[5vw] xl:text-[68px] leading-[1.02] tracking-tight max-w-[880px]">
            A short, <em className="italic">considered</em>
            <br />
            onboarding.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 relative">
          <div className="hidden md:block absolute top-7 left-[5%] right-[5%] h-px bg-[#d9d2c5] z-0" />
          {[
            { num: 'i', title: 'Apply', body: "Tell us about your venue, volume and what you're trying to put on the menu. The form below takes about two minutes." },
            { num: 'ii', title: 'Tasting & Quote', body: 'We send a sample selection and a custom quote built around your volume — usually within two business days. No pressure, no minimums to start.' },
            { num: 'iii', title: 'First Order', body: 'Approved partners receive their first wholesale order within 5–10 business days, shipped from Toronto across Canada.' },
          ].map((s, i) => (
            <div key={i} className="relative z-10 group">
              <div className="w-14 h-14 bg-[#faf7f2] border border-[#1a1a1a] rounded-full flex items-center justify-center font-['Cormorant_Garamond'] italic text-[24px] mb-8 transition-all duration-300 group-hover:bg-[#c85a08] group-hover:text-[#faf7f2] group-hover:border-[#c85a08]">
                {s.num}
              </div>
              <h4 className="font-['Cormorant_Garamond'] italic font-normal text-[28px] mb-4">{s.title}</h4>
              <p className="text-[14px] leading-[1.6] text-[#3a3530] max-w-[320px]">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━ APPLY ━━━━━━━━━━ */}
      <section id="apply" className="bg-[#f3ede3] px-6 md:px-12 py-24 md:py-36">
        <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-14 md:gap-24 items-start">
          <div>
            <div className="font-['Cormorant_Garamond'] italic text-[14px] text-[#c85a08] mb-8">
              <div className="block w-10 h-px bg-[#c85a08] mb-3" />
              no. 04 / request a quote
            </div>
            <h2 className="font-['Cormorant_Garamond'] font-light text-[40px] md:text-[4.5vw] xl:text-[56px] leading-[1.02] tracking-tight mb-8">
              Tell us about
              <br />
              <em className="italic">your program.</em>
            </h2>
            <p className="text-[15px] text-[#3a3530] mb-12 max-w-[440px]">
              Custom quotes built around your volume and frequency. We'll come back with a tasting selection and pricing within two business days — no obligations.
            </p>

            {[
              { label: 'based', value: 'Toronto, ON' },
              { label: 'ships', value: 'Across Canada' },
              { label: 'written', value: 'wholesale@purepeel.ca' },
            ].map((row, i, arr) => (
              <div
                key={i}
                className={`flex flex-col gap-1 py-6 border-t border-[#d9d2c5] ${
                  i === arr.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">{row.label}</span>
                <span className="font-['Cormorant_Garamond'] italic text-[22px]">{row.value}</span>
              </div>
            ))}
          </div>

          {submitted ? (
            <div className="border border-[#c85a08]/30 bg-[#c85a08]/[0.04] p-10 md:p-14">
              <div className="font-['Cormorant_Garamond'] italic text-[14px] text-[#c85a08] mb-3">application received</div>
              <h3 className="font-['Cormorant_Garamond'] italic font-light text-[36px] leading-[1.1] mb-5">
                Thank you.
              </h3>
              <p className="text-[15px] text-[#3a3530] leading-[1.65] max-w-[440px]">
                We'll be in touch within two business days with a tasting selection and quote. In the meantime, feel free to reply to the confirmation email with anything else we should know.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">your name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">role / title</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">business name</label>
                  <input
                    type="text"
                    name="business"
                    value={formData.business}
                    onChange={handleChange}
                    required
                    className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">business type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%226%22%20viewBox=%220%200%2010%206%22%3E%3Cpath%20d=%22M1%201l4%204%204-4%22%20stroke=%22%231a1a1a%22%20fill=%22none%22/%3E%3C/svg%3E')] bg-no-repeat bg-right"
                  >
                    <option value="">select one</option>
                    <option>Bar / cocktail program</option>
                    <option>Restaurant</option>
                    <option>Hotel</option>
                    <option>Mobile bartender</option>
                    <option>Caterer / event team</option>
                    <option>One-time event</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">city</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">account type you're considering</label>
                  <select
                    name="accountSize"
                    value={formData.accountSize}
                    onChange={handleChange}
                    className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%226%22%20viewBox=%220%200%2010%206%22%3E%3Cpath%20d=%22M1%201l4%204%204-4%22%20stroke=%22%231a1a1a%22%20fill=%22none%22/%3E%3C/svg%3E')] bg-no-repeat bg-right"
                  >
                    <option value="">select one</option>
                    <option>The Standing — single venue, monthly</option>
                    <option>The Reserve — multi-venue, weekly / bi-weekly</option>
                    <option>The Private — branded / private label</option>
                    <option>One-time event</option>
                    <option>Not sure yet</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">monthly volume estimate</label>
                  <select
                    name="volume"
                    value={formData.volume}
                    onChange={handleChange}
                    className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%226%22%20viewBox=%220%200%2010%206%22%3E%3Cpath%20d=%22M1%201l4%204%204-4%22%20stroke=%22%231a1a1a%22%20fill=%22none%22/%3E%3C/svg%3E')] bg-no-repeat bg-right"
                  >
                    <option value="">select one</option>
                    <option>Under 500 slices / month</option>
                    <option>500 – 2,000 slices / month</option>
                    <option>2,000 – 5,000 slices / month</option>
                    <option>5,000+ slices / month</option>
                    <option>Not sure yet</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.18em] lowercase text-[#3a3530]">tell us a little more</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="What you're working on, signature drinks, timing, anything else we should know..."
                  className="bg-transparent border-0 border-b border-[#d9d2c5] py-3 font-['Jost'] text-[16px] font-light text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition-colors resize-y min-h-[80px]"
                />
              </div>

              <button
                type="submit"
                className="self-start mt-4 bg-[#1a1a1a] text-[#faf7f2] border-none px-12 py-5 font-['Jost'] text-[12px] tracking-[0.22em] lowercase cursor-pointer hover:bg-[#c85a08] transition-all duration-300"
              >
                request a quote
              </button>

              <p className="-mt-4 text-[12px] text-[#3a3530] opacity-70 italic font-['Cormorant_Garamond']">
                Application details used only for wholesale follow-up.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━ FOOTER REMOVED ━━━━━━━━━━ */}
      {/* The site's global footer (rendered by your layout/App.jsx) handles this. */}
    </div>
  );
}