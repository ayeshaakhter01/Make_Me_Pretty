const story = 'As the Founder of Make Me Pretty, my vision has always been simple — to make authentic skincare accessible and trustworthy for everyone. What started as a small dream in June 2021 has grown with the love and trust of our customers. Every order we send carries care, honesty, and gratitude. Thank you for being part of our journey 💜'
const people = [
  { name: 'Ayesha Akhter', text: story },
  { name: 'MD Sadman Hasan', text: story },
]

function BrushUnderline() {
  return <svg viewBox="0 0 460 34" aria-hidden="true" className="mx-auto mt-3 h-7 w-[min(460px,78%)]" fill="none"><defs><linearGradient id="brush-underline" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#e01a7f"/><stop offset="1" stopColor="#ff5fa2"/></linearGradient></defs><path d="M10 20 C 120 6, 250 26, 360 15 S 440 12, 452 19" stroke="url(#brush-underline)" strokeWidth="8" strokeLinecap="round"/><path d="M28 27 C 150 20, 300 30, 430 22" stroke="url(#brush-underline)" strokeWidth="3.5" strokeLinecap="round" opacity=".55"/></svg>
}

function FounderPhoto({ name }) {
  return <div className="about-photo-float mx-auto w-full max-w-[360px]"><div className="about-photo-frame rounded-[26px] bg-white p-3 shadow-[0_18px_45px_rgba(59,48,44,.15)]"><div className="about-photo-inner flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[18px] bg-[#47788c] text-[clamp(14px,2vw,20px)] font-bold tracking-[0.08em] text-white/85">{name}</div></div></div>
}

export default function AboutUsPage() {
  return <div className="mx-auto max-w-[1000px] overflow-x-clip px-5 py-14 sm:py-16"><header className="about-in text-center"><h1 className="font-serif text-[clamp(28px,5.5vw,48px)] font-normal">The People Behind Make Me Pretty</h1><BrushUnderline/></header><div className="mt-14 space-y-16 sm:space-y-24">{people.map((person, index) => <section key={person.name} className={`flex flex-col items-center gap-8 md:gap-12 ${index % 2 ? 'md:flex-row-reverse' : 'md:flex-row'}`}><div className="about-in md:w-1/2"><h2 className="font-serif text-2xl sm:text-3xl">{person.name}</h2><div className="mt-2 h-0.5 w-12 rounded-full bg-rose/60"/><p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{person.text}</p></div><div className="about-in w-full md:w-1/2"><FounderPhoto name="PHOTO"/></div></section>)}</div></div>
}
