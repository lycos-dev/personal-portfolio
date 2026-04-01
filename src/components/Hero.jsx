import { useEffect, useState } from 'react'
import GlobeScene from '../three/GlobeScene'

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

export default function Hero() {
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
    <section className="relative min-h-screen overflow-hidden bg-obsidian-900">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian-900 pointer-events-none" />

      <nav
        className={`relative z-20 flex items-center justify-between px-8 md:px-16 py-8 transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="font-mono text-sm text-amber-glow tracking-widest font-medium">
          <span className="text-white/40">{'<'}</span>
          portfolio
          <span className="text-white/40">{' />'}</span>
        </div>
        <ul className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <button onClick={() => scrollTo(link.toLowerCase())} className="nav-link group">
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-glow group-hover:w-full transition-all duration-300" />
              </button>
            </li>
          ))}
        </ul>
        <a href="#contact" className="btn-outline text-xs">Hire Me</a>
      </nav>

      <div className="relative z-10 grid lg:grid-cols-2 items-center gap-10 px-8 md:px-16 lg:px-24 pt-6 pb-20">
        <div className="max-w-2xl">
          <div
            className={`section-label mb-6 transition-all duration-700 delay-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            ✦ &nbsp; Interactive hero
          </div>

          <h1
            className={`font-display font-bold leading-none mb-5 transition-all duration-700 delay-500 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="block text-5xl md:text-7xl text-white mb-2">Hello, I&apos;m</span>
            <span className="block text-6xl md:text-8xl text-gradient glow-text">Alex Chen</span>
          </h1>

          <div
            className={`flex items-center gap-3 mb-8 transition-all duration-700 delay-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="font-mono text-lg md:text-xl text-white/45">{'// '}</span>
            <span className="font-mono text-lg md:text-xl text-amber-glow/80 min-w-[240px]">
              {role}
              <span className="animate-pulse text-amber-glow">▮</span>
            </span>
          </div>

          <p
            className={`font-body text-white/55 text-base md:text-lg max-w-xl leading-relaxed mb-10 transition-all duration-700 delay-[900ms] ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Move your mouse over the object, hover to energize it, and click for a quick spin.
            A playful interaction layer with a premium, minimal look.
          </p>

          <div
            className={`flex items-center gap-4 transition-all duration-700 delay-[1100ms] ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <button onClick={() => scrollTo('projects')} className="btn-primary">View Work</button>
            <button onClick={() => scrollTo('contact')} className="btn-outline">Get in Touch</button>
          </div>
        </div>

        <div
          className={`relative h-[420px] sm:h-[500px] lg:h-[560px] rounded-2xl border border-white/10 bg-obsidian-800/40 backdrop-blur-[1px] overflow-hidden transition-all duration-700 delay-300 ${
            visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
        >
          <GlobeScene />
          <div className="absolute top-4 left-4 font-mono text-[10px] tracking-widest text-white/45 uppercase pointer-events-none">
            Drag / Hover / Click
          </div>
        </div>
      </div>
    </section>
  )
}