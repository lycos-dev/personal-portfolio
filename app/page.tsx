"use client";

import { useEffect, useState } from "react";
import { HeroPortrait } from "./hero-portrait";
import { usePortfolioMotion } from "./use-portfolio-motion";
import { MotionControl, useMotionPreference } from "./motion-preference";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { portfolio, projects, skillGroups, type Project } from "./content";

const sections = [
  "Home",
  "About",
  "Projects",
  "Skills",
  "Experience",
  "Contact",
];
function Arrow() {
  return (
    <span className="arrow" aria-hidden="true">
      ↗
    </span>
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow section-label">{children}</p>;
}

function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    document
      .querySelectorAll("main > section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="nav-shell">
      <header className="site-nav wrap">
        <a
          className="wordmark"
          href="#home"
          aria-label="Lycos Blanza home"
          onClick={() => setOpen(false)}
        >
          LB.
        </a>
        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          className={open ? "is-open" : ""}
        >
          {sections.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              aria-current={
                active === label.toLowerCase() ? "location" : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <a className="nav-talk" href="#contact" onClick={() => setOpen(false)}>
          Let's Talk <Arrow />
        </a>
        <button
          className="menu-button"
          aria-controls="primary-navigation"
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen(!open)}
        >
          <span>{open ? "Close" : "Menu"}</span>
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </header>
    </div>
  );
}

function SocialLinks({
  order = ["GitHub", "LinkedIn", "Email"],
}: {
  order?: string[];
}) {
  const destinations: Record<string, string | null> = {
    GitHub: portfolio.github,
    LinkedIn: portfolio.linkedin,
    Instagram: portfolio.instagram,
    Facebook: portfolio.facebook,
    Email: `mailto:${portfolio.email}`,
  };
  return (
    <div className="social-links">
      {order.map((label) =>
        destinations[label] ? (
          <a
            key={label}
            href={destinations[label]!}
            target={label === "Email" ? undefined : "_blank"}
            rel="noopener noreferrer"
          >
            {label} <Arrow />
          </a>
        ) : null,
      )}
    </div>
  );
}

function ProjectVisual({ project }: { project: Project }) {
  return (
    <div className="project-media-frame">
      <img
        src={project.image}
        alt={project.imageAlt}
        width="1600"
        height="1000"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function ProjectCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (project: Project) => void;
}) {
  const featured = project.id === "safeseat";
  return (
    <article
      className={`project-card ${featured ? "featured-project" : "secondary-project"}`}
    >
      <div className="project-image">
        <ProjectVisual project={project} />
      </div>
      <div className="project-copy">
        <div className="project-meta">
          <span className="project-number">{project.number} / 03</span>
          <span>{featured ? "FEATURED THESIS" : "SELECTED PROJECT"}</span>
        </div>
        <h3>
          {project.title}
          <span className="title-period">.</span>
        </h3>
        <p className="project-category">{project.category}</p>
        <p className="project-description">{project.description}</p>
        <ul
          className="technology-list"
          aria-label={`${project.title} technologies`}
        >
          {project.technologies.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        <div className="project-actions">
          <button
            type="button"
            className="project-link"
            onClick={() => onSelect(project)}
            aria-label={`View ${project.title} project details`}
          >
            Explore Project <Arrow />
          </button>
          <a
            className="repository-link"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.title} source code on GitHub`}
          >
            Source Code <Arrow />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const { enabled: motionEnabled, toggle: toggleMotion } =
    useMotionPreference();
  const heroRef = usePortfolioMotion(motionEnabled);
  const [selected, setSelected] = useState<Project | null>(null);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation />
      <main id="main">
        <section
          id="home"
          ref={heroRef}
          className="hero-sequence"
          aria-labelledby="hero-name"
        >
          <div className="hero hero-stage wrap">
            <div className="hero-copy">
              <p className="eyebrow">PORTFOLIO / 2026</p>
              <h1 id="hero-name">
                Lycos
                <br />
                Blanza<span>.</span>
              </h1>
              <div className="hero-support">
                <h2 className="hero-title">Software Engineer</h2>
                <p className="hero-subtitle">
                  Computer Science · De La Salle Lipa
                </p>
                <p className="hero-intro">
                  I build full-stack applications and intelligent systems, with
                  a focus on privacy, usability, and reliable software.
                </p>
              </div>
              <div className="hero-controls">
                <div className="hero-actions">
                  <a className="button primary" href="#projects">
                    View My Work <Arrow />
                  </a>
                  <a
                    className="button secondary"
                    href={portfolio.resume}
                    download
                    aria-label="Download Lycos Blanza résumé as a Word document"
                  >
                    Download Résumé <span aria-hidden="true">↓</span>
                  </a>
                </div>
                <SocialLinks />
              </div>
            </div>
            <HeroPortrait />
            <div className="hero-bottom">
              <span className="hero-location">{portfolio.location}</span>
              <div className="hero-bottom-right">
                <MotionControl
                  enabled={motionEnabled}
                  onToggle={toggleMotion}
                />
                <a className="hero-scroll" href="#about">
                  SCROLL <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        <section
          id="about"
          className="section about-section wrap"
          aria-labelledby="about-title"
        >
          <SectionLabel>01 / ABOUT</SectionLabel>
          <div className="about-grid">
            <h2 id="about-title">
              Engineering across
              <br />
              software and hardware<span className="muted-period">.</span>
            </h2>
            <div className="about-copy">
              <p>
                I'm a Computer Science student at De La Salle Lipa. My work
                spans web and mobile applications, embedded safety systems, and
                tools that organize complex information.
              </p>
              <p>
                I combine software development with experience in graphic
                design, video editing, and web design. That perspective helps me
                turn technical requirements into interfaces people can
                understand.
              </p>
            </div>
          </div>
        </section>
        <section
          id="projects"
          className="section projects-section wrap"
          aria-labelledby="projects-title"
        >
          <SectionLabel>02 / SELECTED WORK</SectionLabel>
          <div className="section-heading">
            <h2 id="projects-title">
              Selected projects<span className="muted-period">.</span>
            </h2>
            <div className="projects-heading-aside">
              <span>01 FEATURED / 02 APPLICATIONS</span>
              <p>
                From embedded sensing to thoughtful web and mobile experiences.
              </p>
            </div>
          </div>
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={setSelected}
              />
            ))}
          </div>
        </section>
        <section
          id="skills"
          className="section skills-section wrap"
          aria-labelledby="skills-title"
        >
          <SectionLabel>03 / TOOLKIT</SectionLabel>
          <h2 id="skills-title">
            Tools I build with<span className="muted-period">.</span>
          </h2>
          <div className="skills-grid">
            {skillGroups.map((group, index) => (
              <div className="skill-group" key={group.title}>
                <span className="skill-index">0{index + 1}</span>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <section
          id="experience"
          className="section experience-section wrap"
          aria-labelledby="experience-title"
        >
          <SectionLabel>04 / JOURNEY</SectionLabel>
          <div className="journey-grid">
            <h2 id="experience-title">
              Education &<br />
              project experience<span className="muted-period">.</span>
            </h2>
            <ol className="timeline">
              <li>
                <span className="timeline-date">2023 – 2027 (Expected)</span>
                <h3>B.S. Computer Science</h3>
                <p>De La Salle Lipa</p>
              </li>
              <li>
                <span className="timeline-date">ONGOING</span>
                <h3>Project-Based Development</h3>
                <p>
                  Web, mobile, and embedded projects — from sensor integration
                  and data workflows to application design.
                </p>
              </li>
              <li>
                <span className="timeline-date">DATACAMP</span>
                <h3>Courses & Certifications</h3>
                <p>
                  Python, R, Pytorch, Tidyverse, Pandas, Statistical Fundamentals,
                  Exploratory Analysis, and Statistical Experimentation.
                </p>
              </li>
            </ol>
          </div>
        </section>
        <section
          id="contact"
          className="section contact-section wrap"
          aria-labelledby="contact-title"
        >
          <SectionLabel>05 / CONTACT</SectionLabel>
          <div className="contact-grid">
            <div>
              <h2 id="contact-title">
                Let's work
                <br />
                <span>together.</span>
              </h2>
              <p>
                I'm looking for a software development role where I can
                contribute across web, mobile, and intelligent systems. Let's
                discuss how I can support your team.
              </p>
            </div>
            <div className="contact-action">
              <a className="button primary" href={`mailto:${portfolio.email}`}>
                Get in Touch <Arrow />
              </a>
              <a className="contact-email" href={`mailto:${portfolio.email}`}>
                {portfolio.email}
              </a>
            </div>
          </div>
          <div className="contact-bottom">
            <div className="contact-direct">
              <a href={portfolio.phoneHref}>{portfolio.phone}</a>
              <span>{portfolio.location}</span>
            </div>
            <SocialLinks
              order={["GitHub", "LinkedIn", "Instagram", "Facebook"]}
            />
          </div>
        </section>
      </main>
      <footer className="footer wrap">
        <div>
          <a href="#home" className="footer-name">
            Lycos Blanza
          </a>
          <p>© 2026 Lycos Blanza</p>
        </div>
        <SocialLinks />
      </footer>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="project-dialog">
          {selected && (
            <>
              <div className="project-dialog-header">
                <span className="eyebrow">PROJECT / {selected.number}</span>
                <DialogTitle className="dialog-heading">
                  {selected.title}
                </DialogTitle>
                <span className="dialog-category">{selected.category}</span>
              </div>
              <figure className="project-dialog-figure">
                <div className="dialog-visual">
                  <ProjectVisual project={selected} />
                </div>
                <figcaption className="project-visual-credit">
                  {selected.imageCaption}
                </figcaption>
              </figure>
              <div className="project-dialog-body">
                <DialogDescription className="dialog-description">
                  {selected.description}
                </DialogDescription>
                <div className="project-focus">
                  <span>Engineering focus</span>
                  <p>{selected.focus}</p>
                </div>
                <h3 className="project-dialog-subheading">
                  Project highlights
                </h3>
                <ul className="project-details">
                  {selected.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                {selected.technologies.length > 0 && (
                  <ul
                    className="technology-list"
                    aria-label={`${selected.title} technologies`}
                  >
                    {selected.technologies.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>
                )}
                {selected.url && (
                  <a
                    className="project-link project-dialog-source"
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Source on GitHub <Arrow />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
