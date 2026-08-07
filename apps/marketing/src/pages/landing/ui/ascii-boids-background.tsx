import * as React from "react";

// character grid — glyphs stay upright and snapped, like real terminal text
const CELL = 13;
const FONT_SIZE = 11;

// the source text each boid writes as it flies — trails spell real Atlas "code"
const CODE =
  'atlas.session.start({mode:"deep",minutes:25})focus.guard({block:["feed","dm"]})' +
  "streak.update({days:12})await breaks.schedule({every:25,rest:5})stats.review({week:true})" +
  'goals.set({today:"maths",pages:40})timer.tick(1500)distraction.dismiss()';

const NUM_BOIDS = 90;
const PERCEPTION = 90;
const SEPARATION_DIST = 44;
const MAX_SPEED = 1.2;
const MAX_FORCE = 0.035;
const W_SEPARATION = 1.7;
const W_ALIGNMENT = 1.0;
const W_COHESION = 0.45;
const W_SEEK = 0.5;
const SEEK_ARRIVE_RADIUS = 280;
const TRAIL_DECAY = 0.996;

const RIPPLE_SPEED = 7;
const RIPPLE_BAND = 110;

// glyphs sit slightly red at rest and blend fully toward it inside a click ripple
const RED: readonly [number, number, number] = [220, 38, 38];
const BASE_HEAT = 0.2;

// light grays for the white background — same three-step hierarchy the
// dark palette had (45/56/68), mirrored around the light end
function trailGray(): number {
  const r = Math.random();
  if (r < 0.7) return 210;
  if (r < 0.92) return 199;
  return 187;
}

