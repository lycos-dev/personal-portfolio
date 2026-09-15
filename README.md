# Lycos Blanza — Portfolio

A responsive, monochrome React portfolio with static Next.js export. No backend, authentication, or data collection.

## Local development

Install with `npm run install:ci`, then use `npm run dev`. The development preview opens at `http://localhost:5173`.

`npm run build` produces the complete static website in `out/`. Portable builds use the installed Next.js exporter to avoid a native Windows shutdown issue in the Vinext build command. The development preview continues to use Vinext.

## Editing

- `app/content.ts`: identity, real contact destinations, project content, technologies, and the hero media slot.
- `app/page.tsx`: reusable navigation, sections, project previews, and accessible detail dialogs.
- `app/globals.css`: monochrome theme and responsive layouts.
- `public/`: the supplied unaltered transparent portrait, preserved earlier artwork, SafeSeat concept artwork, and the LB favicon.

The portfolio presents four projects: SafeSeat, Influentify, DocVia, and NEXA. Summaries use the supplied résumé and the linked repositories. Every card links directly to its source and opens a concise project overview with engineering focus. DocVia and NEXA visuals remain labeled interface concepts; Influentify uses a workflow diagram. No unverified performance metrics, employment, or individual ownership claims are added.

GitHub, LinkedIn, Instagram, Facebook, email, and phone links use the user-supplied details. Tracking query parameters are omitted. The original Word résumé is available to download with the user’s explicit approval; its bytes are unchanged. Education dates follow the supplied résumé (De La Salle Lipa, 2026–present).

## Portrait and motion

The hero uses the exact supplied transparent PNG, without regeneration or retouching. `app/hero-portrait.tsx` contains presentation layers; `app/use-portfolio-motion.ts` coordinates reversible scroll effects with one event-driven animation frame. Desktop uses 150vh of space, tablet a shorter 130vh sequence where height permits, and mobile stays unpinned. Short desktop viewports also use the natural layout to keep all content reachable. Motion starts on automatically as requested, including when the OS requests reduced motion. The visible Website motion button lets visitors disable it; that saved choice takes precedence on future visits and consistently controls React and CSS. Off removes scrubbing, pointer movement, particles, and reveals. No video, autoplay, or continuous idle loop is used. All event listeners and observers are cleaned up.

The visible portrait uses the supplied 1122 × 1402 original photograph. The 447 × 558 cutout supplies only its alpha mask through CSS; it no longer supplies the enlarged face pixels. This restores original photographic detail without AI enhancement, retouching, or sharpening halos. Both source images remain unchanged.

`app/portrait-signals.ts` draws flowing threads that resolve into an architectural LB monogram as visitors scroll. Its geometry is deterministic and reverses exactly with scroll. Mobile uses fewer threads and smaller movement. Project imagery receives a soft pointer-following light on fine-pointer desktops. Both effects share the existing scheduled frame, stop while idle, and disappear with motion off. Canvas pixel density is capped at 1.5; sizes and positions are measured only on initialization and resize.

## Publication

This site uses the existing Sites identity in `.openai/hosting.json`. Publish `out/` as static assets. Keep the same project ID when refining this portfolio.



## Desktop sizing

The desktop container uses fluid 4vw gutters (capped at 112px), without a 1320px content-width cap. The hero fills the available viewport height below navigation. Its heading responds to both viewport width and height; paragraphs retain readable line lengths. Mobile keeps the natural stacked layout.

## Content sources

- SafeSeat: https://github.com/lycos-dev/SafeSeat
- Influentify: https://github.com/lycos-dev/Influentify (README describes the research workflow and stack).
- DocVia: https://github.com/Waldric/docvia-frontend (React frontend; broader learning features come from the résumé).
- NEXA: https://github.com/lycos-dev/final-project-group4 (README, package dependencies, and workout/routine context implementations).

Repository information reviewed on 2026-09-15.
