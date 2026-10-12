import { jsx, jsxs } from "react/jsx-runtime";
import { apiFetch } from "@/lib/api.js";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button.js";
import { cx } from "@/lib/utils.js";
function ShareYourGlow() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", text: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [previewType, setPreviewType] = useState("image");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);
  const pick = (picked) => {
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setPreviewType(picked.type.startsWith("video") ? "video" : "image");
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr("Please tell us your name.");
    if (f.text.trim().length < 10)
      return setErr("Please write a few words about your experience.");
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", f.name.trim());
      fd.append("text", f.text.trim());
      if (file) fd.append("media", file);
      const res = await apiFetch("/api/reviews", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.error || "Couldn\u2019t send your review. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setErr("Network error. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-[720px] px-5 pb-20 pt-6", children: [
    /* @__PURE__ */ jsx("div", { className: "share-glow-frame", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-[28px] bg-white/80 px-6 py-9 backdrop-blur-md sm:px-10 sm:py-11", children: [
      /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0", children: ["10%", "84%", "26%", "70%"].map((left, i) => /* @__PURE__ */ jsx(
        "span",
        {
          className: "absolute animate-floaty text-xl text-rose/25 sm:text-2xl",
          style: {
            left,
            top: `${12 + i * 27 % 66}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${5 + i}s`
          },
          children: "\u273F"
        },
        i
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "relative text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-rose", children: "We\u2019d love to hear from you" }),
        /* @__PURE__ */ jsx("h2", { className: "mt-2 font-serif text-[clamp(26px,4.4vw,34px)] font-normal", children: "Share Your Experience" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-soft", children: "Loved your Make Me Pretty ritual? Tell the community \u2014 add a photo or video if you like. Reviews appear once our team approves them." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              setDone(false);
              setErr("");
              setOpen(true);
            },
            className: "group mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-ivory transition-all hover:-translate-y-0.5 hover:shadow-lift",
            children: [
              "Share Your Experience",
              /* @__PURE__ */ jsx("span", { className: "transition-transform duration-300 group-hover:translate-x-1", children: "\u2192" })
            ]
          }
        )
      ] })
    ] }) }),
    open && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          onClick: () => setOpen(false),
          className: "absolute inset-0 bg-ink/55 backdrop-blur-lg animate-[fadeup_.3s_ease]"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-h-[92vh] w-[min(94vw,620px)] overflow-y-auto rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur-md animate-[pop_.35s_ease] sm:p-9", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setOpen(false),
            "aria-label": "Close",
            className: "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-lg text-white transition-colors hover:bg-ink",
            children: "\u2715"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-rose", children: "We\u2019d love to hear from you" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-1.5 font-serif text-[clamp(24px,4vw,30px)] font-normal", children: "Share Your Experience" })
        ] }),
        done ? /* @__PURE__ */ jsxs("div", { className: "mt-7 rounded-2xl bg-pink-soft px-5 py-8 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl", children: "\u{1F497}" }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 font-serif text-lg", children: "Thank you for sharing!" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-[13.5px] text-ink-soft", children: "Your review is with our team and will appear once it\u2019s approved." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setOpen(false),
              className: "mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-ink/90",
              children: "Done"
            }
          )
        ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-6 grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Your name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: f.name,
                onChange: (e) => setF({ ...f, name: e.target.value }),
                placeholder: "Ayesha Rahman",
                className: "!bg-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Your experience" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                rows: 4,
                value: f.text,
                onChange: (e) => setF({ ...f, text: e.target.value }),
                placeholder: "What did you love? How did your skin feel?",
                className: "!bg-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "field-label", children: "Photo / video (optional)" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => fileRef.current?.click(),
                  className: cx(
                    "flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-white transition-colors",
                    preview ? "border-rose/40" : "border-line hover:border-rose"
                  ),
                  children: preview ? previewType === "video" ? /* @__PURE__ */ jsx("video", { src: preview, muted: true, loop: true, autoPlay: true, playsInline: true, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("img", { src: preview, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: "text-xl text-ink-soft", children: "\uFF0B" })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "text-[12px] text-ink-soft", children: [
                "JPG, PNG, WEBP or MP4/WEBM.",
                /* @__PURE__ */ jsx("br", {}),
                "Images \u2264 4 MB \xB7 videos \u2264 25 MB.",
                file && /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setFile(null);
                      setPreview("");
                      if (fileRef.current) fileRef.current.value = "";
                    },
                    className: "mt-1 block text-rose underline",
                    children: [
                      "Remove ",
                      file.name.length > 22 ? file.name.slice(0, 22) + "\u2026" : file.name
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: fileRef,
                type: "file",
                accept: "image/*,video/mp4,video/webm",
                className: "hidden",
                onChange: (e) => pick(e.target.files?.[0])
              }
            )
          ] }),
          err && /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-lowstock-bg px-3.5 py-2.5 text-[13px] text-lowstock-text", children: err }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: busy, className: "w-full", children: busy ? "Sending\u2026" : "Submit my review" })
        ] })
      ] })
    ] })
  ] });
}
export {
  ShareYourGlow as default
};
