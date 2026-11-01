type RangoliProps = {
  className?: string;
};

export function Rangoli({ className = "" }: RangoliProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="78" stroke="url(#r1)" strokeWidth="1.2" opacity="0.5" />
      <circle cx="100" cy="100" r="58" stroke="url(#r1)" strokeWidth="1" opacity="0.35" />
      <circle cx="100" cy="100" r="18" fill="url(#r2)" opacity="0.55" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x = 100 + Math.cos(angle) * 48;
        const y = 100 + Math.sin(angle) * 48;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="10"
            ry="18"
            transform={`rotate(${(i * 45) + 90} ${x} ${y})`}
            fill="url(#r2)"
            opacity="0.35"
          />
        );
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI) / 6;
        const x = 100 + Math.cos(angle) * 72;
        const y = 100 + Math.sin(angle) * 72;
        return (
          <circle key={`d-${i}`} cx={x} cy={y} r="2.2" fill="#e7c56b" opacity="0.45" />
        );
      })}
      <defs>
        <linearGradient id="r1" x1="20" y1="20" x2="180" y2="180">
          <stop stopColor="#e7c56b" />
          <stop offset="1" stopColor="#e8913a" />
        </linearGradient>
        <radialGradient id="r2" cx="50%" cy="50%" r="50%">
          <stop stopColor="#f4df9b" />
          <stop offset="1" stopColor="#e8913a" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
}
