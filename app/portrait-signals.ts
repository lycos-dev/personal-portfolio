/** Flowing threads resolve into an architectural LB monogram.
 * Every coordinate depends only on scroll and pointer, never elapsed time.
 */
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Normalized typographic strokes, independent of the photograph.
const strokes = [
  [[.12,.17],[.12,.80],[.43,.80]],
  [[.55,.80],[.55,.17],[.76,.17],[.88,.23],[.88,.37],[.76,.46],[.55,.46]],
  [[.55,.46],[.79,.46],[.92,.54],[.92,.71],[.79,.80],[.55,.80]],
];
function onStroke(stroke: number[][], t: number) {
  const lengths = stroke.slice(1).map((point,i) => Math.hypot(point[0]-stroke[i][0],point[1]-stroke[i][1]));
  let distance = t * lengths.reduce((a,b) => a+b,0);
  for (let i=0;i<lengths.length;i++) {
    if (distance <= lengths[i] || i === lengths.length-1) {
      const f=clamp(distance/lengths[i]);
      return [mix(stroke[i][0],stroke[i+1][0],f),mix(stroke[i][1],stroke[i+1][1],f)];
    }
    distance -= lengths[i];
  }
  return stroke[0];
}

export function drawPortraitSignals(
  ctx: CanvasRenderingContext2D, width: number, height: number,
  progress: number, pointerX: number, pointerY: number, compact: boolean,
) {
  ctx.clearRect(0,0,width,height);
  const settle = smooth((progress-.08)/.58);
  const exit = smooth((progress-.80)/.20);
  const samples = compact ? 32 : 64;
  const threads = compact ? 2 : 4;
  const spread = compact ? 3 : 8;
  ctx.lineWidth = .75;
  for(let s=0;s<strokes.length;s++) {
    for(let layer=0;layer<threads;layer++) {
      ctx.beginPath();
      for(let i=0;i<=samples;i++) {
        const t=i/samples;
        const target=onStroke(strokes[s],t);
        const angle=t*Math.PI*2+(s*.72)+(layer*.14);
        const freeX=.5+Math.cos(angle)*(.34+layer*.018);
        const freeY=.47+Math.sin(angle*1.5+s*.3)*(.31+layer*.015);
        const separation=(layer-(threads-1)/2)*.007;
        const x=mix(freeX,target[0]+separation,settle)*width-pointerX*spread*(1-settle*.6);
        const y=mix(freeY,target[1]+separation,settle)*height-pointerY*spread*(1-settle*.6);
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=`rgba(195,204,218,${(.12+settle*.09)*(1-exit*.7)*(layer===0?1:.48)})`;
      ctx.stroke();
    }
    const marker=onStroke(strokes[s],clamp(progress*1.6));
    const x=marker[0]*width-pointerX*spread*.4;
    const y=marker[1]*height-pointerY*spread*.4;
    ctx.fillStyle=`rgba(218,225,234,${settle*.48*(1-exit)})`;
    ctx.beginPath();ctx.arc(x,y,1.6,0,Math.PI*2);ctx.fill();
  }
}
