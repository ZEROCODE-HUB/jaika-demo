import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Landmark,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  BtnOutline,
  BtnPrimary,
  Card,
  Input,
  Label,
  PageHeader,
} from "@/components/portal-shell";
import { FileUpload } from "@/components/onboarding";
import {
  ETAPA_LABEL,
  ETAPA_TONE,
  calcularCredito,
  formatearMonto,
  paisPorNombre,
  referenciaLocal,
  useJaikaDemo,
  type MetodoPreaprobacion,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/preaprobacion")({
  component: PreaprobacionPage,
});

function fechaAcreditacion(fecha: string | null) {
  if (!fecha) return null;
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(fecha));
}

function PreaprobacionPage() {
  const nav = useNavigate();
  const { perfil, solicitud, preaprobacion, etapa, acreditarPreaprobacion } = useJaikaDemo();
  const [opcion, setOpcion] = useState<"en_linea" | "por_fuera" | null>(null);
  const [medio, setMedio] = useState<"tarjeta" | "transferencia">("tarjeta");
  const [procesando, setProcesando] = useState(false);
  const [comprobante, setComprobante] = useState<{ name: string; url: string } | null>(null);

  const pais = paisPorNombre(perfil.paisPostula);
  const monedaLocal = perfil.moneda ?? pais.moneda;
  const moneda = solicitud?.moneda ?? "USD";
  const credito = solicitud
    ? calcularCredito(solicitud.tipoBien, solicitud.valor, solicitud.plazo)
    : null;
  const referencia =
    solicitud && credito ? referenciaLocal(credito.inicial, moneda, monedaLocal) : null;
  const acreditada = !!preaprobacion?.acreditada && !!solicitud?.firmada;

  const acreditar = (metodo: MetodoPreaprobacion) => {
    setProcesando(true);
    window.setTimeout(() => {
      acreditarPreaprobacion(metodo);
      setProcesando(false);
      setOpcion(null);
      toast.success("Inicial acreditada. Tu crédito está preaprobado.");
    }, 900);
  };

  if (!solicitud || !solicitud.firmada) {
    return (
      <>
        <PageHeader
          title="Preaprobación"
          description="Acredita tu inicial para obtener la preaprobación de tu crédito."
          action={<Badge tone={ETAPA_TONE[etapa]}>{ETAPA_LABEL[etapa]}</Badge>}
        />
        <Card className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-plata-100">
            <FileCheck2 size={24} className="text-black-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-black-800">Primero completa tu solicitud</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black-400">
            Para acreditar el 10% inicial necesitas elegir tu bien, simular el crédito y firmar
            electrónicamente las autorizaciones.
          </p>
          <div className="mt-6">
            <Link to="/app/solicitud">
              <BtnPrimary>
                Completar mi solicitud <ArrowRight size={15} />
              </BtnPrimary>
            </Link>
          </div>
        </Card>
      </>
    );
  }

  if (acreditada && credito) {
    return (
      <>
        <PageHeader
          title="¡Tu crédito está preaprobado!"
          description="La inicial fue acreditada y ya puedes avanzar con los siguientes pasos."
          action={<Badge tone="success">Preaprobado</Badge>}
        />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="relative overflow-hidden border-0 bg-[#1c2e4a] p-8 text-white">
            <div
              aria-hidden
              className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-jaika-gold/20 blur-3xl"
            />
            <div className="relative">
              <CheckCircle2 size={36} className="text-jaika-gold" />
              <h2 className="mt-4 font-display text-3xl font-semibold">
                {formatearMonto(solicitud.valor, moneda)}
              </h2>
              <p className="mt-1 text-sm text-white/60">Monto de tu crédito</p>
              {referencia && (
                <p className="mt-1 text-xs text-white/45">
                  Referencia: {formatearMonto(referencia.valor, referencia.moneda)}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-5 text-sm">
                <div>
                  <div className="text-white/50">Tasa referencial</div>
                  <div className="mt-1 text-xl font-semibold text-jaika-gold">
                    {credito.tasaAnual.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-white/50">Plazo</div>
                  <div className="mt-1 text-xl font-semibold text-white">
                    {solicitud.plazo} meses
                  </div>
                </div>
                <div>
                  <div className="text-white/50">Inicial acreditada</div>
                  <div className="mt-1 font-semibold text-white">
                    {formatearMonto(credito.inicial, moneda)}
                  </div>
                  {fechaAcreditacion(preaprobacion?.fecha ?? null) && (
                    <div className="mt-0.5 text-[10px] text-white/45">
                      {fechaAcreditacion(preaprobacion?.fecha ?? null)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-white/50">Cuota estimada</div>
                  <div className="mt-1 font-semibold text-white">
                    {formatearMonto(credito.cuota, moneda)}
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/app/seguimiento">
                  <BtnPrimary className="bg-jaika-gold text-[#1c2e4a] hover:bg-jaika-gold-dark hover:text-white">
                    Ver seguimiento <ArrowRight size={15} />
                  </BtnPrimary>
                </Link>
                <Link to="/app">
                  <BtnOutline className="border-white/30 bg-transparent text-white hover:bg-white/10">
                    Volver al inicio
                  </BtnOutline>
                </Link>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-jaika-gold-dark" />
              <h2 className="font-semibold text-black-800">Siguientes pasos</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-black-500">
              <p>
                Acércate a la oficina de Jaika en{" "}
                <strong className="text-black-800">Miraflores, Lima</strong> y firma tus contratos
                en notaría.
              </p>
              <div className="rounded-sm border border-black-100 bg-plata-50 p-4 text-xs">
                <div className="font-semibold text-black-800">Oficina Jaika</div>
                <p className="mt-1">Av. Larco 1234, Miraflores, Lima</p>
                <p className="mt-1">Atención de lunes a viernes, de 9:00 a 18:00.</p>
              </div>
              <p className="text-xs text-black-400">
                Después de la notaría, el fideicomiso realiza el desembolso fuera de la plataforma.
              </p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Acredita tu 10% inicial"
        description="Con la inicial acreditada, tu crédito queda preaprobado y avanzamos con los registros públicos."
        action={<Badge tone="warn">Solicitud firmada</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex items-start gap-3">
            <Landmark size={22} className="mt-0.5 shrink-0 text-jaika-gold-dark" />
            <div>
              <h2 className="text-lg font-semibold text-black-800">Inicial de tu crédito</h2>
              <p className="mt-1 text-sm text-black-400">
                Corresponde al 10% del valor del bien. El saldo restante se financia a tu plazo.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-sm bg-[#1c2e4a] p-6 text-white">
            <div className="text-xs uppercase tracking-wide text-white/60">Monto a acreditar</div>
            <div className="mt-1 font-display text-3xl font-semibold text-jaika-gold">
              {formatearMonto(credito?.inicial ?? 0, moneda)}
            </div>
            {referencia && (
              <div className="mt-1 text-xs text-white/50">
                Referencia: {formatearMonto(referencia.valor, referencia.moneda)}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/55">
              <span>Bien: {solicitud.tipoBien}</span>
              <span>Valor: {formatearMonto(solicitud.valor, moneda)}</span>
              <span>Plazo: {solicitud.plazo} meses</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setOpcion("en_linea")}
              className={`rounded-sm border p-4 text-left transition-colors ${
                opcion === "en_linea"
                  ? "border-jaika-gold bg-jaika-gold/10"
                  : "border-black-100 hover:border-black-200"
              }`}
            >
              <CreditCard size={19} className="text-jaika-gold-dark" />
              <div className="mt-3 text-sm font-semibold text-black-800">Pagar en línea</div>
              <p className="mt-1 text-xs leading-relaxed text-black-400">
                Tarjeta o transferencia, con confirmación simulada.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setOpcion("por_fuera")}
              className={`rounded-sm border p-4 text-left transition-colors ${
                opcion === "por_fuera"
                  ? "border-jaika-gold bg-jaika-gold/10"
                  : "border-black-100 hover:border-black-200"
              }`}
            >
              <Building2 size={19} className="text-jaika-gold-dark" />
              <div className="mt-3 text-sm font-semibold text-black-800">
                Ya pagué por fuera
              </div>
              <p className="mt-1 text-xs leading-relaxed text-black-400">
                Adjunta tu comprobante para que validemos el pago.
              </p>
            </button>
          </div>

          {opcion === "en_linea" && (
            <div className="mt-5 rounded-sm border border-black-100 p-4">
              <div className="flex gap-2">
                {[
                  ["tarjeta", "Tarjeta"],
                  ["transferencia", "Transferencia"],
                ].map(([valorMedio, label]) => (
                  <button
                    key={valorMedio}
                    type="button"
                    onClick={() => setMedio(valorMedio as "tarjeta" | "transferencia")}
                    className={`rounded-sm px-3 py-1.5 text-xs font-semibold ${
                      medio === valorMedio
                        ? "bg-[#1c2e4a] text-white"
                        : "bg-plata-100 text-black-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {medio === "tarjeta" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="card-number">Número de tarjeta</Label>
                    <Input id="card-number" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div>
                    <Label htmlFor="card-exp">Vencimiento</Label>
                    <Input id="card-exp" placeholder="MM/AA" />
                  </div>
                  <div>
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input id="card-cvv" placeholder="123" />
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-xs leading-relaxed text-black-500">
                  <p>
                    Realiza una transferencia simulada a la cuenta recaudadora del fideicomiso y
                    registra el número de operación.
                  </p>
                  <div>
                    <Label htmlFor="operacion">Número de operación</Label>
                    <Input id="operacion" placeholder="Ej. 00451239" />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <BtnPrimary
                  onClick={() => acreditar("en_linea")}
                  disabled={procesando}
                  className="w-full sm:w-auto"
                >
                  {procesando ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Procesando…
                    </>
                  ) : (
                    <>
                      Confirmar pago simulado <ArrowRight size={14} />
                    </>
                  )}
                </BtnPrimary>
              </div>
            </div>
          )}

          {opcion === "por_fuera" && (
            <div className="mt-5 rounded-sm border border-black-100 p-4">
              <FileUpload
                label="Comprobante de pago"
                hint="Imagen o PDF · máximo 8 MB"
                value={comprobante}
                onChange={(archivo) => setComprobante(archivo)}
              />
              <div className="mt-4">
                <BtnPrimary
                  onClick={() => acreditar("por_fuera")}
                  disabled={!comprobante || procesando}
                >
                  {procesando ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Validando…
                    </>
                  ) : (
                    <>
                      Adjuntar y acreditar <ArrowRight size={14} />
                    </>
                  )}
                </BtnPrimary>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-black-800">Qué pasa después</h2>
          <div className="mt-4 space-y-4 text-sm text-black-500">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jaika-gold/20 text-xs font-semibold text-jaika-gold-dark">
                1
              </span>
              <p>Confirmamos la acreditación de tu inicial.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jaika-gold/20 text-xs font-semibold text-jaika-gold-dark">
                2
              </span>
              <p>Tu crédito pasa a preaprobado y se inicia la revisión de registros públicos.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jaika-gold/20 text-xs font-semibold text-jaika-gold-dark">
                3
              </span>
              <p>Firmas los contratos en notaría y el fideicomiso realiza el desembolso.</p>
            </div>
          </div>
          <p className="mt-5 rounded-sm bg-plata-50 p-3 text-[11px] leading-relaxed text-black-400">
            La atención de Jaika es local en {pais.nombre}. Los montos de vivienda se expresan en
            USD y la moneda local se muestra solo como referencia.
          </p>
        </Card>
      </div>
    </>
  );
}
