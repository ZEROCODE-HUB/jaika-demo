import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FolderOpen,
  HardHat,
  Home,
  Landmark,
  Plus,
  ReceiptText,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Store,
  UserCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary } from "@/components/portal-shell";
import { SectionCard } from "@/components/ui-kit";
import { CreditTimeline } from "@/components/credit-timeline";
import {
  ETAPA_DESCRIPCION,
  ETAPA_LABEL,
  ETAPA_TONE,
  calcularCredito,
  calcularCronograma,
  formatearMonto,
  paisPorNombre,
  proximaCuota,
  referenciaLocal,
  tieneCreditoEnCurso,
  useJaikaDemo,
  type CreditoDemo,
  type EtapaCredito,
  type TipoBien,
} from "@/lib/jaika-demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

type GradientTone = "aqua" | "cyan" | "navy" | "amber" | "violet" | "slate";

const GRADIENTES: Record<GradientTone, string> = {
  aqua: "from-[#2bb393] to-[#1d7c69]",
  cyan: "from-[#2ab8d6] to-[#1a8aa6]",
  navy: "from-[#36588a] to-[#1c2e4a]",
  amber: "from-[#e0912f] to-[#c26e12]",
  violet: "from-[#6b5bd2] to-[#4b3fa8]",
  slate: "from-[#64748b] to-[#334155]",
};

function fechaLarga(fecha: string) {
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(fecha),
  );
}
function siguientePaso(etapa: EtapaCredito) {
  if (etapa === "sin_solicitud") return { label: "Inicia tu solicitud", to: "/app/solicitud" };
  if (etapa === "solicitud_firmada")
    return { label: "Acredita tu 10% inicial", to: "/app/preaprobacion" };
  if (etapa === "en_pago") return { label: "Revisa tu cronograma", to: "/app/cronograma" };
  return { label: "Revisa el avance de tu crédito", to: "/app/seguimiento" };
}

function IconoBien({ tipo }: { tipo: TipoBien }) {
  const Icon =
    tipo === "Vivienda"
      ? Home
      : tipo === "Vehículo"
        ? Car
        : tipo === "Transporte"
          ? Bus
          : tipo === "Construcción"
            ? HardHat
            : Store;
  return <Icon size={18} />;
}

function ResumenTile({
  icon: Icon,
  label,
  value,
  sub,
  to,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub: string;
  to: string;
  tone: GradientTone;
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-[78%] snap-start items-center gap-3 rounded-2xl border border-black-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:min-w-0"
    >
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
          GRADIENTES[tone],
        )}
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="truncate font-display text-lg font-semibold tabular-nums text-ink md:text-xl">
          {value}
        </p>
        <p className="truncate text-[11px] text-ink-muted">{sub}</p>
      </div>
    </Link>
  );
}

