import GlobeScene from '../three/GlobeScene'

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-obsidian-900">
      <div className="absolute inset-0 bg-grid opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian-900 pointer-events-none" />
      <div className="relative z-10 h-full w-full">
        <GlobeScene />
        <div className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase pointer-events-none">
          Drag / Hover / Click
        </div>
      </div>
    </section>
  )
}