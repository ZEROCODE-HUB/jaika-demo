import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthShell,
  Field,
  FormTitle,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  Stepper,
  WizardNav,
} from "@/components/onboarding";
import { OCUPACIONES, ORIGEN_FONDOS, useOnboarding } from "@/lib/onboarding-store";
import {
  MONEDAS,
  nombreCompleto,
  paisPorNombre,
  useJaikaDemo,
} from "@/lib/jaika-demo-store";

export const Route = createFileRoute("/onboarding/datos-personales")({
  head: () => ({
    meta: [
      { title: "Perfil del solicitante — Jaika" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DatosPersonales,
});

const STEPS = ["Perfil", "Información financiera", "Confirmación"];

function DatosPersonales() {
  const nav = useNavigate();
  const { perfil, setPerfil } = useJaikaDemo();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    genero: perfil.genero ?? "",
    ocupacion: perfil.ocupacion ?? "",
    origenFondos: perfil.origenFondos ?? "",
    esPEP: perfil.esPEP ?? false,
  });
  const [err, setErr] = useState<Record<string, string>>({});

  const pais = paisPorNombre(perfil.paisPostula);
  const moneda = MONEDAS[pais.moneda];
  const documento = perfil.tipoDocumento
    ? `${perfil.tipoDocumento} ${perfil.numeroDocumento ?? ""}`.trim()
    : "—";

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!f.ocupacion) e.ocupacion = "Selecciona tu ocupación";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!f.origenFondos) e.origenFondos = "Selecciona el origen de fondos";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    if (step === 2) {
      setPerfil(f);
      useOnboarding.getState().setDatosPersonales(f);
      nav({ to: "/onboarding/kyc" });
      return;
    }
    setStep(step + 1);
  };

  return (
    <AuthShell
      leftEyebrow="Paso 3 · Perfil"
      leftTitle="Completa tu perfil de solicitante."
      leftBody="Estos datos nos permiten conocer tu perfil y acompañarte durante el proceso de crédito."
      step={`Paso ${step + 1} de 3`}
    >
      <FormTitle
        eyebrow="Solicitud · Persona natural"
        title="Perfil del solicitante"
        subtitle="Revisa tu documento y completa la información financiera."
      />
      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <div className="space-y-4">
          <Field
            label="Documento de identidad"
            value={documento}
            readOnly
            className="bg-black-50 text-black-500"
            hint="Ingresado en el registro. Si debes corregirlo, vuelve a iniciar el alta."
          />
          <SelectField
            label="Género (opcional)"
            value={f.genero}
            onChange={(v) => setF({ ...f, genero: v })}
            options={["Femenino", "Masculino", "No binario", "Prefiero no responder"]}
          />
          <SelectField
            label="Ocupación"
            value={f.ocupacion}
            onChange={(v) => setF({ ...f, ocupacion: v })}
            options={OCUPACIONES}
            error={err.ocupacion}
          />
          <WizardNav onNext={next} nextLabel="Siguiente" />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <SelectField
            label="Origen de fondos"
            value={f.origenFondos}
            onChange={(v) => setF({ ...f, origenFondos: v })}
            options={ORIGEN_FONDOS}
            error={err.origenFondos}
          />
          <div className="p-5 text-xs leading-relaxed text-black-500 bg-black-50 border border-black-100 rounded-sm">
            Se consideran personas políticamente expuestas a funcionarios públicos y a sus
            familiares hasta el segundo grado de consanguinidad, conforme a la normativa aplicable.
          </div>
          <label className="flex items-center justify-between gap-4 py-2">
            <span className="text-sm font-semibold text-black-800">
              ¿Es persona políticamente expuesta?
            </span>
            <button
              type="button"
              onClick={() => setF({ ...f, esPEP: !f.esPEP })}
              role="switch"
              aria-checked={f.esPEP}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-200 ${
                f.esPEP ? "bg-jaika-gold" : "bg-black-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  f.esPEP ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
          <WizardNav onBack={() => setStep(0)} onNext={next} nextLabel="Siguiente" />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="rounded-sm border border-black-100 overflow-hidden">
            <div className="bg-[#1c2e4a] px-4 py-3">
              <div className="font-sans text-[0.65rem] tracking-[0.14em] uppercase text-jaika-gold">
                Resumen del solicitante
              </div>
            </div>
            <dl className="divide-y divide-black-100">
              {[
                ["Nombre", nombreCompleto(perfil) || "—"],
                ["País de postulación", pais.nombre],
                ["Moneda", `${moneda.simbolo} (${pais.moneda})`],
                ["Documento", documento],
                ["Ocupación", f.ocupacion || "—"],
                ["Origen de fondos", f.origenFondos || "—"],
                ["Persona políticamente expuesta", f.esPEP ? "Sí" : "No"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-1 sm:grid-cols-[minmax(0,160px)_1fr] gap-1 sm:gap-4 px-4 py-3 text-sm"
                >
                  <dt className="text-black-400">{label}</dt>
                  <dd className="font-semibold text-black-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <SecondaryButton onClick={() => setStep(1)}>Atrás</SecondaryButton>
            <div className="flex-1">
              <PrimaryButton onClick={next}>Continuar a verificación</PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          to="/login"
          search={{ register: undefined }}
          className="text-xs text-black-400 hover:text-jaika-gold-dark underline underline-offset-2"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthShell>
  );
}
