import { useId, type CSSProperties } from 'react';

type LogoSize = 'splash' | 'sidebar' | 'auth' | 'navbar';

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
  dark?: boolean;
}

const sizeMap: Record<LogoSize, { svgPx: number; textSize: string; subSize: string }> = {
  splash:  { svgPx: 220, textSize: 'text-4xl',  subSize: 'text-sm' },
  auth:    { svgPx: 120, textSize: 'text-2xl',  subSize: 'text-xs' },
  sidebar: { svgPx: 48,  textSize: 'text-lg',   subSize: '' },
  navbar:  { svgPx: 38,  textSize: 'text-base', subSize: '' },
};

export default function Logo({ size = 'sidebar', showText, className = '', dark = false }: LogoProps) {
  const uid = useId().replace(/:/g, '_');
  const { svgPx, textSize, subSize } = sizeMap[size];
  const displayText = showText ?? (size === 'auth');

  const G = `jcG${uid}`;
  const L = `jcL${uid}`;

  const vb = '-100 -100 200 200';
  const sz = { width: svgPx, height: svgPx } as const;
  const layer: CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

  const petalFill = dark ? 'rgba(255,255,255,0.12)' : '#6C2BD9';
  const petalFillOpacity = dark ? 1 : 0.15;
  const petalStroke = dark ? 'rgba(255,255,255,0.5)' : '#6C2BD9';
  const plantStroke = dark ? 'rgba(255,255,255,0.9)' : '#5B21B6';
  const wingFill = dark ? 'rgba(255,255,255,0.7)' : '#5B21B6';

  return (
    <div className={`flex items-center gap-3 ${className}`}>

      <div style={{ width: svgPx, height: svgPx, position: 'relative', flexShrink: 0 }}>

        {/* Gold 8-pointed star, rotates CW */}
        <div style={{ ...layer, animation: 'jcSpinCW 30s linear infinite', transformOrigin: 'center' }}>
          <svg viewBox={vb} {...sz} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={G} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#FDE68A" />
                <stop offset="40%"  stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <rect x="-70" y="-70" width="140" height="140"
              fill="none" stroke={`url(#${G})`} strokeWidth="8" />
            <rect x="-70" y="-70" width="140" height="140"
              fill="none" stroke={`url(#${G})`} strokeWidth="8"
              transform="rotate(45)" />
          </svg>
        </div>

        {/* Inner lotus, rotates CCW */}
        <div style={{ ...layer, animation: 'jcSpinCCW 20s linear infinite', transformOrigin: 'center' }}>
          <svg viewBox={vb} {...sz} xmlns="http://www.w3.org/2000/svg">
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <g key={angle} transform={`rotate(${angle})`}>
                <path
                  d="M 0,-10 C -15,-18 -15,-42 0,-55 C 15,-42 15,-18 0,-10 Z"
                  fill={petalFill} fillOpacity={petalFillOpacity}
                  stroke={petalStroke} strokeWidth="2.5" strokeLinejoin="round"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Static plant + gold leaves */}
        <svg viewBox={vb} {...sz} xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id={L} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%"   stopColor="#B45309" />
              <stop offset="30%"  stopColor="#D97706" />
              <stop offset="65%"  stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>

          <g fill="none" stroke={plantStroke} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 0,42 C -6,47 -12,52 -18,57" strokeWidth="6" />
            <path d="M 0,42 C 6,47 12,52 18,57" strokeWidth="6" />
            <path d="M 0,42 L 0,0" strokeWidth="7.5" />
            <path d="M 0,0 C -9,-13 -18,-24 -24,-36" strokeWidth="6.5" />
            <path d="M 0,0 C 9,-13 18,-24 24,-36" strokeWidth="6.5" />
          </g>

          <path d="M -13,-16 C -21,-11 -27,-20 -18,-26 Z"
            fill={wingFill} stroke={wingFill} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 13,-16 C 21,-11 27,-20 18,-26 Z"
            fill={wingFill} stroke={wingFill} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M -24,-36 C -31,-43 -27,-33 -19,-30 Z"
            fill={wingFill} stroke={wingFill} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 24,-36 C 31,-43 27,-33 19,-30 Z"
            fill={wingFill} stroke={wingFill} strokeWidth="1.5" strokeLinejoin="round" />

          <circle cx="0" cy="0" r="8"   fill="#F59E0B" />
          <circle cx="0" cy="0" r="3.5" fill="#FEF3C7" />

          <path d="M 0,0 C -8,-12 -16,-26 -18,-44 C -9,-30 -2,-14 0,0 Z"
            fill={`url(#${L})`} />
          <path d="M 0,0 C 8,-12 16,-26 18,-44 C 9,-30 2,-14 0,0 Z"
            fill={`url(#${L})`} />
          <path d="M 0,0 C -12,-18 -12,-40 0,-52 C 12,-40 12,-18 0,0 Z"
            fill={`url(#${L})`} />
          <path d="M 0,-2 L 0,-46" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
        </svg>

      </div>

      {displayText && (
        <div>
          <div className={`font-bold leading-tight select-none ${textSize}`}>
            <span className={dark ? 'text-white' : 'text-jc-purple-700'}>Jeevan</span>
            <span className="text-jc-gold-500">Chakra</span>
          </div>
          {subSize && (
            <div className={`font-normal mt-0.5 ${subSize} ${dark ? 'text-white/60' : 'text-slate-400'}`}>
              Classical Homeopathy Decision Support
            </div>
          )}
        </div>
      )}
    </div>
  );
}
