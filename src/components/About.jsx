import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: '5+', label: 'Years Experience' },
  { value: '40+', label: 'Projects Shipped' },
  { value: '12+', label: 'Happy Clients' },
  { value: '∞', label: 'Cups of Coffee' },
]

const INTERESTS = [
  { icon: '⬡', text: 'Creative Coding' },
  { icon: '◈', text: 'Generative Art' },
  { icon: '◎', text: 'Web Performance' },
  { icon: '⟡', text: 'Open Source' },
  { icon: '⬢', text: 'UI Systems' },
  { icon: '◉', text: '3D on the Web' },
]

function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

export default function About() {
  const [ref, inView] = useInView(0.15)

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-32 px-8 md:px-16 lg:px-24 bg-obsidian-900 overflow-hidden"
    >
      {/* Background accent */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 70%)',
          transform: 'translate(-30%, -30%)',
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div
          className={`section-label mb-4 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          01 &nbsp;/&nbsp; About Me
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* ── Left: Text ─────────────────────────────────────────────── */}
          <div>
            <h2
              className={`section-title mb-8 transition-all duration-700 delay-100 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Building things
              <br />
              <span className="text-gradient">that matter.</span>
            </h2>

            <div
              className={`space-y-5 text-white/55 font-body leading-relaxed transition-all duration-700 delay-200 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <p>
                I'm a creative developer based in San Francisco, obsessed with
                the intersection of art and engineering. I believe the best
                digital products feel inevitable — simple on the surface, deeply
                considered underneath.
              </p>
              <p>
                My work spans full-stack development, interactive 3D experiences,
                and design systems. I'm drawn to problems that require both
                technical rigor and aesthetic sensitivity — the kind that most
                people solve only halfway.
              </p>
              <p>
                When I'm not coding, you'll find me tinkering with generative
                art, contributing to open source, or hunting for the perfect
                espresso shot.
              </p>
            </div>

            {/* Interests */}
            <div
              className={`mt-10 transition-all duration-700 delay-300 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <p className="font-mono text-xs text-white/30 tracking-widest uppercase mb-4">
                Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(({ icon, text }) => (
                  <span
                    key={text}
                    className="flex items-center gap-2 px-3 py-1.5 bg-obsidian-800 border border-white/8 rounded-full text-xs font-mono text-white/50 hover:border-amber-glow/30 hover:text-amber-glow/70 transition-all duration-300 cursor-default"
                  >
                    <span className="text-amber-glow/60">{icon}</span>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Stats + visual ──────────────────────────────────── */}
          <div
            className={`transition-all duration-700 delay-200 ${
              inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            {/* Avatar placeholder with decorative frame */}
            <div className="relative mb-10">
              <div className="relative w-full aspect-square max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden glow-border bg-obsidian-800">
                {/* Abstract visual in lieu of photo */}
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 40% 40%, rgba(245,166,35,0.1) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,212,255,0.08) 0%, transparent 50%)',
                  }}
                >
                  <div className="font-display text-[120px] leading-none select-none opacity-20">
                    AC
                  </div>
                </div>
                {/* Corner markers */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-amber-glow/40" />
                <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-amber-glow/40" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-amber-glow/40" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-amber-glow/40" />
              </div>

              {/* Floating tag */}
              <div className="absolute -bottom-4 -right-4 bg-obsidian-800 border border-amber-glow/20 rounded-lg px-4 py-2 glow-border">
                <div className="font-mono text-xs text-amber-glow">◉ Open to work</div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map(({ value, label }, i) => (
                <div
                  key={label}
                  className={`card-surface p-5 hover:border-amber-glow/20 hover:bg-obsidian-700 transition-all duration-300 group cursor-default transition-all duration-700 ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${300 + i * 80}ms` }}
                >
                  <div className="font-display text-3xl font-bold text-amber-glow group-hover:glow-text transition-all duration-300 mb-1">
                    {value}
                  </div>
                  <div className="font-mono text-xs text-white/40 tracking-wide">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}