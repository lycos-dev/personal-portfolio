import { useEffect, useState } from 'react'
import Hero from './src/components/Hero'
import About from './src/components/About'
import Projects from './src/components/Projects'
import Skills from './src/components/Skills'
import Contact from './src/components/Contact'

export default function App() {
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem('theme')
    return stored === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return (
    <main className="relative bg-slate-100 text-slate-900 dark:bg-obsidian-900 dark:text-slate-200 transition-colors duration-300">
      <Hero theme={theme} onToggleTheme={toggleTheme} />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </main>
  )
}