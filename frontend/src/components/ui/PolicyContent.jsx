import { Link } from 'react-router-dom'

/* Shows policy text written in the admin. Simple format:
   "## Heading"   a heading
   "- item"       a bullet list (one item per line)
   "1. step"      a numbered list
   "[text](/p/x)" a link (site path or https address)
   Anything else is a paragraph. Leave a blank line between blocks. */
const linkClass = 'font-medium text-rose underline underline-offset-4 hover:text-rose-deep'
const LINK = /\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g

function Inline({ text }) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const [whole, label, href] = match
    parts.push(href.startsWith('/')
      ? <Link key={match.index} to={href} className={linkClass}>{label}</Link>
      : <a key={match.index} href={href} target="_blank" rel="noreferrer" className={linkClass}>{label}</a>)
    last = match.index + whole.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

function toBlocks(text) {
  const blocks = []
  for (const raw of String(text || '').replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    let lines = raw.split('\n').map((line) => line.trimEnd()).filter((line) => line.trim())
    while (lines.length) {
      if (/^##\s+/.test(lines[0])) { blocks.push({ type: 'h', text: lines[0].replace(/^##\s+/, '') }); lines = lines.slice(1) }
      else if (/^-\s+/.test(lines[0])) { const n = lines.findIndex((line) => !/^-\s+/.test(line)); const take = n < 0 ? lines.length : n; blocks.push({ type: 'ul', items: lines.slice(0, take).map((line) => line.replace(/^-\s+/, '')) }); lines = lines.slice(take) }
      else if (/^\d+\.\s+/.test(lines[0])) { const n = lines.findIndex((line) => !/^\d+\.\s+/.test(line)); const take = n < 0 ? lines.length : n; blocks.push({ type: 'ol', items: lines.slice(0, take).map((line) => line.replace(/^\d+\.\s+/, '')) }); lines = lines.slice(take) }
      else { const n = lines.findIndex((line) => /^(##\s+|-\s+|\d+\.\s+)/.test(line)); const take = n < 0 ? lines.length : n; blocks.push({ type: 'p', text: lines.slice(0, take).join('\n') }); lines = lines.slice(take) }
    }
  }
  return blocks
}

export default function PolicyContent({ text }) {
  const blocks = toBlocks(text)
  if (!blocks.length) return <p className="mt-6 text-[15px] text-ink-soft">This policy will be added soon.</p>
  return (
    <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-soft">
      {blocks.map((block, index) => {
        if (block.type === 'h') return <h2 key={index} className="pt-5 font-serif text-[22px] text-ink">{block.text}</h2>
        if (block.type === 'ul') return <ul key={index} className="list-disc space-y-2 pl-5 marker:text-rose">{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</ul>
        if (block.type === 'ol') return <ol key={index} className="list-decimal space-y-2 pl-5 marker:font-medium marker:text-rose">{block.items.map((item, i) => <li key={i}><Inline text={item} /></li>)}</ol>
        return <p key={index} className="whitespace-pre-line"><Inline text={block.text} /></p>
      })}
    </div>
  )
}
