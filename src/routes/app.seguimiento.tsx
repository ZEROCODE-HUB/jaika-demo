import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  Landmark,
  MapPin,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  BtnOutline,
  BtnPrimary,
  Card,
  PageHeader,
} from "@/components/portal-shell";
import { CreditTimeline } from "@/components/credit-timeline";
import {
  ETAPA_DESCRIPCION,
  ETAPA_LABEL,
  ETAPA_TONE,
  calcularCredito,
  calcularCronograma,
  etapaIndex,
  fechaEtapa,
  formatearMonto,
  paisPorNombre,
  proximaCuota,
  siguienteEtapa,
  useJaikaDemo,
  type EtapaCredito,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/seguimiento")({
  component: SeguimientoPage,
});

const CTA_ETAPA: Partial<Record<EtapaCredito, string>> = {
  preaprobado: "Iniciar registros públicos",
  registros_publicos: "Continuar a notaría",
  notaria: "Confirmar firma en notaría",
  desembolso: "Confirmar desembolso",
  entrega_llaves: "Confirmar entrega de llaves",
};

function fechaLarga(fecha: string | null) {
  if (!fecha) return null;
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(fecha));
}

function SeguimientoPage() {
  const {
    perfil,
    solicitud,
    preaprobacion,
    etapa,
    notificaciones,
    avanzarEtapa,
  } = useJaikaDemo();
  const pais = paisPorNombre(perfil.paisPostula);
  const moneda = solicitud?.moneda ?? "USD";
  const credito = solicitud
    ? calcularCredito(solicitud.tipoBien, solicitud.valor, solicitud.plazo)
    : null;
  const cronograma = calcularCronograma(solicitud, etapa, preaprobacion);
  const cuota = proximaCuota(cronograma);
  const esPrevia = etapaIndex(etapa) < etapaIndex("preaprobado");
  const cta = CTA_ETAPA[etapa];
  const next = siguienteEtapa(etapa);
  const fechaActual = fechaLarga(fechaEtapa(notificaciones, etapa));

  if (!solicitud) {
    return (
      <>
        <PageHeader
          title="Seguimiento"
          description="Aquí verás el avance de tu crédito, etapa por etapa."
          action={<Badge tone="neutral">Sin solicitud</Badge>}
        />
        <Card className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plata-100">
            <FileSearch size={24} className="text-black-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-black-800">
            Todavía no tienes un crédito en curso
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black-400">
            Completa tu solicitud y acredita la inicial para comenzar el seguimiento de tu crédito.
          </p>
          <div className="mt-6">
            <Link to="/app/solicitud">
              <BtnPrimary>
                Iniciar solicitud <ArrowRight size={15} />
              </BtnPrimary>
            </Link>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Seguimiento de tu crédito"
        description="Revisa en qué etapa está tu proceso y qué viene después."
        action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-jaika-gold/15 text-jaika-gold-dark">
                  <Sparkles size={21} />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-jaika-gold-dark">
                    Etapa actual
                  </div>
                  <h2 className="mt-0.5 text-xl font-semibold text-black-800">
                    {ETAPA_LABEL[etapa]}
                  </h2>
                  {fechaActual && (
                    <p className="mt-0.5 text-xs text-black-400">Actualizada el {fechaActual}</p>
                  )}
                </div>
              </div>
              <Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-black-500">
              {ETAPA_DESCRIPCION[etapa]}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {etapa === "solicitud_firmada" && (
                <Link to="/app/preaprobacion">
                  <BtnPrimary>
                    Acreditar inicial <ArrowRight size={15} />
                  </BtnPrimary>
                </Link>
              )}
              {cta && next && (
                <BtnPrimary
                  onClick={() => {
                    avanzarEtapa();
                    toast.success(`Avanzaste a ${ETAPA_LABEL[next]}.`);
                  }}
                >
                  {cta} <ArrowRight size={15} />
                </BtnPrimary>
              )}
              {etapa === "en_pago" && (
                <Link to="/app/cronograma">
                  <BtnPrimary>
                    Ver cronograma <ArrowRight size={15} />
                  </BtnPrimary>
                </Link>
              )}
              <Link to="/app/documentos">
                <BtnOutline>Ver documentos</BtnOutline>
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-black-800">Recorrido del crédito</h2>
            <p className="mt-1 text-sm text-black-400">
              Las etapas completadas se marcan en verde; las pendientes aparecen en gris.
            </p>
            <div className="mt-6">
              <CreditTimeline
                etapa={etapa}
                notificaciones={notificaciones}
                includePago
              />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {credito && (
            <Card>
              <h2 className="font-semibold text-black-800">Tu crédito</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Bien", solicitud.tipoBien],
                  ["Valor", formatearMonto(solicitud.valor, moneda)],
                  ["Inicial", formatearMonto(credito.inicial, moneda)],
                  ["Financiado", formatearMonto(credito.financiado, moneda)],
                  ["Cuota", formatearMonto(credito.cuota, moneda)],
                  ["Plazo", `${solicitud.plazo} meses`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <dt className="text-black-400">{label}</dt>
                    <dd className="text-right font-semibold text-black-800">{value}</dd>
                  </div>
                ))}
              </dl>
              {preaprobacion?.fecha && (
                <p className="mt-4 border-t border-black-100 pt-3 text-[11px] text-black-400">
                  Preaprobado el {fechaLarga(preaprobacion.fecha)} ·{" "}
                  {preaprobacion.metodo === "en_linea" ? "Pago en línea" : "Pago por fuera"}
                </p>
              )}
            </Card>
          )}

          {(etapa === "notaria" || etapa === "desembolso" || etapa === "entrega_llaves") && (
            <Card>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-jaika-gold-dark" />
                <h2 className="font-semibold text-black-800">Oficina Jaika</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-black-500">
                Av. Larco 1234, Miraflores, {pais.nombre}
              </p>
              <p className="mt-1 text-xs text-black-400">
                Atención de lunes a viernes, de 9:00 a 18:00.
              </p>
            </Card>
          )}

          {cuota && (
            <Card>
              <div className="flex items-center gap-2">
                <ReceiptText size={16} className="text-jaika-gold-dark" />
                <h2 className="font-semibold text-black-800">Próxima cuota</h2>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-black-800">
                {formatearMonto(cuota.monto, moneda)}
              </p>
              <p className="mt-1 text-xs text-black-400">
                Vence el {fechaLarga(cuota.vencimiento)}
              </p>
              <Link to="/app/cronograma" className="mt-3 inline-block text-xs font-semibold text-jaika-gold-dark hover:underline">
                Ver todas las cuotas
              </Link>
            </Card>
          )}

          {!esPrevia && etapa !== "en_pago" && (
            <div className="flex items-start gap-3 rounded-sm border border-black-100 bg-plata-50 p-4 text-xs leading-relaxed text-black-400">
              <Clock3 size={15} className="mt-0.5 shrink-0 text-jaika-gold-dark" />
              <p>
                Esta demo avanza las etapas de forma simulada. En producción, el equipo de Jaika
                actualiza el estado después de cada hito.
              </p>
            </div>
          )}

          {etapa === "en_pago" && (
            <div className="flex items-start gap-3 rounded-sm border border-success-border bg-success-bg p-4 text-xs leading-relaxed text-black-500">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
              <p>
                Tu crédito está activo. Puedes revisar el cronograma y descargar tus documentos
                desde el portal.
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-sm border border-black-100 bg-plata-50 p-4 text-xs leading-relaxed text-black-400">
            <Landmark size={15} className="mt-0.5 shrink-0 text-jaika-gold-dark" />
            <p>Desembolso y entrega de llaves se gestionan con el fideicomiso y la notaría.</p>
          </div>
        </div>
      </div>
    </>
  );
}
