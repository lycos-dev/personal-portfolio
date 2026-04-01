import Hero from './src/components/Hero'
import About from './src/components/About'
import Projects from './src/components/Projects'
import Skills from './src/components/Skills'
import Contact from './src/components/Contact'

export default function App() {
  return (
    <main className="relative">
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </main>
  )
}