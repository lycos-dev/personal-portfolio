import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Contact from './components/Contact'

export default function App() {
  return (
    <main className="relative bg-obsidian-900 text-slate-200 transition-colors duration-300">
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </main>
  )
}
