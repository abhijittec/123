type DiyaProps = {
  className?: string;
  size?: number;
  delay?: string;
};

export function Diya({ className = "", size = 48, delay = "0s" }: DiyaProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ animationDelay: delay }}
    >
      <ellipse cx="32" cy="46" rx="22" ry="8" fill="#3a2412" opacity="0.45" />
      <path
        d="M10 40c4-10 14-16 22-16s18 6 22 16c-5 8-14 12-22 12s-17-4-22-12Z"
        fill="url(#diyaBody)"
      />
      <path
        d="M18 38c3-5 8-8 14-8s11 3 14 8"
        stroke="#f4df9b"
        strokeWidth="1.2"
        opacity="0.55"
      />
      <path
        className="animate-diya origin-bottom"
        d="M32 14c4 6 5 10 0 16-5-6-4-10 0-16Z"
        fill="url(#flame)"
        style={{ animationDelay: delay }}
      />
      <circle cx="32" cy="26" r="2.2" fill="#fff6d5" opacity="0.9" />
      <defs>
        <linearGradient id="diyaBody" x1="10" y1="24" x2="54" y2="52">
          <stop stopColor="#f0d58a" />
          <stop offset="0.5" stopColor="#c9972c" />
          <stop offset="1" stopColor="#8a5a12" />
        </linearGradient>
        <linearGradient id="flame" x1="32" y1="14" x2="32" y2="30">
          <stop stopColor="#fff6d5" />
          <stop offset="0.45" stopColor="#f0a202" />
          <stop offset="1" stopColor="#e8612d" />
        </linearGradient>
      </defs>
    </svg>
  );
}
