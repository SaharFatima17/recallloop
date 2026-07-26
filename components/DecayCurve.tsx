export default function DecayCurve() {
  // Each segment: a memory decays (curve falls), then a review resets it higher
  // than the previous peak, and the decay slows — the visual thesis of spaced repetition.
  return (
    <svg
      viewBox="0 0 720 220"
      className="w-full h-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-spark)" stopOpacity="0.15" />
          <stop offset="60%" stopColor="var(--color-spark)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-mastery)" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M0,60
           C 40,110 70,150 90,160
           L 90,160
           C 92,90 92,90 95,85
           C 140,150 170,180 190,186
           C 192,120 192,120 196,112
           C 250,165 290,190 310,194
           C 312,140 312,140 318,130
           C 380,172 430,196 460,198
           C 462,158 462,158 470,148
           C 540,182 610,200 720,204"
        fill="none"
        stroke="url(#fade)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {[
        [95, 85],
        [196, 112],
        [318, 130],
        [470, 148],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={4}
          fill="var(--color-mastery)"
          opacity={0.5 + i * 0.12}
        />
      ))}
    </svg>
  );
}
