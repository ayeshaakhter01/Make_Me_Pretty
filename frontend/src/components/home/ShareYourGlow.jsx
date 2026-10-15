import { useEffect, useRef, useState } from 'react'
import PageContainer from '../ui/PageContainer.jsx'

export default function ShareYourGlow() {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fileError, setFileError] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [previewType, setPreviewType] = useState('image')
  const [name, setName] = useState('')
  const [experience, setExperience] = useState('')
  const [errors, setErrors] = useState({})
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function close() {
    setOpen(false)
    setSubmitted(false)
    setFileError('')
    setFile(null)
    setPreview('')
    setName('')
    setExperience('')
    setErrors({})
    if (fileRef.current) fileRef.current.value = ''
  }

  function validate() {
    const next = {}
    if (!name.trim()) next.name = 'Please enter your name.'
    if (!experience.trim()) next.experience = 'Please share your experience.'
    else if (experience.trim().length < 10) next.experience = 'Please write at least 10 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) {
      document.getElementById(!name.trim() ? 'review-name' : 'review-experience')?.focus()
      return
    }
    setSubmitted(true)
  }

  function pickFile(event) {
    const picked = event.target.files?.[0]
    if (!picked) return
    const isVideo = picked.type.startsWith('video/')
    const validType = isVideo ? ['video/mp4', 'video/webm'].includes(picked.type) : ['image/jpeg', 'image/png', 'image/webp'].includes(picked.type)
    const limit = isVideo ? 25 * 1024 * 1024 : 4 * 1024 * 1024
    if (!validType || picked.size > limit) {
      setFileError(!validType ? 'Please choose a JPG, PNG, WEBP, MP4, or WEBM file.' : `Please choose a file under ${isVideo ? '25 MB' : '4 MB'}.`)
      event.target.value = ''
      return
    }
    setFileError('')
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
    setPreviewType(isVideo ? 'video' : 'image')
  }

  return <>
    <PageContainer className="max-w-[720px] pb-20 pt-6"><div className="share-glow-frame"><div className="relative overflow-hidden rounded-[28px] bg-white/80 px-6 py-9 text-center backdrop-blur-md sm:px-10 sm:py-11"><div aria-hidden="true" className="pointer-events-none absolute inset-0">{['10%','84%','26%','70%'].map((left,index) => <span key={left} className="absolute animate-floaty text-xl text-rose/25 sm:text-2xl" style={{ left, top: `${12 + index * 27 % 66}%`, animationDelay: `${index * .8}s`, animationDuration: `${5 + index}s` }}>✿</span>)}</div><div className="relative"><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose">We’d love to hear from you</p><h2 className="mt-2 font-serif text-[clamp(26px,4.4vw,34px)] font-normal">Share Your Experience</h2><p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-soft">Loved your Make Me Pretty ritual? Tell the community — add a photo or video if you like. Reviews appear once our team approves them.</p><button type="button" onClick={() => { setSubmitted(false); setFileError(''); setOpen(true) }} className="group mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,48,44,.18)]">Share Your Experience <span className="transition-transform group-hover:translate-x-1">→</span></button></div></div></div></PageContainer>
    {open && <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-lg" onClick={close}><section role="dialog" aria-modal="true" aria-labelledby="experience-title" onClick={(event) => event.stopPropagation()} className="relative my-6 w-[min(94vw,620px)] max-h-[92vh] overflow-y-auto rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur-md sm:p-9"><button type="button" onClick={close} aria-label="Close form" className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-ink/60 text-lg text-white transition hover:bg-ink">×</button><header className="text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose">We’d love to hear from you</p><h2 id="experience-title" className="mt-1.5 font-serif text-[clamp(24px,4vw,30px)] font-normal">Share Your Experience</h2></header>
      {submitted ? <div role="status" className="mt-6 rounded-2xl bg-pink-soft px-5 py-8 text-center"><p className="text-3xl">💗</p><p className="mt-2 font-serif text-lg">Thank you for sharing!</p><p className="mt-1 text-[13.5px] text-ink-soft">Your review is with our team and will appear once it’s approved.</p><button type="button" onClick={close} className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory">Done</button></div> : <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4"><div><label htmlFor="review-name" className="field-label">Your name <span className="text-rose">*</span></label><input id="review-name" value={name} onChange={(event) => { setName(event.target.value); if (errors.name) setErrors((current) => ({ ...current, name: '' })) }} aria-required="true" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'review-name-error' : undefined} placeholder="Ayesha Rahman" autoComplete="name" className={`!bg-white ${errors.name ? '!border-rose-deep !shadow-[0_0_0_3px_rgba(190,90,110,.12)]' : ''}`}/>{errors.name && <p id="review-name-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-left text-xs text-rose-deep"><span aria-hidden="true">✿</span>{errors.name}</p>}</div><div><label htmlFor="review-experience" className="field-label">Your experience <span className="text-rose">*</span></label><textarea id="review-experience" value={experience} onChange={(event) => { setExperience(event.target.value); if (errors.experience) setErrors((current) => ({ ...current, experience: '' })) }} aria-required="true" aria-invalid={Boolean(errors.experience)} aria-describedby={errors.experience ? 'review-experience-error' : undefined} rows="4" placeholder="What did you love? How did your skin feel?" className={`!bg-white !rounded-[18px] !py-3 resize-y ${errors.experience ? '!border-rose-deep !shadow-[0_0_0_3px_rgba(190,90,110,.12)]' : ''}`}/>{errors.experience && <p id="review-experience-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-left text-xs text-rose-deep"><span aria-hidden="true">✿</span>{errors.experience}</p>}</div><div><span className="field-label">Photo / video (optional)</span><div className="flex items-center gap-3"><button type="button" onClick={() => fileRef.current?.click()} aria-label={file ? `Replace ${file.name}` : 'Add a photo or video'} className={`flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-white text-xl text-ink-soft transition hover:border-rose ${file ? 'border-rose/40' : 'border-line'}`}>{preview ? previewType === 'video' ? <video src={preview} muted loop autoPlay playsInline className="size-full object-cover"/> : <img src={preview} alt="Selected review media" className="size-full object-cover"/> : '+'}</button><div className="text-[12px] leading-relaxed text-ink-soft">JPG, PNG, WEBP or MP4/WEBM.<br/>Images ≤ 4 MB · videos ≤ 25 MB.{file && <button type="button" onClick={() => { setFile(null); setPreview(''); if (fileRef.current) fileRef.current.value = '' }} className="mt-1 block text-rose underline">Remove {file.name.length > 22 ? `${file.name.slice(0, 22)}…` : file.name}</button>}</div><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={pickFile} className="hidden"/></div>{fileError && <p role="alert" className="mt-2 text-xs text-rose-deep">{fileError}</p>}</div><button type="submit" disabled={Boolean(fileError)} className="w-full rounded-full bg-rose px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-60">Submit my review</button></form>}
    </section></div>}
  </>
}