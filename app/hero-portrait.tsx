"use client";
import { portfolio } from "./content";
import type { CSSProperties } from "react";

/** Original photograph; masking and lighting exist only in presentation layers. */
export function HeroPortrait() {
  return <div className="hero-art portrait-scene" style={{ "--portrait-alpha": `url("${portfolio.hero.mask}")` } as CSSProperties}>
    <div className="portrait-spotlight" aria-hidden="true" />
    <div className="portrait-grid" aria-hidden="true"><span className="portrait-wireframe" /></div>
    <canvas className="portrait-signals" aria-hidden="true" />
    <div className="portrait-particles" aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <div className="portrait-depth"><div className="portrait-mask">
      <img className="portrait-rim" src={portfolio.hero.mask} alt="" aria-hidden="true" width="447" height="558" draggable={false}/><img className="portrait-photo" src={portfolio.hero.image} alt="Lycos Blanza wearing a dark suit" width="1122" height="1402" fetchPriority="high" draggable={false}/>

      <span className="portrait-vignette" aria-hidden="true" />
    </div></div>

  </div>;
}


