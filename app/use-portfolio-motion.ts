"use client";

import { useEffect, useRef } from "react";
import { drawPortraitSignals } from "./portrait-signals";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

/** Event-driven compositor updates: no autoplay, idle loop, or scroll-time layout reads. */
export function usePortfolioMotion(motionEnabled: boolean | null = null) {
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const stage = hero.querySelector<HTMLElement>(".hero-stage")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    let teardown = () => {};

    function configure() {
      teardown();
      if (motionEnabled === false || (motionEnabled !== true && reduced.matches)) return;
      let frame = 0;
      let measureNext = true;
      let start = 0, travel = 1, viewport = 1, pinned = false, mobile = false;
      let bounds = { left: 0, width: 1, top: 0, height: 1 };
      let mouseX = 0, mouseY = 0;
      const canvas = hero!.querySelector<HTMLCanvasElement>(".portrait-signals");
      const context = canvas?.getContext("2d");
      let canvasWidth = 1, canvasHeight = 1;
      type ProjectBounds = { element: HTMLElement; top: number; height: number; left: number; width: number };
      let projects: ProjectBounds[] = [];
      let projectPointer: { element: HTMLElement; x: number; y: number } | null = null;
      const projectElements = [...document.querySelectorAll<HTMLElement>(".projects-grid .project-image")];
      const reveals = [...document.querySelectorAll<HTMLElement>(".about-grid, .projects-section .section-heading, .project-card, .skill-group, .journey-grid > h2, .timeline li")];
      const revealObserver = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }, { threshold: 0.08 });
      for (const element of reveals) {
        if (element.getBoundingClientRect().top > window.innerHeight * .94) element.classList.add("reveal-ready");
        else element.classList.add("is-visible");
        revealObserver.observe(element);
      }
      hero!.dataset.motion = "enabled";
      function schedule() { if (!frame) frame = window.requestAnimationFrame(render); }
      function measure() {
        const scroll = window.scrollY;
        const rect = hero!.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        viewport = window.innerHeight;
        mobile = window.innerWidth <= 760;
        pinned = getComputedStyle(stage).position === "sticky";
        const navHeight = document.querySelector<HTMLElement>(".nav-shell")?.offsetHeight ?? 83;
        start = rect.top + scroll - navHeight;
        travel = pinned ? Math.max(1, hero!.offsetHeight - stage.offsetHeight) : Math.max(1, hero!.offsetHeight * .85);
        bounds = { left: stageRect.left, width: stageRect.width, top: navHeight, height: stageRect.height };
        projects = projectElements.map(element => {
          const box = element.getBoundingClientRect();
          return { element, top: box.top + scroll, height: box.height, left: box.left, width: box.width };
        });
        if (canvas && context) {
          canvasWidth = canvas.clientWidth; canvasHeight = canvas.clientHeight;
          const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
          canvas.width = Math.round(canvasWidth * ratio); canvas.height = Math.round(canvasHeight * ratio);
          context.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
        measureNext = false;
      }
      function render() {
        frame = 0;
        if (measureNext) measure();
        const scroll = window.scrollY;
        const p = clamp((scroll - start) / travel);
        const depth = ease(.05, .6, p);
        const exit = ease(.67, 1, p);
        const amount = mobile ? .22 : pinned ? 1 : .5;
        const heroStyle = hero!.style;
        // All scroll-linked effects derive from the same reversible progress value.
        heroStyle.setProperty("--portrait-scale", String(1 + .04 * depth * amount));
        heroStyle.setProperty("--portrait-x", `${(10 * depth + 9 * exit) * amount}px`);
        heroStyle.setProperty("--portrait-y", `${-5 * depth * amount}px`);
        heroStyle.setProperty("--grid-y", `${-16 * p * amount}px`);
        heroStyle.setProperty("--particle-y", `${-24 * p * amount}px`);
        heroStyle.setProperty("--light-x", `${(20 * depth + 5 * exit) * amount}px`);
        heroStyle.setProperty("--light-y", `${-14 * depth * amount}px`);
        heroStyle.setProperty("--light-opacity", String(.24 + .09 * depth - .19 * exit));
        heroStyle.setProperty("--rim-opacity", String(.025 + .06 * depth - .045 * exit));
        heroStyle.setProperty("--geometry-opacity", String(1 - .72 * exit));
        heroStyle.setProperty("--name-y", `${-4 * p * amount}px`);
        heroStyle.setProperty("--support-y", `${-13 * p * amount}px`);
        heroStyle.setProperty("--support-opacity", String(mobile ? 1 : 1 - .5 * exit));
        heroStyle.setProperty("--cta-opacity", String(mobile ? 1 : 1 - .65 * ease(.65, 1, p)));
        heroStyle.setProperty("--pointer-x", `${mouseX * 3}px`);
        heroStyle.setProperty("--pointer-y", `${mouseY * 2}px`);
        heroStyle.setProperty("--pointer-grid-x", `${mouseX * -6}px`);
        heroStyle.setProperty("--pointer-grid-y", `${mouseY * -4}px`);
        heroStyle.setProperty("--hero-progress", p.toFixed(4));
        heroStyle.setProperty("--idea-opacity", String(1 - .68 * ease(.15, .42, p)));
        heroStyle.setProperty("--structure-opacity", String(.32 + .68 * ease(.15,.42,p) - .68 * ease(.6,.82,p)));
        heroStyle.setProperty("--system-opacity", String(.32 + .68 * ease(.6,.82,p)));
        if (context && canvasWidth > 0 && canvasHeight > 0 && scroll < start + travel + viewport) {
          drawPortraitSignals(context, canvasWidth, canvasHeight, p, mouseX, mouseY, mobile);
        }
        for (const item of projects) {
          const active = projectPointer?.element === item.element;
          item.element.style.setProperty("--project-light-opacity", active ? "1" : "0");
          if (active && projectPointer) {
            item.element.style.setProperty("--project-light-x", `${projectPointer.x - item.left}px`);
            item.element.style.setProperty("--project-light-y", `${projectPointer.y + scroll - item.top}px`);
          }
          if (scroll + viewport < item.top || scroll > item.top + item.height) continue;
          const visible = clamp((scroll + viewport - item.top) / (viewport + item.height));
          item.element.style.setProperty("--media-y", `${(visible - .5) * (mobile ? 4 : 10)}px`);
          item.element.style.setProperty("--sensor-reveal", String(ease(.08, .42, visible)));
        }
      }
      function resize() { measureNext = true; schedule(); }
      function move(event: PointerEvent) {
        if (!pointer.matches || event.pointerType !== "mouse") return;
        mouseX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
        mouseY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
        schedule();
      }
      function leave() { mouseX = mouseY = 0; schedule(); }
      function projectMove(event: PointerEvent) {
        if (!pointer.matches || event.pointerType !== "mouse") return;
        projectPointer = { element: event.currentTarget as HTMLElement, x: event.clientX, y: event.clientY };
        schedule();
      }
      function projectLeave() { projectPointer = null; schedule(); }
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      resizeObserver.observe(document.querySelector("main")!);
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", resize, { passive: true });
      stage.addEventListener("pointermove", move, { passive: true });
      stage.addEventListener("pointerleave", leave, { passive: true });
      pointer.addEventListener("change", leave);
      pointer.addEventListener("change", projectLeave);
      projectElements.forEach(element => {
        element.addEventListener("pointermove", projectMove, { passive: true });
        element.addEventListener("pointerleave", projectLeave, { passive: true });
      });
      schedule();
      teardown = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect(); revealObserver.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", resize);
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerleave", leave);
        pointer.removeEventListener("change", leave);
        pointer.removeEventListener("change", projectLeave);
        projectElements.forEach(element => {
          element.removeEventListener("pointermove", projectMove);
          element.removeEventListener("pointerleave", projectLeave);
          ["--project-light-opacity", "--project-light-x", "--project-light-y"].forEach(key => element.style.removeProperty(key));
        });
        context?.clearRect(0, 0, canvasWidth, canvasHeight);
        delete hero!.dataset.motion;
        hero!.removeAttribute("style");
        reveals.forEach(element => { element.classList.remove("reveal-ready", "is-visible"); });
        projects.forEach(({ element }) => { element.style.removeProperty("--media-y"); element.style.removeProperty("--sensor-reveal"); });
      };
    }
    configure();
    reduced.addEventListener("change", configure);
    return () => { reduced.removeEventListener("change", configure); teardown(); };
  }, [motionEnabled]);
  return heroRef;
}


