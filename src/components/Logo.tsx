import { useId, type CSSProperties } from 'react';

type LogoSize = 'splash' | 'sidebar' | 'auth' | 'navbar';

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

// svgPx: size of the animated SVG only. Text is handled separately per context.
const sizeMap: Record<LogoSize, { svgPx: number; textSize: string; subSize: string }> = {
  splash:  { svgPx: 220, textSize: 'text-4xl',  subSize: 'text-sm' },
  auth:    { svgPx: 120, textSize: 'text-2xl',  subSize: 'text-xs' },
  sidebar: { svgPx: 48,  textSize: 'text-lg',   subSize: '' },
  navbar:  { svgPx: 38,  textSize: 'text-base', subSize: '' },
};

// ─── DESIGN NOTES ────────────────────────────────────────────────────────────
// viewBox: -100 -100 200 200  →  (0,0) is center of logo
// Outer gold star  : two sharp squares, half-side=67, tips at r≈94.8
// Inner lotus      : 8 petals, base at r=10, tip at r=58  (gap ≈36 from star tip)
// Gold leaves      : center tip at (0,-56), sides at (±20,-48)  (inside lotus)
// Plant trunk      : y=+44 → y=0  (dot at visual center)
// Arms             : (0,0) → (±26,-38)
// Gold dot         : (0,0) r=8
// KEY: each layer has clear gap from the next — nothing touches

export default function Logo({ size = 'sidebar', showText, className = '' }: LogoProps) {
  const uid = useId().replace(/:/g, '_');
  const { svgPx, textSize, subSize } = sizeMap[size];
  const displayText = showText ?? (size === 'auth');  // splash handles text itself

  const G = `jcG${uid}`;
  const L = `jcL${uid}`;

  const vb = '-100 -100 200 200';
  const sz = { width: svgPx, height: svgPx } as const;
  const layer: CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

  return (
    <div className={`flex items-center gap-3 ${className}`}>

      {/* ── Animated motif (all sizes) ── */}
      <div style={{ width: svgPx, height: svgPx, position: 'relative', flexShrink: 0 }}>

        {/* LAYER 1 — outer gold 8-pointed star, rotates CW 30s
            half-side=70 → tips at r≈99, filling nearly the full viewBox   */}
        <div style={{ ...layer, animation: 'jcSpinCW 30s linear infinite', transformOrigin: 'center' }}>
          <svg viewBox={vb} {...sz} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={G} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#FDE68A" />
                <stop offset="40%"  stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            {/* Two sharp-cornered squares (NO rx/ry) — large star frame */}
            <rect x="-70" y="-70" width="140" height="140"
              fill="none" stroke={`url(#${G})`} strokeWidth="8" />
            <rect x="-70" y="-70" width="140" height="140"
              fill="none" stroke={`url(#${G})`} strokeWidth="8"
              transform="rotate(45)" />
          </svg>
        </div>

        {/* LAYER 2 — inner purple lotus, rotates CCW 20s
            Petals: base at r=10, pointed tip at r=55
            Inner crossing of star is at r≈75, so lotus is well inside   */}
        <div style={{ ...layer, animation: 'jcSpinCCW 20s linear infinite', transformOrigin: 'center' }}>
          <svg viewBox={vb} {...sz} xmlns="http://www.w3.org/2000/svg">
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <g key={angle} transform={`rotate(${angle})`}>
                {/* Petal: base at (0,-10), narrow pointed tip at (0,-55) */}
                <path
                  d="M 0,-10 C -15,-18 -15,-42 0,-55 C 15,-42 15,-18 0,-10 Z"
                  fill="#6C2BD9" fillOpacity="0.15"
                  stroke="#6C2BD9" strokeWidth="2.5" strokeLinejoin="round"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* LAYER 3 — static plant + gold leaves (always in front)
            Plant arms reach to r≈43, leaves to r≈52 — both inside lotus (r=55) */}
        <svg viewBox={vb} {...sz} xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {/* Leaf gradient: amber base → bright gold mid → pale gold tip */}
            <linearGradient id={L} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%"   stopColor="#B45309" />
              <stop offset="30%"  stopColor="#D97706" />
              <stop offset="65%"  stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>

          {/* ── Purple plant figure ──────────────────────── */}
          <g fill="none" stroke="#5B21B6" strokeLinecap="round" strokeLinejoin="round">
            {/* Root left */}
            <path d="M 0,42 C -6,47 -12,52 -18,57" strokeWidth="6" />
            {/* Root right */}
            <path d="M 0,42 C 6,47 12,52 18,57" strokeWidth="6" />
            {/* Main trunk */}
            <path d="M 0,42 L 0,0" strokeWidth="7.5" />
            {/* Left arm: curves up and outward — tip at (-24,-36), r≈43 */}
            <path d="M 0,0 C -9,-13 -18,-24 -24,-36" strokeWidth="6.5" />
            {/* Right arm */}
            <path d="M 0,0 C 9,-13 18,-24 24,-36" strokeWidth="6.5" />
          </g>

          {/* Wing leaves at mid-arm */}
          <path d="M -13,-16 C -21,-11 -27,-20 -18,-26 Z"
            fill="#5B21B6" stroke="#5B21B6" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 13,-16 C 21,-11 27,-20 18,-26 Z"
            fill="#5B21B6" stroke="#5B21B6" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Arm-tip leaf buds */}
          <path d="M -24,-36 C -31,-43 -27,-33 -19,-30 Z"
            fill="#5B21B6" stroke="#5B21B6" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 24,-36 C 31,-43 27,-33 19,-30 Z"
            fill="#5B21B6" stroke="#5B21B6" strokeWidth="1.5" strokeLinejoin="round" />

          {/* ── Gold chakra dot ── */}
          <circle cx="0" cy="0" r="8"   fill="#F59E0B" />
          <circle cx="0" cy="0" r="3.5" fill="#FEF3C7" />

          {/* ── Three gold leaves (all inside lotus r=55) ──
              Rendered: sides first (behind), center last (on top) */}
          {/* Left leaf — tip at (-18,-44), r≈47.6 */}
          <path d="M 0,0 C -8,-12 -16,-26 -18,-44 C -9,-30 -2,-14 0,0 Z"
            fill={`url(#${L})`} />
          {/* Right leaf */}
          <path d="M 0,0 C 8,-12 16,-26 18,-44 C 9,-30 2,-14 0,0 Z"
            fill={`url(#${L})`} />
          {/* Center leaf — tallest, tip at (0,-52), on top */}
          <path d="M 0,0 C -12,-18 -12,-40 0,-52 C 12,-40 12,-18 0,0 Z"
            fill={`url(#${L})`} />
          {/* Center leaf midrib */}
          <path d="M 0,-2 L 0,-46" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
        </svg>

      </div>

      {/* ── Inline text (auth only; splash renders its own text below the SVG) ── */}
      {displayText && (
        <div>
          <div className={`font-bold leading-tight select-none ${textSize}`}>
            <span className="text-jc-purple-700">Jeevan</span>
            <span className="text-jc-gold-600">Chakra</span>
          </div>
          {subSize && (
            <div className={`text-slate-400 font-normal mt-0.5 ${subSize}`}>
              Intelligent Homeopathy, Personalized Care.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
