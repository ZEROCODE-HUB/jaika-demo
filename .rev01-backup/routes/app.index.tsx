import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Badge, Card, BtnPrimary, BtnOutline, PageHeader } from "@/components/portal-shell";
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
  useJaikaDemo,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const perfil = useJaikaDemo((s) => s.perfil);
  const solicitud = useJaikaDemo((s) => s.solicitud);
  const preaprobacion = useJaikaDemo((s) => s.preaprobacion);
  const etapa = useJaikaDemo((s) => s.etapa);
  const notificaciones = useJaikaDemo((s) => s.notificaciones);

  const primerNombre = perfil.nombres || "bienvenido";
  const pais = paisPorNombre(perfil.paisPostula);
  const monedaLocal = perfil.moneda ?? pais.moneda;
  const credito = solicitud
    ? calcularCredito(solicitud.tipoBien, solicitud.valor, solicitud.plazo)
    : null;
  const cronograma = calcularCronograma(solicitud, etapa, preaprobacion);
  const siguienteCuota = proximaCuota(cronograma);
  const referencia =
    solicitud && credito
      ? referenciaLocal(solicitud.valor, solicitud.moneda, monedaLocal)
      : null;
  const fechaCuota = siguienteCuota
    ? new Intl.DateTimeFormat("es", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(siguienteCuota.vencimiento))
    : null;

  const sinSolicitud = etapa === "sin_solicitud" || !solicitud;
  const firmada = etapa === "solicitud_firmada";
  const conCredito = !sinSolicitud && !firmada && credito;

  return (
    <>
      <PageHeader
        title={`Hola, ${primerNombre}`}
        description={
          sinSolicitud
            ? "Estás a un paso de iniciar tu crédito respaldado por fideicomiso."
            : ETAPA_DESCRIPCION[etapa]
        }
        action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
      />

      {sinSolicitud && (
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="relative overflow-hidden border-0 bg-[#1c2e4a] p-8 text-white md:p-10">
            <div
              aria-hidden
              className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-jaika-gold/15 blur-3xl"
            />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-jaika-gold">
                <Landmark size={13} /> Crédito con fideicomiso
              </div>
              <h2 className="max-w-lg font-display text-3xl font-semibold leading-tight md:text-4xl">
                Tu vivienda empieza con el 10% de inicial.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
                Completa tu solicitud, acredita tu inicial y sigue cada etapa hasta la entrega de
                llaves. Jaika te acompaña en todo el proceso.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/app/solicitud"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-jaika-gold px-6 text-sm font-semibold text-[#1c2e4a] transition-colors hover:bg-jaika-gold-dark hover:text-white"
                >
                  Solicitar mi crédito <ArrowRight size={16} />
                </Link>
                <Link
                  to="/app/cuenta"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-white/30 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Revisar mi perfil
                </Link>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-jaika-gold-dark" />
              <h2 className="font-semibold text-black-800">Cómo funciona</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm text-black-500">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plata-100 text-xs font-semibold">
                  1
                </span>
                <p>Elige el bien y simula tu crédito con el 10% de inicial.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plata-100 text-xs font-semibold">
                  2
                </span>
                <p>Acredita tu inicial y recibe tu preaprobación.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plata-100 text-xs font-semibold">
                  3
                </span>
                <p>Sigue registros públicos, notaría y desembolso del fideicomiso.</p>
              </div>
            </div>
            {solicitud && (
              <div className="mt-6 rounded-sm border border-jaika-gold/30 bg-jaika-gold/5 p-4 text-xs text-black-500">
                <div className="font-semibold text-black-800">Tienes una simulación guardada</div>
                <p className="mt-1">
                  {solicitud.tipoBien} · {formatearMonto(solicitud.valor, solicitud.moneda)} ·{" "}
                  {solicitud.plazo} meses.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {firmada && solicitud && credito && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-jaika-gold/40">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-success" />
              <div>
                <h2 className="text-xl font-semibold text-black-800">Solicitud firmada</h2>
                <p className="mt-1 text-sm text-black-500">{ETAPA_DESCRIPCION[etapa]}</p>
              </div>
            </div>
            <div className="mt-6 rounded-sm bg-[#1c2e4a] p-5 text-white">
              <div className="text-xs uppercase tracking-wide text-white/60">
                Inicial a acreditar (10%)
              </div>
              <div className="mt-1 font-display text-3xl font-semibold text-jaika-gold">
                {formatearMonto(credito.inicial, solicitud.moneda)}
              </div>
              {referencia && (
                <div className="mt-1 text-xs text-white/55">
                  Referencia: {formatearMonto(referencia.valor, referencia.moneda)}
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/app/preaprobacion">
                <BtnPrimary>
                  Acredita tu 10% inicial <ArrowRight size={15} />
                </BtnPrimary>
              </Link>
              <Link to="/app/solicitud">
                <BtnOutline>Revisar solicitud</BtnOutline>
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-black-800">Tu solicitud</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Bien", solicitud.tipoBien],
                ["Valor", formatearMonto(solicitud.valor, solicitud.moneda)],
                ["Plazo", `${solicitud.plazo} meses`],
                ["Tasa referencial", `${credito.tasaAnual.toFixed(1)}% anual`],
                ["Cuota estimada", formatearMonto(credito.cuota, solicitud.moneda)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-black-400">{label}</dt>
                  <dd className="font-semibold text-black-800">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      )}

      {conCredito && solicitud && credito && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Monto del crédito", formatearMonto(solicitud.valor, solicitud.moneda)],
              ["Inicial (10%)", formatearMonto(credito.inicial, solicitud.moneda)],
              ["Tasa referencial", `${credito.tasaAnual.toFixed(1)}% anual`],
              ["Plazo", `${solicitud.plazo} meses`],
            ].map(([label, value]) => (
              <Card key={label} className="p-5">
                <div className="text-[11px] uppercase tracking-wide text-black-400">{label}</div>
                <div className="mt-1 font-display text-xl font-semibold text-black-800">
                  {value}
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-black-800">Avance de tu crédito</h2>
                  <p className="mt-1 text-xs text-black-400">{ETAPA_DESCRIPCION[etapa]}</p>
                </div>
                <Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>
              </div>
              <div className="mt-6">
                <CreditTimeline
                  etapa={etapa}
                  notificaciones={notificaciones}
                  includePago
                  compact
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/app/seguimiento">
                  <BtnOutline>
                    Ver seguimiento <ArrowRight size={14} />
                  </BtnOutline>
                </Link>
                <Link to="/app/cronograma">
                  <BtnOutline>
                    <CalendarDays size={14} /> Ver cronograma
                  </BtnOutline>
                </Link>
                <Link to="/app/documentos">
                  <BtnOutline>
                    <FileText size={14} /> Documentos
                  </BtnOutline>
                </Link>
              </div>
            </Card>

            <div className="space-y-4">
              {etapa === "en_pago" && siguienteCuota && (
                <Card className="border-jaika-gold/40">
                  <div className="flex items-center gap-2 text-sm font-semibold text-black-800">
                    <Clock3 size={16} className="text-jaika-gold-dark" /> Próxima cuota
                  </div>
                  <div className="mt-3 font-display text-2xl font-semibold text-black-800">
                    {formatearMonto(siguienteCuota.monto, solicitud.moneda)}
                  </div>
                  <p className="mt-1 text-xs text-black-400">{fechaCuota}</p>
                  <p className="mt-3 text-[11px] leading-relaxed text-black-400">
                    Los pagos de cuotas se realizan al fideicomiso fuera de la plataforma.
                  </p>
                </Card>
              )}

              <Card>
                <div className="flex items-center gap-2">
                  <Landmark size={16} className="text-jaika-gold-dark" />
                  <h3 className="font-semibold text-black-800">Tu crédito</h3>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-black-400">Bien</dt>
                    <dd className="font-semibold text-black-800">{solicitud.tipoBien}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-black-400">Financiado</dt>
                    <dd className="font-semibold text-black-800">
                      {formatearMonto(credito.financiado, solicitud.moneda)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-black-400">Cuota</dt>
                    <dd className="font-semibold text-black-800">
                      {formatearMonto(credito.cuota, solicitud.moneda)}
                    </dd>
                  </div>
                  {referencia && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-black-400">Referencia local</dt>
                      <dd className="font-semibold text-black-800">
                        {formatearMonto(referencia.valor, referencia.moneda)}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