function glyphStyle(gray: number, alpha: number, heat: number): string {
  const h = BASE_HEAT + (1 - BASE_HEAT) * heat;
  const r = Math.round(gray + (RED[0] - gray) * h);
  const g = Math.round(gray + (RED[1] - gray) * h);
  const b = Math.round(gray + (RED[2] - gray) * h);
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha + heat * 0.3)})`;
}

interface TrailGlyph {
  char: string;
  gray: number;
  alpha: number;
}

interface Ripple {
  x: number;
  y: number;
  r: number;
}

export function AsciiBoidsBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const maybeCanvas = canvasRef.current;
    if (!maybeCanvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const maybeCtx = maybeCanvas.getContext("2d");
    if (!maybeCtx) return;
    const canvas: HTMLCanvasElement = maybeCanvas;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cell = CELL * dpr;
    let width = 0;
    let height = 0;

    const mouse = { x: 0, y: 0, active: false };
    const ripples: Ripple[] = [];
    const trail = new Map<string, TrailGlyph>();

    function setFont() {
      ctx.font = `${FONT_SIZE * dpr}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    }

    function rippleHeat(x: number, y: number): number {
      let heat = 0;
      for (const rp of ripples) {
        const d = Math.hypot(x - rp.x, y - rp.y);
        const t = 1 - Math.abs(d - rp.r) / (RIPPLE_BAND * dpr);
        if (t > heat) heat = t;
      }
      return heat;
    }

    class Boid {
      x = Math.random() * width;
      y = Math.random() * height;
      vx: number;
      vy: number;
      ax = 0;
      ay = 0;
      ptr = Math.floor(Math.random() * CODE.length);
      sx = this.x;
      sy = this.y;
      headChar = CODE.charAt(this.ptr);

      constructor() {
        const a = Math.random() * Math.PI * 2;
        const s = MAX_SPEED * dpr * (0.5 + Math.random() * 0.5);
        this.vx = Math.cos(a) * s;
        this.vy = Math.sin(a) * s;
      }

      steer(dx: number, dy: number, weight: number) {
        const mag = Math.hypot(dx, dy);
        if (mag === 0) return;
        const max = MAX_SPEED * dpr;
        let fx = (dx / mag) * max - this.vx;
        let fy = (dy / mag) * max - this.vy;
        const fmag = Math.hypot(fx, fy);
        const maxForce = MAX_FORCE * dpr;
        if (fmag > maxForce) {
          fx = (fx / fmag) * maxForce;
          fy = (fy / fmag) * maxForce;
        }
        this.ax += fx * weight;
        this.ay += fy * weight;
      }

      flock(boids: Boid[]) {
        let sepX = 0;
        let sepY = 0;
        let sepN = 0;
        let aliX = 0;
        let aliY = 0;
        let aliN = 0;
        let cohX = 0;
        let cohY = 0;
        let cohN = 0;

        for (const other of boids) {
          if (other === this) continue;
          const dx = other.x - this.x;
          const dy = other.y - this.y;
          const d = Math.hypot(dx, dy);
          if (d > PERCEPTION * dpr || d === 0) continue;

          if (d < SEPARATION_DIST * dpr) {
            sepX -= dx / d / d;
            sepY -= dy / d / d;
            sepN++;
          }
          aliX += other.vx;
          aliY += other.vy;
          aliN++;
          cohX += other.x;
          cohY += other.y;
          cohN++;
        }

        if (sepN > 0) this.steer(sepX, sepY, W_SEPARATION);
        if (aliN > 0) this.steer(aliX / aliN, aliY / aliN, W_ALIGNMENT);
        if (cohN > 0)
          this.steer(cohX / cohN - this.x, cohY / cohN - this.y, W_COHESION);

        if (mouse.active) {
          const tx = mouse.x - this.x;
          const ty = mouse.y - this.y;
          const d = Math.hypot(tx, ty);
          const arrive = SEEK_ARRIVE_RADIUS * dpr;
          const w = d < arrive ? W_SEEK * (d / arrive) : W_SEEK;
          this.steer(tx, ty, w);
        }
      }

      update() {
        this.vx += this.ax;
        this.vy += this.ay;
        const speed = Math.hypot(this.vx, this.vy);
        const max = MAX_SPEED * dpr;
        if (speed > max) {
          this.vx = (this.vx / speed) * max;
          this.vy = (this.vy / speed) * max;
        }
        this.x += this.vx;
        this.y += this.vy;
        this.ax = 0;
        this.ay = 0;

        let wrapped = false;
        if (this.x < -cell) {
          this.x = width + cell;
          wrapped = true;
        }
        if (this.x > width + cell) {
          this.x = -cell;
          wrapped = true;
        }
        if (this.y < -cell) {
          this.y = height + cell;
          wrapped = true;
        }
        if (this.y > height + cell) {
          this.y = -cell;
          wrapped = true;
        }

        // write the next character only after real net displacement — a boid
        // hovering on a cell boundary shouldn't flicker through its code string
        if (wrapped) {
          this.sx = this.x;
          this.sy = this.y;
        } else if (
          Math.hypot(this.x - this.sx, this.y - this.sy) >=
          cell * 1.5
        ) {
          this.sx = this.x;
          this.sy = this.y;
          const char = CODE.charAt(this.ptr % CODE.length);
          this.ptr++;
          if (char !== " ") {
            const cx = Math.round(this.x / cell);
            const cy = Math.round(this.y / cell);
            trail.set(`${cx},${cy}`, {
              char,
              gray: trailGray(),
              alpha: 0.22 + Math.random() * 0.1,
            });
          }
        }
        this.headChar = CODE.charAt(this.ptr % CODE.length);
      }

      drawHead() {
        const cx = Math.round(this.x / cell) * cell;
        const cy = Math.round(this.y / cell) * cell;
        ctx.fillStyle = glyphStyle(52, 0.35, rippleHeat(cx, cy));
        ctx.fillText(this.headChar === " " ? "." : this.headChar, cx, cy);
      }
    }

    let boids: Boid[] = [];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.round(rect.width * dpr);
      height = Math.round(rect.height * dpr);
      canvas.width = width;
      canvas.height = height;
      setFont();
      if (boids.length === 0 && width > 0 && height > 0) {
        boids = Array.from({ length: NUM_BOIDS }, () => new Boid());
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    function toLocal(e: MouseEvent): { x: number; y: number } {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * dpr,
        y: (e.clientY - rect.top) * dpr,
      };
    }

    function onMouseMove(e: MouseEvent) {
      const p = toLocal(e);
      mouse.x = p.x;
      mouse.y = p.y;
      // only follow the cursor while it is over the hero
      mouse.active = p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;
    }

    function onMouseDown(e: MouseEvent) {
      const p = toLocal(e);
      if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) return;
      ripples.push({ x: p.x, y: p.y, r: 0 });
    }

    function onMouseLeave() {
      mouse.active = false;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseleave", onMouseLeave);

    // pause the simulation while the hero is scrolled out of view
    let visible = true;
    const intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    intersectionObserver.observe(canvas);

    let raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible || width === 0) return;

      ctx.clearRect(0, 0, width, height);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        if (!rp) continue;
        rp.r += RIPPLE_SPEED * dpr;
        if (rp.r - RIPPLE_BAND * dpr > Math.hypot(width, height)) {
          ripples.splice(i, 1);
        }
      }

      for (const [key, g] of trail) {
        g.alpha *= TRAIL_DECAY;
        if (g.alpha < 0.03) {
          trail.delete(key);
          continue;
        }
        const [cx, cy] = key.split(",");
        const px = Number(cx) * cell;
        const py = Number(cy) * cell;
        ctx.fillStyle = glyphStyle(g.gray, g.alpha, rippleHeat(px, py));
        ctx.fillText(g.char, px, py);
      }

      for (const b of boids) b.flock(boids);
      for (const b of boids) {
        b.update();
        b.drawHead();
      }
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="animate-in fade-in fill-mode-backwards pointer-events-none absolute inset-0 duration-1000 [mask-image:radial-gradient(ellipse_65%_55%_at_50%_45%,rgba(0,0,0,0.25),black_75%)]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
