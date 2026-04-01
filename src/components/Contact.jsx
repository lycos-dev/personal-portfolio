import { useEffect, useRef, useState } from 'react'

const SOCIAL_LINKS = [
  { label: 'GitHub', handle: '@alexchen', href: '#', icon: '⌥' },
  { label: 'LinkedIn', handle: 'in/alexchen', href: '#', icon: '◈' },
  { label: 'Twitter/X', handle: '@alexchen_dev', href: '#', icon: '⬡' },
  { label: 'Email', handle: 'hello@alexchen.dev', href: 'mailto:hello@alexchen.dev', icon: '◉' },
]

function FormField({ label, name, type = 'text', placeholder, textarea, value, onChange }) {
  const [focused, setFocused] = useState(false)

  const shared = {
    name,
    value,
    onChange,
    placeholder,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    className: `w-full bg-obsidian-800 border rounded-lg px-4 py-3 font-body text-sm text-white placeholder-white/20 outline-none transition-all duration-300 resize-none ${
      focused
        ? 'border-amber-glow/50 shadow-[0_0_0_1px_rgba(245,166,35,0.15)]'
        : 'border-white/8 hover:border-white/15'
    }`,
  }

  return (
    <div className="relative">
      <label className="block font-mono text-xs tracking-widest uppercase text-white/30 mb-2">
        {label}
      </label>
      {textarea ? (
        <textarea rows={5} {...shared} />
      ) : (
        <input type={type} {...shared} />
      )}
      {/* Animated border bottom */}
      <div
        className="absolute bottom-0 left-0 h-px bg-amber-glow transition-all duration-500 rounded-b-lg"
        style={{ width: focused ? '100%' : '0%' }}
      />
    </div>
  )
}

export default function Contact() {
  const [ref, setRef] = useState(null)
  const [inView, setInView] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // 'sending' | 'sent' | null

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.1 }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')
    setTimeout(() => {
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    }, 1500)
  }

  return (
    <section
      id="contact"
      ref={setRef}
      className="relative py-32 px-8 md:px-16 lg:px-24 bg-obsidian-950 overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 65%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className={`section-label mb-4 justify-center flex transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            04 &nbsp;/&nbsp; Contact
          </div>
          <h2
            className={`section-title mx-auto transition-all duration-700 delay-100 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Let's build
            <br />
            <span className="text-gradient">something great.</span>
          </h2>
          <p
            className={`mt-6 text-white/40 font-body max-w-md mx-auto text-base transition-all duration-700 delay-200 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Have a project in mind or just want to connect? Drop me a message
            and I'll get back within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* ── Form ──────────────────────────────────────────────────── */}
          <div
            className={`lg:col-span-3 transition-all duration-700 delay-200 ${
              inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            {status === 'sent' ? (
              <div className="card-surface p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px] border-amber-glow/20 glow-border">
                <div className="text-5xl mb-6 animate-float">✦</div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  Message sent!
                </h3>
                <p className="text-white/45 font-body text-sm mb-8">
                  Thanks for reaching out — I'll be in touch soon.
                </p>
                <button
                  onClick={() => setStatus(null)}
                  className="btn-outline text-xs"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Name"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <FormField
                  label="Message"
                  name="message"
                  placeholder="Tell me about your project…"
                  textarea
                  value={form.message}
                  onChange={handleChange}
                />

                <button
                  type="submit"
                  disabled={status === 'sending' || !form.name || !form.email || !form.message}
                  className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <>
                      <span className="w-3 h-3 border border-obsidian-900 border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send Message →'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <div
            className={`lg:col-span-2 transition-all duration-700 delay-300 ${
              inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <p className="font-mono text-xs text-white/30 tracking-widest uppercase mb-6">
              Find me on
            </p>

            <div className="space-y-3">
              {SOCIAL_LINKS.map(({ label, handle, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/8 bg-obsidian-800 hover:border-amber-glow/25 hover:bg-obsidian-700 transition-all duration-300 group"
                >
                  <span className="text-amber-glow/60 text-base w-6 text-center group-hover:text-amber-glow transition-colors duration-300">
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-white/30 tracking-widest uppercase mb-0.5">
                      {label}
                    </div>
                    <div className="font-body text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300 truncate">
                      {handle}
                    </div>
                  </div>
                  <span className="text-white/20 group-hover:text-amber-glow/60 transition-all duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              ))}
            </div>

            {/* Availability badge */}
            <div className="mt-8 p-5 rounded-xl border border-amber-glow/15 bg-amber-glow/5 glow-border">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-glow animate-pulse" />
                <span className="font-mono text-xs text-amber-glow tracking-widest uppercase">
                  Available
                </span>
              </div>
              <p className="font-body text-sm text-white/50 leading-relaxed">
                Currently open to full-time roles and select freelance projects
                starting Q2 2025.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative max-w-6xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-mono text-xs text-white/20">
          <span className="text-amber-glow/40">{'<'}</span>
          portfolio
          <span className="text-amber-glow/40">{' />'}</span>
          {' '}© 2025 Alex Chen
        </div>
        <div className="font-mono text-xs text-white/20">
          Built with React · Three.js · Tailwind CSS
        </div>
      </div>
    </section>
  )
}