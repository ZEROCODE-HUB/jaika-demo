import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

/** Tarjeta de seccion con titulo, descripcion y accion opcional. */
export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-white ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-5 pb-3 pt-4">
          <div>
            {title && <h2 className="font-display text-sm font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Indicador compacto (KPI). */
export function KpiTile({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums text-ink md:text-2xl">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-ink-muted">{sub}</div>}
    </div>
  );
}

const TONOS = {
  aqua: "bg-jaika-gold/10 text-jaika-gold-dark",
  cyan: "bg-jaika-cyan/10 text-[#13708a]",
  amber: "bg-amber-50 text-amber-700",
  navy: "bg-navy-50 text-navy-600",
} as const;

/** Acceso rapido con icono, etiqueta y valor (estilo "lo que necesita atencion hoy"). */
export function QuickLink({
  icon: Icon,
  label,
  value,
  to,
  tone = "aqua",
}: {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  to: string;
  tone?: keyof typeof TONOS;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 transition-colors hover:bg-canvas"
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONOS[tone]}`}>
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1 text-sm text-ink">{label}</span>
      {value !== undefined && (
        <span className="shrink-0 font-display text-base font-semibold tabular-nums text-ink">
          {value}
        </span>
      )}
    </Link>
  );
}
