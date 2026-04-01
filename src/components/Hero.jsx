import { useEffect, useState } from 'react'
import Scene from '../three/Scene'

const NAV_LINKS = ['About', 'Projects', 'Skills', 'Contact']

// Typewriter hook
function useTypewriter(words, speed = 80, pause = 2000) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex % words.length]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, charIndex + 1))
        if (charIndex + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause)
        } else {
          setCharIndex((c) => c + 1)
        }
      } else {
        setText(current.slice(0, charIndex - 1))
        if (charIndex - 1 === 0) {
          setDeleting(false)
          setWordIndex((w) => (w + 1) % words.length)
          setCharIndex(0)
        } else {
          setCharIndex((c) => c - 1)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, wordIndex, words, speed, pause])

  return text
}

export default function Hero({ theme, onToggleTheme }) {
  const [visible, setVisible] = useState(false)
  const role = useTypewriter(
    ['Creative Developer', 'UI/UX Architect', 'Digital Craftsman', 'Full Stack Engineer'],
    75,
    2200
  )

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative w-full h-screen overflow-hidden bg-slate-100 dark:bg-obsidian-900 transition-colors duration-300">
      {/* Three.js canvas */}
      <Scene />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(15,23,42,0.18) 100%)' }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.2), transparent)' }}
      />

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 md:px-16 py-8 transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {/* Logo */}
        <div className="font-mono text-sm text-amber-glow tracking-widest font-medium">
          <span className="text-slate-600 dark:text-white/40">{'<'}</span>
          portfolio
          <span className="text-slate-600 dark:text-white/40">{' />'}</span>
        </div>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <button
                onClick={() => scrollTo(link.toLowerCase())}
                className="nav-link group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-glow group-hover:w-full transition-all duration-300" />
              </button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="font-mono text-[10px] tracking-widest uppercase px-3 py-2 rounded border border-slate-400/50 text-slate-700 dark:border-white/20 dark:text-white/70 hover:border-amber-glow/50 hover:text-amber-glow transition-all duration-300"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <a href="#contact" className="btn-outline text-xs">
          Hire Me
          </a>
        </div>
      </nav>

      {/* ── Hero Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24 max-w-6xl">
        {/* Pre-label */}
        <div
          className={`section-label mb-6 transition-all duration-700 delay-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          ✦ &nbsp; Available for work
        </div>

        {/* Main heading */}
        <h1
          className={`font-display font-bold leading-none mb-4 transition-all duration-700 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="block text-5xl md:text-7xl lg:text-8xl text-slate-900 dark:text-white mb-2">
            Hello, I'm
          </span>
          <span className="block text-6xl md:text-8xl lg:text-9xl text-gradient glow-text">
            Alex Chen
          </span>
        </h1>

        {/* Typewriter role */}
        <div
          className={`flex items-center gap-3 mb-10 transition-all duration-700 delay-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="font-mono text-xl md:text-2xl text-slate-600 dark:text-white/50">{'// '}</span>
          <span className="font-mono text-xl md:text-2xl text-amber-glow/80 min-w-[260px]">
            {role}
            <span className="animate-pulse text-amber-glow">▮</span>
          </span>
        </div>

        {/* Description */}
        <p
          className={`font-body text-slate-600 dark:text-white/50 text-base md:text-lg max-w-xl leading-relaxed mb-12 transition-all duration-700 delay-[900ms] ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          I craft immersive digital experiences where engineering precision
          meets design intent — one pixel-perfect interaction at a time.
        </p>

        {/* CTAs */}
        <div
          className={`flex items-center gap-4 transition-all duration-700 delay-[1100ms] ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <button onClick={() => scrollTo('projects')} className="btn-primary">
            View Work
          </button>
          <button onClick={() => scrollTo('contact')} className="btn-outline">
            Get in Touch
          </button>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 transition-all duration-1000 delay-[1500ms] ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-slate-600 dark:text-white/30 uppercase">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-amber-glow/60 to-transparent animate-float" />
      </div>

      {/* ── Corner decorations ───────────────────────────────────────────── */}
      <div className="absolute top-8 right-8 z-10 hidden lg:flex flex-col items-end gap-1 opacity-30">
        <span className="font-mono text-[10px] text-amber-glow tracking-widest">
          v2.0.25
        </span>
        <span className="font-mono text-[10px] text-slate-600 dark:text-white/40 tracking-widest">
          PDL_SYSTEM
        </span>
      </div>

      <div className="absolute bottom-8 right-8 z-10 hidden lg:block">
        <div className="font-mono text-[10px] text-slate-600 dark:text-white/20 tracking-widest text-right leading-relaxed">
          <div>THREE.js_ACTIVE</div>
          <div className="text-amber-glow/40">◉ RENDERING</div>
        </div>
      </div>
    </section>
  )
}