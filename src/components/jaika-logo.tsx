export function JaikaLogo({
  className = "",
  variant = "dark",
  size = 32,
}: {
  className?: string;
  variant?: "dark" | "light";
  size?: number;
}) {
  const color = variant === "light" ? "#FFFFFF" : "#1c2e4a";

  return (
    <div className={`inline-flex items-center ${className}`} role="img" aria-label="Jaika">
      <span
        className="font-display font-semibold"
        style={{
          color,
          fontSize: Math.max(16, size * 0.8),
          lineHeight: 1,
          letterSpacing: "-0.045em",
        }}
      >
        Jaika
      </span>
      <span
        aria-hidden
        className="ml-0.5 rounded-full"
        style={{
          width: Math.max(3, size * 0.1),
          height: Math.max(3, size * 0.1),
          background: "#B08D57",
        }}
      />
    </div>
  );
}
