import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Bus,
  Car,
  CheckCircle2,
  HardHat,
  Home,
  Landmark,
  Store,
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
import { Stepper } from "@/components/onboarding";
import {
  ETAPA_LABEL,
  ETAPA_TONE,
  MONEDAS,
  PLAZOS,
  TASAS_REFERENCIALES,
  TIPOS_BIEN,
  calcularCredito,
  clampValorBien,
  formatearMonto,
  monedaParaBien,
  paisPorNombre,
  referenciaLocal,
  useJaikaDemo,
  valorInicialBien,
  valorMaximoBien,
  valorMinimoBien,
  type DatosBien,
  type TipoBien,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/app/solicitud")({
  component: SolicitudPage,
});

const PASOS = ["Tipo de bien", "Simulador", "Datos del bien", "Firma"];

const ICONOS_BIEN: Record<TipoBien, typeof Home> = {
  Vivienda: Home,
  Vehículo: Car,
  Transporte: Bus,
  Construcción: HardHat,
  Negocio: Store,
};

function SolicitudPage() {
  const nav = useNavigate();
  const {
    perfil,
    solicitud,
    etapa,
    setSolicitud,
    firmarSolicitud,
  } = useJaikaDemo();

  const pais = paisPorNombre(perfil.paisPostula);
  const monedaLocal = perfil.moneda ?? pais.moneda;
  const [step, setStep] = useState(0);
  const [tipoBien, setTipoBien] = useState<TipoBien>(solicitud?.tipoBien ?? "Vivienda");
  const [valor, setValor] = useState(
    clampValorBien(solicitud?.tipoBien ?? "Vivienda", solicitud?.valor ?? 180000),
  );
  const [plazo, setPlazo] = useState(solicitud?.plazo ?? 60);
  const [datosBien, setDatosBien] = useState<DatosBien>(
    solicitud?.datosBien ?? { descripcion: "", ubicacion: "", vendedor: "" },
  );
  const [acepta, setAcepta] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const moneda = monedaParaBien(tipoBien, monedaLocal);
  const esVivienda = tipoBien === "Vivienda";
  const minimo = valorMinimoBien(tipoBien);
  const maximo = valorMaximoBien(tipoBien);
  const resultado = calcularCredito(tipoBien, valor, plazo);
  const referencia = referenciaLocal(valor, moneda, monedaLocal);
  const yaFirmada = !!solicitud?.firmada && etapa !== "sin_solicitud";

  const cambiarTipo = (tipo: TipoBien) => {
    setTipoBien(tipo);
    setValor(clampValorBien(tipo, valorInicialBien(tipo)));
    setErrores({});
  };

  const validarValor = () => {
    if (!Number.isFinite(valor) || valor <= 0) return "Ingresa un valor válido";
    if (valor < minimo || valor > maximo) {
      return esVivienda
        ? "Para vivienda, el valor debe estar entre US$ 100.000 y US$ 250.000"
        : `El valor mínimo es ${formatearMonto(minimo, moneda)}`;
    }
    return null;
  };

  const guardarBorrador = () => {
    const monto = clampValorBien(tipoBien, valor);
    setSolicitud({
      tipoBien,
      valor: monto,
      plazo,
      datosBien,
      firmada: solicitud?.firmada ?? false,
      moneda,
      origen: solicitud?.origen ?? "portal",
      estado: "borrador",
    });
    return monto;
  };

  const siguiente = () => {
    const siguientesErrores: Record<string, string> = {};

    if (step === 1) {
      const errorValor = validarValor();
      if (errorValor) siguientesErrores.valor = errorValor;
    }

    if (step === 2) {
      if (!datosBien.descripcion.trim()) {
        siguientesErrores.descripcion = "Describe el bien";
      }
      if (!datosBien.ubicacion.trim()) {
        siguientesErrores.ubicacion = "Ingresa la ubicación";
      }
      if (!datosBien.vendedor.trim()) {
        siguientesErrores.vendedor = "Ingresa el nombre del vendedor";
      }
      const errorValor = validarValor();
      if (errorValor) siguientesErrores.valor = errorValor;
    }

    setErrores(siguientesErrores);
    if (Object.keys(siguientesErrores).length > 0) return;

    if (step === 0) {
      setStep(1);
      return;
    }

    if (step === 1) {
      guardarBorrador();
      setStep(2);
      return;
    }

    if (step === 2) {
      guardarBorrador();
      setStep(3);
    }
  };

  const atras = () => {
    setErrores({});
    setStep((actual) => Math.max(0, actual - 1));
  };

  const firmar = () => {
    if (!acepta) {
      toast.error("Debes aceptar las autorizaciones para firmar.");
      return;
    }
    if (!datosBien.descripcion.trim() || !datosBien.ubicacion.trim() || !datosBien.vendedor.trim()) {
      toast.error("Completa los datos del bien antes de firmar.");
      setStep(2);
      return;
    }
    guardarBorrador();
    firmarSolicitud();
    toast.success("Solicitud firmada electrónicamente.");
    nav({ to: "/app/preaprobacion" });
  };

  return (
    <>
      <PageHeader
        title="Solicitud de crédito"
        description="Completa tu solicitud en cuatro pasos. Puedes volver atrás sin perder tus datos."
        action={
          <Badge tone={ETAPA_TONE[etapa]}>
            {yaFirmada ? "Solicitud firmada" : ETAPA_LABEL[etapa]}
          </Badge>
        }
      />

      {yaFirmada && (
        <div className="mb-6 flex flex-col gap-3 rounded-sm border border-success-border bg-success-bg px-5 py-4 text-sm text-black-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
            <span>Tu solicitud ya está firmada. Puedes revisar los datos o continuar con la preaprobación.</span>
          </div>
          <Link to="/app/preaprobacion">
            <BtnOutline className="h-9 px-3 text-xs">
              Ir a preaprobación <ArrowRight size={13} />
            </BtnOutline>
          </Link>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <Stepper steps={PASOS} current={step} />

          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-black-800">¿Qué bien vas a financiar?</h2>
              <p className="mt-1 text-sm text-black-400">
                Elige el producto para calcular tu cuota referencial.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {TIPOS_BIEN.map((tipo) => {
                  const Icon = ICONOS_BIEN[tipo];
                  const activo = tipoBien === tipo;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => cambiarTipo(tipo)}
                      className={`flex items-start gap-3 rounded-sm border p-4 text-left transition-colors ${
                        activo
                          ? "border-jaika-gold bg-jaika-gold/10"
                          : "border-black-100 bg-white hover:border-black-200"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${
                          activo ? "bg-jaika-gold text-[#1c2e4a]" : "bg-plata-100 text-black-500"
                        }`}
                      >
                        <Icon size={19} />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-black-800">{tipo}</span>
                        <span className="mt-1 block text-xs text-black-400">
                          Tasa referencial {TASAS_REFERENCIALES[tipo].toFixed(1)}% anual
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-black-800">Simula tu crédito</h2>
              <p className="mt-1 text-sm text-black-400">
                La inicial siempre es el 10% del valor del bien.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="valor-bien">
                    Valor del bien ({MONEDAS[moneda].simbolo})
                  </Label>
                  <Input
                    id="valor-bien"
                    type="number"
                    min={minimo}
                    max={Number.isFinite(maximo) ? maximo : undefined}
                    step={500}
                    value={valor}
                    onChange={(event) => setValor(Number(event.target.value) || 0)}
                    onBlur={() => setValor(clampValorBien(tipoBien, valor))}
                    className="font-mono"
                  />
                  <p className="mt-1 text-[11px] text-black-400">
                    {esVivienda
                      ? "Vivienda: entre US$ 100.000 y US$ 250.000."
                      : "Valor mínimo: " + formatearMonto(minimo, moneda)}
                  </p>
                  {errores.valor && <p className="mt-1 text-xs text-red-500">{errores.valor}</p>}
                </div>
                <div>
                  <Label htmlFor="plazo-credito">Plazo</Label>
                  <select
                    id="plazo-credito"
                    value={plazo}
                    onChange={(event) => setPlazo(Number(event.target.value))}
                    className="h-10 w-full rounded-sm border border-black-100 bg-white px-3 text-sm text-black-700 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                  >
                    {PLAZOS.map((meses) => (
                      <option key={meses} value={meses}>
                        {meses} meses
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {referencia && (
                <p className="mt-3 rounded-sm border border-black-100 bg-plata-50 px-4 py-3 text-xs text-black-500">
                  Referencia en moneda local:{" "}
                  <strong className="text-black-800">
                    {formatearMonto(referencia.valor, referencia.moneda)}
                  </strong>
                  . El crédito de vivienda se expresa en USD.
                </p>
              )}

              <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-black-100 bg-black-100 sm:grid-cols-2 xl:grid-cols-4">
                <div className="bg-plata-50 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-black-400">Inicial (10%)</div>
                  <div className="mt-1 font-display text-lg font-semibold text-black-800">
                    {formatearMonto(resultado.inicial, moneda)}
                  </div>
                </div>
                <div className="bg-plata-50 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-black-400">Financiado</div>
                  <div className="mt-1 font-display text-lg font-semibold text-black-800">
                    {formatearMonto(resultado.financiado, moneda)}
                  </div>
                </div>
                <div className="bg-plata-50 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-black-400">Tasa anual</div>
                  <div className="mt-1 font-display text-lg font-semibold text-black-800">
                    {resultado.tasaAnual.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-[#1c2e4a] p-4 text-white">
                  <div className="text-[11px] uppercase tracking-wide text-white/60">Cuota estimada</div>
                  <div className="mt-1 font-display text-lg font-semibold text-jaika-gold">
                    {formatearMonto(resultado.cuota, moneda)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-black-800">Datos del bien</h2>
              <p className="mt-1 text-sm text-black-400">
                Esta información se usará en la minuta de compraventa.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="descripcion-bien">Descripción</Label>
                  <textarea
                    id="descripcion-bien"
                    value={datosBien.descripcion}
                    onChange={(event) =>
                      setDatosBien({ ...datosBien, descripcion: event.target.value })
                    }
                    rows={3}
                    placeholder="Ej. Departamento de 2 dormitorios con cocina equipada"
                    className="w-full rounded-sm border border-black-100 bg-white px-3 py-2 text-sm text-black-700 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 placeholder:text-black-300"
                  />
                  {errores.descripcion && (
                    <p className="mt-1 text-xs text-red-500">{errores.descripcion}</p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ubicacion-bien">Ubicación</Label>
                    <Input
                      id="ubicacion-bien"
                      value={datosBien.ubicacion}
                      onChange={(event) =>
                        setDatosBien({ ...datosBien, ubicacion: event.target.value })
                      }
                      placeholder="Dirección del bien"
                    />
                    {errores.ubicacion && (
                      <p className="mt-1 text-xs text-red-500">{errores.ubicacion}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="vendedor-bien">Vendedor</Label>
                    <Input
                      id="vendedor-bien"
                      value={datosBien.vendedor}
                      onChange={(event) =>
                        setDatosBien({ ...datosBien, vendedor: event.target.value })
                      }
                      placeholder="Nombre o razón social"
                    />
                    {errores.vendedor && (
                      <p className="mt-1 text-xs text-red-500">{errores.vendedor}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="valor-final">
                    Valor del bien ({MONEDAS[moneda].simbolo})
                  </Label>
                  <Input
                    id="valor-final"
                    type="number"
                    min={minimo}
                    max={Number.isFinite(maximo) ? maximo : undefined}
                    step={500}
                    value={valor}
                    onChange={(event) => setValor(Number(event.target.value) || 0)}
                    onBlur={() => setValor(clampValorBien(tipoBien, valor))}
                    className="font-mono"
                  />
                  {errores.valor && <p className="mt-1 text-xs text-red-500">{errores.valor}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-black-800">Firma electrónica</h2>
              <p className="mt-1 text-sm text-black-400">
                Revisa el resumen y autoriza el inicio de la evaluación de tu crédito.
              </p>

              <div className="mt-5 overflow-hidden rounded-sm border border-black-100">
                <dl className="divide-y divide-black-100">
                  {[
                    ["Solicitante", `${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim() || "—"],
                    ["Documento", `${perfil.tipoDocumento ?? ""} ${perfil.numeroDocumento ?? ""}`.trim() || "—"],
                    ["Tipo de bien", tipoBien],
                    ["Valor del bien", formatearMonto(valor, moneda)],
                    ["Plazo", `${plazo} meses`],
                    ["Inicial (10%)", formatearMonto(resultado.inicial, moneda)],
                    ["Monto financiado", formatearMonto(resultado.financiado, moneda)],
                    ["Cuota estimada", formatearMonto(resultado.cuota, moneda)],
                    ["Descripción", datosBien.descripcion || "—"],
                    ["Ubicación", datosBien.ubicacion || "—"],
                    ["Vendedor", datosBien.vendedor || "—"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[170px_1fr] sm:gap-4"
                    >
                      <dt className="text-black-400">{label}</dt>
                      <dd className="font-semibold text-black-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {referencia && (
                <p className="mt-3 text-xs text-black-400">
                  Referencia en moneda local: {formatearMonto(referencia.valor, referencia.moneda)}.
                </p>
              )}

              <label className="mt-5 flex items-start gap-3 rounded-sm border border-black-100 bg-plata-50 p-4 text-xs leading-relaxed text-black-500">
                <input
                  type="checkbox"
                  checked={acepta}
                  onChange={(event) => setAcepta(event.target.checked)}
                  className="mt-0.5 accent-[#B08D57]"
                />
                <span>
                  Autorizo a Jaika a evaluar mi solicitud de crédito, consultar registros públicos y
                  compartir la información necesaria con el fideicomiso para completar el proceso.
                </span>
              </label>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <BtnOutline onClick={atras}>Atrás</BtnOutline>
                <BtnPrimary onClick={firmar} disabled={!acepta} className="sm:flex-1">
                  Firmar electrónicamente <ArrowRight size={15} />
                </BtnPrimary>
              </div>
            </div>
          )}

          {(step === 1 || step === 2) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BtnOutline onClick={atras}>Atrás</BtnOutline>
              <BtnPrimary onClick={siguiente} className="sm:flex-1">
                Siguiente <ArrowRight size={15} />
              </BtnPrimary>
            </div>
          )}

          {step === 0 && (
            <div className="mt-8 flex justify-end">
              <BtnPrimary onClick={siguiente}>
                Continuar <ArrowRight size={15} />
              </BtnPrimary>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2">
              <Landmark size={17} className="text-jaika-gold-dark" />
              <h2 className="font-semibold text-black-800">Resumen</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Bien", tipoBien],
                ["Moneda", `${MONEDAS[moneda].simbolo} (${moneda})`],
                ["Valor", formatearMonto(valor, moneda)],
                ["Plazo", `${plazo} meses`],
                ["Inicial 10%", formatearMonto(resultado.inicial, moneda)],
                ["Cuota estimada", formatearMonto(resultado.cuota, moneda)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <dt className="text-black-400">{label}</dt>
                  <dd className="text-right font-semibold text-black-800">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <p className="px-1 text-[11px] leading-relaxed text-black-400">
            La cuota es referencial. La tasa final y las condiciones se confirman en la
            preaprobación y en los contratos de notaría.
          </p>
        </div>
      </div>
    </>
  );
}
