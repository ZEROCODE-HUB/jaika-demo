/**
 * Logo de Jaika (version demo): isotipo cuadrado con la "J" y un punto de acento
 * (en quechua "jaika" significa "cuanto") + wordmark.
 * - variant "dark": para fondos claros (isotipo navy, texto navy).
 * - variant "light": para fondos oscuros (isotipo blanco, texto blanco).
 */
export function JaikaLogo({
  className = "",
  variant = "dark",
  size = 32,
  iconOnly = false,
}: {
  className?: string;
  variant?: "dark" | "light";
  size?: number;
  iconOnly?: boolean;
}) {
  const light = variant === "light";
  const tile = light ? "#FFFFFF" : "#1C2E4A";
  const letter = light ? "#1C2E4A" : "#FFFFFF";
  const text = light ? "#FFFFFF" : "#1C2E4A";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label="Jaika">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={tile} />
        <path
          d="M18.5 8.5v10.2a4.8 4.8 0 0 1-9.6 0"
          fill="none"
          stroke={letter}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="23.6" cy="9" r="2.6" fill="#23957E" />
      </svg>
      {!iconOnly && (
        <span
          className="font-display font-semibold"
          style={{
            color: text,
            fontSize: Math.max(16, size * 0.72),
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          Jaika
        </span>
      )}
    </div>
  );
}
