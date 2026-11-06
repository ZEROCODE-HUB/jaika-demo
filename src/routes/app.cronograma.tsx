import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Landmark,
  Percent,
  Wallet,
} from "lucide-react";
import { ModalDialog } from "@/components/modal-dialog";
import { Badge, BtnOutline, BtnPrimary, Card, PageHeader } from "@/components/portal-shell";
import { KpiTile } from "@/components/ui-kit";
import {
  ETAPA_LABEL,
  ETAPA_TONE,
  calcularCredito,
  calcularCronograma,
  etapaIndex,
  formatearMonto,
  proximaCuota,
  useJaikaDemo,
  type CuotaCronograma,
  type MonedaCodigo,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/cronograma")({
  component: CronogramaPage,
});

const PAGE_SIZE = 10;
const PAGE_SIZE_MOVIL = 8;

type FiltroEstado = "todas" | "pendiente" | "pagada";

function fechaCuota(fecha: string) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(fecha));
}

function fechaLarga(fecha: string) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(fecha));
}

function diasRestantes(fecha: string) {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
  const objetivo = new Date(fecha);
  const inicioObjetivo = new Date(
    objetivo.getFullYear(),
    objetivo.getMonth(),
    objetivo.getDate(),
  ).getTime();
  return Math.round((inicioObjetivo - inicioHoy) / 864e5);
}

