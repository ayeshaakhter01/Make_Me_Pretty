import { useState } from 'react'
import Icon from '../ui/Icon.jsx'
import AdvisorDisclaimer from './AdvisorDisclaimer.jsx'
import { CONCERNS, EXAMPLE_PROMPTS } from '../../data/skinAdvisor.js'

const MAX_LENGTH = 500

export default function SkinAdvisorForm({ onSubmit, loading = false }) {
  const [text, setText] = useState('')
  const [chosen, setChosen] = useState([])
  const [error, setError] = useState('')

  function toggleConcern(id) {
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (text.trim().length < 10 && chosen.length === 0) {
      setError('Tell us a little about your skin, or tap at least one concern below.')
      return
    }
    setError('')
    onSubmit({ text: text.trim(), concernIds: chosen })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-line bg-cream/90 p-6 shadow-[0_18px_45px_rgba(59,48,44,.09)] backdrop-blur sm:p-9">
      <label htmlFor="skin-text" className="field-label !text-rose">Describe your skin</label>
      <textarea
        id="skin-text"
        value={text}
        maxLength={MAX_LENGTH}
        onChange={(event) => { setText(event.target.value); setError('') }}
        placeholder="For example: my skin gets oily by noon, I get breakouts on my chin, and it feels a bit sensitive…"
        className="min-h-[140px] resize-y"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-soft">
        <span>Try: {EXAMPLE_PROMPTS.map((prompt, index) => (
          <button key={prompt} type="button" onClick={() => { setText(prompt); setError('') }} className="mr-2 underline decoration-rose/40 underline-offset-2 hover:text-rose">Example {index + 1}</button>
        ))}</span>
        <span aria-live="polite">{text.length}/{MAX_LENGTH}</span>
      </div>

      <fieldset className="mt-7">
        <legend className="field-label !text-rose">Or tap what applies to you</legend>
        <div className="flex flex-wrap gap-2.5">
          {CONCERNS.map((concern) => {
            const active = chosen.includes(concern.id)
            return (
              <button
                key={concern.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleConcern(concern.id)}
                className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-medium transition-colors ${active ? 'border-rose bg-pink-soft text-rose-deep' : 'border-line bg-cream text-ink hover:border-rose'}`}
              >
                {active && <span aria-hidden="true" className="mr-1.5">✓</span>}{concern.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      {error && <p role="alert" className="mt-5 rounded-2xl bg-lowstock-bg px-4 py-3 text-[13px] text-lowstock-text">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-rose px-7 py-3.5 text-sm font-medium tracking-[0.04em] text-white transition-all hover:-translate-y-0.5 hover:bg-rose-deep active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
      >
        <Icon name="sparkle" className="size-[18px]" />
        {loading ? 'Finding your matches…' : 'Find my products'}
      </button>

      <AdvisorDisclaimer className="mt-6" />
    </form>
  )
}
