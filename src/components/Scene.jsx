import { useId } from "react";

const WAVE =
  "M0 0 q25 -7 50 0" + " t50 0".repeat(15) + " V200 H0 Z";

function canSize(liters) {
  if (liters <= 2) return { w: 92, h: 112 };
  if (liters <= 5) return { w: 120, h: 150 };
  if (liters <= 10) return { w: 150, h: 186 };
  return { w: 172, h: 212 };
}

export default function Scene({
  liters,
  dispensed,
  tank,
  capacity,
  flowing,
  tapEnabled,
  done,
  onTap,
  onBlocked,
}) {
  const uid = useId().replace(/:/g, "");
  const cx = 200;
  const bottom = 506;
  const { w, h } = canSize(liters);
  const top = bottom - h;
  const frac = liters ? Math.min(dispensed / liters, 1) : 0;
  const surfaceY = bottom - h * frac;

  const tankTop = 40;
  const tankH = 108;
  const tankFrac = Math.max(0, Math.min(1, tank / capacity));
  const waterY = tankTop + tankH * (1 - tankFrac);

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tapEnabled ? onTap() : onBlocked && onBlocked();
    }
  };

  return (
    <svg viewBox="0 0 400 530" className="scene" role="img" aria-label="Water tank, tap and can">
      <defs>
        <clipPath id={`tank-${uid}`}>
          <rect x="50" y={tankTop} width="300" height={tankH} rx="10" />
        </clipPath>
        <clipPath id={`can-${uid}`}>
          <rect x={cx - w / 2} y={top} width={w} height={h} rx="14" />
        </clipPath>
        <linearGradient id={`brass-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7C65E" />
          <stop offset="1" stopColor="#B8892A" />
        </linearGradient>
      </defs>

      {/* Tank */}
      <text x="50" y="28" className="svg-label">
        Water tank · {Math.round(tank)} L left
      </text>
      <rect x="50" y={tankTop} width="300" height={tankH} rx="10" fill="#EAF6FB" />
      <g clipPath={`url(#tank-${uid})`}>
        <g style={{ transform: `translateY(${waterY}px)`, transition: "transform .25s linear" }}>
          <path d={WAVE} className="wave" fill="#34B3E6" />
        </g>
      </g>
      <rect x="50" y={tankTop} width="300" height={tankH} rx="10" fill="none" stroke="#0A2540" strokeWidth="5" />

      {/* Pipe */}
      <rect x="192" y={tankTop + tankH + 2} width="16" height="42" fill="#7D95A3" stroke="#0A2540" strokeWidth="3" />

      {/* Can (drawn before stream so water pours into it) */}
      <rect x={cx - 26} y={top - 14} width="52" height="18" rx="4" fill="#fff" stroke="#0A2540" strokeWidth="4" />
      <path
        d={`M${cx + w / 2} ${top + h * 0.22} q34 0 34 ${h * 0.2} t-34 ${h * 0.2}`}
        fill="none"
        stroke="#0A2540"
        strokeWidth="4"
      />
      <rect x={cx - w / 2} y={top} width={w} height={h} rx="14" fill="rgba(255,255,255,.7)" />
      <g clipPath={`url(#can-${uid})`}>
        <rect
          x={cx - w / 2}
          y={surfaceY}
          width={w}
          height={bottom - surfaceY + 2}
          fill="#34B3E6"
          style={{ transition: "y .1s linear, height .1s linear" }}
        />
      </g>
      <rect x={cx - w / 2} y={top} width={w} height={h} rx="14" fill="none" stroke="#0A2540" strokeWidth="5" />
      <text x={cx} y={top + h * 0.5} textAnchor="middle" className="can-label">
        {liters} L
      </text>
      <line x1="90" y1={bottom + 3} x2="310" y2={bottom + 3} stroke="#0A2540" strokeWidth="4" strokeLinecap="round" />

      {/* Water stream */}
      {flowing && (
        <g>
          <rect x="196" y="238" width="8" height={Math.max(0, surfaceY - 238)} fill="#34B3E6" />
          <line x1="200" y1="238" x2="200" y2={surfaceY} className="stream-dash" />
        </g>
      )}

      {/* Tap */}
      <g
        role="button"
        tabIndex={0}
        aria-label={flowing ? "Close the tap" : "Open the tap"}
        aria-disabled={!tapEnabled}
        onClick={() => (tapEnabled ? onTap() : onBlocked && onBlocked())}
        onKeyDown={handleKey}
        className={`tap ${tapEnabled ? "tap-on" : "tap-off"}`}
      >
        <rect x="160" y="170" width="150" height="80" fill="transparent" />
        <rect x="190" y="200" width="20" height="38" rx="4" fill="#8E6A1B" stroke="#0A2540" strokeWidth="3" />
        <rect x="168" y="186" width="64" height="30" rx="9" fill={`url(#brass-${uid})`} stroke="#0A2540" strokeWidth="4" />
        <circle cx="232" cy="201" r="7" fill="#8E6A1B" stroke="#0A2540" strokeWidth="3" />
        <g style={{ transform: `rotate(${flowing ? 90 : 0}deg)`, transformOrigin: "232px 201px", transition: "transform .35s cubic-bezier(.3,1.5,.5,1)" }}>
          <line x1="232" y1="201" x2="280" y2="201" stroke="#0A2540" strokeWidth="9" strokeLinecap="round" />
          <circle cx="282" cy="201" r="13" fill="#0B5CAD" stroke="#0A2540" strokeWidth="4" />
        </g>
        {tapEnabled && !flowing && !done && <circle cx="232" cy="201" r="50" className="pulse" />}
      </g>
      {tapEnabled && !flowing && !done && (
        <text x="262" y="266" textAnchor="middle" className="svg-hint">
          {dispensed > 0 ? "Turn to resume" : "Turn the tap"}
        </text>
      )}
    </svg>
  );
}