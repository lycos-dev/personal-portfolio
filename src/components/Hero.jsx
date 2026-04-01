import GlobeScene from '../three/GlobeScene'

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-obsidian-900">
      <div className="absolute inset-0 bg-grid opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian-900 pointer-events-none" />
      <div className="relative z-10 h-full w-full">
        <GlobeScene />

        {/* Controls HUD */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none">
          <div className="flex items-center gap-6 px-5 py-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/8">

            {/* WASD cluster */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex justify-center">
                <Key label="W" />
              </div>
              <div className="flex gap-1">
                <Key label="A" />
                <Key label="S" />
                <Key label="D" />
              </div>
            </div>

            <div className="w-px h-8 bg-white/15" />

            {/* Arrow cluster */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex justify-center">
                <Key label="↑" />
              </div>
              <div className="flex gap-1">
                <Key label="←" />
                <Key label="↓" />
                <Key label="→" />
              </div>
            </div>

            <div className="w-px h-8 bg-white/15" />

            {/* Click hint */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-amber-400/60 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
              </div>
              <span className="font-mono text-[10px] tracking-widest uppercase text-white/35">
                Click marker<br/>to autopilot
              </span>
            </div>
          </div>
        </div>

        {/* Speed / heading readout — top-right */}
        <div className="absolute top-5 right-6 pointer-events-none select-none font-mono text-[10px] tracking-widest uppercase text-white/25">
          WASD · Ride the Globe
        </div>
      </div>
    </section>
  )
}

function Key({ label }) {
  return (
    <div className="w-7 h-7 rounded-md bg-white/8 border border-white/15 flex items-center justify-center font-mono text-[11px] text-white/50 shadow-inner">
      {label}
    </div>
  )
}