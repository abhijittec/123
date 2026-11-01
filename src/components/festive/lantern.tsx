type LanternProps = {
  className?: string;
  delay?: string;
};

export function Lantern({ className = "", delay = "0s" }: LanternProps) {
  return (
    <svg
      width="36"
      height="56"
      viewBox="0 0 36 56"
      fill="none"
      aria-hidden="true"
      className={`animate-lantern ${className}`}
      style={{ animationDelay: delay }}
    >
      <path d="M18 2v8" stroke="#e7c56b" strokeWidth="1.5" />
      <rect x="8" y="10" width="20" height="6" rx="1.5" fill="#c9972c" />
      <path
        d="M7 16h22l-2 24H9L7 16Z"
        fill="url(#lanternGlow)"
        opacity="0.9"
      />
      <path d="M12 20h12M11 28h14M12 36h12" stroke="#fff2c4" strokeOpacity="0.35" />
      <path d="M14 40c1.5 6 4 10 4 10s2.5-4 4-10" stroke="#e7c56b" strokeWidth="1.2" />
      <defs>
        <linearGradient id="lanternGlow" x1="18" y1="16" x2="18" y2="40">
          <stop stopColor="#f0a202" />
          <stop offset="0.55" stopColor="#e8612d" />
          <stop offset="1" stopColor="#8a2a12" />
        </linearGradient>
      </defs>
    </svg>
  );
}
