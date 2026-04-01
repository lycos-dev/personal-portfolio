import { useEffect, useRef, useState } from 'react'

const PROJECTS = [
  {
    id: '01',
    title: 'Nebula Dashboard',
    category: 'Full Stack · Design System',
    description:
      'A real-time analytics platform for distributed systems with live data visualization, custom charting engine, and sub-100ms latency streaming.',
    tags: ['React', 'WebSockets', 'D3.js', 'Rust'],
    accent: '#f5a623',
    featured: true,
    link: '#',
  },
  {
    id: '02',
    title: 'Forma 3D Editor',
    category: '3D · WebGL',
    description:
      'Browser-based 3D modeling tool with real-time collaboration, custom shader pipeline, and export to GLTF/OBJ.',
    tags: ['Three.js', 'TypeScript', 'WASM', 'WebRTC'],
    accent: '#00d4ff',
    featured: true,
    link: '#',
  },
  {
    id: '03',
    title: 'Verse CMS',
    category: 'SaaS · Backend',
    description:
      'Headless content management system with a visual page builder, AI-assisted writing tools, and a GraphQL API layer.',
    tags: ['Next.js', 'GraphQL', 'PostgreSQL', 'AI'],
    accent: '#f5a623',
    featured: false,
    link: '#',
  },
  {
    id: '04',
    title: 'Pulse iOS App',
    category: 'Mobile · UI',
    description:
      'Minimal habit-tracking app with generative ambient soundscapes tied to user focus sessions.',
    tags: ['React Native', 'Audio API', 'SQLite'],
    accent: '#00d4ff',
    featured: false,
    link: '#',
  },
]

function ProjectCard({ project, inView, delay }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16
    const y = -((e.clientY - rect.top) / rect.height - 0.5) * 16
    setTilt({ x, y })
  }

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 })
    setHovered(false)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={resetTilt}
      className={`relative card-surface p-7 cursor-pointer group transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) ${inView ? '' : 'translateY(32px)'}`,
        transition: hovered
          ? 'transform 0.1s ease, box-shadow 0.3s ease, background 0.3s ease'
          : 'transform 0.6s ease, opacity 0.7s ease, box-shadow 0.3s ease',
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${project.accent}30`
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Accent glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${project.accent}12 0%, transparent 60%)`,
        }}
      />

      {/* Project number */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs text-white/20">{project.id}</span>
        {project.featured && (
          <span
            className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border"
            style={{ color: project.accent, borderColor: `${project.accent}40` }}
          >
            Featured
          </span>
        )}
      </div>

      {/* Category */}
      <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: `${project.accent}80` }}>
        {project.category}
      </p>

      {/* Title */}
      <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors duration-300">
        {project.title}
      </h3>

      {/* Description */}
      <p className="font-body text-sm text-white/45 leading-relaxed mb-6">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[11px] px-2 py-1 rounded bg-white/5 text-white/40 border border-white/8 group-hover:border-white/15 transition-colors duration-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Link */}
      <a
        href={project.link}
        className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase transition-all duration-300 hover:gap-3"
        style={{ color: project.accent }}
        onClick={(e) => e.preventDefault()}
      >
        View Project
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </a>

      {/* Bottom border accent */}
      <div
        className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${project.accent}60, transparent)` }}
      />
    </div>
  )
}

export default function Projects() {
  const [ref, setRef] = useState(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.1 }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref])

  return (
    <section
      id="projects"
      ref={setRef}
      className="relative py-32 px-8 md:px-16 lg:px-24 bg-obsidian-950 overflow-hidden"
    >
      {/* Right glow */}
      <div
        className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
          transform: 'translate(30%, -50%)',
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div
              className={`section-label mb-4 transition-all duration-700 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              02 &nbsp;/&nbsp; Selected Work
            </div>
            <h2
              className={`section-title transition-all duration-700 delay-100 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Things I've
              <br />
              <span className="text-gradient">built.</span>
            </h2>
          </div>
          <a
            href="#"
            className={`btn-outline self-start md:self-auto transition-all duration-700 delay-200 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            onClick={(e) => e.preventDefault()}
          >
            All Projects ↗
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              inView={inView}
              delay={200 + i * 100}
            />
          ))}
        </div>
      </div>
    </section>
  )
}