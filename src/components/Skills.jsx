import { useEffect, useRef, useState } from 'react'

const SKILL_GROUPS = [
  {
    category: 'Frontend',
    icon: '⬡',
    color: '#f5a623',
    skills: [
      { name: 'React / Next.js', level: 5 },
      { name: 'TypeScript', level: 5 },
      { name: 'Three.js / WebGL', level: 4 },
      { name: 'CSS / Tailwind', level: 5 },
      { name: 'Framer Motion', level: 4 },
    ],
  },
  {
    category: 'Backend',
    icon: '◈',
    color: '#00d4ff',
    skills: [
      { name: 'Node.js / Express', level: 5 },
      { name: 'PostgreSQL', level: 4 },
      { name: 'GraphQL', level: 4 },
      { name: 'Rust', level: 3 },
      { name: 'Redis', level: 4 },
    ],
  },
  {
    category: 'Tools & Infra',
    icon: '◎',
    color: '#f5a623',
    skills: [
      { name: 'Git / GitHub', level: 5 },
      { name: 'Docker', level: 4 },
      { name: 'AWS / Vercel', level: 4 },
      { name: 'CI/CD Pipelines', level: 4 },
      { name: 'Linux / Bash', level: 3 },
    ],
  },
  {
    category: 'Design',
    icon: '⟡',
    color: '#00d4ff',
    skills: [
      { name: 'Figma', level: 5 },
      { name: 'Design Systems', level: 5 },
      { name: 'Motion Design', level: 4 },
      { name: 'Prototyping', level: 4 },
      { name: 'Generative Art', level: 3 },
    ],
  },
]

// Level labels
const LEVELS = ['', 'Learning', 'Familiar', 'Proficient', 'Advanced', 'Expert']

function SkillCard({ group, inView, delay }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div
      className={`card-surface p-7 transition-all duration-700 group hover:border-slate-300 dark:hover:border-white/10 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold border"
          style={{
            color: group.color,
            borderColor: `${group.color}30`,
            background: `${group.color}10`,
          }}
        >
          {group.icon}
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            {group.category}
          </h3>
          <p className="font-mono text-[10px] text-slate-600 dark:text-white/30 tracking-widest mt-0.5">
            {group.skills.length} skills
          </p>
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-4">
        {group.skills.map((skill, i) => (
          <div
            key={skill.name}
            className="flex items-center justify-between gap-4 cursor-default group/skill"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Name */}
            <span
              className="font-body text-sm transition-colors duration-200"
              style={{ color: hovered === i ? group.color : 'rgb(71 85 105 / 0.85)' }}
            >
              {skill.name}
            </span>

            {/* Level indicator: 5 dots */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {Array.from({ length: 5 }).map((_, di) => (
                <div
                  key={di}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background:
                      di < skill.level
                        ? hovered === i
                          ? group.color
                          : `${group.color}80`
                        : 'rgb(148 163 184 / 0.35)',
                    boxShadow:
                      di < skill.level && hovered === i
                        ? `0 0 6px ${group.color}`
                        : 'none',
                    transform: hovered === i && di < skill.level ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
              {/* Level label on hover */}
              <span
                className="font-mono text-[9px] tracking-widest uppercase ml-2 transition-all duration-200 w-16 text-right"
                style={{ color: hovered === i ? `${group.color}90` : 'transparent' }}
              >
                {LEVELS[skill.level]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${group.color}50, transparent)` }}
      />
    </div>
  )
}

const EXTRA_TOOLS = [
  'Vite', 'Webpack', 'Prisma', 'tRPC', 'Zustand', 'React Query',
  'Storybook', 'Jest', 'Playwright', 'Zod', 'GSAP', 'Lottie',
]

export default function Skills() {
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
      id="skills"
      ref={setRef}
      className="relative py-32 px-8 md:px-16 lg:px-24 bg-slate-100 dark:bg-obsidian-900 overflow-hidden transition-colors duration-300"
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />

      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(245,166,35,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div
            className={`section-label mb-4 transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            03 &nbsp;/&nbsp; Skills
          </div>
          <h2
            className={`section-title transition-all duration-700 delay-100 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            My tech
            <br />
            <span className="text-gradient">arsenal.</span>
          </h2>
        </div>

        {/* Skill cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-14">
          {SKILL_GROUPS.map((group, i) => (
            <SkillCard
              key={group.category}
              group={group}
              inView={inView}
              delay={150 + i * 80}
            />
          ))}
        </div>

        {/* Also familiar with */}
        <div
          className={`transition-all duration-700 delay-500 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="font-mono text-xs text-slate-600 dark:text-white/30 tracking-widest uppercase mb-5">
            Also in the toolkit
          </p>
          <div className="flex flex-wrap gap-2">
            {EXTRA_TOOLS.map((tool) => (
              <span
                key={tool}
                className="font-mono text-xs px-3 py-1.5 rounded-md border border-slate-300 dark:border-white/8 text-slate-700 dark:text-white/40 bg-white dark:bg-obsidian-800 hover:border-amber-glow/25 hover:text-amber-glow/60 hover:bg-slate-100 dark:hover:bg-obsidian-700 transition-all duration-300 cursor-default"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}