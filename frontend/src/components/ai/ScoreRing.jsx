/**
 * Circular score indicator (SVG ring) for the code review quality score.
 * score: 1–10
 */
export default function ScoreRing({ score }) {
  const pct    = (score / 10) * 100;
  const radius = 28;
  const circ   = 2 * Math.PI * radius;
  const dash   = (pct / 100) * circ;

  // Colour: red < 4, yellow 4–6, green > 6
  const colour =
    score >= 7 ? '#34d399'   // green-400
    : score >= 4 ? '#fbbf24' // yellow-400
    : '#f87171';             // red-400

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        {/* Track */}
        <circle
          cx="36" cy="36" r={radius}
          fill="none" stroke="#374151" strokeWidth="6"
        />
        {/* Progress */}
        <circle
          cx="36" cy="36" r={radius}
          fill="none"
          stroke={colour}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      {/* Score number overlaid */}
      <div className="absolute flex flex-col items-center" style={{ marginTop: '-52px' }}>
        <span className="text-xl font-bold" style={{ color: colour }}>{score}</span>
        <span className="text-[9px] text-gray-500 -mt-0.5">/ 10</span>
      </div>
      <span className="text-[10px] text-gray-500 mt-1">Quality</span>
    </div>
  );
}
