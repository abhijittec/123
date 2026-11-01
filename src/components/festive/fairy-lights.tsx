export function FairyLights({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 flex justify-between px-2 sm:px-6 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="animate-fairy relative mt-2 h-2.5 w-2.5 rounded-full"
          style={{
            animationDelay: `${i * 0.18}s`,
            background:
              i % 3 === 0 ? "#e7c56b" : i % 3 === 1 ? "#e8913a" : "#f4df9b",
            boxShadow: "0 0 10px currentColor",
          }}
        />
      ))}
      <div className="absolute inset-x-4 top-3 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  );
}