function AccionRapida({
  icon: Icon,
  label,
  to,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  to: string;
  tone: GradientTone;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-black-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span
        className={cn(
          "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
          GRADIENTES[tone],
        )}
      >
        <Icon size={19} />
      </span>
      <span className="text-center text-[11px] font-semibold leading-tight text-black-600 md:text-[12px]">
        {label}
      </span>
    </Link>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const perfil = useJaikaDemo((s) => s.perfil);
  const solicitud = useJaikaDemo((s) => s.solicitud);
  const preaprobacion = useJaikaDemo((s) => s.preaprobacion);
  const etapa = useJaikaDemo((s) => s.etapa);
  const notificaciones = useJaikaDemo((s) => s.notificaciones);
  const creditoActivoId = useJaikaDemo((s) => s.creditoActivoId);
  const otrosCreditos = useJaikaDemo((s) => s.creditos ?? []);
  const nuevaSolicitud = useJaikaDemo((s) => s.nuevaSolicitud);
  const seleccionarCredito = useJaikaDemo((s) => s.seleccionarCredito);

  const primerNombre = perfil.nombres?.split(" ")[0] || "bienvenido";
  const monedaLocal = perfil.moneda ?? paisPorNombre(perfil.paisPostula).moneda;
  const moneda = solicitud?.moneda ?? "USD";
  const credito = solicitud
    ? calcularCredito(solicitud.tipoBien, solicitud.valor, solicitud.plazo)
    : null;
  const cronograma = calcularCronograma(solicitud, etapa, preaprobacion);
  const proxima = proximaCuota(cronograma);
  const cuota = etapa === "en_pago" ? proxima : null;
  const pagadas = cronograma.filter((c) => c.estado === "pagada").length;
  const progreso = cronograma.length > 0 ? Math.round((pagadas / cronograma.length) * 100) : 0;
  const referencia = solicitud
    ? referenciaLocal(solicitud.valor, solicitud.moneda, monedaLocal)
    : null;
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const sinSolicitud = etapa === "sin_solicitud" || !solicitud;
  const firmada = etapa === "solicitud_firmada";
  const conCredito = !sinSolicitud && !firmada && !!credito;
  const paso = siguientePaso(sinSolicitud ? "sin_solicitud" : etapa);

  const activo: CreditoDemo | null =
    !sinSolicitud && tieneCreditoEnCurso(etapa)
      ? {
          id: creditoActivoId,
          solicitud,
          preaprobacion,
          etapa,
          creadoEn: preaprobacion?.fecha ?? "",
        }
      : null;
  const misCreditos = [...(activo ? [activo] : []), ...otrosCreditos];

  const onNuevoCredito = () => {
    if (tieneCreditoEnCurso(etapa)) {
      nuevaSolicitud();
      toast.success("Tu crédito actual quedó guardado en Mis créditos.");
    }
    navigate({ to: "/app/solicitud" });
  };

  const onVerCredito = (id: string) => {
    seleccionarCredito(id);
    toast.success("Mostrando el crédito seleccionado.");
  };

  const acciones: { label: string; icon: LucideIcon; to: string; tone: GradientTone }[] = [
    { label: "Solicitar crédito", icon: FileText, to: "/app/solicitud", tone: "aqua" },
    { label: "Cronograma", icon: CalendarDays, to: "/app/cronograma", tone: "cyan" },
    { label: "Seguimiento", icon: RouteIcon, to: "/app/seguimiento", tone: "navy" },
    { label: "Documentos", icon: FolderOpen, to: "/app/documentos", tone: "amber" },
    { label: "Notificaciones", icon: Bell, to: "/app/notificaciones", tone: "violet" },
    { label: "Mi cuenta", icon: UserCog, to: "/app/cuenta", tone: "slate" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-muted">Hola,</p>
          <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-ink md:text-[30px]">
            {primerNombre}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            {sinSolicitud
              ? "Estás a un paso de iniciar tu crédito respaldado por fideicomiso."
              : ETAPA_DESCRIPCION[etapa]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {conCredito && (
            <span className="hidden items-center gap-1.5 rounded-full border border-black-100 bg-white px-3 py-1.5 text-xs font-semibold text-ink sm:inline-flex">
              <ShieldCheck size={14} className="text-jaika-gold-dark" /> Fideicomiso
            </span>
          )}
          <Badge tone={ETAPA_TONE[sinSolicitud ? "sin_solicitud" : etapa]}>
            {ETAPA_LABEL[sinSolicitud ? "sin_solicitud" : etapa]}
          </Badge>
        </div>
      </div>

      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4">
        <ResumenTile
          icon={RouteIcon}
          label="Etapa actual"
          value={ETAPA_LABEL[sinSolicitud ? "sin_solicitud" : etapa]}
          sub={paso.label}
          to={paso.to}
          tone="navy"
        />
        <ResumenTile
          icon={CalendarDays}
          label="Próxima cuota"
          value={
            cuota
              ? formatearMonto(cuota.monto, moneda)
              : credito
                ? formatearMonto(credito.cuota, moneda)
                : "—"
          }
          sub={
            cuota
              ? fechaLarga(cuota.vencimiento)
              : credito
                ? "Cuota estimada"
                : "Aún sin cronograma"
          }
          to="/app/cronograma"
          tone="cyan"
        />
        <ResumenTile
          icon={Wallet}
          label="Monto financiado"
          value={credito ? formatearMonto(credito.financiado, moneda) : "—"}
          sub={
            credito ? `Inicial ${formatearMonto(credito.inicial, moneda)}` : "Inicia tu solicitud"
          }
          to="/app/solicitud"
          tone="aqua"
        />
        <ResumenTile
          icon={Bell}
          label="Notificaciones"
          value={noLeidas}
          sub={noLeidas > 0 ? "Sin leer" : "Todo al día"}
          to="/app/notificaciones"
          tone="amber"
        />
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#13213a] via-[#1c2e4a] to-[#1d5c63] p-6 text-white shadow-[0_18px_40px_-18px_rgba(28,46,74,.7)] md:p-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-jaika-cyan/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-jaika-gold/25 blur-3xl"
        />
        <div className="relative">
          {sinSolicitud && (
            <>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-jaika-mint">
                <Landmark size={13} /> Crédito con fideicomiso
              </div>
              <h2 className="max-w-lg font-display text-2xl font-semibold leading-tight md:text-3xl">
                Con tu 10% de inicial, tu crédito está preaprobado.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                Elige tu bien, firma tu solicitud, acredita tu inicial y sigue cada etapa hasta la
                entrega de llaves.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/app/solicitud"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#1c2e4a] transition-colors hover:bg-white/90"
                >
                  Solicitar mi crédito <ArrowRight size={16} />
                </Link>
                <Link
                  to="/app/cuenta"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Revisar mi perfil
                </Link>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-xs">
                {[
                  ["10%", "Inicial"],
                  ["120", "Meses máximo"],
                  ["6.5%", "TEA desde"],
                ].map(([valor, label]) => (
                  <div key={label}>
                    <div className="font-display text-lg font-semibold tabular-nums text-white">
                      {valor}
                    </div>
                    <div className="text-white/55">{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {firmada && solicitud && credito && (
            <>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-jaika-mint">
                <Sparkles size={13} /> Solicitud firmada
              </div>
              <h2 className="max-w-lg font-display text-2xl font-semibold leading-tight md:text-3xl">
                Acredita tu 10% inicial y activa tu preaprobación.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                Estamos listos para continuar. Con la inicial acreditada podrás ver tu cronograma y
                avanzar a la siguiente etapa.
              </p>
              <div className="mt-5 flex flex-wrap items-end gap-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/55">
                    Inicial a acreditar
                  </div>
                  <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-jaika-mint">
                    {formatearMonto(credito.inicial, solicitud.moneda)}
                  </div>
                  {referencia && (
                    <div className="mt-0.5 text-xs text-white/55">
                      Referencia: {formatearMonto(referencia.valor, referencia.moneda)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/55">
                    Valor de la solicitud
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold tabular-nums text-white">
                    {formatearMonto(solicitud.valor, solicitud.moneda)}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/app/preaprobacion"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#1c2e4a] transition-colors hover:bg-white/90"
                >
                  Acreditar inicial <ArrowRight size={16} />
                </Link>
                <Link
                  to="/app/solicitud"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Revisar solicitud
                </Link>
              </div>
            </>
          )}

          {conCredito && solicitud && credito && (
            <>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-jaika-mint">
                <Sparkles size={13} /> {ETAPA_LABEL[etapa]}
              </div>
              <h2 className="max-w-lg font-display text-2xl font-semibold leading-tight md:text-3xl">
                {etapa === "en_pago"
                  ? "Tu crédito está en marcha."
                  : `Tu crédito de ${solicitud.tipoBien.toLowerCase()} avanza sin sorpresas.`}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                {ETAPA_DESCRIPCION[etapa]}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/55">
                    Monto financiado
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-white">
                    {formatearMonto(credito.financiado, solicitud.moneda)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/55">
                    Cuota mensual
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-jaika-mint">
                    {formatearMonto(credito.cuota, solicitud.moneda)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/55">Plazo</div>
                  <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-white">
                    {solicitud.plazo} meses
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/app/seguimiento"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#1c2e4a] transition-colors hover:bg-white/90"
                >
                  Ver seguimiento <ArrowRight size={16} />
                </Link>
                <Link
                  to="/app/cronograma"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <CalendarDays size={16} /> Cronograma
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-bold text-ink">Accesos rápidos</h2>
          <span className="text-[11px] text-ink-muted">Todo tu crédito en un solo lugar</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {acciones.map((accion) => (
            <AccionRapida key={accion.to} {...accion} />
          ))}
        </div>
      </section>

      {sinSolicitud && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Cómo funciona" description="Del registro a la entrega de llaves.">
            <ol className="space-y-3 text-sm text-black-500">
              {[
                "Elige el bien y simula tu crédito.",
                "Firma tu solicitud y acredita el 10% inicial.",
                "Recibe tu preaprobación con la minuta de compraventa.",
                "Registros públicos, notaría, desembolso y entrega de llaves.",
              ].map((texto, indice) => (
                <li key={texto} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-jaika-gold/10 text-xs font-bold text-jaika-gold-dark">
                    {indice + 1}
                  </span>
                  <span className="pt-1">{texto}</span>
                </li>
              ))}
            </ol>
            {solicitud && (
              <div className="mt-5 rounded-xl border border-jaika-gold/25 bg-jaika-gold/5 p-3 text-xs text-black-500">
                <div className="font-semibold text-black-800">Tienes una simulación guardada</div>
                <p className="mt-1">
                  {solicitud.tipoBien} · {formatearMonto(solicitud.valor, solicitud.moneda)} ·{" "}
                  {solicitud.plazo} meses
                </p>
              </div>
            )}
          </SectionCard>
          <SectionCard title="Respaldo y seguridad">
            <ul className="space-y-3 text-sm text-black-500">
              <li className="flex gap-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-jaika-gold-dark" />
                Identidad verificada y proceso KYC.
              </li>
              <li className="flex gap-3">
                <Landmark size={18} className="mt-0.5 shrink-0 text-jaika-gold-dark" />
                Crédito administrado por un fideicomiso independiente.
              </li>
              <li className="flex gap-3">
                <FileText size={18} className="mt-0.5 shrink-0 text-jaika-gold-dark" />
                Documentos y cronograma disponibles en tu portal.
              </li>
            </ul>
          </SectionCard>
        </div>
      )}

      {firmada && solicitud && credito && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Tu solicitud"
            description={`${solicitud.tipoBien} · ${formatearMonto(solicitud.valor, solicitud.moneda)}`}
          >
            <dl className="space-y-3 text-sm">
              {[
                ["Bien", solicitud.tipoBien],
                ["Valor", formatearMonto(solicitud.valor, solicitud.moneda)],
                ["Inicial (10%)", formatearMonto(credito.inicial, solicitud.moneda)],
                ["Monto financiado", formatearMonto(credito.financiado, solicitud.moneda)],
                ["Tasa referencial", `${credito.tasaAnual.toFixed(1)}% anual`],
                ["Cuota estimada", formatearMonto(credito.cuota, solicitud.moneda)],
                ["Plazo", `${solicitud.plazo} meses`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-black-400">{label}</dt>
                  <dd className="font-semibold tabular-nums text-black-800">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
          <SectionCard title="Qué sigue" description="Solo falta un paso para tu preaprobación.">
            <ol className="space-y-3">
              {[
                {
                  titulo: "Acredita tu 10% inicial",
                  detalle: formatearMonto(credito.inicial, solicitud.moneda),
                  activo: true,
                },
                {
                  titulo: "Recibe tu preaprobación",
                  detalle: "Minuta de compraventa y cronograma",
                  activo: false,
                },
                {
                  titulo: "Firma y avanza a registros públicos",
                  detalle: "Notaría y desembolso con el fideicomiso",
                  activo: false,
                },
              ].map((item, indice) => (
                <li key={item.titulo} className="flex gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      item.activo ? "bg-jaika-gold text-white" : "bg-plata-100 text-black-400",
                    )}
                  >
                    {item.activo ? <CheckCircle2 size={16} /> : indice + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-black-800">{item.titulo}</div>
                    <div className="text-xs text-black-400">{item.detalle}</div>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/app/preaprobacion" className="mt-4 block">
              <BtnPrimary className="w-full">
                Continuar con la inicial <ArrowRight size={15} />
              </BtnPrimary>
            </Link>
          </SectionCard>
        </div>
      )}

      {conCredito && solicitud && credito && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            <SectionCard
              title="Avance de tu crédito"
              description={ETAPA_DESCRIPCION[etapa]}
              action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
            >
              <CreditTimeline etapa={etapa} notificaciones={notificaciones} includePago compact />
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/app/seguimiento">
                  <BtnOutline className="h-9 px-3 text-xs">
                    Ver seguimiento <ArrowRight size={13} />
                  </BtnOutline>
                </Link>
                <Link to="/app/cronograma">
                  <BtnOutline className="h-9 px-3 text-xs">
                    <CalendarDays size={13} /> Cronograma
                  </BtnOutline>
                </Link>
                <Link to="/app/documentos">
                  <BtnOutline className="h-9 px-3 text-xs">
                    <FileText size={13} /> Documentos
                  </BtnOutline>
                </Link>
              </div>
            </SectionCard>

            <SectionCard title="Resumen del crédito">
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                {[
                  ["Valor del bien", formatearMonto(solicitud.valor, solicitud.moneda)],
                  ["Inicial", formatearMonto(credito.inicial, solicitud.moneda)],
                  ["Financiado", formatearMonto(credito.financiado, solicitud.moneda)],
                  ["Tasa anual", `${credito.tasaAnual.toFixed(1)}%`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[11px] uppercase tracking-wide text-ink-muted">
                      {label}
                    </div>
                    <div className="mt-1 font-semibold tabular-nums text-ink">{value}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-4">
            {cuota ? (
              <section className="rounded-2xl border border-black-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-jaika-gold/10 text-jaika-gold-dark">
                      <ReceiptText size={17} />
                    </span>
                    <div>
                      <h2 className="font-semibold text-black-800">Próxima cuota</h2>
                      <p className="text-[11px] text-black-400">
                        Cuota {cuota.numero} de {solicitud.plazo}
                      </p>
                    </div>
                  </div>
                  <Badge tone="success">Vigente</Badge>
                </div>
                <div className="mt-4 font-display text-3xl font-semibold tabular-nums text-ink">
                  {formatearMonto(cuota.monto, solicitud.moneda)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-black-400">
                  <Clock3 size={13} /> {fechaLarga(cuota.vencimiento)}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-black-400">
                    <span>Avance de pago</span>
                    <span className="font-semibold text-black-700">{progreso}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-plata-100">
                    <div
                      className="h-full rounded-full bg-jaika-gold transition-all"
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-black-400">
                    {pagadas} de {cronograma.length} cuotas pagadas
                  </p>
                </div>
                <Link
                  to="/app/cronograma"
                  className="mt-4 flex items-center justify-between rounded-xl bg-plata-50 px-3.5 py-2.5 text-sm font-semibold text-jaika-gold-dark hover:bg-jaika-gold/10"
                >
                  Ver cronograma completo <ChevronRight size={16} />
                </Link>
              </section>
            ) : (
              <SectionCard title="Próximo paso">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-jaika-gold/10 text-jaika-gold-dark">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black-800">{paso.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-black-400">
                      Revisa el seguimiento para conocer qué viene en tu proceso.
                    </p>
                    <Link to={paso.to} className="mt-3 block">
                      <BtnOutline className="h-9 px-3 text-xs">
                        Continuar <ArrowRight size={13} />
                      </BtnOutline>
                    </Link>
                  </div>
                </div>
              </SectionCard>
            )}

            <SectionCard title="Respaldo">
              <div className="space-y-2.5 text-sm text-black-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-jaika-gold-dark" /> Identidad verificada
                </div>
                <div className="flex items-center gap-2">
                  <Landmark size={15} className="text-jaika-gold-dark" /> Administrado por
                  fideicomiso
                </div>
                {referencia && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-jaika-gold-dark" />
                    Referencia local: {formatearMonto(referencia.valor, referencia.moneda)}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {(misCreditos.length > 0 || !sinSolicitud) && (
        <SectionCard
          title="Mis créditos"
          description="Cada crédito tiene su propio 10% inicial, preaprobación y etapas."
          action={
            <BtnPrimary className="h-9 px-3 text-xs" onClick={onNuevoCredito}>
              <Plus size={14} /> Solicitar nuevo crédito
            </BtnPrimary>
          }
          bodyClassName="p-0"
        >
          {misCreditos.length === 0 ? (
            <p className="px-5 py-4 text-sm text-black-400">
              Tu primer crédito aparecerá aquí cuando firmes la solicitud.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {misCreditos.map((item) => {
                const esActivo = item.id === creditoActivoId && !!activo;
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
                        {item.solicitud ? (
                          <IconoBien tipo={item.solicitud.tipoBien} />
                        ) : (
                          <Wallet size={18} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-black-800">
                            {item.solicitud?.tipoBien ?? "Crédito"}
                          </span>
                          {esActivo && <Badge tone="info">Viendo ahora</Badge>}
                        </div>
                        <div className="text-xs text-black-400">
                          {item.solicitud
                            ? formatearMonto(item.solicitud.valor, item.solicitud.moneda)
                            : "—"}{" "}
                          · {item.solicitud?.plazo ?? "—"} meses
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={ETAPA_TONE[item.etapa]}>{ETAPA_LABEL[item.etapa]}</Badge>
                      {!esActivo && (
                        <BtnOutline
                          className="h-8 px-3 text-xs"
                          onClick={() => onVerCredito(item.id)}
                        >
                          Ver
                        </BtnOutline>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  );
}
