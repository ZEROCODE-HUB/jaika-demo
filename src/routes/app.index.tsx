import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  Landmark,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, BtnOutline, BtnPrimary, PageHeader } from "@/components/portal-shell";
import { KpiTile, QuickLink, SectionCard } from "@/components/ui-kit";
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
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function fechaLarga(fecha: string) {
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(fecha),
  );
}

function siguientePaso(etapa: EtapaCredito) {
  if (etapa === "sin_solicitud") return { label: "Siguiente paso: solicitar tu crédito", to: "/app/solicitud" };
  if (etapa === "solicitud_firmada") return { label: "Siguiente paso: acreditar tu 10% inicial", to: "/app/preaprobacion" };
  if (etapa === "en_pago") return { label: "Tu crédito está en pago", to: "/app/cronograma" };
  return { label: `Etapa actual: ${ETAPA_LABEL[etapa]}`, to: "/app/seguimiento" };
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
  const credito = solicitud ? calcularCredito(solicitud.tipoBien, solicitud.valor, solicitud.plazo) : null;
  const cronograma = calcularCronograma(solicitud, etapa, preaprobacion);
  const cuota = etapa === "en_pago" ? proximaCuota(cronograma) : null;
  const referencia = solicitud ? referenciaLocal(solicitud.valor, solicitud.moneda, monedaLocal) : null;
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const sinSolicitud = etapa === "sin_solicitud" || !solicitud;
  const firmada = etapa === "solicitud_firmada";
  const conCredito = !sinSolicitud && !firmada && !!credito;
  const paso = siguientePaso(sinSolicitud ? "sin_solicitud" : etapa);

  const activo: CreditoDemo | null =
    !sinSolicitud && tieneCreditoEnCurso(etapa)
      ? { id: creditoActivoId, solicitud, preaprobacion, etapa, creadoEn: preaprobacion?.fecha ?? "" }
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

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Hola, ${primerNombre}`}
        description={
          sinSolicitud
            ? "Estás a un paso de iniciar tu crédito respaldado por fideicomiso."
            : ETAPA_DESCRIPCION[etapa]
        }
        action={<Badge tone={ETAPA_TONE[sinSolicitud ? "sin_solicitud" : etapa]}>{ETAPA_LABEL[sinSolicitud ? "sin_solicitud" : etapa]}</Badge>}
      />

      {/* Lo que necesita atención hoy */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <QuickLink icon={Sparkles} label={paso.label} to={paso.to} tone="aqua" />
        <QuickLink
          icon={CalendarDays}
          label="Próxima cuota"
          value={cuota && solicitud ? formatearMonto(cuota.monto, solicitud.moneda) : "—"}
          to="/app/cronograma"
          tone="cyan"
        />
        <QuickLink icon={FolderOpen} label="Documentos de tu expediente" to="/app/documentos" tone="navy" />
        <QuickLink icon={Bell} label="Notificaciones sin leer" value={noLeidas} to="/app/notificaciones" tone="amber" />
      </div>

      {sinSolicitud && (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="relative overflow-hidden rounded-xl bg-[#1c2e4a] p-7 text-white md:p-9">
            <div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-jaika-gold/25 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-jaika-cyan/15 blur-3xl" />
            <div className="relative">
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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-jaika-gold px-6 text-sm font-semibold text-white transition-colors hover:bg-jaika-gold-dark"
                >
                  Solicitar mi crédito <ArrowRight size={16} />
                </Link>
                <Link
                  to="/app/cuenta"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Revisar mi perfil
                </Link>
              </div>
            </div>
          </section>

          <SectionCard title="Cómo funciona" description="Del registro a la entrega de llaves.">
            <ol className="space-y-3 text-sm text-black-500">
              {[
                "Elige el bien y simula tu crédito.",
                "Firma tu solicitud y acredita el 10% inicial.",
                "Recibe tu preaprobación con la minuta de compraventa.",
                "Registros públicos, notaría, desembolso y entrega de llaves.",
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jaika-gold/10 text-xs font-semibold text-jaika-gold-dark">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            {solicitud && (
              <div className="mt-5 rounded-lg border border-jaika-gold/30 bg-jaika-gold/5 p-3 text-xs text-black-500">
                <div className="font-semibold text-black-800">Tienes una simulación guardada</div>
                <p className="mt-1">
                  {solicitud.tipoBien} · {formatearMonto(solicitud.valor, solicitud.moneda)} · {solicitud.plazo} meses
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {firmada && solicitud && credito && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Solicitud firmada" description={ETAPA_DESCRIPCION[etapa]}>
            <div className="rounded-xl bg-[#1c2e4a] p-5 text-white">
              <div className="text-xs uppercase tracking-wide text-white/60">Inicial a acreditar (10%)</div>
              <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-jaika-mint">
                {formatearMonto(credito.inicial, solicitud.moneda)}
              </div>
              {referencia && (
                <div className="mt-1 text-xs text-white/55">
                  Referencia: {formatearMonto(referencia.valor, referencia.moneda)}
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/app/preaprobacion">
                <BtnPrimary className="w-full">
                  Acredita tu 10% inicial <ArrowRight size={15} />
                </BtnPrimary>
              </Link>
              <Link to="/app/solicitud">
                <BtnOutline className="w-full">Revisar solicitud</BtnOutline>
              </Link>
            </div>
          </SectionCard>
          <SectionCard title="Tu solicitud">
            <dl className="space-y-3 text-sm">
              {[
                ["Bien", solicitud.tipoBien],
                ["Valor", formatearMonto(solicitud.valor, solicitud.moneda)],
                ["Plazo", `${solicitud.plazo} meses`],
                ["Tasa referencial", `${credito.tasaAnual.toFixed(1)}% anual`],
                ["Cuota estimada", formatearMonto(credito.cuota, solicitud.moneda)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-black-400">{label}</dt>
                  <dd className="font-semibold tabular-nums text-black-800">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
        </div>
      )}

      {conCredito && solicitud && credito && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiTile label="Valor del bien" value={formatearMonto(solicitud.valor, solicitud.moneda)} sub={solicitud.tipoBien} />
            <KpiTile label="Monto financiado" value={formatearMonto(credito.financiado, solicitud.moneda)} sub="90% del valor" />
            <KpiTile label="Cuota mensual" value={formatearMonto(credito.cuota, solicitud.moneda)} sub={`${solicitud.plazo} meses`} />
            <KpiTile label="Tasa referencial" value={`${credito.tasaAnual.toFixed(1)}%`} sub="anual" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
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

            <div className="space-y-4">
              {cuota && (
                <SectionCard title="Próxima cuota">
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Clock3 size={15} className="text-jaika-gold-dark" />
                    <span className="text-xs">{fechaLarga(cuota.vencimiento)}</span>
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">
                    {formatearMonto(cuota.monto, solicitud.moneda)}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-black-400">
                    Los pagos de cuotas se realizan al fideicomiso fuera de la plataforma.
                  </p>
                </SectionCard>
              )}
              <SectionCard title="Respaldo">
                <div className="space-y-2 text-sm text-black-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-jaika-gold-dark" /> Identidad verificada
                  </div>
                  <div className="flex items-center gap-2">
                    <Landmark size={15} className="text-jaika-gold-dark" /> Administrado por fideicomiso
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
        </>
      )}

      {/* Mis créditos: varios créditos por cliente */}
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
              {misCreditos.map((c) => {
                const esActivo = c.id === creditoActivoId && !!activo;
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-black-800">
                          {c.solicitud?.tipoBien ?? "Crédito"}
                        </span>
                        {esActivo && <Badge tone="info">Viendo ahora</Badge>}
                      </div>
                      <div className="text-xs text-black-400">
                        {c.solicitud ? formatearMonto(c.solicitud.valor, c.solicitud.moneda) : "—"} ·{" "}
                        {c.solicitud?.plazo ?? "—"} meses
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={ETAPA_TONE[c.etapa]}>{ETAPA_LABEL[c.etapa]}</Badge>
                      {!esActivo && (
                        <BtnOutline className="h-8 px-3 text-xs" onClick={() => onVerCredito(c.id)}>
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
