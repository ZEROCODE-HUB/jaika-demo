import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock3, Wallet } from "lucide-react";
import { ModalDialog } from "@/components/modal-dialog";
import {
  Badge,
  BtnPrimary,
  Card,
  PageHeader,
} from "@/components/portal-shell";
import {
  ETAPA_LABEL,
  ETAPA_TONE,
  calcularCredito,
  calcularCronograma,
  etapaIndex,
  formatearMonto,
  proximaCuota,
  useJaikaDemo,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/cronograma")({
  component: CronogramaPage,
});

function fechaCuota(fecha: string) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha));
}

function EstadoCuota({ estado }: { estado: "pagada" | "pendiente" }) {
  return estado === "pagada" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success">
      <CheckCircle2 size={11} /> Pagada
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-plata-100 px-2.5 py-1 text-[11px] font-semibold text-black-400">
      Pendiente
    </span>
  );
}

function CronogramaPage() {
  const { solicitud, preaprobacion, etapa } = useJaikaDemo();
  const [verTodo, setVerTodo] = useState(false);
  const moneda = solicitud?.moneda ?? "USD";
  const cronograma = calcularCronograma(solicitud, etapa, preaprobacion);
  const credito = solicitud
    ? calcularCredito(solicitud.tipoBien, solicitud.valor, solicitud.plazo)
    : null;
  const cuota = proximaCuota(cronograma);
  const pagadas = cronograma.filter((c) => c.estado === "pagada").length;
  const total = cronograma.reduce((suma, c) => suma + c.monto, 0);
  const disponible = etapaIndex(etapa) >= etapaIndex("preaprobado") && cronograma.length > 0;

  if (!disponible || !credito || !solicitud) {
    const firmada = etapa === "solicitud_firmada";
    return (
      <>
        <PageHeader
          title="Cronograma"
          description="Consulta tus cuotas, vencimientos y el estado de cada pago."
          action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
        />
        <Card className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plata-100">
            <CalendarDays size={24} className="text-black-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-black-800">
            {firmada ? "Tu cronograma está casi listo" : "Aún no tienes un cronograma activo"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black-400">
            {firmada
              ? "Acredita el 10% inicial para que tu crédito quede preaprobado y puedas ver tus cuotas."
              : "Completa tu solicitud y la preaprobación para generar el cronograma de pagos."}
          </p>
          <div className="mt-6">
            <Link to={firmada ? "/app/preaprobacion" : "/app/solicitud"}>
              <BtnPrimary>
                {firmada ? "Acreditar inicial" : "Iniciar solicitud"} <ArrowRight size={15} />
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
        title="Cronograma de pagos"
        description={`${solicitud.plazo} cuotas · ${solicitud.tipoBien}`}
        action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="grid gap-px overflow-hidden rounded-sm border border-black-100 bg-black-100 sm:grid-cols-3">
            <div className="bg-plata-50 p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-black-400">
                <Wallet size={13} /> Cuota mensual
              </div>
              <div className="mt-2 font-display text-2xl font-semibold text-black-800">
                {formatearMonto(credito.cuota, moneda)}
              </div>
            </div>
            <div className="bg-plata-50 p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-black-400">
                <Clock3 size={13} /> Próximo vencimiento
              </div>
              <div className="mt-2 font-display text-lg font-semibold text-black-800">
                {cuota ? fechaCuota(cuota.vencimiento) : "Crédito pagado"}
              </div>
            </div>
            <div className="bg-plata-50 p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-black-400">
                <CheckCircle2 size={13} /> Cuotas pagadas
              </div>
              <div className="mt-2 font-display text-2xl font-semibold text-black-800">
                {pagadas}
                <span className="text-sm font-medium text-black-400"> / {cronograma.length}</span>
              </div>
            </div>
          </div>

          {/* Movil: resumen de las proximas cuotas + cronograma completo en un popup */}
          <Card className="p-0 md:hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-semibold text-black-800">Próximas cuotas</h2>
              <span className="text-xs text-black-400">
                {pagadas} de {cronograma.length} pagadas
              </span>
            </div>
            <ul className="divide-y divide-line">
              {cronograma
                .filter((c) => c.estado === "pendiente")
                .slice(0, 3)
                .map((item) => (
                  <li key={item.numero} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="text-sm font-semibold text-black-800">
                        Cuota {item.numero}
                      </div>
                      <div className="text-xs text-black-400">{fechaCuota(item.vencimiento)}</div>
                    </div>
                    <div className="text-right font-mono text-sm text-black-800">
                      {formatearMonto(item.monto, moneda)}
                    </div>
                  </li>
                ))}
            </ul>
            <div className="p-4">
              <button
                type="button"
                onClick={() => setVerTodo(true)}
                className="flex h-11 w-full items-center justify-center gap-1 rounded-lg border border-line text-sm font-semibold text-black-700 hover:bg-canvas"
              >
                Ver cronograma completo ({cronograma.length} cuotas) <ChevronRight size={15} />
              </button>
            </div>
          </Card>

          <ModalDialog
            open={verTodo}
            onClose={() => setVerTodo(false)}
            title="Cronograma completo"
            description={`${cronograma.length} cuotas · Total estimado ${formatearMonto(total, moneda)}`}
          >
            <ul className="divide-y divide-line">
              {cronograma.map((item) => (
                <li key={item.numero} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-black-800">
                      Cuota {String(item.numero).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-black-400">{fechaCuota(item.vencimiento)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-sm text-black-800">
                      {formatearMonto(item.monto, moneda)}
                    </span>
                    <EstadoCuota estado={item.estado} />
                  </div>
                </li>
              ))}
            </ul>
          </ModalDialog>

          {/* Escritorio: tabla completa */}
          <Card className="hidden overflow-hidden p-0 md:block">
            <div className="flex flex-col gap-1 border-b border-black-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold text-black-800">Detalle de cuotas</h2>
              <span className="text-xs text-black-400">
                Total estimado: {formatearMonto(total, moneda)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-black-100 bg-plata-50 text-left text-[11px] uppercase tracking-wide text-black-400">
                    <th className="px-5 py-3 font-medium">Cuota</th>
                    <th className="px-5 py-3 font-medium">Vencimiento</th>
                    <th className="px-5 py-3 text-right font-medium">Monto</th>
                    <th className="px-5 py-3 text-right font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cronograma.map((item) => (
                    <tr
                      key={item.numero}
                      className="border-b border-black-100 last:border-0 hover:bg-plata-50/60"
                    >
                      <td className="px-5 py-3 text-black-500">
                        <span className="font-mono text-xs text-black-400">
                          {String(item.numero).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-black-700">
                        {fechaCuota(item.vencimiento)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-black-800">
                        {formatearMonto(item.monto, moneda)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {item.estado === "pagada" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success">
                            <CheckCircle2 size={11} /> Pagada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-plata-100 px-2.5 py-1 text-[11px] font-semibold text-black-400">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-black-800">Resumen del crédito</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Monto financiado", formatearMonto(credito.financiado, moneda)],
                ["Tasa anual", `${credito.tasaAnual.toFixed(1)}%`],
                ["Plazo", `${solicitud.plazo} meses`],
                ["Inicial", formatearMonto(credito.inicial, moneda)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-black-400">{label}</dt>
                  <dd className="text-right font-semibold text-black-800">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <div className="rounded-sm border border-black-100 bg-plata-50 p-4 text-[11px] leading-relaxed text-black-400">
            <p className="font-semibold text-black-600">Sobre el cronograma</p>
            <p className="mt-1">
              Las cuotas usan cuota fija. En la demo, el crédito en pago muestra las primeras 3
              cuotas como pagadas.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