function etiquetaVencimiento(fecha: string) {
  const dias = diasRestantes(fecha);
  if (dias < 0) return `Vencida hace ${Math.abs(dias)} d`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `Vence en ${dias} días`;
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

function Paginacion({
  pagina,
  totalPaginas,
  onChange,
  desde,
  hasta,
  total,
}: {
  pagina: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
  desde: number;
  hasta: number;
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="border-t border-line px-5 py-3 text-xs text-ink-muted">
        No hay cuotas con este filtro.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-line px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-ink-muted">
        Mostrando <span className="font-semibold text-ink">{desde}</span>–
        <span className="font-semibold text-ink">{hasta}</span> de{" "}
        <span className="font-semibold text-ink">{total}</span> cuotas
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-black-500 transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} />
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
            <button
              key={numero}
              type="button"
              onClick={() => onChange(numero)}
              aria-label={`Ir a la página ${numero}`}
              aria-current={numero === pagina ? "page" : undefined}
              className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-semibold transition-colors ${
                numero === pagina
                  ? "bg-jaika-gold-dark text-white"
                  : "border border-line text-black-500 hover:bg-canvas"
              }`}
            >
              {numero}
            </button>
          ))}
        </div>
        <span className="px-2 text-xs text-ink-muted sm:hidden">
          Página {pagina} de {totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Página siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-black-500 transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function FilaMovil({ item, moneda }: { item: CuotaCronograma; moneda: MonedaCodigo }) {
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-black-800">
              Cuota {String(item.numero).padStart(2, "0")}
            </span>
            <EstadoCuota estado={item.estado} />
          </div>
          <div className="mt-0.5 text-xs text-black-400">{fechaCuota(item.vencimiento)}</div>
        </div>
        <div className="text-right font-mono text-sm font-semibold text-black-800">
          {formatearMonto(item.monto, moneda)}
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-black-400">
        <span>Capital {formatearMonto(item.capital, moneda)}</span>
        <span>Interés {formatearMonto(item.interes, moneda)}</span>
      </div>
    </li>
  );
}

function CronogramaPage() {
  const { solicitud, preaprobacion, etapa, creditoActivoId } = useJaikaDemo();
  const [verTodo, setVerTodo] = useState(false);
  const [filtro, setFiltro] = useState<FiltroEstado>("todas");
  const [pagina, setPagina] = useState(1);
  const [paginaMovil, setPaginaMovil] = useState(1);
  const moneda = solicitud?.moneda ?? "USD";
  const cronograma = calcularCronograma(solicitud, etapa, preaprobacion);
  const credito = solicitud
    ? calcularCredito(solicitud.tipoBien, solicitud.valor, solicitud.plazo)
    : null;
  const cuota = proximaCuota(cronograma);
  const pagadas = cronograma.filter((c) => c.estado === "pagada").length;
  const pendientes = cronograma.length - pagadas;
  const totalPagar = cronograma.reduce((suma, c) => suma + c.monto, 0);
  const totalIntereses = cronograma.reduce((suma, c) => suma + c.interes, 0);
  const saldoPendiente = cronograma
    .filter((c) => c.estado === "pendiente")
    .reduce((suma, c) => suma + c.monto, 0);
  const disponible = etapaIndex(etapa) >= etapaIndex("preaprobado") && cronograma.length > 0;

  const filtradas = cronograma.filter((c) => {
    if (filtro === "todas") return true;
    return c.estado === filtro;
  });
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);
  const desde = filtradas.length === 0 ? 0 : (paginaActual - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(paginaActual * PAGE_SIZE, filtradas.length);

  const totalPaginasMovil = Math.max(1, Math.ceil(cronograma.length / PAGE_SIZE_MOVIL));
  const paginaMovilActual = Math.min(paginaMovil, totalPaginasMovil);
  const visiblesMovil = cronograma.slice(
    (paginaMovilActual - 1) * PAGE_SIZE_MOVIL,
    paginaMovilActual * PAGE_SIZE_MOVIL,
  );

  const progreso = cronograma.length === 0 ? 0 : Math.round((pagadas / cronograma.length) * 100);

  const exportar = () => {
    if (!solicitud) return;
    const filas = [
      [
        "Cuota",
        "Vencimiento",
        "Saldo inicial",
        "Capital",
        "Interes",
        "Cuota",
        "Saldo final",
        "Estado",
      ],
      ...cronograma.map((c) => [
        String(c.numero),
        fechaCuota(c.vencimiento),
        String(Math.round(c.saldoInicial)),
        String(Math.round(c.capital)),
        String(Math.round(c.interes)),
        String(Math.round(c.monto)),
        String(Math.round(c.saldoFinal)),
        c.estado,
      ]),
    ];
    const csv = filas
      .map((fila) => fila.map((valor) => `"${valor.replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `cronograma-${solicitud.tipoBien.toLowerCase()}-${solicitud.plazo}-meses.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

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

  const filtros: { id: FiltroEstado; label: string; total: number }[] = [
    { id: "todas", label: "Todas", total: cronograma.length },
    { id: "pendiente", label: "Pendientes", total: pendientes },
    { id: "pagada", label: "Pagadas", total: pagadas },
  ];

  return (
    <>
      <PageHeader
        title="Cronograma de pagos"
        description={`${solicitud.plazo} cuotas · ${solicitud.tipoBien} · Operación ${creditoActivoId.toUpperCase()}`}
        action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Cuota mensual"
          value={formatearMonto(credito.cuota, moneda)}
          sub={`${solicitud.plazo} pagos · cuota fija`}
        />
        <KpiTile
          label="Saldo pendiente"
          value={formatearMonto(saldoPendiente, moneda)}
          sub={`${pendientes} cuotas por pagar`}
        />
        <KpiTile
          label="Total intereses"
          value={formatearMonto(totalIntereses, moneda)}
          sub={`TEA ${credito.tasaAnual.toFixed(1)}%`}
        />
        <KpiTile
          label="Próximo vencimiento"
          value={cuota ? fechaCuota(cuota.vencimiento) : "Crédito pagado"}
          sub={
            cuota
              ? `Cuota ${cuota.numero} · ${etiquetaVencimiento(cuota.vencimiento)}`
              : "Sin cuotas pendientes"
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.45fr]">
        <div className="space-y-6">
          {/* Movil: resumen de las proximas cuotas + cronograma completo en un popup */}
          <Card className="p-0 md:hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-semibold text-black-800">Próximas cuotas</h2>
              <span className="text-xs text-black-400">
                {pagadas} de {cronograma.length} pagadas
              </span>
            </div>
            <ul className="divide-y divide-line px-5">
              {cronograma
                .filter((c) => c.estado === "pendiente")
                .slice(0, 3)
                .map((item) => (
                  <FilaMovil key={item.numero} item={item} moneda={moneda} />
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
            description={`${cronograma.length} cuotas · Total a pagar ${formatearMonto(totalPagar, moneda)}`}
          >
            <ul className="divide-y divide-line">
              {visiblesMovil.map((item) => (
                <FilaMovil key={item.numero} item={item} moneda={moneda} />
              ))}
            </ul>
            <div className="mt-2 rounded-lg border border-line">
              <Paginacion
                pagina={paginaMovilActual}
                totalPaginas={totalPaginasMovil}
                onChange={setPaginaMovil}
                desde={(paginaMovilActual - 1) * PAGE_SIZE_MOVIL + 1}
                hasta={Math.min(paginaMovilActual * PAGE_SIZE_MOVIL, cronograma.length)}
                total={cronograma.length}
              />
            </div>
          </ModalDialog>

          {/* Escritorio: tabla de amortizacion paginada */}
          <Card className="hidden overflow-hidden p-0 md:block">
            <div className="flex flex-col gap-3 border-b border-black-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-black-800">Detalle de amortización</h2>
                <p className="mt-0.5 text-xs text-black-400">
                  Capital, interés y saldo insoluto por cada cuota.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-plata-100 px-2.5 py-1 text-[11px] font-semibold text-black-500">
                  <Landmark size={11} /> {moneda}
                </span>
                <BtnOutline className="h-8 px-3 text-xs" onClick={exportar}>
                  <Download size={13} /> Exportar
                </BtnOutline>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 border-b border-black-100 bg-plata-50/60 px-5 py-2">
              {filtros.map((opcion) => (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => {
                    setFiltro(opcion.id);
                    setPagina(1);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    filtro === opcion.id
                      ? "bg-jaika-gold-dark text-white"
                      : "text-black-500 hover:bg-plata-100"
                  }`}
                >
                  {opcion.label}
                  <span
                    className={`rounded-full px-1 text-[10px] ${
                      filtro === opcion.id ? "bg-white/20" : "bg-black-100 text-black-500"
                    }`}
                  >
                    {opcion.total}
                  </span>
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-black-100 bg-plata-50 text-left text-[11px] uppercase tracking-wide text-black-400">
                    <th className="px-5 py-3 font-medium">Cuota</th>
                    <th className="px-5 py-3 font-medium">Vencimiento</th>
                    <th className="px-5 py-3 text-right font-medium">Saldo inicial</th>
                    <th className="px-5 py-3 text-right font-medium">Capital</th>
                    <th className="px-5 py-3 text-right font-medium">Interés</th>
                    <th className="px-5 py-3 text-right font-medium">Cuota</th>
                    <th className="px-5 py-3 text-right font-medium">Saldo final</th>
                    <th className="px-5 py-3 text-right font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((item) => {
                    const esProximo = cuota?.numero === item.numero;
                    return (
                      <tr
                        key={item.numero}
                        className={`border-b border-black-100 last:border-0 ${
                          esProximo ? "bg-jaika-gold/5" : "hover:bg-plata-50/60"
                        }`}
                      >
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs text-black-400">
                            {String(item.numero).padStart(2, "0")}
                          </span>
                          {esProximo && (
                            <span className="ml-2 rounded-full bg-jaika-gold/15 px-1.5 py-0.5 text-[10px] font-semibold text-jaika-gold-dark">
                              Próxima
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-black-700">{fechaCuota(item.vencimiento)}</div>
                          <div className="text-[11px] text-black-400">
                            {item.estado === "pagada"
                              ? "Pagada"
                              : etiquetaVencimiento(item.vencimiento)}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-black-500">
                          {formatearMonto(item.saldoInicial, moneda)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-black-700">
                          {formatearMonto(item.capital, moneda)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-black-700">
                          {formatearMonto(item.interes, moneda)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-semibold text-black-800">
                          {formatearMonto(item.monto, moneda)}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-black-500">
                          {formatearMonto(item.saldoFinal, moneda)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <EstadoCuota estado={item.estado} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Paginacion
              pagina={paginaActual}
              totalPaginas={totalPaginas}
              onChange={setPagina}
              desde={desde}
              hasta={hasta}
              total={filtradas.length}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-jaika-gold/10 text-jaika-gold-dark">
                <Wallet size={16} />
              </span>
              <div>
                <h2 className="font-semibold text-black-800">Próximo pago</h2>
                <p className="text-[11px] text-black-400">
                  {cuota ? `Cuota ${cuota.numero} de ${solicitud.plazo}` : "Crédito pagado"}
                </p>
              </div>
            </div>
            {cuota ? (
              <>
                <div className="mt-4 font-display text-2xl font-semibold tabular-nums text-black-800">
                  {formatearMonto(cuota.monto, moneda)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-black-400">
                  <Clock3 size={13} />
                  {fechaLarga(cuota.vencimiento)} · {etiquetaVencimiento(cuota.vencimiento)}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-black-500">No tienes cuotas pendientes.</p>
            )}
            <div className="mt-5">
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
          </Card>

          <Card>
            <h2 className="font-semibold text-black-800">Resumen de la operación</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Producto", `Crédito ${solicitud.tipoBien}`],
                ["N.º de operación", creditoActivoId.toUpperCase()],
                ["Moneda", moneda],
                ["Valor del bien", formatearMonto(solicitud.valor, moneda)],
                ["Inicial (10%)", formatearMonto(credito.inicial, moneda)],
                ["Monto financiado", formatearMonto(credito.financiado, moneda)],
                ["TEA", `${credito.tasaAnual.toFixed(1)}%`],
                ["TEM", `${(credito.tasaAnual / 12).toFixed(2)}%`],
                ["Plazo", `${solicitud.plazo} meses`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-black-400">{label}</dt>
                  <dd className="text-right font-semibold text-black-800">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Percent size={15} className="text-jaika-gold-dark" />
              <h2 className="font-semibold text-black-800">Totales del crédito</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Total capital", formatearMonto(credito.financiado, moneda)],
                ["Total intereses", formatearMonto(totalIntereses, moneda)],
                ["Total a pagar", formatearMonto(totalPagar, moneda)],
                ["Saldo pendiente", formatearMonto(saldoPendiente, moneda)],
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
              Cronograma con cuota fija y amortización francesa. El pago de cada cuota se realiza al
              fideicomiso por los canales informados al momento de la firma; la plataforma no
              procesa cobros.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
